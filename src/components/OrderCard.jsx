import { Link } from "react-router-dom";
import { useMemo } from "react";

export const OrderCard = ({
  order,
  onAccept,
  onReject,
  onOutOfStock,
  onAssignDelivery,
  isVendor = false,
  disabled = false,
}) => {
  const parsedAddress = useMemo(() => {
    if (!order.address) return null;
    if (typeof order.address === 'object') return order.address;
    try {
      return JSON.parse(order.address);
    } catch (e) {
      return null;
    }
  }, [order.address]);

  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "PREPARING":
      case "ACCEPTED":
      case "APPROVED":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "ON_THE_WAY":
      case "ASSIGNED":
      case "OUT_FOR_DELIVERY":
      case "IN_TRANSIT":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "REJECTED":
      case "OUT_OF_STOCK":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-white/5 text-gray-400 border-white/10";
    }
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl md:rounded-3xl p-5 md:p-8 border border-white/10 shadow-2xl group hover:bg-white/[0.05] transition-all duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">Order #{order.id}</h3>
            {parsedAddress?.full_name && (
              <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-white/5 truncate max-w-[120px] md:max-w-none">
                {parsedAddress.full_name}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-[10px] md:text-xs font-medium uppercase tracking-widest">
            {order.created_at ? new Date(order.created_at).toLocaleString() : new Date(order.date || Date.now()).toLocaleString()}
          </p>
        </div>
        <span className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
        <div>
          <h4 className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2">
            Items 
            <span className="w-1 h-1 rounded-full bg-orange-500" />
          </h4>
          <ul className="space-y-2 md:space-y-3">
            {order.items.map((item, index) => (
              <li key={index} className="flex justify-between items-center group/item">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-white/5 flex items-center justify-center text-[9px] md:text-[10px] font-bold text-orange-500 border border-white/5 flex-shrink-0">
                    {item.quantity}
                  </span>
                  <span className="text-xs md:text-sm text-gray-300 font-medium group-hover/item:text-white transition-colors line-clamp-1">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs md:text-sm font-bold text-white ml-2">₹{(item.price || item.price_at_purchase) * item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:gap-6 pt-6 md:pt-8 border-t border-white/10">
        <div>
          <p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Final Amount</p>
          <span className="text-2xl md:text-3xl font-black text-white tracking-tighter">₹{order.total}</span>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isVendor ? (
            <div className="flex gap-2 w-full sm:w-auto">
              {order.status === "PLACED" && (
                <>
                  <button
                    onClick={() => onAccept(order.id)}
                    disabled={disabled}
                    className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs md:text-sm shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onReject(order.id)}
                    disabled={disabled}
                    className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50 text-gray-400 font-bold text-xs md:text-sm border border-white/10 transition-all active:scale-95"
                  >
                    Reject
                  </button>
                </>
              )}
              {order.status === "ACCEPTED" && (
                <button
                  onClick={() => onAssignDelivery(order.id)}
                  disabled={disabled}
                  className="w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs md:text-sm shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                >
                  Assign Delivery
                </button>
              )}
            </div>
          ) : (
            <Link
              to={`/tracking/${order.id}`}
              className="w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs md:text-sm border border-white/10 transition-all active:scale-95 text-center flex items-center justify-center gap-2 group/track"
            >
              Track Order
              <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-orange-500 animate-pulse group-hover/track:scale-125 transition-transform" />
            </Link>
          )}
        </div>
      </div>
      {order.rejection_reason && (
        <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-1">Rejection Reason</span>
          <p className="text-sm text-red-400 font-medium italic">"{order.rejection_reason}"</p>
        </div>
      )}
      {order.special_instructions && (
        <div className="mt-6 pt-6 border-t border-white/5">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Special Instructions</span>
          <p className="text-sm text-gray-400 font-medium italic leading-relaxed">"{order.special_instructions}"</p>
        </div>
      )}
      {(order.cooking_instructions || order.delivery_instructions) && (
        <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
          {order.cooking_instructions && (
            <div>
              <span className="text-[10px] font-black text-orange-500/60 uppercase tracking-widest block mb-1">Chef Instructions</span>
              <p className="text-sm text-gray-400 font-medium italic">"{order.cooking_instructions}"</p>
            </div>
          )}
          {order.delivery_instructions && (
            <div>
              <span className="text-[10px] font-black text-blue-500/60 uppercase tracking-widest block mb-1">Driver Instructions</span>
              <p className="text-sm text-gray-400 font-medium italic">"{order.delivery_instructions}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
