import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Pressable, RefreshControl, ActivityIndicator, Image, Modal, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

// Document Type Definition
type Document = {
  id: string;
  title: string;
  doc_type: string;
  created_at: string;
  image_url: string | null;
};

// Filter Categories
const FILTERS = ["All", "Aadhar", "PAN", "License", "Academic", "Other"];

export default function VaultScreen() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  
  // ✅ NEW: State for the Image Modal
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // 1. Fetch Documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (activeFilter !== "All") {
        query = query.ilike('doc_type', `%${activeFilter}%`);
      }

      const { data, error } = await query;
      if (error) console.error("Error fetching vault:", error.message);
      else setDocuments(data || []);
      
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [activeFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDocuments();
  }, [activeFilter]);

  // Search Logic
  const filteredDocs = documents.filter(doc => 
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helpers
  const getDocColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('aadhar')) return 'bg-orange-50 border-orange-200';
    if (t.includes('pan')) return 'bg-blue-50 border-blue-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getDocIconColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('aadhar')) return '#ea580c';
    if (t.includes('pan')) return '#2563eb';
    return '#4b5563';
  };

  // 2. Render Individual Card
  const renderItem = ({ item }: { item: Document }) => (
    <Pressable 
      className={`flex-1 m-1.5 rounded-2xl border ${getDocColor(item.doc_type)} overflow-hidden active:opacity-70 bg-white shadow-sm`}
      style={{ minHeight: 180 }}
      // ✅ ON PRESS: Open the Modal
      onPress={() => setSelectedDoc(item)}
    >
      <View className="h-28 w-full bg-gray-200 justify-center items-center overflow-hidden">
        {item.image_url ? (
            <Image 
                source={{ uri: item.image_url }} 
                className="w-full h-full"
                resizeMode="cover"
            />
        ) : (
            <Ionicons name="image-outline" size={40} color="#9ca3af" />
        )}
        <View className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded-md">
            <Text className="text-[10px] text-white font-bold uppercase tracking-wider">
                {item.doc_type}
            </Text>
        </View>
      </View>

      <View className="p-3">
        <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name="document-text" size={14} color={getDocIconColor(item.doc_type)} />
            <Text className="font-bold text-gray-800 text-sm leading-5 flex-1" numberOfLines={1}>
                {item.title || "Untitled Doc"}
            </Text>
        </View>
        <Text className="text-xs text-gray-400">
           {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-white">
      {/* 3. The Modal (Pop-up View) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={selectedDoc !== null}
        onRequestClose={() => setSelectedDoc(null)}
      >
        <View className="flex-1 bg-black/95 justify-center items-center">
            {/* Close Button */}
            <TouchableOpacity 
                onPress={() => setSelectedDoc(null)}
                className="absolute top-12 right-6 z-50 p-2 bg-white/20 rounded-full"
            >
                <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>

            {/* Info Banner */}
            <View className="absolute top-12 left-6 z-50">
                <Text className="text-white font-bold text-lg">{selectedDoc?.title}</Text>
                <Text className="text-gray-400 text-sm">{selectedDoc?.doc_type}</Text>
            </View>

            {/* The Big Image */}
            {selectedDoc?.image_url && (
                <Image
                    source={{ uri: selectedDoc.image_url }}
                    className="w-full h-full"
                    resizeMode="contain" // Ensures the whole doc is visible
                />
            )}
        </View>
      </Modal>

      {/* Header & Search */}
      <View className="px-5 pt-4 pb-2 bg-white">
        <Text className="text-2xl font-extrabold text-gray-900 mb-4">My Vault 🔒</Text>
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 border border-gray-200 mb-4">
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput 
                placeholder="Search documents..." 
                className="flex-1 ml-2 text-base text-gray-900"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={18} color="#9ca3af" />
                </Pressable>
            )}
        </View>
        <FlatList 
            horizontal 
            showsHorizontalScrollIndicator={false}
            data={FILTERS}
            keyExtractor={item => item}
            className="mb-2"
            renderItem={({ item }) => (
                <Pressable 
                    onPress={() => setActiveFilter(item)}
                    className={`mr-2 px-4 py-1.5 rounded-full border ${
                        activeFilter === item ? 'bg-teal-700 border-teal-700' : 'bg-white border-gray-300'
                    }`}
                >
                    <Text className={`font-medium ${activeFilter === item ? 'text-white' : 'text-gray-600'}`}>{item}</Text>
                </Pressable>
            )}
        />
      </View>

      {/* Main Grid */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0f766e" />
        </View>
      ) : (
        <FlatList
            data={filteredDocs}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
                <View className="items-center justify-center pt-20">
                    <Text className="text-gray-400 font-medium">No documents found</Text>
                </View>
            }
        />
      )}

      {/* FAB */}
      <Pressable 
        onPress={() => router.push('/(tabs)/scan')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-teal-700 rounded-full items-center justify-center shadow-lg active:bg-teal-800"
      >
        <Ionicons name="add" size={32} color="white" />
      </Pressable>
    </View>
  );
}