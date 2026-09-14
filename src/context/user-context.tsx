"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchUserProfile, UserProfile, FALLBACK_USER } from "@/src/lib/api/user";

interface UserContextType {
  user: UserProfile;
  loading: boolean;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: FALLBACK_USER,
  loading: true,
  refetchUser: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(FALLBACK_USER);
  const [loading, setLoading] = useState<boolean>(true);

  const loadUser = async () => {
    try {
      const data = await fetchUserProfile();
      setUser(data);
    } catch {
      setUser(FALLBACK_USER);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refetchUser: loadUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
