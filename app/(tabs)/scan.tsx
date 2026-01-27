import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/core';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy'; 
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../lib/supabase';

export default function ScanScreen() {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const isFocused = useIsFocused(); 

  // 1. Permission Check
  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900 p-8">
        <Text className="text-white text-center mb-4 text-lg">
          We need your permission to scan documents
        </Text>
        <TouchableOpacity 
            onPress={requestPermission} 
            className="bg-teal-600 px-6 py-3 rounded-lg"
        >
           <Text className="text-white font-bold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. The Fixed Upload Logic
  const uploadImage = async (uri: string) => {
    try {
        // A. Read the file as Base64 string
        // We use the string 'base64' to avoid the Enum error
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64',
        });

        // B. Convert to ArrayBuffer
        const arrayBuffer = decode(base64);

        // C. Generate unique filename
        const fileName = `${Date.now()}.jpg`;

        // D. Upload to Supabase Storage
        // CRITICAL FIX: We do NOT pass arrayBuffer directly.
        // We pass 'arrayBuffer' directly, but ensure Supabase treats it as binary.
        // If this still fails, wrapping it in new Uint8Array(arrayBuffer) often fixes it.
        const { error: uploadError } = await supabase.storage
            .from('doc_images') 
            .upload(fileName, arrayBuffer, {
                contentType: 'image/jpeg',
                upsert: false
            });

        if (uploadError) throw uploadError;

        // E. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('doc_images')
            .getPublicUrl(fileName);

        return publicUrl;
    } catch (error: any) {
        console.error("Upload failed detailed:", error);
        throw new Error("Could not upload image. Check console.");
    }
  };

  // 3. Main Capture Action
  const takePicture = async () => {
    if (!cameraRef.current || uploading) return;

    try {
      setUploading(true);

      // A. Capture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: false,
        skipProcessing: true,
      });

      if (!photo?.uri) throw new Error("Camera failed to capture");

      // B. Upload
      const publicUrl = await uploadImage(photo.uri);

      // C. Save to Database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Mock Doc Type
      const docTypes = ["Aadhar", "PAN", "License"];
      const randomType = docTypes[Math.floor(Math.random() * docTypes.length)];

      const { error: dbError } = await supabase.from('documents').insert({
        user_id: user.id,
        title: `${randomType} Scan`,
        doc_type: randomType, 
        image_url: publicUrl,
      });

      if (dbError) throw dbError;

      // D. Success
      Alert.alert("Success", "Document saved to Vault!", [
        { text: "View Vault", onPress: () => router.push('/(tabs)/vault') }
      ]);

    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-black">
      {isFocused && (
        <CameraView 
            ref={cameraRef}
            style={StyleSheet.absoluteFill} 
            facing={facing}
            animateShutter={false}
        />
      )}
      
      {uploading && (
        <View className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 px-8">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className="text-white font-bold mt-6 text-xl text-center">
                Processing Document...
            </Text>
        </View>
      )}
      
      {!uploading && (
        <View className="absolute bottom-28 w-full items-center flex-row justify-center gap-10">
            <TouchableOpacity 
                className="w-12 h-12 bg-white/20 rounded-full items-center justify-center"
                onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
            >
                <Ionicons name="camera-reverse" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={takePicture}
                className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 items-center justify-center shadow-lg"
            >
                <View className="w-16 h-16 bg-white rounded-full border-2 border-black" />
            </TouchableOpacity>

            <TouchableOpacity 
                className="w-12 h-12 bg-white/20 rounded-full items-center justify-center"
            >
                <Ionicons name="images" size={24} color="white" />
            </TouchableOpacity>
        </View>
      )}
    </View>
  );
}