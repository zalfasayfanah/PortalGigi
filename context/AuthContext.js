"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { getStoredData, setStoredData, initialUsers } from "@/lib/dataStore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null); // Firebase auth user
  const [profile, setProfile] = useState(null); // Firestore user document { nama, email, noHp, role, aktif }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Immediately attempt to restore cached demo or active session on mount
  useEffect(() => {
    const cached = getStoredData("senyum_active_user", null);
    if (cached) {
      setProfile(cached);
      setUser({ uid: cached.id, email: cached.email, displayName: cached.nama });
      setLoading(false);
    }
  }, []);

  // Sync profile from Firestore
  const fetchUserProfile = async (authUser) => {
    if (!authUser) {
      setProfile(null);
      setUser(null);
      setStoredData("senyum_active_user", null);
      setLoading(false);
      return null;
    }

    try {
      const userDocRef = doc(db, "users", authUser.uid);
      
      // Safety timeout for Firestore getDoc (2.5 seconds max)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Firestore fetch timeout")), 2500)
      );

      const userSnap = await Promise.race([getDoc(userDocRef), timeoutPromise]);

      if (userSnap && userSnap.exists()) {
        const data = userSnap.data();
        const profileData = { id: authUser.uid, ...data };
        setProfile(profileData);
        setStoredData("senyum_active_user", profileData);
        return profileData;
      } else {
        const newProfile = {
          nama: authUser.displayName || authUser.email?.split("@")[0] || "Pasien",
          email: authUser.email || "",
          noHp: "",
          role: "pasien",
          aktif: true,
          dibuatPada: new Date().toISOString(),
        };

        await setDoc(userDocRef, {
          ...newProfile,
          dibuatPada: serverTimestamp(),
        });

        const fullProfile = { id: authUser.uid, ...newProfile };
        setProfile(fullProfile);
        setStoredData("senyum_active_user", fullProfile);
        return fullProfile;
      }
    } catch (err) {
      console.warn("Firestore profile sync fallback:", err?.message || err);
      const cached = getStoredData("senyum_active_user", null);
      if (cached && cached.id === authUser.uid) {
        setProfile(cached);
        return cached;
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Safety fallback: ensure loading never hangs more than 1.5s
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      clearTimeout(safetyTimer);
      setUser(authUser);
      await fetchUserProfile(authUser);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  // 1. Register with Email (PRD 4.1)
  const registerWithEmail = async (email, password, nama, noHp) => {
    setLoading(true);
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const newUserDoc = {
        nama: nama.trim(),
        email: email.trim(),
        noHp: noHp.trim(),
        role: "pasien",
        aktif: true,
        dibuatPada: serverTimestamp(),
      };

      await setDoc(doc(db, "users", cred.user.uid), newUserDoc);
      const profileData = { id: cred.user.uid, ...newUserDoc, dibuatPada: new Date().toISOString() };
      setProfile(profileData);
      setStoredData("senyum_active_user", profileData);
      return profileData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 2. Login with Email (PRD 4.1)
  const loginWithEmail = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userProfile = await fetchUserProfile(cred.user);
      return userProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 3. Login with Google (PRD 4.1)
  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userProfile = await fetchUserProfile(result.user);
      return userProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 4. Logout
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("SignOut error:", e);
    }
    setUser(null);
    setProfile(null);
    setStoredData("senyum_active_user", null);
    router.push("/masuk");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        refreshProfile: () => fetchUserProfile(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
