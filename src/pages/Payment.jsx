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
        email: user.email,
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
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-[32px] p-10 border border-white/10 text-center max-w-sm w-full shadow-2xl">
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
            <ArrowLeft className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-gray-300 mb-8 font-medium">No checkout details found. Your session might have expired.</p>
          <button
            onClick={() => navigate("/cart")}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-orange-500/20"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0806] py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-white">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-black tracking-tight">Checkout</h1>
          <button 
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Payment Method Section */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-[40px] border border-white/10 shadow-2xl p-8 sm:p-10">
            <h2 className="text-xl font-black uppercase tracking-widest text-gray-400 mb-8">Payment Method</h2>
            
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-orange-500/20 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-[#0d0a08] p-6 rounded-[32px] border border-white/10 shadow-inner group-hover:border-orange-500/30 transition-all duration-300">
                  <img
                    src="http://127.0.0.1:8000/static/qr.jpeg"
                    alt="Payment QR"
                    className="w-56 h-56 object-cover rounded-2xl"
                  />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Scan to Pay
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6 w-full">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">
                    Confirmation Code
                  </label>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter 'PAID' to confirm"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-orange-500/60 outline-none transition-all text-sm font-bold placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">
                    Delivery Instructions
                  </label>
                  <textarea
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-orange-500/60 outline-none transition-all text-sm font-medium placeholder:text-gray-600 resize-none"
                    rows={3}
                    placeholder="Gate code, drop-off point, etc..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-[40px] border border-white/10 shadow-2xl p-8 sm:p-10">
            <h2 className="text-xl font-black uppercase tracking-widest text-gray-400 mb-8">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-gray-400">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold text-white">₹{currentSubtotal}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500 text-sm">
                <span className="font-medium">GST Tax</span>
                <span className="font-bold">₹{extraCharges.gst}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500 text-sm">
                <span className="font-medium">Service Charge</span>
                <span className="font-bold">₹{extraCharges.serviceCharge}</span>
              </div>
              
              <div className="pt-6 mt-6 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500 block mb-1">Total Payable</span>
                    <span className="text-4xl font-black text-white">₹{payable}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black uppercase tracking-widest text-orange-500 block mb-1">Status</span>
                    <span className="text-sm font-bold text-orange-500/80">Pending Payment</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold flex items-center gap-3 animate-shake">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  {error}
                </div>
              )}

              {paymentSuccess && (
                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold flex items-center gap-3 animate-pulse">
                  <CheckCircle2 className="h-5 w-5" />
                  Payment confirmed! Redirecting to orders...
                </div>
              )}

              <button
                onClick={handleConfirmPayment}
                disabled={loading || paymentSuccess}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-5 px-8 rounded-2xl font-black text-lg transition-all active:scale-[0.98] shadow-2xl shadow-orange-500/20 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : "Confirm & Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
