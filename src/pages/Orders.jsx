import { useState, useEffect } from "react";
import { OrderCard } from "../components/OrderCard";
import { useAuth } from "../hooks/useAuth";
import { orderAPI } from "../services/api/order";

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await orderAPI.getOrders();
      const transformedOrders = (response.orders || []).map((order) => ({
        ...order,
        total: order.total ?? order.final_amount ?? 0,
        items: order.items || [],
      }));
      setOrders(transformedOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0806] flex items-center justify-center py-8 px-4">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 font-medium tracking-widest uppercase text-xs">Retrieving your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0806] py-16 md:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="pointer-events-none absolute -left-40 top-20 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-orange-500/15 rounded-full blur-[80px] md:blur-[140px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-green-500/10 rounded-full blur-[80px] md:blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:32px_32px]" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8 md:mb-12">
          <p className="text-orange-500 font-medium tracking-widest uppercase text-[10px] md:text-xs mb-2 md:mb-3">Order History</p>
          <h1 className="text-responsive-h2 font-extrabold text-white tracking-tight">Your <span className="text-orange-500">Orders</span></h1>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-8 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-xl">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-10 h-10 border-2 border-dashed border-gray-600 rounded-lg rotate-12" />
            </div>
            <p className="text-gray-400 text-lg font-medium">No orders found yet</p>
            <p className="text-gray-600 text-sm mt-2">Time to place your first order!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
