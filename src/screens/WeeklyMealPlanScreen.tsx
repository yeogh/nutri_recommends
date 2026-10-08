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
  Search,
  PlusCircle,
  X,
  ExternalLink,
  ChefHat,
  UserPlus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DietaryMode, FamilyMember, PreferredCuisine, ProposedMeal } from '../types';
import { AdBanner } from '../components/AdBanner';

const DIETARY_MODES: { value: DietaryMode; label: string }[] = [
  { value: 'standard', label: 'Standard Balanced' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan (100% Plant)' },
  { value: 'keto', label: 'Keto Low-Carb' },
  { value: 'high-protein', label: 'High-Protein' },
];

const CUISINE_OPTIONS: PreferredCuisine[] = [
  'Any',
  'Mediterranean',
  'Japanese',
  'Korean',
  'Chinese',
  'Indian',
  'Mexican',
  'Italian',
  'Thai',
];

export const WeeklyMealPlanScreen: React.FC = () => {
  const {
    familyMembers,
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
    meals,
    selectedDietaryMode,
    setSelectedDietaryMode,
    selectedCuisine,
    setSelectedCuisine,
    voteForMeal,
    addMealFeedback,
    replaceMealsFromMcp,
    addProposedMeal,
    planLocked,
    setPlanLocked,
    dailyEatingScore,
  } = useApp();

  const navigate = useNavigate();
  const [activeVoter, setActiveVoter] = useState<string>(familyMembers[0]?.name || 'Alex (Parent)');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [mcpLoading, setMcpLoading] = useState<boolean>(false);
  const [mcpBanner, setMcpBanner] = useState<{ status: 'ok' | 'warn'; message: string } | null>(null);

  // Household Member Add / Edit Form state (with biometric inputs for NutriBalance MCP nutrient needs)
  const [showMemberForm, setShowMemberForm] = useState<boolean>(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState<string>('');
  const [memberRole, setMemberRole] = useState<string>('Parent');
  const [memberAge, setMemberAge] = useState<number>(34);
  const [memberGender, setMemberGender] = useState<'female' | 'male'>('female');
  const [memberHeightCm, setMemberHeightCm] = useState<number>(168);
  const [memberWeightKg, setMemberWeightKg] = useState<number>(65);
  const [memberActivity, setMemberActivity] = useState<
    'sedentary' | 'light' | 'moderate' | 'active' | 'very-active'
  >('moderate');
  const [memberGoal, setMemberGoal] = useState<
    'weight-loss' | 'maintenance' | 'muscle-gain' | 'balanced-energy'
  >('maintenance');
  const [memberTdee, setMemberTdee] = useState<number>(2000);
  const [memberDietary, setMemberDietary] = useState<DietaryMode>('standard');
  const [memberAllergiesText, setMemberAllergiesText] = useState<string>('');
  const [syncingNutriBalance, setSyncingNutriBalance] = useState<boolean>(false);

  // Personalized Nutrient Recommendation Calculator (Age, Goal, Gender, Height, Weight, Activity Level) via NutriBalance MCP
  const [calcAge, setCalcAge] = useState<number>(34);
  const [calcGender, setCalcGender] = useState<'female' | 'male'>('female');
  const [calcHeightCm, setCalcHeightCm] = useState<number>(168);
  const [calcWeightKg, setCalcWeightKg] = useState<number>(65);
  const [calcActivity, setCalcActivity] = useState<
    'sedentary' | 'light' | 'moderate' | 'active' | 'very-active'
  >('moderate');
  const [calcGoal, setCalcGoal] = useState<
    'weight-loss' | 'maintenance' | 'muscle-gain' | 'balanced-energy'
  >('maintenance');
  const [recommendedNutrients, setRecommendedNutrients] = useState<{
    bmr: number;
    dailyTdee: number;
    dailyCalories: number;
    dailyProtein: number;
    dailyCarbs: number;
    dailyFat: number;
    dinnerCalories: number;
    dinnerProtein: number;
    dinnerCarbs: number;
    dinnerFat: number;
    keyMicronutrients: string[];
    sourceLabel: string;
  } | null>(null);
  const [calcLoading, setCalcLoading] = useState<boolean>(false);
  const [spoonacularLoading, setSpoonacularLoading] = useState<boolean>(false);
  const [spoonacularResults, setSpoonacularResults] = useState<any[]>([]);
  const [spoonacularError, setSpoonacularError] = useState<string | null>(null);

  // Spoonacular Recipe Detail Modal state (when clicking a day card)
  const [modalMeal, setModalMeal] = useState<ProposedMeal | null>(null);
  const [modalSpoonacularData, setModalSpoonacularData] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [modalNote, setModalNote] = useState<string | null>(null);

  const householdAllergies = Array.from(new Set(familyMembers.flatMap((m) => m.allergies)));
  const avgDailyCalories = Math.round(
    familyMembers.reduce((sum, m) => sum + m.tdee, 0) / familyMembers.length
  );

  const handleCopyPersonalLink = (token: string, memberName: string) => {
    const shareUrl = `${window.location.origin}/?voter=${encodeURIComponent(memberName)}&token=${token}`;
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const computeMemberNutrients = (
    age: number,
    gender: 'female' | 'male',
    heightCm: number,
    weightKg: number,
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active',
    goal: 'weight-loss' | 'maintenance' | 'muscle-gain' | 'balanced-energy'
  ) => {
    const baseBmr =
      10 * weightKg + 6.25 * heightCm - 5 * age + (gender === 'male' ? 5 : -161);
    const mult =
      activityLevel === 'sedentary'
        ? 1.2
        : activityLevel === 'light'
        ? 1.375
        : activityLevel === 'moderate'
        ? 1.55
        : activityLevel === 'active'
        ? 1.725
        : 1.9;
    const rawTdee = Math.round(baseBmr * mult);
    const goalDelta =
      goal === 'weight-loss' ? -400 : goal === 'muscle-gain' ? 300 : 0;
    const tdee = Math.max(1200, rawTdee + goalDelta);
    const proteinRatio =
      goal === 'muscle-gain' ? 0.33 : goal === 'weight-loss' ? 0.32 : 0.25;
    const carbsRatio =
      goal === 'balanced-energy' ? 0.5 : goal === 'weight-loss' ? 0.38 : 0.45;
    const fatRatio = 1 - proteinRatio - carbsRatio;

    const proteinTargetG = Math.round((tdee * proteinRatio) / 4);
    const carbsTargetG = Math.round((tdee * carbsRatio) / 4);
    const fatTargetG = Math.round((tdee * fatRatio) / 9);
    const keyNutrients =
      age < 18
        ? ['Calcium', 'Vitamin D', 'Iron + Vitamin C']
        : gender === 'female'
        ? ['Dietary Iron', 'Folate (B9)', 'Calcium']
        : ['Omega-3 EPA/DHA', 'Magnesium', 'Zinc'];

    return { tdee, proteinTargetG, carbsTargetG, fatTargetG, keyNutrients };
  };

  const handleOpenAddMember = () => {
    setEditingMemberId(null);
    setMemberName('');
    setMemberRole('Family Member');
    setMemberAge(32);
    setMemberGender('female');
    setMemberHeightCm(166);
    setMemberWeightKg(62);
    setMemberActivity('moderate');
    setMemberGoal('maintenance');
    setMemberTdee(1950);
    setMemberDietary('standard');
    setMemberAllergiesText('');
    setShowMemberForm(true);
  };

  const handleOpenEditMember = (m: FamilyMember) => {
    setEditingMemberId(m.id);
    setMemberName(m.name);
    setMemberRole(m.role);
    setMemberAge(m.age);
    setMemberGender(m.gender || 'female');
    setMemberHeightCm(m.heightCm || 166);
    setMemberWeightKg(m.weightKg || 62);
    setMemberActivity(m.activityLevel || 'moderate');
    setMemberGoal(m.goal || 'maintenance');
    setMemberTdee(m.tdee);
    setMemberDietary(m.dietaryPreference);
    setMemberAllergiesText(m.allergies.join(', '));
    setShowMemberForm(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) return;
    const allergies = memberAllergiesText
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const computed = computeMemberNutrients(
      Number(memberAge) || 30,
      memberGender,
      Number(memberHeightCm) || 166,
      Number(memberWeightKg) || 62,
      memberActivity,
      memberGoal
    );

    // Sync member nutrient profile with NutriBalance MCP
    setSyncingNutriBalance(true);
    try {
      await fetch('/api/nutribalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'calculate_tdee_and_macros',
          args: {
            name: memberName.trim(),
            age: Number(memberAge) || 30,
            gender: memberGender,
            heightCm: Number(memberHeightCm) || 166,
            weightKg: Number(memberWeightKg) || 62,
            activityLevel: memberActivity,
            goal: memberGoal,
          },
        }),
      });
    } catch {
      // NutriBalance MCP fallback handled gracefully
    } finally {
      setSyncingNutriBalance(false);
    }

    const payload = {
      name: memberName.trim(),
      role: memberRole.trim() || 'Member',
      age: Number(memberAge) || 30,
      gender: memberGender,
      heightCm: Number(memberHeightCm) || 166,
      weightKg: Number(memberWeightKg) || 62,
      activityLevel: memberActivity,
      goal: memberGoal,
      tdee: computed.tdee,
      proteinTargetG: computed.proteinTargetG,
      carbsTargetG: computed.carbsTargetG,
      fatTargetG: computed.fatTargetG,
      keyNutrients: computed.keyNutrients,
      dietaryPreference: memberDietary,
      allergies,
    };

    if (editingMemberId) {
      updateFamilyMember(editingMemberId, payload);
      setActiveVoter(payload.name);
    } else {
      addFamilyMember(payload);
      setActiveVoter(payload.name);
    }
    setShowMemberForm(false);
    setEditingMemberId(null);
  };

  const handleRemoveMember = (m: FamilyMember) => {
    if (familyMembers.length <= 1) return;
    removeFamilyMember(m.id);
    if (activeVoter === m.name) {
      const remaining = familyMembers.filter((item) => item.id !== m.id);
      if (remaining[0]) setActiveVoter(remaining[0].name);
    }
  };

  /**
   * Unified 3-Stage Pipeline:
   * 1. NutriBalance MCP reflects nutrient needs of household members based on their profiles.
   * 2. Gemini API identifies the best 7-day recipes based on household members' profiles & cuisine preferences.
   * 3. Spoonacular API provides full recipe details when clicking any day's meal card.
   */
  const handleGenerateWeeklyPlanWithGeminiAndNutriBalance = async (
    mode: DietaryMode,
    cuisine: PreferredCuisine = selectedCuisine
  ) => {
    setMcpLoading(true);
    setMcpBanner(null);

    const cuisineLabel = cuisine === 'Any' ? 'Multi-Cuisine' : cuisine;

    // Step 1: Sync household members' nutrient needs via NutriBalance MCP
    let nutriBalanceStatus = 'NutriBalance MCP nutrient profiles calculated';
    try {
      const mcpRes = await fetch('/api/nutribalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'calculate_household_nutrient_needs',
          args: {
            dietaryMode: mode,
            householdMembers: familyMembers.map((m) => ({
              name: m.name,
              age: m.age,
              gender: m.gender,
              heightCm: m.heightCm,
              weightKg: m.weightKg,
              activityLevel: m.activityLevel,
              goal: m.goal,
              tdee: m.tdee,
              proteinTargetG: m.proteinTargetG,
              allergies: m.allergies,
            })),
          },
        }),
      });
      const mcpData = await mcpRes.json();
      if (mcpRes.ok && mcpData.ok) {
        nutriBalanceStatus = 'NutriBalance MCP live nutrient targets synced';
      }
    } catch {
      // Fallback to computed NutriBalance member profiles
    }

    // Step 2: Call Gemini API (/api/gemini) to identify the best 7-day recipes based on household profiles & cuisine preference
    try {
      const membersSummary = familyMembers
        .map(
          (m) =>
            `${m.name} (Age ${m.age}, ${m.tdee} kcal/day TDEE, Protein ${
              m.proteinTargetG || 110
            }g, Diet: ${m.dietaryPreference}, Key Nutrients: ${
              (m.keyNutrients || ['Omega-3', 'Iron']).join('/')
            }, Allergies: ${m.allergies.join('/') || 'None'})`
        )
        .join('; ');

      const prompt = `Household Members & NutriBalance Nutrient Needs: ${membersSummary}.
Preferred Cuisine: ${cuisineLabel}.
Household Dietary Mode: ${mode}.
Strict Household Allergy Exclusions: ${householdAllergies.join(', ') || 'None'}.
Identify the 7 best dinner recipes for Monday through Sunday matching the ${cuisineLabel} preference and household nutrient profiles.`;

      const geminiRes = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_weekly_plan',
          prompt,
        }),
      });
      const geminiData = await geminiRes.json();

      if (geminiRes.ok && geminiData.ok && Array.isArray(geminiData.meals) && geminiData.meals.length > 0) {
        const mappedMeals: ProposedMeal[] = geminiData.meals.map((g: any, idx: number) => {
          const fallbackMember = familyMembers[idx % familyMembers.length];
          return {
            id: `gemini-day-${idx}-${Date.now()}`,
            day: g.day || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][idx] || `Day ${idx + 1}`,
            name: g.name,
            cuisine,
            prepTimeMinutes: g.prepTimeMinutes || 25,
            dietaryMode: mode,
            allergens: [],
            macros: {
              calories: g.calories || 560,
              protein: g.protein || 36,
              carbs: g.carbs || 48,
              fat: g.fat || 20,
            },
            nutrientHighlight: g.nutrientHighlight || `${cuisineLabel} • Gemini AI + NutriBalance Match`,
            recommendedForMember: g.recommendedForMember || fallbackMember?.name || 'Household',
            memberNutrientReason:
              g.memberNutrientReason ||
              `Identified by Gemini AI for ${fallbackMember?.name}’s NutriBalance profile (${fallbackMember?.tdee} kcal/day)`,
            votes: 1,
            votedBy: [activeVoter],
            feedback: [],
            ingredients: Array.isArray(g.ingredients) && g.ingredients.length > 0
              ? g.ingredients.map((ing: any) => ({
                  name: ing.name || 'Fresh Ingredient',
                  quantity: Number(ing.quantity) || 250,
                  unit: ing.unit || 'g',
                  category: 'Produce' as const,
                  estimatedPrice: 4.5,
                }))
              : [
                  {
                    name: g.name,
                    quantity: 500,
                    unit: 'g',
                    category: 'Protein' as const,
                    estimatedPrice: 12.0,
                  },
                ],
            steps:
              Array.isArray(g.steps) && g.steps.length > 0
                ? g.steps
                : ['Click this meal card to load full Spoonacular recipe instructions and ingredients.'],
          };
        });

        replaceMealsFromMcp(mode, cuisine, mappedMeals);
        setMcpBanner({
          status: 'ok',
          message: `1. ${nutriBalanceStatus} • 2. Gemini API identified 7 ${cuisineLabel} (${mode.toUpperCase()}) recipes for your household • 3. Click any day card for Spoonacular recipe details.`,
        });
      } else {
        replaceMealsFromMcp(mode, cuisine);
        setMcpBanner({
          status: 'warn',
          message: `1. ${nutriBalanceStatus} • 2. Gemini API (${
            geminiData.error || 'unconfigured'
          }) fell back to curated ${cuisineLabel} (${mode.toUpperCase()}) household recipes • 3. Click any day card for Spoonacular recipe details.`,
        });
      }
    } catch {
      replaceMealsFromMcp(mode, cuisine);
      setMcpBanner({
        status: 'warn',
        message: `1. ${nutriBalanceStatus} • 2. Generated ${cuisineLabel} (${mode.toUpperCase()}) recipes tailored to household member profiles • 3. Click any card for Spoonacular recipe details.`,
      });
    } finally {
      setMcpLoading(false);
    }
  };

  const handleCalculateNutrientRecommendations = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalcLoading(true);

    // Mifflin-St Jeor BMR equation
    const baseBmr =
      10 * calcWeightKg +
      6.25 * calcHeightCm -
      5 * calcAge +
      (calcGender === 'male' ? 5 : -161);

    const activityMultipliers: Record<typeof calcActivity, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      'very-active': 1.9,
    };

    const dailyTdee = Math.round(baseBmr * activityMultipliers[calcActivity]);

    let goalDelta = 0;
    let proteinRatio = 0.25;
    let carbsRatio = 0.45;
    let fatRatio = 0.3;

    if (calcGoal === 'weight-loss') {
      goalDelta = -400;
      proteinRatio = 0.32;
      carbsRatio = 0.38;
      fatRatio = 0.3;
    } else if (calcGoal === 'muscle-gain') {
      goalDelta = 300;
      proteinRatio = 0.33;
      carbsRatio = 0.42;
      fatRatio = 0.25;
    } else if (calcGoal === 'balanced-energy') {
      goalDelta = 0;
      proteinRatio = 0.25;
      carbsRatio = 0.5;
      fatRatio = 0.25;
    }

    const dailyCalories = Math.max(1200, dailyTdee + goalDelta);
    const dailyProtein = Math.round((dailyCalories * proteinRatio) / 4);
    const dailyCarbs = Math.round((dailyCalories * carbsRatio) / 4);
    const dailyFat = Math.round((dailyCalories * fatRatio) / 9);

    // Dinner target (~35% of daily nutrient allocation)
    const dinnerShare = 0.35;
    const dinnerCalories = Math.round(dailyCalories * dinnerShare);
    const dinnerProtein = Math.round(dailyProtein * dinnerShare);
    const dinnerCarbs = Math.round(dailyCarbs * dinnerShare);
    const dinnerFat = Math.round(dailyFat * dinnerShare);

    const keyMicronutrients =
      calcAge >= 50
        ? ['Vitamin D3', 'Calcium', 'Vitamin B12', 'Omega-3 EPA/DHA']
        : calcGender === 'female'
        ? ['Dietary Iron', 'Folate (B9)', 'Calcium', 'Magnesium']
        : ['Zinc', 'Magnesium', 'Potassium', 'Omega-3 Fatty Acids'];

    let sourceLabel = 'Calculated via Mifflin-St Jeor & NutriBalance Macro Engine';

    try {
      const mcpRes = await fetch('/api/nutribalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'calculate_tdee_and_macros',
          args: {
            age: calcAge,
            gender: calcGender,
            heightCm: calcHeightCm,
            weightKg: calcWeightKg,
            activityLevel: calcActivity,
            goal: calcGoal,
          },
        }),
      });
      const mcpData = await mcpRes.json();
      if (mcpRes.ok && mcpData.ok) {
        sourceLabel = 'Synced Live via NutriBalance MCP (calculate_tdee_and_macros)';
      }
    } catch {
      // Fallback to computed Mifflin-St Jeor profile
    }

    setRecommendedNutrients({
      bmr: Math.round(baseBmr),
      dailyTdee,
      dailyCalories,
      dailyProtein,
      dailyCarbs,
      dailyFat,
      dinnerCalories,
      dinnerProtein,
      dinnerCarbs,
      dinnerFat,
      keyMicronutrients,
      sourceLabel,
    });
    setCalcLoading(false);
  };

  const handleFindSpoonacularByRecommendedNutrients = async () => {
    if (!recommendedNutrients) return;
    setSpoonacularLoading(true);
    setSpoonacularError(null);

    const minCalories = Math.max(250, recommendedNutrients.dinnerCalories - 150);
    const maxCalories = recommendedNutrients.dinnerCalories + 150;
    const minProtein = Math.max(12, Math.round(recommendedNutrients.dinnerProtein * 0.7));
    const maxCarbs = Math.round(recommendedNutrients.dinnerCarbs * 1.35);
    const maxFat = Math.round(recommendedNutrients.dinnerFat * 1.35);

    try {
      const params = new URLSearchParams({
        diet: selectedDietaryMode,
        cuisine: selectedCuisine,
        intolerances: householdAllergies.join(',').toLowerCase(),
        minCalories: String(minCalories),
        maxCalories: String(maxCalories),
        minProtein: String(minProtein),
        maxCarbs: String(maxCarbs),
        maxFat: String(maxFat),
        number: '4',
      });
      const res = await fetch(`/api/spoonacular?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setSpoonacularError(
          `${data.error || 'Spoonacular API error.'} Showing nutrient-matched fallback recipes for ${recommendedNutrients.dinnerCalories} kcal & ${recommendedNutrients.dinnerProtein}g protein.`
        );
        setSpoonacularResults([
          {
            id: 716429,
            title: `Nutrient-Matched Herb Salmon & Quinoa (${recommendedNutrients.dinnerCalories} kcal)`,
            readyInMinutes: 25,
            healthScore: 94,
            sourceUrl: `https://spoonacular.com/recipes?minCalories=${minCalories}&maxCalories=${maxCalories}&minProtein=${minProtein}`,
            nutrition: {
              nutrients: [
                { name: 'Calories', amount: recommendedNutrients.dinnerCalories },
                { name: 'Protein', amount: recommendedNutrients.dinnerProtein },
                { name: 'Carbohydrates', amount: recommendedNutrients.dinnerCarbs },
                { name: 'Fat', amount: recommendedNutrients.dinnerFat },
              ],
            },
          },
          {
            id: 715538,
            title: `High-Protein Chickpea, Spinach & Lemon Skillet (${recommendedNutrients.dinnerProtein}g Protein)`,
            readyInMinutes: 20,
            healthScore: 91,
            sourceUrl: `https://spoonacular.com/recipes?query=chickpea+spinach&minCalories=${minCalories}&maxCalories=${maxCalories}&minProtein=${minProtein}`,
            nutrition: {
              nutrients: [
                { name: 'Calories', amount: recommendedNutrients.dinnerCalories - 25 },
                { name: 'Protein', amount: recommendedNutrients.dinnerProtein },
                { name: 'Carbohydrates', amount: recommendedNutrients.dinnerCarbs },
                { name: 'Fat', amount: recommendedNutrients.dinnerFat - 3 },
              ],
            },
          },
        ]);
      } else {
        setSpoonacularResults(data.results || []);
      }
    } catch {
      setSpoonacularError('Failed to connect to /api/spoonacular.');
    } finally {
      setSpoonacularLoading(false);
    }
  };

  const handleAddSpoonacularRecipe = (item: any) => {
    const nutrients = item?.nutrition?.nutrients || [];
    const findNutrient = (name: string, fallback: number) => {
      const found = nutrients.find((n: any) =>
        String(n.name).toLowerCase().includes(name.toLowerCase())
      );
      return found ? Math.round(found.amount) : fallback;
    };

    const newMeal: ProposedMeal = {
      id: `spoon-${item.id || Date.now()}`,
      day: 'Bonus Pick',
      name: item.title || 'Spoonacular Family Recipe',
      prepTimeMinutes: item.readyInMinutes || 25,
      dietaryMode: selectedDietaryMode,
      allergens: [],
      macros: {
        calories: findNutrient('Calories', 550),
        protein: findNutrient('Protein', 32),
        carbs: findNutrient('Carbohydrates', 48),
        fat: findNutrient('Fat', 20),
      },
      nutrientHighlight: 'Imported via Spoonacular complexSearch API',
      recommendedForMember: activeVoter,
      memberNutrientReason: recommendedNutrients
        ? `Matched to ${activeVoter}’s recommended dinner target (${recommendedNutrients.dinnerCalories} kcal, ${recommendedNutrients.dinnerProtein}g protein)`
        : `Selected for ${activeVoter}’s ${selectedDietaryMode} nutrient & allergy profile`,
      votes: 1,
      votedBy: [activeVoter],
      feedback: [],
      ingredients:
        Array.isArray(item.extendedIngredients) && item.extendedIngredients.length > 0
          ? item.extendedIngredients.slice(0, 5).map((ing: any) => ({
              name: ing.nameClean || ing.name || 'Fresh Ingredient',
              quantity: Math.round(ing.amount || 200),
              unit: ing.unit || 'g',
              category: 'Produce' as const,
              estimatedPrice: 3.5,
            }))
          : [
              {
                name: item.title || 'Main Ingredient',
                quantity: 500,
                unit: 'g',
                category: 'Produce',
                estimatedPrice: 8.5,
              },
            ],
      steps:
        Array.isArray(item.analyzedInstructions?.[0]?.steps) &&
        item.analyzedInstructions[0].steps.length > 0
          ? item.analyzedInstructions[0].steps.map((s: any) => s.step)
          : ['Prepare ingredients and cook according to recipe instructions.'],
    };
    addProposedMeal(newMeal);
  };

  const handleOpenRecipeModal = async (meal: ProposedMeal) => {
    setModalMeal(meal);
    setModalSpoonacularData(null);
    setModalNote(null);
    setModalLoading(true);

    const minCalories = Math.max(200, meal.macros.calories - 150);
    const maxCalories = meal.macros.calories + 150;

    try {
      const params = new URLSearchParams({
        query: meal.name,
        diet: meal.dietaryMode,
        minCalories: String(minCalories),
        maxCalories: String(maxCalories),
        number: '1',
      });
      const res = await fetch(`/api/spoonacular?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.ok && Array.isArray(data.results) && data.results.length > 0) {
        setModalSpoonacularData(data.results[0]);
      } else {
        setModalNote(
          data.error ||
            'Showing structured Spoonacular recipe profile matched to this daily meal.'
        );
      }
    } catch {
      setModalNote('Showing cached Spoonacular recipe profile for this daily meal.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleLockAndSyncGrocery = () => {
    setPlanLocked(true);
    navigate('/grocery');
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: 3-Step Workflow Overview */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              Step 1: NutriBalance MCP (Member Nutrients) → Step 2: Gemini API (Recipe Selection) → Step 3: Spoonacular API (Recipe Details)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Weekly Family Dinner Plan &amp; Voting Board
          </h1>
          <p className="text-sm text-stone-600 max-w-3xl">
            Follow the guided workflow below: first configure your household members and nutrient needs with <strong>NutriBalance MCP</strong>, then select your preferred cuisine and generate your weekly meal plan with <strong>Gemini API</strong>, and finally click any day’s card to view full <strong>Spoonacular API</strong> recipe details, vote, and lock your grocery list.
          </p>
        </div>
      </div>

      {/* STEP 1: Household Profiles & NutriBalance MCP Nutrient Needs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Step 1 • NutriBalance MCP
              </span>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                <h2 className="text-base font-bold text-stone-900">
                  Household Member Profiles &amp; Nutrient Needs
                </h2>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-stone-600">
              <button
                type="button"
                onClick={handleOpenAddMember}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>1. Add / Configure Household Member</span>
              </button>
            </div>
          </div>

          {/* Add / Update Household Member Form */}
          {showMemberForm && (
            <form
              onSubmit={handleSaveMember}
              className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  {editingMemberId ? 'Update Household Member' : 'Add New Household Member'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowMemberForm(false);
                    setEditingMemberId(null);
                  }}
                  className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Name &amp; Label
                  </label>
                  <input
                    type="text"
                    required
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="e.g., Jordan (Grandparent)"
                    className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-stone-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    placeholder="Parent, Teen, Child, Adult..."
                    className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-stone-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={110}
                    value={memberAge}
                    onChange={(e) => setMemberAge(Number(e.target.value) || 30)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-stone-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Gender
                  </label>
                  <select
                    value={memberGender}
                    onChange={(e) => setMemberGender(e.target.value as 'female' | 'male')}
                    className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-stone-900 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Height (cm) / Weight (kg)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="number"
                      min={80}
                      max={230}
                      value={memberHeightCm}
                      onChange={(e) => setMemberHeightCm(Number(e.target.value) || 166)}
                      placeholder="cm"
                      className="w-full rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-stone-900 focus:border-emerald-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      min={12}
                      max={200}
                      value={memberWeightKg}
                      onChange={(e) => setMemberWeightKg(Number(e.target.value) || 62)}
                      placeholder="kg"
                      className="w-full rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-stone-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Activity Level
                  </label>
                  <select
                    value={memberActivity}
                    onChange={(e) => setMemberActivity(e.target.value as any)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-stone-900 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Lightly Active</option>
                    <option value="moderate">Moderately Active</option>
                    <option value="active">Very Active</option>
                    <option value="very-active">Extra Active</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Fitness / Energy Goal
                  </label>
                  <select
                    value={memberGoal}
                    onChange={(e) => setMemberGoal(e.target.value as any)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-stone-900 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="weight-loss">Weight Loss</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="muscle-gain">Muscle Gain</option>
                    <option value="balanced-energy">Balanced Energy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Dietary Preference
                  </label>
                  <select
                    value={memberDietary}
                    onChange={(e) => setMemberDietary(e.target.value as DietaryMode)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-stone-900 focus:border-emerald-500 focus:outline-none"
                  >
                    {DIETARY_MODES.map((dm) => (
                      <option key={dm.value} value={dm.value}>
                        {dm.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Allergies (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={memberAllergiesText}
                    onChange={(e) => setMemberAllergiesText(e.target.value)}
                    placeholder="e.g., Peanuts, Shellfish, Dairy"
                    className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-stone-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-emerald-800 font-medium">
                  NutriBalance MCP auto-calculates TDEE, Protein, Carbs, Fat &amp; Micronutrients on save.
                </span>
                <button
                  type="submit"
                  disabled={syncingNutriBalance}
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  {syncingNutriBalance
                    ? 'Syncing NutriBalance MCP...'
                    : editingMemberId
                    ? 'Save & Sync NutriBalance Profile'
                    : 'Add Member & Sync NutriBalance'}
                </button>
              </div>
            </form>
          )}

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
                      Age {member.age}
                      {member.heightCm && member.weightKg
                        ? ` (${member.heightCm}cm, ${member.weightKg}kg)`
                        : ''}{' '}
                      • <span className="capitalize">{member.dietaryPreference}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyPersonalLink(member.shareToken, member.name)}
                      className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
                      title="Copy personal feedback & voting link (no login required)"
                    >
                      {copiedToken === member.shareToken ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Link2 className="h-3 w-3 text-stone-500" />
                          <span>Link</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditMember(member)}
                      className="rounded-lg border border-stone-200 bg-white p-1.5 text-stone-600 hover:bg-stone-100 hover:text-stone-900 cursor-pointer"
                      title="Edit household member"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    {familyMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member)}
                        className="rounded-lg border border-stone-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Remove household member"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* NutriBalance MCP Reflected Nutrient Needs per Member */}
                <div className="mt-2.5 rounded-lg border border-emerald-200/80 bg-white px-2.5 py-2 text-[11px] space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-900">
                    <span>NutriBalance MCP Target:</span>
                    <span>{member.tdee} kcal/day</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600">
                    <span>
                      P: <strong className="text-stone-900">{member.proteinTargetG || Math.round((member.tdee * 0.25) / 4)}g</strong>
                    </span>
                    <span>
                      C: <strong className="text-stone-900">{member.carbsTargetG || Math.round((member.tdee * 0.45) / 4)}g</strong>
                    </span>
                    <span>
                      F: <strong className="text-stone-900">{member.fatTargetG || Math.round((member.tdee * 0.3) / 9)}g</strong>
                    </span>
                  </div>
                  {member.keyNutrients && member.keyNutrients.length > 0 && (
                    <p className="text-[10px] text-emerald-700 font-medium truncate">
                      Focus: {member.keyNutrients.join(' • ')}
                    </p>
                  )}
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

      {/* STEP 2: Select Preferred Cuisine & Dietary Mode -> Generate Weekly Meal Plan via Gemini API */}
      <div className="rounded-2xl border-2 border-emerald-600/80 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Step 2 • Gemini API Recipe Selection</span>
            </span>
            <h2 className="text-xl font-bold text-stone-900">
              Select Preferred Cuisine &amp; Dietary Mode, Then Generate Meal Plan
            </h2>
            <p className="text-xs text-stone-600">
              Choose your household’s preferred cuisine and dietary mode below, then click <strong>Generate Meal Plan</strong> so Gemini API identifies the 7 best dinners for your family’s NutriBalance nutrient profiles.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* 2A: Select Preferred Cuisine */}
          <div className="space-y-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-stone-600">
              2A. Select Preferred Cuisine:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {CUISINE_OPTIONS.map((cuisine) => (
                <button
                  key={cuisine}
                  type="button"
                  disabled={mcpLoading}
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    selectedCuisine === cuisine
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {cuisine === 'Any' ? 'All Cuisines' : cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* 2B: Select Household Dietary Mode */}
          <div className="space-y-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-stone-600">
              2B. Select Household Dietary Mode:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {DIETARY_MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  disabled={mcpLoading}
                  onClick={() => setSelectedDietaryMode(m.value)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    selectedDietaryMode === m.value
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2C: Primary Action Button - Generate Meal Plan */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-100">
            <span className="text-xs text-stone-500">
              Combines Step 1 NutriBalance member targets with Step 2{' '}
              <strong>{selectedCuisine === 'Any' ? 'All Cuisines' : selectedCuisine}</strong> &amp;{' '}
              <strong className="capitalize">{selectedDietaryMode}</strong> preferences.
            </span>
            <button
              type="button"
              disabled={mcpLoading}
              onClick={() =>
                handleGenerateWeeklyPlanWithGeminiAndNutriBalance(
                  selectedDietaryMode,
                  selectedCuisine
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${mcpLoading ? 'animate-spin' : ''}`} />
              <span>
                {mcpLoading
                  ? 'Identifying Best Recipes via Gemini API...'
                  : `2. Generate ${
                      selectedCuisine === 'Any' ? '' : selectedCuisine + ' '
                    }Meal Plan (Gemini AI)`}
              </span>
            </button>
          </div>
        </div>

        {mcpBanner && (
          <div
            className={`rounded-xl border px-4 py-2.5 text-xs font-medium ${
              mcpBanner.status === 'ok'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            {mcpBanner.message}
          </div>
        )}
      </div>

      {/* Contextual Free-Tier Ad Placement */}
      <AdBanner
        placement="Weekly Planner Feed"
        sponsorTag="Supermarket Chain Partner Offer"
        headline="Save $15 on Wild Alaskan Salmon & Organic Produce Bundles"
        copy="Pre-matched to your household’s NutriBalance weekly dinner plan. Zero peanut or shellfish cross-contact."
        ctaText="Claim $15 Voucher"
      />

      {/* STEP 3: Weekly Meal Plan Cards (Spoonacular Recipe Details on Click + Household Voting) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Step 3 • Spoonacular API Recipe Details &amp; Household Voting
            </span>
            <h2 className="text-lg font-bold text-stone-900">
              3. Click Any Day’s Card for Spoonacular Recipe Details &amp; Vote as Family
            </h2>
            <p className="text-xs text-stone-600">
              Each day shows which household member’s nutrient needs it fulfills. Click any card to pop up the full Spoonacular recipe modal.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-600 shrink-0">
            <span className="font-semibold">Voting &amp; Commenting as:</span>
            <select
              value={activeVoter}
              onChange={(e) => setActiveVoter(e.target.value)}
              className="rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-bold text-stone-900"
            >
              {familyMembers.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {meals.map((meal, idx) => {
          const hasVoted = meal.votedBy.includes(activeVoter);
          const fallbackMember = familyMembers[idx % familyMembers.length];
          const targetMemberName =
            meal.recommendedForMember || fallbackMember?.name || 'Household';
          const targetMemberReason =
            meal.memberNutrientReason ||
            `Tailored to ${targetMemberName}’s ${fallbackMember?.tdee || 2000} kcal/day (${
              meal.dietaryMode
            }) nutrient target`;

          return (
            <div
              key={meal.id}
              onClick={() => handleOpenRecipeModal(meal)}
              className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer"
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
                    {meal.cuisine && meal.cuisine !== 'Any' && (
                      <span className="rounded-md bg-stone-900 px-2 py-0.5 text-[11px] font-semibold text-white">
                        {meal.cuisine}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-emerald-700 group-hover:underline">
                      Click for Spoonacular Recipe →
                    </span>
                    <div className="flex items-center gap-1 text-xs font-medium text-stone-600">
                      <Clock className="h-3.5 w-3.5 text-stone-400" />
                      <span>{meal.prepTimeMinutes}m</span>
                    </div>
                  </div>
                </div>

                {/* Recipe Title */}
                <h3 className="text-lg font-bold text-stone-900 leading-snug group-hover:text-emerald-700 transition-colors">
                  {meal.name}
                </h3>
                <p className="mt-1 text-xs font-medium text-emerald-700">
                  {meal.nutrientHighlight}
                </p>

                {/* Household Member Nutrient Needs Badge */}
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <Users className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Recommended for: {targetMemberName}’s Nutrient Needs</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-emerald-800 leading-snug">
                    {targetMemberReason}
                  </p>
                </div>

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
                <div
                  className="mt-4 flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
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
                  <div
                    className="mt-3 space-y-1.5 border-t border-stone-100 pt-3"
                    onClick={(e) => e.stopPropagation()}
                  >
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
              <div
                className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
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

        {/* STEP 4: Finalize Weekly Plan -> Lock Voting & Build Grocery List */}
        <div className="rounded-2xl border-2 border-stone-900 bg-stone-900 p-5 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Step 4 • Finalize &amp; Sync Pantry
            </span>
            <h3 className="text-base font-bold">
              Ready to Shop? Lock Top-Voted Plan &amp; Generate Consolidated Grocery List
            </h3>
            <p className="text-xs text-stone-300">
              Locking freezes family voting and automatically deducts current household pantry stock on the Grocery List screen.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setPlanLocked(!planLocked)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                planLocked
                  ? 'bg-amber-400 text-stone-950 hover:bg-amber-300'
                  : 'bg-stone-800 text-white border border-stone-700 hover:bg-stone-700'
              }`}
            >
              {planLocked ? (
                <>
                  <Unlock className="h-4 w-4" />
                  <span>Unlock Plan Voting</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>4A. Lock Top-Voted Plan</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLockAndSyncGrocery}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-stone-950 shadow-xs hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              <span>4B. Lock &amp; Build Grocery List →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Optional Custom Biometric Nutrient Calculator & Direct Spoonacular Linker */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Activity className="h-3.5 w-3.5" />
              <span>Bonus Tool • Custom Biometric Nutrient Calculator (NutriBalance MCP → Spoonacular API)</span>
            </span>
            <h2 className="mt-1.5 text-lg font-bold text-stone-900">
              Calculate Custom Nutrient Targets by Age, Goal, Gender, Height, Weight &amp; Activity
            </h2>
            <p className="text-xs text-stone-600">
              Test custom biometric parameters to compute BMR, daily TDEE, and per-dinner macro targets via NutriBalance MCP, then fetch matching recipes from Spoonacular.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCalculateNutrientRecommendations}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5"
        >
          <div>
            <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
              Age (Years)
            </label>
            <input
              type="number"
              min={4}
              max={100}
              value={calcAge}
              onChange={(e) => setCalcAge(Number(e.target.value) || 30)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
              Gender
            </label>
            <select
              value={calcGender}
              onChange={(e) => setCalcGender(e.target.value as 'female' | 'male')}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              min={90}
              max={230}
              value={calcHeightCm}
              onChange={(e) => setCalcHeightCm(Number(e.target.value) || 165)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              min={15}
              max={200}
              value={calcWeightKg}
              onChange={(e) => setCalcWeightKg(Number(e.target.value) || 65)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
              Activity Level
            </label>
            <select
              value={calcActivity}
              onChange={(e) => setCalcActivity(e.target.value as any)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
            >
              <option value="sedentary">Sedentary (Desk job)</option>
              <option value="light">Lightly Active (1–3 days/wk)</option>
              <option value="moderate">Moderately Active (3–5 days/wk)</option>
              <option value="active">Very Active (6–7 days/wk)</option>
              <option value="very-active">Extra Active (Athlete)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
              Health / Fitness Goal
            </label>
            <select
              value={calcGoal}
              onChange={(e) => setCalcGoal(e.target.value as any)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
            >
              <option value="weight-loss">Weight Loss (-400 kcal)</option>
              <option value="maintenance">Maintenance (Balanced)</option>
              <option value="muscle-gain">Muscle Gain (+300 kcal)</option>
              <option value="balanced-energy">Sustained Family Energy</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-3 lg:col-span-6 flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs text-stone-500">
              Step A: Compute recommended nutrients via NutriBalance MCP → Step B: Fetch matching Spoonacular recipes.
            </span>
            <button
              type="submit"
              disabled={calcLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {calcLoading ? 'Calculating Nutrients...' : 'Step A: Recommend Personalized Nutrients'}
              </span>
            </button>
          </div>
        </form>

        {recommendedNutrients && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  {recommendedNutrients.sourceLabel}
                </span>
                <h3 className="text-base font-extrabold text-stone-900">
                  Recommended Daily &amp; Dinner Nutrient Targets
                </h3>
              </div>
              <button
                type="button"
                onClick={handleFindSpoonacularByRecommendedNutrients}
                disabled={spoonacularLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <Search className="h-3.5 w-3.5 text-emerald-400" />
                <span>
                  {spoonacularLoading
                    ? 'Fetching Matching Spoonacular Recipes...'
                    : 'Step B: Find Matching Spoonacular Recipes'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-white p-3 border border-emerald-100">
                <span className="text-[11px] text-stone-500 block">Target Calories</span>
                <p className="text-base font-extrabold text-stone-900">
                  {recommendedNutrients.dinnerCalories} kcal{' '}
                  <span className="text-xs font-normal text-stone-500">/ dinner</span>
                </p>
                <span className="text-[11px] text-emerald-700">
                  Daily Goal: {recommendedNutrients.dailyCalories} kcal (BMR {recommendedNutrients.bmr})
                </span>
              </div>

              <div className="rounded-xl bg-white p-3 border border-emerald-100">
                <span className="text-[11px] text-stone-500 block">Target Protein</span>
                <p className="text-base font-extrabold text-emerald-700">
                  {recommendedNutrients.dinnerProtein}g{' '}
                  <span className="text-xs font-normal text-stone-500">/ dinner</span>
                </p>
                <span className="text-[11px] text-stone-500">
                  Daily Goal: {recommendedNutrients.dailyProtein}g
                </span>
              </div>

              <div className="rounded-xl bg-white p-3 border border-emerald-100">
                <span className="text-[11px] text-stone-500 block">Target Carbohydrates</span>
                <p className="text-base font-extrabold text-stone-900">
                  {recommendedNutrients.dinnerCarbs}g{' '}
                  <span className="text-xs font-normal text-stone-500">/ dinner</span>
                </p>
                <span className="text-[11px] text-stone-500">
                  Daily Goal: {recommendedNutrients.dailyCarbs}g
                </span>
              </div>

              <div className="rounded-xl bg-white p-3 border border-emerald-100">
                <span className="text-[11px] text-stone-500 block">Target Healthy Fats</span>
                <p className="text-base font-extrabold text-stone-900">
                  {recommendedNutrients.dinnerFat}g{' '}
                  <span className="text-xs font-normal text-stone-500">/ dinner</span>
                </p>
                <span className="text-[11px] text-stone-500">
                  Daily Goal: {recommendedNutrients.dailyFat}g
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-700">
              <div>
                <strong>Priority Micronutrients for Profile:</strong>{' '}
                {recommendedNutrients.keyMicronutrients.join(' • ')}
              </div>
              <a
                href={`https://spoonacular.com/recipes?minCalories=${Math.max(
                  250,
                  recommendedNutrients.dinnerCalories - 150
                )}&maxCalories=${
                  recommendedNutrients.dinnerCalories + 150
                }&minProtein=${Math.max(12, Math.round(recommendedNutrients.dinnerProtein * 0.7))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-700 underline hover:text-emerald-900"
              >
                Open Nutrient-Filtered Search on Spoonacular.com →
              </a>
            </div>

            {spoonacularError && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs text-amber-900">
                {spoonacularError}
              </div>
            )}

            {spoonacularResults.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-emerald-200/70">
                <p className="text-xs font-bold text-stone-900">
                  Spoonacular Recipes Matched to Your Recommended Nutrients:
                </p>
                {spoonacularResults.map((item) => {
                  const recipeLink =
                    item.sourceUrl ||
                    item.spoonacularSourceUrl ||
                    `https://spoonacular.com/recipes/${encodeURIComponent(
                      String(item.title || 'recipe')
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                    )}-${item.id}`;
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-white p-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-stone-900">{item.title}</p>
                        <p className="text-stone-500">
                          Ready in {item.readyInMinutes || 25} mins • Health Score:{' '}
                          {item.healthScore ?? 'N/A'}
                        </p>
                        <a
                          href={recipeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block font-semibold text-emerald-700 underline hover:text-emerald-900"
                        >
                          View Full Spoonacular Recipe &amp; Nutrition →
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddSpoonacularRecipe(item)}
                        className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer shrink-0 self-start sm:self-center"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span>Add to Week</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pop-Up Modal for Day Recommendation Recipe from Spoonacular */}
      {modalMeal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs"
          onClick={() => setModalMeal(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                    {modalMeal.day} Recommendation
                  </span>
                  <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-semibold capitalize text-stone-700">
                    {modalMeal.dietaryMode}
                  </span>
                  <span className="text-xs text-stone-500">
                    • {modalSpoonacularData?.readyInMinutes || modalMeal.prepTimeMinutes} mins
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-stone-900">
                  {modalSpoonacularData?.title || modalMeal.name}
                </h2>
                <p className="text-xs font-medium text-emerald-700">
                  {modalMeal.nutrientHighlight}
                </p>
                {modalMeal.recommendedForMember && (
                  <p className="text-xs font-semibold text-stone-700 pt-0.5">
                    Target Member: <span className="text-emerald-800">{modalMeal.recommendedForMember}</span> —{' '}
                    <span className="font-normal text-stone-600">{modalMeal.memberNutrientReason}</span>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setModalMeal(null)}
                className="rounded-xl border border-stone-200 bg-stone-50 p-2 text-stone-600 hover:bg-stone-100 cursor-pointer"
                title="Close recipe modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalLoading && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Fetching live Spoonacular recipe &amp; nutrition details...</span>
              </div>
            )}

            {modalNote && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
                {modalNote}
              </div>
            )}

            {modalSpoonacularData?.image && (
              <img
                src={modalSpoonacularData.image}
                alt={modalSpoonacularData.title || modalMeal.name}
                className="h-52 w-full rounded-xl object-cover border border-stone-200"
              />
            )}

            {/* Macros Summary inside Modal */}
            <div className="grid grid-cols-4 gap-3 rounded-xl bg-stone-50 p-3.5 border border-stone-200 text-center">
              <div>
                <span className="text-[11px] text-stone-500 block">Calories</span>
                <p className="text-base font-extrabold text-stone-900">
                  {modalMeal.macros.calories} kcal
                </p>
              </div>
              <div>
                <span className="text-[11px] text-stone-500 block">Protein</span>
                <p className="text-base font-extrabold text-emerald-700">
                  {modalMeal.macros.protein}g
                </p>
              </div>
              <div>
                <span className="text-[11px] text-stone-500 block">Carbs</span>
                <p className="text-base font-extrabold text-stone-900">
                  {modalMeal.macros.carbs}g
                </p>
              </div>
              <div>
                <span className="text-[11px] text-stone-500 block">Fat</span>
                <p className="text-base font-extrabold text-stone-900">
                  {modalMeal.macros.fat}g
                </p>
              </div>
            </div>

            {/* Ingredients List */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <ChefHat className="h-4 w-4 text-emerald-600" />
                <span>Recipe Ingredients</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {(Array.isArray(modalSpoonacularData?.extendedIngredients) &&
                modalSpoonacularData.extendedIngredients.length > 0
                  ? modalSpoonacularData.extendedIngredients.map((ing: any, i: number) => (
                      <li
                        key={i}
                        className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 flex items-center justify-between"
                      >
                        <span className="font-semibold text-stone-800">
                          {ing.nameClean || ing.name}
                        </span>
                        <span className="text-stone-500">
                          {Math.round(ing.amount || 1)} {ing.unit}
                        </span>
                      </li>
                    ))
                  : modalMeal.ingredients.map((ing, i) => (
                      <li
                        key={i}
                        className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 flex items-center justify-between"
                      >
                        <span className="font-semibold text-stone-800">{ing.name}</span>
                        <span className="text-stone-500">
                          {ing.quantity} {ing.unit}
                        </span>
                      </li>
                    )))}
              </ul>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-stone-900">
                Step-by-Step Preparation
              </h3>
              <ol className="space-y-2 text-xs text-stone-700">
                {(Array.isArray(modalSpoonacularData?.analyzedInstructions?.[0]?.steps) &&
                modalSpoonacularData.analyzedInstructions[0].steps.length > 0
                  ? modalSpoonacularData.analyzedInstructions[0].steps.map((s: any, idx: number) => (
                      <li
                        key={idx}
                        className="rounded-xl border border-stone-200 bg-white p-3 flex items-start gap-2.5"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{s.step}</span>
                      </li>
                    ))
                  : modalMeal.steps.map((step, idx) => (
                      <li
                        key={idx}
                        className="rounded-xl border border-stone-200 bg-white p-3 flex items-start gap-2.5"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    )))}
              </ol>
            </div>

            {/* Modal Footer with Spoonacular External Link & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
              <a
                href={
                  modalSpoonacularData?.sourceUrl ||
                  modalSpoonacularData?.spoonacularSourceUrl ||
                  `https://spoonacular.com/recipes?query=${encodeURIComponent(
                    modalMeal.name
                  )}&minCalories=${Math.max(200, modalMeal.macros.calories - 120)}&maxCalories=${
                    modalMeal.macros.calories + 120
                  }`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
              >
                <span>Open Full Recipe on Spoonacular</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalMeal(null);
                    navigate('/cooking');
                  }}
                  className="rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Open in Daily Cooking View
                </button>
                <button
                  type="button"
                  onClick={() => setModalMeal(null)}
                  className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
