import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(pb.authStore.model);
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
      setIsAuthenticated(!!model);
    });
    setInitialLoading(false);
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
      return authData;
    } catch (err) {
      console.error("Login Error:", err);
      throw err;
    }
  };

  const signup = async (data) => {
    try {
      const record = await pb.collection('users').create(data, { $autoCancel: false });
      await login(data.email, data.password);
      return record;
    } catch (err) {
      console.error("Signup Error:", err);
      throw err;
    }
  };

  const logout = () => {
    pb.authStore.clear();
    toast.success("Logged out successfully");
  };

  const value = {
    currentUser,
    isAuthenticated,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!initialLoading && children}
    </AuthContext.Provider>
  );
};