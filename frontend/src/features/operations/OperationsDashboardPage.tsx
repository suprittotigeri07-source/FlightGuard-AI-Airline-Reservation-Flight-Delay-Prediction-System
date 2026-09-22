import React, { useState, useEffect } from 'react';
import { operationsService } from '../../services/operationsService';
import { aeroApiService } from '../../services/aeroApiService';
import { OperationsSummary, HighRiskFlightItem } from '../../types/operations';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  ShieldAlert,
  Plane,
  Users,
  AlertTriangle,
  RefreshCw,
  Clock,
  ChevronRight,
  X,
  CheckCircle2,
  Calendar,
  Radio
} from 'lucide-react';

export const OperationsDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<OperationsSummary | null>(null);
  const [flights, setFlights] = useState<HighRiskFlightItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSyncingLive, setIsSyncingLive] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<HighRiskFlightItem | null>(null);

  const handleSyncLive = async () => {
    setIsSyncingLive(true);
    setSyncNotice(null);
    try {
      const res = await aeroApiService.syncLiveFlights(undefined, 10);
      setSyncNotice(res.message);
      await fetchData(true);
      setTimeout(() => setSyncNotice(null), 5000);
    } catch {
      setError('AeroAPI live sync failed. Please check connection or API key.');
    } finally {
      setIsSyncingLive(false);
    }
  };

  const fetchData = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const [sumRes, flightsRes] = await Promise.all([
        operationsService.getSummary(),
        operationsService.getHighRiskFlights(riskFilter),
      ]);
      setSummary(sumRes);
      setFlights(flightsRes);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setError(axiosErr.response?.data?.error?.message || 'Failed to load operations data.');
      } else {
        setError('Unable to communicate with operations server.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [riskFilter]);

  const riskBadgeVariantMap = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  } as const;

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && !summary) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-sm font-medium text-content-muted">Initializing Operations Control Center...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-border rounded-xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black text-content-primary">Operations Control Center</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-semantic-success-soft text-semantic-success border border-semantic-success/20">
              <span className="w-2 h-2 rounded-full bg-semantic-success animate-pulse"></span> SYSTEM ACTIVE
            </span>
          </div>
          <p className="text-xs text-content-muted">
            Real-time flight risk monitoring, disruption prediction, and passenger impact manifest analysis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncLive}
            disabled={isSyncingLive}
            className="border-brand/40 text-brand hover:bg-brand/5 font-semibold text-xs shadow-xs"
          >
            <Radio className={`w-3.5 h-3.5 mr-1.5 ${isSyncingLive ? 'animate-pulse text-emerald-600' : ''}`} />
            {isSyncingLive ? 'Syncing Live Radar...' : 'Sync AeroAPI Feed'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="font-medium text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {syncNotice && (
        <div className="p-3 bg-cream-soft border border-cream-border text-secondary-hover rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncNotice}</span>
          </div>
          <button onClick={() => setSyncNotice(null)} className="text-content-muted hover:text-content-primary">✕</button>
        </div>
      )}

      {error && (
        <div className="bg-semantic-danger-soft border border-semantic-danger/30 text-semantic-danger p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Monitored Flights */}
          <div className="bg-surface border border-border rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-content-muted mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Monitored Flights</span>
              <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
                <Plane className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-content-primary">{summary.total_flights}</div>
            <div className="mt-2 text-xs font-medium text-semantic-success flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {summary.on_time_percentage}% On-Time Rating
            </div>
          </div>

          {/* Elevated Risk Departures */}
          <div className="bg-surface border border-border rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-content-muted mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">High Risk Departures</span>
              <div className="w-8 h-8 rounded-lg bg-semantic-danger-soft text-semantic-danger flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-semantic-danger">{summary.high_risk_flights_count}</div>
            <div className="mt-2 text-xs font-medium text-content-muted">
              Includes <strong className="text-semantic-danger">{summary.critical_risk_flights_count} Critical</strong> level flights
            </div>
          </div>

          {/* Average Delay Probability */}
          <div className="bg-surface border border-border rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-content-muted mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg Route Delay Risk</span>
              <div className="w-8 h-8 rounded-lg bg-semantic-warning-soft text-semantic-warning flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-content-primary">
              {Math.round(summary.avg_delay_probability * 100)}%
            </div>
            <div className="mt-3 w-full bg-surface-subtle rounded-full h-1.5 overflow-hidden border border-border/50">
              <div
                className="bg-semantic-warning h-1.5 rounded-full"
                style={{ width: `${Math.min(100, Math.round(summary.avg_delay_probability * 100))}%` }}
              ></div>
            </div>
          </div>

          {/* Impacted Passengers */}
          <div className="bg-surface border border-border rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-content-muted mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Impacted Passengers</span>
              <div className="w-8 h-8 rounded-lg bg-semantic-info-soft text-semantic-info flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-content-primary">{summary.total_impacted_passengers}</div>
            <div className="mt-2 text-xs font-medium text-content-muted">Confirmed Ticketed Holders</div>
          </div>
        </div>
      )}

      {/* High-Risk Manifest Table Section */}
      <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
        {/* Table Header & Risk Filters */}
        <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-content-primary">High-Risk Flight Manifest</h2>
            <p className="text-xs text-content-muted">Filter and inspect flights flagged by ML delay prediction engine</p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 bg-surface-subtle p-1 rounded-lg border border-border">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setRiskFilter(lvl)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                  riskFilter === lvl
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-content-muted hover:text-content-primary hover:bg-surface'
                }`}
              >
                {lvl === 'ALL' ? 'All Elevated' : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-content-muted font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-6">Flight & Carrier</th>
                <th className="py-3.5 px-6">Route</th>
                <th className="py-3.5 px-6">Scheduled Departure</th>
                <th className="py-3.5 px-6">ML Risk & Forecast</th>
                <th className="py-3.5 px-6">Impacted Manifest</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {flights.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-content-muted">
                    <CheckCircle2 className="w-8 h-8 text-semantic-success mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-semibold">No flights match risk filter criteria.</p>
                  </td>
                </tr>
              ) : (
                flights.map((item) => {
                  const f = item.flight;
                  const pred = f.delay_prediction;
                  return (
                    <tr key={f.id} className="hover:bg-surface-subtle/60 transition-colors">
                      {/* Flight & Carrier */}
                      <td className="py-4 px-6 font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-lg bg-brand text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                            {f.airline.code}
                          </div>
                          <div>
                            <div className="font-bold text-content-primary text-sm">
                              {f.airline.name} {f.flight_number}
                            </div>
                            <div className="text-[11px] text-content-muted">
                              Tail: {f.aircraft.tail_number} ({f.aircraft.model})
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Route */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-content-primary">
                          {f.origin.code} &rarr; {f.destination.code}
                        </div>
                        <div className="text-[11px] text-content-muted">
                          {f.origin.city} to {f.destination.city}
                        </div>
                      </td>

                      {/* Scheduled Departure */}
                      <td className="py-4 px-6 text-content-secondary">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-brand" /> {formatDateTime(f.scheduled_departure)}
                        </div>
                      </td>

                      {/* ML Risk & Forecast */}
                      <td className="py-4 px-6">
                        {pred ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={riskBadgeVariantMap[pred.risk_level]}>
                                {pred.risk_level}
                              </Badge>
                              <span className="font-bold text-content-primary">
                                {Math.round(pred.delay_probability * 100)}%
                              </span>
                            </div>
                            <div className="text-[11px] text-semantic-warning font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3" /> +{pred.predicted_delay_minutes} mins delay forecast
                            </div>
                          </div>
                        ) : (
                          <span className="text-content-muted italic">No prediction</span>
                        )}
                      </td>

                      {/* Impacted Manifest */}
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-subtle border border-border font-semibold text-content-primary">
                          <Users className="w-3.5 h-3.5 text-brand" />
                          {item.booked_passengers_count} Passengers ({item.impacted_reservations_count} PNRs)
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedItem(item)}
                          className="font-semibold text-xs"
                        >
                          View Telemetry <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flight Risk Telemetry Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl max-w-xl w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand text-white font-extrabold flex items-center justify-center">
                  {selectedItem.flight.airline.code}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-content-primary">
                    {selectedItem.flight.airline.name} {selectedItem.flight.flight_number}
                  </h3>
                  <p className="text-xs text-content-muted">
                    {selectedItem.flight.origin.code} ({selectedItem.flight.origin.city}) &rarr; {selectedItem.flight.destination.code} ({selectedItem.flight.destination.city})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-md text-content-muted hover:text-content-primary hover:bg-surface-subtle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Risk Telemetry Stats */}
            {selectedItem.flight.delay_prediction && (
              <div className="bg-surface-subtle border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-content-muted uppercase">ML Risk Classification</span>
                  <Badge variant={riskBadgeVariantMap[selectedItem.flight.delay_prediction.risk_level]}>
                    {selectedItem.flight.delay_prediction.risk_level} RISK LEVEL
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="text-[11px] text-content-muted">Delay Probability Score</div>
                    <div className="text-xl font-extrabold text-content-primary">
                      {Math.round(selectedItem.flight.delay_prediction.delay_probability * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-content-muted">Estimated Departure Delay</div>
                    <div className="text-xl font-extrabold text-semantic-warning">
                      +{selectedItem.flight.delay_prediction.predicted_delay_minutes} minutes
                    </div>
                  </div>
                </div>

                {/* Contributing Factors */}
                {selectedItem.flight.delay_prediction.contributing_factors.length > 0 && (
                  <div className="pt-2 border-t border-border/60">
                    <div className="text-[11px] font-bold text-content-secondary uppercase mb-2">
                      Key Contributing Risk Factors:
                    </div>
                    <ul className="space-y-1">
                      {selectedItem.flight.delay_prediction.contributing_factors.map((factor, i) => (
                        <li key={i} className="text-xs text-content-secondary flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-semantic-danger"></span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Passenger Manifest Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-content-secondary uppercase">Operational Manifest</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-surface-subtle p-3 rounded-md border border-border">
                  <div className="text-content-muted">Aircraft Capacity</div>
                  <div className="font-bold text-content-primary">
                    {selectedItem.flight.aircraft.model} ({selectedItem.flight.aircraft.tail_number})
                  </div>
                  <div className="text-[11px] text-content-muted mt-0.5">
                    Total Seats: {selectedItem.flight.aircraft.total_capacity}
                  </div>
                </div>
                <div className="bg-surface-subtle p-3 rounded-md border border-border">
                  <div className="text-content-muted">Impacted Passenger Manifest</div>
                  <div className="font-bold text-content-primary">
                    {selectedItem.booked_passengers_count} Confirmed Passengers
                  </div>
                  <div className="text-[11px] text-content-muted mt-0.5">
                    Across {selectedItem.impacted_reservations_count} Active Booking References
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedItem(null)}>
                Close Telemetry
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
