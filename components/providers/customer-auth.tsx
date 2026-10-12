"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { clientAuth, isClientFirebaseConfigured } from "@/lib/firebase/client";
import { ChildProps } from "@/types";

// Customer (visitor) login with Google. Customers see the regular site;
// being signed in only lets them write a review. The admin panel uses its
// own server session and is not affected.

interface CustomerAuth {
  user: User | null;
  ready: boolean;
  enabled: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const CustomerAuthContext = createContext<CustomerAuth | undefined>(undefined);

export function CustomerAuthProvider({ children }: ChildProps) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!isClientFirebaseConfigured);

  useEffect(() => {
    if (!isClientFirebaseConfigured) return;
    return onAuthStateChanged(clientAuth(), (u) => {
      setUser(u);
      setReady(true);
    });
  }, []);

  const value: CustomerAuth = {
    user,
    ready,
    enabled: isClientFirebaseConfigured,
    signIn: async () => {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(clientAuth(), provider);
    },
    signOut: () => signOut(clientAuth()),
    getIdToken: async () => (clientAuth().currentUser ? clientAuth().currentUser!.getIdToken() : null),
  };

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return ctx;
}
