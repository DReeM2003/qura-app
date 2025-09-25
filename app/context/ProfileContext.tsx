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

interface ProfileContextValue {
  profile: Profile;
  loading: boolean;
  updateProfile: (partial: Partial<Profile>) => Promise<void> | void;
  resetProfile: () => void;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  // Simulate async initial load (could be from API later)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 50);
    return () => clearTimeout(t);
  }, []);

  const updateProfile = useCallback(async (partial: Partial<Profile>) => {
    setProfile(curr => ({ ...curr, ...partial }));
  }, []);

  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
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
