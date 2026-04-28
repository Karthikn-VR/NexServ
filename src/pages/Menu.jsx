import { useState, useEffect } from "react";
import { Search, Plus, X, Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { MenuItemCard } from "../components/MenuItemCard";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { menuAPI } from "../services/api/menu";

const categories = ["All", "Beef", "Chicken", "Vegetarian", "Dessert", "Seafood", "Beverages", "Snacks"];

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

export const Menu = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDish, setNewDish] = useState({
    name: "",
    description: "",
    price: "",
    category: "Chicken",
    image_url: "",
    available_today: true
  });
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file");
      return;
    }

    try {
      setIsUploading(true);
      const response = await menuAPI.uploadImage(file);
      setNewDish(prev => ({ ...prev, image_url: response.url }));
    } catch (err) {
      console.error("Failed to upload image:", err);
      alert(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleImageUpload(e);
  };

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);

      const dishes = await menuAPI.getMenu();
      const apiItems = (dishes || []).map((dish) => ({
        id: dish.id,
        name: dish.name,
        description: dish.description || "Freshly prepared dish",
        price: dish.price,
        category: dish.category || "All",
        image_url: dish.image_url,
      }));
      setMenuItems([...apiItems, ...addonItems]);
    } catch (err) {
      console.error("Failed to fetch menu:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleAddDish = async (e) => {
    e.preventDefault();
    try {
      setIsAdding(true);
      await menuAPI.createDish({
        ...newDish,
        price: parseFloat(newDish.price)
      });
      setShowAddModal(false);
      setNewDish({
        name: "",
        description: "",
        price: "",
        category: "Chicken",
        image_url: "",
        available_today: true
      });
      fetchMenu();
    } catch (err) {
      console.error("Failed to add dish:", err);
      alert(err.message || "Failed to add dish");
    } finally {
      setIsAdding(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0806] flex items-center justify-center py-8 px-4">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 font-medium tracking-widest uppercase text-xs">Preparing the Menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0806] text-white py-3 md:py-8 px-3 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* background blobs */}
      <div className="pointer-events-none absolute -left-40 top-20 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.02] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:32px_32px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-4 md:mb-10">
          {user && (
            <div className="mb-3 md:mb-6 animate-in fade-in slide-in-from-left duration-700">
              <span className="inline-block px-2.5 py-0.5 md:px-4 md:py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1 md:mb-3">
                Logged in as {user.role || 'Customer'}
              </span>
              <h2 className="text-lg md:text-3xl font-black tracking-tight flex items-center gap-1.5 md:gap-3 flex-wrap">
                <span className="text-gray-400 font-medium font-serif italic">Welcome,</span>
                <span className="text-white font-black bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent uppercase tracking-tighter">
                  {user.name || user.email?.split('@')[0]}
                </span>
              </h2>
            </div>
          )}
          <p className="text-orange-500 font-medium tracking-wider uppercase text-[8px] md:text-sm mb-0.5 md:mb-3">Our Collection</p>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6">
            <div>
              <h1 className="text-xl md:text-4xl font-extrabold text-white tracking-tight">Today's <span className="text-orange-500">Menu</span></h1>
              <p className="text-gray-400 mt-0.5 md:mt-4 max-w-2xl text-[10px] md:text-lg leading-relaxed">
                Freshly prepared meals delivered to your door with love and precision.
              </p>
            </div>
            {user?.role === 'vendor' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 md:py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg md:rounded-2xl font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-95 w-full md:w-auto text-xs md:text-base"
              >
                <Plus className="w-3.5 h-3.5 md:w-5 md:h-5" />
                Add New Dish
              </button>
            )}
          </div>
          {error && (
            <div className="mt-3 md:mt-6 p-2 md:p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] md:text-sm inline-block">
              Error loading menu. Please refresh the page.
            </div>
          )}
        </div>

        <div className="mb-4 md:mb-10 space-y-2 md:space-y-6">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 h-3.5 w-3.5" />
            <input
              type="text"
              placeholder="Search food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none text-white placeholder-gray-500 transition-all text-xs"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-2.5 py-1 rounded-full font-semibold whitespace-nowrap transition-all duration-300 text-[10px] md:text-base ${selectedCategory === category
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25 scale-105"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
          {filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} onAddToCart={addToCart} />
          ))}
        </div>
      </div>

      {/* Add Dish Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isAdding && setShowAddModal(false)}
          />
          <div className="relative w-full max-w-xl max-h-[90vh] bg-[#0d0b09] border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300 mx-4 md:mx-0">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5 flex-shrink-0">
              <h2 className="text-lg md:text-xl font-bold">Add New Dish</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 md:p-2 hover:bg-white/5 rounded-full transition-colors"
                disabled={isAdding}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form id="add-dish-form" onSubmit={handleAddDish} className="p-4 md:p-6 space-y-3 md:space-y-4 overflow-y-auto flex-grow custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Dish Name</label>
                  <input
                    required
                    type="text"
                    value={newDish.name}
                    onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all text-sm md:text-base placeholder:text-gray-600"
                    placeholder="e.g. Spicy Grilled Chicken"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label>
                  <input
                    required
                    type="number"
                    value={newDish.price}
                    onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all text-sm md:text-base placeholder:text-gray-600"
                    placeholder="e.g. 299"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
                <div className="relative">
                  <select
                    value={newDish.category}
                    onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all appearance-none text-sm md:text-base"
                  >
                    {categories.filter(c => c !== "All").map(cat => (
                      <option key={cat} value={cat} className="bg-[#0d0b09]">{cat}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  value={newDish.description}
                  onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all text-sm md:text-base placeholder:text-gray-600 resize-none"
                  rows={2}
                  placeholder="Tell us about this dish..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Dish Image</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* File Upload */}
                  <div className="relative group/upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="image-upload"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex flex-col items-center justify-center h-24 md:h-32 bg-white/5 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                        isDragging 
                          ? 'border-orange-500 bg-orange-500/10' 
                          : 'border-white/10 hover:border-orange-500/50 hover:bg-white/[0.07]'
                      } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isUploading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                      ) : (
                        <>
                          <Upload className={`w-5 h-5 mb-1 transition-colors ${isDragging ? 'text-orange-500' : 'text-gray-500'}`} />
                          <span className="text-[10px] font-bold text-gray-400">Upload Image</span>
                        </>
                      )}
                    </label>
                  </div>

                  {/* URL Input */}
                  <div className="flex flex-col justify-center gap-2">
                    <div className="relative group/url">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={newDish.image_url}
                        onChange={(e) => setNewDish({ ...newDish, image_url: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all text-xs md:text-sm placeholder:text-gray-600"
                        placeholder="Or paste image URL..."
                      />
                    </div>
                  </div>
                </div>

                {newDish.image_url && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group mt-2">
                    <img 
                      src={newDish.image_url.startsWith('/static') ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${newDish.image_url}` : newDish.image_url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setNewDish({ ...newDish, image_url: "" })}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>

            <div className="p-4 md:p-6 border-t border-white/5 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-3.5 border border-white/10 rounded-xl md:rounded-2xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all order-2 sm:order-1"
                disabled={isAdding}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-dish-form"
                className="flex-1 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl md:rounded-2xl font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 order-1 sm:order-2 flex items-center justify-center gap-2"
                disabled={isAdding || !newDish.name || !newDish.price}
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : "Add Dish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
