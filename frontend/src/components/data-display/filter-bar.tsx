import React from 'react';
import { Search, LayoutGrid, List, Map } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: FilterGroup[];
  activeFilters: Record<string, string>;
  onFilterChange: (filterId: string, value: string) => void;
  viewMode?: 'table' | 'grid' | 'map';
  onViewModeChange?: (mode: 'table' | 'grid' | 'map') => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  filters,
  activeFilters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  className
}) => {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl", className)}>
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
        />
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {filters.map((filter) => (
          <select
            key={filter.id}
            value={activeFilters[filter.id] || ''}
            onChange={(e) => onFilterChange(filter.id, e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">{filter.label}</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}
        
        {viewMode && onViewModeChange && (
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg ml-2">
            <button
              onClick={() => onViewModeChange('table')}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === 'table' ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === 'grid' ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('map')}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === 'map' ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
