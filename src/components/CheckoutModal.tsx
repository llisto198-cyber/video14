import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, CreditCard, DollarSign, Truck, Home, MessageCircle, AlertCircle, Check } from 'lucide-react';

// ZONAS DE ENTREGA EMBEBIDAS - Generadas automáticamente
const EMBEDDED_DELIVERY_ZONES = [];

export interface CustomerInfo {
  fullName: string;
  phone: string;
  address: string;
}

export interface OrderData {
  orderId: string;
  customerInfo: CustomerInfo;
  deliveryZone: any;
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
  items: Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
  }>;
  total: number;
}

export function CheckoutModal({ isOpen, onClose, onCheckout, items, total }: CheckoutModalProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    phone: '',
    address: ''
  });
  
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener zonas de entrega actuales del admin context
  const getCurrentDeliveryZones = () => {
    try {
      const adminState = localStorage.getItem('admin_system_state');
      if (adminState) {
        const state = JSON.parse(adminState);
        return state.deliveryZones || EMBEDDED_DELIVERY_ZONES;
      }
    } catch (error) {
      console.warn('Error getting delivery zones:', error);
    }
    return EMBEDDED_DELIVERY_ZONES;
  };

  const [deliveryZones, setDeliveryZones] = useState(getCurrentDeliveryZones());

  // Escuchar cambios en las zonas de entrega
  useEffect(() => {
    const handleAdminChange = (event: CustomEvent) => {
      if (event.detail.type === 'delivery_zone_add' || 
          event.detail.type === 'delivery_zone_update' || 
          event.detail.type === 'delivery_zone_delete') {
        const updatedZones = getCurrentDeliveryZones();
        setDeliveryZones(updatedZones);
        
        // Si la zona seleccionada fue eliminada, resetear
        if (selectedZone && !updatedZones.find((z: any) => z.id === selectedZone.id)) {
          setSelectedZone(null);
        }
      }
    };

    window.addEventListener('admin_state_change', handleAdminChange as EventListener);
    
    return () => {
      window.removeEventListener('admin_state_change', handleAdminChange as EventListener);
    };
  }, [selectedZone]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCustomerInfo({ fullName: '', phone: '', address: '' });
      setDeliveryType('pickup');
      setSelectedZone(null);
      setErrors({});
      setIsSubmitting(false);
      // Actualizar zonas al abrir el modal
      setDeliveryZones(getCurrentDeliveryZones());
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!customerInfo.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^[+]?[0-9\s\-()]{8,}$/.test(customerInfo.phone.trim())) {
      newErrors.phone = 'Formato de teléfono inválido';
    }

    if (!customerInfo.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (deliveryType === 'delivery' && !selectedZone) {
      newErrors.zone = 'Debe seleccionar una zona de entrega';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = `TV-${Date.now()}`;
      const deliveryCost = deliveryType === 'delivery' && selectedZone ? selectedZone.cost : 0;
      const finalTotal = total + deliveryCost;

      const orderData: OrderData = {
        orderId,
        customerInfo,
        deliveryZone: deliveryType === 'delivery' && selectedZone ? selectedZone : { name: 'Recogida en tienda', cost: 0 },
        deliveryCost,
        items,
        subtotal: total,
        transferFee: 0,
        total: finalTotal
      };

      onCheckout(orderData);
    } catch (error) {
      console.error('Error processing order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const deliveryCost = deliveryType === 'delivery' && selectedZone ? selectedZone.cost : 0;
  const finalTotal = total + deliveryCost;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Información del Cliente
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={customerInfo.fullName}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingrese su nombre completo"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+53 5555 5555"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <textarea
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows={3}
                  placeholder="Ingrese su dirección completa"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.address}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Truck className="h-5 w-5 mr-2 text-blue-600" />
                Opciones de Entrega
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryType('pickup');
                    setSelectedZone(null);
                  }}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    deliveryType === 'pickup'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Home className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Recogida en Tienda</h4>
                  <p className="text-sm text-gray-600 mt-1">Sin costo adicional</p>
                  <p className="text-lg font-bold text-green-600 mt-2">Gratis</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    deliveryType === 'delivery'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Truck className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Entrega a Domicilio</h4>
                  <p className="text-sm text-gray-600 mt-1">Según zona seleccionada</p>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    {selectedZone ? `$${selectedZone.cost.toLocaleString()} CUP` : 'Seleccionar zona'}
                  </p>
                </button>
              </div>

              {/* Delivery Zones */}
              {deliveryType === 'delivery' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Seleccionar Zona de Entrega *
                  </label>
                  
                  {deliveryZones.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                        <p className="text-sm text-yellow-800">
                          No hay zonas de entrega configuradas. Por favor, seleccione "Recogida en Tienda" o contacte al administrador.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {deliveryZones.map((zone: any) => (
                        <button
                          key={zone.id}
                          type="button"
                          onClick={() => setSelectedZone(zone)}
                          className={`w-full p-3 text-left border rounded-lg transition-all ${
                            selectedZone?.id === zone.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{zone.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-blue-600">${zone.cost.toLocaleString()} CUP</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {errors.zone && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.zone}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Resumen del Pedido</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({items.length} elementos)</span>
                  <span className="font-medium">${total.toLocaleString()} CUP</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {deliveryType === 'pickup' ? 'Recogida en tienda' : 'Entrega a domicilio'}
                  </span>
                  <span className="font-medium">
                    {deliveryCost === 0 ? 'Gratis' : `$${deliveryCost.toLocaleString()} CUP`}
                  </span>
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">${finalTotal.toLocaleString()} CUP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || (deliveryType === 'delivery' && deliveryZones.length === 0)}
              className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center ${
                isSubmitting || (deliveryType === 'delivery' && deliveryZones.length === 0)
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transform hover:scale-105'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Enviar Pedido por WhatsApp
                </>
              )}
            </button>

            {deliveryType === 'delivery' && deliveryZones.length === 0 && (
              <p className="text-sm text-yellow-600 text-center">
                No se puede procesar entrega a domicilio sin zonas configuradas
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}