import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WeeklyMealPlanScreen } from './screens/WeeklyMealPlanScreen';
import { GroceryPantryScreen } from './screens/GroceryPantryScreen';
import { DailyCookingViewScreen } from './screens/DailyCookingViewScreen';
import { SubscriptionScreen } from './screens/SubscriptionScreen';
import { AdminMetricsScreen } from './screens/AdminMetricsScreen';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
          <Navbar />
          <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
            <Routes>
              <Route path="/" element={<WeeklyMealPlanScreen />} />
              <Route path="/grocery" element={<GroceryPantryScreen />} />
              <Route path="/cooking" element={<DailyCookingViewScreen />} />
              <Route path="/pricing" element={<SubscriptionScreen />} />
              <Route path="/admin" element={<AdminMetricsScreen />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
