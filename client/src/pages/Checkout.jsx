import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { formatDT } from '../utils/format';
import Stepper, { Step } from '../components/ui/Stepper';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shipping, setShipping] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'TN'
  });

  const deliveryFee = 8;
  const totalWithDelivery = cartTotal + deliveryFee;

  const handleComplete = async () => {
    try {
      await api.post('/orders/send', {
        items: cart,
        shippingInfo: shipping,
        cartTotal: totalWithDelivery,
        subtotal: cartTotal,
        deliveryFee,
        orderId: 'VS-' + Date.now().toString(36).toUpperCase()
      });
      toast.success('Order placed! Check your email.');
      clearCart();
      navigate('/');
    } catch (err) {
      toast.error('Order failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold mb-8 text-center">Checkout</h1>

          <Stepper
            onFinalStepCompleted={handleComplete}
            backButtonText="Back"
            nextButtonText="Continue"
          >
            {/* Step 1: Shipping */}
            <Step>
              <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="First Name *" value={shipping.firstName}
                    onChange={e => setShipping({...shipping, firstName: e.target.value})}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  <input required placeholder="Last Name *" value={shipping.lastName}
                    onChange={e => setShipping({...shipping, lastName: e.target.value})}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <input required type="email" placeholder="Email *" value={shipping.email}
                  onChange={e => setShipping({...shipping, email: e.target.value})}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                <input placeholder="Phone" value={shipping.phone}
                  onChange={e => setShipping({...shipping, phone: e.target.value})}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                <input required placeholder="Address *" value={shipping.address}
                  onChange={e => setShipping({...shipping, address: e.target.value})}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                <div className="grid grid-cols-3 gap-4">
                  <input required placeholder="City *" value={shipping.city}
                    onChange={e => setShipping({...shipping, city: e.target.value})}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  <input required placeholder="Zip Code *" value={shipping.zipCode}
                    onChange={e => setShipping({...shipping, zipCode: e.target.value})}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  <select value={shipping.country}
                    onChange={e => setShipping({...shipping, country: e.target.value})}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="TN">Tunisia</option>
                  </select>
                </div>
              </div>
            </Step>

            {/* Step 2: Review Order */}
            <Step>
              <h2 className="text-2xl font-semibold mb-6">Review Order</h2>
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item._id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center gap-3">
                      <img src={item.images?.[0] || 'https://via.placeholder.com/50'} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                      <div>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatDT(item.price)}</p>
                      </div>
                    </div>
                    <p className="font-bold">{formatDT(item.price * item.quantity)}</p>
                  </div>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatDT(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery Fee</span>
                    <span>{formatDT(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-purple-600">{formatDT(totalWithDelivery)}</span>
                  </div>
                </div>
              </div>
            </Step>

            {/* Step 3: Payment */}
            <Step>
              <h2 className="text-2xl font-semibold mb-6">Payment Method</h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-purple-600 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-purple-600" />
                  </div>
                  <span className="font-medium">Cash on Delivery</span>
                </div>
                <p className="text-sm text-gray-500 mt-2 ml-8">Pay when your order arrives. No additional fees.</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
                <h3 className="font-semibold mb-3">Shipping to:</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {shipping.firstName} {shipping.lastName}<br />
                  {shipping.address}<br />
                  {shipping.city}, {shipping.zipCode}<br />
                  {shipping.email}<br />
                  {shipping.phone && `${shipping.phone}`}
                </p>
              </div>

              <p className="text-center text-gray-500 text-sm mt-6">
                Click <strong>Complete</strong> to place your order
              </p>
            </Step>
          </Stepper>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;