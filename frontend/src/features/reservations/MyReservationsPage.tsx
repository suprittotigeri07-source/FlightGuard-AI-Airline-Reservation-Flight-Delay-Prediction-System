import React, { useState, useEffect } from 'react';
import { reservationService } from '../../services/reservationService';
import { Reservation, PaginatedReservationResponse } from '../../types/reservation';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Ticket,
  Plane,
  Clock,
  User,
  AlertCircle,
  RefreshCw,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const MyReservationsPage: React.FC = () => {
  const [data, setData] = useState<PaginatedReservationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchReservations = async (currentPage: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await reservationService.getMyReservations(currentPage, 10);
      setData(res);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setError(axiosErr.response?.data?.error?.message || 'Failed to load reservations.');
      } else {
        setError('Unable to connect to FlightGuard server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations(page);
  }, [page]);

  const handleCancelReservation = async (reservationId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Restored seat availability will be released.')) {
      return;
    }

    setCancellingId(reservationId);
    try {
      await reservationService.cancelReservation(reservationId);
      await fetchReservations(page);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        alert(axiosErr.response?.data?.error?.message || 'Failed to cancel reservation.');
      } else {
        alert('Failed to process cancellation.');
      }
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">My Flight Bookings</h1>
          <p className="text-sm text-content-muted mt-1">Manage active itineraries, review PNR references, and view real-time delay predictions.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchReservations(page)}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-surface border border-border rounded-xl p-6 shadow-xs animate-pulse space-y-4">
              <div className="h-6 bg-surface-subtle rounded w-1/3"></div>
              <div className="h-12 bg-surface-subtle rounded w-full"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="bg-surface border border-semantic-danger/30 rounded-xl p-8 text-center shadow-xs">
          <AlertCircle className="w-10 h-10 text-semantic-danger mx-auto mb-3" />
          <h3 className="text-lg font-bold text-semantic-danger mb-1">Unable to Load Bookings</h3>
          <p className="text-sm text-content-muted mb-4 max-w-md mx-auto">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchReservations(page)}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && data && data.items.length === 0 && (
        <div className="bg-surface border border-border rounded-xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-brand-soft text-brand flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-content-primary mb-1">No Active Reservations Found</h3>
          <p className="text-sm text-content-muted mb-6 max-w-md mx-auto">
            You currently have no flight bookings registered under your account. Search routes to book your next trip.
          </p>
          <Button variant="primary" size="md" onClick={() => window.location.href = '/flights'}>
            Search Available Flights
          </Button>
        </div>
      )}

      {/* Reservations List */}
      {!isLoading && !error && data && data.items.length > 0 && (
        <div className="space-y-4">
          {data.items.map((res: Reservation) => {
            const pred = res.flight.delay_prediction;
            const isCancelled = res.status === 'CANCELLED';

            return (
              <div
                key={res.id}
                className={`bg-surface border rounded-xl p-6 shadow-xs transition-all ${
                  isCancelled ? 'border-border opacity-75' : 'border-border hover:border-brand/40'
                }`}
              >
                {/* Top PNR & Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="bg-brand-soft px-3 py-1 rounded-md border border-brand/20">
                      <span className="text-[10px] text-brand uppercase font-bold tracking-wider block leading-none">PNR REFERENCE</span>
                      <span className="text-base font-black text-content-primary tracking-widest font-mono">{res.pnr}</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-content-primary">{res.flight.airline.name} {res.flight.flight_number}</div>
                      <div className="text-[11px] text-content-muted">Booked on {formatDate(res.created_at)}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        isCancelled
                          ? 'bg-surface-subtle text-content-muted border border-border'
                          : 'bg-semantic-success-soft text-semantic-success border border-semantic-success/20'
                      }`}
                    >
                      {res.status}
                    </span>
                    {!isCancelled && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-semantic-danger border-semantic-danger/30 hover:bg-semantic-danger-soft"
                        onClick={() => handleCancelReservation(res.id)}
                        isLoading={cancellingId === res.id}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel Booking
                      </Button>
                    )}
                  </div>
                </div>

                {/* Flight Details Timeline */}
                <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-5 flex items-center justify-between">
                    <div className="text-left">
                      <div className="text-lg font-black text-content-primary">{formatTime(res.flight.scheduled_departure)}</div>
                      <div className="text-xs font-bold text-brand">{res.flight.origin.code}</div>
                      <div className="text-[11px] text-content-muted">{res.flight.origin.city}</div>
                    </div>

                    <div className="flex flex-col items-center px-4">
                      <div className="text-[10px] text-content-muted flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3" /> {Math.floor(res.flight.duration_minutes / 60)}h {res.flight.duration_minutes % 60}m
                      </div>
                      <div className="w-20 h-0.5 bg-border relative flex items-center justify-center">
                        <Plane className="w-3 h-3 text-brand absolute" />
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-content-primary">{formatTime(res.flight.scheduled_arrival)}</div>
                      <div className="text-xs font-bold text-semantic-info">{res.flight.destination.code}</div>
                      <div className="text-[11px] text-content-muted">{res.flight.destination.city}</div>
                    </div>
                  </div>

                  {/* ML Prediction Risk */}
                  <div className="md:col-span-4 bg-surface-subtle p-3 rounded-lg border border-border flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-content-muted font-semibold uppercase">AI Delay Assessment</div>
                      <div className="text-xs font-bold text-content-primary">
                        {pred ? `${Math.round(pred.delay_probability * 100)}% Risk • +${pred.predicted_delay_minutes}m` : 'No Prediction'}
                      </div>
                    </div>
                    {pred && (
                      <Badge variant={pred.risk_level.toLowerCase() as any}>
                        <ShieldAlert className="w-3 h-3 mr-1" /> {pred.risk_level}
                      </Badge>
                    )}
                  </div>

                  {/* Total Amount */}
                  <div className="md:col-span-3 text-left md:text-right">
                    <div className="text-xs text-content-muted">Total Fare</div>
                    <div className="text-lg font-black text-content-primary">₹{res.total_amount.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {/* Passenger Manifest */}
                <div className="pt-3 border-t border-border/60 flex flex-wrap items-center gap-3 text-xs text-content-secondary">
                  <span className="font-semibold text-content-muted flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Passengers:
                  </span>
                  {res.passengers.map((p) => (
                    <span key={p.id} className="bg-surface-subtle px-2.5 py-1 rounded border border-border font-medium">
                      {p.first_name} {p.last_name} {p.seat_number ? `(${p.seat_number})` : ''}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
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
                  onClick={() => setPage(data.page - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page >= data.total_pages}
                  onClick={() => setPage(data.page + 1)}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
