import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { convertNumberToWords } from '../utils/numberToWords';

export interface Client {
  id: string;
  name: string;
  ice: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
  entrepriseId: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  unit: string;
  stock: number;
  minStock: number;
  status: 'active' | 'inactive';
  createdAt: string;
  entrepriseId: string;
}

export interface Quote {
  id: string;
  number: string;
  clientId: string;
  client: Client;
  date: string;
  validUntil: string;
  items: QuoteItem[];
  subtotal: number;
  totalVat: number;
  totalTTC: number;
  totalInWords: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  entrepriseId: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
  unit?: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  client: Client;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  totalVat: number;
  totalTTC: number;
  totalInWords: string;
  status: 'draft' | 'sent' | 'unpaid' | 'paid' | 'collected';
  paymentMethod?: 'virement' | 'espece' | 'cheque' | 'effet';
  collectionDate?: string;
  collectionType?: 'cheque' | 'effet';
  createdAt: string;
  quoteId?: string;
  entrepriseId: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
  unit?: string;
}

interface DataContextType {
  clients: Client[];
  products: Product[];
  invoices: Invoice[];
  quotes: Quote[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  addQuote: (quote: Omit<Quote, 'id' | 'number' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  updateQuote: (id: string, quote: Partial<Quote>) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  convertQuoteToInvoice: (quoteId: string) => Promise<void>;
  updateProductStock: (productName: string, quantity: number) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  getProductById: (id: string) => Product | undefined;
  getInvoiceById: (id: string) => Invoice | undefined;
  getQuoteById: (id: string) => Quote | undefined;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    const entrepriseId = user.id;

    // Clients
    const clientsQuery = query(
      collection(db, 'clients'),
      where('entrepriseId', '==', entrepriseId)
    );
    const unsubscribeClients = onSnapshot(clientsQuery, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Client)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setClients(clientsData);
    });

