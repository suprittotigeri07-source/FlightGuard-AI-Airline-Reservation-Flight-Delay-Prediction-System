import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plane, Clock, AlertTriangle, ArrowRight,
  ArrowLeftRight, Calendar, RefreshCw, CheckCircle2,
  Sparkles
} from 'lucide-react';
import { flightService } from '../../services/flightService';
import { aeroApiService } from '../../services/aeroApiService';
import { Flight, Airport, RiskLevel } from '../../types/flight';

const riskBadges: Record<RiskLevel, { bg: string; text: string; border: string; label: string }> = {
  LOW: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'LOW RISK' },
  MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'MEDIUM RISK' },
  HIGH: { bg: 'bg-rose-50', text: 'text-[#E64833]', border: 'border-rose-200', label: 'HIGH RISK' },
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', label: 'CRITICAL RISK' },
};

const statusBadges: Record<string, { bg: string; text: string; border: string }> = {
  SCHEDULED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  DELAYED: { bg: 'bg-rose-50', text: 'text-[#E64833]', border: 'border-rose-200' },
  EN_ROUTE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  LANDED: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

// Format ISO date time to 12-hour clock (e.g. 11:37 AM)
function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
}

// Format duration
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m > 0 ? `${m}m` : ''}`;
}

export const LiveFlightPreview: React.FC = () => {
  // Preset default date to today's date
  const todayStr = new Date().toISOString().split('T')[0];

  const [airports, setAirports] = useState<Airport[]>([]);
  const [origin, setOrigin] = useState<string>('BLR');
  const [destination, setDestination] = useState<string>('DEL');
  const [departureDate, setDepartureDate] = useState<string>(todayStr);

  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Load airport list once
  useEffect(() => {
    flightService.getAirports()
      .then((data) => setAirports(data))
      .catch(() => {
        // Fallback standard airports if API offline
        setAirports([
          { id: '1', code: 'BLR', name: 'Kempegowda Int Airport', city: 'Bengaluru', country: 'India', timezone: 'Asia/Kolkata' },
          { id: '2', code: 'DEL', name: 'Indira Gandhi Int Airport', city: 'Delhi', country: 'India', timezone: 'Asia/Kolkata' },
          { id: '3', code: 'BOM', name: 'Chhatrapati Shivaji Maharaj', city: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata' },
          { id: '4', code: 'HYD', name: 'Rajiv Gandhi Int Airport', city: 'Hyderabad', country: 'India', timezone: 'Asia/Kolkata' },
          { id: '5', code: 'CCU', name: 'Netaji Subhash Chandra Bose', city: 'Kolkata', country: 'India', timezone: 'Asia/Kolkata' },
          { id: '6', code: 'MAA', name: 'Chennai Int Airport', city: 'Chennai', country: 'India', timezone: 'Asia/Kolkata' },
        ]);
      });
  }, []);

  // Fetch flights for selected origin, destination, date
  const fetchFlights = useCallback(async (
    orig?: string,
    dest?: string,
    date?: string
  ) => {
    setIsLoading(true);
    try {
      const res = await flightService.searchFlights({
        origin: orig || undefined,
        destination: dest || undefined,
        departure_date: date || undefined,
        limit: 10,
        sort_by: 'departure',
      });
      setFlights(res.items || []);
    } catch {
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFlights(origin, destination, departureDate);
  }, [fetchFlights, origin, destination, departureDate]);

  // Handle Search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFlights(origin, destination, departureDate);
  };

  // Swap origin and destination
  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  // Quick route chips
  const handleQuickSelect = (origCode: string, destCode: string) => {
    setOrigin(origCode);
    setDestination(destCode);
  };

  // Sync Live Data via AeroAPI
  const handleLiveSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await aeroApiService.syncLiveFlights(origin, 10);
      setSyncMessage(res.message || 'Live flights updated from AeroAPI feed.');
      await fetchFlights(origin, destination, departureDate);
      setTimeout(() => setSyncMessage(null), 5000);
    } catch {
      setSyncMessage('Unable to reach AeroAPI server. Please try again.');
      setTimeout(() => setSyncMessage(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const selectedOriginAirport = airports.find((a) => a.code === origin);
  const selectedDestAirport = airports.find((a) => a.code === destination);

  return (
    <section
      id="live-flight-search"
      className="py-14 sm:py-20 lg:py-24 bg-gradient-to-b from-white via-slate-50/50 to-white"
      aria-labelledby="live-section-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Section Title ── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E2ECEB] text-[#244855] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            REAL-TIME RADAR & AI PREDICTION ENGINE
          </div>
          <h2 id="live-section-heading" className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#244855] tracking-tight mb-4">
            Search Flights with{' '}
            <span className="text-[#E64833]">Live Data & AI Predictions</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Select your origin, destination, and departure date to view real-time flight telemetry, current operational status, and XGBoost machine learning delay forecasts.
          </p>
        </div>

        {/* ── Search & Filter Box ── */}
        <div className="bg-white rounded-2xl shadow-xl shadow-[#244855]/5 border border-slate-200/80 p-5 sm:p-7 mb-10">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            
            {/* Origin (Source) */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-[#244855] rotate-45" />
                From (Source)
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full h-12 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#244855] focus:border-transparent transition-all shadow-xs cursor-pointer"
              >
                <option value="">Any Origin Hub</option>
                {airports.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.city} ({a.code}) — {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="sm:col-span-1 flex items-center justify-center pb-1">
              <button
                type="button"
                onClick={handleSwap}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-[#E2ECEB] text-[#244855] flex items-center justify-center transition-colors shadow-xs hover:shadow-sm"
                title="Swap departure and destination"
                aria-label="Swap departure and destination"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            {/* Destination (Where to go) */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-[#E64833] rotate-90" />
                To (Destination)
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full h-12 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#244855] focus:border-transparent transition-all shadow-xs cursor-pointer"
              >
                <option value="">Any Destination Hub</option>
                {airports.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.city} ({a.code}) — {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Departure Date */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#244855]" />
                Travel Date
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full h-12 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#244855] focus:border-transparent transition-all shadow-xs cursor-pointer"
              />
            </div>

          </form>

          {/* ── Quick Chips & Actions Bar ── */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            
            {/* Quick Route Shortcut Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 mr-1">Popular:</span>
              {[
                { o: 'BLR', d: 'DEL', label: 'BLR ➔ DEL' },
                { o: 'BOM', d: 'DEL', label: 'BOM ➔ DEL' },
                { o: 'HYD', d: 'BOM', label: 'HYD ➔ BOM' },
                { o: 'HYD', d: 'MAA', label: 'HYD ➔ MAA' },
                { o: 'DEL', d: 'BLR', label: 'DEL ➔ BLR' },
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleQuickSelect(chip.o, chip.d)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    origin === chip.o && destination === chip.d
                      ? 'bg-[#244855] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {chip.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setOrigin('');
                  setDestination('');
                  setDepartureDate('');
                }}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-[#E64833] underline transition-colors"
              >
                Clear Filters
              </button>
            </div>

            {/* Sync Live AeroAPI Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLiveSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E2ECEB] hover:bg-[#d0e0de] text-[#244855] text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                title="Fetch real-time flight telemetries from FlightAware AeroAPI"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#E64833]' : 'text-[#244855]'}`} />
                {isSyncing ? 'Syncing Live AeroAPI Feed...' : 'Sync Live Telemetry'}
              </button>
            </div>

          </div>

          {/* Sync status toast notification */}
          {syncMessage && (
            <div className="mt-3.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncMessage}</span>
            </div>
          )}
        </div>

        {/* ── Results Header Banner ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 px-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-[#244855]">
              {flights.length} {flights.length === 1 ? 'Flight' : 'Flights'} Found
            </h3>
            {(origin || destination || departureDate) && (
              <span className="text-sm text-slate-500">
                for{' '}
                <strong className="text-slate-800">
                  {selectedOriginAirport ? selectedOriginAirport.city : origin || 'Any Origin'}
                </strong>{' '}
                ➔{' '}
                <strong className="text-slate-800">
                  {selectedDestAirport ? selectedDestAirport.city : destination || 'Any Destination'}
                </strong>
                {departureDate && ` on ${departureDate}`}
              </span>
            )}
          </div>

          {/* Mention Live Data badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Live Data Feed · FlightAware AeroAPI</span>
          </div>
        </div>

        {/* ── Flight Cards Grid ── */}
        {isLoading ? (
          <div className="space-y-4 py-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse p-6" />
            ))}
          </div>
        ) : flights.length > 0 ? (
          <div className="space-y-4">
            {flights.map((flight) => {
              const prediction = flight.delay_prediction;
              const risk = prediction?.risk_level || 'LOW';
              const riskStyle = riskBadges[risk];
              const statusStyle = statusBadges[flight.status] || statusBadges.SCHEDULED;

              return (
                <div
                  key={flight.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#244855]/40 hover:shadow-lg transition-all duration-200 p-5 sm:p-6 overflow-hidden relative group"
                >
                  {/* Subtle top indicator bar color-coded to risk */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 ${
                      risk === 'CRITICAL' ? 'bg-red-600' :
                      risk === 'HIGH' ? 'bg-[#E64833]' :
                      risk === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    
                    {/* ── Column 1: Airline & Live Telemetry Badge (3 cols) ── */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-[#244855] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {flight.airline?.code || 'FG'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-base leading-tight">
                            {flight.flight_number}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            {flight.airline?.name || 'Airlines'}
                          </div>
                        </div>
                      </div>

                      {/* Mention Live Data & Aircraft badge */}
                      <div className="space-y-1.5 mt-2.5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          LIVE DATA
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Plane className="w-3 h-3 text-slate-400" />
                          {flight.aircraft?.model || 'Commercial Airliner'}
                          {flight.aircraft?.tail_number && ` (${flight.aircraft.tail_number})`}
                        </div>
                      </div>
                    </div>

                    {/* ── Column 2: Route, Departure & Arrival Times (4 cols) ── */}
                    <div className="lg:col-span-4">
                      <div className="flex items-center justify-between">
                        {/* Origin Departure */}
                        <div className="text-left">
                          <div className="text-xl font-extrabold text-slate-900">
                            {formatTime(flight.scheduled_departure)}
                          </div>
                          <div className="text-xs font-bold text-[#244855]">
                            {flight.origin?.code}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {flight.origin?.city}
                          </div>
                        </div>

                        {/* Duration & Path */}
                        <div className="flex-1 px-4 text-center">
                          <div className="text-[11px] font-semibold text-slate-500 mb-1">
                            {formatDuration(flight.duration_minutes)}
                          </div>
                          <div className="relative flex items-center justify-center">
                            <div className="h-[2px] w-full bg-slate-200" />
                            <Plane className="w-4 h-4 text-[#244855] absolute bg-white px-0.5 rotate-90" />
                          </div>
                          <div className="text-[10px] font-semibold text-emerald-600 mt-1 uppercase">
                            Non-Stop
                          </div>
                        </div>

                        {/* Destination Arrival */}
                        <div className="text-right">
                          <div className="text-xl font-extrabold text-slate-900">
                            {formatTime(flight.scheduled_arrival)}
                          </div>
                          <div className="text-xs font-bold text-[#244855]">
                            {flight.destination?.code}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {flight.destination?.city}
                          </div>
                        </div>
                      </div>

                      {/* Flight status pill */}
                      <div className="mt-2.5 flex items-center justify-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          Status: {flight.status}
                        </span>
                      </div>
                    </div>

                    {/* ── Column 3: AI Delay Prediction Box (3 cols) ── */}
                    <div className="lg:col-span-3 bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/70">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <Sparkles className="w-3.5 h-3.5 text-[#E64833]" />
                          AI Delay Prediction
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase border ${riskStyle.bg} ${riskStyle.text} ${riskStyle.border}`}>
                          {riskStyle.label}
                        </span>
                      </div>

                      {prediction ? (
                        <div>
                          <div className="flex items-baseline justify-between mb-1.5">
                            <span className="text-xs text-slate-600 font-medium">Risk Score:</span>
                            <span className="font-black text-sm text-slate-900">
                              {Math.round(prediction.delay_probability * 100)}%
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                risk === 'CRITICAL' ? 'bg-red-600' :
                                risk === 'HIGH' ? 'bg-[#E64833]' :
                                risk === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.round(prediction.delay_probability * 100)}%` }}
                            />
                          </div>

                          {/* Expected Delay */}
                          <div className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {prediction.predicted_delay_minutes > 15 ? (
                              <span className="text-[#E64833]">
                                ~{prediction.predicted_delay_minutes} min expected delay
                              </span>
                            ) : (
                              <span className="text-emerald-700">
                                On-Time Arrival Expected (&lt;15m)
                              </span>
                            )}
                          </div>

                          {/* Primary Contributing Factor */}
                          {prediction.contributing_factors && prediction.contributing_factors.length > 0 && (
                            <p className="text-[10px] text-slate-500 leading-tight truncate mt-1" title={prediction.contributing_factors[0]}>
                              Factor: {prediction.contributing_factors[0]}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 italic py-1">
                          Analyzing route telemetry...
                        </div>
                      )}
                    </div>

                    {/* ── Column 4: Fare & Action Button (2 cols) ── */}
                    <div className="lg:col-span-2 flex flex-col items-end justify-center">
                      <div className="text-right mb-2.5">
                        <div className="text-xs text-slate-500 font-medium">Fare from</div>
                        <div className="text-2xl font-black text-[#244855]">
                          ₹{Math.round(flight.base_price).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {flight.available_seats} seats left
                        </div>
                      </div>

                      <Link
                        to={`/flights/${flight.id}`}
                        className="w-full text-center bg-[#244855] hover:bg-[#1b3741] text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        Book Seat
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Empty State ── */
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg mb-2">
              No Scheduled Flights Found for Selected Filters
            </h4>
            <p className="text-sm text-slate-600 mb-6">
              We couldn't find flights matching{' '}
              <strong>{origin || 'Any Origin'} ➔ {destination || 'Any Destination'}</strong>{' '}
              on <strong>{departureDate || 'Selected Date'}</strong>.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleLiveSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 bg-[#244855] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#1a353f] transition-all shadow-sm cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Live Flights via AeroAPI'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setDepartureDate('');
                  fetchFlights(origin, destination, undefined);
                }}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                View All Available Dates
              </button>

              <button
                type="button"
                onClick={() => {
                  setOrigin('BOM');
                  setDestination('DEL');
                  setDepartureDate(todayStr);
                }}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Try BOM ➔ DEL Today
              </button>
            </div>
          </div>
        )}

        {/* ── View All Flights Footer Link ── */}
        <div className="mt-8 text-center">
          <Link
            to="/flights"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#244855] hover:text-[#E64833] transition-colors"
          >
            Explore Complete Network & Live Airport Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};
