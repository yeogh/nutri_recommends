import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Calendar,
  ShoppingCart,
  ChefHat,
  CreditCard,
  Utensils,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { subscriptionTier, dailyEatingScore, planLocked } = useApp();

  const navItems = [
    { to: '/', label: 'Weekly Meal Plan', icon: Calendar },
    { to: '/grocery', label: 'Grocery & Pantry Sync', icon: ShoppingCart },
    { to: '/cooking', label: 'Daily Cooking View', icon: Utensils },
    { to: '/pricing', label: 'Subscriptions', icon: CreditCard },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-stone-900">
                  NutriRecommends
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  {subscriptionTier.toUpperCase()} TIER
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Household Allergy, Macro &amp; Pantry Coordinator
              </p>
            </div>
          </NavLink>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs">
              <Award className="h-4 w-4 text-emerald-600" />
              <span className="text-stone-600">Eating Score:</span>
              <span className="font-bold text-emerald-700">{dailyEatingScore}/100</span>
            </div>
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                planLocked
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {planLocked ? 'Week Locked' : 'Voting Open'}
            </span>
          </div>
        </div>

        {/* Mobile Secondary Nav */}
        <nav className="flex lg:hidden items-center gap-1 overflow-x-auto pb-2 pt-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-stone-600 hover:bg-stone-100'
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};
