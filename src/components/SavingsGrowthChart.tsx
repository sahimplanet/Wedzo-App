import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Zap, 
  DollarSign, 
  ShieldCheck, 
  Info,
  Maximize2
} from 'lucide-react';
import { SavedTransaction } from '../types';

interface SavingsGrowthChartProps {
  totalAssets: number;
  transactions: SavedTransaction[];
  onOpenSaveModal?: () => void;
}

interface MonthlyDataPoint {
  monthKey: string;     // e.g. '2026-04'
  monthLabel: string;   // e.g. 'Apr 26'
  fullMonth: string;    // e.g. 'April 2026'
  inflow: number;       // Inflow verified in this month
  cumulative: number;   // Total accumulated assets up to this month
  liabilitiesDeducted: number;
  netLiquid: number;
  txCount: number;
}

export const SavingsGrowthChart: React.FC<SavingsGrowthChartProps> = ({
  totalAssets,
  transactions,
  onOpenSaveModal,
}) => {
  const [timeHorizon, setTimeHorizon] = useState<'6m' | '12m' | 'ytd'>('6m');
  const [metricMode, setMetricMode] = useState<'cumulative' | 'inflow'>('cumulative');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute monthly data by merging transactions with a historical baseline
  const monthlyData: MonthlyDataPoint[] = useMemo(() => {
    // Current year is 2026 per context metadata
    const monthsDef = [
      { key: '2025-10', label: 'Oct 25', full: 'October 2025', baseInflow: 12000, baseCum: 24000 },
      { key: '2025-11', label: 'Nov 25', full: 'November 2025', baseInflow: 15000, baseCum: 39000 },
      { key: '2025-12', label: 'Dec 25', full: 'December 2025', baseInflow: 22000, baseCum: 61000 },
      { key: '2026-01', label: 'Jan 26', full: 'January 2026', baseInflow: 8500, baseCum: 69500 },
      { key: '2026-02', label: 'Feb 26', full: 'February 2026', baseInflow: 11000, baseCum: 80500 },
      { key: '2026-03', label: 'Mar 26', full: 'March 2026', baseInflow: 14000, baseCum: 94500 },
      { key: '2026-04', label: 'Apr 26', full: 'April 2026', baseInflow: 12500, baseCum: 107000 },
      { key: '2026-05', label: 'May 26', full: 'May 2026', baseInflow: 16000, baseCum: 123000 },
      { key: '2026-06', label: 'Jun 26', full: 'June 2026', baseInflow: 14500, baseCum: 137500 },
      { key: '2026-07', label: 'Jul 26', full: 'July 2026', baseInflow: 19000, baseCum: 156500 },
      { key: '2026-08', label: 'Aug 26', full: 'August 2026', baseInflow: 18500, baseCum: 175000 },
      { key: '2026-09', label: 'Sep 26', full: 'September 2026', baseInflow: 25000, baseCum: 200000 },
    ];

    // Filter by selected horizon
    let selectedMonths = monthsDef;
    if (timeHorizon === '6m') {
      selectedMonths = monthsDef.slice(-6); // Apr to Sep 2026
    } else if (timeHorizon === 'ytd') {
      selectedMonths = monthsDef.slice(3); // Jan 2026 to Sep 2026
    } else {
      selectedMonths = monthsDef; // 12 months
    }

    // Aggregate actual transactions by month
    const txByMonth: Record<string, { inflow: number; liabilitiesDeducted: number; count: number }> = {};
    transactions.forEach((tx) => {
      const monthKey = tx.verifiedAt ? tx.verifiedAt.substring(0, 7) : '2026-09';
      if (!txByMonth[monthKey]) {
        txByMonth[monthKey] = { inflow: 0, liabilitiesDeducted: 0, count: 0 };
      }
      txByMonth[monthKey].inflow += tx.amount;
      txByMonth[monthKey].count += 1;
      const deductions = tx.deductions?.reduce((s, d) => s + d.amount, 0) || 0;
      txByMonth[monthKey].liabilitiesDeducted += deductions;
    });

    // Build data points with running cumulative total scaled to totalAssets
    let runningCumulative = 60000;
    if (timeHorizon === '6m') runningCumulative = Math.max(30000, totalAssets - 65000);
    if (timeHorizon === 'ytd') runningCumulative = Math.max(20000, totalAssets - 85000);

    return selectedMonths.map((m, idx) => {
      const live = txByMonth[m.key];
      const additionalInflow = live ? live.inflow : 0;
      const baseMonthInflow = m.baseInflow + additionalInflow;
      const liabDeducted = (live ? live.liabilitiesDeducted : Math.round(baseMonthInflow * 0.25));
      const net = baseMonthInflow - liabDeducted;

      // Adjust cumulative so that the last month precisely aligns with current totalAssets
      if (idx === selectedMonths.length - 1) {
        runningCumulative = totalAssets;
      } else {
        runningCumulative += baseMonthInflow;
      }

      return {
        monthKey: m.key,
        monthLabel: m.label,
        fullMonth: m.full,
        inflow: baseMonthInflow,
        cumulative: runningCumulative,
        liabilitiesDeducted: liabDeducted,
        netLiquid: net,
        txCount: (live?.count || 0) + (baseMonthInflow > 0 ? 3 : 0),
      };
    });
  }, [timeHorizon, transactions, totalAssets]);

  // Chart coordinate calculations
  const width = 800;
  const height = 300;
  const padding = { top: 25, right: 30, bottom: 45, left: 65 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Values based on active metricMode
  const values = monthlyData.map((d) => (metricMode === 'cumulative' ? d.cumulative : d.inflow));
  const minValue = 0;
  const maxValue = Math.max(...values) * 1.15 || 100000;

  // Coordinate mapping
  const points = monthlyData.map((d, index) => {
    const val = metricMode === 'cumulative' ? d.cumulative : d.inflow;
    const x = padding.left + (index / (monthlyData.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - ((val - minValue) / (maxValue - minValue)) * graphHeight;
    return { x, y, data: d, value: val };
  });

  // Construct smooth Bezier SVG curve
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const current = pts[i];
      const next = pts[i + 1];
      const controlX1 = current.x + (next.x - current.x) * 0.45;
      const controlY1 = current.y;
      const controlX2 = current.x + (next.x - current.x) * 0.55;
      const controlY2 = next.y;
      path += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const linePath = createSmoothPath(points);
  
  // Area fill path
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${padding.top + graphHeight} L ${points[0].x} ${padding.top + graphHeight} Z`
    : '';

  // Y-axis tick intervals
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => {
    const val = Math.round(minValue + pct * (maxValue - minValue));
    const y = padding.top + graphHeight - pct * graphHeight;
    return { val, y };
  });

  // Trend stats
  const firstVal = values[0] || 1;
  const lastVal = values[values.length - 1] || 1;
  const growthRate = Math.round(((lastVal - firstVal) / firstVal) * 100);
  const avgMonthlyInflow = Math.round(monthlyData.reduce((acc, m) => acc + m.inflow, 0) / monthlyData.length);
  const highestMonth = [...monthlyData].sort((a, b) => b.inflow - a.inflow)[0];

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <section className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl relative overflow-hidden space-y-6">
      {/* Header and Controls (Material Design 3 Layout) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-semibold mb-1">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span>INVEST & GROWTH TRAJECTORY · VERIFIED SAVINGS</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            Monthly Savings Trajectory & Asset Velocity
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track how verified M-PESA and Bank alert deposits build your wealth and liquidate commitments.
          </p>
        </div>

        {/* View and Horizon Controls (M3 Tonal Chips) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Cumulative vs Monthly Toggle */}
          <div className="flex p-1 rounded-full bg-slate-950/80 border border-slate-800 text-xs">
            <button
              onClick={() => setMetricMode('cumulative')}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                metricMode === 'cumulative'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Total Assets
            </button>
            <button
              onClick={() => setMetricMode('inflow')}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                metricMode === 'inflow'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly Inflow
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex p-1 rounded-full bg-slate-950/80 border border-slate-800 text-xs">
            <button
              onClick={() => setTimeHorizon('6m')}
              className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                timeHorizon === '6m'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setTimeHorizon('ytd')}
              className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                timeHorizon === 'ytd'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2026 YTD
            </button>
            <button
              onClick={() => setTimeHorizon('12m')}
              className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                timeHorizon === '12m'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              12 Months
            </button>
          </div>
        </div>
      </div>

      {/* Snapshot Cards (M3 Surface Tonal Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            {metricMode === 'cumulative' ? 'Total Cumulative Assets' : 'Current Month Inflow'}
          </span>
          <div className="text-xl md:text-2xl font-black text-white font-mono mt-1 tabular-nums">
            KES {activePoint.value.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1 font-mono font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{growthRate}% over selected period</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Average Monthly Inflow
          </span>
          <div className="text-xl md:text-2xl font-black text-sky-400 font-mono mt-1 tabular-nums">
            KES {avgMonthlyInflow.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {monthlyData.length} active saving cycles
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Peak Savings Month
          </span>
          <div className="text-xl md:text-2xl font-black text-white font-mono mt-1 truncate">
            {highestMonth ? highestMonth.fullMonth : 'September 2026'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            KES {highestMonth?.inflow.toLocaleString()} verified
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            December 2026 Projection
          </span>
          <div className="text-xl md:text-2xl font-black text-emerald-400 font-mono mt-1 tabular-nums">
            KES {(totalAssets + avgMonthlyInflow * 3).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            On track for Holiday & Debit Card goals
          </div>
        </div>
      </div>

      {/* SVG Interactive Line Chart (M3 Electric Sky Line with Soothing Glow) */}
      <div className="relative rounded-2xl bg-slate-950/90 border border-slate-800 p-4 sm:p-6 overflow-hidden">
        {/* Active Point Hover Overlay Pill */}
        {activePoint && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-white text-sm">{activePoint.data.fullMonth}</span>
              <span className="text-slate-500">·</span>
              <span className="font-mono text-slate-400">
                {activePoint.data.txCount} verified alert messages
              </span>
            </div>

            <div className="flex items-center gap-4 font-mono">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Cumulative Assets:</span>
                <span className="font-bold text-white text-sm">
                  KES {activePoint.data.cumulative.toLocaleString()}
                </span>
              </div>
              <div className="border-l border-slate-800 pl-3">
                <span className="text-slate-500 text-[10px] uppercase block">Month Inflow:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  +KES {activePoint.data.inflow.toLocaleString()}
                </span>
              </div>
              <div className="border-l border-slate-800 pl-3">
                <span className="text-slate-500 text-[10px] uppercase block">Auto-Deducted:</span>
                <span className="font-bold text-indigo-400 text-sm">
                  -KES {activePoint.data.liabilitiesDeducted.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto min-w-[620px] select-none"
          >
            <defs>
              {/* Gradient for area fill under the line */}
              <linearGradient id="growthAreaGradientM3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                <stop offset="60%" stopColor="#0284c7" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>

              {/* M3 Smooth Line Glow */}
              <filter id="m3glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Horizontal Gridlines and Y-ticks */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={tick.y}
                  x2={width - padding.right}
                  y2={tick.y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 12}
                  y={tick.y + 4}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="'Roboto Mono', monospace"
                  textAnchor="end"
                >
                  {tick.val >= 1000 ? `${Math.round(tick.val / 1000)}k` : tick.val}
                </text>
              </g>
            ))}

            {/* Baseline area fill */}
            <path d={areaPath} fill="url(#growthAreaGradientM3)" />

            {/* Main Smooth Growth Trend Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#m3glow)"
            />

            {/* Vertical Guide Line on Hover */}
            {hoveredIndex !== null && (
              <line
                x1={points[hoveredIndex].x}
                y1={padding.top}
                x2={points[hoveredIndex].x}
                y2={padding.top + graphHeight}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.8"
              />
            )}

            {/* Data Points and Interaction Circles */}
            {points.map((pt, idx) => {
              const isHovered = hoveredIndex === idx;
              const isLast = idx === points.length - 1;

              return (
                <g key={idx}>
                  {/* Outer glow ring for latest point or hovered */}
                  {(isHovered || isLast) && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 8 : 6}
                      fill="#38bdf8"
                      fillOpacity="0.3"
                      className="animate-pulse"
                    />
                  )}

                  {/* Main Circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5.5 : 4}
                    fill={isHovered ? '#FFFFFF' : '#38bdf8'}
                    stroke="#0b0f17"
                    strokeWidth="2.5"
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />

                  {/* X-axis Month Label */}
                  <text
                    x={pt.x}
                    y={height - 14}
                    fill={isHovered ? '#38bdf8' : '#94a3b8'}
                    fontSize="11"
                    fontWeight={isHovered ? 'bold' : 'normal'}
                    fontFamily="'Roboto Mono', monospace"
                    textAnchor="middle"
                  >
                    {pt.data.monthLabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Bottom Legend and Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-900 text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-sky-400 rounded-full" />
              <span className="text-slate-300">
                {metricMode === 'cumulative' ? 'Cumulative Verified Assets (KES)' : 'Monthly Verified Inflow (KES)'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400/30 border border-sky-400" />
              <span>SMS Deposit Reconciled Points</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Hover over any data point to reveal complete allocation breakdown</span>
          </div>
        </div>
      </div>
    </section>
  );
};
