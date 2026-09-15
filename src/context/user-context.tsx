"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchUserProfile, UserProfile, FALLBACK_USER } from "@/src/lib/api/user";
import { logoutApi, clearSession } from "@/src/lib/api/auth";

interface UserContextType {
  user: UserProfile;
  loading: boolean;
  isLoggingOut: boolean;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: FALLBACK_USER,
  loading: true,
  isLoggingOut: false,
  logout: async () => {},
  refetchUser: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile>(FALLBACK_USER);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

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

  const logout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logoutApi();
      setUser(FALLBACK_USER);
      toast.success("Successfully logged out");
      router.push("/login");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Logout failed, please try again.";
      toast.error(message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        isLoggingOut,
        logout,
        refetchUser: loadUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

