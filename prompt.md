# User Prompts Log

## Prompt 1 (Initial Import & Master Prompt)
This app was imported from GitHub repository `yeogh/nutri_recommends`.

### Master Prompt (`master_prompt.md`)
ROLE: You are a senior full-stack developer working in this existing Vite + React + TypeScript project.

GOAL: Build and maintain the core screens and server-side API integrations of NutriRecommends, a family meal planning web application that lets households coordinate dietary preferences, food allergies, and calorie/macro targets across multiple family members.

1. Weekly Meal Plan & Nutrient Recommender Screen (`/`) —
   - **1. NutriBalance MCP for Household Member Nutrient Needs**: Displays family members with their biometric profiles (age, gender, height, weight, activity level, goal, dietary preference, and allergy guardrails) and allows users to add, update, and remove household members dynamically. Calls `/api/nutribalance` (`MCP/nutribalanceClient.ts`) to reflect each member's daily TDEE, Protein/Carbs/Fat macro targets, priority micronutrients, and household Eating Score (`0–100`). Also provides the Personalized Biometric Nutrient Recommender calculator.
   - **2. Gemini API for Weekly Recipe Identification**: Allows users to select their preferred cuisine (`All Cuisines`, `Mediterranean`, `Japanese`, `Korean`, `Chinese`, `Indian`, `Mexican`, `Italian`, `Thai`) and dietary mode (`standard`, `vegetarian`, `vegan`, `keto`, `high-protein`). Clicking **"Generate Meal Plan (Gemini AI)"** calls `/api/gemini` (`@google/genai` with `gemini-3.8-flash`) to identify the 7 best Monday–Sunday recipes tailored to the household members' NutriBalance nutrient profiles, allergy guardrails, and preferred cuisine, indicating which member's nutrient needs each day's recommendation serves.
   - **3. Spoonacular API for Recipe Details**: Clicking any day's meal card opens a pop-up modal that queries `/api/spoonacular` (`https://api.spoonacular.com/recipes/complexSearch`) to load full recipe details (prep time, per-serving macros, ingredient list, step-by-step instructions, and a direct link to Spoonacular). Also links calculated biometric nutrient targets directly to matching Spoonacular recipes.
   - **Passwordless Household Voting & Feedback**: Generates shareable personal voting/feedback links (no user login or accounts required) so family members can vote and leave comments on Monday–Sunday dinners.

2. Grocery List & Pantry Sync Screen (`/grocery`) —
   - Once the weekly meal plan is locked (or during planning), auto-generates a consolidated grocery list across all planned dinners and deducts quantities already stocked in the household pantry.
   - Includes household pantry inventory controls, expiration alerts (highlighting items expiring within 5 days), and receipt processing simulation to add scanned items into pantry stock.
   - Includes a one-tap "Order via Delivery Platform" checkout action that dispatches the net shopping cart to a connected grocery delivery partner and records the platform's 2% referral commission.

3. Daily Cooking View Screen (`/cooking`) —
   - A streamlined daily kitchen touchpoint where the family selects today's dinner to view prep time, calorie/serving summary, an interactive tap-to-complete ingredient checklist, and step-by-step cooking instructions with household allergy/dietary notes.

4. Subscription & Monetisation Hooks (`/pricing` and `/admin`) —
   - `/pricing`: Wires up Free Trial ($0), Individual ($9/month), and Family ($19/month) subscription tiers using an in-memory state flag (no payment processor required). Displays contextual sponsor advertisements (`AdBanner`) across screens when on the `free` tier and suppresses all ads when switched to `individual` or `family`.
   - `/admin`: Internal executive dashboard surfacing the "Goal: Achieve $30k/month by EOY" recurring revenue tracker across the 4 revenue pillars (Family subscriptions: 1,000 users = $19k MRR; Individual subscriptions: 500 users = $4.5k MRR; 2% grocery delivery platform referral: $4k+ MRR; On-platform contextual ads: $1k MRR), alongside the $120k–$165k capital allocation breakdown and ecosystem architecture.

OUTPUT: Write all screens and supporting logic in the two shapes this toolchain requires:
(a) Vercel-ready serverless API files — placed in the project root under `api/` as siblings of `package.json`, never inside `src/` (`/api/health.js`, `/api/nutribalance.js`, `/api/spoonacular.js`, `/api/gemini.js`). Ensure `package.json` contains `"type": "module"`.
(b) Express dev server — `server.ts` at the project root (run via `"dev": "tsx server.ts"` in `package.json`), mounting `/api/health`, `/api/nutribalance`, `/api/spoonacular`, and `/api/gemini` by importing the shared handlers from `./api/*.js`.

GUARDRAILS: Never write any API key into any file, comment, or README. Never create a client-exposed secret variable starting with `VITE_`. Never call MCP, Spoonacular, or Gemini directly from browser code; all MCP calls happen inside `MCP/nutribalanceClient.ts` and all external API calls happen inside `/api/*`. Never print any key or part of a key in responses or logs. No database and no login/authentication walls.

---

## Prompt 2
Remove the use of Pantry Persona and Agent Chef MCP and update master prompt

---

## Prompt 3
git push https://github.com/yeogh/nutri_recommends.git

---

## Prompt 4
1) create a /api folder under the project main to store all the apis
2) create a /api/health.js to monitor if the api are working

---

## Prompt 5
create a prompt.md containing all my prompts located at project main

---

## Prompt 6
there is no key for mcp

---

## Prompt 7
revert to the previous checkpoint

---

## Prompt 8
git push

---

## Prompt 9
Include the use of the following api:
https://api.spoonacular.com/recipes/complexSearch 
gemini api

Modify the app to use the able APIs.

---

## Prompt 10
update prompt.md and master_prompt.md file

---

## Prompt 11
Create a build.md file for error logs

---

## Prompt 12
Modify the UI to allow recommendation of nutrient based on age, goal, gender, height, weight & activity level selection.

Thereafter, link user to recipe from spoonacular based on the recommended nutrients.

---

## Prompt 13
For each day recommendations, allow users to click on the card and pop up modal of the recipe from spoonacular

---

## Prompt 14
modify content in master_prompt.md based on what's currently available and used in the app.

---

## Prompt 15
Allow users to add, remove, update for household members.

---

## Prompt 16
update prompt.md with all the prompts as of now

---

## Prompt 17
modify master_prompt.md based on what's available and used as of now

---

## Prompt 18
For each day recommendation, indicate the recommendation is meant for which household member's nutrient needs.

---

## Prompt 19
modify the UI to allow user to select preferred cuisine before generating the recommended meal plan

---

## Prompt 20
Can remove the separate search box for spoonacular

---

## Prompt 21
"Generate Meal Plan" uses which API or MCP?
Where does Gemini API come in for this app?

---

## Prompt 22
Does it conflict with "Generate Meal Plan" button?

---

## Prompt 23
1. Use nutribalance MCP to reflect nutrient needs of household members based on their profiles.
2. Use gemini API to identify the best recipes based on the household members profile and cuisine preferences.
3. Use spoonacular API for recipe details

---

## Prompt 24
update prompt.md with all prompts as of now

---

## Prompt 25
rearrange the buttons to reflect the correct sequence of flow

---

## Prompt 26
Update master_prompt.md based on what the app currently have and the api and MCP it uses.

---

## Prompt 27
git push
