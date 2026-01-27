import { View, Text, ScrollView, RefreshControl, Pressable, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase'; // Ensure this path is correct

// Define the shape of our document data
type Document = {
  id: string;
  title: string;
  doc_type: string; // 'aadhar', 'pan', 'other'
  created_at: string;
  image_url: string | null;
};

export default function HomeScreen() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);

  // 1. Fetch User & Documents
  const fetchData = async () => {
    try {
      // Get User
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Get Documents (Mock query - assumes you have a 'documents' table)
        // In reality, you'd filter by user_id: .eq('user_id', user.id)
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
            console.log("Error fetching docs (expected if table empty):", error.message);
        } else {
            setDocuments(data || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  // Helper to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Helper for icon based on doc type
  const getDocIcon = (type: string) => {
    switch(type.toLowerCase()) {
        case 'aadhar': return 'card';
        case 'pan': return 'briefcase';
        default: return 'document-text';
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* 1. Welcome Header */}
      <View className="px-5 pt-6 pb-4">
        <Text className="text-gray-500 text-sm font-medium">Welcome back,</Text>
        <Text className="text-2xl font-bold text-gray-900">
            {user?.email ? user.email.split('@')[0] : 'Guest'} 👋
        </Text>
      </View>

      {/* 2. Quick Action Banner */}
      <View className="px-5 mb-6">
        <View className="bg-teal-700 rounded-2xl p-5 flex-row items-center justify-between shadow-sm">
            <View>
                <Text className="text-white font-bold text-lg">Scan New ID</Text>
                <Text className="text-teal-100 text-xs mt-1">Aadhar, PAN, Driving License</Text>
                <Pressable 
                    onPress={() => router.push('/(tabs)/scan')}
                    className="bg-white px-4 py-2 rounded-lg mt-3 self-start"
                >
                    <Text className="text-teal-800 font-bold text-xs">Start Camera</Text>
                </Pressable>
            </View>
            <Ionicons name="scan-circle-outline" size={60} color="rgba(255,255,255,0.2)" />
        </View>
      </View>

      {/* 3. Recent Documents Section */}
      <View className="px-5 mb-6">
        <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-gray-900">Recent Documents</Text>
            <Pressable onPress={() => router.push('/(tabs)/vault')}>
                <Text className="text-teal-700 text-sm font-medium">View All</Text>
            </Pressable>
        </View>

        {loading ? (
            <ActivityIndicator size="small" color="#0f766e" />
        ) : documents.length === 0 ? (
            // Empty State
            <View className="bg-white p-6 rounded-xl items-center justify-center border border-dashed border-gray-300">
                <Ionicons name="document-attach-outline" size={40} color="#9ca3af" />
                <Text className="text-gray-400 mt-2 text-center">No documents found.{'\n'}Scan one to get started!</Text>
            </View>
        ) : (
            // List of Docs
            <View className="gap-3">
                {documents.map((doc) => (
                    <View key={doc.id} className="bg-white p-3 rounded-xl border border-gray-100 flex-row items-center shadow-sm">
                        <View className="w-12 h-12 bg-gray-50 rounded-lg items-center justify-center mr-3">
                             <Ionicons name={getDocIcon(doc.doc_type) as any} size={24} color="#4b5563" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-gray-800 text-base">{doc.title || 'Untitled Scan'}</Text>
                            <Text className="text-gray-400 text-xs uppercase">{doc.doc_type} • {formatDate(doc.created_at)}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                    </View>
                ))}
            </View>
        )}
      </View>

      {/* 4. App Features Carousel (Informational) */}
      <View className="px-5 mb-10">
        <Text className="text-lg font-bold text-gray-900 mb-3">App Features</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4 pr-5">
            
            {/* Feature 1: Smart Scan */}
            <View className="bg-indigo-50 p-4 rounded-xl w-40 border border-indigo-100">
                <View className="bg-indigo-100 w-8 h-8 rounded-full items-center justify-center mb-2">
                    <Ionicons name="aperture" size={18} color="#4f46e5" />
                </View>
                <Text className="font-bold text-indigo-900">Smart Scan</Text>
                <Text className="text-indigo-700 text-xs mt-1">Auto-detects Aadhar & PAN borders instantly.</Text>
            </View>

            {/* Feature 2: Secure Vault */}
            <View className="bg-orange-50 p-4 rounded-xl w-40 border border-orange-100">
                <View className="bg-orange-100 w-8 h-8 rounded-full items-center justify-center mb-2">
                    <Ionicons name="lock-closed" size={18} color="#ea580c" />
                </View>
                <Text className="font-bold text-orange-900">Secure Vault</Text>
                <Text className="text-orange-700 text-xs mt-1">Encrypted storage. Only you can access.</Text>
            </View>

             {/* Feature 3: Cloud Sync */}
             <View className="bg-sky-50 p-4 rounded-xl w-40 border border-sky-100">
                <View className="bg-sky-100 w-8 h-8 rounded-full items-center justify-center mb-2">
                    <Ionicons name="cloud-upload" size={18} color="#0284c7" />
                </View>
                <Text className="font-bold text-sky-900">Cloud Sync</Text>
                <Text className="text-sky-700 text-xs mt-1">Never lose docs even if you lose your phone.</Text>
            </View>

        </ScrollView>
      </View>

    </ScrollView>
  );
}