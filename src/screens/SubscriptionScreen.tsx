import React from 'react';
import { Check, Sparkles, Shield, Users, Gift } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SubscriptionTier } from '../types';
import { AdBanner } from '../components/AdBanner';

export const SubscriptionScreen: React.FC = () => {
  const { subscriptionTier, setSubscriptionTier } = useApp();

  const tiers: {
    id: SubscriptionTier;
    name: string;
    price: string;
    subtitle: string;
    badge?: string;
    features: string[];
  }[] = [
    {
      id: 'free',
      name: 'Free 1-Week Trial Tier',
      price: '$0',
      subtitle: 'Contextual sponsor ads enabled • Try weekly meal planning & grocery sync',
      features: [
        'Weekly Meal Plan dashboard & voting',
        'Basic NutriBalance macro preview',
        'Contextual grocery & appliance sponsor ads',
        '1-tap grocery delivery handoff',
      ],
    },
    {
      id: 'individual',
      name: 'Individual Plan',
      price: '$9 / month',
      subtitle: 'Ad-free personal nutrition & TDEE optimization (Target: 500 users = $4.5k MRR)',
      features: [
        '100% Ad-Free kitchen & planning experience',
        'Personalized TDEE & macro mode switching',
        'Household pantry receipt processing & expiry alerts',
        'Nutrient-deficiency guidance via NutriBalance MCP',
      ],
    },
    {
      id: 'family',
      name: 'Family Household Plan',
      price: '$19 / month',
      badge: 'MOST POPULAR • HOUSEHOLD COORDINATOR',
      subtitle: 'Up to 6 family members with allergy & calorie coordination (Target: 1,000 users = $19k MRR)',
      features: [
        'Coordinate multiple dietary modes & allergies in one menu',
        'Unlimited passwordless voting & feedback links for kids/teens',
        'Consolidated pantry-deducted grocery lists & 1-tap delivery handoff',
        'Ad-free across all household devices + priority delivery slots',
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Gift className="h-3.5 w-3.5" />
              <span>Free One-Week Trial Available • State-Flag Gating Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
              Subscription Tiers &amp; Household Gating
            </h1>
            <p className="text-sm text-stone-600 max-w-2xl">
              Switch your active tier flag below to test subscription gating. Selecting <strong>Individual ($9/mo)</strong> or <strong>Family ($19/mo)</strong> immediately removes contextual ad banners across all screens.
            </p>
          </div>
          <div className="rounded-xl bg-stone-50 border border-stone-200 px-4 py-3 text-xs">
            <span className="text-stone-500 block">Current State Flag:</span>
            <span className="text-base font-extrabold uppercase text-emerald-700">
              {subscriptionTier} Tier
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tiers.map((t) => {
          const isCurrent = subscriptionTier === t.id;
          return (
            <div
              key={t.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'border-2 border-emerald-600 bg-white shadow-md'
                  : 'border-stone-200 bg-white shadow-xs'
              }`}
            >
              <div>
                {t.badge && (
                  <span className="inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-800 mb-3">
                    {t.badge}
                  </span>
                )}
                <h2 className="text-xl font-bold text-stone-900">{t.name}</h2>
                <p className="mt-2 text-3xl font-extrabold text-stone-900">{t.price}</p>
                <p className="mt-1 text-xs text-stone-500">{t.subtitle}</p>

                <ul className="mt-6 space-y-3 text-xs text-stone-700">
                  {t.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setSubscriptionTier(t.id)}
                className={`mt-6 w-full rounded-xl py-3 text-xs font-bold transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-900 text-white hover:bg-stone-800'
                }`}
              >
                {isCurrent ? 'Active Subscription Tier' : `Switch State to ${t.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Preview of Ad-Stream Gating */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
          <Shield className="h-4 w-4 text-emerald-600" />
          <span>Contextual Ad-Revenue Stream Preview</span>
        </div>
        <p className="text-xs text-stone-600">
          {subscriptionTier === 'free'
            ? 'You are currently on the Free tier, so contextual sponsor placements render below (contributing $1k/month in platform ad revenue).'
            : 'You are on a Paid tier ($9 or $19/mo). Contextual advertisements are suppressed across the app.'}
        </p>
        <AdBanner
          placement="Subscription Gating Demo"
          sponsorTag="Organic Dairy Partner"
          headline="Grass-Fed Part-Skim Ricotta & Halloumi — 20% Off at Participating Supermarkets"
          copy="This contextual placement is visible only when the subscription state flag is set to 'free'."
          ctaText="View Supermarket Coupon"
        />
      </div>
    </div>
  );
};
