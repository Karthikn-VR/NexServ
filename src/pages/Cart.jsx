import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Coffee, Cookie, Plus } from "lucide-react";
import { CartItem } from "../components/CartItem";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";

const addonItems = [
  {
    id: 1001,
    name: 'Classic Coca-Cola',
    description: 'Chilled 330ml can',
    price: 45,
    category: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop'
  },
  {
    id: 1002,
    name: 'Fresh Orange Juice',
    description: '100% freshly squeezed',
    price: 85,
    category: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=300&fit=crop'
  },
  {
    id: 1003,
    name: 'Buttered Popcorn',
    description: 'Large bucket of theater-style popcorn',
    price: 120,
    category: 'Snacks',
    image_url: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&h=300&fit=crop'
  },
  {
    id: 1004,
    name: 'Salted Nachos',
    description: 'Crispy nachos with cheese dip',
    price: 150,
    category: 'Snacks',
    image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop'
  },
  {
    id: 1005,
    name: 'Iced Lemon Tea',
    description: 'Refreshing homemade lemon tea',
    price: 65,
    category: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop'
  },
  {
    id: 1006,
    name: 'Mixed Nuts',
    description: 'Premium roasted and salted nuts',
    price: 95,
    category: 'Snacks',
    image_url: 'https://images.unsplash.com/photo-1591894902162-433e4334f52d?w=400&h=300&fit=crop'
  },
  {
    id: 1007,
    name: 'Sparkling Water',
    description: 'Pure sparkling mineral water',
    price: 55,
    category: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1551731589-cee040cd069b?w=400&h=300&fit=crop'
  },
  {
    id: 1008,
    name: 'Mango Smoothie',
    description: 'Creamy fresh mango blend',
    price: 110,
    category: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1553530666-ca08229a7b44?w=400&h=300&fit=crop'
  },
  {
    id: 1009,
    name: 'Potato Chips',
    description: 'Classic salted crispy chips',
    price: 60,
    category: 'Snacks',
    image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=300&fit=crop'
  },
  {
    id: 1010,
    name: 'Chocolate Brownie',
    description: 'Warm fudge chocolate brownie',
    price: 130,
    category: 'Snacks',
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop'
  }
];

