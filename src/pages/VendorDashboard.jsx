import { useState, useEffect } from "react";
import { OrderCard } from "../components/OrderCard";
import { orderAPI } from "../services/api/order";

export const VendorDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await orderAPI.getVendorOrders();
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
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    setActionLoading(orderId);
    setError(null);
    const targetOrder = orders.find(o => o.id === orderId);

    try {
      if (status === "ACCEPTED") await orderAPI.approveOrder(orderId);
      else if (status === "REJECTED") {
        const reason = window.prompt("Enter rejection reason for customer email:", "Rejected by vendor");
        if (!reason) {
          setActionLoading(null);
          return;
        }
        await orderAPI.rejectOrder(orderId, reason);
      }
      else if (status === "OUT_OF_STOCK") await orderAPI.outOfStock(orderId);
      else if (status === "ASSIGNED") {
        console.log("=== ASSIGNING DELIVERY FOR ORDER ===", targetOrder);
        await orderAPI.assignDelivery(orderId);
        if (targetOrder) {
          await orderAPI.assignExternal(targetOrder);
        }
      }
      fetchOrders();
    } catch (err) {
      console.error("Failed to update order:", err);
      setError(`Action failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = (orderId) => updateOrderStatus(orderId, "ACCEPTED");
  const handleReject = (orderId) => updateOrderStatus(orderId, "REJECTED");
  const handleOutOfStock = (orderId) => updateOrderStatus(orderId, "OUT_OF_STOCK");
  const handleAssignDelivery = (orderId) => updateOrderStatus(orderId, "ASSIGNED");

  // Filter and Sort Logic
  const filteredOrders = orders.filter(order => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "NEW") return order.status === "PLACED";
    if (statusFilter === "ACCEPTED") return order.status === "ACCEPTED";
    if (statusFilter === "ASSIGNED") return ["ASSIGNED", "IN_TRANSIT", "DELIVERED"].includes(order.status);
    if (statusFilter === "REJECTED") return ["REJECTED", "OUT_OF_STOCK"].includes(order.status);
    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    // Priority helper: Lower number = higher in the list
    const getPriority = (status) => {
      if (status === "PLACED") return 1;    // Newest
      if (status === "ACCEPTED") return 2;  // Unassigned
      return 3;                             // Assigned, Delivered, etc.
    };

    const priorityA = getPriority(a.status);
    const priorityB = getPriority(b.status);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // Within the same priority group, sort by ID descending (newer first)
    return b.id - a.id;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0806] flex items-center justify-center py-8 px-4">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 font-medium tracking-widest uppercase text-xs">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0806] pt-12 pb-4 md:py-20 px-2 sm:px-6 lg:px-8 relative overflow-hidden text-white">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-2 md:mb-10 gap-2 md:gap-8">
          <div>
            <p className="text-orange-500 font-black uppercase tracking-widest text-[6px] md:text-xs mb-0 md:mb-2">Management Console</p>
            <h1 className="text-sm md:text-3xl lg:text-4xl font-black tracking-tight">Vendor <span className="text-orange-500">Dashboard</span></h1>
            <p className="text-gray-400 mt-0 md:mt-2 text-[7px] md:text-base font-medium">Manage and track customer orders in real-time.</p>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex flex-wrap sm:flex-nowrap bg-white/[0.03] backdrop-blur-xl p-0.5 rounded-md md:rounded-xl border border-white/10 shadow-2xl min-w-0">
            {[
              { id: "ALL", label: "All" },
              { id: "NEW", label: "New" },
              { id: "ACCEPTED", label: "Accepted" },
              { id: "ASSIGNED", label: "Assigned" },
              { id: "REJECTED", label: "Rejected" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex-1 sm:flex-none px-1.5 sm:px-4 py-1 sm:py-2 text-[6px] sm:text-[10px] font-black uppercase tracking-widest rounded-sm md:rounded-lg transition-all duration-300 ${
                  statusFilter === tab.id
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25 scale-105"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-3 sm:p-6 rounded-xl sm:rounded-[32px] mb-6 md:mb-12 flex items-center gap-3">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-red-500/20 rounded-lg sm:rounded-2xl flex items-center justify-center border border-red-500/30 flex-shrink-0">
              <svg className="h-4 w-4 sm:h-6 sm:w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] sm:text-sm font-bold text-red-400">Connection Error</p>
              <p className="text-[8px] sm:text-xs text-red-400/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-3 md:space-y-8">
          {sortedOrders.length > 0 ? (
            sortedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAccept={handleAccept}
                onReject={handleReject}
                onOutOfStock={handleOutOfStock}
                onAssignDelivery={handleAssignDelivery}
                isVendor
                disabled={actionLoading === order.id}
              />
            ))
          ) : (
            <div className="text-center py-16 md:py-24 bg-white/[0.02] backdrop-blur-xl rounded-[32px] md:rounded-[48px] border-2 border-dashed border-white/10 shadow-inner px-4">
              <div className="text-4xl md:text-6xl mb-4 md:mb-6 opacity-20 grayscale">📦</div>
              <h3 className="text-lg md:text-xl font-black text-white mb-2">No orders found</h3>
              <p className="text-sm md:text-base text-gray-500 font-medium max-w-[280px] md:max-w-xs mx-auto">There are no orders matching the <span className="text-orange-500/80">{statusFilter.toLowerCase()}</span> filter at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
