import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { adminSyncService } from '../services/adminSync';
import type { Novel as SupabaseNovel, DeliveryZone as SupabaseDeliveryZone, Prices as SupabasePrices } from '../services/supabase';

interface Novel {
  id: number;
  titulo: string;
  genero: string;
  capitulos: number;
  año: number;
  descripcion?: string;
  pais?: string;
  imagen?: string;
  estado?: 'transmision' | 'finalizada';
  createdAt: string;
  updatedAt: string;
}

interface DeliveryZone {
  id: number;
  name: string;
  cost: number;
  createdAt: string;
  updatedAt: string;
}

interface Prices {
  moviePrice: number;
  seriesPrice: number;
  transferFeePercentage: number;
  novelPricePerChapter: number;
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
  read: boolean;
}

interface SystemConfig {
  version: string;
  lastBackup?: string;
  autoSync: boolean;
  syncInterval: number;
  enableNotifications: boolean;
  maxNotifications: number;
  settings?: any;
  metadata?: {
    totalOrders: number;
    totalRevenue: number;
    lastOrderDate: string;
    systemUptime: string;
  };
}

interface SyncStatus {
  lastSync: string;
  isOnline: boolean;
  pendingChanges: number;
}

interface AdminState {
  isAuthenticated: boolean;
  novels: Novel[];
  deliveryZones: DeliveryZone[];
  prices: Prices;
  notifications: Notification[];
  systemConfig: SystemConfig;
  syncStatus: SyncStatus;
}

type AdminAction = 
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'ADD_NOVEL'; payload: Novel }
  | { type: 'UPDATE_NOVEL'; payload: Novel }
  | { type: 'DELETE_NOVEL'; payload: number }
  | { type: 'ADD_DELIVERY_ZONE'; payload: DeliveryZone }
  | { type: 'UPDATE_DELIVERY_ZONE'; payload: DeliveryZone }
  | { type: 'DELETE_DELIVERY_ZONE'; payload: number }
  | { type: 'UPDATE_PRICES'; payload: Prices }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'UPDATE_SYSTEM_CONFIG'; payload: Partial<SystemConfig> }
  | { type: 'LOAD_STATE'; payload: Partial<AdminState> }
  | { type: 'UPDATE_SYNC_STATUS'; payload: Partial<SyncStatus> };

