import React, { createContext, useContext, useState } from 'react';
import {
  DietaryMode,
  FamilyMember,
  PantryItem,
  PreferredCuisine,
  ProposedMeal,
  SubscriptionTier,
} from '../types';

const INITIAL_FAMILY: FamilyMember[] = [
  {
    id: 'm1',
    name: 'Alex (Parent)',
    role: 'Parent',
    age: 38,
    gender: 'male',
    heightCm: 178,
    weightKg: 76,
    activityLevel: 'active',
    goal: 'muscle-gain',
    tdee: 2250,
    proteinTargetG: 168,
    carbsTargetG: 225,
    fatTargetG: 75,
    keyNutrients: ['Omega-3 EPA/DHA', 'Magnesium', 'Zinc'],
    dietaryPreference: 'high-protein',
    allergies: ['Shellfish'],
    shareToken: 'alex-link-892',
  },
  {
    id: 'm2',
    name: 'Sam (Parent)',
    role: 'Parent',
    age: 36,
    gender: 'female',
    heightCm: 165,
    weightKg: 62,
    activityLevel: 'moderate',
    goal: 'maintenance',
    tdee: 1950,
    proteinTargetG: 122,
    carbsTargetG: 219,
    fatTargetG: 65,
    keyNutrients: ['Dietary Iron', 'Folate (B9)', 'Vitamin D3'],
    dietaryPreference: 'standard',
    allergies: ['Peanuts'],
    shareToken: 'sam-link-441',
  },
  {
    id: 'm3',
    name: 'Maya (Teen)',
    role: 'Teen',
    age: 14,
    gender: 'female',
    heightCm: 160,
    weightKg: 51,
    activityLevel: 'moderate',
    goal: 'balanced-energy',
    tdee: 2000,
    proteinTargetG: 115,
    carbsTargetG: 250,
    fatTargetG: 60,
    keyNutrients: ['Plant Iron + Vitamin C', 'Vitamin B12', 'Calcium'],
    dietaryPreference: 'vegetarian',
    allergies: [],
    shareToken: 'maya-link-309',
  },
  {
    id: 'm4',
    name: 'Leo (Child)',
    role: 'Child',
    age: 9,
    gender: 'male',
    heightCm: 135,
    weightKg: 32,
    activityLevel: 'active',
    goal: 'balanced-energy',
    tdee: 1650,
    proteinTargetG: 85,
    carbsTargetG: 210,
    fatTargetG: 52,
    keyNutrients: ['Calcium', 'Vitamin D', 'Beta-Carotene'],
    dietaryPreference: 'standard',
    allergies: ['Peanuts'],
    shareToken: 'leo-link-117',
  },
];

