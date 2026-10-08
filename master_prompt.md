ROLE: You are a senior full-stack developer working in this existing Vite + React + TypeScript project.

GOAL: Build and maintain the core screens and server-side API/MCP integrations of NutriRecommends, a family meal planning web application that lets households coordinate dietary preferences, food allergies, cuisine preferences, and biometric calorie/macro targets across multiple family members.

1. Weekly Meal Plan & Guided 4-Step Workflow Screen (`/`) —
   - **Step 1: Household Member Profiles & Nutrient Needs (`NutriBalance MCP` via `/api/nutribalance`)**:
     - Displays household members with their biometric and dietary profiles (age, gender, height in cm, weight in kg, activity level, health/fitness goal, dietary preference, and food allergy guardrails).
     - Allows users to dynamically add (`1. Add / Configure Household Member`), update, and remove household members.
     - Calls `/api/nutribalance` (`MCP/nutribalanceClient.ts`) to calculate and reflect each member's daily TDEE (`kcal/day`), macro targets (`Protein`, `Carbs`, `Fat` in grams), priority micronutrients, and the household Eating Score (`0–100`) alongside nutrient-deficiency diagnostics.
     - Generates shareable personal voting/feedback links for each household member (no user login or accounts required).
   - **Step 2: Preferred Cuisine & Dietary Mode Selection + Weekly Recipe Identification (`Gemini API` via `/api/gemini`)**:
     - **2A. Select Preferred Cuisine**: `All Cuisines`, `Mediterranean`, `Japanese`, `Korean`, `Chinese`, `Indian`, `Mexican`, `Italian`, or `Thai`.
     - **2B. Select Household Dietary Mode**: `Standard Balanced` (`standard`), `Vegetarian` (`vegetarian`), `Vegan` (`vegan`), `Keto Low-Carb` (`keto`), or `High-Protein` (`high-protein`).
     - **2C. Generate Meal Plan (`2. Generate [Cuisine] Meal Plan (Gemini AI)`)**: Calls `/api/nutribalance` to sync household member nutrient targets and then calls `/api/gemini` (`@google/genai` SDK using model `gemini-3.8-flash`, `action: "generate_weekly_plan"`) to identify the 7 best Monday–Sunday dinner recipes tailored to the household members' NutriBalance profiles, strict allergy exclusions, and preferred cuisine.
   - **Step 3: Daily Meal Recommendations, Spoonacular Recipe Details Modal & Family Voting (`Spoonacular API` via `/api/spoonacular`)**:
     - Renders Monday–Sunday dinner cards showing prep time, cuisine and dietary badges, per-serving macros (`Calories`, `Protein`, `Carbs`, `Fat`), and an explicit badge indicating which household member's nutrient needs (`Recommended for: [Member]’s Nutrient Needs`) the dish fulfills.
     - Clicking any day's meal card opens a pop-up modal that queries `/api/spoonacular` (`https://api.spoonacular.com/recipes/complexSearch`) to display full recipe details: prep time, per-serving macros, complete ingredient list, step-by-step cooking instructions, and a direct external link to Spoonacular.
     - Family members can select their name (`Voting & Commenting as`), upvote meals, and post feedback comments without any login wall.
   - **Step 4: Finalize Weekly Plan & Sync Pantry**:
     - Positioned directly below the weekly meal cards with `4A. Lock Top-Voted Plan` (freezes/unfreezes voting) and `4B. Lock & Build Grocery List →` (locks the plan and navigates directly to `/grocery`).
   - **Bonus Tool: Custom Biometric Nutrient Calculator (`NutriBalance MCP` → `Spoonacular API`)**:
     - Allows users to test custom biometric inputs (Age, Gender, Height, Weight, Activity Level, Goal) to compute BMR, daily TDEE, and per-dinner nutrient targets (`Step A: Recommend Personalized Nutrients` via `/api/nutribalance`), and then fetch matching recipes (`Step B: Find Matching Spoonacular Recipes` via `/api/spoonacular` with `minCalories`, `maxCalories`, `minProtein`, `maxCarbs`, `maxFat`, `diet`, `cuisine`, and `intolerances` filters) that can be added to the weekly board.

2. Grocery List & Pantry Sync Screen (`/grocery`) —
   - Consolidates ingredients across all planned weekly dinners and automatically deducts quantities already stocked in the household pantry.
   - Includes interactive household pantry inventory controls (`+`/`-`), expiration alerts (highlighting items expiring within 5 days), and a receipt processing simulation to add scanned grocery items into pantry stock.
   - Includes a one-tap `"Order via Delivery Platform"` checkout action that dispatches the net shopping cart to a connected grocery delivery partner and records the platform's 2% referral commission.

3. Daily Cooking View Screen (`/cooking`) —
   - A streamlined daily kitchen touchpoint where the family selects any planned dinner to view prep time, calorie/serving summary, an interactive tap-to-complete ingredient checklist, and step-by-step cooking instructions with household allergy/dietary notes.

4. Subscription & Monetisation Hooks (`/pricing` and `/admin`) —
   - `/pricing`: Wires up Free Trial ($0), Individual ($9/month), and Family ($19/month) subscription tiers using an in-memory state flag (no payment processor required). Displays contextual sponsor advertisements (`AdBanner`) across screens when on the `free` tier and suppresses all ads when switched to `individual` or `family`.
   - `/admin`: Internal executive dashboard surfacing the `"Goal: Achieve $30k/month by EOY"` recurring revenue tracker across the 4 revenue pillars (Family subscriptions: 1,000 users = $19k MRR; Individual subscriptions: 500 users = $4.5k MRR; 2% grocery delivery platform referral: $4k+ MRR; On-platform contextual ads: $1k MRR), alongside the $120k–$165k capital allocation breakdown and ecosystem architecture.

