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
    <div className="bg-white/[0.03] border border-white/10 rounded-xl md:rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 flex flex-row md:flex-col h-[100px] md:h-auto group relative">
      <div className="w-[80px] h-[80px] m-2.5 md:m-0 md:w-full md:h-auto md:max-h-[250px] overflow-hidden flex-shrink-0 relative rounded-lg md:rounded-none">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0806] to-transparent opacity-40 md:opacity-60 z-10" />
        <img
          src={finalImageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={handleImageError}
        />
        <div className="hidden md:block absolute top-4 right-4 z-20">
          <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-orange-500/20">
            {item.category}
          </span>
        </div>
      </div>
      <div className="p-2.5 md:p-5 flex flex-col flex-grow bg-white/[0.02] backdrop-blur-sm justify-center md:justify-start min-w-0">
        <div className="pr-12 md:pr-0">
          <div className="flex items-center gap-1.5 mb-0.5 md:hidden">
            <span className="bg-orange-500/20 text-orange-500 text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-orange-500/20">
              {item.category}
            </span>
          </div>
          <h3 className="text-sm md:text-xl font-bold text-white group-hover:text-orange-500 transition-colors duration-300 line-clamp-1">{item.name}</h3>
          <p className="text-gray-400 text-[10px] md:text-sm mt-0.5 md:mt-2 line-clamp-1 md:line-clamp-2 leading-relaxed font-light">
            {item.description}
          </p>
        </div>

        <div className="flex flex-row md:flex-col justify-between items-center md:items-start mt-1 md:mt-auto md:pt-6">
          <div className="flex flex-row items-center gap-2 md:flex-col md:items-start md:gap-0">
            <span className="hidden md:block text-[10px] md:text-xs text-gray-500 uppercase tracking-widest">Price</span>
            <span className="text-sm md:text-2xl font-black text-white">₹{item.price}</span>
          </div>
          
          <div className="absolute right-2.5 bottom-1/2 translate-y-1/2 md:relative md:right-0 md:bottom-0 md:translate-y-0 md:w-full md:mt-4">
            <ClickSpark 
              sparkColor="#FFA500" 
              sparkCount={6} 
              sparkRadius={10} 
              duration={400}
              className="w-auto md:w-full"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(item);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white w-8 h-8 md:w-full md:h-12 rounded-lg md:rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-90 group/btn"
              >
                <Plus className="h-4 w-4 md:h-6 md:w-6 group-hover/btn:rotate-90 transition-transform duration-300" />
                <span className="hidden md:block ml-2 font-bold text-sm">Add</span>
              </button>
            </ClickSpark>
          </div>
        </div>
      </div>
    </div>
  );
};
