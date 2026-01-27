import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase'; // Make sure path is correct
import { Session } from '@supabase/supabase-js';
import "../global.css"; // Ensure NativeWind is imported

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // 1. Check if user is already logged in (on app open)
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setInitialized(true);
    };
    checkUser();

    // 2. Listen for login/logout events in real-time
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!initialized) return;

    // Check where the user is trying to go
    const inAuthGroup = segments[0] === '(auth)';

    if (session && inAuthGroup) {
      // ✅ User is Logged In, but on Login Screen -> Redirect to Tabs
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      // ❌ User is Logged Out, but trying to access App -> Redirect to Login
      router.replace('/(auth)/login');
    }
  }, [session, initialized, segments]);

  // Show a loading spinner while we check Supabase
  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <Slot />;
}