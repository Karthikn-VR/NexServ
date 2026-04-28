import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { MapPin, Clock, User, CheckCircle, ArrowLeft } from "lucide-react";
import { orderAPI } from "../services/api/order";

export const Tracking = () => {
  const { id } = useParams();
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchTracking = async () => {
      try {
        const data = await orderAPI.getTracking(id);
        setTrackingData(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch tracking data", err);
        setError("Failed to load tracking data");
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
    const interval = setInterval(fetchTracking, 500); // Poll every 1s for better fluidity
    return () => clearInterval(interval);
  }, [id]);

  if (!id) {
    return <Navigate to="/orders" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0806] flex items-center justify-center py-8 px-4">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 font-medium tracking-widest uppercase text-xs">Connecting to tracker...</p>
        </div>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-[#0a0806] flex items-center justify-center py-8 px-4 text-center">
        <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-3xl border border-white/10 max-w-sm w-full">
           <p className="text-red-400 mb-6 font-medium">{error || "Tracking not available"}</p>
           <Link 
            to="/orders" 
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 font-semibold transition-colors"
           >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
           </Link>
        </div>
      </div>
    );
  }

  const { progress, status, lat, lng, otp, rejection_reason } = trackingData;
  const displayProgress = (progress || 0) * 100;
  const progressPercent = Math.round(displayProgress);
  const isDelivered = status === 'DELIVERED' || progressPercent >= 100;
  const isRejected = status === 'REJECTED' || status === 'OUT_OF_STOCK';

  return (
    <div className="min-h-screen bg-[#0a0806] pt-20 md:pt-28 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-white">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[40%] h-[300px] md:h-[40%] bg-orange-500/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] md:w-[40%] h-[300px] md:h-[40%] bg-orange-600/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-10 gap-4">
          <div>
            <h1 className="text-responsive-h2 font-black tracking-tight mb-1 md:mb-2">
              {isRejected ? 'Order Rejected' : isDelivered ? 'Order Delivered! 🎉' : 'Live Tracking'}
            </h1>
            <p className="text-gray-400 font-medium text-sm md:text-base">Order #{id}</p>
          </div>
          <Link 
            to="/orders"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] transition-all text-sm font-bold w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>

        {/* Rejection Display Card */}
        {isRejected && (
          <div className="bg-red-500 rounded-2xl md:rounded-3xl shadow-2xl shadow-red-500/20 p-6 md:p-8 mb-6 md:mb-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between relative overflow-hidden group gap-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 w-full sm:w-auto">
              <p className="text-red-100 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-1 md:mb-2">Status: {status}</p>
              <h3 className="text-2xl md:text-3xl font-black">Order Cancelled</h3>
              {rejection_reason && (
                <p className="text-red-50/80 mt-2 font-medium bg-black/10 p-3 rounded-xl border border-white/10 text-sm">
                  Reason: {rejection_reason}
                </p>
              )}
            </div>
            <div className="bg-white/20 p-3 md:p-4 rounded-xl md:rounded-2xl backdrop-blur-md relative z-10 border border-white/20 self-end sm:self-auto">
              <span className="text-3xl md:text-4xl">🚫</span>
            </div>
          </div>
        )}

        {/* OTP Display Card */}
        {otp && !isDelivered && !isRejected && (
          <div className="bg-orange-500 rounded-2xl md:rounded-3xl shadow-2xl shadow-orange-500/20 p-6 md:p-8 mb-6 md:mb-8 text-white flex items-center justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <p className="text-orange-100 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-1 md:mb-2">Delivery OTP</p>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[0.2em] sm:tracking-[0.3em]">{otp}</h3>
            </div>
            <div className="text-right hidden sm:block relative z-10">
              <p className="text-orange-50/80 text-xs md:text-sm font-medium leading-relaxed max-w-[150px]">
                Share this code with your delivery partner
              </p>
            </div>
            <div className="bg-white/20 p-3 md:p-4 rounded-xl md:rounded-2xl backdrop-blur-md relative z-10 border border-white/20">
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
          </div>
        )}

        {isDelivered && (
          <div className="bg-green-500 rounded-2xl md:rounded-3xl shadow-2xl shadow-green-500/20 p-6 md:p-8 mb-6 md:mb-8 text-white flex items-center justify-between animate-in fade-in zoom-in duration-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-black mb-1">Delivered!</h3>
              <p className="text-green-50/90 font-medium text-sm md:text-base">Hope you enjoy your fresh meal!</p>
            </div>
            <div className="bg-white/20 p-4 md:p-5 rounded-xl md:rounded-2xl backdrop-blur-md relative z-10 border border-white/20">
              <span className="text-3xl md:text-4xl">🎁</span>
            </div>
          </div>
        )}

        {/* CSS Map Simulation */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl md:rounded-[40px] border border-white/10 shadow-2xl overflow-hidden mb-6 md:mb-8 p-6 md:p-10">
          <div className="relative h-48 sm:h-60 md:h-72 bg-[#0d0a08] rounded-2xl md:rounded-3xl overflow-hidden border border-white/5 shadow-inner">
             {/* Simulated Map Background */}
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] invert"></div>
             
             {/* Route Line Background */}
             <div className="absolute top-1/2 left-8 sm:left-16 right-8 sm:right-16 h-2 md:h-3 bg-white/[0.05] rounded-full -translate-y-1/2">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-1000 ease-linear shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                  style={{ width: `${displayProgress}%` }}
                ></div>
             </div>

             {/* Restaurant Marker */}
             <div className="absolute top-1/2 left-8 sm:left-16 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-[#1a1410] rounded-xl md:rounded-2xl border border-white/10 flex items-center justify-center shadow-xl group hover:scale-110 transition-transform">
                  <MapPin className="h-4 w-4 md:h-6 md:w-6 text-orange-500 fill-orange-500/20" />
                </div>
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest mt-2 md:mt-3 text-gray-500">Pickup</span>
             </div>

             {/* Destination Marker */}
             <div className="absolute top-1/2 right-8 sm:right-16 -translate-y-1/2 translate-x-1/2 flex flex-col items-center">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-[#1a1410] rounded-xl md:rounded-2xl border border-white/10 flex items-center justify-center shadow-xl group hover:scale-110 transition-transform">
                  <MapPin className="h-4 w-4 md:h-6 md:w-6 text-green-500 fill-green-500/20" />
                </div>
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest mt-2 md:mt-3 text-gray-500">You</span>
             </div>
             
             {/* Dynamic Courier Marker */}
             <div 
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-linear flex flex-col items-center"
                style={{ left: `calc(${window.innerWidth < 640 ? '32px' : '64px'} + (100% - ${window.innerWidth < 640 ? '64px' : '128px'}) * ${displayProgress / 100})` }}
             >
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500 rounded-xl md:rounded-2xl animate-ping opacity-20 scale-150"></div>
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center relative z-10 shadow-2xl shadow-orange-500/40 border border-white/20">
                    <User className="h-5 w-5 md:h-8 md:w-8 text-white" />
                  </div>
                </div>
                {lat && lng && (
                   <div className="mt-2 md:mt-3 bg-black/80 backdrop-blur-md px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-white/10 opacity-60">
                     <span className="text-[7px] md:text-[9px] font-mono font-bold tracking-tighter text-gray-400">
                       {lat.toFixed(4)}, {lng.toFixed(4)}
                     </span>
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl md:rounded-[40px] border border-white/10 shadow-2xl p-6 md:p-10">
          <h2 className="text-sm md:text-xl font-black uppercase tracking-widest text-gray-400 mb-6 md:mb-8">Delivery Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="flex items-center space-x-4 md:space-x-5 group">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-orange-500/10 rounded-xl md:rounded-2xl flex items-center justify-center border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
                <Clock className="h-5 w-5 md:h-7 md:w-7 text-orange-500" />
              </div>
              <div>
                <p className="text-[9px] md:text-xs font-black uppercase tracking-widest text-gray-500 mb-0.5 md:mb-1">Progress</p>
                <p className="font-bold text-base md:text-lg">{progressPercent}% Completed</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 md:space-x-5 group">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-500/10 rounded-xl md:rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                <User className="h-5 w-5 md:h-7 md:w-7 text-blue-500" />
              </div>
              <div>
                <p className="text-[9px] md:text-xs font-black uppercase tracking-widest text-gray-500 mb-0.5 md:mb-1">Driver</p>
                <p className="font-bold text-base md:text-lg">Arriving Soon</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 md:space-x-5 group">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-green-500/10 rounded-xl md:rounded-2xl flex items-center justify-center border border-green-500/20 group-hover:bg-green-500/20 transition-colors">
                <CheckCircle className="h-5 w-5 md:h-7 md:w-7 text-green-500" />
              </div>
              <div>
                <p className="text-[9px] md:text-xs font-black uppercase tracking-widest text-gray-500 mb-0.5 md:mb-1">Status</p>
                <p className="font-bold text-base md:text-lg">{status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
