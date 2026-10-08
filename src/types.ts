export type DietaryMode = 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'high-protein';
export type PreferredCuisine =
  | 'Any'
  | 'Mediterranean'
  | 'Japanese'
  | 'Korean'
  | 'Chinese'
  | 'Indian'
  | 'Mexican'
  | 'Italian'
  | 'Thai';
export type SubscriptionTier = 'free' | 'individual' | 'family';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
export type HealthGoal = 'weight-loss' | 'maintenance' | 'muscle-gain' | 'balanced-energy';

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  age: number;
  gender?: 'female' | 'male';
  heightCm?: number;
  weightKg?: number;
  activityLevel?: ActivityLevel;
  goal?: HealthGoal;
  tdee: number;
  proteinTargetG?: number;
  carbsTargetG?: number;
  fatTargetG?: number;
  keyNutrients?: string[];
  dietaryPreference: DietaryMode;
  allergies: string[];
  shareToken: string;
}

export interface MealFeedback {
  id: string;
  memberName: string;
  comment: string;
  timestamp: string;
}

export interface IngredientItem {
  name: string;
  quantity: number;
  unit: string;
  category: 'Produce' | 'Protein' | 'Grains & Pantry' | 'Dairy & Alternatives' | 'Spices';
  estimatedPrice: number;
}

export interface ProposedMeal {
  id: string;
  day: string;
  name: string;
  cuisine?: PreferredCuisine;
  prepTimeMinutes: number;
  dietaryMode: DietaryMode;
  allergens: string[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  nutrientHighlight: string;
  recommendedForMember?: string;
  memberNutrientReason?: string;
  votes: number;
  votedBy: string[];
  feedback: MealFeedback[];
  ingredients: IngredientItem[];
  steps: string[];
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiresInDays: number;
}
