import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { MapPin, Clock, User, CheckCircle, ArrowLeft } from "lucide-react";
import { orderAPI } from "../services/api/order";

export const Tracking = () => {
  const { id } = useParams();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    <div className="min-h-screen bg-[#0a0806] pt-12 pb-4 md:pt-24 md:pb-12 px-2 sm:px-6 lg:px-8 relative overflow-hidden text-white">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[200px] md:w-[40%] h-[200px] md:h-[40%] bg-orange-500/10 rounded-full blur-[60px] md:blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[200px] md:w-[40%] h-[200px] md:h-[40%] bg-orange-600/10 rounded-full blur-[60px] md:blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="flex flex-row items-center justify-between mb-2 md:mb-8 gap-2">
          <div>
            <h1 className="text-[12px] md:text-4xl font-black tracking-tight mb-0 md:mb-1">
              {isRejected ? 'Rejected' : isDelivered ? 'Delivered! 🎉' : 'Live Tracking'}
            </h1>
            <p className="text-gray-400 font-medium text-[7px] md:text-sm">Order #{id}</p>
          </div>
          <Link 
            to="/orders"
            className="inline-flex items-center justify-center gap-1 px-1.5 md:px-5 py-0.5 md:py-2 rounded-md md:rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] transition-all text-[8px] md:text-sm font-bold"
          >
            <ArrowLeft className="w-2 md:w-4 h-2 md:h-4" />
            <span>Orders</span>
          </Link>
        </div>

        {/* Rejection Display Card */}
        {isRejected && (
          <div className="bg-red-500 rounded-lg md:rounded-2xl shadow-xl shadow-red-500/10 p-2 md:p-6 mb-2 md:mb-6 text-white flex flex-row items-center justify-between relative overflow-hidden group gap-2">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 min-w-0">
              <p className="text-red-100 text-[5px] md:text-xs font-black uppercase tracking-[0.2em] mb-0.5">Status: {status}</p>
              <h3 className="text-[10px] md:text-2xl font-black">Order Cancelled</h3>
              {rejection_reason && (
                <p className="text-red-50/80 mt-0.5 font-medium bg-black/10 p-1 rounded-md border border-white/10 text-[7px] md:text-sm line-clamp-1">
                  {rejection_reason}
                </p>
              )}
            </div>
            <div className="bg-white/20 p-1 md:p-3 rounded-md md:rounded-xl backdrop-blur-md relative z-10 border border-white/20 flex-shrink-0">
              <span className="text-[10px] md:text-3xl">🚫</span>
            </div>
          </div>
        )}

        {/* OTP Display Card */}
        {otp && !isDelivered && !isRejected && (
          <div className="bg-orange-500 rounded-lg md:rounded-2xl shadow-xl shadow-orange-500/10 p-2 md:p-6 mb-2 md:mb-6 text-white flex items-center justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <p className="text-orange-100 text-[5px] md:text-xs font-black uppercase tracking-[0.2em] mb-0.5">Delivery OTP</p>
              <h3 className="text-lg md:text-4xl font-black tracking-[0.2em]">{otp}</h3>
            </div>
            <div className="bg-white/20 p-1 md:p-3 rounded-md md:rounded-xl backdrop-blur-md relative z-10 border border-white/20">
              <CheckCircle className="h-3 w-3 md:h-7 md:w-7 text-white" />
            </div>
          </div>
        )}

        {isDelivered && (
          <div className="bg-green-500 rounded-lg md:rounded-2xl shadow-xl shadow-green-500/10 p-2 md:p-6 mb-2 md:mb-6 text-white flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <h3 className="text-[10px] md:text-2xl font-black mb-0">Delivered!</h3>
              <p className="text-green-50/90 font-medium text-[7px] md:text-sm">Hope you enjoy your meal!</p>
            </div>
            <div className="bg-white/20 p-1.5 md:p-4 rounded-md md:rounded-xl backdrop-blur-md relative z-10 border border-white/20">
              <span className="text-[10px] md:text-3xl">🎁</span>
            </div>
          </div>
        )}

        {/* CSS Map Simulation */}
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-lg md:rounded-[32px] border border-white/10 shadow-xl overflow-hidden mb-2 md:mb-6 p-1.5 md:p-6">
          <div className="relative h-20 sm:h-48 md:h-60 bg-[#0d0a08] rounded-md md:rounded-2xl overflow-hidden border border-white/5 shadow-inner">
             {/* Simulated Map Background */}
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] invert"></div>
             
             {/* Route Line Background */}
             <div className="absolute top-1/2 left-6 md:left-12 right-6 md:right-12 h-1 md:h-2 bg-white/[0.05] rounded-full -translate-y-1/2">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-1000 ease-linear shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                  style={{ width: `${displayProgress}%` }}
                ></div>
             </div>

             {/* Restaurant Marker */}
             <div className="absolute top-1/2 left-6 md:left-12 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-4 h-4 md:w-10 md:h-10 bg-[#1a1410] rounded-md md:rounded-xl border border-white/10 flex items-center justify-center shadow-lg">
                  <MapPin className="h-2 w-2 md:h-5 md:w-5 text-orange-500 fill-orange-500/20" />
                </div>
                <span className="text-[4px] md:text-[8px] font-black uppercase tracking-widest mt-0.5 md:mt-2 text-gray-500">Pickup</span>
             </div>

             {/* Destination Marker */}
             <div className="absolute top-1/2 right-6 md:right-12 -translate-y-1/2 translate-x-1/2 flex flex-col items-center">
                <div className="w-4 h-4 md:w-10 md:h-10 bg-[#1a1410] rounded-md md:rounded-xl border border-white/10 flex items-center justify-center shadow-lg">
                  <MapPin className="h-2 w-2 md:h-5 md:w-5 text-green-500 fill-green-500/20" />
                </div>
                <span className="text-[4px] md:text-[8px] font-black uppercase tracking-widest mt-0.5 md:mt-2 text-gray-500">You</span>
             </div>
             
             {/* Dynamic Courier Marker */}
             <div 
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-linear flex flex-col items-center"
                style={{ left: `calc(${windowWidth < 640 ? '24px' : '48px'} + (100% - ${windowWidth < 640 ? '48px' : '96px'}) * ${displayProgress / 100})` }}
             >
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500 rounded-md md:rounded-xl animate-ping opacity-20 scale-125"></div>
                  <div className="w-5 h-5 md:w-12 md:h-12 bg-orange-500 rounded-md md:rounded-xl flex items-center justify-center relative z-10 shadow-xl border border-white/20">
                    <User className="h-2.5 w-2.5 md:h-6 md:w-6 text-white" />
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-lg md:rounded-[32px] border border-white/10 shadow-xl p-2.5 md:p-6">
          <h2 className="text-[7px] md:text-sm font-black uppercase tracking-widest text-gray-500 mb-1.5 md:mb-4">Delivery Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
            <div className="flex items-center space-x-2 md:space-x-4 group">
              <div className="w-6 h-6 md:w-12 md:h-12 bg-orange-500/10 rounded-md md:rounded-xl flex items-center justify-center border border-orange-500/20">
                <Clock className="h-3 w-3 md:h-6 md:w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-[5px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0">Progress</p>
                <p className="font-bold text-[9px] md:text-base">{progressPercent}%</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4 group">
              <div className="w-6 h-6 md:w-12 md:h-12 bg-blue-500/10 rounded-md md:rounded-xl flex items-center justify-center border border-blue-500/20">
                <User className="h-3 w-3 md:h-6 md:w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-[5px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0">Driver</p>
                <p className="font-bold text-[9px] md:text-base">Arriving Soon</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4 group">
              <div className="w-6 h-6 md:w-12 md:h-12 bg-green-500/10 rounded-md md:rounded-xl flex items-center justify-center border border-green-500/20">
                <CheckCircle className="h-3 w-3 md:h-6 md:w-6 text-green-500" />
              </div>
              <div>
                <p className="text-[5px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0">Status</p>
                <p className="font-bold text-[9px] md:text-base">{status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
