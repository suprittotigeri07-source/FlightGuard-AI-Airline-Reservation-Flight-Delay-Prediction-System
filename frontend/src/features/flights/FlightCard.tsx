import React, { useState } from 'react';
import { Flight } from '../../types/flight';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ReservationBookingModal } from '../reservations/ReservationBookingModal';
import { useAuth } from '../auth/AuthContext';
import { Plane, Clock, ShieldAlert, Ticket } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface FlightCardProps {
  flight: Flight;
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight }) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const durationHours = Math.floor(flight.duration_minutes / 60);
  const durationMins = flight.duration_minutes % 60;

  const riskVariantMap = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  } as const;

  const pred = flight.delay_prediction;

  const handleBookClick = () => {
    if (!token) {
      navigate('/login');
    } else {
      setIsBookingOpen(true);
    }
  };

  return (
    <>
      <div className="bg-surface border border-border rounded-xl p-5 shadow-xs hover:border-brand/30 hover:shadow-sm transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Airline Info */}
          <div className="flex items-center space-x-3 md:w-1/4">
            <div className="w-10 h-10 rounded-lg bg-brand-soft text-brand font-bold flex items-center justify-center text-sm shadow-xs border border-brand/10">
              {flight.airline.code}
            </div>
            <div>
              <div className="text-sm font-bold text-content-primary">{flight.airline.name}</div>
              <div className="text-xs text-content-muted font-medium">Flight {flight.flight_number} • {flight.aircraft.model}</div>
            </div>
          </div>

          {/* Departure -> Arrival Timeline */}
          <div className="flex items-center justify-between md:w-2/5 px-2">
            {/* Departure */}
            <div className="text-left">
              <div className="text-lg font-extrabold text-content-primary leading-tight">{formatTime(flight.scheduled_departure)}</div>
              <div className="text-xs font-bold text-brand uppercase">{flight.origin.code}</div>
              <div className="text-[11px] text-content-muted leading-tight hidden sm:block">{flight.origin.city}</div>
              <div className="text-[10px] text-content-disabled mt-0.5">{formatDate(flight.scheduled_departure)}</div>
            </div>

            {/* Flight Path Indicator */}
            <div className="flex flex-col items-center px-4 flex-1">
              <div className="text-[11px] font-medium text-content-muted flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-content-muted" />
                {durationHours}h {durationMins}m
              </div>
              <div className="w-full flex items-center">
                <div className="h-0.5 w-full bg-border rounded-full relative flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-brand"></div>
                  <Plane className="w-3.5 h-3.5 text-brand absolute" />
                </div>
              </div>
              <div className="text-[10px] text-semantic-success font-semibold mt-1">Non-stop</div>
            </div>

            {/* Arrival */}
            <div className="text-right">
              <div className="text-lg font-extrabold text-content-primary leading-tight">{formatTime(flight.scheduled_arrival)}</div>
              <div className="text-xs font-bold text-semantic-info uppercase">{flight.destination.code}</div>
              <div className="text-[11px] text-content-muted leading-tight hidden sm:block">{flight.destination.city}</div>
              <div className="text-[10px] text-content-disabled mt-0.5">{formatDate(flight.scheduled_arrival)}</div>
            </div>
          </div>

          {/* ML Delay Prediction Risk Badge */}
          <div className="md:w-1/5 flex flex-col justify-center items-start md:items-center">
            {pred ? (
              <div className="text-left md:text-center">
                <Badge variant={riskVariantMap[pred.risk_level]}>
                  <ShieldAlert className="w-3 h-3 mr-1" />
                  {pred.risk_level} DELAY RISK
                </Badge>
                <div className="text-[11px] font-medium text-content-muted mt-1">
                  {Math.round(pred.delay_probability * 100)}% Prob • +{pred.predicted_delay_minutes} min est
                </div>
              </div>
            ) : (
              <span className="text-xs text-content-muted italic">Prediction unavailable</span>
            )}
          </div>

          {/* Fare & Booking Actions */}
          <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center pt-3 md:pt-0 border-t md:border-t-0 border-border md:w-1/5">
            <div className="text-left md:text-right mb-1">
              <div className="text-xs text-content-muted">Base Fare</div>
              <div className="text-xl font-extrabold text-content-primary">₹{flight.base_price.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-semantic-success font-medium">{flight.available_seats} seats left</div>
            </div>

            <div className="flex items-center space-x-2 mt-1">
              <Link to={`/flights/${flight.id}`}>
                <Button variant="outline" size="sm" className="font-semibold text-xs">
                  Details
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                className="font-semibold text-xs shadow-xs"
                onClick={handleBookClick}
              >
                <Ticket className="w-3.5 h-3.5 mr-1" /> Book
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ReservationBookingModal
        flight={flight}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </>
  );
};
