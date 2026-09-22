import React, { useState } from 'react';
import { Airport, FlightSearchParams } from '../../types/flight';
import { Button } from '../../components/ui/Button';
import { MapPin, Calendar, Users, ArrowRightLeft, Search } from 'lucide-react';

interface FlightSearchFormProps {
  airports: Airport[];
  initialParams: FlightSearchParams;
  onSearch: (params: FlightSearchParams) => void;
}

export const FlightSearchForm: React.FC<FlightSearchFormProps> = ({
  airports,
  initialParams,
  onSearch,
}) => {
  const [origin, setOrigin] = useState(initialParams.origin || '');
  const [destination, setDestination] = useState(initialParams.destination || '');
  const [departureDate, setDepartureDate] = useState(initialParams.departure_date || '');
  const [passengers, setPassengers] = useState(1);

  React.useEffect(() => {
    setOrigin(initialParams.origin || '');
    setDestination(initialParams.destination || '');
    setDepartureDate(initialParams.departure_date || '');
  }, [initialParams.origin, initialParams.destination, initialParams.departure_date]);

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      origin: origin || undefined,
      destination: destination || undefined,
      departure_date: departureDate || undefined,
      page: 1,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 shadow-xs">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Origin Airport */}
        <div className="md:col-span-4">
          <label htmlFor="search-origin" className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1.5">
            From (Origin)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-muted">
              <MapPin className="w-4 h-4 text-brand" />
            </div>
            <select
              id="search-origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-md border border-border bg-surface text-content-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
            >
              <option value="">All Departure Airports</option>
              {airports.map((a) => (
                <option key={a.id} value={a.code}>
                  {a.city} ({a.code}) - {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="hidden md:flex md:col-span-1 justify-center pb-1">
          <button
            type="button"
            onClick={handleSwap}
            title="Swap Origin & Destination"
            className="p-2 rounded-full border border-border hover:bg-surface-subtle text-content-secondary hover:text-brand transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Destination Airport */}
        <div className="md:col-span-4">
          <label htmlFor="search-destination" className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1.5">
            To (Destination)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-muted">
              <MapPin className="w-4 h-4 text-semantic-info" />
            </div>
            <select
              id="search-destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-md border border-border bg-surface text-content-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
            >
              <option value="">All Destination Airports</option>
              {airports.map((a) => (
                <option key={a.id} value={a.code}>
                  {a.city} ({a.code}) - {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Passengers */}
        <div className="md:col-span-3 grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="search-date" className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1.5">
              Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-content-muted">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <input
                id="search-date"
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full pl-8 pr-2 py-2.5 text-xs rounded-md border border-border bg-surface text-content-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
              />
            </div>
          </div>

          <div>
            <label htmlFor="search-passengers" className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1.5">
              Travelers
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-content-muted">
                <Users className="w-3.5 h-3.5" />
              </div>
              <select
                id="search-passengers"
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full pl-8 pr-2 py-2.5 text-xs rounded-md border border-border bg-surface text-content-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Adult' : 'Adults'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Action */}
      <div className="mt-4 pt-4 border-t border-border flex justify-end">
        <Button id="search-submit-btn" type="submit" variant="primary" size="md" className="font-semibold px-6 shadow-xs">
          <Search className="w-4 h-4 mr-2" />
          Find Flights
        </Button>
      </div>
    </form>
  );
};
