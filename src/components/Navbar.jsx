import { Link, useLocation } from "react-router-dom";
import { Utensils, Menu, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useState } from "react";

export const Navbar = () => {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { cartItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { path: "/menu", label: "Menu" },
    {
      path: "/cart",
      label: cartCount > 0 ? `Cart (${cartCount})` : "Cart"
    },
    { path: "/orders", label: "Orders" },
    ...(isAdmin ? [{ path: "/vendor", label: "Vendor" }] : []),
  ];

  return (
    <nav className="bg-[#0a0806]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 h-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row flex-wrap justify-between min-h-[64px] md:min-h-[80px] items-start md:items-center py-2 md:py-0 gap-2">
          <div className="flex items-center w-full md:w-auto justify-between h-12 md:h-auto">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Utensils className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <span className="text-lg md:text-xl font-extrabold tracking-tight text-white">
                <span className="text-orange-500">Nex</span>Serv
              </span>
            </Link>

            {/* Mobile Menu Button - Moved inside the logo container for row layout on mobile if needed, or I can keep it separate and use flex-col on the parent */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${location.pathname === item.path
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl font-medium text-red-400 hover:text-white hover:bg-red-500/20 transition-all duration-300 ml-4 border border-red-500/20"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <div className={`md:hidden fixed inset-0 top-16 bg-[#0a0806] z-40 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col p-4 space-y-3 h-full overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-5 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 ${location.pathname === item.path
                ? "bg-orange-500 text-white shadow-xl shadow-orange-500/20"
                : "text-gray-400 hover:text-white bg-white/5 border border-white/5"
                }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-auto pt-8 pb-24">
            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full px-5 py-4 rounded-2xl font-bold text-lg text-red-400 bg-red-500/10 border border-red-500/20 text-center transition-all active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
