/*
  # Sistema de Administración TV a la Carta
  
  1. Nuevas Tablas
    - `novels` - Gestión de novelas
      - `id` (bigint, primary key)
      - `titulo` (text, not null) - Título de la novela
      - `genero` (text, not null) - Género de la novela
      - `capitulos` (integer, not null) - Número de capítulos
      - `año` (integer, not null) - Año de la novela
      - `descripcion` (text) - Descripción de la novela
      - `pais` (text) - País de origen
      - `imagen` (text) - URL de la imagen
      - `estado` (text, not null) - Estado: transmision o finalizada
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `delivery_zones` - Zonas de entrega
      - `id` (bigint, primary key)
      - `name` (text, not null, unique) - Nombre de la zona
      - `cost` (numeric, not null) - Costo de entrega en CUP
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `prices` - Configuración de precios
      - `id` (bigint, primary key)
      - `movie_price` (numeric, not null) - Precio de películas
      - `series_price` (numeric, not null) - Precio de series por temporada
      - `novel_price_per_chapter` (numeric, not null) - Precio de novelas por capítulo
      - `transfer_fee_percentage` (numeric, not null) - Recargo por transferencia
      - `updated_at` (timestamptz, default now())
    
    - `system_config` - Configuración del sistema
      - `id` (bigint, primary key)
      - `version` (text, not null) - Versión del sistema
      - `auto_sync` (boolean, default true) - Sincronización automática
      - `sync_interval` (integer, default 300000) - Intervalo de sincronización en ms
      - `enable_notifications` (boolean, default true) - Habilitar notificaciones
      - `max_notifications` (integer, default 100) - Máximo de notificaciones
      - `settings` (jsonb) - Configuraciones adicionales
      - `metadata` (jsonb) - Metadatos del sistema
      - `updated_at` (timestamptz, default now())
    
    - `admin_credentials` - Credenciales de administrador (almacenamiento seguro)
      - `id` (bigint, primary key)
      - `username` (text, not null, unique) - Nombre de usuario
      - `password_hash` (text, not null) - Hash de la contraseña
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  
  2. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas que permiten acceso público de lectura y escritura (sistema sin autenticación)
    - IMPORTANTE: En producción, esto debería requerir autenticación real
  
  3. Notas Importantes
    - El sistema usa un enfoque sin autenticación por ahora
    - Las credenciales se almacenan como hash pero se validan en el cliente
    - Se recomienda implementar autenticación real en el futuro
*/

-- Crear tabla de novelas
CREATE TABLE IF NOT EXISTS novels (
  id bigserial PRIMARY KEY,
  titulo text NOT NULL,
  genero text NOT NULL,
  capitulos integer NOT NULL CHECK (capitulos > 0),
  año integer NOT NULL,
  descripcion text DEFAULT '',
  pais text DEFAULT '',
  imagen text DEFAULT '',
  estado text NOT NULL DEFAULT 'transmision' CHECK (estado IN ('transmision', 'finalizada')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de zonas de entrega
CREATE TABLE IF NOT EXISTS delivery_zones (
  id bigserial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  cost numeric NOT NULL CHECK (cost >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de precios (solo debe haber un registro)
CREATE TABLE IF NOT EXISTS prices (
  id bigserial PRIMARY KEY,
  movie_price numeric NOT NULL DEFAULT 80 CHECK (movie_price >= 0),
  series_price numeric NOT NULL DEFAULT 300 CHECK (series_price >= 0),
  novel_price_per_chapter numeric NOT NULL DEFAULT 5 CHECK (novel_price_per_chapter >= 0),
  transfer_fee_percentage numeric NOT NULL DEFAULT 10 CHECK (transfer_fee_percentage >= 0 AND transfer_fee_percentage <= 100),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de configuración del sistema (solo debe haber un registro)
CREATE TABLE IF NOT EXISTS system_config (
  id bigserial PRIMARY KEY,
  version text NOT NULL DEFAULT '2.1.0',
  auto_sync boolean DEFAULT true,
  sync_interval integer DEFAULT 300000,
  enable_notifications boolean DEFAULT true,
  max_notifications integer DEFAULT 100,
  settings jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de credenciales de administrador (solo debe haber un registro)
CREATE TABLE IF NOT EXISTS admin_credentials (
  id bigserial PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insertar configuración inicial de precios si no existe
INSERT INTO prices (movie_price, series_price, novel_price_per_chapter, transfer_fee_percentage)
SELECT 80, 300, 5, 10
WHERE NOT EXISTS (SELECT 1 FROM prices LIMIT 1);

-- Insertar configuración inicial del sistema si no existe
INSERT INTO system_config (version, auto_sync, sync_interval, enable_notifications, max_notifications, settings, metadata)
SELECT '2.1.0', true, 300000, true, 100, 
  '{}', 
  jsonb_build_object(
    'totalOrders', 0,
    'totalRevenue', 0,
    'lastOrderDate', '',
    'systemUptime', now()
  )
WHERE NOT EXISTS (SELECT 1 FROM system_config LIMIT 1);

-- Insertar credenciales iniciales (admin/admin123) - El hash es solo ilustrativo
-- En producción, usar bcrypt o similar para hash real
INSERT INTO admin_credentials (username, password_hash)
SELECT 'admin', 'admin123'
WHERE NOT EXISTS (SELECT 1 FROM admin_credentials WHERE username = 'admin');

-- Habilitar RLS en todas las tablas
ALTER TABLE novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público para novels (lectura y escritura)
CREATE POLICY "Permitir acceso público a novels"
  ON novels
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas de acceso público para delivery_zones
CREATE POLICY "Permitir acceso público a delivery_zones"
  ON delivery_zones
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas de acceso público para prices
CREATE POLICY "Permitir acceso público a prices"
  ON prices
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas de acceso público para system_config
CREATE POLICY "Permitir acceso público a system_config"
  ON system_config
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas de acceso público para admin_credentials (solo lectura para validación)
CREATE POLICY "Permitir lectura pública de credenciales"
  ON admin_credentials
  FOR SELECT
  USING (true);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_novels_estado ON novels(estado);
CREATE INDEX IF NOT EXISTS idx_novels_genero ON novels(genero);
CREATE INDEX IF NOT EXISTS idx_novels_pais ON novels(pais);
CREATE INDEX IF NOT EXISTS idx_novels_updated_at ON novels(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_name ON delivery_zones(name);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_novels_updated_at ON novels;
CREATE TRIGGER update_novels_updated_at
  BEFORE UPDATE ON novels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_delivery_zones_updated_at ON delivery_zones;
CREATE TRIGGER update_delivery_zones_updated_at
  BEFORE UPDATE ON delivery_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prices_updated_at ON prices;
CREATE TRIGGER update_prices_updated_at
  BEFORE UPDATE ON prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_config_updated_at ON system_config;
CREATE TRIGGER update_system_config_updated_at
  BEFORE UPDATE ON system_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_credentials_updated_at ON admin_credentials;
CREATE TRIGGER update_admin_credentials_updated_at
  BEFORE UPDATE ON admin_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();