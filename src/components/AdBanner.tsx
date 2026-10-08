import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AdBannerProps {
  placement: string;
  headline: string;
  copy: string;
  ctaText: string;
  sponsorTag: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  placement,
  headline,
  copy,
  ctaText,
  sponsorTag,
}) => {
  const { subscriptionTier } = useApp();

  if (subscriptionTier !== 'free') {
    return null;
  }

  return (
    <div className="my-5 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-amber-200/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-900">
              Sponsored • {placement}
            </span>
            <span className="text-xs text-stone-500">{sponsorTag}</span>
          </div>
          <h4 className="text-sm font-semibold text-stone-900">{headline}</h4>
          <p className="text-xs text-stone-600">{copy}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors cursor-pointer"
          >
            {ctaText}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Remove Ads ($9/mo)
          </Link>
        </div>
      </div>
    </div>
  );
};
