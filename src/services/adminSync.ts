import { supabase, Novel, DeliveryZone, Prices, SystemConfig } from './supabase';

export class AdminSyncService {
  private realtimeChannels: Map<string, any> = new Map();

  async fetchNovels(): Promise<Novel[]> {
    const { data, error } = await supabase
      .from('novels')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching novels:', error);
      return [];
    }

    return data || [];
  }

  async addNovel(novel: Omit<Novel, 'id' | 'created_at' | 'updated_at'>): Promise<Novel | null> {
    const { data, error } = await supabase
      .from('novels')
      .insert([novel])
      .select()
      .single();

    if (error) {
      console.error('Error adding novel:', error);
      return null;
    }

    return data;
  }

  async updateNovel(novel: Novel): Promise<Novel | null> {
    const { id, created_at, ...updateData } = novel;
    const { data, error } = await supabase
      .from('novels')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating novel:', error);
      return null;
    }

    return data;
  }

  async deleteNovel(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('novels')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting novel:', error);
      return false;
    }

    return true;
  }

  async fetchDeliveryZones(): Promise<DeliveryZone[]> {
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching delivery zones:', error);
      return [];
    }

    return data || [];
  }

  async addDeliveryZone(zone: Omit<DeliveryZone, 'id' | 'created_at' | 'updated_at'>): Promise<DeliveryZone | null> {
    const { data, error } = await supabase
      .from('delivery_zones')
      .insert([zone])
      .select()
      .single();

    if (error) {
      console.error('Error adding delivery zone:', error);
      return null;
    }

    return data;
  }

  async updateDeliveryZone(zone: DeliveryZone): Promise<DeliveryZone | null> {
    const { id, created_at, ...updateData } = zone;
    const { data, error } = await supabase
      .from('delivery_zones')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating delivery zone:', error);
      return null;
    }

    return data;
  }

  async deleteDeliveryZone(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('delivery_zones')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting delivery zone:', error);
      return false;
    }

    return true;
  }

  async fetchPrices(): Promise<Prices | null> {
    const { data, error } = await supabase
      .from('prices')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching prices:', error);
      return null;
    }

    return data;
  }

  async updatePrices(prices: Omit<Prices, 'id' | 'updated_at'>): Promise<Prices | null> {
    const existingPrices = await this.fetchPrices();

    if (existingPrices) {
      const { data, error } = await supabase
        .from('prices')
        .update(prices)
        .eq('id', existingPrices.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating prices:', error);
        return null;
      }

      return data;
    } else {
      const { data, error } = await supabase
        .from('prices')
        .insert([prices])
        .select()
        .single();

      if (error) {
        console.error('Error creating prices:', error);
        return null;
      }

      return data;
    }
  }

  async fetchSystemConfig(): Promise<SystemConfig | null> {
    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching system config:', error);
      return null;
    }

    return data;
  }

  async updateSystemConfig(config: Partial<SystemConfig>): Promise<SystemConfig | null> {
    const existingConfig = await this.fetchSystemConfig();

    if (existingConfig) {
      const { id, updated_at, ...updateData } = { ...existingConfig, ...config };
      const { data, error } = await supabase
        .from('system_config')
        .update(updateData)
        .eq('id', existingConfig.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating system config:', error);
        return null;
      }

      return data;
    }

    return null;
  }

  async validateCredentials(username: string, password: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('admin_credentials')
      .select('*')
      .eq('username', username)
      .eq('password_hash', password)
      .maybeSingle();

    if (error) {
      console.error('Error validating credentials:', error);
      return false;
    }

    return data !== null;
  }

  subscribeToNovels(callback: (payload: any) => void): void {
    const channel = supabase
      .channel('novels_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'novels' },
        callback
      )
      .subscribe();

    this.realtimeChannels.set('novels', channel);
  }

  subscribeToDeliveryZones(callback: (payload: any) => void): void {
    const channel = supabase
      .channel('delivery_zones_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'delivery_zones' },
        callback
      )
      .subscribe();

    this.realtimeChannels.set('delivery_zones', channel);
  }

  subscribeToPrices(callback: (payload: any) => void): void {
    const channel = supabase
      .channel('prices_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prices' },
        callback
      )
      .subscribe();

    this.realtimeChannels.set('prices', channel);
  }

  subscribeToSystemConfig(callback: (payload: any) => void): void {
    const channel = supabase
      .channel('system_config_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_config' },
        callback
      )
      .subscribe();

    this.realtimeChannels.set('system_config', channel);
  }

  unsubscribeAll(): void {
    this.realtimeChannels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.realtimeChannels.clear();
  }

  async exportConfiguration(): Promise<string> {
    const [novels, deliveryZones, prices, systemConfig] = await Promise.all([
      this.fetchNovels(),
      this.fetchDeliveryZones(),
      this.fetchPrices(),
      this.fetchSystemConfig()
    ]);

    const exportData = {
      version: systemConfig?.version || '2.1.0',
      exportDate: new Date().toISOString(),
      novels,
      deliveryZones,
      prices,
      systemConfig
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importConfiguration(configJson: string): Promise<boolean> {
    try {
      const config = JSON.parse(configJson);

      if (!config.novels || !config.deliveryZones || !config.prices) {
        throw new Error('Configuración inválida');
      }

      await supabase.from('novels').delete().neq('id', 0);

      for (const novel of config.novels) {
        const { id, created_at, updated_at, ...novelData } = novel;
        await this.addNovel(novelData);
      }

      await supabase.from('delivery_zones').delete().neq('id', 0);

      for (const zone of config.deliveryZones) {
        const { id, created_at, updated_at, ...zoneData } = zone;
        await this.addDeliveryZone(zoneData);
      }

      if (config.prices) {
        const { id, updated_at, ...pricesData } = config.prices;
        await this.updatePrices(pricesData);
      }

      if (config.systemConfig) {
        await this.updateSystemConfig(config.systemConfig);
      }

      return true;
    } catch (error) {
      console.error('Error importing configuration:', error);
      return false;
    }
  }
}

export const adminSyncService = new AdminSyncService();
