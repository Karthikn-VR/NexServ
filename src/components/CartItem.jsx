import { Minus, Plus, Trash2 } from "lucide-react";

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const handleImageError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-lg md:rounded-xl border border-white/10 p-1.5 md:p-3 flex flex-row items-center justify-between gap-2 group hover:bg-white/[0.05] transition-all duration-300 h-[64px] md:h-auto">
      <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
        <div className="w-10 h-10 md:w-16 md:h-16 rounded-md md:rounded-lg overflow-hidden border border-white/5 relative flex-shrink-0">
          <img
            src={item.image_url || item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={handleImageError}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white text-xs md:text-base tracking-tight group-hover:text-orange-500 transition-colors line-clamp-1">{item.name}</h4>
          <p className="text-orange-500 font-black text-[10px] md:text-sm mt-0">₹{item.price}</p>
        </div>
      </div>
      <div className="flex items-center space-x-1 md:space-x-3 flex-shrink-0">
        <div className="flex items-center bg-black/20 rounded-md p-0.5 border border-white/5">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="w-6 h-6 md:w-8 md:h-8 bg-white/5 text-white rounded-md hover:bg-white/10 transition-all flex items-center justify-center active:scale-90"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-5 md:w-8 text-center font-black text-white text-[10px] md:text-sm">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="w-6 h-6 md:w-8 md:h-8 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center active:scale-90"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="text-gray-500 hover:text-red-500 p-1 md:p-1.5 hover:bg-red-500/10 rounded-md transition-all duration-300 active:scale-90"
        >
          <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </button>
      </div>
    </div>
  );
};
