import { useMemo, useState } from 'react';
import { Banknote, ChevronDown, ChevronUp, Home, Wrench, Sofa, TreePine, FileText } from 'lucide-react';
import type { DesignParams } from '@/types';

interface CostEstimatorProps {
  params: DesignParams;
}

// Base costs per sqft by location (USD)
const LOCATION_MULTIPLIERS: Record<string, number> = {
  'United Kingdom': 1.3,
  'United States': 1.0,
  'Australia': 1.2,
  'Canada': 0.95,
  'UAE': 1.4,
  'Germany': 1.25,
  'France': 1.2,
  'Spain': 0.9,
  'Italy': 0.95,
  'Netherlands': 1.3,
};

const STYLE_MULTIPLIERS: Record<string, number> = {
  'Modern': 1.1,
  'Luxury': 1.8,
  'Minimal': 0.9,
  'Villa': 1.5,
  'Classic': 1.0,
  'Industrial': 1.05,
  'Rustic': 0.95,
  'Mediterranean': 1.2,
  'Scandinavian': 1.15,
  'Contemporary': 1.1,
};

const BUDGET_BASE: Record<string, number> = {
  'Under $200k': 150000,
  '$200k - $400k': 300000,
  '$400k - $600k': 500000,
  '$600k - $1M': 800000,
  'Over $1M': 1500000,
};

const PLOT_SIZES: Record<string, number> = {
  'Small (under 5,000 sq ft)': 4000,
  'Medium (5,000 - 10,000 sq ft)': 7500,
  'Large (10,000 - 20,000 sq ft)': 15000,
  'Estate (over 20,000 sq ft)': 25000,
};

function formatCurrency(amount: number, location: string): string {
  const currencies: Record<string, { symbol: string; rate: number }> = {
    'United Kingdom': { symbol: '£', rate: 0.79 },
    'United States': { symbol: '$', rate: 1 },
    'Australia': { symbol: 'A$', rate: 1.53 },
    'Canada': { symbol: 'C$', rate: 1.36 },
    'UAE': { symbol: 'AED', rate: 3.67 },
    'Germany': { symbol: '€', rate: 0.92 },
    'France': { symbol: '€', rate: 0.92 },
    'Spain': { symbol: '€', rate: 0.92 },
    'Italy': { symbol: '€', rate: 0.92 },
    'Netherlands': { symbol: '€', rate: 0.92 },
  };

  const currency = currencies[location] || { symbol: '$', rate: 1 };
  const converted = amount * currency.rate;
  if (converted >= 1000000) return `${currency.symbol}${(converted / 1000000).toFixed(2)}M`;
  if (converted >= 1000) return `${currency.symbol}${(converted / 1000).toFixed(0)}k`;
  return `${currency.symbol}${converted.toFixed(0)}`;
}

export default function CostEstimator({ params }: CostEstimatorProps) {
  const [expanded, setExpanded] = useState(false);

  const costs = useMemo(() => {
    const base = BUDGET_BASE[params.budget] || 500000;
    const locationMult = LOCATION_MULTIPLIERS[params.location || 'United States'] || 1;
    const styleMult = STYLE_MULTIPLIERS[params.style] || 1;
    const plotSqft = PLOT_SIZES[params.plot_size] || 7500;
    const roomMult = 1 + (params.rooms - 5) * 0.05;
    const floorMult = 1 + (params.floors - 1) * 0.15;

    const total = base * locationMult * styleMult * roomMult * floorMult;

    const land = total * 0.25;
    const construction = total * 0.45;
    const interior = total * 0.15;
    const landscaping = total * 0.05;
    const permits = total * 0.03;
    const contingency = total * 0.07;

    const pricePerSqft = (construction / plotSqft) * 10;

    return {
      land,
      construction,
      interior,
      landscaping,
      permits,
      contingency,
      total,
      pricePerSqft,
      location: params.location || 'United States',
    };
  }, [params]);

  const breakdown = [
    { label: 'Land & Plot', value: costs.land, icon: Home, color: 'bg-blue-500', percent: 25 },
    { label: 'Construction', value: costs.construction, icon: Wrench, color: 'bg-primary', percent: 45 },
    { label: 'Interior & Finishing', value: costs.interior, icon: Sofa, color: 'bg-violet-500', percent: 15 },
    { label: 'Landscaping', value: costs.landscaping, icon: TreePine, color: 'bg-green-500', percent: 5 },
    { label: 'Permits & Fees', value: costs.permits, icon: FileText, color: 'bg-amber-500', percent: 3 },
    { label: 'Contingency (7%)', value: costs.contingency, icon: Banknote, color: 'bg-red-400', percent: 7 },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-4 md:px-6 py-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Banknote className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Cost Estimator</p>
            <p className="text-xs text-muted-foreground">
              Estimated total: <span className="font-semibold text-primary">
                {formatCurrency(costs.total, costs.location)}
              </span>
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 md:px-6 pb-5 space-y-5 border-t border-border pt-4">

          {/* Total highlight */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-center">
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(costs.total, costs.location)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Estimate</p>
            </div>
            <div className="p-3 rounded-xl bg-muted text-center">
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(costs.pricePerSqft, costs.location)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Per sq ft</p>
            </div>
          </div>

          {/* Visual bar */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Cost Breakdown</p>
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
              {breakdown.map((item) => (
                <div
                  key={item.label}
                  className={`${item.color} transition-all`}
                  style={{ width: `${item.percent}%` }}
                  title={`${item.label}: ${item.percent}%`}
                />
              ))}
            </div>
          </div>

          {/* Breakdown list */}
          <div className="space-y-2">
            {breakdown.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{item.percent}%</span>
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(item.value, costs.location)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            ⚠️ These are rough estimates based on your selected parameters. Actual costs may vary significantly based on local market conditions, materials, and contractors.
          </p>
        </div>
      )}
    </div>
  );
}