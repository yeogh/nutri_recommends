import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  Megaphone,
  Layers,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminMetricsScreen: React.FC = () => {
  const { referralOrdersCount, referralRevenueEarned, subscriptionTier } = useApp();

  const familyMrr = 19000; // 1,000 users @ $19/mo
  const individualMrr = 4500; // 500 users @ $9/mo
  const adRevenueMrr = 1000; // $1k/month on-platform contextual ads
  const currentTotalMrr = familyMrr + individualMrr + referralRevenueEarned + adRevenueMrr;
  const eoyTargetMrr = 30000;
  const progressPct = Math.min(100, Math.round((currentTotalMrr / eoyTargetMrr) * 100));

  return (
    <div className="space-y-8">
      {/* EOY Revenue Target Banner */}
      <div className="rounded-2xl border border-stone-200 bg-stone-900 p-6 text-white shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Internal Executive Metric • /admin Route</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Goal: Achieve $30k/month by EOY
            </h1>
            <p className="text-xs text-stone-300 max-w-2xl">
              Real-time unit economics tracker combining B2C household subscriptions, 2% grocery delivery referral commissions, and contextual sponsor ad revenue.
            </p>
          </div>

          <div className="rounded-xl bg-white/10 p-4 min-w-[260px]">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-stone-300">Projected Run-Rate MRR</span>
              <span className="text-xs font-bold text-emerald-400">{progressPct}% of EOY Goal</span>
            </div>
            <p className="text-3xl font-black mt-1">
              ${currentTotalMrr.toLocaleString()}{' '}
              <span className="text-sm font-normal text-stone-300">/ $30,000 mo</span>
            </p>
            <div className="mt-3 h-2.5 w-full rounded-full bg-stone-700 overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Revenue Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>Family Subscriptions ($19/mo)</span>
            <Users className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-stone-900">$19,000 / mo</p>
          <p className="text-xs text-stone-500">1,000 household accounts • Active tier: {subscriptionTier}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>Individual Subscriptions ($9/mo)</span>
            <Award className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-stone-900">$4,500 / mo</p>
          <p className="text-xs text-stone-500">500 single-planner accounts</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>2% Delivery Platform Referral</span>
            <ShoppingBag className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700">
            ${referralRevenueEarned.toLocaleString()} / mo
          </p>
          <p className="text-xs text-stone-500">
            $100/wk avg spend across {referralOrdersCount} active orders
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>On-Platform Contextual Ads</span>
            <Megaphone className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-stone-900">$1,000 / mo</p>
          <p className="text-xs text-stone-500">Supermarket &amp; CPG brand placements on Free tier</p>
        </div>
      </div>

      {/* Cost Budget & GTM Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-bold text-stone-900">
              Capital Allocation &amp; Cost Structure ($120k–$165k Total Budget)
            </h2>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3 border border-stone-200/70">
              <div>
                <p className="font-bold text-stone-900">Ideation &amp; UX Design</p>
                <p className="text-stone-500">Household persona research &amp; multi-member workflow wireframes</p>
              </div>
              <span className="font-extrabold text-stone-900">$10k – $15k</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3 border border-stone-200/70">
              <div>
                <p className="font-bold text-stone-900">Development &amp; MVP Build</p>
                <p className="text-stone-500">Calorie/food logging engine, AI &amp; computer vision receipt OCR, MCP protocol testing</p>
              </div>
              <span className="font-extrabold text-stone-900">$30k – $50k</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3 border border-stone-200/70">
              <div>
                <p className="font-bold text-stone-900">Production &amp; Scaling</p>
                <p className="text-stone-500">SaaS middleware, supermarket cart connectors, high-availability hosting</p>
              </div>
              <span className="font-extrabold text-stone-900">$30k – $50k</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3 border border-stone-200/70">
              <div>
                <p className="font-bold text-stone-900">Year 1 B2C Marketing &amp; Acquisition</p>
                <p className="text-stone-500">Influencer B2C campaigns, supermarket roadshow booths, parenting communities</p>
              </div>
              <span className="font-extrabold text-stone-900">$50k+</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-bold text-stone-900">
              Key Partners, Channels &amp; Ecosystem Architecture
            </h2>
          </div>
          <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
            <p>
              <strong className="text-stone-900">Customer Segments:</strong> Family meal planners coordinating allergies/macros across members, commercial home-delivery meal providers, advertisement sponsors, and grocery merchants.
            </p>
            <p>
              <strong className="text-stone-900">Acquisition Channels:</strong> Social media, ads on grocery delivery platforms, physical roadshow booths at supermarkets, parenting groups, and cooking communities—backed by a free 1-week trial.
            </p>
            <p>
              <strong className="text-stone-900">MCP AI Stack:</strong> Server-side integration with <code>nutribalance-mcp</code> (TDEE &amp; macro calculation, food nutrition lookup, meal plan generation across standard/vegetarian/vegan/keto/high-protein modes, nutrient-deficiency fixes, and daily eating score 0–100).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
