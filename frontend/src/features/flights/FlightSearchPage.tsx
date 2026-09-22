import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { flightService } from '../../services/flightService';
import { aeroApiService } from '../../services/aeroApiService';
import {
  Airport,
  Airline,
  FlightSearchParams,
  PaginatedFlightResponse
} from '../../types/flight';
import { FlightSearchForm } from './FlightSearchForm';
import { FlightFilters } from './FlightFilters';
import { FlightCard } from './FlightCard';
import { Button } from '../../components/ui/Button';
import { Plane, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, SlidersHorizontal, CheckCircle2 } from 'lucide-react';

export const FlightSearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [airports, setAirports] = useState<Airport[]>([]);
  const [airlines, setAirlines] = useState<Airline[]>([]);

  const [params, setParams] = useState<FlightSearchParams>(() => ({
    origin: searchParams.get('origin') || undefined,
    destination: searchParams.get('destination') || undefined,
    departure_date: searchParams.get('departure_date') || undefined,
    airline_code: searchParams.get('airline_code') || undefined,
    risk_level: searchParams.get('risk_level') || undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    sort_by: searchParams.get('sort_by') || 'departure',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: 10,
  }));

  const [data, setData] = useState<PaginatedFlightResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncingLive, setIsSyncingLive] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<{ message: string; source: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);

  const handleSyncLive = async () => {
    setIsSyncingLive(true);
    setSyncToast(null);
    try {
      const res = await aeroApiService.syncLiveFlights(params.origin, 15);
      setSyncToast({ message: res.message, source: res.source });
      await executeSearch(params);
      setTimeout(() => setSyncToast(null), 6000);
    } catch {
      setError('Live sync failed. Please check network connectivity or AeroAPI key.');
    } finally {
      setIsSyncingLive(false);
    }
  };

  // Sync params when URL searchParams changes
  useEffect(() => {
    const origin = searchParams.get('origin') || undefined;
    const destination = searchParams.get('destination') || undefined;
    const departure_date = searchParams.get('departure_date') || undefined;
    const airline_code = searchParams.get('airline_code') || undefined;
    const risk_level = searchParams.get('risk_level') || undefined;
    const min_price = searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined;
    const max_price = searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined;
    const sort_by = searchParams.get('sort_by') || 'departure';
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

    setParams({
      origin,
      destination,
      departure_date,
      airline_code,
      risk_level,
      min_price,
      max_price,
      sort_by,
      page,
      limit: 10,
    });
  }, [searchParams]);

  // Load reference dropdowns (airports, airlines)
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [airportsData, airlinesData] = await Promise.all([
          flightService.getAirports(),
          flightService.getAirlines(),
        ]);
        setAirports(airportsData);
        setAirlines(airlinesData);
      } catch (err) {
        console.error('Failed to load reference data', err);
      }
    };
    fetchReferenceData();
  }, []);

  // Execute flight search query
  const executeSearch = async (searchParamsToUse: FlightSearchParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await flightService.searchFlights(searchParamsToUse);
      setData(res);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setError(axiosErr.response?.data?.error?.message || 'Failed to search flights. Please try again.');
      } else {
        setError('Unable to connect to FlightGuard server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(params);
  }, [params]);

  const handleFormSearch = (newSearchParams: FlightSearchParams) => {
    const updated = { ...params, ...newSearchParams, page: 1 };
    setParams(updated);
  };

  const handleFilterChange = (partial: Partial<FlightSearchParams>) => {
    setParams((prev) => ({ ...prev, ...partial }));
  };

  const handleResetFilters = () => {
    setParams({
      sort_by: 'departure',
      page: 1,
      limit: 10,
    });
  };

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Title with Live Sync Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">Search Flight Schedule</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-soft text-brand border border-supporting/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live AeroAPI Feed
            </span>
          </div>
          <p className="text-sm text-content-muted mt-1">
            Real-time live flight radar, dynamic carrier schedules, and XGBoost delay probability metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncLive}
            isLoading={isSyncingLive}
            className="border-brand/40 hover:border-brand text-brand hover:bg-brand/5 shadow-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isSyncingLive ? 'animate-spin' : ''}`} />
            Sync Live Flights
          </Button>
        </div>
      </div>

      {syncToast && (
        <div className="p-3.5 bg-cream-soft border border-cream-border rounded-xl flex items-center justify-between text-xs text-secondary-hover shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncToast.message}</span>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-brand text-white">
              {syncToast.source}
            </span>
          </div>
          <button onClick={() => setSyncToast(null)} className="text-content-muted hover:text-content-primary font-bold ml-2">✕</button>
        </div>
      )}

      {/* Main Search Form Bar */}
      <FlightSearchForm
        airports={airports}
        initialParams={params}
        onSearch={handleFormSearch}
      />

      {/* Main Content Grid: Sidebar Filters + Flight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="w-full justify-center"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            {showFiltersMobile ? 'Hide Filters' : 'Show Filter Options'}
          </Button>
        </div>

        {/* Sidebar Filters */}
        <div className={`lg:col-span-3 ${showFiltersMobile ? 'block' : 'hidden lg:block'}`}>
          <FlightFilters
            airlines={airlines}
            params={params}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Flight Results List */}
        <div className="lg:col-span-9 space-y-4">
          {/* Results Bar */}
          <div className="flex justify-between items-center bg-surface border border-border rounded-lg px-4 py-3 text-xs text-content-muted">
            <div>
              {data ? (
                <span>
                  Showing <strong className="text-content-primary">{data.items.length}</strong> of <strong className="text-content-primary">{data.total}</strong> available flights
                </span>
              ) : (
                'Loading flight schedules...'
              )}
            </div>
            {params.origin || params.destination ? (
              <div className="font-semibold text-brand">
                {params.origin || 'Any'} → {params.destination || 'Any'}
              </div>
            ) : null}
          </div>

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-surface border border-border rounded-xl p-6 shadow-xs animate-pulse">
                  <div className="h-6 bg-surface-subtle rounded w-1/4 mb-4"></div>
                  <div className="h-12 bg-surface-subtle rounded w-full"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="bg-surface border border-semantic-danger/30 rounded-xl p-8 text-center shadow-xs">
              <AlertCircle className="w-10 h-10 text-semantic-danger mx-auto mb-3" />
              <h3 className="text-lg font-bold text-semantic-danger mb-1">Unable to Load Flights</h3>
              <p className="text-sm text-content-muted mb-4 max-w-md mx-auto">{error}</p>
              <Button variant="outline" size="sm" onClick={() => executeSearch(params)}>
                <RefreshCw className="w-4 h-4 mr-2" /> Retry Request
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && data && data.items.length === 0 && (
            <div className="bg-surface border border-border rounded-xl p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-surface-subtle text-content-muted flex items-center justify-center mx-auto mb-4">
                <Plane className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-content-primary mb-1">No Flights Match Your Criteria</h3>
              <p className="text-sm text-content-muted mb-6 max-w-md mx-auto">
                No flights were found for the selected route or filter constraints. Try adjusting your origin/destination or clearing active filters.
              </p>
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Results Grid */}
          {!isLoading && !error && data && data.items.length > 0 && (
            <div className="space-y-4">
              {data.items.map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))}

              {/* Pagination Bar */}
              {data.total_pages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <span className="text-xs text-content-muted">
                    Page <strong>{data.page}</strong> of <strong>{data.total_pages}</strong>
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={data.page <= 1}
                      onClick={() => handlePageChange(data.page - 1)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={data.page >= data.total_pages}
                      onClick={() => handlePageChange(data.page + 1)}
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