OUTPUT: Write all screens and supporting logic in the two shapes this toolchain requires:
(a) Vercel-ready serverless API files — placed in the project root under `api/` as siblings of `package.json`, never inside `src/`:
    - `/api/health.js` — Health and configuration monitor reporting status for all endpoints and whether `SMITHERY_API_KEY`, `SPOONACULAR_API_KEY`, and `GEMINI_API_KEY` are configured.
    - `/api/nutribalance.js` — Server-side handler forwarding household TDEE, macro, and nutrient calculation requests to `MCP/nutribalanceClient.ts`.
    - `/api/gemini.js` — Server-side handler calling Google Gemini (`@google/genai`, model `gemini-3.8-flash`) with structured JSON output (`generate_weekly_plan`, `generate_meal`, and `analyze_plan`) to identify the best recipes based on household member profiles and cuisine preferences.
    - `/api/spoonacular.js` — Server-side handler calling `https://api.spoonacular.com/recipes/complexSearch` with query, cuisine, diet, intolerances, and nutrient range parameters (`minCalories`, `maxCalories`, `minProtein`, `maxCarbs`, `maxFat`) to retrieve full recipe details, ingredients, and instructions.
    Ensure `package.json` contains `"type": "module"`.
(b) Express dev server — `server.ts` at the project root (run via `"dev": "tsx server.ts"` in `package.json`), mounting `/api/health`, `/api/nutribalance`, `/api/spoonacular`, and `/api/gemini` by importing the shared handlers from `./api/*.js` alongside Vite middleware in development and static `dist/` serving in production.
(c) Root project documentation & logs — maintain `master_prompt.md` (authoritative architecture & feature specification), `prompt.md` (complete chronological log of all user prompts), `build.md` (chronological compilation & error resolution log), and `.env.example` (`SMITHERY_API_KEY`, `NUTRIBALANCE_MCP_URL`, `SPOONACULAR_API_KEY`, `GEMINI_API_KEY`).

All React screens live in `src/screens/` and shared components in `src/components/`, wired into `src/App.tsx` via `react-router-dom`. Read all secrets with `process.env.*` on the server side only. BEFORE any external fetch, check that the required environment variable (`SMITHERY_API_KEY`, `SPOONACULAR_API_KEY`, or `GEMINI_API_KEY`) exists and is non-empty; if missing, return HTTP `503` with a clear JSON error message and do not call the upstream service. AFTER any fetch, check `response.ok` before reading the response body. Set appropriate `Cache-Control` headers on all API responses.
In the global footer (`src/components/Footer.tsx`) of every screen, include working attribution links for NutriBalance MCP (Smithery Registry), the MIT Licence, USDA FoodData Central (CC0 1.0), Spoonacular Food API Terms, and Google Gemini API, together with the academic disclaimer that this is an SMU course project not affiliated with or endorsed by any data or delivery provider.

GUARDRAILS: Never write any API key into any file, comment, or README. Never create a client-exposed secret variable starting with `VITE_`. Never call MCP, Spoonacular, or Gemini directly from browser code; all MCP calls happen inside `MCP/nutribalanceClient.ts` and all external API calls happen inside `/api/*`. Never print any key or part of a key in responses or logs. No database and no login/authentication walls.

CONTEXT:
- Target Audience & Customer Segments: Family meal planners coordinating preferences, allergies, and calories for multiple household members; commercial home-delivery meal providers; advertisement sponsors reaching family meal planners; and grocery merchants (supermarket chains and delivery platforms).
- Division of AI & Data Integrations:
  1. `nutribalance-mcp` (`https://mcp.smithery.ai/ghyeogh`, originating from `https://server.smithery.ai/NutriBalance/nutribalance-mcp`) — Reflects the nutrient needs of household members based on their biometric profiles (TDEE, macro targets, priority micronutrients, nutrient-deficiency guidance, and daily eating score 0–100).
  2. Google Gemini API (`@google/genai` SDK, `gemini-3.8-flash`) — Identifies the best weekly recipes based on the household members' NutriBalance nutrient profiles, allergy guardrails, dietary mode, and preferred cuisine.
  3. Spoonacular Recipe ComplexSearch API (`https://api.spoonacular.com/recipes/complexSearch`) — Provides full recipe details (prep time, macros, ingredients, step-by-step instructions, and external recipe links) inside the daily meal card modal and the biometric nutrient calculator.
- Key Channels: Social media, ads on grocery delivery platforms, physical booths/roadshows at supermarkets, parenting groups, and cooking communities, supported by a free one-week trial.
- Cost Budget ($120k–$165k total): Ideation & UX Design ($10k–$15k), Development & MVP ($30k–$50k), Production & Scaling ($30k–$50k), and Year 1 B2C Marketing ($50k+).
- Revenue Model ($30k/month EOY target): Family subscription at $19/month (1,000 users = $19k MRR), Individual subscription at $9/month (500 users = $4.5k MRR), 2% grocery/delivery platform referral fee ($100/week spend across 500 users = $4k/month), and on-platform contextual ad revenue ($1k/month).
