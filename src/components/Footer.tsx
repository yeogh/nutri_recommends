import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white py-8 px-4 text-xs text-stone-600">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-stone-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Data Source &amp; MCP Attribution</span>
          </div>
          <p className="leading-relaxed">
            Nutrition, TDEE calculation, and dietary planning powered by{' '}
            <a
              href="https://server.smithery.ai/NutriBalance/nutribalance-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-700 underline hover:text-emerald-800 inline-flex items-center gap-0.5"
            >
              NutriBalance MCP (via Smithery Registry)
              <ExternalLink className="h-3 w-3" />
            </a>{' '}
            under the{' '}
            <a
              href="https://opensource.org/licenses/MIT"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-700 underline hover:text-emerald-800 inline-flex items-center gap-0.5"
            >
              MIT Open Data &amp; Software Licence
              <ExternalLink className="h-3 w-3" />
            </a>{' '}
            and{' '}
            <a
              href="https://fdc.nal.usda.gov/data-documentation.html"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-700 underline hover:text-emerald-800 inline-flex items-center gap-0.5"
            >
              USDA FoodData Central CC0 1.0 Public Domain Dedication
              <ExternalLink className="h-3 w-3" />
            </a>
            , with recipe search powered by{' '}
            <a
              href="https://spoonacular.com/food-api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-700 underline hover:text-emerald-800 inline-flex items-center gap-0.5"
            >
              Spoonacular Food API Terms
              <ExternalLink className="h-3 w-3" />
            </a>{' '}
            and AI insights via Google Gemini API.
          </p>
          <p className="text-stone-500">
            <strong>Academic Disclaimer:</strong> This application is an <strong>SMU course project</strong> and is not affiliated with, sponsored by, or endorsed by NutriBalance, Smithery, USDA, or any supermarket or delivery provider mentioned.
          </p>
        </div>
        <div className="flex items-center gap-4 self-end md:self-center">
          <Link
            to="/pricing"
            className="text-stone-600 hover:text-emerald-700 font-medium transition-colors"
          >
            Subscription Tiers
          </Link>
          <span className="text-stone-300">•</span>
          <Link
            to="/admin"
            className="text-stone-400 hover:text-stone-700 transition-colors"
            title="Internal Revenue & Unit Economics Metric"
          >
            Internal Admin (/admin)
          </Link>
        </div>
      </div>
    </footer>
  );
};
