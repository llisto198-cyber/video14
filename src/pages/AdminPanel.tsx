import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Settings, 
  DollarSign, 
  MapPin, 
  BookOpen, 
  Bell, 
  Download, 
  Upload, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  LogOut, 
  Home,
  ArrowLeft,
  FileText,
  Archive,
  Code,
  Database,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Globe,
  Cpu,
  HardDrive,
  Activity
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import type { PriceConfig, DeliveryZone, Novel, AdminNotification } from '../context/AdminContext';

// Utility function to create and download ZIP files
const createZipFile = async (files: { [path: string]: string }): Promise<void> => {
  // Simple ZIP creation using JSZip-like functionality
  const JSZip = (window as any).JSZip;
  
  if (!JSZip) {
    // Fallback: create individual files
    Object.entries(files).forEach(([path, content]) => {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = path.replace(/\//g, '_');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
    return;
  }

  const zip = new JSZip();
  
  // Add files to ZIP maintaining directory structure
  Object.entries(files).forEach(([path, content]) => {
    zip.file(path, content);
  });

  // Generate and download ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `TV_a_la_Carta_System_Export_${new Date().toISOString().split('T')[0]}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// System file templates with dynamic content injection
const generateSystemFiles = (adminState: any): { [path: string]: string } => {
  const files: { [path: string]: string } = {};

  // AdminContext.tsx with updated prices and zones
  files['src/context/AdminContext.tsx'] = `import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface PriceConfig {
  moviePrice: number;
  seriesPrice: number;
  transferFeePercentage: number;
  novelPricePerChapter: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  cost: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Novel {
  id: number;
  titulo: string;
  genero: string;
  capitulos: number;
  año: number;
  descripcion?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemFile {
  name: string;
  path: string;
  lastModified: string;
  size: number;
  type: 'component' | 'service' | 'context' | 'page' | 'config';
  description: string;
}

interface AdminState {
  isAuthenticated: boolean;
  prices: PriceConfig;
  deliveryZones: DeliveryZone[];
  novels: Novel[];
  systemFiles: SystemFile[];
  notifications: AdminNotification[];
  lastBackup: string | null;
}

export interface AdminNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  section: string;
  action: string;
}

type AdminAction = 
  | { type: 'LOGIN'; payload: boolean }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PRICES'; payload: PriceConfig }
  | { type: 'ADD_DELIVERY_ZONE'; payload: DeliveryZone }
  | { type: 'UPDATE_DELIVERY_ZONE'; payload: DeliveryZone }
  | { type: 'DELETE_DELIVERY_ZONE'; payload: string }
  | { type: 'ADD_NOVEL'; payload: Novel }
  | { type: 'UPDATE_NOVEL'; payload: Novel }
  | { type: 'DELETE_NOVEL'; payload: number }
  | { type: 'ADD_NOTIFICATION'; payload: AdminNotification }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'UPDATE_SYSTEM_FILES'; payload: SystemFile[] }
  | { type: 'SET_LAST_BACKUP'; payload: string }
  | { type: 'LOAD_ADMIN_DATA'; payload: Partial<AdminState> };

interface AdminContextType {
  state: AdminState;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updatePrices: (prices: PriceConfig) => void;
  addDeliveryZone: (zone: Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDeliveryZone: (zone: DeliveryZone) => void;
  deleteDeliveryZone: (id: string) => void;
  addNovel: (novel: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNovel: (novel: Novel) => void;
  deleteNovel: (id: number) => void;
  addNotification: (notification: Omit<AdminNotification, 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
  exportSystemBackup: () => void;
  getSystemFiles: () => SystemFile[];
}

export const AdminContext = createContext<AdminContextType | undefined>(undefined);

const initialState: AdminState = {
  isAuthenticated: false,
  prices: ${JSON.stringify(adminState.prices, null, 4)},
  deliveryZones: ${JSON.stringify(adminState.deliveryZones, null, 4)},
  novels: ${JSON.stringify(adminState.novels, null, 4)},
  systemFiles: [],
  notifications: [],
  lastBackup: ${adminState.lastBackup ? `"${adminState.lastBackup}"` : 'null'}
};

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isAuthenticated: action.payload };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false };
    case 'UPDATE_PRICES':
      return { ...state, prices: action.payload };
    case 'ADD_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: [...state.deliveryZones, action.payload]
      };
    case 'UPDATE_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: state.deliveryZones.map(zone =>
          zone.id === action.payload.id ? action.payload : zone
        )
      };
    case 'DELETE_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: state.deliveryZones.filter(zone => zone.id !== action.payload)
      };
    case 'ADD_NOVEL':
      return {
        ...state,
        novels: [...state.novels, action.payload]
      };
    case 'UPDATE_NOVEL':
      return {
        ...state,
        novels: state.novels.map(novel =>
          novel.id === action.payload.id ? action.payload : novel
        )
      };
    case 'DELETE_NOVEL':
      return {
        ...state,
        novels: state.novels.filter(novel => novel.id !== action.payload)
      };
    case 'ADD_NOTIFICATION':
      const notification: AdminNotification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      return {
        ...state,
        notifications: [notification, ...state.notifications.slice(0, 49)]
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    case 'UPDATE_SYSTEM_FILES':
      return { ...state, systemFiles: action.payload };
    case 'SET_LAST_BACKUP':
      return { ...state, lastBackup: action.payload };
    case 'LOAD_ADMIN_DATA':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  useEffect(() => {
    const savedData = localStorage.getItem('adminData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_ADMIN_DATA', payload: parsedData });
      } catch (error) {
        console.error('Error loading admin data:', error);
      }
    }
    
    updateSystemFiles();
  }, []);

  useEffect(() => {
    const dataToSave = {
      prices: state.prices,
      deliveryZones: state.deliveryZones,
      novels: state.novels,
      lastBackup: state.lastBackup
    };
    localStorage.setItem('adminData', JSON.stringify(dataToSave));
  }, [state.prices, state.deliveryZones, state.novels, state.lastBackup]);

  const login = (username: string, password: string): boolean => {
    if (username === 'root' && password === 'video') {
      dispatch({ type: 'LOGIN', payload: true });
      addNotification({
        type: 'success',
        title: 'Acceso Autorizado',
        message: 'Sesión iniciada correctamente en el panel de control',
        section: 'Autenticación',
        action: 'Login'
      });
      return true;
    }
    addNotification({
      type: 'error',
      title: 'Acceso Denegado',
      message: 'Credenciales incorrectas',
      section: 'Autenticación',
      action: 'Login Failed'
    });
    return false;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    addNotification({
      type: 'info',
      title: 'Sesión Cerrada',
      message: 'Se ha cerrado la sesión del panel de control',
      section: 'Autenticación',
      action: 'Logout'
    });
  };

  const updatePrices = (prices: PriceConfig) => {
    dispatch({ type: 'UPDATE_PRICES', payload: prices });
    addNotification({
      type: 'success',
      title: 'Precios Actualizados',
      message: \`Película: $\${prices.moviePrice}, Serie: $\${prices.seriesPrice}, Transferencia: \${prices.transferFeePercentage}%\`,
      section: 'Control de Precios',
      action: 'Update Prices'
    });
  };

  const addDeliveryZone = (zoneData: Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'>) => {
    const zone: DeliveryZone = {
      ...zoneData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_DELIVERY_ZONE', payload: zone });
    addNotification({
      type: 'success',
      title: 'Zona Agregada',
      message: \`Nueva zona de entrega: \${zone.name} - $\${zone.cost} CUP\`,
      section: 'Zonas de Entrega',
      action: 'Add Zone'
    });
  };

  const updateDeliveryZone = (zone: DeliveryZone) => {
    const updatedZone = { ...zone, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_DELIVERY_ZONE', payload: updatedZone });
    addNotification({
      type: 'success',
      title: 'Zona Actualizada',
      message: \`Zona modificada: \${zone.name}\`,
      section: 'Zonas de Entrega',
      action: 'Update Zone'
    });
  };

  const deleteDeliveryZone = (id: string) => {
    const zone = state.deliveryZones.find(z => z.id === id);
    dispatch({ type: 'DELETE_DELIVERY_ZONE', payload: id });
    addNotification({
      type: 'warning',
      title: 'Zona Eliminada',
      message: \`Zona eliminada: \${zone?.name || 'Desconocida'}\`,
      section: 'Zonas de Entrega',
      action: 'Delete Zone'
    });
  };

  const addNovel = (novelData: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'>) => {
    const novel: Novel = {
      ...novelData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_NOVEL', payload: novel });
    addNotification({
      type: 'success',
      title: 'Novela Agregada',
      message: \`Nueva novela: \${novel.titulo} (\${novel.capitulos} capítulos)\`,
      section: 'Gestión de Novelas',
      action: 'Add Novel'
    });
  };

  const updateNovel = (novel: Novel) => {
    const updatedNovel = { ...novel, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_NOVEL', payload: updatedNovel });
    addNotification({
      type: 'success',
      title: 'Novela Actualizada',
      message: \`Novela modificada: \${novel.titulo}\`,
      section: 'Gestión de Novelas',
      action: 'Update Novel'
    });
  };

  const deleteNovel = (id: number) => {
    const novel = state.novels.find(n => n.id === id);
    dispatch({ type: 'DELETE_NOVEL', payload: id });
    addNotification({
      type: 'warning',
      title: 'Novela Eliminada',
      message: \`Novela eliminada: \${novel?.titulo || 'Desconocida'}\`,
      section: 'Gestión de Novelas',
      action: 'Delete Novel'
    });
  };

  const addNotification = (notification: Omit<AdminNotification, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const updateSystemFiles = () => {
    const files: SystemFile[] = [
      {
        name: 'AdminContext.tsx',
        path: 'src/context/AdminContext.tsx',
        lastModified: new Date().toISOString(),
        size: 12500,
        type: 'context',
        description: 'Contexto principal del panel administrativo'
      },
      {
        name: 'CartContext.tsx',
        path: 'src/context/CartContext.tsx',
        lastModified: new Date().toISOString(),
        size: 8900,
        type: 'context',
        description: 'Contexto del carrito de compras'
      },
      {
        name: 'CheckoutModal.tsx',
        path: 'src/components/CheckoutModal.tsx',
        lastModified: new Date().toISOString(),
        size: 15600,
        type: 'component',
        description: 'Modal de checkout con zonas de entrega'
      },
      {
        name: 'NovelasModal.tsx',
        path: 'src/components/NovelasModal.tsx',
        lastModified: new Date().toISOString(),
        size: 18200,
        type: 'component',
        description: 'Modal de catálogo de novelas'
      },
      {
        name: 'PriceCard.tsx',
        path: 'src/components/PriceCard.tsx',
        lastModified: new Date().toISOString(),
        size: 3400,
        type: 'component',
        description: 'Componente de visualización de precios'
      },
      {
        name: 'AdminPanel.tsx',
        path: 'src/pages/AdminPanel.tsx',
        lastModified: new Date().toISOString(),
        size: 25000,
        type: 'page',
        description: 'Panel de control administrativo principal'
      }
    ];
    
    dispatch({ type: 'UPDATE_SYSTEM_FILES', payload: files });
  };

  const exportSystemBackup = () => {
    const backupData = {
      appName: 'TV a la Carta',
      version: '2.0.0',
      exportDate: new Date().toISOString(),
      adminConfig: {
        prices: state.prices,
        deliveryZones: state.deliveryZones,
        novels: state.novels
      },
      systemFiles: state.systemFiles,
      notifications: state.notifications.slice(0, 100),
      metadata: {
        totalZones: state.deliveryZones.length,
        activeZones: state.deliveryZones.filter(z => z.active).length,
        totalNovels: state.novels.length,
        activeNovels: state.novels.filter(n => n.active).length,
        lastBackup: state.lastBackup
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = \`TV_a_la_Carta_Backup_\${new Date().toISOString().split('T')[0]}.json\`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const backupTime = new Date().toISOString();
    dispatch({ type: 'SET_LAST_BACKUP', payload: backupTime });
    
    addNotification({
      type: 'success',
      title: 'Backup Exportado',
      message: 'Sistema completo exportado correctamente',
      section: 'Sistema Backup',
      action: 'Export Backup'
    });
  };

  const getSystemFiles = (): SystemFile[] => {
    return state.systemFiles;
  };

  return (
    <AdminContext.Provider value={{
      state,
      login,
      logout,
      updatePrices,
      addDeliveryZone,
      updateDeliveryZone,
      deleteDeliveryZone,
      addNovel,
      updateNovel,
      deleteNovel,
      addNotification,
      clearNotifications,
      exportSystemBackup,
      getSystemFiles
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}`;

  // PriceCard.tsx with updated prices
  files['src/components/PriceCard.tsx'] = `import React from 'react';
import { DollarSign, Tv, Film, Star, CreditCard } from 'lucide-react';
import { useAdmin, AdminContext } from '../context/AdminContext';

interface PriceCardProps {
  type: 'movie' | 'tv';
  selectedSeasons?: number[];
  episodeCount?: number;
  isAnime?: boolean;
}

export function PriceCard({ type, selectedSeasons = [], episodeCount = 0, isAnime = false }: PriceCardProps) {
  const adminContext = React.useContext(AdminContext);
  
  // Get prices from admin context
  const moviePrice = ${adminState.prices.moviePrice};
  const seriesPrice = ${adminState.prices.seriesPrice};
  const transferFeePercentage = ${adminState.prices.transferFeePercentage};
  
  const calculatePrice = () => {
    if (type === 'movie') {
      return moviePrice;
    } else {
      if (isAnime) {
        return selectedSeasons.length * seriesPrice;
      } else {
        return selectedSeasons.length * seriesPrice;
      }
    }
  };

  const price = calculatePrice();
  const transferPrice = Math.round(price * (1 + transferFeePercentage / 100));
  
  const getIcon = () => {
    if (type === 'movie') {
      return isAnime ? '🎌' : '🎬';
    }
    return isAnime ? '🎌' : '📺';
  };

  const getTypeLabel = () => {
    if (type === 'movie') {
      return isAnime ? 'Película Animada' : 'Película';
    }
    return isAnime ? 'Anime' : 'Serie';
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="bg-green-100 p-2 rounded-lg mr-3 shadow-sm">
            <span className="text-lg">{getIcon()}</span>
          </div>
          <div>
            <h3 className="font-bold text-green-800 text-sm">{getTypeLabel()}</h3>
            <p className="text-green-600 text-xs">
              {type === 'tv' && selectedSeasons.length > 0 
                ? \`\${selectedSeasons.length} temporada\${selectedSeasons.length > 1 ? 's' : ''}\`
                : 'Contenido completo'
              }
            </p>
          </div>
        </div>
        <div className="bg-green-500 text-white p-2 rounded-full shadow-md">
          <DollarSign className="h-4 w-4" />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="bg-white rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-green-700 flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              Efectivo
            </span>
            <span className="text-lg font-bold text-green-700">
              $\${price.toLocaleString()} CUP
            </span>
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-orange-700 flex items-center">
              <CreditCard className="h-3 w-3 mr-1" />
              Transferencia
            </span>
            <span className="text-lg font-bold text-orange-700">
              $\${transferPrice.toLocaleString()} CUP
            </span>
          </div>
          <div className="text-xs text-orange-600">
            +\${transferFeePercentage}% recargo bancario
          </div>
        </div>
        
        {type === 'tv' && selectedSeasons.length > 0 && (
          <div className="text-xs text-green-600 text-center bg-green-100 rounded-lg p-2">
            $\${(price / selectedSeasons.length).toLocaleString()} CUP por temporada (efectivo)
          </div>
        )}
      </div>
    </div>
  );
}`;

  // CheckoutModal.tsx with updated delivery zones
  files['src/components/CheckoutModal.tsx'] = `import React, { useState } from 'react';
import { X, User, MapPin, Phone, Copy, Check, MessageCircle, Calculator, DollarSign, CreditCard } from 'lucide-react';
import { useAdmin, AdminContext } from '../context/AdminContext';

export interface CustomerInfo {
  fullName: string;
  phone: string;
  address: string;
}

export interface OrderData {
  orderId: string;
  customerInfo: CustomerInfo;
  deliveryZone: string;
  deliveryCost: number;
  items: any[];
  subtotal: number;
  transferFee: number;
  total: number;
  cashTotal?: number;
  transferTotal?: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: (orderData: OrderData) => void;
  items: any[];
  total: number;
}

const DELIVERY_ZONES = {
  'Por favor seleccionar su Barrio/Zona': 0,
${adminState.deliveryZones.map((zone: any) => `  '${zone.name}': ${zone.cost}`).join(',\n')}
};

export function CheckoutModal({ isOpen, onClose, onCheckout, items, total }: CheckoutModalProps) {
  const adminContext = React.useContext(AdminContext);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    phone: '',
    address: '',
  });
  
  const [deliveryZone, setDeliveryZone] = useState('Por favor seleccionar su Barrio/Zona');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderGenerated, setOrderGenerated] = useState(false);
  const [generatedOrder, setGeneratedOrder] = useState('');
  const [copied, setCopied] = useState(false);

  const adminZones = adminContext?.state?.deliveryZones || [];
  const adminZonesMap = adminZones.reduce((acc, zone) => {
    acc[zone.name] = zone.cost;
    return acc;
  }, {} as { [key: string]: number });
  
  const allZones = { ...DELIVERY_ZONES, ...adminZonesMap };
  const deliveryCost = allZones[deliveryZone as keyof typeof allZones] || 0;
  const finalTotal = total + deliveryCost;

  const isFormValid = customerInfo.fullName.trim() !== '' && 
                     customerInfo.phone.trim() !== '' && 
                     customerInfo.address.trim() !== '' &&
                     deliveryZone !== 'Por favor seleccionar su Barrio/Zona';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateOrderId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return \`TVC-\${timestamp}-\${random}\`.toUpperCase();
  };

  const calculateTotals = () => {
    const cashItems = items.filter(item => item.paymentType === 'cash');
    const transferItems = items.filter(item => item.paymentType === 'transfer');
    
    const cashTotal = cashItems.reduce((sum, item) => {
      const basePrice = item.type === 'movie' ? ${adminState.prices.moviePrice} : (item.selectedSeasons?.length || 1) * ${adminState.prices.seriesPrice};
      return sum + basePrice;
    }, 0);
    
    const transferTotal = transferItems.reduce((sum, item) => {
      const basePrice = item.type === 'movie' ? ${adminState.prices.moviePrice} : (item.selectedSeasons?.length || 1) * ${adminState.prices.seriesPrice};
      return sum + Math.round(basePrice * 1.${adminState.prices.transferFeePercentage / 10});
    }, 0);
    
    return { cashTotal, transferTotal };
  };

  const generateOrderText = () => {
    const orderId = generateOrderId();
    const { cashTotal, transferTotal } = calculateTotals();
    const transferFee = transferTotal - items.filter(item => item.paymentType === 'transfer').reduce((sum, item) => {
      const basePrice = item.type === 'movie' ? ${adminState.prices.moviePrice} : (item.selectedSeasons?.length || 1) * ${adminState.prices.seriesPrice};
      return sum + basePrice;
    }, 0);

    const itemsList = items
      .map(item => {
        const seasonInfo = item.selectedSeasons && item.selectedSeasons.length > 0 
          ? \`\\n  📺 Temporadas: \${item.selectedSeasons.sort((a, b) => a - b).join(', ')}\` 
          : '';
        const itemType = item.type === 'movie' ? 'Película' : 'Serie';
        const basePrice = item.type === 'movie' ? ${adminState.prices.moviePrice} : (item.selectedSeasons?.length || 1) * ${adminState.prices.seriesPrice};
        const finalPrice = item.paymentType === 'transfer' ? Math.round(basePrice * 1.${adminState.prices.transferFeePercentage / 10}) : basePrice;
        const paymentTypeText = item.paymentType === 'transfer' ? 'Transferencia (+${adminState.prices.transferFeePercentage}%)' : 'Efectivo';
        const emoji = item.type === 'movie' ? '🎬' : '📺';
        return \`\${emoji} *\${item.title}*\${seasonInfo}\\n  📋 Tipo: \${itemType}\\n  💳 Pago: \${paymentTypeText}\\n  💰 Precio: $\${finalPrice.toLocaleString()} CUP\`;
      })
      .join('\\n\\n');

    let orderText = \`🎬 *PEDIDO - TV A LA CARTA*\\n\\n\`;
    orderText += \`📋 *ID de Orden:* \${orderId}\\n\\n\`;
    
    orderText += \`👤 *DATOS DEL CLIENTE:*\\n\`;
    orderText += \`• Nombre: \${customerInfo.fullName}\\n\`;
    orderText += \`• Teléfono: \${customerInfo.phone}\\n\`;
    orderText += \`• Dirección: \${customerInfo.address}\\n\\n\`;
    
    orderText += \`🎯 *PRODUCTOS SOLICITADOS:*\\n\${itemsList}\\n\\n\`;
    
    orderText += \`💰 *RESUMEN DE COSTOS:*\\n\`;
    
    if (cashTotal > 0) {
      orderText += \`💵 Efectivo: $\${cashTotal.toLocaleString()} CUP\\n\`;
    }
    if (transferTotal > 0) {
      orderText += \`🏦 Transferencia: $\${transferTotal.toLocaleString()} CUP\\n\`;
    }
    orderText += \`• *Subtotal Contenido: $\${total.toLocaleString()} CUP*\\n\`;
    
    if (transferFee > 0) {
      orderText += \`• Recargo transferencia (${adminState.prices.transferFeePercentage}%): +$\${transferFee.toLocaleString()} CUP\\n\`;
    }
    
    orderText += \`🚚 Entrega (\${deliveryZone.split(' > ')[2]}): +$\${deliveryCost.toLocaleString()} CUP\\n\`;
    orderText += \`\\n🎯 *TOTAL FINAL: $\${finalTotal.toLocaleString()} CUP*\\n\\n\`;
    
    orderText += \`📍 *ZONA DE ENTREGA:*\\n\`;
    orderText += \`\${deliveryZone.replace(' > ', ' → ')}\\n\`;
    orderText += \`💰 Costo de entrega: $\${deliveryCost.toLocaleString()} CUP\\n\\n\`;
    
    orderText += \`⏰ *Fecha:* \${new Date().toLocaleString('es-ES')}\\n\`;
    orderText += \`🌟 *¡Gracias por elegir TV a la Carta!*\`;

    return { orderText, orderId };
  };

  const handleGenerateOrder = () => {
    if (!isFormValid) {
      alert('Por favor complete todos los campos requeridos antes de generar la orden.');
      return;
    }
    
    const { orderText } = generateOrderText();
    setGeneratedOrder(orderText);
    setOrderGenerated(true);
  };

  const handleCopyOrder = async () => {
    try {
      await navigator.clipboard.writeText(generatedOrder);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (deliveryZone === 'Por favor seleccionar su Barrio/Zona') {
      alert('Por favor selecciona un barrio específico para la entrega.');
      return;
    }

    setIsProcessing(true);

    try {
      const { orderId } = generateOrderText();
      const { cashTotal, transferTotal } = calculateTotals();
      const transferFee = transferTotal - items.filter(item => item.paymentType === 'transfer').reduce((sum, item) => {
        const basePrice = item.type === 'movie' ? ${adminState.prices.moviePrice} : (item.selectedSeasons?.length || 1) * ${adminState.prices.seriesPrice};
        return sum + basePrice;
      }, 0);

      const orderData: OrderData = {
        orderId,
        customerInfo,
        deliveryZone,
        deliveryCost,
        items,
        subtotal: total,
        transferFee,
        total: finalTotal,
        cashTotal,
        transferTotal
      };

      await onCheckout(orderData);
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-lg mr-3">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Finalizar Pedido</h2>
                <p className="text-sm opacity-90">Complete sus datos para procesar el pedido</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="p-4 sm:p-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 sm:p-6 mb-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <Calculator className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Resumen del Pedido</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                      $\${total.toLocaleString()} CUP
                    </div>
                    <div className="text-sm text-gray-600">Subtotal Contenido</div>
                    <div className="text-xs text-gray-500 mt-1">\${items.length} elementos</div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                      $\${deliveryCost.toLocaleString()} CUP
                    </div>
                    <div className="text-sm text-gray-600">Costo de Entrega</div>
                    <div className="text-xs text-gray-500 mt-1">
                      \${deliveryZone.split(' > ')[2] || 'Seleccionar zona'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4 border-2 border-green-300">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                  <span className="text-lg sm:text-xl font-bold text-gray-900">Total Final:</span>
                  <span className="text-2xl sm:text-3xl font-bold text-green-600">
                    $\${finalTotal.toLocaleString()} CUP
                  </span>
                </div>
              </div>
            </div>

            {!orderGenerated ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center text-gray-900">
                    <User className="h-5 w-5 mr-3 text-blue-600" />
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={customerInfo.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Ingrese su nombre completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={customerInfo.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="+53 5XXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección Completa *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={customerInfo.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Calle, número, entre calles..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center text-gray-900">
                    <MapPin className="h-5 w-5 mr-3 text-green-600" />
                    Zona de Entrega
                  </h3>
                  
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-4 border border-green-200">
                    <div className="flex items-center mb-2">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <span className="text-sm">📍</span>
                      </div>
                      <h4 className="font-semibold text-green-900">Información de Entrega</h4>
                    </div>
                    <p className="text-sm text-green-700 ml-11">
                      Seleccione su zona para calcular el costo de entrega. Los precios pueden variar según la distancia.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar Barrio/Zona *
                    </label>
                    <select
                      value={deliveryZone}
                      onChange={(e) => setDeliveryZone(e.target.value)}
                      required
                      className={\`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white \${
                        deliveryZone === 'Por favor seleccionar su Barrio/Zona'
                          ? 'border-orange-300 focus:ring-orange-500 bg-orange-50'
                          : 'border-gray-300 focus:ring-green-500'
                      }\`}
                    >
                      {Object.entries(allZones).map(([zone, cost]) => (
                        <option key={zone} value={zone}>
                          {zone === 'Por favor seleccionar su Barrio/Zona' 
                            ? zone 
                            : \`\${zone.split(' > ')[2]} \${cost > 0 ? \`- $\${cost.toLocaleString()} CUP\` : ''}\`
                          }
                        </option>
                      ))}
                    </select>
                    
                    {deliveryZone === 'Por favor seleccionar su Barrio/Zona' && (
                      <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center">
                          <span className="text-orange-600 mr-2">⚠️</span>
                          <span className="text-sm font-medium text-orange-700">
                            Por favor seleccione su zona de entrega para continuar
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {deliveryCost > 0 && (
                      <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="bg-green-100 p-2 rounded-lg mr-3">
                              <span className="text-sm">🚚</span>
                            </div>
                            <span className="text-sm font-semibold text-green-800">
                              Costo de entrega confirmado:
                            </span>
                          </div>
                          <div className="bg-white rounded-lg px-3 py-2 border border-green-300">
                            <span className="text-lg font-bold text-green-600">
                              $\${deliveryCost.toLocaleString()} CUP
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-green-600 ml-11">
                          ✅ Zona: \${deliveryZone.split(' > ')[2]}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateOrder}
                    disabled={!isFormValid || deliveryZone === 'Por favor seleccionar su Barrio/Zona'}
                    className={\`flex-1 px-6 py-4 rounded-xl transition-all font-medium \${
                      isFormValid && deliveryZone !== 'Por favor seleccionar su Barrio/Zona'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }\`}
                  >
                    Generar Orden
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || !isFormValid || deliveryZone === 'Por favor seleccionar su Barrio/Zona'}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all font-medium flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Enviar por WhatsApp
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                    <Check className="h-6 w-6 text-green-600 mr-3" />
                    Orden Generada
                  </h3>
                  <button
                    onClick={handleCopyOrder}
                    className={\`px-4 py-2 rounded-xl font-medium transition-all flex items-center justify-center \${
                      copied
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
                    }\`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Orden
                      </>
                    )}
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 max-h-96 overflow-y-auto">
                  <pre className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                    {generatedOrder}
                  </pre>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={() => setOrderGenerated(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    Volver a Editar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isProcessing || !isFormValid}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 text-white rounded-xl transition-all font-medium flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Enviar por WhatsApp
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}`;

  return files;
};

export function AdminPanel() {
  const navigate = useNavigate();
  const {
    state,
    login,
    logout,
    updatePrices,
    addDeliveryZone,
    updateDeliveryZone,
    deleteDeliveryZone,
    addNovel,
    updateNovel,
    deleteNovel,
    clearNotifications,
    exportSystemBackup
  } = useAdmin();

  // Login state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active section state
  const [activeSection, setActiveSection] = useState<'dashboard' | 'prices' | 'zones' | 'novels' | 'notifications' | 'system'>('dashboard');

  // Price management state
  const [priceForm, setPriceForm] = useState<PriceConfig>(state.prices);
  const [priceChanges, setPriceChanges] = useState(false);

  // Zone management state
  const [zoneForm, setZoneForm] = useState({ name: '', cost: 0, active: true });
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [zoneSearch, setZoneSearch] = useState('');

  // Novel management state
  const [novelForm, setNovelForm] = useState({
    titulo: '',
    genero: '',
    capitulos: 0,
    año: new Date().getFullYear(),
    descripcion: '',
    active: true
  });
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [novelSearch, setNovelSearch] = useState('');

  // System state
  const [systemStats, setSystemStats] = useState({
    uptime: '0h 0m',
    memoryUsage: '0 MB',
    activeUsers: 0,
    totalOrders: 0
  });

  // Auto-update system stats
  useEffect(() => {
    const updateStats = () => {
      const startTime = Date.now() - Math.random() * 86400000; // Random uptime up to 24h
      const uptime = Date.now() - startTime;
      const hours = Math.floor(uptime / 3600000);
      const minutes = Math.floor((uptime % 3600000) / 60000);
      
      setSystemStats({
        uptime: `${hours}h ${minutes}m`,
        memoryUsage: `${Math.floor(Math.random() * 500 + 100)} MB`,
        activeUsers: Math.floor(Math.random() * 50 + 10),
        totalOrders: Math.floor(Math.random() * 1000 + 500)
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Monitor price changes
  useEffect(() => {
    const hasChanges = JSON.stringify(priceForm) !== JSON.stringify(state.prices);
    setPriceChanges(hasChanges);
  }, [priceForm, state.prices]);

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    const success = login(loginForm.username, loginForm.password);
    if (!success) {
      setLoginError('Credenciales incorrectas. Intenta de nuevo.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Handle price updates with real-time file generation
  const handlePriceUpdate = async () => {
    updatePrices(priceForm);
    
    // Generate updated system files
    const updatedFiles = generateSystemFiles(state);
    
    // Store updated files in localStorage for potential export
    localStorage.setItem('updatedSystemFiles', JSON.stringify(updatedFiles));
    
    setPriceChanges(false);
  };

  // Handle zone operations with real-time file generation
  const handleZoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingZone) {
      updateDeliveryZone({ ...editingZone, ...zoneForm, updatedAt: new Date().toISOString() });
      setEditingZone(null);
    } else {
      addDeliveryZone(zoneForm);
    }
    
    // Generate updated system files
    const updatedFiles = generateSystemFiles(state);
    localStorage.setItem('updatedSystemFiles', JSON.stringify(updatedFiles));
    
    setZoneForm({ name: '', cost: 0, active: true });
  };

  // Handle novel operations with real-time file generation
  const handleNovelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingNovel) {
      updateNovel({ ...editingNovel, ...novelForm, updatedAt: new Date().toISOString() });
      setEditingNovel(null);
    } else {
      addNovel(novelForm);
    }
    
    // Generate updated system files
    const updatedFiles = generateSystemFiles(state);
    localStorage.setItem('updatedSystemFiles', JSON.stringify(updatedFiles));
    
    setNovelForm({
      titulo: '',
      genero: '',
      capitulos: 0,
      año: new Date().getFullYear(),
      descripcion: '',
      active: true
    });
  };

  // Export system files as ZIP
  const handleExportSystemFiles = async () => {
    const updatedFiles = generateSystemFiles(state);
    await createZipFile(updatedFiles);
  };

  // Filter functions
  const filteredZones = state.deliveryZones.filter(zone =>
    zone.name.toLowerCase().includes(zoneSearch.toLowerCase())
  );

  const filteredNovels = state.novels.filter(novel =>
    novel.titulo.toLowerCase().includes(novelSearch.toLowerCase()) ||
    novel.genero.toLowerCase().includes(novelSearch.toLowerCase())
  );

  // Login screen
  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-400 to-purple-400 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Panel de Control</h1>
            <p className="text-blue-200">TV a la Carta - Sistema Administrativo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                placeholder="Ingrese su usuario"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all pr-12"
                  placeholder="Ingrese su contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-200 text-sm">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/20">
            <Link
              to="/"
              className="flex items-center justify-center text-blue-200 hover:text-white transition-colors group"
            >
              <Home className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Regresar a la página de inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main admin panel
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg mr-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel de Control</h1>
                <p className="text-sm text-gray-500">TV a la Carta - Sistema Administrativo</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Activity className="h-4 w-4 text-green-500" />
                <span>Sistema Activo</span>
              </div>
              
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver al sitio
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="space-y-2">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: Settings },
                  { id: 'prices', label: 'Control de Precios', icon: DollarSign },
                  { id: 'zones', label: 'Zonas de Entrega', icon: MapPin },
                  { id: 'novels', label: 'Gestión de Novelas', icon: BookOpen },
                  { id: 'notifications', label: 'Notificaciones', icon: Bell },
                  { id: 'system', label: 'Sistema', icon: Database }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id as any)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all ${
                      activeSection === id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {label}
                    {id === 'notifications' && state.notifications.length > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {state.notifications.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Dashboard */}
            {activeSection === 'dashboard' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard del Sistema</h2>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 text-sm font-medium">Tiempo Activo</p>
                          <p className="text-2xl font-bold text-blue-900">{systemStats.uptime}</p>
                        </div>
                        <Clock className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-sm font-medium">Memoria en Uso</p>
                          <p className="text-2xl font-bold text-green-900">{systemStats.memoryUsage}</p>
                        </div>
                        <HardDrive className="h-8 w-8 text-green-500" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 text-sm font-medium">Usuarios Activos</p>
                          <p className="text-2xl font-bold text-purple-900">{systemStats.activeUsers}</p>
                        </div>
                        <User className="h-8 w-8 text-purple-500" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-600 text-sm font-medium">Pedidos Totales</p>
                          <p className="text-2xl font-bold text-orange-900">{systemStats.totalOrders}</p>
                        </div>
                        <Archive className="h-8 w-8 text-orange-500" />
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={handleExportSystemFiles}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                    >
                      <Archive className="h-5 w-5 mr-2" />
                      Exportar Sistema
                    </button>

                    <button
                      onClick={exportSystemBackup}
                      className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Backup Completo
                    </button>

                    <button
                      onClick={clearNotifications}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                    >
                      <Bell className="h-5 w-5 mr-2" />
                      Limpiar Notificaciones
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Price Management */}
            {activeSection === 'prices' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Control de Precios</h2>
                  {priceChanges && (
                    <div className="flex items-center text-orange-600">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">Cambios pendientes</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio de Películas (CUP)
                    </label>
                    <input
                      type="number"
                      value={priceForm.moviePrice}
                      onChange={(e) => setPriceForm(prev => ({ ...prev, moviePrice: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio de Series por Temporada (CUP)
                    </label>
                    <input
                      type="number"
                      value={priceForm.seriesPrice}
                      onChange={(e) => setPriceForm(prev => ({ ...prev, seriesPrice: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recargo por Transferencia (%)
                    </label>
                    <input
                      type="number"
                      value={priceForm.transferFeePercentage}
                      onChange={(e) => setPriceForm(prev => ({ ...prev, transferFeePercentage: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio por Capítulo de Novela (CUP)
                    </label>
                    <input
                      type="number"
                      value={priceForm.novelPricePerChapter}
                      onChange={(e) => setPriceForm(prev => ({ ...prev, novelPricePerChapter: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={handlePriceUpdate}
                  disabled={!priceChanges}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                    priceChanges
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Save className="h-5 w-5 inline mr-2" />
                  Actualizar Precios
                </button>
              </div>
            )}

            {/* Zone Management */}
            {activeSection === 'zones' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Zonas de Entrega</h2>

                  <form onSubmit={handleZoneSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Zona
                      </label>
                      <input
                        type="text"
                        value={zoneForm.name}
                        onChange={(e) => setZoneForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: Santiago de Cuba > Santiago de Cuba > Vista Alegre"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Costo de Entrega (CUP)
                      </label>
                      <input
                        type="number"
                        value={zoneForm.cost}
                        onChange={(e) => setZoneForm(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white py-3 px-6 rounded-xl font-semibold transition-all"
                      >
                        {editingZone ? 'Actualizar' : 'Agregar'} Zona
                      </button>
                    </div>
                  </form>

                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={zoneSearch}
                        onChange={(e) => setZoneSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Buscar zonas..."
                      />
                    </div>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredZones.map((zone) => (
                      <div key={zone.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-gray-900">{zone.name}</p>
                          <p className="text-sm text-gray-600">${zone.cost.toLocaleString()} CUP</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingZone(zone);
                              setZoneForm({ name: zone.name, cost: zone.cost, active: zone.active });
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteDeliveryZone(zone.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Novel Management */}
            {activeSection === 'novels' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Novelas</h2>

                  <form onSubmit={handleNovelSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título
                      </label>
                      <input
                        type="text"
                        value={novelForm.titulo}
                        onChange={(e) => setNovelForm(prev => ({ ...prev, titulo: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Género
                      </label>
                      <input
                        type="text"
                        value={novelForm.genero}
                        onChange={(e) => setNovelForm(prev => ({ ...prev, genero: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capítulos
                      </label>
                      <input
                        type="number"
                        value={novelForm.capitulos}
                        onChange={(e) => setNovelForm(prev => ({ ...prev, capitulos: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Año
                      </label>
                      <input
                        type="number"
                        value={novelForm.año}
                        onChange={(e) => setNovelForm(prev => ({ ...prev, año: parseInt(e.target.value) || new Date().getFullYear() }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción (Opcional)
                      </label>
                      <input
                        type="text"
                        value={novelForm.descripcion}
                        onChange={(e) => setNovelForm(prev => ({ ...prev, descripcion: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Descripción breve de la novela..."
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-3 px-6 rounded-xl font-semibold transition-all"
                      >
                        {editingNovel ? 'Actualizar' : 'Agregar'} Novela
                      </button>
                    </div>
                  </form>

                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={novelSearch}
                        onChange={(e) => setNovelSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Buscar novelas por título o género..."
                      />
                    </div>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredNovels.map((novel) => (
                      <div key={novel.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-gray-900">{novel.titulo}</p>
                          <p className="text-sm text-gray-600">
                            {novel.genero} • {novel.capitulos} capítulos • {novel.año}
                          </p>
                          {novel.descripcion && (
                            <p className="text-xs text-gray-500 mt-1">{novel.descripcion}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingNovel(novel);
                              setNovelForm({
                                titulo: novel.titulo,
                                genero: novel.genero,
                                capitulos: novel.capitulos,
                                año: novel.año,
                                descripcion: novel.descripcion || '',
                                active: novel.active
                              });
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteNovel(novel.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Notificaciones del Sistema</h2>
                  <button
                    onClick={clearNotifications}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    Limpiar Todas
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {state.notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No hay notificaciones</p>
                    </div>
                  ) : (
                    state.notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-xl border-l-4 ${
                          notification.type === 'success'
                            ? 'bg-green-50 border-green-400'
                            : notification.type === 'warning'
                            ? 'bg-yellow-50 border-yellow-400'
                            : notification.type === 'error'
                            ? 'bg-red-50 border-red-400'
                            : 'bg-blue-50 border-blue-400'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="mr-3 mt-1">
                            {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                            {notification.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                            {notification.type === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                            {notification.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <span>{notification.section}</span>
                              <span className="mx-2">•</span>
                              <span>{new Date(notification.timestamp).toLocaleString('es-ES')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* System */}
            {activeSection === 'system' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestión del Sistema</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                      <h3 className="text-lg font-bold text-blue-900 mb-4">Exportación de Archivos</h3>
                      <p className="text-blue-700 text-sm mb-4">
                        Exporta todos los archivos del sistema con las modificaciones aplicadas en tiempo real.
                      </p>
                      <button
                        onClick={handleExportSystemFiles}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center"
                      >
                        <Archive className="h-5 w-5 mr-2" />
                        Exportar Sistema Completo
                      </button>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                      <h3 className="text-lg font-bold text-green-900 mb-4">Backup de Configuración</h3>
                      <p className="text-green-700 text-sm mb-4">
                        Crea un backup completo de la configuración del sistema.
                      </p>
                      <button
                        onClick={exportSystemBackup}
                        className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Crear Backup
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Información del Sistema</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-600">Versión:</span>
                        <span className="font-semibold">2.0.0</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-600">Último Backup:</span>
                        <span className="font-semibold">
                          {state.lastBackup 
                            ? new Date(state.lastBackup).toLocaleString('es-ES')
                            : 'Nunca'
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-600">Zonas de Entrega:</span>
                        <span className="font-semibold">{state.deliveryZones.length}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-600">Novelas Registradas:</span>
                        <span className="font-semibold">{state.novels.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}