    // Produits
    const productsQuery = query(
      collection(db, 'products'),
      where('entrepriseId', '==', entrepriseId)
    );
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setProducts(productsData);
    });

    // Factures
    const invoicesQuery = query(
      collection(db, 'invoices'),
      where('entrepriseId', '==', entrepriseId)
    );
    const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      const invoicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Invoice)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setInvoices(invoicesData);
    });

    // Devis
    const quotesQuery = query(
      collection(db, 'quotes'),
      where('entrepriseId', '==', entrepriseId)
    );
    const unsubscribeQuotes = onSnapshot(quotesQuery, (snapshot) => {
      const quotesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Quote)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setQuotes(quotesData);
      setIsLoading(false);
    });

    return () => {
      unsubscribeClients();
      unsubscribeProducts();
      unsubscribeInvoices();
      unsubscribeQuotes();
    };
  }, [isAuthenticated, user]);

  const generateInvoiceNumber = () => {
    if (!user?.company) return 'FAC-2025-001';
    
    const currentYear = new Date().getFullYear();
    const format = user.company.invoiceNumberingFormat || 'format2';
    const prefix = user.company.invoicePrefix || 'FAC';
    
    // Réinitialiser le compteur si nouvelle année
    let counter = user.company.invoiceCounter || 0;
    const lastYear = user.company.lastInvoiceYear || currentYear;
    
    if (currentYear > lastYear) {
      counter = 0;
    }
    
    counter += 1;
    const counterStr = String(counter).padStart(3, '0');
    
    // Mettre à jour le compteur dans Firebase
    updateCompanyInvoiceCounter(counter, currentYear);
    
    // Générer le numéro selon le format choisi
    switch (format) {
      case 'format1': // 2025-001
        return `${currentYear}-${counterStr}`;
      case 'format2': // FAC-2025-001
        return `${prefix}-${currentYear}-${counterStr}`;
      case 'format3': // 001/2025
        return `${counterStr}/${currentYear}`;
      case 'format4': // 2025/001-FAC
        return `${currentYear}/${counterStr}-${prefix}`;
      case 'format5': // FAC001-2025
        return `${prefix}${counterStr}-${currentYear}`;
      default:
        return `${prefix}-${currentYear}-${counterStr}`;
    }
  };

  const updateCompanyInvoiceCounter = async (counter: number, year: number) => {
    if (!user) return;
    
    try {
      await updateDoc(doc(db, 'entreprises', user.id), {
        invoiceCounter: counter,
        lastInvoiceYear: year,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du compteur:', error);
    }
  };

  const generateQuoteNumber = () => {
    if (!user?.company) return 'DEV-2025-001';
    
    const currentYear = new Date().getFullYear();
    const format = user.company.invoiceNumberingFormat || 'format2';
    const prefix = 'DEV'; // Préfixe fixe pour les devis
    
    // Compter les devis de l'année courante pour la numérotation
    const currentYearQuotes = quotes.filter(quote => 
      new Date(quote.createdAt).getFullYear() === currentYear
    );
    const counter = currentYearQuotes.length + 1;
    const counterStr = String(counter).padStart(3, '0');
    
    // Générer le numéro selon le même format que les factures
    switch (format) {
      case 'format1': // 2025-001
        return `${currentYear}-${counterStr}`;
      case 'format2': // DEV-2025-001
        return `${prefix}-${currentYear}-${counterStr}`;
      case 'format3': // 001/2025
        return `${counterStr}/${currentYear}`;
      case 'format4': // 2025/001-DEV
        return `${currentYear}/${counterStr}-${prefix}`;
      case 'format5': // DEV001-2025
        return `${prefix}${counterStr}-${currentYear}`;
      default:
        return `${prefix}-${currentYear}-${counterStr}`;
    }
  };

  // Clients
  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'entrepriseId'>) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'clients'), {
        ...clientData,
        entrepriseId: user.id,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du client:', error);
    }
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    try {
      await updateDoc(doc(db, 'clients', id), {
        ...clientData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client:', error);
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'clients', id));
    } catch (error) {
      console.error('Erreur lors de la suppression du client:', error);
    }
  };

  // Produits
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'entrepriseId'>) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'products'), {
        ...productData,
        entrepriseId: user.id,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', id), {
        ...productData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
    }
  };

  const updateProductStock = async (productName: string, quantity: number) => {
    const product = products.find(p => p.name === productName);
    if (product) {
      const newStock = Math.max(0, product.stock - quantity);
      await updateProduct(product.id, { stock: newStock });
    }
  };

  // Factures
  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'entrepriseId' | 'dueDate' | 'totalInWords'>) => {
    if (!user) return;
    
    try {
      const invoiceNumber = generateInvoiceNumber();
      
      const totalInWords = convertNumberToWords(invoiceData.totalTTC);
      
      await addDoc(collection(db, 'invoices'), {
        ...invoiceData,
        number: invoiceNumber,
        totalInWords,
        status: 'unpaid', // Statut par défaut
        entrepriseId: user.id,
        createdAt: new Date().toISOString()
      });

      // Note: Le stock initial ne change jamais
      // Les quantités vendues sont calculées dynamiquement depuis les factures
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la facture:', error);
    }
  };

  const updateInvoice = async (id: string, invoiceData: Partial<Invoice>) => {
    try {
      await updateDoc(doc(db, 'invoices', id), {
        ...invoiceData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la facture:', error);
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'invoices', id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la facture:', error);
    }
  };

  // Devis
  const addQuote = async (quoteData: Omit<Quote, 'id' | 'number' | 'createdAt' | 'entrepriseId' | 'totalInWords'>) => {
    if (!user) return;
    
    try {
      const quoteNumber = generateQuoteNumber();
      const totalInWords = convertNumberToWords(quoteData.totalTTC);
      
      await addDoc(collection(db, 'quotes'), {
        ...quoteData,
        number: quoteNumber,
        totalInWords,
        entrepriseId: user.id,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du devis:', error);
    }
  };

  const updateQuote = async (id: string, quoteData: Partial<Quote>) => {
    try {
      await updateDoc(doc(db, 'quotes', id), {
        ...quoteData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du devis:', error);
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'quotes', id));
    } catch (error) {
      console.error('Erreur lors de la suppression du devis:', error);
    }
  };


  const convertQuoteToInvoice = async (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    const invoiceData = {
      clientId: quote.clientId,
      client: quote.client,
      date: new Date().toISOString().split('T')[0],
      items: quote.items,
      subtotal: quote.subtotal,
      totalVat: quote.totalVat,
      totalTTC: quote.totalTTC,
      status: 'draft' as const,
      quoteId: quote.id
    };

    await addInvoice(invoiceData);
    await updateQuote(quoteId, { status: 'accepted' });
  };

  // Getters
  const getClientById = (id: string) => clients.find(client => client.id === id);
  const getProductById = (id: string) => products.find(product => product.id === id);
  const getInvoiceById = (id: string) => invoices.find(invoice => invoice.id === id);
  const getQuoteById = (id: string) => quotes.find(quote => quote.id === id);

  const value = {
    clients,
    products,
    invoices,
    quotes,
    addClient,
    updateClient,
    deleteClient,
    addProduct,
    updateProduct,
    deleteProduct,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    addQuote,
    updateQuote,
    deleteQuote,
    convertQuoteToInvoice,
    updateProductStock,
    getClientById,
    getProductById,
    getInvoiceById,
    getQuoteById,
    updateInvoiceStatus: updateInvoice,
    isLoading,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}