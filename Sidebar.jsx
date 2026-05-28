import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Truck, BarChart3, ArrowLeft } from 'lucide-react';

const Sidebar = () => {
  const sidebarLinks = [
    {
      name: 'Overview',
      path: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Manage Products',
      path: '/admin/products',
      icon: ShoppingBag
    },
    {
      name: 'Manage Orders',
      path: '/admin/orders',
      icon: Truck
    },
    {
      name: 'Sales Analytics',
      path: '/admin/analytics',
      icon: BarChart3
    }
  ];

  const activeClass = 'flex items-center space-x-3 px-4 py-3 bg-purple-950/40 text-purple-300 border-l-4 border-purple-500 rounded-r-lg font-medium transition-all duration-150';
  const inactiveClass = 'flex items-center space-x-3 px-4 py-3 text-dark-200 hover:text-white hover:bg-white/5 border-l-4 border-transparent rounded-r-lg font-medium transition-all duration-150';

  return (
    <aside className="w-64 glass-panel border-r border-white/5 h-[calc(100vh-4rem)] sticky top-16 hidden md:flex flex-col justify-between py-6">
      
      {/* Upper Navigation Links */}
      <div className="flex flex-col space-y-1.5 px-3">
        <div className="px-4 mb-4 text-xs font-semibold uppercase tracking-wider text-dark-400">
          Administration
        </div>
        
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
            >
              <Icon className="w-5 h-5" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Back to main storefront link */}
      <div className="px-5">
        <NavLink
          to="/"
          className="flex items-center space-x-2 text-xs font-medium text-dark-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </NavLink>
      </div>

    </aside>
  );
};

export default Sidebar;
