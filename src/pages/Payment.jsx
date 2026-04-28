import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { orderAPI } from "../services/api/order";

export const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart, subtotal, extraCharges, total } = useCart();
  const { user } = useAuth();

  const [couponCode, setCouponCode] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const cookingInstructions = location.state?.cooking_instructions || "";

  const address = location.state?.address;
  const payable = useMemo(() => location.state?.total ?? total, [location.state?.total, total]);
  const currentSubtotal = useMemo(() => location.state?.subtotal ?? subtotal, [location.state?.subtotal, subtotal]);

  const placeOrderAfterPayment = async () => {
    if (!address || !user) {
      console.log('Missing address or user:', { address, user }); // Debug
      setError("Session expired. Please go back to cart and checkout again.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const combinedInstructions = [
        cookingInstructions ? `CHEF: ${cookingInstructions}` : '',
        deliveryInstructions ? `DRIVER: ${deliveryInstructions}` : ''
      ].filter(Boolean).join(' | ');

      console.log('User object in payment:', user); // Debug user object
      console.log('User email in payment:', user?.email); // Debug email specifically
      
      const payload = {
        address: {
          full_name: address.full_name,
          phone_number: address.phone_number,
          address_line_1: address.address_line_1,
          address_line_2: address.address_line_2 || "",
          city: address.city,
          state: address.state || "",
          postal_code: address.postal_code,
          country: address.country || "",
        },
        email: user?.email ?? "customer@nexserv.com", // Ensure email is always included with proper fallback
        coupon_code: couponCode.trim().toUpperCase(),
        special_instructions: combinedInstructions,
        items: cartItems
          .filter(item => typeof item.id === 'number')
          .map((item) => ({
            dish_id: item.id,
            quantity: item.quantity,
            name: item.name,
            price: item.price,
          })),
      };

      console.log('Final order payload:', JSON.stringify(payload, null, 2)); // Debug the final payload

      const resp = await orderAPI.placeOrder(payload);
      if (!resp || resp.error) {
        throw new Error((resp && resp.error) || "Failed to place order");
      }

      setPaymentSuccess(true);
      setTimeout(() => {
        clearCart();
        navigate("/orders");
      }, 1400);
    } catch (err) {
      setError(err.message || "Payment confirmation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (couponCode.trim().toUpperCase() !== "PAID") {
      setError("Invalid discount code. Use PAID to confirm payment.");
      return;
    }
    await placeOrderAfterPayment();
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-[#0a0806] flex items-center justify-center px-4">
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl md:rounded-[32px] p-6 sm:p-10 border border-white/10 text-center max-w-sm w-full shadow-2xl">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
            <ArrowLeft className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
          </div>
          <p className="text-gray-300 mb-8 font-medium text-sm md:text-base">No checkout details found. Your session might have expired.</p>
          <button
            onClick={() => navigate("/cart")}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-orange-500/20 text-sm md:text-base"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0806] py-3 md:py-24 px-2 sm:px-6 lg:px-8 relative overflow-hidden text-white">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-3xl mx-auto space-y-2 md:space-y-10">
        <div className="flex flex-row items-center justify-between gap-4 mb-1 md:mb-0">
          <h1 className="text-base md:text-5xl font-black tracking-tight">Checkout</h1>
          <button 
            onClick={() => navigate('/cart')}
            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors font-bold text-[7px] md:text-sm w-fit bg-white/5 px-2 py-0.5 rounded-md border border-white/10"
          >
            <ArrowLeft className="w-2 h-2" />
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 md:gap-10">
          {/* Payment Method Section */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-lg md:rounded-[40px] border border-white/10 shadow-2xl p-2 sm:p-8 md:p-10">
            <h2 className="text-[6px] md:text-xl font-black uppercase tracking-widest text-gray-400 mb-1.5 md:mb-10">Payment Method</h2>
            
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-12 items-center lg:items-start">
              <div className="relative group w-full sm:w-auto flex justify-center">
                <div className="absolute -inset-4 bg-orange-500/20 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-[#0d0a08] p-1.5 md:p-6 rounded-md md:rounded-[32px] border border-white/10 shadow-inner group-hover:border-orange-500/30 transition-all duration-300 w-fit">
                  <img
                    src="https://nexserv-mhpe.onrender.com/static/qr.jpeg"
                    alt="Payment QR"
                    className="w-20 h-20 sm:w-56 sm:h-56 md:w-64 md:h-64 object-cover rounded-sm md:rounded-2xl"
                  />
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/10 text-[5px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Scan
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-2 md:space-y-8 w-full">
                <div className="space-y-0.5 md:space-y-1">
                  <label className="text-[6px] md:text-xs font-black uppercase tracking-widest text-gray-500 ml-1">
                    Confirmation Code
                  </label>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 md:w-5 md:h-5 text-gray-500" />
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter 'PAID'"
                      className="w-full pl-7 md:pl-14 pr-2.5 py-1.5 md:py-5 rounded-md md:rounded-2xl bg-white/[0.04] border border-white/10 focus:border-orange-500/60 outline-none transition-all text-[9px] md:text-base font-bold placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-0.5 md:space-y-1">
                  <label className="text-[6px] md:text-xs font-black uppercase tracking-widest text-gray-500 ml-1">
                    Instructions
                  </label>
                  <textarea
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    className="w-full px-2.5 py-1.5 md:py-5 rounded-md md:rounded-2xl bg-white/[0.04] border border-white/10 focus:border-orange-500/60 outline-none transition-all text-[9px] md:text-base font-medium placeholder:text-gray-600 resize-none"
                    rows={1}
                    placeholder="Gate code, etc..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-lg md:rounded-[40px] border border-white/10 shadow-2xl p-2 sm:p-8 md:p-10">
            <h2 className="text-[6px] md:text-xl font-black uppercase tracking-widest text-gray-400 mb-1.5 md:mb-10">Summary</h2>
            
            <div className="space-y-1 md:space-y-6">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-[9px] md:text-base font-medium">Subtotal</span>
                <span className="text-[9px] md:text-base font-bold text-white">₹{currentSubtotal}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span className="text-[8px] md:text-sm font-medium">GST Tax</span>
                <span className="text-[8px] md:text-sm font-bold">₹{extraCharges.gst}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span className="text-[8px] md:text-sm font-medium">Service Charge</span>
                <span className="text-[8px] md:text-sm font-bold">₹{extraCharges.serviceCharge}</span>
              </div>
              
              <div className="pt-2 md:pt-8 mt-2 md:mt-8 border-t border-white/10">
                <div className="flex flex-row justify-between items-center gap-4">
                  <div>
                    <span className="text-[6px] font-black uppercase tracking-widest text-gray-500 block">Total</span>
                    <span className="text-sm md:text-5xl font-black text-white">₹{payable}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[6px] font-black uppercase tracking-widest text-orange-500 block">Status</span>
                    <span className="text-[8px] md:text-base font-bold text-orange-500/80">Pending</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2.5 md:mt-12 space-y-2 md:space-y-6">
              {error && (
                <div className="p-1.5 md:p-5 rounded-md md:rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] md:text-sm font-bold flex items-center gap-1.5 animate-shake">
                  <div className="w-1 h-1 rounded-full bg-red-500"></div>
                  {error}
                </div>
              )}

              {paymentSuccess && (
                <div className="p-1.5 md:p-5 rounded-md md:rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-[8px] md:text-sm font-bold flex items-center gap-1.5 animate-pulse">
                  <CheckCircle2 className="h-2.5 w-2.5 md:h-5 md:w-5" />
                  Confirmed!
                </div>
              )}

              <button
                onClick={handleConfirmPayment}
                disabled={loading || paymentSuccess}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2 md:py-6 px-4 rounded-md md:rounded-2xl font-black text-[10px] md:text-xl transition-all active:scale-[0.98] shadow-2xl shadow-orange-500/20 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                {loading ? (
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-2.5 h-2.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ...
                  </div>
                ) : "Confirm Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
