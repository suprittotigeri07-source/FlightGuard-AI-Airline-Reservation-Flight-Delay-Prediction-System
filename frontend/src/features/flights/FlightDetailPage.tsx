import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { flightService } from '../../services/flightService';
import { aeroApiService, LiveTelemetryResponse } from '../../services/aeroApiService';
import { Flight } from '../../types/flight';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../auth/AuthContext';
import { ReservationBookingModal } from '../reservations/ReservationBookingModal';
import {
  Plane,
  Clock,
  ShieldAlert,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Radio
} from 'lucide-react';

export const FlightDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token: useAuthToken } = useAuth();

  const [flight, setFlight] = useState<Flight | null>(null);
  const [telemetry, setTelemetry] = useState<LiveTelemetryResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchFlightDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await flightService.getFlightById(id);
        setFlight(res);
        try {
          const tel = await aeroApiService.getLiveTelemetry(res.flight_number);
          if (tel && tel.data) {
            setTelemetry(tel.data);
          }
        } catch {
          // graceful fallback
        }
      } catch (err: unknown) {
        if (typeof err === 'object' && err !== null && 'response' in err) {
          const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
          setError(axiosErr.response?.data?.error?.message || 'Flight detail not found.');
        } else {
          setError('Unable to load flight details from server.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchFlightDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-sm font-medium text-content-muted">Retrieving flight detail schedule...</div>
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-surface border border-semantic-danger/30 rounded-xl p-8 shadow-xs">
          <AlertCircle className="w-10 h-10 text-semantic-danger mx-auto mb-3" />
          <h3 className="text-lg font-bold text-semantic-danger mb-1">Flight Not Found</h3>
          <p className="text-sm text-content-muted mb-6">{error || 'The requested flight ID is invalid.'}</p>
          <Link to="/flights">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Flight Search
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const durationHours = Math.floor(flight.duration_minutes / 60);
  const durationMins = flight.duration_minutes % 60;
  const pred = flight.delay_prediction;

  const riskVariantMap = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  } as const;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Link */}
      <Link to="/flights" className="inline-flex items-center text-xs font-semibold text-content-muted hover:text-brand transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Flight Search
      </Link>

      {/* Main Flight Header Card */}
      <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-brand text-white font-extrabold flex items-center justify-center text-lg shadow-xs">
              {flight.airline.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-content-primary">{flight.airline.name} {flight.flight_number}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-semantic-success-soft text-semantic-success font-semibold border border-semantic-success/20">
                  {flight.status}
                </span>
              </div>
              <p className="text-xs text-content-muted mt-0.5">
                Aircraft: <strong className="text-content-primary">{flight.aircraft.model}</strong> ({flight.aircraft.tail_number}) • Capacity: {flight.aircraft.total_capacity} seats
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
            <div className="text-xs text-content-muted">Base Fare per Passenger</div>
            <div className="text-2xl font-extrabold text-content-primary">₹{flight.base_price.toLocaleString('en-IN')}</div>
            <div className="text-xs text-semantic-success font-medium mb-3">{flight.available_seats} seats remaining</div>
            <Button
              variant="primary"
              size="md"
              className="font-semibold shadow-xs"
              onClick={() => {
                if (!useAuthToken) {
                  navigate('/login');
                } else {
                  setIsBookingOpen(true);
                }
              }}
            >
              Book Flight Now
            </Button>
          </div>
        </div>

        {/* Route Timeline */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Origin */}
          <div className="bg-surface-subtle p-5 rounded-lg border border-border">
            <div className="text-xs font-bold text-brand uppercase mb-1">Origin Hub</div>
            <div className="text-2xl font-black text-content-primary">{flight.origin.code}</div>
            <div className="text-sm font-semibold text-content-primary">{flight.origin.city}</div>
            <div className="text-xs text-content-muted">{flight.origin.name}</div>
            <div className="mt-3 pt-3 border-t border-border/60 text-xs font-medium text-content-secondary flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand" /> {formatDateTime(flight.scheduled_departure)}
            </div>
          </div>

          {/* Duration Indicator */}
          <div className="text-center px-4">
            <div className="text-xs font-semibold text-content-muted mb-2 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-brand" /> {durationHours}h {durationMins}m Non-stop
            </div>
            <div className="w-full flex items-center my-2">
              <div className="h-0.5 w-full bg-border relative flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-brand"></div>
                <Plane className="w-5 h-5 text-brand absolute" />
              </div>
            </div>
            <div className="text-[11px] text-content-muted">Scheduled Direct Flight</div>
          </div>

          {/* Destination */}
          <div className="bg-surface-subtle p-5 rounded-lg border border-border">
            <div className="text-xs font-bold text-semantic-info uppercase mb-1">Destination Hub</div>
            <div className="text-2xl font-black text-content-primary">{flight.destination.code}</div>
            <div className="text-sm font-semibold text-content-primary">{flight.destination.city}</div>
            <div className="text-xs text-content-muted">{flight.destination.name}</div>
            <div className="mt-3 pt-3 border-t border-border/60 text-xs font-medium text-content-secondary flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-semantic-info" /> {formatDateTime(flight.scheduled_arrival)}
            </div>
          </div>
        </div>
      </div>

      {/* Live AeroAPI Telemetry Card */}
      {telemetry && (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-brand-soft text-brand flex items-center justify-center font-bold">
                <Radio className="w-4 h-4 text-brand animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-content-primary">FlightAware AeroAPI Live Telemetry</h3>
                <span className="text-[11px] text-content-muted">Real-Time Aircraft Radar Tracking Feed</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {telemetry.status || 'Active Flight Radar'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 text-xs">
            <div className="bg-surface-subtle p-3.5 rounded-lg border border-border">
              <div className="text-content-muted font-medium mb-1">Radar Altitude</div>
              <div className="text-lg font-black text-content-primary">
                {telemetry.altitude_feet ? `${telemetry.altitude_feet.toLocaleString()} ft` : 'Ground (Taxi)'}
              </div>
              <div className="text-[10px] text-content-muted mt-0.5">Cruising Level</div>
            </div>

            <div className="bg-surface-subtle p-3.5 rounded-lg border border-border">
              <div className="text-content-muted font-medium mb-1">Groundspeed</div>
              <div className="text-lg font-black text-content-primary">
                {telemetry.groundspeed_knots ? `${telemetry.groundspeed_knots} kts` : '0 kts'}
              </div>
              <div className="text-[10px] text-content-muted mt-0.5">Airspeed Telemetry</div>
            </div>

            <div className="bg-surface-subtle p-3.5 rounded-lg border border-border">
              <div className="text-content-muted font-medium mb-1">Flight Progress</div>
              <div className="text-lg font-black text-brand">
                {telemetry.progress_percent ?? 50}%
              </div>
              <div className="w-full bg-border h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-brand h-full rounded-full" style={{ width: `${telemetry.progress_percent ?? 50}%` }}></div>
              </div>
            </div>

            <div className="bg-surface-subtle p-3.5 rounded-lg border border-border">
              <div className="text-content-muted font-medium mb-1">Departure Offset</div>
              <div className="text-lg font-black text-content-primary">
                {telemetry.departure_delay && telemetry.departure_delay > 0
                  ? `+${Math.round(telemetry.departure_delay / 60)} min`
                  : 'On Time'}
              </div>
              <div className="text-[10px] text-semantic-success mt-0.5">Live ATC Gate Log</div>
            </div>
          </div>
        </div>
      )}

      {/* ML Delay Prediction Analysis Card */}
      {pred && (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-semantic-warning-soft text-semantic-warning flex items-center justify-center font-bold">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-content-primary">Machine Learning Delay Prediction</h3>
                <span className="text-[11px] text-content-muted">Model Pipeline Version: {pred.model_version}</span>
              </div>
            </div>
            <Badge variant={riskVariantMap[pred.risk_level]}>
              {pred.risk_level} RISK LEVEL
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
            <div className="bg-surface-subtle p-4 rounded-lg border border-border">
              <div className="text-xs text-content-muted font-medium">Delay Probability</div>
              <div className="text-2xl font-black text-content-primary mt-1">
                {Math.round(pred.delay_probability * 100)}%
              </div>
            </div>

            <div className="bg-surface-subtle p-4 rounded-lg border border-border">
              <div className="text-xs text-content-muted font-medium">Estimated Delay Duration</div>
              <div className="text-2xl font-black text-content-primary mt-1">
                +{pred.predicted_delay_minutes} <span className="text-sm font-normal text-content-muted">minutes</span>
              </div>
            </div>

            <div className="bg-surface-subtle p-4 rounded-lg border border-border">
              <div className="text-xs text-content-muted font-medium">Risk Status</div>
              <div className="text-base font-bold text-content-primary mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-semantic-success" /> Live ML Evaluated
              </div>
            </div>
          </div>

          {/* Contributing Factors */}
          {pred.contributing_factors.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2">Key Contributing Delay Factors:</h4>
              <ul className="space-y-1.5">
                {pred.contributing_factors.map((factor, idx) => (
                  <li key={idx} className="text-xs text-content-secondary flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-[11px] text-content-muted italic bg-surface-subtle p-3 rounded-md border border-border/60">
            <strong>Disclaimer:</strong> ML delay predictions are probabilistic estimates derived from historical flight performance, route weather, and congestion patterns. They are not guaranteed outcomes.
          </div>
        </div>
      )}

      {flight && (
        <ReservationBookingModal
          flight={flight}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />
      )}
    </div>
  );
};
