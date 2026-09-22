import React from 'react';
import { Airline, FlightSearchParams } from '../../types/flight';
import { Filter, X, ArrowUpDown } from 'lucide-react';

interface FlightFiltersProps {
  airlines: Airline[];
  params: FlightSearchParams;
  onFilterChange: (newParams: Partial<FlightSearchParams>) => void;
  onReset: () => void;
}

export const FlightFilters: React.FC<FlightFiltersProps> = ({
  airlines,
  params,
  onFilterChange,
  onReset,
}) => {
  const riskLevels = [
    { label: 'All Risks', value: '' },
    { label: 'Low Risk', value: 'LOW', color: 'low' },
    { label: 'Medium Risk', value: 'MEDIUM', color: 'medium' },
    { label: 'High Risk', value: 'HIGH', color: 'high' },
    { label: 'Critical Risk', value: 'CRITICAL', color: 'critical' },
  ] as const;

  const sortOptions = [
    { label: 'Departure Time', value: 'departure' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Delay Risk (Highest)', value: 'risk_desc' },
  ];

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2 font-semibold text-content-primary text-sm">
          <Filter className="w-4 h-4 text-brand" />
          Filter & Sort Results
        </div>
        <button
          onClick={onReset}
          className="text-xs text-content-muted hover:text-semantic-danger flex items-center gap-1 transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Clear All
        </button>
      </div>

      {/* Sort Option */}
      <div>
        <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
          <ArrowUpDown className="w-3.5 h-3.5 text-content-muted" /> Sort By
        </label>
        <select
          value={params.sort_by || 'departure'}
          onChange={(e) => onFilterChange({ sort_by: e.target.value, page: 1 })}
          className="w-full text-xs py-2 px-3 rounded-md border border-border bg-surface text-content-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Delay Risk Level */}
      <div>
        <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2">
          ML Delay Risk Level
        </label>
        <div className="flex flex-wrap gap-1.5">
          {riskLevels.map((r) => {
            const isSelected = (params.risk_level || '') === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => onFilterChange({ risk_level: isSelected ? undefined : (r.value || undefined), page: 1 })}
                className={`px-2.5 py-1 text-xs rounded-full border transition-all font-medium ${
                  isSelected
                    ? 'bg-brand text-white border-brand shadow-xs'
                    : 'bg-surface-subtle text-content-secondary border-border hover:border-brand/40'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Airline Carrier Filter */}
      <div>
        <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2">
          Airline Carrier
        </label>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          <label className="flex items-center text-xs text-content-secondary cursor-pointer">
            <input
              type="radio"
              name="airline_filter"
              checked={!params.airline_code}
              onChange={() => onFilterChange({ airline_code: undefined, page: 1 })}
              className="mr-2 text-brand focus:ring-brand"
            />
            All Carriers
          </label>
          {airlines.map((al) => (
            <label key={al.id} className="flex items-center text-xs text-content-secondary cursor-pointer">
              <input
                type="radio"
                name="airline_filter"
                checked={params.airline_code === al.code}
                onChange={() => onFilterChange({ airline_code: al.code, page: 1 })}
                className="mr-2 text-brand focus:ring-brand"
              />
              {al.name} ({al.code})
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2">
          Max Fare (₹)
        </label>
        <input
          type="number"
          placeholder="e.g. 10000"
          value={params.max_price || ''}
          onChange={(e) => onFilterChange({ max_price: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
          className="w-full text-xs py-2 px-3 rounded-md border border-border bg-surface text-content-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
        />
      </div>
    </div>
  );
};
