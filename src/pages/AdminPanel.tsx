import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Settings, DollarSign, MapPin, BookOpen, Bell, Download, Upload, FolderSync as Sync, LogOut, Save, Plus, CreditCard as Edit, Trash2, Eye, EyeOff, User, Lock, AlertCircle, CheckCircle, Info, X, Globe, Calendar, Monitor, Image, Camera } from 'lucide-react';

export function AdminPanel() {
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
    exportSystemConfig,
    importSystemConfig,
    exportCompleteSourceCode,
    syncWithRemote,
    syncAllSections
  } = useAdmin();

  // Authentication state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Prices state
  const [pricesForm, setPricesForm] = useState(state.prices);

  // Delivery zones state
  const [deliveryZoneForm, setDeliveryZoneForm] = useState({ name: '', cost: 0 });
  const [editingZone, setEditingZone] = useState<any>(null);

  // Novels state
  const [novelForm, setNovelForm] = useState({
    titulo: '',
    genero: '',
    capitulos: 1,
    año: new Date().getFullYear(),
    descripcion: '',
    pais: '',
    imagen: '',
    estado: 'finalizada' as 'transmision' | 'finalizada'
  });
  const [editingNovel, setEditingNovel] = useState<any>(null);

  // UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);

  // Update forms when state changes
  useEffect(() => {
    setPricesForm(state.prices);
  }, [state.prices]);

  // Authentication handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(loginForm.username, loginForm.password);
    if (!success) {
      setLoginError('Credenciales incorrectas');
    } else {
      setLoginError('');
    }
  };

  const handleLogout = () => {
    logout();
    setLoginForm({ username: '', password: '' });
    setActiveTab('dashboard');
  };

  // Prices handlers
  const handlePricesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrices(pricesForm);
  };

  // Delivery zones handlers
  const handleDeliveryZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingZone) {
      updateDeliveryZone({ ...editingZone, ...deliveryZoneForm });
      setEditingZone(null);
    } else {
      addDeliveryZone(deliveryZoneForm);
    }
    setDeliveryZoneForm({ name: '', cost: 0 });
  };

  const handleEditZone = (zone: any) => {
    setEditingZone(zone);
    setDeliveryZoneForm({ name: zone.name, cost: zone.cost });
  };

  const handleCancelEditZone = () => {
    setEditingZone(null);
    setDeliveryZoneForm({ name: '', cost: 0 });
  };

  // Novels handlers
  const handleNovelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNovel) {
      updateNovel({ ...editingNovel, ...novelForm });
      setEditingNovel(null);
    } else {
      addNovel(novelForm);
    }
    setNovelForm({
      titulo: '',
      genero: '',
      capitulos: 1,
      año: new Date().getFullYear(),
      descripcion: '',
      pais: '',
      imagen: '',
      estado: 'finalizada'
    });
  };

  const handleEditNovel = (novel: any) => {
    setEditingNovel(novel);
    setNovelForm({
      titulo: novel.titulo,
      genero: novel.genero,
      capitulos: novel.capitulos,
      año: novel.año,
      descripcion: novel.descripcion || '',
      pais: novel.pais || '',
      imagen: novel.imagen || '',
      estado: novel.estado || 'finalizada'
    });
  };

  const handleCancelEditNovel = () => {
    setEditingNovel(null);
    setNovelForm({
      titulo: '',
      genero: '',
      capitulos: 1,
      año: new Date().getFullYear(),
      descripcion: '',
      pais: '',
      imagen: '',
      estado: 'finalizada'
    });
  };

  // Import/Export handlers
  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          importSystemConfig(config);
        } catch (error) {
          console.error('Error importing config:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSyncAll = async () => {
    setIsLoading(true);
    try {
      await syncAllSections();
    } catch (error) {
      console.error('Error syncing all sections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Country options for novels
  const countryOptions = [
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
    'Rusia',
    'Venezuela',
    'Chile',
    'Perú',
    'Ecuador'
  ];

  // Genre options for novels
  const genreOptions = [
    'Drama',
    'Romance',
    'Comedia',
    'Acción',
    'Familia',
    'Thriller',
    'Misterio',
    'Histórico',
    'Fantasía',
    'Ciencia Ficción'
  ];

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center">
            <div className="bg-white/20 p-4 rounded-full w-fit mx-auto mb-4">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Panel de Administración</h1>
            <p className="text-blue-100">TV a la Carta</p>
          </div>
          
          <form onSubmit={handleLogin} className="p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa tu usuario"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa tu contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700 text-sm">{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Iniciar Sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${state.syncStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {state.syncStatus.isOnline ? 'En línea' : 'Sin conexión'}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Settings },
              { id: 'prices', label: 'Precios', icon: DollarSign },
              { id: 'delivery', label: 'Zonas de Entrega', icon: MapPin },
              { id: 'novels', label: 'Gestión de Novelas', icon: BookOpen },
              { id: 'notifications', label: 'Notificaciones', icon: Bell },
              { id: 'system', label: 'Sistema', icon: Sync }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen del Sistema</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-600">Película</p>
                      <p className="text-2xl font-bold text-blue-900">${state.prices.moviePrice}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Monitor className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-purple-600">Serie/Temporada</p>
                      <p className="text-2xl font-bold text-purple-900">${state.prices.seriesPrice}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <MapPin className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-600">Zonas de Entrega</p>
                      <p className="text-2xl font-bold text-green-900">{state.deliveryZones.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-pink-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-pink-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-pink-600">Novelas</p>
                      <p className="text-2xl font-bold text-pink-900">{state.novels.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleSyncAll}
                  disabled={isLoading}
                  className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Sync className={`h-5 w-5 text-blue-600 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="font-medium text-blue-900">
                    {isLoading ? 'Sincronizando...' : 'Sincronizar Todo'}
                  </span>
                </button>
                
                <button
                  onClick={exportSystemConfig}
                  className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Download className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-900">Exportar Config</span>
                </button>
                
                <button
                  onClick={exportCompleteSourceCode}
                  className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <Download className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="font-medium text-purple-900">Exportar Código</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prices Tab */}
        {activeTab === 'prices' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuración de Precios</h2>
            
            <form onSubmit={handlePricesSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio de Películas (CUP)
                  </label>
                  <input
                    type="number"
                    value={pricesForm.moviePrice}
                    onChange={(e) => setPricesForm(prev => ({ ...prev, moviePrice: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio de Series por Temporada (CUP)
                  </label>
                  <input
                    type="number"
                    value={pricesForm.seriesPrice}
                    onChange={(e) => setPricesForm(prev => ({ ...prev, seriesPrice: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recargo por Transferencia (%)
                  </label>
                  <input
                    type="number"
                    value={pricesForm.transferFeePercentage}
                    onChange={(e) => setPricesForm(prev => ({ ...prev, transferFeePercentage: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio de Novelas por Capítulo (CUP)
                  </label>
                  <input
                    type="number"
                    value={pricesForm.novelPricePerChapter}
                    onChange={(e) => setPricesForm(prev => ({ ...prev, novelPricePerChapter: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Save className="h-5 w-5 inline mr-2" />
                Guardar Precios
              </button>
            </form>
          </div>
        )}

        {/* Delivery Zones Tab */}
        {activeTab === 'delivery' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingZone ? 'Editar Zona de Entrega' : 'Agregar Zona de Entrega'}
              </h2>
              
              <form onSubmit={handleDeliveryZoneSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Zona
                    </label>
                    <input
                      type="text"
                      value={deliveryZoneForm.name}
                      onChange={(e) => setDeliveryZoneForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Santiago de Cuba > Centro"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Costo de Entrega (CUP)
                    </label>
                    <input
                      type="number"
                      value={deliveryZoneForm.cost}
                      onChange={(e) => setDeliveryZoneForm(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <Save className="h-5 w-5 inline mr-2" />
                    {editingZone ? 'Actualizar' : 'Agregar'} Zona
                  </button>
                  
                  {editingZone && (
                    <button
                      type="button"
                      onClick={handleCancelEditZone}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Delivery Zones List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Zonas de Entrega Configuradas ({state.deliveryZones.length})
                </h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {state.deliveryZones.map((zone) => (
                  <div key={zone.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{zone.name}</h4>
                      <p className="text-sm text-gray-600">${zone.cost.toLocaleString()} CUP</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditZone(zone)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteDeliveryZone(zone.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
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

        {/* Novels Tab */}
        {activeTab === 'novels' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingNovel ? 'Editar Novela' : 'Agregar Nueva Novela'}
              </h2>
              
              <form onSubmit={handleNovelSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título de la Novela *
                    </label>
                    <input
                      type="text"
                      value={novelForm.titulo}
                      onChange={(e) => setNovelForm(prev => ({ ...prev, titulo: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: El Turco"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Género *
                    </label>
                    <select
                      value={novelForm.genero}
                      onChange={(e) => setNovelForm(prev => ({ ...prev, genero: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar género</option>
                      {genreOptions.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Capítulos *
                    </label>
                    <input
                      type="number"
                      value={novelForm.capitulos}
                      onChange={(e) => setNovelForm(prev => ({ ...prev, capitulos: parseInt(e.target.value) || 1 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Año *
                    </label>
                    <input
                      type="number"
                      value={novelForm.año}
                      onChange={(e) => setNovelForm(prev => ({ ...prev, año: parseInt(e.target.value) || new Date().getFullYear() }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1900"
                      max={new Date().getFullYear() + 5}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      País de Origen
                    </label>
                    <select
                      value={novelForm.pais}
                      onChange={(e) => setNovelForm(prev => ({ ...prev, pais: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar país</option>
                      {countryOptions.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado *
                    </label>
                    <select
                      value={novelForm.estado}
                      onChange={(e) => setNovelForm(prev => ({ ...prev, estado: e.target.value as 'transmision' | 'finalizada' }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="finalizada">✅ Finalizada</option>
                      <option value="transmision">📡 En Transmisión</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={novelForm.descripcion}
                    onChange={(e) => setNovelForm(prev => ({ ...prev, descripcion: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Descripción de la novela..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de Imagen (opcional)
                  </label>
                  <input
                    type="url"
                    value={novelForm.imagen}
                    onChange={(e) => setNovelForm(prev => ({ ...prev, imagen: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Si no se proporciona, se usará una imagen por defecto basada en el género
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <Save className="h-5 w-5 inline mr-2" />
                    {editingNovel ? 'Actualizar' : 'Agregar'} Novela
                  </button>
                  
                  {editingNovel && (
                    <button
                      type="button"
                      onClick={handleCancelEditNovel}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Novels List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Novelas Configuradas ({state.novels.length})
                </h3>
              </div>
              
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {state.novels.map((novel) => (
                  <div key={novel.id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="font-medium text-gray-900 mr-3">{novel.titulo}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            novel.estado === 'transmision' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {novel.estado === 'transmision' ? '📡 En Transmisión' : '✅ Finalizada'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-2">
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {novel.genero}
                          </span>
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {novel.capitulos} capítulos
                          </span>
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {novel.año}
                          </span>
                          {novel.pais && (
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                              {novel.pais}
                            </span>
                          )}
                        </div>
                        {novel.descripcion && (
                          <p className="text-sm text-gray-600 line-clamp-2">{novel.descripcion}</p>
                        )}
                        <div className="mt-2 text-sm font-medium text-green-600">
                          Precio: ${(novel.capitulos * state.prices.novelPricePerChapter).toLocaleString()} CUP
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEditNovel(novel)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteNovel(novel.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {state.novels.length === 0 && (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No hay novelas configuradas</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Notificaciones del Sistema ({state.notifications.length})
              </h2>
              
              {state.notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Limpiar todas
                </button>
              )}
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {state.notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    notification.type === 'success' ? 'bg-green-50 border-green-400' :
                    notification.type === 'error' ? 'bg-red-50 border-red-400' :
                    notification.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                    'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {notification.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                      {notification.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                      {notification.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded-full mr-2">
                          {notification.section}
                        </span>
                        <span>{new Date(notification.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {state.notifications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No hay notificaciones</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Gestión del Sistema</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Exportar Datos</h3>
                  
                  <button
                    onClick={exportSystemConfig}
                    className="w-full flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                  >
                    <Download className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">Exportar Configuración JSON</span>
                  </button>
                  
                  <button
                    onClick={exportCompleteSourceCode}
                    className="w-full flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                  >
                    <Download className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="font-medium text-purple-900">Exportar Código Fuente</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Importar Datos</h3>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-sm font-medium text-gray-600">
                        Seleccionar archivo de configuración
                      </span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportConfig}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      state.syncStatus.isOnline ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Estado</p>
                      <p className="font-semibold text-gray-900">
                        {state.syncStatus.isOnline ? 'En línea' : 'Sin conexión'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Sync className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Última Sincronización</p>
                      <p className="font-semibold text-gray-900 text-xs">
                        {new Date(state.syncStatus.lastSync).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-orange-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cambios Pendientes</p>
                      <p className="font-semibold text-gray-900">
                        {state.syncStatus.pendingChanges}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}