import React, { useState } from 'react';
import {
  Utensils,
  Clock,
  Flame,
  CheckSquare,
  Square,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdBanner } from '../components/AdBanner';

export const DailyCookingViewScreen: React.FC = () => {
  const { meals, familyMembers } = useApp();
  const [selectedMealId, setSelectedMealId] = useState<string>(meals[0]?.id || 'meal-1');
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const activeMeal = meals.find((m) => m.id === selectedMealId) || meals[0];

  const toggleIngredient = (name: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (!activeMeal) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Stripped-Down Daily Touchpoint Header */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Primary Daily Kitchen Touchpoint
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
                Today’s Family Dinner Prep
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="day-select" className="text-xs font-medium text-stone-500">
              Switch Day:
            </label>
            <select
              id="day-select"
              value={activeMeal.id}
              onChange={(e) => {
                setSelectedMealId(e.target.value);
                setCheckedIngredients({});
                setCompletedSteps({});
              }}
              className="rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-900"
            >
              {meals.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.day}: {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Recipe Hero Summary */}
        <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-block rounded-md bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white mb-2">
              {activeMeal.day} Dinner
            </span>
            <h2 className="text-2xl font-extrabold text-stone-900">{activeMeal.name}</h2>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              {activeMeal.nutrientHighlight}
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-xl bg-stone-50 px-4 py-3 border border-stone-200/80 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span>{activeMeal.prepTimeMinutes} mins</span>
            </div>
            <div className="h-4 w-px bg-stone-200" />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>{activeMeal.macros.calories} kcal/serving</span>
            </div>
            <div className="h-4 w-px bg-stone-200" />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <Users className="h-4 w-4" />
              <span>{familyMembers.length} Servings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist + Step-by-Step Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ingredient Checklist */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs h-fit">
          <h3 className="text-base font-bold text-stone-900 mb-1">
            Ingredient Checklist
          </h3>
          <p className="text-xs text-stone-500 mb-4">
            Tap each item as you set up your kitchen counter.
          </p>

          <div className="space-y-2.5">
            {activeMeal.ingredients.map((ing) => {
              const checked = !!checkedIngredients[ing.name];
              return (
                <button
                  key={ing.name}
                  type="button"
                  onClick={() => toggleIngredient(ing.name)}
                  className={`w-full flex items-center justify-between gap-2 rounded-xl border p-3 text-left text-xs transition-colors cursor-pointer ${
                    checked
                      ? 'border-emerald-200 bg-emerald-50/60 text-stone-400 line-through'
                      : 'border-stone-200 bg-stone-50/50 text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {checked ? (
                      <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-stone-400 shrink-0" />
                    )}
                    <span className="font-semibold">{ing.name}</span>
                  </div>
                  <span className="text-[11px] font-medium text-stone-500 shrink-0">
                    {ing.quantity} {ing.unit}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step-by-Step Cooking Instructions */}
        <div className="md:col-span-2 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <h3 className="text-base font-bold text-stone-900 mb-1">
            Step-by-Step Cooking Instructions
          </h3>
          <p className="text-xs text-stone-500 mb-4">
            Includes dietary &amp; allergy-safe prep notes for all {familyMembers.length} household members.
          </p>

          <div className="space-y-3">
            {activeMeal.steps.map((step, index) => {
              const done = !!completedSteps[index];
              return (
                <div
                  key={index}
                  onClick={() => toggleStep(index)}
                  className={`rounded-xl border p-4 transition-colors cursor-pointer ${
                    done
                      ? 'border-emerald-200 bg-emerald-50/40 text-stone-400'
                      : 'border-stone-200 bg-white hover:border-stone-300 text-stone-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        done
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                    </div>
                    <p className={`text-sm leading-relaxed ${done ? 'line-through' : ''}`}>
                      {step}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AdBanner
        placement="Daily Cooking Companion"
        sponsorTag="Kitchen Appliance Sponsor"
        headline="Smart Convection Oven Presets for NutriRecommends Recipes"
        copy="Send cooking times and temperatures straight to your countertop oven."
        ctaText="Explore Partner Perks"
      />
    </div>
  );
};
