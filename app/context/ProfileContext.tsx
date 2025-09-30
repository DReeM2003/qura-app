import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

export type Profile = {
  name: string;
  email: string;
  age: number;
  height_ft: number;
  height_in: number;
  weight: number;
};

const DEFAULT_PROFILE: Profile = {
  name: 'Derek',
  email: 'derek@example.com',
  age: 22,
  height_ft: 6,
  height_in: 0,
  weight: 185,
};

const STORAGE_KEY = 'user_profile_v1';

interface ProfileContextValue {
  profile: Profile;
  loading: boolean;
  updateProfile: (partial: Partial<Profile>) => Promise<void>;
  resetProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  // Load saved profile
  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          setProfile(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.warn('Failed to load profile', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: Profile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Failed to save profile', e);
    }
  }, []);

  const updateProfile = useCallback(async (partial: Partial<Profile>) => {
    setProfile(curr => {
      const next = { ...curr, ...partial };
      persist(next);
      return next;
    });
  }, [persist]);

  const resetProfile = useCallback(async () => {
    setProfile(DEFAULT_PROFILE);
    try { await AsyncStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, loading, updateProfile, resetProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}
