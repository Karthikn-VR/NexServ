import { Link, useLocation } from "react-router-dom";
import { Utensils, Menu, X, ShoppingCart, ClipboardList, Store, User, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useState } from "react";

export const Navbar = () => {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { cartItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { path: "/menu", label: "Menu", icon: Utensils },
    {
      path: "/cart",
      label: cartCount > 0 ? `Cart (${cartCount})` : "Cart",
      icon: ShoppingCart
    },
    { path: "/orders", label: "Orders", icon: ClipboardList },
    ...(isAdmin ? [{ path: "/vendor", label: "Vendor", icon: Store }] : []),
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
            {navLinks.map((item) => (
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

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-500 md:hidden ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div
          className={`fixed top-0 right-0 w-[75%] max-w-[280px] h-screen bg-[#0a0806] border-l border-white/10 shadow-2xl transition-transform duration-500 transform flex flex-col overflow-y-auto ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0a0806] z-10">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-grow py-4 px-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl font-bold transition-all ${location.pathname === link.path
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <link.icon className={`w-5 h-5 ${location.pathname === link.path ? "text-white" : "text-orange-500"}`} />
                <span className="text-sm">{link.label}</span>
              </Link>
            ))}
          </div>

          {user && (
            <div className="p-4 border-t border-white/5 bg-white/[0.02] mt-auto">
              <div className="flex items-center space-x-3 mb-4 px-2">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                  <User className="w-5 h-5 text-orange-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user.name || user.email?.split('@')[0]}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">{user.role}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
