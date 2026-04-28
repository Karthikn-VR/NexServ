import { Plus } from "lucide-react";
import ClickSpark from "@/components/Effects/ClickSpark";

export const MenuItemCard = ({ item, onAddToCart }) => {
  const handleImageError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";
  };

  const imageUrl = (item.image_url || item.image || "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop");
  const finalImageUrl = imageUrl.startsWith('/static') 
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${imageUrl}` 
    : imageUrl;

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 flex flex-col h-full group">
      <div className="h-48 md:h-52 overflow-hidden flex-shrink-0 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0806] to-transparent opacity-60 z-10" />
        <img
          src={finalImageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={handleImageError}
        />
        <div className="absolute top-3 md:top-4 right-3 md:right-4 z-20">
          <span className="bg-orange-500 text-white text-[9px] md:text-[10px] font-bold px-2.5 md:px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-orange-500/20">
            {item.category}
          </span>
        </div>
      </div>
      <div className="p-4 md:p-5 flex flex-col flex-grow bg-white/[0.02] backdrop-blur-sm">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-orange-500 transition-colors duration-300 line-clamp-1">{item.name}</h3>
          <p className="text-gray-400 text-xs md:text-sm mt-1.5 md:mt-2 line-clamp-2 leading-relaxed font-light">
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 md:pt-6">
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest">Price</span>
            <span className="text-xl md:text-2xl font-black text-white">₹{item.price}</span>
          </div>
          <ClickSpark 
            sparkColor="#FFA500" 
            sparkCount={8} 
            sparkRadius={15} 
            duration={400}
            style={{ width: 'auto', height: 'auto' }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(item);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-90 group/btn"
            >
              <Plus className="h-5 w-5 md:h-6 md:w-6 group-hover/btn:rotate-90 transition-transform duration-300" />
            </button>
          </ClickSpark>
        </div>
      </div>
    </div>
  );
};
