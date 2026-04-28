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
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-lg md:rounded-3xl p-2 md:p-6 border border-white/10 shadow-2xl group hover:bg-white/[0.05] transition-all duration-300">
      <div className="flex flex-row justify-between items-start gap-2 mb-1.5 md:mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <h3 className="text-[12px] md:text-lg font-bold text-white tracking-tight truncate">#{order.id}</h3>
            {parsedAddress?.full_name && (
              <span className="px-1 py-0.5 rounded bg-white/5 text-[6px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest border border-white/5 truncate max-w-[50px] md:max-w-none">
                {parsedAddress.full_name}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-[7px] md:text-[10px] font-medium uppercase tracking-widest">
            {order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(order.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <span className={`flex-shrink-0 px-1 md:px-3 py-0.5 md:py-1 rounded-full text-[6px] md:text-[9px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="space-y-1 md:space-y-4 mb-1.5 md:mb-6">
        <div className="flex flex-col gap-1">
          <ul className="space-y-0.5 md:space-y-2">
            {order.items.map((item, index) => (
              <li key={index} className="flex justify-between items-center group/item">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="w-3 h-3 md:w-5 md:h-5 rounded bg-white/5 flex items-center justify-center text-[7px] md:text-[9px] font-bold text-orange-500 border border-white/5 flex-shrink-0">
                    {item.quantity}
                  </span>
                  <span className="text-[10px] md:text-sm text-gray-300 font-medium group-hover/item:text-white transition-colors line-clamp-1">
                    {item.name}
                  </span>
                </div>
                <span className="text-[10px] md:text-sm font-bold text-white ml-2 flex-shrink-0">₹{(item.price || item.price_at_purchase) * item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-row justify-between items-center gap-2 pt-1.5 md:pt-6 border-t border-white/10">
        <div className="flex items-baseline gap-1">
          <span className="text-sm md:text-2xl font-black text-white tracking-tighter">₹{order.total}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          {isVendor ? (
            <div className="flex gap-1 md:gap-2">
              {order.status === "PLACED" && (
                <>
                  <button
                    onClick={() => onAccept(order.id)}
                    disabled={disabled}
                    className="px-2 md:px-6 py-1 md:py-3 rounded-md md:rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-[9px] md:text-sm shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onReject(order.id)}
                    disabled={disabled}
                    className="px-2 md:px-6 py-1 md:py-3 rounded-md md:rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50 text-gray-400 font-bold text-[9px] md:text-sm border border-white/10 transition-all active:scale-95"
                  >
                    Reject
                  </button>
                </>
              )}
              {order.status === "ACCEPTED" && (
                <button
                  onClick={() => onAssignDelivery(order.id)}
                  disabled={disabled}
                  className="px-2 md:px-8 py-1 md:py-3 rounded-md md:rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-[9px] md:text-sm shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                >
                  Assign
                </button>
              )}
            </div>
          ) : (
            <Link
              to={`/tracking/${order.id}`}
              className="px-3 md:px-8 py-1 md:py-3 rounded-md md:rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-[9px] md:text-sm border border-white/10 transition-all active:scale-95 text-center flex items-center justify-center gap-1 group/track"
            >
              Track
              <div className="w-0.5 h-0.5 rounded-full bg-orange-500 animate-pulse group-hover/track:scale-125 transition-transform" />
            </Link>
          )}
        </div>
      </div>
      {order.rejection_reason && (
        <div className="mt-1.5 md:mt-6 p-2 md:p-4 rounded-lg md:rounded-2xl bg-red-500/10 border border-red-500/20">
          <span className="text-[6px] md:text-[10px] font-black text-red-500 uppercase tracking-widest block mb-0.5">Rejection</span>
          <p className="text-[9px] md:text-sm text-red-400 font-medium italic line-clamp-1">"{order.rejection_reason}"</p>
        </div>
      )}
      {order.special_instructions && (
        <div className="mt-1.5 md:mt-6 pt-1.5 md:pt-6 border-t border-white/5">
          <span className="text-[6px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-0.5 md:mb-2">Instructions</span>
          <p className="text-[9px] md:text-sm text-gray-400 font-medium italic leading-tight line-clamp-1">"{order.special_instructions}"</p>
        </div>
      )}
    </div>
  );
};
