import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las credenciales de Supabase en las variables de entorno');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export interface Novel {
  id: number;
  titulo: string;
  genero: string;
  capitulos: number;
  año: number;
  descripcion?: string;
  pais?: string;
  imagen?: string;
  estado: 'transmision' | 'finalizada';
  created_at: string;
  updated_at: string;
}

export interface DeliveryZone {
  id: number;
  name: string;
  cost: number;
  created_at: string;
  updated_at: string;
}

export interface Prices {
  id: number;
  movie_price: number;
  series_price: number;
  novel_price_per_chapter: number;
  transfer_fee_percentage: number;
  updated_at: string;
}

export interface SystemConfig {
  id: number;
  version: string;
  auto_sync: boolean;
  sync_interval: number;
  enable_notifications: boolean;
  max_notifications: number;
  settings: any;
  metadata: any;
  updated_at: string;
}
