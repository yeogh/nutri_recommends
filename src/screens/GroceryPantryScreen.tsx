import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  PackageCheck,
  AlertCircle,
  Truck,
  Receipt,
  RefreshCw,
  CheckCircle2,
  Plus,
  Minus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdBanner } from '../components/AdBanner';

export const GroceryPantryScreen: React.FC = () => {
  const {
    meals,
    pantry,
    updatePantryItem,
    addReceiptToPantry,
    planLocked,
    setPlanLocked,
    recordDeliveryOrder,
    referralRevenueEarned,
  } = useApp();

  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<{
    orderId: string;
    total: number;
    referralFee: number;
    platform: string;
  } | null>(null);

  // Consolidate ingredients across winning meals and deduct pantry stock
  const consolidatedList = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        requiredQty: number;
        inPantryQty: number;
        netToBuyQty: number;
        unit: string;
        category: string;
        estimatedPrice: number;
      }
    >();

    for (const meal of meals) {
      for (const ing of meal.ingredients) {
        const existing = map.get(ing.name);
        if (existing) {
          existing.requiredQty += ing.quantity;
          existing.estimatedPrice += ing.estimatedPrice;
        } else {
          const pantryMatch = pantry.find(
            (p) => p.name.toLowerCase() === ing.name.toLowerCase()
          );
          const inPantryQty = pantryMatch ? pantryMatch.quantity : 0;
          map.set(ing.name, {
            name: ing.name,
            requiredQty: ing.quantity,
            inPantryQty,
            netToBuyQty: Math.max(0, ing.quantity - inPantryQty),
            unit: ing.unit,
            category: ing.category,
            estimatedPrice: ing.estimatedPrice,
          });
        }
      }
    }

    return Array.from(map.values()).map((item) => ({
      ...item,
      netToBuyQty: Math.max(0, item.requiredQty - item.inPantryQty),
      netPrice:
        item.requiredQty > 0
          ? Number(
              (
                item.estimatedPrice *
                (Math.max(0, item.requiredQty - item.inPantryQty) / item.requiredQty)
              ).toFixed(2)
            )
          : 0,
    }));
  }, [meals, pantry]);

  const totalOrderAmount = useMemo(
    () =>
      Number(
        consolidatedList.reduce((acc, item) => acc + item.netPrice, 0).toFixed(2)
      ),
    [consolidatedList]
  );

  const referralCommission = Number((totalOrderAmount * 0.02).toFixed(2));

  const handleSyncPantry = () => {
    setSyncLoading(true);
    setSyncMessage(null);
    setTimeout(() => {
      setSyncMessage('Reconciled grocery list deductions and expiration alerts with household pantry inventory.');
      setSyncLoading(false);
    }, 300);
  };

  const handleScanReceipt = () => {
    addReceiptToPantry([
      {
        id: `p-rec-${Date.now()}`,
        name: 'Asparagus Spears',
        quantity: 400,
        unit: 'g',
        category: 'Produce',
        expiresInDays: 4,
      },
      {
        id: `p-rec-${Date.now() + 1}`,
        name: 'Tri-Color Quinoa',
        quantity: 350,
        unit: 'g',
        category: 'Grains & Pantry',
        expiresInDays: 120,
      },
    ]);
    setSyncMessage(
      'Receipt Processed: Added 400g Asparagus Spears & 350g Tri-Color Quinoa to Household Pantry!'
    );
  };

  const handleOrderViaDelivery = () => {
    recordDeliveryOrder(totalOrderAmount);
    setOrderConfirmation({
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      total: totalOrderAmount,
      referralFee: referralCommission,
      platform: 'Connected Grocery Delivery Partner',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <PackageCheck className="h-3.5 w-3.5" />
              <span>Household Pantry Sync • Smart Inventory Deduction &amp; Delivery Checkout</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              Consolidated Grocery List &amp; Pantry Sync
            </h1>
            <p className="text-sm text-stone-600 max-w-2xl">
              Once your weekly plan is locked, NutriRecommends auto-deducts ingredients already in your household pantry, flags expiring items, and dispatches your net shopping cart to a delivery partner.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSyncPantry}
              disabled={syncLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${syncLoading ? 'animate-spin' : ''}`} />
              <span>Re-Sync Pantry Inventory</span>
            </button>

            <button
              type="button"
              onClick={handleScanReceipt}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
            >
              <Receipt className="h-4 w-4" />
              <span>Process Grocery Receipt</span>
            </button>
          </div>
        </div>

        {syncMessage && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-900">
            {syncMessage}
          </div>
        )}
      </div>

      {/* One-Tap Order via Delivery Platform Banner */}
      <div className="rounded-2xl border-2 border-emerald-600 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-700/80 px-3 py-1 text-xs font-semibold text-emerald-100">
              <Truck className="h-3.5 w-3.5" />
              <span>2% Partner Referral Revenue Stream Active</span>
            </div>
            <h2 className="text-xl font-bold">
              Ready to Checkout Your Net Weekly Grocery Cart?
            </h2>
            <p className="text-xs text-emerald-100 max-w-xl">
              Pantry deductions saved you from double-buying {pantry.length} stocked staples. Hand off the remaining items to our connected grocery delivery platform in one tap.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-xs">
            <div>
              <span className="text-xs text-emerald-200 block">Net Cart Subtotal</span>
              <span className="text-2xl font-extrabold">${totalOrderAmount.toFixed(2)}</span>
              <span className="text-[11px] text-emerald-200 block">
                Generates ${referralCommission.toFixed(2)} (2% referral revenue)
              </span>
            </div>
            <button
              type="button"
              onClick={handleOrderViaDelivery}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-950 shadow-xs hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4 text-emerald-700" />
              <span>Order via Delivery Platform</span>
            </button>
          </div>
        </div>

        {orderConfirmation && (
          <div className="mt-4 rounded-xl bg-emerald-950/70 border border-emerald-400/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>
                <strong>Order {orderConfirmation.orderId} Dispatched!</strong> Handed off $
                {orderConfirmation.total.toFixed(2)} cart to {orderConfirmation.platform}.
              </span>
            </div>
            <span className="font-semibold text-emerald-300">
              +${orderConfirmation.referralFee.toFixed(2)} credited to 2% Referral Revenue (Cumulative: $
              {referralRevenueEarned.toFixed(2)})
            </span>
          </div>
        )}
      </div>

      <AdBanner
        placement="Grocery Checkout Companion"
        sponsorTag="Delivery Partner Promotion"
        headline="Free Same-Day Cold-Chain Delivery on Orders Over $50"
        copy="Sponsored by partner supermarkets. Keep your salmon and organic greens chilled to your doorstep."
        ctaText="Apply Free Delivery"
      />

      {/* Two-Column Grid: Net Grocery List vs. Household Pantry Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consolidated Grocery List */}
        <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Consolidated Grocery List (Pantry Deducted)
              </h2>
              <p className="text-xs text-stone-500">
                Derived from {meals.length} planned family dinners •{' '}
                {planLocked ? 'Plan Locked' : 'Voting Still Open'}
              </p>
            </div>
            {!planLocked && (
              <button
                type="button"
                onClick={() => setPlanLocked(true)}
                className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 cursor-pointer"
              >
                Lock Weekly Plan Now
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase">
                  <th className="py-2.5 pr-3">Ingredient</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Required</th>
                  <th className="py-2.5 px-3">In Pantry</th>
                  <th className="py-2.5 px-3">Net To Buy</th>
                  <th className="py-2.5 pl-3 text-right">Est. Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {consolidatedList.map((item) => (
                  <tr key={item.name} className="hover:bg-stone-50/80">
                    <td className="py-3 pr-3 font-semibold text-stone-900">{item.name}</td>
                    <td className="py-3 px-3 text-stone-500">{item.category}</td>
                    <td className="py-3 px-3 text-stone-700">
                      {item.requiredQty} {item.unit}
                    </td>
                    <td className="py-3 px-3">
                      {item.inPantryQty > 0 ? (
                        <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                          -{item.inPantryQty} {item.unit} stocked
                        </span>
                      ) : (
                        <span className="text-stone-400">0 {item.unit}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-stone-900">
                      {item.netToBuyQty > 0 ? (
                        `${item.netToBuyQty} ${item.unit}`
                      ) : (
                        <span className="text-emerald-600 font-semibold">Covered by Pantry</span>
                      )}
                    </td>
                    <td className="py-3 pl-3 text-right font-semibold text-stone-900">
                      ${item.netPrice.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Household Pantry Stock & Expiration Alerts */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Household Pantry Inventory
            </h2>
            <p className="text-xs text-stone-500">
              Pantry Inventory • Expiration Alerts &amp; Stock Controls
            </p>
          </div>

          <div className="space-y-2.5">
            {pantry.map((item) => {
              const expiringSoon = item.expiresInDays <= 5;
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-3 ${
                    expiringSoon
                      ? 'border-amber-300 bg-amber-50/50'
                      : 'border-stone-200 bg-stone-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-stone-900">{item.name}</p>
                      <p className="text-[11px] text-stone-500">
                        Stocked: <strong>{item.quantity} {item.unit}</strong> • {item.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updatePantryItem(item.id, -50)}
                        className="rounded-md border border-stone-200 bg-white p-1 text-stone-600 hover:bg-stone-100 cursor-pointer"
                        title="Reduce stock"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updatePantryItem(item.id, 50)}
                        className="rounded-md border border-stone-200 bg-white p-1 text-stone-600 hover:bg-stone-100 cursor-pointer"
                        title="Increase stock"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  {expiringSoon && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                      <span>Expires in {item.expiresInDays} days — prioritized in this week’s meals</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
