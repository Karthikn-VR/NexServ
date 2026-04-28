import { Minus, Plus, Trash2 } from "lucide-react";

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const handleImageError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/10 p-3 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-white/[0.05] transition-all duration-300">
      <div className="flex items-center space-x-4 md:space-x-5 w-full sm:w-auto">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg md:rounded-2xl overflow-hidden border border-white/5 relative flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
          <img
            src={item.image_url || item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={handleImageError}
          />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-white text-base md:text-lg tracking-tight group-hover:text-orange-500 transition-colors line-clamp-1">{item.name}</h4>
          <p className="text-orange-500 font-black mt-1">₹{item.price}</p>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end space-x-4 md:space-x-6 w-full sm:w-auto pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0">
        <div className="flex items-center bg-black/20 rounded-lg md:rounded-xl p-1 border border-white/5">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="w-8 h-8 md:w-9 md:h-9 bg-white/5 text-white rounded-md md:rounded-lg hover:bg-white/10 transition-all flex items-center justify-center active:scale-90"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 md:w-10 text-center font-black text-white text-sm md:text-base">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="w-8 h-8 md:w-9 md:h-9 bg-orange-500 text-white rounded-md md:rounded-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center active:scale-90"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="text-gray-500 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg md:rounded-xl transition-all duration-300 active:scale-90"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