const INITIAL_MEALS: ProposedMeal[] = [
  {
    id: 'meal-1',
    day: 'Monday',
    name: 'Herb-Crusted Baked Salmon & Quinoa Pilaf',
    prepTimeMinutes: 25,
    dietaryMode: 'high-protein',
    allergens: ['Fish'],
    macros: { calories: 580, protein: 44, carbs: 42, fat: 24 },
    nutrientHighlight: 'Rich in Omega-3 EPA/DHA & Vitamin D (+18 eating score)',
    recommendedForMember: 'Alex (Parent)',
    memberNutrientReason: 'Matches Alex’s 2,250 kcal High-Protein TDEE target (44g protein) & Shellfish-free allergy guardrail',
    votes: 4,
    votedBy: ['Alex (Parent)', 'Sam (Parent)', 'Leo (Child)', 'Maya (Teen)'],
    feedback: [
      { id: 'f1', memberName: 'Maya (Teen)', comment: 'Can we bake a block of lemon herb tofu on the side for me?', timestamp: '2h ago' },
      { id: 'f2', memberName: 'Alex (Parent)', comment: 'Great post-workout macros, quick cleanup.', timestamp: '1h ago' },
    ],
    ingredients: [
      { name: 'Fresh Atlantic Salmon Fillets', quantity: 600, unit: 'g', category: 'Protein', estimatedPrice: 16.5 },
      { name: 'Organic Firm Tofu', quantity: 300, unit: 'g', category: 'Protein', estimatedPrice: 3.8 },
      { name: 'Tri-Color Quinoa', quantity: 350, unit: 'g', category: 'Grains & Pantry', estimatedPrice: 4.5 },
      { name: 'Asparagus Spears', quantity: 400, unit: 'g', category: 'Produce', estimatedPrice: 4.2 },
      { name: 'Fresh Lemons', quantity: 2, unit: 'pcs', category: 'Produce', estimatedPrice: 1.8 },
      { name: 'Extra Virgin Olive Oil', quantity: 45, unit: 'ml', category: 'Grains & Pantry', estimatedPrice: 1.5 },
    ],
    steps: [
      'Preheat convection oven to 200°C (400°F) and line a sheet pan with parchment paper.',
      'Rinse 350g of tri-color quinoa under cold water, then simmer in 700ml vegetable broth for 15 minutes until fluffy.',
      'Arrange salmon fillets on one side of the tray and pressed tofu cubes on the other for vegetarian household members.',
      'Drizzle with olive oil, fresh lemon juice, minced garlic, and chopped dill. Surround with trimmed asparagus spears.',
      'Roast for 12–15 minutes until salmon flakes easily and asparagus is crisp-tender. Fluff quinoa and plate.',
    ],
  },
  {
    id: 'meal-2',
    day: 'Tuesday',
    name: 'Mediterranean Chickpea & Halloumi Power Bowl',
    prepTimeMinutes: 20,
    dietaryMode: 'vegetarian',
    allergens: ['Dairy'],
    macros: { calories: 540, protein: 26, carbs: 54, fat: 23 },
    nutrientHighlight: 'High Folate, Dietary Fiber & Iron synergy',
    recommendedForMember: 'Maya (Teen)',
    memberNutrientReason: 'Tailored for Maya’s Vegetarian growth needs (2,000 kcal TDEE) with plant iron + Vitamin C absorption',
    votes: 3,
    votedBy: ['Maya (Teen)', 'Sam (Parent)', 'Alex (Parent)'],
    feedback: [
      { id: 'f3', memberName: 'Sam (Parent)', comment: 'Love the crispy halloumi texture!', timestamp: '4h ago' },
    ],
    ingredients: [
      { name: 'Cypriot Halloumi Cheese', quantity: 400, unit: 'g', category: 'Dairy & Alternatives', estimatedPrice: 8.9 },
      { name: 'Canned Organic Chickpeas', quantity: 800, unit: 'g', category: 'Grains & Pantry', estimatedPrice: 3.6 },
      { name: 'Baby Spinach Leaves', quantity: 250, unit: 'g', category: 'Produce', estimatedPrice: 3.2 },
      { name: 'Cherry Tomatoes', quantity: 300, unit: 'g', category: 'Produce', estimatedPrice: 3.0 },
      { name: 'Tahini Paste', quantity: 60, unit: 'g', category: 'Grains & Pantry', estimatedPrice: 4.0 },
    ],
    steps: [
      'Drain and pat dry chickpeas; toss with smoked paprika, cumin, and a pinch of sea salt.',
      'Pan-sear chickpeas in olive oil over medium-high heat for 8 minutes until blistered and golden.',
      'Slice halloumi into 1cm slabs and sear in the warm skillet for 2 minutes per side until caramelized.',
      'Whisk tahini paste with warm water, lemon juice, and garlic for a silky dressing.',
      'Assemble bowls with baby spinach, halved cherry tomatoes, spiced chickpeas, and warm halloumi.',
    ],
  },
  {
    id: 'meal-3',
    day: 'Wednesday',
    name: 'Korean Gochujang Turkey & Zucchini Bibimbap',
    prepTimeMinutes: 30,
    dietaryMode: 'standard',
    allergens: ['Soy', 'Sesame', 'Eggs'],
    macros: { calories: 610, protein: 39, carbs: 64, fat: 19 },
    nutrientHighlight: 'Balanced B-Vitamins, Zinc & Fermented Probiotics',
    recommendedForMember: 'Sam (Parent)',
    memberNutrientReason: 'Aligned with Sam’s 1,950 kcal Standard Balanced macros & 100% Peanut-Free requirement',
    votes: 4,
    votedBy: ['Alex (Parent)', 'Sam (Parent)', 'Maya (Teen)', 'Leo (Child)'],
    feedback: [
      { id: 'f4', memberName: 'Leo (Child)', comment: 'Mild sauce on mine please!', timestamp: '5h ago' },
    ],
    ingredients: [
      { name: 'Lean Ground Turkey Breast', quantity: 500, unit: 'g', category: 'Protein', estimatedPrice: 9.8 },
      { name: 'Short-Grain Brown Rice', quantity: 450, unit: 'g', category: 'Grains & Pantry', estimatedPrice: 3.5 },
      { name: 'Green Zucchini', quantity: 2, unit: 'pcs', category: 'Produce', estimatedPrice: 2.6 },
      { name: 'Carrots', quantity: 300, unit: 'g', category: 'Produce', estimatedPrice: 1.9 },
      { name: 'Free-Range Eggs', quantity: 4, unit: 'pcs', category: 'Dairy & Alternatives', estimatedPrice: 2.8 },
    ],
    steps: [
      'Cook short-grain brown rice in a rice cooker so it is steaming hot at serving time.',
      'Julienne carrots and zucchini; quickly sauté in toasted sesame oil with a pinch of salt.',
      'Brown ground turkey (and crumbled tempeh in a separate pan for Maya) with ginger, garlic, and low-sodium soy sauce.',
      'Fry 4 sunny-side-up eggs until edges are lacy and yolks remain runny.',
      'Layer warm rice, sautéed vegetables, protein, and egg in bowls; serve mild and spicy gochujang on the side.',
    ],
  },
  {
    id: 'meal-4',
    day: 'Thursday',
    name: 'Creamy Coconut Red Lentil & Sweet Potato Dal',
    prepTimeMinutes: 30,
    dietaryMode: 'vegan',
    allergens: [],
    macros: { calories: 510, protein: 22, carbs: 68, fat: 16 },
    nutrientHighlight: 'Zero-Allergen Profile + Beta-Carotene & Magnesium boost',
    recommendedForMember: 'Leo (Child)',
    memberNutrientReason: 'Designed for Leo’s 1,650 kcal growing child energy needs — 100% Peanut-Free & gentle beta-carotene',
    votes: 3,
    votedBy: ['Maya (Teen)', 'Sam (Parent)', 'Leo (Child)'],
    feedback: [],
    ingredients: [
      { name: 'Split Red Lentils', quantity: 400, unit: 'g', category: 'Grains & Pantry', estimatedPrice: 3.4 },
      { name: 'Orange Sweet Potatoes', quantity: 500, unit: 'g', category: 'Produce', estimatedPrice: 3.2 },
      { name: 'Light Coconut Milk', quantity: 400, unit: 'ml', category: 'Grains & Pantry', estimatedPrice: 2.9 },
      { name: 'Baby Spinach Leaves', quantity: 200, unit: 'g', category: 'Produce', estimatedPrice: 2.8 },
      { name: 'Fresh Ginger Root', quantity: 40, unit: 'g', category: 'Produce', estimatedPrice: 1.2 },
    ],
    steps: [
      'Peel and dice sweet potatoes into 1.5cm cubes. Rinse split red lentils until water runs clear.',
      'Sauté grated ginger, garlic, turmeric, and garam masala in coconut oil for 60 seconds until fragrant.',
      'Stir in red lentils, sweet potatoes, coconut milk, and 500ml vegetable stock; simmer covered for 20 minutes.',
      'Fold in fresh baby spinach until wilted and finish with a squeeze of lime.',
    ],
  },
  {
    id: 'meal-5',
    day: 'Friday',
    name: 'Avocado Lime Grilled Chicken & Cauliflower Taco Skillet',
    prepTimeMinutes: 25,
    dietaryMode: 'keto',
    allergens: ['Dairy'],
    macros: { calories: 530, protein: 46, carbs: 14, fat: 32 },
    nutrientHighlight: 'Low-Glycemic Keto Fit + Potassium & Monounsaturated Fats',
    recommendedForMember: 'Alex (Parent)',
    memberNutrientReason: 'Supports Alex’s lean muscle recovery (46g protein, low-glycemic carbs) with Shellfish-free ingredients',
    votes: 3,
    votedBy: ['Alex (Parent)', 'Sam (Parent)', 'Leo (Child)'],
    feedback: [],
    ingredients: [
      { name: 'Free-Range Chicken Thighs', quantity: 650, unit: 'g', category: 'Protein', estimatedPrice: 11.4 },
      { name: 'Riced Cauliflower', quantity: 500, unit: 'g', category: 'Produce', estimatedPrice: 4.5 },
      { name: 'Hass Avocados', quantity: 2, unit: 'pcs', category: 'Produce', estimatedPrice: 4.4 },
      { name: 'Red Bell Peppers', quantity: 2, unit: 'pcs', category: 'Produce', estimatedPrice: 3.2 },
      { name: 'Shredded Cheddar Cheese', quantity: 150, unit: 'g', category: 'Dairy & Alternatives', estimatedPrice: 4.2 },
    ],
    steps: [
      'Season chicken thighs with lime zest, oregano, cumin, and chili powder; grill 6 minutes per side.',
      'Sauté sliced bell peppers and riced cauliflower in the skillet drippings until tender-crisp.',
      'Top skillet with shredded cheddar briefly to melt, then garnish with diced Hass avocado and fresh cilantro.',
    ],
  },
  {
    id: 'meal-6',
    day: 'Saturday',
    name: 'Tuscan White Bean, Kale & Sun-Dried Tomato Gnocchi',
    prepTimeMinutes: 20,
    dietaryMode: 'vegetarian',
    allergens: ['Wheat', 'Dairy'],
    macros: { calories: 560, protein: 21, carbs: 72, fat: 18 },
    nutrientHighlight: 'Calcium, Vitamin K & Slow-Release Complex Carbs',
    recommendedForMember: 'Maya (Teen) & Leo (Child)',
    memberNutrientReason: 'Meets Teen & Child bone-growth Calcium, Vitamin K & complex carbohydrate needs',
    votes: 2,
    votedBy: ['Maya (Teen)', 'Leo (Child)'],
    feedback: [],
    ingredients: [
      { name: 'Potato Gnocchi', quantity: 500, unit: 'g', category: 'Grains & Pantry', estimatedPrice: 4.9 },
      { name: 'Cannellini White Beans', quantity: 400, unit: 'g', category: 'Grains & Pantry', estimatedPrice: 2.4 },
      { name: 'Tuscan Lacinato Kale', quantity: 250, unit: 'g', category: 'Produce', estimatedPrice: 3.5 },
      { name: 'Sun-Dried Tomatoes in Oil', quantity: 120, unit: 'g', category: 'Grains & Pantry', estimatedPrice: 4.8 },
    ],
    steps: [
      'Pan-sear shelf-stable potato gnocchi directly in olive oil for 5 minutes until golden and crisp outside.',
      'Add chopped sun-dried tomatoes, garlic, and drained cannellini beans to warm through.',
      'Stir in ribbons of Tuscan kale and a splash of vegetable broth, steaming 2 minutes until tender.',
    ],
  },
  {
    id: 'meal-7',
    day: 'Sunday',
    name: 'Lemongrass Tofu & Snap Pea Coconut Noodle Bowls',
    prepTimeMinutes: 25,
    dietaryMode: 'vegan',
    allergens: ['Soy'],
    macros: { calories: 520, protein: 24, carbs: 58, fat: 20 },
    nutrientHighlight: 'Vitamin C + Plant Iron Absorption Enhancer',
    recommendedForMember: 'Sam (Parent) & Maya (Teen)',
    memberNutrientReason: 'Balances Sam’s 1,950 kcal target & Maya’s Vegetarian plant-protein + iron profile (Peanut & Shellfish free)',
    votes: 3,
    votedBy: ['Maya (Teen)', 'Sam (Parent)', 'Alex (Parent)'],
    feedback: [],
    ingredients: [
      { name: 'Organic Firm Tofu', quantity: 450, unit: 'g', category: 'Protein', estimatedPrice: 5.2 },
      { name: 'Flat Rice Noodles', quantity: 350, unit: 'g', category: 'Grains & Pantry', estimatedPrice: 3.6 },
      { name: 'Sugar Snap Peas', quantity: 300, unit: 'g', category: 'Produce', estimatedPrice: 4.1 },
      { name: 'Light Coconut Milk', quantity: 400, unit: 'ml', category: 'Grains & Pantry', estimatedPrice: 2.9 },
    ],
    steps: [
      'Soak flat rice noodles in hot water for 8 minutes until pliable, then drain.',
      'Crisp cubed firm tofu in a hot wok, then toss with minced lemongrass, ginger, and snap peas.',
      'Pour in light coconut milk and tamari; toss noodles through the glossy sauce for 2 minutes.',
    ],
  },
];

