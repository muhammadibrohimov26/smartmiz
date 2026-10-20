"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithCustomToken, signInWithPopup, signOut, User } from "firebase/auth";
import { clientAuth, isClientFirebaseConfigured } from "@/lib/firebase/client";
import LoginDialog from "@/components/shared/login-dialog";
import { ChildProps } from "@/types";

// Customer (visitor) login: Google or Telegram. Customers
// see the regular site; being signed in only lets them write a review or rate
// a course. The admin panel uses its own server session and is not affected.

interface CustomerAuth {
  user: User | null;
  // The account has the { admin: true } claim (shows the "Admin panel" shortcut).
  // Display only — the server checks the claim again before opening the panel.
  isAdmin: boolean;
  ready: boolean;
  enabled: boolean;
  // Opens the login dialog (all sign-in methods)
  signIn: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithToken: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const CustomerAuthContext = createContext<CustomerAuth | undefined>(undefined);

export function CustomerAuthProvider({ children }: ChildProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(!isClientFirebaseConfigured);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!isClientFirebaseConfigured) return;
    return onAuthStateChanged(clientAuth(), (u) => {
      setUser(u);
      setReady(true);
      setIsAdmin(false);
      if (u) setDialogOpen(false);
      u?.getIdTokenResult()
        .then((r) => setIsAdmin(r.claims.admin === true))
        .catch(() => setIsAdmin(false));
    });
  }, []);

  const value: CustomerAuth = {
    user,
    isAdmin,
    ready,
    enabled: isClientFirebaseConfigured,
    signIn: () => setDialogOpen(true),
    signInWithGoogle: async () => {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(clientAuth(), provider);
    },
    signInWithToken: async (token) => {
      await signInWithCustomToken(clientAuth(), token);
    },
    signOut: () => signOut(clientAuth()),
    getIdToken: async () => (clientAuth().currentUser ? clientAuth().currentUser!.getIdToken() : null),
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
      {dialogOpen && !user && <LoginDialog onClose={() => setDialogOpen(false)} />}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return ctx;
}
