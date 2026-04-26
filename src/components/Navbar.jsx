import { Link, useLocation } from "react-router-dom";
import { Utensils } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

export const Navbar = () => {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { cartItems } = useCart();

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
    <nav className="bg-[#0a0806]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Utensils className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                <span className="text-orange-500">Nex</span>Serv
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-1">
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
    </nav>
  );
};
