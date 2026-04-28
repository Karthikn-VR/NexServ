import { Plus } from "lucide-react";

export const MenuItemCard = ({ item, onAddToCart }) => {
  const handleImageError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";
  };

  const imageUrl = (item.image_url || item.image || "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop");
  const finalImageUrl = imageUrl.startsWith('/static') 
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${imageUrl}` 
    : imageUrl;

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 flex flex-row md:flex-col h-[90px] md:h-auto group relative">
      <div className="w-[70px] h-[70px] m-2 flex-shrink-0 overflow-hidden relative rounded-lg">
        <img
          src={finalImageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={handleImageError}
        />
      </div>
      <div className="p-2 flex flex-col flex-grow justify-center min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="inline-block md:hidden bg-orange-500/20 text-orange-500 text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-orange-500/20 mb-0.5">
              {item.category}
            </span>
            <h3 className="text-xs md:text-xl font-bold text-white group-hover:text-orange-500 transition-colors duration-300 line-clamp-1 truncate">{item.name}</h3>
            <p className="hidden md:block text-gray-400 text-[10px] md:text-sm mt-0.5 line-clamp-1 leading-relaxed font-light">
              {item.description}
            </p>
          </div>
          <div className="flex flex-col items-end justify-between h-full flex-shrink-0">
            <span className="hidden md:block text-[10px] text-gray-500 uppercase tracking-widest">Price</span>
            <span className="text-xs md:text-2xl font-black text-white">₹{item.price}</span>
          </div>
        </div>
        <div className="absolute right-2 bottom-2 md:relative md:right-0 md:bottom-0 md:mt-2 md:w-full">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(item);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white w-7 h-7 md:w-full md:h-10 rounded-lg md:rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-90"
          >
            <Plus className="h-3.5 w-3.5 md:h-5 md:w-5" />
            <span className="hidden md:block ml-1.5 font-bold text-xs">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
