import React, { useState } from 'react';
import { Flight } from '../../types/flight';
import { PassengerCreatePayload, Reservation } from '../../types/reservation';
import { reservationService } from '../../services/reservationService';
import { Button } from '../../components/ui/Button';
import {
  X,
  User,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Ticket,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReservationBookingModalProps {
  flight: Flight;
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationBookingModal: React.FC<ReservationBookingModalProps> = ({
  flight,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'passengers' | 'review' | 'confirmation'>('passengers');

  const [passengers, setPassengers] = useState<PassengerCreatePayload[]>([
    { first_name: '', last_name: '', gender: 'M' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  if (!isOpen) return null;

  const handleAddPassenger = () => {
    if (passengers.length >= flight.available_seats) {
      alert(`Cannot add more than ${flight.available_seats} passengers.`);
      return;
    }
    setPassengers([...passengers, { first_name: '', last_name: '', gender: 'M' }]);
  };

  const handleRemovePassenger = (index: number) => {
    if (passengers.length <= 1) return;
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  const handlePassengerChange = (index: number, field: keyof PassengerCreatePayload, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].first_name.trim() || !passengers[i].last_name.trim()) {
        setError(`Please fill in full name for Passenger #${i + 1}`);
        return;
      }
    }
    setStep('review');
  };

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await reservationService.createReservation({
        flight_id: flight.id,
        passengers: passengers,
      });
      setConfirmedReservation(res);
      setStep('confirmation');
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setError(axiosErr.response?.data?.error?.message || 'Booking failed. Please try again.');
      } else {
        setError('Unable to process booking reservation.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalFare = flight.base_price * passengers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-content-primary/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-surface border border-border rounded-xl shadow-md max-w-2xl w-full p-6 sm:p-8 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-content-muted hover:text-content-primary p-1 rounded-md hover:bg-surface-subtle transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-border mb-6">
          <div className="w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center shadow-xs">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-content-primary">Book Flight — {flight.airline.name} {flight.flight_number}</h2>
            <p className="text-xs text-content-muted">{flight.origin.city} ({flight.origin.code}) → {flight.destination.city} ({flight.destination.code})</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-md bg-semantic-danger-soft border border-semantic-danger/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-semantic-danger shrink-0 mt-0.5" />
            <div className="text-xs text-semantic-danger font-medium">{error}</div>
          </div>
        )}

        {/* STEP 1: PASSENGERS FORM */}
        {step === 'passengers' && (
          <form onSubmit={handleProceedToReview} className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-content-primary uppercase tracking-wider">Passenger Information</h3>
                <span className="text-xs text-semantic-success font-semibold">{flight.available_seats} seats available</span>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {passengers.map((p, idx) => (
                  <div key={idx} className="bg-surface-subtle p-4 rounded-lg border border-border space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Passenger #{idx + 1}
                      </span>
                      {passengers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePassenger(idx)}
                          className="text-xs text-semantic-danger hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-content-secondary mb-1">First Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Jane"
                          value={p.first_name}
                          onChange={(e) => handlePassengerChange(idx, 'first_name', e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-md border border-border bg-surface text-content-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-content-secondary mb-1">Last Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Doe"
                          value={p.last_name}
                          onChange={(e) => handlePassengerChange(idx, 'last_name', e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-md border border-border bg-surface text-content-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-content-secondary mb-1">Gender</label>
                        <select
                          value={p.gender || 'M'}
                          onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-md border border-border bg-surface text-content-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                        >
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="O">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddPassenger}
                className="mt-3 text-xs font-semibold text-brand hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Another Passenger
              </button>
            </div>

            {/* Fare Summary Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <span className="text-xs text-content-muted">Total Fare ({passengers.length} Passenger{passengers.length > 1 ? 's' : ''})</span>
                <div className="text-xl font-extrabold text-content-primary">₹{totalFare.toLocaleString('en-IN')}</div>
              </div>
              <Button type="submit" variant="primary" size="md" className="font-semibold">
                Review & Confirm Order
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: ORDER REVIEW */}
        {step === 'review' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-content-primary uppercase tracking-wider">Review Booking Details</h3>

            {/* Flight Summary */}
            <div className="bg-surface-subtle p-4 rounded-lg border border-border space-y-2 text-xs">
              <div className="flex justify-between font-bold text-content-primary text-sm">
                <span>{flight.airline.name} ({flight.flight_number})</span>
                <span>₹{flight.base_price.toLocaleString('en-IN')} / seat</span>
              </div>
              <div className="text-content-secondary">
                {flight.origin.city} ({flight.origin.code}) → {flight.destination.city} ({flight.destination.code})
              </div>
            </div>

            {/* Passenger Manifest */}
            <div>
              <h4 className="text-xs font-semibold text-content-secondary mb-2">Passengers Manifest ({passengers.length}):</h4>
              <ul className="divide-y divide-border bg-surface border border-border rounded-lg px-4">
                {passengers.map((p, idx) => (
                  <li key={idx} className="py-2.5 text-xs text-content-primary flex justify-between font-medium">
                    <span>Passenger #{idx + 1}: <strong>{p.first_name} {p.last_name}</strong></span>
                    <span className="text-content-muted">Gender: {p.gender}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trusted Fare Breakdown */}
            <div className="bg-brand-soft/50 p-4 rounded-lg border border-brand/20 space-y-2">
              <div className="flex justify-between text-xs text-content-secondary">
                <span>Base Fare ({passengers.length} × ₹{flight.base_price.toLocaleString('en-IN')})</span>
                <span>₹{totalFare.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-content-secondary">
                <span>Taxes & Airline Surcharges</span>
                <span className="text-semantic-success font-semibold">Included</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-content-primary pt-2 border-t border-brand/20">
                <span>Total Amount Payable</span>
                <span className="text-brand text-lg">₹{totalFare.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-content-muted bg-surface-subtle p-3 rounded-md border border-border/60">
              <ShieldCheck className="w-4 h-4 text-brand shrink-0" />
              <span>Instant PNR confirmation upon server verification. Payment Sandbox simulated.</span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="outline" size="md" onClick={() => setStep('passengers')}>
                Back to Passengers
              </Button>
              <Button
                variant="primary"
                size="md"
                className="font-semibold shadow-xs"
                onClick={handleConfirmBooking}
                isLoading={isSubmitting}
              >
                <CreditCard className="w-4 h-4 mr-2" /> Complete Booking & Issue PNR
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRMATION WITH PNR */}
        {step === 'confirmation' && confirmedReservation && (
          <div className="text-center py-4 space-y-6">
            <div className="w-14 h-14 rounded-full bg-semantic-success-soft text-semantic-success flex items-center justify-center mx-auto shadow-xs border border-semantic-success/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-content-primary">Booking Confirmed!</h3>
              <p className="text-xs text-content-muted mt-1">Your reservation reference PNR has been generated and saved to your account.</p>
            </div>

            {/* PNR Card */}
            <div className="bg-brand-soft border border-brand/30 rounded-xl p-6 max-w-sm mx-auto shadow-xs">
              <div className="text-xs uppercase font-bold text-brand tracking-wider mb-1">Booking Reference (PNR)</div>
              <div className="text-3xl font-black text-content-primary tracking-widest font-mono">{confirmedReservation.pnr}</div>
              <div className="text-xs text-content-muted mt-2">Status: <strong className="text-semantic-success">{confirmedReservation.status}</strong></div>
            </div>

            <div className="text-xs text-content-secondary space-y-1 bg-surface-subtle p-4 rounded-lg border border-border text-left max-w-md mx-auto">
              <div>Flight: <strong>{confirmedReservation.flight.airline.name} {confirmedReservation.flight.flight_number}</strong></div>
              <div>Route: <strong>{confirmedReservation.flight.origin.city} ({confirmedReservation.flight.origin.code}) → {confirmedReservation.flight.destination.city} ({confirmedReservation.flight.destination.code})</strong></div>
              <div>Total Fare: <strong>₹{confirmedReservation.total_amount.toLocaleString('en-IN')}</strong></div>
              <div>Passengers: <strong>{confirmedReservation.passengers.map(p => `${p.first_name} ${p.last_name}`).join(', ')}</strong></div>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  onClose();
                  navigate('/reservations');
                }}
              >
                View My Bookings
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
