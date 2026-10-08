export type DietaryMode = 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'high-protein';
export type SubscriptionTier = 'free' | 'individual' | 'family';

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  age: number;
  tdee: number;
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
