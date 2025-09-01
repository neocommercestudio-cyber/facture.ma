import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface Company {
  name: string;
  ice: string;
  if?: string;
  rc?: string;
  cnss?: string;
  patente: string;
  email: string;
  website: string;
  phone?: string;
  address?: string;
  logo?: string;
  activity?: string;
  subscription: 'free' | 'pro';
  expiryDate?: string;
  subscriptionDate?: string;
  invoiceNumberingFormat?: string;
  invoicePrefix?: string;
  invoiceCounter?: number;
  quoteCounter?: number;
  lastInvoiceYear?: number;
  lastQuoteYear?: number;
  defaultTemplate?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
  company: Company;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, companyData: Omit<Company, 'subscription'>) => Promise<boolean>;
  logout: () => Promise<void>;
  updateCompanySettings: (settings: Partial<Company>) => Promise<void>;
  checkSubscriptionExpiry: () => void;
  showExpiryAlert: boolean;
  setShowExpiryAlert: (show: boolean) => void;
  expiredDate: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showExpiryAlert, setShowExpiryAlert] = useState(false);
  const [expiredDate, setExpiredDate] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name,
              role: userData.role || 'user',
              company: userData.company
            });
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
          name: userData.name,
          role: userData.role || 'user',
          company: userData.company
        });
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, companyData: Omit<Company, 'subscription'>): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const userData: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email || '',
        role: 'user',
        company: {
          ...companyData,
          subscription: 'free',
          subscriptionDate: new Date().toISOString(),
          invoiceNumberingFormat: 'format2',
          invoicePrefix: 'FAC',
          invoiceCounter: 0,
          quoteCounter: 0,
          lastInvoiceYear: new Date().getFullYear(),
          lastQuoteYear: new Date().getFullYear(),
          defaultTemplate: 'template1'
        }
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateCompanySettings = async (settings: Partial<Company>): Promise<void> => {
    if (!user) return;

    try {
      const updatedCompany = { ...user.company, ...settings };
      const updatedUser = { ...user, company: updatedCompany };

      await updateDoc(doc(db, 'users', user.id), {
        company: updatedCompany
      });

      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating company settings:', error);
      throw error;
    }
  };

  const checkSubscriptionExpiry = () => {
    if (!user?.company.expiryDate) return;

    const expiryDate = new Date(user.company.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (user.company.subscription === 'pro' && daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
      setExpiredDate(user.company.expiryDate);
      setShowExpiryAlert(true);
    } else if (user.company.subscription === 'pro' && daysUntilExpiry <= 0) {
      // Subscription expired, downgrade to free
      updateCompanySettings({ subscription: 'free' });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    updateCompanySettings,
    checkSubscriptionExpiry,
    showExpiryAlert,
    setShowExpiryAlert,
    expiredDate
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}