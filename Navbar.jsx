import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, Menu, X, LayoutDashboard, Store } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'text-primary-400 bg-primary-950/30 border border-primary-500/20'
        : 'text-dark-200 hover:text-white hover:bg-white/5 border border-transparent'
    }`;

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Store className="w-8 h-8 text-primary-500" />
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-400 via-primary-500 to-purple-400 bg-clip-text text-transparent">
                Aura
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-2">
            <NavLink to="/" className={navLinkClass}>Home</NavLink>
            <NavLink to="/products" className={navLinkClass}>Shop</NavLink>
            {user && (
              <>
                <NavLink to="/orders" className={navLinkClass}>My Orders</NavLink>
                <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
              </>
            )}
          </div>

          {/* Desktop Right Hand Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-dark-200 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-500 rounded-full transform translate-x-1/3 -translate-y-1/3 animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Admin Dashboard Quick Link */}
            {user && user.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-2 px-3 py-1.5 bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-800/30 rounded-lg text-xs font-semibold transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Suite</span>
              </Link>
            )}

            {/* User Session Buttons */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 text-sm text-dark-200">
                  <User className="w-4 h-4 text-primary-400" />
                  <span className="font-medium max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-400 hover:text-white hover:bg-red-950/40 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-dark-100 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 rounded-lg shadow-md hover:shadow-primary-500/20 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex md:hidden items-center space-x-4">
            {/* Cart Icon Mobile */}
            <Link
              to="/cart"
              className="relative p-2 text-dark-200"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-primary-500 rounded-full transform translate-x-1/3 -translate-y-1/3">
                  {cartCount}
                </span>
              )}
            </Link>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-dark-200 hover:text-white hover:bg-white/5 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/5 bg-dark-900/95 animate-slide-up">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-dark-100 hover:text-white hover:bg-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block px-3 py-2 rounded-md text-base font-medium text-dark-100 hover:text-white hover:bg-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>
            {user && (
              <>
                <Link
                  to="/orders"
                  className="block px-3 py-2 rounded-md text-base font-medium text-dark-100 hover:text-white hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-dark-100 hover:text-white hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-semibold text-purple-300 hover:bg-purple-950/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Suite
                  </Link>
                )}
              </>
            )}
            
            {/* User Session Mobile buttons */}
            <div className="pt-4 pb-2 border-t border-white/5 px-3">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-dark-200">
                    Logged in as: <span className="text-primary-400 font-semibold">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-sm font-semibold text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/login"
                    className="w-full text-center px-4 py-2 border border-white/10 rounded-md text-sm font-medium text-dark-100 hover:text-white hover:bg-white/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="w-full text-center px-4 py-2 bg-primary-500 rounded-md text-sm font-medium text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
