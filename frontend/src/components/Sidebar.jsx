import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Coffee, ShoppingBag, ClipboardList, User, BarChart3, Package, Layers, Settings, MessageSquarePlus } from 'lucide-react';

export default function Sidebar({ role }) {
  const location = useLocation();
  const isAdmin = role === 'ROLE_ADMIN';

  const customerLinks = [
    { to: '/dashboard', label: 'Welcome Portal', icon: Home },
    { to: '/menu', label: 'Order Menu', icon: Coffee },
    { to: '/cart', label: 'My Cart', icon: ShoppingBag },
    { to: '/orders', label: 'Order History', icon: ClipboardList },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Sales & Charts', icon: BarChart3 },
    { to: '/admin/orders', label: 'Active Orders', icon: ClipboardList },
    { to: '/admin/products', label: 'Menu Catalog', icon: Coffee },
    { to: '/admin/inventory', label: 'Inventory Stock', icon: Layers },
  ];

  const links = isAdmin ? adminLinks : customerLinks;

  return (
    <aside className="w-64 glass-effect shrink-0 h-[calc(100vh-4rem)] border-r border-coffee-200/20 sticky top-16 hidden md:flex flex-col p-4 justify-between">
      <div className="space-y-6">
        <div className="px-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-coffee-400">
            {isAdmin ? 'Management Console' : 'Customer Lobby'}
          </span>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/dashboard' || link.to === '/admin'}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-coffee-600 to-coffee-800 text-white shadow-md shadow-coffee-900/10 translate-x-1' 
                      : 'text-coffee-950/70 hover:bg-coffee-100/40 hover:text-coffee-850'
                  }`
                }
              >
                <Icon className="w-4.5 h-4.5" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-gradient-to-br from-coffee-800/10 to-coffee-900/10 rounded-2xl border border-coffee-200/20">
        <h5 className="font-extrabold text-xs text-coffee-900 mb-1">MP Cafe (Morning Place)</h5>
        <p className="text-[10px] text-coffee-500">Localhost Server Online v1.0</p>
      </div>
    </aside>
  );
}