const INITIAL_PANTRY: PantryItem[] = [
  { id: 'p1', name: 'Extra Virgin Olive Oil', quantity: 500, unit: 'ml', category: 'Grains & Pantry', expiresInDays: 180 },
  { id: 'p2', name: 'Short-Grain Brown Rice', quantity: 600, unit: 'g', category: 'Grains & Pantry', expiresInDays: 90 },
  { id: 'p3', name: 'Canned Organic Chickpeas', quantity: 400, unit: 'g', category: 'Grains & Pantry', expiresInDays: 365 },
  { id: 'p4', name: 'Baby Spinach Leaves', quantity: 200, unit: 'g', category: 'Produce', expiresInDays: 2 },
  { id: 'p5', name: 'Free-Range Eggs', quantity: 6, unit: 'pcs', category: 'Dairy & Alternatives', expiresInDays: 5 },
  { id: 'p6', name: 'Light Coconut Milk', quantity: 400, unit: 'ml', category: 'Grains & Pantry', expiresInDays: 240 },
];

interface AppContextType {
  familyMembers: FamilyMember[];
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'shareToken'>) => void;
  updateFamilyMember: (id: string, member: Omit<FamilyMember, 'id' | 'shareToken'>) => void;
  removeFamilyMember: (id: string) => void;
  meals: ProposedMeal[];
  pantry: PantryItem[];
  selectedDietaryMode: DietaryMode;
  setSelectedDietaryMode: (mode: DietaryMode) => void;
  selectedCuisine: PreferredCuisine;
  setSelectedCuisine: (cuisine: PreferredCuisine) => void;
  subscriptionTier: SubscriptionTier;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  planLocked: boolean;
  setPlanLocked: (locked: boolean) => void;
  voteForMeal: (mealId: string, memberName: string) => void;
  addMealFeedback: (mealId: string, memberName: string, comment: string) => void;
  updatePantryItem: (id: string, delta: number) => void;
  addReceiptToPantry: (items: PantryItem[]) => void;
  replaceMealsFromMcp: (
    mode: DietaryMode,
    cuisine?: PreferredCuisine,
    mcpMeals?: ProposedMeal[]
  ) => void;
  addProposedMeal: (meal: ProposedMeal) => void;
  referralOrdersCount: number;
  referralRevenueEarned: number;
  recordDeliveryOrder: (orderSubtotal: number) => void;
  dailyEatingScore: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(INITIAL_FAMILY);
  const [meals, setMeals] = useState<ProposedMeal[]>(INITIAL_MEALS);
  const [pantry, setPantry] = useState<PantryItem[]>(INITIAL_PANTRY);
  const [selectedDietaryMode, setSelectedDietaryMode] = useState<DietaryMode>('standard');
  const [selectedCuisine, setSelectedCuisine] = useState<PreferredCuisine>('Any');
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');
  const [planLocked, setPlanLocked] = useState<boolean>(false);
  const [referralOrdersCount, setReferralOrdersCount] = useState<number>(500);
  const [referralRevenueEarned, setReferralRevenueEarned] = useState<number>(4000);
  const [dailyEatingScore, setDailyEatingScore] = useState<number>(88);

  const addFamilyMember = (member: Omit<FamilyMember, 'id' | 'shareToken'>) => {
    const slug = member.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'member';
    const newMember: FamilyMember = {
      ...member,
      id: `m-${Date.now()}`,
      shareToken: `${slug}-link-${Math.floor(100 + Math.random() * 900)}`,
    };
    setFamilyMembers((prev) => [...prev, newMember]);
  };

  const updateFamilyMember = (id: string, updated: Omit<FamilyMember, 'id' | 'shareToken'>) => {
    setFamilyMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updated } : m))
    );
  };

  const removeFamilyMember = (id: string) => {
    setFamilyMembers((prev) => (prev.length > 1 ? prev.filter((m) => m.id !== id) : prev));
  };

  const voteForMeal = (mealId: string, memberName: string) => {
    const updater = (list: ProposedMeal[]) =>
      list.map((m) => {
        if (m.id !== mealId) return m;
        const already = m.votedBy.includes(memberName);
        const votedBy = already ? m.votedBy.filter((n) => n !== memberName) : [...m.votedBy, memberName];
        return { ...m, votedBy, votes: votedBy.length };
      });
    setMeals(updater);
  };

  const addMealFeedback = (mealId: string, memberName: string, comment: string) => {
    if (!comment.trim()) return;
    const newFb = {
      id: `fb-${Date.now()}`,
      memberName,
      comment: comment.trim(),
      timestamp: 'Just now',
    };
    const updater = (list: ProposedMeal[]) =>
      list.map((m) => (m.id === mealId ? { ...m, feedback: [...m.feedback, newFb] } : m));
    setMeals(updater);
  };

  const updatePantryItem = (id: string, delta: number) => {
    setPantry((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const addReceiptToPantry = (items: PantryItem[]) => {
    setPantry((prev) => [...items, ...prev]);
  };

  const replaceMealsFromMcp = (
    mode: DietaryMode,
    cuisine: PreferredCuisine = selectedCuisine,
    mcpMeals?: ProposedMeal[]
  ) => {
    setSelectedDietaryMode(mode);
    setSelectedCuisine(cuisine);
    setDailyEatingScore(mode === 'high-protein' ? 92 : mode === 'vegan' ? 94 : mode === 'keto' ? 89 : 90);
    if (mcpMeals && mcpMeals.length > 0) {
      setMeals(mcpMeals);
      return;
    }

    const cuisineTitles: Record<Exclude<PreferredCuisine, 'Any'>, string[]> = {
      Mediterranean: [
        'Mediterranean Herb-Baked Salmon & Quinoa Pilaf',
        'Greek Chickpea, Spinach & Halloumi Power Bowl',
        'Lemon Oregano Turkey & Zucchini Souvlaki Bowl',
        'Cypriot Red Lentil, Olive & Sweet Potato Stew',
        'Grilled Aegean Chicken & Cauliflower Skillet',
        'Tuscan White Bean, Kale & Sun-Dried Tomato Gnocchi',
        'Santorini Garlic Tofu & Crisp Snap Pea Orzo',
      ],
      Japanese: [
        'Miso-Glazed Salmon & Edamame Quinoa Donburi',
        'Kyoto Sesame Tofu, Chickpea & Spinach Rice Bowl',
        'Teriyaki Ginger Ground Turkey & Zucchini Don',
        'Japanese Golden Curry Red Lentil & Sweet Potato Nabe',
        'Shio-Koji Grilled Chicken & Riced Cauliflower Skillet',
        'Yuzu White Bean, Kale & Shiitake Udon',
        'Matcha-Lime Tofu & Sugar Snap Pea Soba Bowls',
      ],
      Korean: [
        'Gochujang-Glazed Baked Salmon & Quinoa Bibimbap',
        'Korean Crispy Dubu (Tofu) & Chickpea Spinach Bowl',
        'Seoul Gochujang Turkey & Zucchini Bibimbap',
        'Doenjang Coconut Red Lentil & Sweet Potato Stew',
        'Dakgalbi Grilled Chicken & Cauliflower Skillet',
        'Korean Garlic White Bean, Kale & Rice Cake Skillet',
        'Sesame Lemongrass Tofu & Snap Pea Japchae',
      ],
      Chinese: [
        'Ginger-Scallion Baked Salmon & Quinoa Fried Rice',
        'Sichuan Mild Chickpea, Bok Choy & Tofu Bowl',
        'Cantonese Savory Ground Turkey & Zucchini Rice Bowl',
        'Five-Spice Red Lentil & Sweet Potato Claypot',
        'Wok-Seared Garlic Chicken & Cauliflower Rice Skillet',
        'Shanghai Braised White Bean, Kale & Rice Noodles',
        'Crispy Tofu & Sugar Snap Pea Garlic Sauce Bowl',
      ],
      Indian: [
        'Tandoori-Spiced Baked Salmon & Jeera Quinoa Pilaf',
        'Palak Chana (Spinach Chickpea) & Paneer Power Bowl',
        'Keema Masala Ground Turkey & Zucchini Brown Rice',
        'Creamy Coconut Red Lentil & Sweet Potato Tadka Dal',
        'Tikka Grilled Chicken & Spiced Gobhi (Cauliflower) Skillet',
        'Masala White Bean, Kale & Sun-Dried Tomato Skillet',
        'Coconut Curry Leaf Tofu & Snap Pea Rice Noodles',
      ],
      Mexican: [
        'Chipotle-Lime Baked Salmon & Quinoa Fiesta Bowl',
        'Oaxacan Spiced Chickpea, Spinach & Queso Asado Bowl',
        'Ancho-Chili Ground Turkey & Zucchini Burrito Bowl',
        'Mexican Crema Red Lentil & Sweet Potato Picadillo',
        'Avocado Lime Grilled Chicken & Cauliflower Taco Skillet',
        'Poblano White Bean, Kale & Roasted Tomato Skillet',
        'Veracruz Citrus Tofu & Crisp Snap Pea Rice Bowl',
      ],
      Italian: [
        'Amalfi Lemon-Herb Salmon & Quinoa Risotto',
        'Sicilian Chickpea, Baby Spinach & Crispy Caciocavallo Bowl',
        'Bolognese-Style Herbed Turkey & Zucchini Polenta Bowl',
        'Umbrian Red Lentil & Sweet Potato Rustico Stew',
        'Florentine Grilled Chicken & Garlic Cauliflower Skillet',
        'Tuscan White Bean, Kale & Sun-Dried Tomato Gnocchi',
        'Venetian Garlic-Herb Tofu & Snap Pea Linguine',
      ],
      Thai: [
        'Thai Lime-Coriander Baked Salmon & Jasmine Quinoa',
        'Chiang Mai Golden Chickpea, Spinach & Crispy Tofu Bowl',
        'Pad Kra Pao (Holy Basil) Turkey & Zucchini Bowl',
        'Thai Red Curry Coconut Lentil & Sweet Potato Bowl',
        'Satay-Free Lemongrass Grilled Chicken & Cauliflower Skillet',
        'Thai Green Herb White Bean, Kale & Rice Noodle Skillet',
        'Lemongrass Tofu & Snap Pea Coconut Noodle Bowls',
      ],
    };

    // Rotate and tailor meals based on selected cuisine and NutriBalance dietary mode
    setMeals(
      INITIAL_MEALS.map((m, idx) => {
        const baseName =
          cuisine !== 'Any' && cuisineTitles[cuisine]?.[idx]
            ? cuisineTitles[cuisine][idx]
            : m.name;
        const cuisineBadge = cuisine !== 'Any' ? `${cuisine} Cuisine • ` : '';

        if (mode === 'high-protein') {
          return {
            ...m,
            name: baseName,
            cuisine,
            dietaryMode: mode,
            macros: { ...m.macros, protein: Math.max(38, m.macros.protein + 8) },
            nutrientHighlight: `${cuisineBadge}NutriBalance High-Protein Target • ${m.nutrientHighlight}`,
          };
        }
        if (mode === 'keto') {
          return {
            ...m,
            name: baseName,
            cuisine,
            dietaryMode: mode,
            macros: { calories: m.macros.calories, protein: m.macros.protein, carbs: 16, fat: 36 },
            nutrientHighlight: `${cuisineBadge}NutriBalance Ketogenic Macro Ratio • ${m.nutrientHighlight}`,
          };
        }
        if (mode === 'vegan') {
          return {
            ...m,
            name: baseName
              .replace('Salmon', 'Crispy Tofu')
              .replace('Chicken', 'Jackfruit')
              .replace('Turkey', 'Tempeh')
              .replace('Halloumi', 'Smoked Almond Feta')
              .replace('Paneer', 'Tofu')
              .replace('Queso Asado', 'Avocado Crema'),
            cuisine,
            dietaryMode: mode,
            allergens: m.allergens.filter((a) => a !== 'Fish' && a !== 'Dairy' && a !== 'Eggs'),
            nutrientHighlight: `${cuisineBadge}NutriBalance 100% Plant-Based • B12 & Iron Optimized`,
          };
        }
        return {
          ...m,
          name: baseName,
          cuisine,
          dietaryMode: mode,
          nutrientHighlight: `${cuisineBadge}${m.nutrientHighlight}`,
        };
      })
    );
  };

  const recordDeliveryOrder = (orderSubtotal: number) => {
    const commission = Number((orderSubtotal * 0.02).toFixed(2));
    setReferralOrdersCount((c) => c + 1);
    setReferralRevenueEarned((r) => Number((r + commission).toFixed(2)));
  };

  const addProposedMeal = (meal: ProposedMeal) => {
    setMeals((prev) => [meal, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        familyMembers,
        addFamilyMember,
        updateFamilyMember,
        removeFamilyMember,
        meals,
        pantry,
        selectedDietaryMode,
        setSelectedDietaryMode,
        selectedCuisine,
        setSelectedCuisine,
        subscriptionTier,
        setSubscriptionTier,
        planLocked,
        setPlanLocked,
        voteForMeal,
        addMealFeedback,
        updatePantryItem,
        addReceiptToPantry,
        replaceMealsFromMcp,
        addProposedMeal,
        referralOrdersCount,
        referralRevenueEarned,
        recordDeliveryOrder,
        dailyEatingScore,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
