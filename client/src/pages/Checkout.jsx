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
    <div className="min-h-screen bg-[#0a0a0a] py-12 relative">
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-10"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.7\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }}
      />
      
      <div className="max-w-2xl mx-auto px-4 relative z-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-8 text-center">Checkout</h1>

          <div className="border border-gray-800 bg-[#0f0f0f] p-8">
            <Stepper
              onFinalStepCompleted={handleComplete}
              backButtonText="Back"
              nextButtonText="Continue"
            >
              <Step>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-6">Shipping Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="First Name *" value={shipping.firstName}
                      onChange={e => setShipping({...shipping, firstName: e.target.value})}
                      className="w-full p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
                    <input required placeholder="Last Name *" value={shipping.lastName}
                      onChange={e => setShipping({...shipping, lastName: e.target.value})}
                      className="w-full p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
                  </div>
                  <input required type="email" placeholder="Email *" value={shipping.email}
                    onChange={e => setShipping({...shipping, email: e.target.value})}
                    className="w-full p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
                  <input placeholder="Phone" value={shipping.phone}
                    onChange={e => setShipping({...shipping, phone: e.target.value})}
                    className="w-full p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
                  <input required placeholder="Address *" value={shipping.address}
                    onChange={e => setShipping({...shipping, address: e.target.value})}
                    className="w-full p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
                  <div className="grid grid-cols-3 gap-4">
                    <input required placeholder="City *" value={shipping.city}
                      onChange={e => setShipping({...shipping, city: e.target.value})}
                      className="w-full p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
                    <input required placeholder="Zip Code *" value={shipping.zipCode}
                      onChange={e => setShipping({...shipping, zipCode: e.target.value})}
                      className="w-full p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
                    <select value={shipping.country}
                      onChange={e => setShipping({...shipping, country: e.target.value})}
                      className="w-full p-3 bg-[#111] border border-gray-800 text-white focus:border-[#ff6b35] focus:outline-none transition font-mono">
                      <option value="TN">Tunisia</option>
                    </select>
                  </div>
                </div>
              </Step>

              <Step>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-6">Review Order</h2>
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item._id} className="flex justify-between items-center p-4 bg-[#111] border border-gray-800">
                      <div className="flex items-center gap-3">
                        <img src={item.images?.[0] || 'https://via.placeholder.com/50'} alt={item.name} className="w-12 h-12 object-cover border border-gray-800" />
                        <div>
                          <p className="font-bold text-white text-sm uppercase">{item.name}</p>
                          <p className="text-xs text-gray-500 font-mono">Qty: {item.quantity} × {formatDT(item.price)}</p>
                        </div>
                      </div>
                      <p className="font-black text-[#ff6b35]">{formatDT(item.price * item.quantity)}</p>
                    </div>
                  ))}
                  <div className="border-t border-gray-800 pt-4 space-y-2">
                    <div className="flex justify-between text-sm font-mono">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-white">{formatDT(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-mono">
                      <span className="text-gray-500">Delivery Fee</span>
                      <span className="text-white">{formatDT(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-black pt-2 border-t border-gray-800">
                      <span className="text-white uppercase">Total</span>
                      <span className="text-[#ff6b35]">{formatDT(totalWithDelivery)}</span>
                    </div>
                  </div>
                </div>
              </Step>

              <Step>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-6">Payment Method</h2>
                <div className="bg-[#111] border border-gray-800 p-6 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-[#ff6b35] flex items-center justify-center">
                      <div className="w-3 h-3 bg-[#ff6b35]" />
                    </div>
                    <span className="font-bold text-white">Cash on Delivery</span>
                  </div>
                  <p className="text-sm text-gray-500 font-mono mt-2 ml-8">Pay when your order arrives. No additional fees.</p>
                </div>

                <div className="bg-[#111] border border-gray-800 p-6">
                  <h3 className="font-black text-white uppercase mb-3">Shipping to:</h3>
                  <p className="text-sm text-gray-400 font-mono">
                    {shipping.firstName} {shipping.lastName}<br />
                    {shipping.address}<br />
                    {shipping.city}, {shipping.zipCode}<br />
                    {shipping.email}<br />
                    {shipping.phone && `${shipping.phone}`}
                  </p>
                </div>

                <p className="text-center text-gray-500 font-mono text-sm mt-6">
                  Click <strong className="text-white">Complete</strong> to place your order
                </p>
              </Step>
            </Stepper>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;