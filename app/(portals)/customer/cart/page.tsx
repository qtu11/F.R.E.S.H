'use client';

import { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, MapPin, CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import { orderService } from '@/lib/data/orders';
import { showToast } from '@/lib/data/notifications';

interface CartItem {
  id: string;
  name: string;
  store: string;
  price: number;
  originalPrice: number;
  quantity: number;
  gradient: string;
  discount: number;
}

const paymentMethods = [
  { id: 'wallet', name: 'Ví FRESH', icon: '💰', color: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' },
  { id: 'momo', name: 'Momo', icon: '💜', color: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800' },
  { id: 'zalopay', name: 'ZaloPay', icon: '💙', color: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' },
  { id: 'vnpay', name: 'VNPay', icon: '🧡', color: 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800' },
];

export default function CustomerCart() {
  const { t } = useGlobal();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pickup, setPickup] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState('wallet');
  const [ordering, setOrdering] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    // Khôi phục giỏ hàng từ localStorage
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('fresh_cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error('Error parsing cart from localStorage:', e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      // Gọi API balance bảo mật không truyền query string userId trực tiếp tránh IDOR
      fetch('/api/transactions/balance')
        .then(res => res.json())
        .then(data => {
          if (typeof data === 'number') {
            setWalletBalance(data);
          } else if (data && typeof data.walletBalance === 'number') {
            setWalletBalance(data.walletBalance);
          }
        })
        .catch(err => console.error('Failed to fetch wallet balance', err));
    }
  }, [user]);

  const updateQty = (id: string, delta: number) => {
    setCart(prev => {
      const next = prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item);
      if (typeof window !== 'undefined') {
        localStorage.setItem('fresh_cart', JSON.stringify(next));
      }
      return next;
    });
  };

  const removeItem = (id: string) => {
    setCart(prev => {
      const next = prev.filter(item => item.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('fresh_cart', JSON.stringify(next));
      }
      return next;
    });
    showToast('info', 'Removed from cart');
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const originalTotal = cart.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const savings = originalTotal - subtotal;
  const deliveryFee = pickup ? 0 : 15000;
  const total = subtotal + deliveryFee;

  // Kiểm tra nếu thanh toán bằng Ví và không đủ số dư
  const isWalletPayment = selectedPayment === 'wallet';
  const isBalanceInsufficient = isWalletPayment && walletBalance !== null && walletBalance < total;

  const handlePlaceOrder = async () => {
    if (!user) { showToast('error', 'Please login first'); return; }
    if (cart.length === 0) { showToast('warning', 'Cart is empty'); return; }
    if (isBalanceInsufficient) { showToast('error', 'Số dư ví FRESH không đủ', 'Vui lòng nạp thêm tiền hoặc chọn phương thức thanh toán khác'); return; }
    
    setOrdering(true);
    try {
      await orderService.create({
        userId: user.id,
        items: cart.map(i => ({ productId: i.id, productName: i.name, productImage: '', quantity: i.quantity, unitPrice: i.price })),
        subtotal,
        deliveryFee,
        serviceFee: 0,
        discount: savings,
        total: subtotal + deliveryFee,
        deliveryMethod: pickup ? 'pickup' : 'delivery',
        paymentMethod: selectedPayment as any,
        address: pickup ? undefined : user.address,
        storeId: (cart[0] as any)?.storeId || '',
        storeName: cart[0]?.store || '',
        notes: '',
      });
      
      // Xoá giỏ hàng sau khi đặt thành công
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fresh_cart');
      }
      setCart([]);
      showToast('success', 'Order Placed!', `Your order has been placed successfully. ${pickup ? 'Ready for pickup.' : 'On its way!'}`);
    } catch {
      showToast('error', 'Order Failed', 'Please try again');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-sm transition-colors">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <ShoppingBag className="w-6 h-6 text-white" />
          <span className="text-white font-bold text-xl tracking-wide">Cart ({cart.length})</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6">
        {!mounted ? null : cart.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-sm border border-gray-100 dark:border-slate-700">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
            <p className="text-gray-500 dark:text-slate-400 font-medium mb-6">Discover deals and rescue food now!</p>
            <Link href="/customer/search">
              <button className="px-8 py-3 bg-[#057A42] text-white rounded-xl font-bold text-sm hover:bg-[#046034] transition-colors shadow-md">Start Shopping</button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} layout className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 flex gap-4 items-center transition-all hover:shadow-md">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.gradient || 'from-emerald-400 to-green-600'} shrink-0 flex items-center justify-center text-white font-black text-lg`}>
                    {item.discount}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{item.name}</h3>
                    <p className="text-[10px] text-gray-500 dark:text-slate-400 font-semibold">{item.store}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-gray-900 dark:text-white font-black">{item.price.toLocaleString()}đ</span>
                      <span className="text-gray-400 dark:text-slate-500 line-through text-xs">{item.originalPrice.toLocaleString()}đ</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -1)} disabled={item.quantity <= 1} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300 disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-black text-gray-900 dark:text-white">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} disabled={item.quantity >= 10} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300 disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors ml-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-500 dark:text-slate-400">
                    <span>Subtotal ({cart.length} items)</span>
                    <span className="font-bold text-gray-900 dark:text-white">{subtotal.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>You save</span>
                    <span className="font-bold">-{savings.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-slate-400">
                    <span>Delivery</span>
                    <span className="font-bold text-gray-900 dark:text-white">{deliveryFee === 0 ? 'Free' : deliveryFee.toLocaleString() + 'đ'}</span>
                  </div>
                  <div className="border-t border-gray-100 dark:border-slate-700 pt-3 flex justify-between">
                    <span className="font-black text-gray-900 dark:text-white">Total</span>
                    <span className="font-black text-lg text-gray-900 dark:text-white">{total.toLocaleString()}đ</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-[#057A42]" />
                  <span className="font-bold text-gray-900 dark:text-white text-sm">Delivery Method</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setPickup(true)} className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${pickup ? 'bg-[#057A42] text-white border-[#057A42] shadow-md' : 'bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600'}`}>Pickup</button>
                  <button onClick={() => setPickup(false)} className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${!pickup ? 'bg-[#057A42] text-white border-[#057A42] shadow-md' : 'bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600'}`}>Delivery</button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-4 h-4 text-[#057A42]" />
                  <span className="font-bold text-gray-900 dark:text-white text-sm">Payment</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map(pm => (
                    <button key={pm.id} onClick={() => setSelectedPayment(pm.id)}
                      className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-xs font-bold transition-all ${selectedPayment === pm.id ? 'ring-2 ring-[#057A42] border-[#057A42] ' + pm.color : pm.color + ' opacity-70 hover:opacity-100'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{pm.icon}</span>
                        <span className={selectedPayment === pm.id ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-slate-300'}>{pm.name}</span>
                      </div>
                      {pm.id === 'wallet' && walletBalance !== null && (
                        <span className={`text-[10px] mt-1 font-semibold ${walletBalance < total ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-slate-400'}`}>
                          Số dư: {walletBalance.toLocaleString()}đ
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {isBalanceInsufficient && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold leading-relaxed">
                    ⚠ Số dư ví FRESH không đủ để thực hiện thanh toán này. Vui lòng nạp thêm tiền hoặc chọn phương thức thanh toán khác.
                  </div>
                )}
              </div>

              <motion.button whileHover={isBalanceInsufficient ? {} : { scale: 1.02 }} whileTap={isBalanceInsufficient ? {} : { scale: 0.98 }} onClick={handlePlaceOrder} disabled={ordering || isBalanceInsufficient}
                className={`w-full text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-sm ${isBalanceInsufficient ? 'bg-gray-400 dark:bg-slate-700 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-[#057A42] to-emerald-600 shadow-[#057A42]/30 disabled:opacity-50'}`}
              >
                {ordering ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <ShoppingBag className="w-5 h-5" />
                )}
                {ordering ? 'Processing...' : isBalanceInsufficient ? 'Số dư không đủ' : `Place Order - ${total.toLocaleString()}đ`}
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
