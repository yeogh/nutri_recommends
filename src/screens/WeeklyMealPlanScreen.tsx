import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  RefreshCw,
  ThumbsUp,
  MessageSquare,
  Link2,
  Check,
  Clock,
  Flame,
  AlertTriangle,
  Lock,
  Unlock,
  Sparkles,
  Activity,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DietaryMode } from '../types';
import { AdBanner } from '../components/AdBanner';

const DIETARY_MODES: { value: DietaryMode; label: string }[] = [
  { value: 'standard', label: 'Standard Balanced' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan (100% Plant)' },
  { value: 'keto', label: 'Keto Low-Carb' },
  { value: 'high-protein', label: 'High-Protein' },
];

export const WeeklyMealPlanScreen: React.FC = () => {
  const {
    familyMembers,
    meals,
    selectedDietaryMode,
    voteForMeal,
    addMealFeedback,
    replaceMealsFromMcp,
    planLocked,
    setPlanLocked,
    dailyEatingScore,
  } = useApp();

  const navigate = useNavigate();
  const [activeVoter, setActiveVoter] = useState<string>(familyMembers[0].name);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [mcpLoading, setMcpLoading] = useState<boolean>(false);
  const [mcpBanner, setMcpBanner] = useState<{ status: 'ok' | 'warn'; message: string } | null>(null);

  const handleCopyPersonalLink = (token: string, memberName: string) => {
    const shareUrl = `${window.location.origin}/?voter=${encodeURIComponent(memberName)}&token=${token}`;
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleRefreshFromNutriBalanceMcp = async (mode: DietaryMode) => {
    setMcpLoading(true);
    setMcpBanner(null);
    try {
      const response = await fetch('/api/nutribalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'generate_meal_plan',
          args: {
            dietaryMode: mode,
            householdTdeeTotal: familyMembers.reduce((sum, m) => sum + m.tdee, 0),
            allergies: Array.from(new Set(familyMembers.flatMap((m) => m.allergies))),
          },
        }),
      });
      const payload = await response.json();
      replaceMealsFromMcp(mode);
      if (response.ok && payload.ok) {
        setMcpBanner({
          status: 'ok',
          message: `Synced live TDEE & ${mode.toUpperCase()} meal plan from NutriBalance MCP.`,
        });
      } else {
        setMcpBanner({
          status: 'warn',
          message: `${payload.error || 'MCP upstream returned non-200.'} Applied local NutriBalance ${mode.toUpperCase()} macro & nutrient profile.`,
        });
      }
    } catch {
      replaceMealsFromMcp(mode);
      setMcpBanner({
        status: 'warn',
        message: `Updated weekly suggestions to ${mode.toUpperCase()} mode using cached NutriBalance macro models.`,
      });
    } finally {
      setMcpLoading(false);
    }
  };

  const handleLockAndSyncGrocery = () => {
    setPlanLocked(true);
    navigate('/grocery');
  };

  const householdAllergies = Array.from(new Set(familyMembers.flatMap((m) => m.allergies)));
  const avgDailyCalories = Math.round(
    familyMembers.reduce((sum, m) => sum + m.tdee, 0) / familyMembers.length
  );

  return (
    <div className="space-y-8">
      {/* Top Header & NutriBalance MCP Bar */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>NutriBalance MCP • Household Macro &amp; Allergy Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              Weekly Family Dinner Plan &amp; Voting Board
            </h1>
            <p className="text-sm text-stone-600 max-w-2xl">
              Review proposed dinners tailored to each family member’s TDEE, macro targets, and allergy guardrails. Share personal voting links with the household—no accounts required.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setPlanLocked(!planLocked)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                planLocked
                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  : 'bg-stone-900 text-white hover:bg-stone-800'
              }`}
            >
              {planLocked ? (
                <>
                  <Unlock className="h-4 w-4" />
                  Unlock Plan Voting
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Lock Top-Voted Plan
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLockAndSyncGrocery}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <span>Lock &amp; Build Grocery List</span>
            </button>
          </div>
        </div>

        {/* Dietary Mode Selector & MCP Refresh */}
        <div className="mt-6 pt-6 border-t border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 mr-1">
              NutriBalance Mode:
            </span>
            {DIETARY_MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                disabled={mcpLoading}
                onClick={() => handleRefreshFromNutriBalanceMcp(m.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  selectedDietaryMode === m.value
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={mcpLoading}
            onClick={() => handleRefreshFromNutriBalanceMcp(selectedDietaryMode)}
            className="inline-flex items-center gap-2 self-start md:self-auto rounded-lg border border-emerald-200 bg-emerald-50/70 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${mcpLoading ? 'animate-spin' : ''}`} />
            <span>
              {mcpLoading ? 'Calling nutribalance-mcp...' : 'Refresh Plan via nutribalance-mcp'}
            </span>
          </button>
        </div>

        {mcpBanner && (
          <div
            className={`mt-4 rounded-xl border px-4 py-2.5 text-xs font-medium ${
              mcpBanner.status === 'ok'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            {mcpBanner.message}
          </div>
        )}
      </div>

      {/* Household Profiles, TDEE & Passwordless Personal Voting Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              <h2 className="text-base font-bold text-stone-900">
                Household Members &amp; No-Account Voting Links
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <span>Voting as:</span>
              <select
                value={activeVoter}
                onChange={(e) => setActiveVoter(e.target.value)}
                className="rounded-lg border border-stone-300 bg-white px-2.5 py-1 font-semibold text-stone-900"
              >
                {familyMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className={`rounded-xl border p-3.5 transition-colors ${
                  activeVoter === member.name
                    ? 'border-emerald-500 bg-emerald-50/30'
                    : 'border-stone-200 bg-stone-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-stone-900">{member.name}</p>
                    <p className="text-xs text-stone-500">
                      TDEE: <strong className="text-stone-800">{member.tdee} kcal/day</strong> •{' '}
                      <span className="capitalize">{member.dietaryPreference}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyPersonalLink(member.shareToken, member.name)}
                    className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
                    title="Copy personal feedback & voting link (no login required)"
                  >
                    {copiedToken === member.shareToken ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-700">Copied Link</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="h-3 w-3 text-stone-500" />
                        <span>Share Link</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {member.allergies.length > 0 ? (
                    member.allergies.map((alg) => (
                      <span
                        key={alg}
                        className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-800"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        Allergy: {alg}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-stone-500">No food allergies</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NutriBalance Nutrient Deficiency & Score Summary */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                <h2 className="text-base font-bold text-stone-900">
                  NutriBalance Diagnostics
                </h2>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                Score {dailyEatingScore}/100
              </span>
            </div>
            <p className="text-xs text-stone-600">
              Household average TDEE is <strong>{avgDailyCalories} kcal/day</strong>. Active exclusions:{' '}
              <strong>{householdAllergies.join(', ')}</strong> (strictly filtered).
            </p>
            <div className="rounded-xl bg-stone-50 p-3 border border-stone-200/80 space-y-2 text-xs">
              <p className="font-semibold text-stone-800">
                Nutrient-Deficiency Guidance (nutribalance-mcp):
              </p>
              <ul className="list-disc pl-4 space-y-1 text-stone-600">
                <li>
                  <strong>Omega-3 &amp; Vitamin D:</strong> Covered by Monday’s Salmon + Quinoa Pilaf.
                </li>
                <li>
                  <strong>Plant Iron + Vitamin C:</strong> Paired in Tuesday &amp; Thursday legume bowls for Maya (Vegetarian).
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Top-voted picks flow to Grocery Sync</span>
            <span className="font-semibold text-emerald-700">{meals.length} Dinners Planned</span>
          </div>
        </div>
      </div>

      {/* Contextual Free-Tier Ad Placement */}
      <AdBanner
        placement="Weekly Planner Feed"
        sponsorTag="Supermarket Chain Partner Offer"
        headline="Save $15 on Wild Alaskan Salmon & Organic Produce Bundles"
        copy="Pre-matched to your household’s NutriBalance weekly dinner plan. Zero peanut or shellfish cross-contact."
        ctaText="Claim $15 Voucher"
      />

      {/* Weekly Meal Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {meals.map((meal) => {
          const hasVoted = meal.votedBy.includes(activeVoter);
          return (
            <div
              key={meal.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-colors"
            >
              <div>
                {/* Day & Prep Time */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white">
                      {meal.day}
                    </span>
                    <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium capitalize text-stone-700">
                      {meal.dietaryMode}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                    <Clock className="h-3.5 w-3.5 text-stone-400" />
                    <span>{meal.prepTimeMinutes} mins prep</span>
                  </div>
                </div>

                {/* Recipe Title */}
                <h3 className="text-lg font-bold text-stone-900 leading-snug">
                  {meal.name}
                </h3>
                <p className="mt-1 text-xs font-medium text-emerald-700">
                  {meal.nutrientHighlight}
                </p>

                {/* Per-Serving Macros Bar */}
                <div className="mt-4 grid grid-cols-4 gap-2 rounded-xl bg-stone-50 p-3 border border-stone-200/70 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-[11px] text-stone-500">
                      <Flame className="h-3 w-3 text-orange-500" />
                      <span>Calories</span>
                    </div>
                    <p className="text-sm font-bold text-stone-900">{meal.macros.calories}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-500 block">Protein</span>
                    <p className="text-sm font-bold text-emerald-700">{meal.macros.protein}g</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-500 block">Carbs</span>
                    <p className="text-sm font-bold text-stone-900">{meal.macros.carbs}g</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-500 block">Fat</span>
                    <p className="text-sm font-bold text-stone-900">{meal.macros.fat}g</p>
                  </div>
                </div>

                {/* Household Votes & Feedback Thread */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={planLocked}
                      onClick={() => voteForMeal(meal.id, activeVoter)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                        hasVoted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      } ${planLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{meal.votes} Votes</span>
                    </button>
                    <span className="text-xs text-stone-500 truncate max-w-[210px]">
                      {meal.votedBy.length > 0
                        ? `Backed by ${meal.votedBy.join(', ')}`
                        : 'No votes yet'}
                    </span>
                  </div>
                </div>

                {/* Feedback comments */}
                {meal.feedback.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-stone-100 pt-3">
                    {meal.feedback.map((fb) => (
                      <div
                        key={fb.id}
                        className="rounded-lg bg-stone-50 px-3 py-1.5 text-xs text-stone-700 flex items-start justify-between gap-2"
                      >
                        <div>
                          <span className="font-semibold text-stone-900">{fb.memberName}: </span>
                          <span>{fb.comment}</span>
                        </div>
                        <span className="text-[10px] text-stone-400 shrink-0">{fb.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Leave Feedback via Personal Link Input */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-stone-400 shrink-0" />
                <input
                  type="text"
                  value={feedbackInputs[meal.id] || ''}
                  onChange={(e) =>
                    setFeedbackInputs((prev) => ({ ...prev, [meal.id]: e.target.value }))
                  }
                  placeholder={`Feedback as ${activeVoter} (no login needed)...`}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-800 placeholder:text-stone-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    addMealFeedback(meal.id, activeVoter, feedbackInputs[meal.id] || '');
                    setFeedbackInputs((prev) => ({ ...prev, [meal.id]: '' }));
                  }}
                  className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer shrink-0"
                >
                  Post
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
