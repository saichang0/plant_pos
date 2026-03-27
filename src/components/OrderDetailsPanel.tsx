import { BackIcon, CallIcon, DotThreeIcon, EmailIcon, LocationIcon } from '@/src/components/icons/page';
import React from 'react';

type OrderData = {
  id: string;
  customer: string;
  date: string;
  status: string;
  items: string;
  total: string;
  statusColor: string;
};

type OrderDetailsPanelProps = {
  order: OrderData;
  onClose: () => void;
  onMarkDelivery: (order: OrderData) => void;
};

const OrderDetailsPanel: React.FC<OrderDetailsPanelProps> = ({ order, onClose, onMarkDelivery }) => (
  <>
    <div className="fixed inset-0 bg-black/30" onClick={onClose} />
    <aside className="fixed right-0 top-0 h-full w-full max-w-[600px] bg-white shadow-2xl overflow-y-auto z-30">
      
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={onClose}
              aria-label="Close details"
            >
              <BackIcon size={24} />
            </button>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Order ID #{order.id}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700">
                  Pending
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700">
                  • Unfulfilled
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                12 August, 2024 at 10:20 AM from Draft Orders
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Restock
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Edit
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <DotThreeIcon size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        
        {/* Order Item */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-semibold text-gray-900">Order Item</h4>
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700">
              • Unfulfilled
            </span>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex gap-4">
              <img 
                src="/placeholder-shoe.jpg" 
                alt="Ultraboost 5X Shoes" 
                className="w-20 h-20 rounded-lg object-cover bg-gray-100"
              />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Men's • Running</p>
                <h5 className="text-sm font-semibold text-gray-900 mt-1">Ultraboost 5X Shoes</h5>
                <div className="flex items-center gap-2 mt-2">
                  <span className="flex items-center gap-1 text-xs text-gray-600">
                    <span className="w-3 h-3 rounded-full bg-gray-800"></span>
                    Cloud White
                  </span>
                  <span className="text-xs text-gray-600">Halo Silver</span>
                  <span className="text-xs text-gray-600">Lucid Pink</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 max-w-xs">
                  Simplify order tracking with our intuitive Order List page.
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  $402.87 x 1 = $402.87
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Fulfil item
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800">
                Create shipping label
              </button>
            </div>
          </div>
        </section>

        {/* Order Summary */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-semibold text-gray-900">Order Summary</h4>
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700">
              Pending
            </span>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <div className="text-right">
                <span className="text-gray-500 mr-2">1 item</span>
                <span className="font-medium text-gray-900">$402.87</span>
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <div className="text-right">
                <span className="text-gray-500 mr-2">New Customer</span>
                <span className="font-medium text-gray-900">-$2.00</span>
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <div className="text-right">
                <span className="text-gray-500 mr-2">Free Shipping (0.0 lb)</span>
                <span className="font-medium text-gray-900">$0.00</span>
              </div>
            </div>
            
            <div className="flex justify-between text-sm pt-3 border-t border-gray-200">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-gray-900">$400.87</span>
            </div>
            
            <div className="flex justify-between text-sm pt-3 border-t border-gray-200">
              <span className="text-gray-600">Paid by customer</span>
              <span className="font-medium text-gray-900">$0.00</span>
            </div>
            
            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-600">Payment due when invoice is sent</span>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                Edit
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              View your order quickly on the Order Summary page.
            </p>
            
            <div className="flex items-center gap-2 mt-4">
              <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 border rounded-lg">
                Cancel
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg">
                Confirm
              </button>
            </div>
          </div>
        </section>

        {/* Customer Details */}
        <section>
          <h4 className="text-base font-semibold text-gray-900 mb-3">Customer Details</h4>
          
          <div className="grid grid-cols-3 gap-4">
            {/* Customer */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Customer</p>
              <div className="space-y-1">
                <p className="text-sm text-gray-900 flex items-center gap-2">
                  <span>👤</span> Cody Fisher
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span>🛍️</span> 1 Order
                </p>
                <p className="text-xs text-gray-500">Customer is tax-exempt</p>
              </div>
            </div>
            
            {/* Contact Information */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Contact information</p>
              <div className="space-y-1">
                <p className="text-sm text-gray-900 flex items-center gap-2">
                  <CallIcon size={14} className="text-gray-500" />
                  +880-1722 224 299
                </p>
                <p className="text-sm text-gray-900 flex items-center gap-2">
                  <EmailIcon size={14} className="text-gray-500" />
                  hellotankir4@gmail.com
                </p>
                <p className="text-xs text-gray-500">You can contact via number</p>
              </div>
            </div>
            
            {/* Shipping Address */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Shipping address</p>
              <div className="space-y-1">
                <p className="text-sm text-gray-900 flex items-start gap-2">
                  <LocationIcon size={14} className="text-gray-500 mt-0.5" />
                  <span>House 102</span>
                </p>
                <p className="text-sm text-gray-900 flex items-start gap-2">
                  <LocationIcon size={14} className="text-gray-500 mt-0.5 opacity-0" />
                  <span>211B Thornridge Cir. Syracuse, Connecticut 35624</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Billing Address */}
        <section>
          <h4 className="text-base font-semibold text-gray-900 mb-3">Billing Address</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Same as shipping address</p>
          </div>
        </section>

      </div>
    </aside>
  </>
);

export default OrderDetailsPanel;