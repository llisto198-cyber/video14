import React, { createContext, useContext, useReducer, useEffect } from 'react';

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
  prices: {
    moviePrice: 80,
    seriesPrice: 300,
    transferFeePercentage: 10,
    novelPricePerChapter: 5
  },
  deliveryZones: [
    {
      id: '1',
      name: 'Santiago de Cuba > Santiago de Cuba > Nuevo Vista Alegre',
      cost: 100,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Santiago de Cuba > Santiago de Cuba > Vista Alegre',
      cost: 300,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  novels: [],
  systemFiles: [],
  notifications: [],
  lastBackup: null
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
        notifications: [notification, ...state.notifications.slice(0, 49)] // Keep last 50
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

  // Load admin data from localStorage
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
    
    // Initialize system files
    updateSystemFiles();
  }, []);

  // Save admin data to localStorage
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
      message: `Película: $${prices.moviePrice}, Serie: $${prices.seriesPrice}, Transferencia: ${prices.transferFeePercentage}%`,
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
      message: `Nueva zona de entrega: ${zone.name} - $${zone.cost} CUP`,
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
      message: `Zona modificada: ${zone.name}`,
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
      message: `Zona eliminada: ${zone?.name || 'Desconocida'}`,
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
      message: `Nueva novela: ${novel.titulo} (${novel.capitulos} capítulos)`,
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
      message: `Novela modificada: ${novel.titulo}`,
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
      message: `Novela eliminada: ${novel?.titulo || 'Desconocida'}`,
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
      notifications: state.notifications.slice(0, 100), // Last 100 notifications
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
    link.download = `TV_a_la_Carta_Backup_${new Date().toISOString().split('T')[0]}.json`;
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
}