interface AdminContextType {
  state: AdminState;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addNovel: (novel: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNovel: (novel: Novel) => Promise<void>;
  deleteNovel: (id: number) => Promise<void>;
  addDeliveryZone: (zone: Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDeliveryZone: (zone: DeliveryZone) => Promise<void>;
  deleteDeliveryZone: (id: number) => Promise<void>;
  updatePrices: (prices: Prices) => Promise<void>;
  addNotification: (message: string, type: Notification['type']) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  updateSystemConfig: (config: Partial<SystemConfig>) => void;
  exportSystemConfig: () => Promise<string>;
  importSystemConfig: (configJson: string) => Promise<boolean>;
  getAvailableCountries: () => string[];
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const initialState: AdminState = {
  isAuthenticated: false,
  novels: [],
  deliveryZones: [],
  prices: {
    moviePrice: 80,
    seriesPrice: 300,
    transferFeePercentage: 10,
    novelPricePerChapter: 5,
  },
  notifications: [],
  systemConfig: {
    version: '2.1.0',
    autoSync: true,
    syncInterval: 300000,
    enableNotifications: true,
    maxNotifications: 100,
    metadata: {
      totalOrders: 0,
      totalRevenue: 0,
      lastOrderDate: '',
      systemUptime: new Date().toISOString(),
    }
  },
  syncStatus: {
    lastSync: new Date().toISOString(),
    isOnline: true,
    pendingChanges: 0,
  }
};

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false };
    case 'ADD_NOVEL':
      return {
        ...state,
        novels: [...state.novels, action.payload],
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };
    case 'UPDATE_NOVEL':
      return {
        ...state,
        novels: state.novels.map(novel => 
          novel.id === action.payload.id ? action.payload : novel
        ),
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };
    case 'DELETE_NOVEL':
      return {
        ...state,
        novels: state.novels.filter(novel => novel.id !== action.payload),
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };
    case 'ADD_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: [...state.deliveryZones, action.payload],
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };
    case 'UPDATE_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: state.deliveryZones.map(zone => 
          zone.id === action.payload.id ? action.payload : zone
        ),
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };
    case 'DELETE_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: state.deliveryZones.filter(zone => zone.id !== action.payload),
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };
    case 'UPDATE_PRICES':
      return {
        ...state,
        prices: action.payload,
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };
    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications.slice(0, state.systemConfig.maxNotifications)
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload 
            ? { ...notification, read: true }
            : notification
        )
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };
    case 'UPDATE_SYSTEM_CONFIG':
      return {
        ...state,
        systemConfig: { ...state.systemConfig, ...action.payload }
      };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    case 'UPDATE_SYNC_STATUS':
      return {
        ...state,
        syncStatus: { ...state.syncStatus, ...action.payload }
      };
    default:
      return state;
  }
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Países disponibles con Cuba incluido
  const availableCountries = [
    'Cuba',
    'Turquía',
    'México',
    'Brasil',
    'Colombia',
    'Argentina',
    'España',
    'Estados Unidos',
    'Corea del Sur',
    'India',
    'Reino Unido',
    'Francia',
    'Italia',
    'Alemania',
    'Japón',
    'China',
    'Rusia'
  ];

  useEffect(() => {
    const loadStateFromSupabase = async () => {
      try {
        const [novels, deliveryZones, prices, systemConfig] = await Promise.all([
          adminSyncService.fetchNovels(),
          adminSyncService.fetchDeliveryZones(),
          adminSyncService.fetchPrices(),
          adminSyncService.fetchSystemConfig()
        ]);

        const payload: Partial<AdminState> = {};

        if (novels.length > 0) {
          payload.novels = novels.map(n => ({
            id: n.id,
            titulo: n.titulo,
            genero: n.genero,
            capitulos: n.capitulos,
            año: n.año,
            descripcion: n.descripcion,
            pais: n.pais,
            imagen: n.imagen,
            estado: n.estado,
            createdAt: n.created_at,
            updatedAt: n.updated_at
          }));
        }

        if (deliveryZones.length > 0) {
          payload.deliveryZones = deliveryZones.map(z => ({
            id: z.id,
            name: z.name,
            cost: z.cost,
            createdAt: z.created_at,
            updatedAt: z.updated_at
          }));
        }

        if (prices) {
          payload.prices = {
            moviePrice: prices.movie_price,
            seriesPrice: prices.series_price,
            novelPricePerChapter: prices.novel_price_per_chapter,
            transferFeePercentage: prices.transfer_fee_percentage
          };
        }

        if (systemConfig) {
          payload.systemConfig = {
            version: systemConfig.version,
            autoSync: systemConfig.auto_sync,
            syncInterval: systemConfig.sync_interval,
            enableNotifications: systemConfig.enable_notifications,
            maxNotifications: systemConfig.max_notifications,
            settings: systemConfig.settings,
            metadata: systemConfig.metadata
          };
        }

        if (Object.keys(payload).length > 0) {
          dispatch({ type: 'LOAD_STATE', payload });
        }

        dispatch({
          type: 'UPDATE_SYNC_STATUS',
          payload: { lastSync: new Date().toISOString(), isOnline: true }
        });
      } catch (error) {
        console.error('Error loading state from Supabase:', error);
        dispatch({
          type: 'UPDATE_SYNC_STATUS',
          payload: { isOnline: false }
        });
      }
    };

    loadStateFromSupabase();
  }, []);

  useEffect(() => {
    const setupRealtimeSubscriptions = () => {
      adminSyncService.subscribeToNovels(async (payload) => {
        const novels = await adminSyncService.fetchNovels();
        dispatch({
          type: 'LOAD_STATE',
          payload: {
            novels: novels.map(n => ({
              id: n.id,
              titulo: n.titulo,
              genero: n.genero,
              capitulos: n.capitulos,
              año: n.año,
              descripcion: n.descripcion,
              pais: n.pais,
              imagen: n.imagen,
              estado: n.estado,
              createdAt: n.created_at,
              updatedAt: n.updated_at
            }))
          }
        });
      });

      adminSyncService.subscribeToDeliveryZones(async (payload) => {
        const zones = await adminSyncService.fetchDeliveryZones();
        dispatch({
          type: 'LOAD_STATE',
          payload: {
            deliveryZones: zones.map(z => ({
              id: z.id,
              name: z.name,
              cost: z.cost,
              createdAt: z.created_at,
              updatedAt: z.updated_at
            }))
          }
        });
      });

      adminSyncService.subscribeToPrices(async (payload) => {
        const prices = await adminSyncService.fetchPrices();
        if (prices) {
          dispatch({
            type: 'UPDATE_PRICES',
            payload: {
              moviePrice: prices.movie_price,
              seriesPrice: prices.series_price,
              novelPricePerChapter: prices.novel_price_per_chapter,
              transferFeePercentage: prices.transfer_fee_percentage
            }
          });
        }
      });

      adminSyncService.subscribeToSystemConfig(async (payload) => {
        const config = await adminSyncService.fetchSystemConfig();
        if (config) {
          dispatch({
            type: 'UPDATE_SYSTEM_CONFIG',
            payload: {
              version: config.version,
              autoSync: config.auto_sync,
              syncInterval: config.sync_interval,
              enableNotifications: config.enable_notifications,
              maxNotifications: config.max_notifications,
              settings: config.settings,
              metadata: config.metadata
            }
          });
        }
      });
    };

    if (state.isAuthenticated) {
      setupRealtimeSubscriptions();
    }

    return () => {
      adminSyncService.unsubscribeAll();
    };
  }, [state.isAuthenticated]);

  // Real-time sync with other components
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (state.syncStatus.pendingChanges > 0) {
        dispatch({ 
          type: 'UPDATE_SYNC_STATUS', 
          payload: { 
            lastSync: new Date().toISOString(),
            pendingChanges: 0
          }
        });
      }
    }, 5000); // Sync every 5 seconds

    return () => clearInterval(syncInterval);
  }, [state.syncStatus.pendingChanges]);

  const login = async (username: string, password: string): Promise<boolean> => {
    const isValid = await adminSyncService.validateCredentials(username, password);
    if (isValid) {
      dispatch({ type: 'LOGIN' });
      addNotification('Sesión iniciada correctamente', 'success');
      return true;
    }
    return false;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    addNotification('Sesión cerrada', 'info');
  };

  const addNovel = async (novelData: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'>) => {
    const supabaseNovel: Omit<SupabaseNovel, 'id' | 'created_at' | 'updated_at'> = {
      titulo: novelData.titulo,
      genero: novelData.genero,
      capitulos: novelData.capitulos,
      año: novelData.año,
      descripcion: novelData.descripcion || '',
      pais: novelData.pais || '',
      imagen: novelData.imagen || '',
      estado: novelData.estado || 'transmision'
    };

    const result = await adminSyncService.addNovel(supabaseNovel);

    if (result) {
      const novel: Novel = {
        id: result.id,
        titulo: result.titulo,
        genero: result.genero,
        capitulos: result.capitulos,
        año: result.año,
        descripcion: result.descripcion,
        pais: result.pais,
        imagen: result.imagen,
        estado: result.estado,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      };
      addNotification(`Novela "${novel.titulo}" agregada correctamente`, 'success');
    } else {
      addNotification('Error al agregar la novela', 'error');
    }
  };

  const updateNovel = async (novel: Novel) => {
    const supabaseNovel: SupabaseNovel = {
      id: novel.id,
      titulo: novel.titulo,
      genero: novel.genero,
      capitulos: novel.capitulos,
      año: novel.año,
      descripcion: novel.descripcion || '',
      pais: novel.pais || '',
      imagen: novel.imagen || '',
      estado: novel.estado,
      created_at: novel.createdAt,
      updated_at: novel.updatedAt
    };

    const result = await adminSyncService.updateNovel(supabaseNovel);

    if (result) {
      addNotification(`Novela "${novel.titulo}" actualizada correctamente`, 'success');
    } else {
      addNotification('Error al actualizar la novela', 'error');
    }
  };

  const deleteNovel = async (id: number) => {
    const novel = state.novels.find(n => n.id === id);
    const success = await adminSyncService.deleteNovel(id);

    if (success && novel) {
      addNotification(`Novela "${novel.titulo}" eliminada`, 'info');
    } else if (!success) {
      addNotification('Error al eliminar la novela', 'error');
    }
  };

  const addDeliveryZone = async (zoneData: Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'>) => {
    const supabaseZone: Omit<SupabaseDeliveryZone, 'id' | 'created_at' | 'updated_at'> = {
      name: zoneData.name,
      cost: zoneData.cost
    };

    const result = await adminSyncService.addDeliveryZone(supabaseZone);

    if (result) {
      addNotification(`Zona de entrega "${result.name}" agregada`, 'success');
    } else {
      addNotification('Error al agregar la zona de entrega', 'error');
    }
  };

  const updateDeliveryZone = async (zone: DeliveryZone) => {
    const supabaseZone: SupabaseDeliveryZone = {
      id: zone.id,
      name: zone.name,
      cost: zone.cost,
      created_at: zone.createdAt,
      updated_at: zone.updatedAt
    };

    const result = await adminSyncService.updateDeliveryZone(supabaseZone);

    if (result) {
      addNotification(`Zona de entrega "${zone.name}" actualizada`, 'success');
    } else {
      addNotification('Error al actualizar la zona de entrega', 'error');
    }
  };

  const deleteDeliveryZone = async (id: number) => {
    const zone = state.deliveryZones.find(z => z.id === id);
    const success = await adminSyncService.deleteDeliveryZone(id);

    if (success && zone) {
      addNotification(`Zona de entrega "${zone.name}" eliminada`, 'info');
    } else if (!success) {
      addNotification('Error al eliminar la zona de entrega', 'error');
    }
  };

  const updatePrices = async (prices: Prices) => {
    const supabasePrices: Omit<SupabasePrices, 'id' | 'updated_at'> = {
      movie_price: prices.moviePrice,
      series_price: prices.seriesPrice,
      novel_price_per_chapter: prices.novelPricePerChapter,
      transfer_fee_percentage: prices.transferFeePercentage
    };

    const result = await adminSyncService.updatePrices(supabasePrices);

    if (result) {
      addNotification('Precios actualizados correctamente', 'success');
    } else {
      addNotification('Error al actualizar los precios', 'error');
    }
  };

  const addNotification = (message: string, type: Notification['type']) => {
    if (!state.systemConfig.enableNotifications) return;
    
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message,
      type,
      timestamp: new Date(),
      read: false,
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const markNotificationRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const updateSystemConfig = (config: Partial<SystemConfig>) => {
    dispatch({ type: 'UPDATE_SYSTEM_CONFIG', payload: config });
    addNotification('Configuración del sistema actualizada', 'success');
  };

  const exportSystemConfig = async (): Promise<string> => {
    return await adminSyncService.exportConfiguration();
  };

  const importSystemConfig = async (configJson: string): Promise<boolean> => {
    const success = await adminSyncService.importConfiguration(configJson);

    if (success) {
      addNotification('Configuración importada correctamente', 'success');

      const [novels, deliveryZones, prices] = await Promise.all([
        adminSyncService.fetchNovels(),
        adminSyncService.fetchDeliveryZones(),
        adminSyncService.fetchPrices()
      ]);

      dispatch({
        type: 'LOAD_STATE',
        payload: {
          novels: novels.map(n => ({
            id: n.id,
            titulo: n.titulo,
            genero: n.genero,
            capitulos: n.capitulos,
            año: n.año,
            descripcion: n.descripcion,
            pais: n.pais,
            imagen: n.imagen,
            estado: n.estado,
            createdAt: n.created_at,
            updatedAt: n.updated_at
          })),
          deliveryZones: deliveryZones.map(z => ({
            id: z.id,
            name: z.name,
            cost: z.cost,
            createdAt: z.created_at,
            updatedAt: z.updated_at
          })),
          prices: prices ? {
            moviePrice: prices.movie_price,
            seriesPrice: prices.series_price,
            novelPricePerChapter: prices.novel_price_per_chapter,
            transferFeePercentage: prices.transfer_fee_percentage
          } : state.prices
        }
      });
    } else {
      addNotification('Error al importar configuración', 'error');
    }

    return success;
  };

  const getAvailableCountries = (): string[] => {
    return availableCountries;
  };

  return (
    <AdminContext.Provider value={{
      state,
      login,
      logout,
      addNovel,
      updateNovel,
      deleteNovel,
      addDeliveryZone,
      updateDeliveryZone,
      deleteDeliveryZone,
      updatePrices,
      addNotification,
      markNotificationRead,
      clearNotifications,
      updateSystemConfig,
      exportSystemConfig,
      importSystemConfig,
      getAvailableCountries
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

export { AdminContext };