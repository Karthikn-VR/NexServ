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
    <div className="min-h-screen bg-[#0a0806] text-white py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* background blobs */}
      <div className="pointer-events-none absolute -left-40 top-20 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.02] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:32px_32px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-10 md:mb-12">
          {user && (
            <div className="mb-6 animate-in fade-in slide-in-from-left duration-700">
              <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                Logged in as {user.role || 'Customer'}
              </span>
              <h2 className="text-2xl md:text-4xl font-black tracking-tight flex items-center gap-2 md:gap-3 flex-wrap">
                <span className="text-gray-400 font-medium font-serif italic">Welcome,</span>
                <span className="text-white font-black bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent uppercase tracking-tighter">
                  {user.name || user.email?.split('@')[0]}
                </span>
              </h2>
            </div>
          )}
          <p className="text-orange-500 font-medium tracking-wider uppercase text-xs md:text-sm mb-2 md:mb-3">Our Collection</p>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-responsive-h3 md:text-5xl font-extrabold text-white tracking-tight">Today's <span className="text-orange-500">Menu</span></h1>
              <p className="text-gray-400 mt-3 md:mt-4 max-w-2xl text-base md:text-lg">
                Freshly prepared meals delivered to your door with love and precision.
              </p>
            </div>
            {user?.role === 'vendor' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 md:py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl md:rounded-2xl font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-95 w-full md:w-auto"
              >
                <Plus className="w-5 h-5" />
                Add New Dish
              </button>
            )}
          </div>
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm inline-block">
              Error loading menu. Please refresh the page.
            </div>
          )}
        </div>

        <div className="mb-10 md:mb-12 space-y-4 md:space-y-6">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for your favorite food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 md:py-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none text-white placeholder-gray-500 transition-all text-sm md:text-base"
            />
          </div>
          <div className="flex space-x-2 md:space-x-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 md:px-6 md:py-2.5 rounded-full font-semibold whitespace-nowrap transition-all duration-300 text-sm md:text-base ${selectedCategory === category
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25 scale-105"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
          <div className="relative w-full max-w-xl max-h-[90vh] bg-[#0d0b09] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="flex items-center justify-between p-6 border-b border-white/5 flex-shrink-0">
              <h2 className="text-xl font-bold">Add New Dish</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                disabled={isAdding}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddDish} className="p-6 space-y-6 overflow-y-auto flex-grow custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dish Name</label>
                  <input
                    required
                    type="text"
                    value={newDish.name}
                    onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all"
                    placeholder="e.g. Spicy Grilled Chicken"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Price (₹)</label>
                  <input
                    required
                    type="number"
                    value={newDish.price}
                    onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all"
                    placeholder="e.g. 299"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
                <select
                  value={newDish.category}
                  onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all appearance-none"
                >
                  {categories.filter(c => c !== "All").map(cat => (
                    <option key={cat} value={cat} className="bg-[#0d0b09]">{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dish Image</label>
                  
                  <div className="space-y-4">
                    {/* File Upload / Drag & Drop */}
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
                        className={`flex flex-col items-center justify-center gap-3 px-4 py-10 bg-white/5 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${
                          isDragging 
                            ? 'border-orange-500 bg-orange-500/10 scale-[1.01]' 
                            : 'border-white/10 hover:border-orange-500/50 hover:bg-white/[0.07]'
                        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                            <p className="text-sm font-medium text-orange-500">Uploading...</p>
                          </div>
                        ) : (
                          <>
                            <div className={`p-4 rounded-2xl bg-white/5 transition-colors duration-300 ${isDragging ? 'bg-orange-500/20' : 'group-hover/upload:bg-orange-500/10'}`}>
                              <Upload className={`w-8 h-8 transition-all duration-300 ${isDragging ? 'scale-110 text-orange-500' : 'text-gray-400 group-hover/upload:text-orange-500'}`} />
                            </div>
                            <div className="text-center">
                              <p className="text-base font-bold text-white">
                                {isDragging ? 'Drop to upload' : 'Click or drag image to upload'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-medium">
                                PNG, JPG or WebP up to 5MB
                              </p>
                            </div>
                          </>
                        )}
                      </label>
                    </div>

                    <div className="relative flex items-center gap-4">
                      <div className="h-px flex-1 bg-white/10"></div>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">OR</span>
                      <div className="h-px flex-1 bg-white/10"></div>
                    </div>

                    {/* URL Input */}
                    <div className="relative group/url">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/5 text-gray-500 group-focus-within/url:text-orange-500 transition-colors">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={newDish.image_url}
                        onChange={(e) => setNewDish({ ...newDish, image_url: e.target.value })}
                        className="w-full pl-14 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all text-sm placeholder:text-gray-600"
                        placeholder="Paste an image URL from the web..."
                      />
                    </div>
                  </div>

                  {newDish.image_url && (
                    <div className="mt-4 animate-in fade-in zoom-in duration-300">
                      <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                        <img 
                          src={newDish.image_url.startsWith('/static') ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${newDish.image_url}` : newDish.image_url} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                          <span className="px-3 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Image Preview</span>
                          <button
                            type="button"
                            onClick={() => setNewDish({ ...newDish, image_url: "" })}
                            className="p-2 bg-red-500/20 backdrop-blur-md text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 border border-red-500/20"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
                <textarea
                  rows="3"
                  value={newDish.description}
                  onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all resize-none"
                  placeholder="Tell customers about your delicious dish..."
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3.5 border border-white/10 hover:bg-white/5 rounded-2xl font-bold transition-all"
                  disabled={isAdding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Create Dish'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
