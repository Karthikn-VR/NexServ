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
      <div className="w-full max-h-[250px] md:max-h-[400px] overflow-hidden flex-shrink-0 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0806] to-transparent opacity-60 z-10" />
        <img
          src={finalImageUrl}
          alt={item.name}
          className="w-full h-auto min-h-[200px] md:min-h-[300px] object-cover group-hover:scale-110 transition-transform duration-700"
          onError={handleImageError}
        />
        <div className="absolute top-3 md:top-4 right-3 md:right-4 z-20">
          <span className="bg-orange-500 text-white text-[8px] md:text-[10px] font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase tracking-wider shadow-lg shadow-orange-500/20">
            {item.category}
          </span>
        </div>
      </div>
      <div className="p-3 sm:p-5 flex flex-col flex-grow bg-white/[0.02] backdrop-blur-sm">
        <div>
          <h3 className="text-sm md:text-xl font-bold text-white group-hover:text-orange-500 transition-colors duration-300 line-clamp-1">{item.name}</h3>
          <p className="text-gray-400 text-[10px] md:text-sm mt-1 md:mt-2 line-clamp-2 leading-relaxed font-light">
            {item.description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto pt-2 md:pt-6 gap-4">
          <div className="flex flex-row sm:flex-col justify-between items-center sm:items-start w-full sm:w-auto">
            <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest">Price</span>
            <span className="text-xl md:text-2xl font-black text-white">₹{item.price}</span>
          </div>
          <ClickSpark 
            sparkColor="#FFA500" 
            sparkCount={8} 
            sparkRadius={15} 
            duration={400}
            style={{ width: '100%', height: 'auto' }}
            className="w-full sm:w-auto"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(item);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-12 h-12 rounded-xl md:rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-90 group/btn"
            >
              <Plus className="h-6 w-6 group-hover/btn:rotate-90 transition-transform duration-300" />
            </button>
          </ClickSpark>
        </div>
      </div>
    </div>
  );
};
