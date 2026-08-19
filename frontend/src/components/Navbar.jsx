import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const token = localStorage.getItem("token");

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <Link
            to="/"
            className="text-2xl font-bold text-cyan-400 tracking-tight hover:text-cyan-300 transition-colors"
          >
            StockPilot Demo
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {token && (
              <>
                <Link
                  to="/dashboard"
                  className="text-slate-300 hover:text-white transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/products"
                  className="text-slate-300 hover:text-white transition-colors font-medium"
                >
                  Products
                </Link>
                <Link
                  to="/categories"
                  className="text-slate-300 hover:text-white transition-colors font-medium"
                >
                  Categories
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            )}
            {!token && (
              <>
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-slate-300 hover:text-white p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Links */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 space-y-3 border-t border-slate-800"
          >
            {token && (
              <>
                <Link
                  to="/dashboard"
                  className="block text-slate-300 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/products"
                  className="block text-slate-300 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Products
                </Link>
                <Link
                  to="/categories"
                  className="block text-slate-300 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Categories
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
            {!token && (
              <>
                <Link
                  to="/login"
                  className="block text-slate-300 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block text-slate-300 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