export const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, subtotal, extraCharges, total, addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    full_name: '',
    phone_number: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  });
  const [cookingInstructions, setCookingInstructions] = useState('');
  const [error, setError] = useState(null);

  const handleImageError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";
  };

  const handleCheckout = async () => {
    // validate required address fields - making address_line_1 optional as requested
    if (!address.city || !address.full_name || !address.phone_number) {
      setError("Please fill in your name, phone, and city");
      return;
    }

    if (!user) {
      setError("Please login first");
      return;
    }

    setError(null);
    navigate("/payment", {
      state: {
        address,
        subtotal,
        extraCharges,
        total,
        cooking_instructions: cookingInstructions,
      },
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0806] text-white flex items-center justify-center py-8 px-4 relative overflow-hidden">
        {/* background blobs */}
        <div className="pointer-events-none absolute -left-40 top-20 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[140px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[140px]" />
        
        <div className="text-center relative z-10">
          <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-2xl">
            <ShoppingCart className="h-12 w-12 text-gray-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Your cart is empty</h2>
          <p className="text-gray-400 mb-10 max-w-sm mx-auto text-lg">Looks like you haven't added anything to your cart yet.</p>
          <Link
            to="/menu"
            className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-95"
          >
            Start Ordering
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0806] text-white py-4 md:py-10 px-2 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* background blobs */}
      <div className="pointer-events-none absolute -left-40 top-20 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.01] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-8 relative z-10">
        
        {/* Left Side: Beverages Add-ons */}
        <div className="lg:col-span-3 order-2 lg:order-1 space-y-3 md:space-y-6">
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-6 border border-white/10 shadow-xl">
            <div className="flex items-center space-x-2 mb-3 md:mb-6">
              <div className="w-7 h-7 bg-orange-500/20 rounded-md flex items-center justify-center">
                <Coffee className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <h2 className="text-sm md:text-base font-extrabold text-white tracking-tight">Add Beverages</h2>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {addonItems.filter(i => i.category === 'Beverages').slice(0, 3).map(item => (
                  <div key={item.id} className="group relative flex flex-row items-center gap-2 p-1.5 rounded-lg border border-white/5 hover:border-orange-500/30 transition-all duration-300 bg-white/5 h-[60px]">
                    <div className="h-10 w-10 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        onError={handleImageError}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[10px] md:text-xs font-bold text-white line-clamp-1 group-hover:text-orange-500 transition-colors">{item.name}</h3>
                      <p className="text-orange-500 font-black text-[9px] md:text-xs mt-0">₹{item.price}</p>
                    </div>
                    <button 
                      onClick={() => addToCart(item)}
                      className="w-7 h-7 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-all flex items-center justify-center active:scale-90"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
              ))}
            </div>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-6 border border-white/10 shadow-xl">
            <div className="flex items-center space-x-2 mb-3 md:mb-6">
              <div className="w-7 h-7 bg-orange-500/20 rounded-md flex items-center justify-center">
                <Cookie className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <h2 className="text-sm md:text-base font-extrabold text-white tracking-tight">Add Snacks</h2>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {addonItems.filter(i => i.category === 'Snacks').slice(0, 3).map(item => (
                  <div key={item.id} className="group relative flex flex-row items-center gap-2 p-1.5 rounded-lg border border-white/5 hover:border-orange-500/30 transition-all duration-300 bg-white/5 h-[60px]">
                    <div className="h-10 w-10 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        onError={handleImageError}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[10px] md:text-xs font-bold text-white line-clamp-1 group-hover:text-orange-500 transition-colors">{item.name}</h3>
                      <p className="text-orange-500 font-black text-[9px] md:text-xs mt-0">₹{item.price}</p>
                    </div>
                    <button 
                      onClick={() => addToCart(item)}
                      className="w-7 h-7 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-all flex items-center justify-center active:scale-90"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Side: Cart Content */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-3 md:space-y-6">
          <div className="flex flex-row items-end justify-between gap-3 mb-1">
            <div>
              <p className="text-orange-500 font-medium tracking-wider uppercase text-[8px] md:text-xs mb-0">Your Order</p>
              <h1 className="text-lg md:text-3xl font-black text-white tracking-tight">Review <span className="text-orange-500">Cart</span></h1>
            </div>
            <p className="text-gray-500 text-[9px] md:text-sm font-medium">{cartItems.length} items</p>
          </div>
          
          <div className="space-y-1.5 md:space-y-3">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          <div className="bg-white/[0.02] backdrop-blur-xl rounded-xl md:rounded-2xl shadow-xl p-3 md:p-6 space-y-3 md:space-y-6 border border-white/10">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-orange-500/20 rounded-md flex items-center justify-center">
                <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4 text-orange-500" />
              </div>
              <h2 className="text-base md:text-xl font-black text-white tracking-tight">Delivery Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
              <div className="space-y-0.5 md:space-y-1">
                <label className="block text-[7px] md:text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-0.5">Full name</label>
                <input
                  value={address.full_name}
                  onChange={(e) => setAddress({ ...address, full_name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 md:px-4 md:py-3 bg-white/5 border border-white/10 rounded-lg md:rounded-xl focus:ring-1 focus:ring-orange-500/50 outline-none text-white placeholder-gray-600 transition-all text-[11px] md:text-sm"
                />
              </div>
              <div className="space-y-0.5 md:space-y-1">
                <label className="block text-[7px] md:text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-0.5">Phone number</label>
                <input
                  value={address.phone_number}
                  onChange={(e) => setAddress({ ...address, phone_number: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 md:px-4 md:py-3 bg-white/5 border border-white/10 rounded-lg md:rounded-xl focus:ring-1 focus:ring-orange-500/50 outline-none text-white placeholder-gray-600 transition-all text-[11px] md:text-sm"
                />
              </div>
            </div>

            <div className="space-y-0.5 md:space-y-1">
              <label className="block text-[7px] md:text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-0.5">City</label>
              <input
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                placeholder="Enter your city"
                className="w-full px-3 py-2 md:px-4 md:py-3 bg-white/5 border border-white/10 rounded-lg md:rounded-xl focus:ring-1 focus:ring-orange-500/50 outline-none text-white placeholder-gray-600 transition-all text-[11px] md:text-sm"
              />
            </div>

            <div className="space-y-0.5 md:space-y-1">
              <label className="block text-[7px] md:text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-0.5">Cooking Instructions</label>
              <textarea
                value={cookingInstructions}
                onChange={(e) => setCookingInstructions(e.target.value)}
                placeholder="Any special requests?"
                className="w-full px-3 py-2 md:px-4 md:py-3 bg-white/5 border border-white/10 rounded-lg md:rounded-xl focus:ring-1 focus:ring-orange-500/50 outline-none text-white placeholder-gray-600 transition-all resize-none h-14 md:h-20 text-[11px] md:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-3 order-3 space-y-3 md:space-y-6">
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl lg:sticky lg:top-24">
            <h2 className="text-base md:text-lg font-extrabold text-white mb-4 md:mb-6 tracking-tight">Order Summary</h2>
            <div className="space-y-2 md:space-y-3 text-[11px] md:text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white font-bold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Charges</span>
                <span className="text-white font-bold">₹{extraCharges.total}</span>
              </div>
              <div className="pt-3 md:pt-4 mt-3 md:mt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-sm font-bold text-white">Total</span>
                <span className="text-lg md:text-xl font-black text-orange-500">₹{total}</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] leading-relaxed">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 md:py-4 rounded-lg md:rounded-xl mt-4 md:mt-6 shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              <span className="text-sm md:text-base">Checkout</span>
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
            </button>
            
            <p className="text-[8px] text-gray-500 text-center mt-4 uppercase tracking-widest">
              NexServe Secure Payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
