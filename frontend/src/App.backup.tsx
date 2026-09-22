import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './features/auth/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { FlightSearchPage } from './features/flights/FlightSearchPage';
import { FlightDetailPage } from './features/flights/FlightDetailPage';
import { MyReservationsPage } from './features/reservations/MyReservationsPage';
import { OperationsDashboardPage } from './features/operations/OperationsDashboardPage';
import { AdminPage } from './features/admin/AdminPage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import {
  Plane, AlertTriangle, ShieldCheck, ArrowRight,
  ChevronLeft, ChevronRight, MapPin, Clock, BarChart3,
  Globe, Zap, Lock, TrendingUp, Users, Search,
  ArrowRightLeft, Calendar, Check, Car, X, CheckCircle2, FileText
} from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/* ──────────────────────────────────────────────
   Hero Carousel Data (Cathay-style)
   ────────────────────────────────────────────── */
const heroSlides = [
  {
    image: '/assets/airport_dubai.jpg',
    pillar: 'Flights',
    title: 'Your Gateway to the World',
    description: 'Book flights across 500+ routes with AI-powered delay predictions. Travel smarter, arrive on time.',
    cta: 'Search Flights',
    ctaLink: '/flights',
    cardColor: 'bg-brand',
  },
  {
    image: '/assets/airport_singapore.jpg',
    pillar: 'AI Intelligence',
    title: 'Predict Before You Fly',
    description: 'Our XGBoost ML models analyze weather, carrier history, and congestion data to forecast delay risks before pushback.',
    cta: 'Explore Predictions',
    ctaLink: '/flights',
    cardColor: 'bg-blue-800',
  },
  {
    image: '/assets/airport_tokyo.jpg',
    pillar: 'Destinations',
    title: 'Discover Japan & Beyond',
    description: 'From cherry blossom season in Tokyo to the neon glow of Osaka — fly with confidence knowing your delay risk in advance.',
    cta: 'Find Flights',
    ctaLink: '/flights',
    cardColor: 'bg-brand',
  },
  {
    image: '/assets/airport_london.jpg',
    pillar: 'Operations',
    title: 'Control Centre for Airlines',
    description: 'Empower your operations team with real-time risk dashboards, factor-level attribution, and passenger impact analysis.',
    cta: 'View Dashboard',
    ctaLink: '/operations',
    cardColor: 'bg-blue-900',
  },
  {
    image: '/assets/airport_newyork.jpg',
    pillar: 'Flights',
    title: 'Fly to North America',
    description: 'Connect to New York, Los Angeles, San Francisco and more with seamless booking and real-time delay intelligence.',
    cta: 'Book Now',
    ctaLink: '/flights',
    cardColor: 'bg-brand',
  },
];

/* ──────────────────────────────────────────────
   Destination Data (with direct booking links & delay metrics)
   ────────────────────────────────────────────── */
interface DestinationItem {
  city: string;
  code: string;
  country: string;
  airport: string;
  image: string;
  tag: string;
  fare: string;
  onTime: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

const destinations: DestinationItem[] = [
  {
    city: 'Delhi',
    code: 'DEL',
    country: 'India',
    airport: 'Indira Gandhi Intl (DEL)',
    image: '/assets/airport_dubai.jpg',
    tag: 'Capital Hub',
    fare: '₹4,200',
    onTime: '88% On-Time',
    risk: 'LOW',
  },
  {
    city: 'Mumbai',
    code: 'BOM',
    country: 'India',
    airport: 'Chhatrapati Shivaji Intl (BOM)',
    image: '/assets/airport_singapore.jpg',
    tag: 'Financial Center',
    fare: '₹3,900',
    onTime: '92% On-Time',
    risk: 'LOW',
  },
  {
    city: 'Bengaluru',
    code: 'BLR',
    country: 'India',
    airport: 'Kempegowda Intl (BLR)',
    image: '/assets/airport_tokyo.jpg',
    tag: 'Silicon Valley',
    fare: '₹4,900',
    onTime: '85% On-Time',
    risk: 'MEDIUM',
  },
  {
    city: 'Hyderabad',
    code: 'HYD',
    country: 'India',
    airport: 'Rajiv Gandhi Intl (HYD)',
    image: '/assets/airport_london.jpg',
    tag: 'Cyber City',
    fare: '₹3,800',
    onTime: '94% On-Time',
    risk: 'LOW',
  },
  {
    city: 'Kolkata',
    code: 'CCU',
    country: 'India',
    airport: 'Netaji Subhash Chandra (CCU)',
    image: '/assets/airport_newyork.jpg',
    tag: 'Cultural Capital',
    fare: '₹4,400',
    onTime: '82% On-Time',
    risk: 'MEDIUM',
  },
  {
    city: 'Chennai',
    code: 'MAA',
    country: 'India',
    airport: 'Chennai International (MAA)',
    image: '/assets/airport_dubai.jpg',
    tag: 'Coastal Gateway',
    fare: '₹4,100',
    onTime: '90% On-Time',
    risk: 'LOW',
  },
];

/* ──────────────────────────────────────────────
   Car Rental Data (with City, Price, Specs, Airport Pickup)
   ────────────────────────────────────────────── */
export interface CarRentalItem {
  id: string;
  name: string;
  category: 'Luxury' | 'SUV' | 'Sports' | 'Electric' | 'Compact';
  city: string;
  cityCode: string;
  pricePerDay: number;
  image: string;
  badge: string;
  seats: number;
  transmission: string;
  fuel: string;
  features: string[];
}

const carCollection: CarRentalItem[] = [
  {
    id: 'car-1',
    name: 'Mercedes-Benz S-Class',
    category: 'Luxury',
    city: 'Delhi',
    cityCode: 'DEL',
    pricePerDay: 9500,
    image: '/assets/car_luxury_sedan.jpg',
    badge: 'VIP Chauffeur',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Hybrid',
    features: ['Airport T3 Terminal Pickup', 'Chauffeur Option', 'Complimentary In-Car Wi-Fi', 'Flight Delay Hold Guarantee'],
  },
  {
    id: 'car-2',
    name: 'BMW X5 xDrive40i',
    category: 'SUV',
    city: 'Bengaluru',
    cityCode: 'BLR',
    pricePerDay: 7800,
    image: '/assets/car_suv.jpg',
    badge: 'Popular',
    seats: 7,
    transmission: 'Automatic',
    fuel: 'Petrol AWD',
    features: ['Panoramic Sunroof', 'Kempegowda T1/T2 Curbside', 'Head-Up Navigation HUD', 'Excess Baggage Space'],
  },
  {
    id: 'car-3',
    name: 'Porsche 911 Carrera Cabriolet',
    category: 'Sports',
    city: 'Mumbai',
    cityCode: 'BOM',
    pricePerDay: 14500,
    image: '/assets/car_convertible.jpg',
    badge: 'Convertible',
    seats: 2,
    transmission: 'PDK 8-Speed',
    fuel: 'Twin-Turbo Petrol',
    features: ['Convertible Soft-top', 'Sport Chrono Package', 'Bose Surround Audio', 'Coastal Sea-Link Ready'],
  },
  {
    id: 'car-4',
    name: 'Tesla Model S Plaid',
    category: 'Electric',
    city: 'Hyderabad',
    cityCode: 'HYD',
    pricePerDay: 6900,
    image: '/assets/car_electric.jpg',
    badge: 'Zero Emission',
    seats: 5,
    transmission: 'Electric Drive',
    fuel: '100% Electric (650km)',
    features: ['Autopilot Assistance', 'Free Supercharger Access', '17-inch Cinematic Screen', 'Instant Acceleration'],
  },
  {
    id: 'car-5',
    name: 'Audi A3 Sportback',
    category: 'Compact',
    city: 'Kolkata',
    cityCode: 'CCU',
    pricePerDay: 4500,
    image: '/assets/car_compact.jpg',
    badge: 'Best Value',
    seats: 5,
    transmission: 'S-Tronic Auto',
    fuel: 'TFSI Petrol',
    features: ['Audi Virtual Cockpit', 'Easy City Park Assist', 'Fuel Efficient 18km/L', 'Free 24h Cancellation'],
  },
  {
    id: 'car-6',
    name: 'Range Rover Sport HSE',
    category: 'SUV',
    city: 'Chennai',
    cityCode: 'MAA',
    pricePerDay: 12000,
    image: '/assets/car_premium_suv.jpg',
    badge: 'All-Terrain Luxury',
    seats: 5,
    transmission: 'Automatic AWD',
    fuel: 'Diesel Mild-Hybrid',
    features: ['Electronic Air Suspension', 'Meridian Sound System', 'All-Terrain Response', 'Airport Priority Handover'],
  },
];

/* ──────────────────────────────────────────────
   Featured Flight Offers (Cathay "Latest Offers" style)
   ────────────────────────────────────────────── */
interface FlightOffer {
  id: string;
  originCity: string;
  originCode: string;
  destCity: string;
  destCode: string;
  airline: string;
  aircraft: string;
  fare: number;
  duration: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskPercent: number;
  badge: string;
  image: string;
}

const featuredOffers: FlightOffer[] = [
  {
    id: 'fo-1',
    originCity: 'Bengaluru',
    originCode: 'BLR',
    destCity: 'Delhi',
    destCode: 'DEL',
    airline: 'Air India',
    aircraft: 'Airbus A320neo',
    fare: 4200,
    duration: '2h 40m',
    riskLevel: 'LOW',
    riskPercent: 15,
    badge: 'Super Saver',
    image: '/assets/airport_dubai.jpg',
  },
  {
    id: 'fo-2',
    originCity: 'Bengaluru',
    originCode: 'BLR',
    destCity: 'Mumbai',
    destCode: 'BOM',
    airline: 'Vistara',
    aircraft: 'Boeing 787-9 Dreamliner',
    fare: 6800,
    duration: '1h 45m',
    riskLevel: 'MEDIUM',
    riskPercent: 42,
    badge: 'Business Comfort',
    image: '/assets/airport_singapore.jpg',
  },
  {
    id: 'fo-3',
    originCity: 'Delhi',
    originCode: 'DEL',
    destCity: 'Mumbai',
    destCode: 'BOM',
    airline: 'SpiceJet',
    aircraft: 'Boeing 737 MAX 8',
    fare: 3900,
    duration: '2h 10m',
    riskLevel: 'HIGH',
    riskPercent: 89,
    badge: 'Delay Shield Included',
    image: '/assets/airport_newyork.jpg',
  },
  {
    id: 'fo-4',
    originCity: 'Mumbai',
    originCode: 'BOM',
    destCity: 'Bengaluru',
    destCode: 'BLR',
    airline: 'Air India',
    aircraft: 'Airbus A320neo',
    fare: 4900,
    duration: '1h 50m',
    riskLevel: 'LOW',
    riskPercent: 20,
    badge: 'Evening Express',
    image: '/assets/airport_tokyo.jpg',
  },
];

/* ──────────────────────────────────────────────
   Travel Inspiration Hub (Cathay "Inspiration" Editorial Cards)
   ────────────────────────────────────────────── */
interface TravelStory {
  id: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  summary: string;
  content: string;
}

const travelStories: TravelStory[] = [
  {
    id: 'story-1',
    title: 'How Machine Learning Predicts Flight Delays Before Pushback',
    category: 'AI Technology',
    readTime: '4 min read',
    date: 'Sep 2026',
    image: '/assets/airport_tokyo.jpg',
    summary: 'Discover how FlightGuard AI evaluates 15+ real-time variables — from atmospheric turbulence to runway holding queues — to calculate delay probabilities.',
    content: `Commercial aviation is entering a new era of predictive reliability. While traditional flight tracking only informs passengers when a flight is already delayed, FlightGuard AI's XGBoost models forecast delay risk up to 24 hours prior to departure.\n\nBy cross-referencing incoming aircraft turnaround status, airspace sector congestion, historical carrier on-time performance (OTP), and localized meteorological radar, FlightGuard delivers a transparent risk tier (Low, Medium, High, Critical).\n\nThis intelligence empowers both business travelers seeking punctual connections and airline operations teams mitigating downstream delay propagation across the route network.`
  },
  {
    id: 'story-2',
    title: "India's Most Luxurious Airport Lounges & Gourmet Experiences",
    category: 'Lifestyle & Comfort',
    readTime: '5 min read',
    date: 'Sep 2026',
    image: '/assets/airport_dubai.jpg',
    summary: "From Bengaluru's garden retreat to Mumbai's GVK Lounge: where fine dining, quiet spa pods, and panoramic tarmac views turn layovers into holidays.",
    content: `Transform your transit experience into an opulent interlude. Modern Indian airport terminals now feature world-class lounges designed to rival 5-star boutique hotels.\n\nAt Kempegowda International Airport Terminal 2 in Bengaluru, lush biophilic indoor gardens surround executive lounge pods with artisanal filter coffee bars and live tandoor stations.\n\nMeanwhile, Mumbai's CSMIA Terminal 2 offers bespoke cocktail bars and reflexology spa suites. FlightGuard Club Gold & Diamond members enjoy complimentary lounge access nationwide.`
  },
  {
    id: 'story-3',
    title: 'Monsoon Aviation: Navigating Seasonal Delays with Confidence',
    category: 'Travel Guide',
    readTime: '6 min read',
    date: 'Sep 2026',
    image: '/assets/airport_london.jpg',
    summary: 'Heavy downpours, wind shear, and air traffic flow management: smart tips to ensure stress-free travel during unpredictable seasonal weather.',
    content: `Monsoon season brings breathtaking landscapes across the subcontinent, but also seasonal weather challenges for aviation.\n\nAirports like Mumbai and Delhi frequently experience low-visibility procedures and ground holding delays. By monitoring FlightGuard AI's real-time Delay Probability score before heading to the airport, passengers can stay ahead of schedule changes.\n\nPro-tip: Booking early morning flights (06:00 - 09:00 AM) historically yields 40% lower delay probabilities during monsoon months due to reduced rotational delays from inbound aircraft.`
  },
  {
    id: 'story-4',
    title: 'From Runway to Highway: Why Premium Car Rental Completes Your Trip',
    category: 'Business Travel',
    readTime: '3 min read',
    date: 'Sep 2026',
    image: '/assets/airport_newyork.jpg',
    summary: 'Skip taxi queues and ride-hail surges with seamless airport terminal car pickup coordinated with your flight arrival time.',
    content: `Nothing dampens the energy of a productive trip faster than queuing for taxis or facing surge pricing outside airport arrivals.\n\nWith FlightGuard's integrated Car Rental Collection, your executive vehicle or SUV is staged curbside at your arrival terminal. Even better: if your flight experiences a delay, our live integration automatically updates your vehicle handover time at zero penalty.\n\nFrom luxury Mercedes sedans in Delhi to electric Tesla Model S drives in Hyderabad, arrive in total comfort.`
  },
];

/* ──────────────────────────────────────────────
   Hero Carousel Component (Cathay-style)
   ────────────────────────────────────────────── */
const HeroCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  const total = heroSlides.length;

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
    setProgressKey((k) => k + 1);
  }, [total]);
  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
    setProgressKey((k) => k + 1);
  }, [total]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, goNext]);

  const slide = heroSlides[current];

  return (
    <div
      className="relative w-full overflow-hidden group"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Full-bleed Images */}
      <div className="relative h-[480px] sm:h-[540px] md:h-[600px] lg:h-[640px]">
        {heroSlides.map((s, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: idx === current ? 1 : 0 }}
          >
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        ))}

        {/* Text Card Overlay (Cathay style — card on the left) */}
        <div className="absolute inset-0 flex items-end sm:items-center">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-24 sm:pb-0">
            <div className={`${slide.cardColor} text-white p-8 sm:p-10 rounded-2xl max-w-lg shadow-lg transition-all duration-500`}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-3 text-white/70">
                {slide.pillar}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] leading-tight mb-4">
                {slide.title}
              </h1>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed mb-6">
                {slide.description}
              </p>
              <Link
                to={slide.ctaLink}
                className="inline-flex items-center gap-2 bg-white text-brand px-6 py-3 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors shadow-sm"
              >
                {slide.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goPrev}
          className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={goNext}
          className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Bar: Dots + Progress */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="flex items-center gap-3">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrent(idx); setProgressKey((k) => k + 1); }}
                className="relative flex-1 h-1 rounded-full overflow-hidden bg-white/30"
                aria-label={`Go to slide ${idx + 1}`}
              >
                {idx === current && (
                  <div
                    key={progressKey}
                    className="absolute inset-y-0 left-0 bg-white rounded-full slider-progress-bar"
                  />
                )}
                {idx < current && (
                  <div className="absolute inset-0 bg-white/70 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────
   Car Rental Booking Modal (Interactive)
   ────────────────────────────────────────────── */
interface CarRentalModalProps {
  car: CarRentalItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const CarRentalModal: React.FC<CarRentalModalProps> = ({ car, isOpen, onClose }) => {
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });
  const [pickupTerminal, setPickupTerminal] = useState('Airport Terminal (Meet & Greet)');
  const [driverName, setDriverName] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [addInsurance, setAddInsurance] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');

  if (!isOpen || !car) return null;

  const calculateDays = () => {
    const start = new Date(pickupDate).getTime();
    const end = new Date(returnDate).getTime();
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const days = calculateDays();
  const baseTotal = days * car.pricePerDay;
  const insuranceTotal = addInsurance ? days * 999 : 0;
  const grandTotal = baseTotal + insuranceTotal;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `FG-CAR-${Math.floor(100000 + Math.random() * 900000)}`;
    setVoucherCode(code);
    setIsConfirmed(true);
  };

  const handleResetAndClose = () => {
    setIsConfirmed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-border my-8 animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-subtle">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-content-primary text-base">
                {isConfirmed ? 'Rental Booking Confirmed' : `Reserve ${car.name}`}
              </h3>
              <p className="text-xs text-content-muted">{car.city} · {car.category} Sedan/SUV</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-content-muted hover:text-content-primary hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isConfirmed ? (
          /* Confirmation Voucher View */
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
              Booking Guaranteed
            </span>
            <h4 className="font-serif text-2xl text-content-primary mt-2 mb-1">
              Your Car is Reserved!
            </h4>
            <p className="text-xs text-content-muted max-w-md mx-auto mb-6">
              A confirmation email and SMS voucher with pickup instructions have been dispatched.
            </p>

            <div className="bg-surface-subtle rounded-xl p-6 text-left max-w-md mx-auto border border-border/70 mb-6 space-y-3">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-border/50">
                <span className="text-content-muted uppercase tracking-wider">Voucher Reference</span>
                <span className="font-mono font-bold text-brand text-sm">{voucherCode}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-content-muted">Vehicle</span>
                <span className="font-semibold text-content-primary">{car.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-content-muted">Location</span>
                <span className="font-semibold text-content-primary">{car.city} ({pickupTerminal})</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-content-muted">Dates</span>
                <span className="font-semibold text-content-primary">{pickupDate} to {returnDate} ({days} days)</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-border/50">
                <span className="text-content-muted font-medium">Total Amount</span>
                <span className="text-base font-extrabold text-brand">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="mt-2 bg-brand-soft/60 rounded-lg p-2.5 flex items-center gap-2 text-[11px] text-brand">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>FlightGuard Delay Guarantee active: 0 penalty hold on late flights.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={`/flights?destination=${car.cityCode}`}
                onClick={handleResetAndClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-brand-hover transition-colors shadow-sm"
              >
                <Plane className="w-4 h-4" /> Book Flight to {car.city} ({car.cityCode})
              </Link>
              <button
                onClick={handleResetAndClose}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold text-content-secondary hover:bg-surface-subtle border border-border transition-colors"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          /* Reservation Form View */
          <form onSubmit={handleConfirm}>
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
              {/* Car Card Preview */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface-subtle p-4 rounded-xl border border-border/60">
                <img
                  src={car.image}
                  alt={car.name}
                  className="w-full sm:w-36 h-24 object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-brand text-white text-[10px] font-bold rounded-full uppercase">
                      {car.badge}
                    </span>
                    <span className="text-xs text-content-muted">{car.category}</span>
                  </div>
                  <h4 className="font-bold text-content-primary text-base">{car.name}</h4>
                  <p className="text-xs text-content-muted mt-0.5">
                    {car.seats} Seats · {car.transmission} · {car.fuel}
                  </p>
                  <div className="mt-2 text-sm font-bold text-brand">
                    ₹{car.pricePerDay.toLocaleString('en-IN')} <span className="text-xs font-normal text-content-muted">/ day</span>
                  </div>
                </div>
              </div>

              {/* Dates & Pickup Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1.5">
                    Pickup Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-brand/40 bg-surface"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1.5">
                    Return Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-brand/40 bg-surface"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1.5">
                    Pickup Terminal in {car.city}
                  </label>
                  <select
                    value={pickupTerminal}
                    onChange={(e) => setPickupTerminal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-brand/40 bg-surface"
                  >
                    <option value="Airport Terminal (Meet & Greet)">Airport Terminal (Curbside VIP Handover)</option>
                    <option value="Domestic Arrivals T1">Domestic Terminal T1</option>
                    <option value="International / T2 / T3">Terminal T2 / T3 Arrivals Desk</option>
                    <option value="City Center Hotel Delivery">City Center Hotel Delivery (+₹500)</option>
                  </select>
                </div>
              </div>

              {/* Driver Information */}
              <div className="space-y-3 pt-3 border-t border-border">
                <h5 className="text-xs font-bold uppercase tracking-wider text-content-secondary">
                  Driver Information
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name (as per Driving License)"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-content-primary placeholder:text-content-disabled focus:outline-none focus:ring-2 focus:ring-brand/40 bg-surface"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone Number (+91 ...)"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-content-primary placeholder:text-content-disabled focus:outline-none focus:ring-2 focus:ring-brand/40 bg-surface"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="email"
                      placeholder="Email Address (for voucher confirmation)"
                      value={driverEmail}
                      onChange={(e) => setDriverEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-content-primary placeholder:text-content-disabled focus:outline-none focus:ring-2 focus:ring-brand/40 bg-surface"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Inbound Flight Number (e.g. AI245, UK812) - Optional"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 rounded-lg border border-border text-sm text-content-primary placeholder:text-content-disabled focus:outline-none focus:ring-2 focus:ring-brand/40 bg-surface"
                      />
                    </div>
                    <p className="text-[11px] text-content-muted mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand" />
                      We link your car with live flight delay tracking: no cancellation fees if your flight arrives late.
                    </p>
                  </div>
                </div>
              </div>

              {/* Insurance Add-on */}
              <div className="bg-surface-subtle p-3.5 rounded-xl border border-border/80 flex items-center justify-between">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="insurance-check"
                    checked={addInsurance}
                    onChange={(e) => setAddInsurance(e.target.checked)}
                    className="mt-1 rounded text-brand focus:ring-brand"
                  />
                  <label htmlFor="insurance-check" className="text-xs cursor-pointer">
                    <span className="font-semibold text-content-primary block">Zero-Deductible Full Coverage Protection</span>
                    <span className="text-content-muted">Covers roadside assistance, collision damage waiver, and tire/windshield.</span>
                  </label>
                </div>
                <span className="text-xs font-bold text-content-primary shrink-0 ml-2">₹999 / day</span>
              </div>

              {/* Price Calculation */}
              <div className="bg-brand-soft/40 p-4 rounded-xl space-y-1.5 border border-brand/10">
                <div className="flex justify-between text-xs text-content-secondary">
                  <span>Base Rental ({days} days × ₹{car.pricePerDay.toLocaleString('en-IN')})</span>
                  <span>₹{baseTotal.toLocaleString('en-IN')}</span>
                </div>
                {addInsurance && (
                  <div className="flex justify-between text-xs text-content-secondary">
                    <span>Full Coverage Protection ({days} days × ₹999)</span>
                    <span>₹{insuranceTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-content-primary pt-2 border-t border-brand/15">
                  <span>Total Estimated Amount</span>
                  <span className="text-brand text-base font-extrabold">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-surface-subtle border-t border-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-content-secondary hover:text-content-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-brand hover:bg-brand-hover text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Confirm Reservation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────
   Travel Story Modal (Cathay Inspiration reader)
   ────────────────────────────────────────────── */
interface StoryModalProps {
  story: TravelStory | null;
  isOpen: boolean;
  onClose: () => void;
}

const TravelStoryModal: React.FC<StoryModalProps> = ({ story, isOpen, onClose }) => {
  if (!isOpen || !story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-border my-8 animate-fadeIn">
        <div className="relative h-64 sm:h-72 overflow-hidden">
          <img
            src={story.image}
            alt={story.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <span className="px-2.5 py-1 bg-brand text-white text-[10px] font-bold uppercase rounded-full tracking-wider mb-2 inline-block">
              {story.category}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
              {story.title}
            </h3>
            <p className="text-xs text-white/75 mt-1">
              Published {story.date} · {story.readTime}
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 max-h-[55vh] overflow-y-auto space-y-4 text-content-primary leading-relaxed text-sm">
          {story.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="text-content-secondary leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="px-6 py-4 bg-surface-subtle border-t border-border flex items-center justify-between">
          <div className="text-xs text-content-muted">
            FlightGuard Aviation Insights
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/flights"
              onClick={onClose}
              className="bg-brand text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-brand-hover transition-colors flex items-center gap-1.5"
            >
              <Plane className="w-3.5 h-3.5" /> Search Flights
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────
   Enhanced Flight Search Panel (with functional tabs)
   ────────────────────────────────────────────── */
const FlightSearchPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flight' | 'delay' | 'car' | 'manage'>('flight');
  const [origin, setOrigin] = useState('BLR');
  const [destination, setDestination] = useState('DEL');
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [cabinClass, setCabinClass] = useState('Economy');

  // Delay radar quick check state
  const [radarFlightNum, setRadarFlightNum] = useState('AI245');
  const [simulatedRadarResult, setSimulatedRadarResult] = useState<{
    flight: string;
    route: string;
    carrier: string;
    prob: number;
    delayMins: number;
    risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    factors: string[];
  } | null>({
    flight: 'AI245',
    route: 'BLR ➔ DEL',
    carrier: 'Air India · Airbus A320neo',
    prob: 82,
    delayMins: 74,
    risk: 'HIGH',
    factors: ['Previous Aircraft Arrival Delay (+45m)', 'Delhi Hub Runway Holding Congestion', 'Late Inbound Fleet Turnaround'],
  });

  const airportOptions = [
    { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda Intl' },
    { code: 'DEL', city: 'Delhi', name: 'Indira Gandhi Intl' },
    { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Intl' },
    { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi Intl' },
    { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhash Chandra' },
    { code: 'MAA', city: 'Chennai', name: 'Chennai International' },
  ];

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const checkRadarFlight = (num: string) => {
    setRadarFlightNum(num);
    const flightDatabase: Record<string, {
      route: string;
      carrier: string;
      prob: number;
      delayMins: number;
      risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      factors: string[];
    }> = {
      AI245: {
        route: 'BLR ➔ DEL',
        carrier: 'Air India · Airbus A320neo',
        prob: 82,
        delayMins: 74,
        risk: 'HIGH',
        factors: ['Previous Aircraft Arrival Delay', 'Delhi Hub Runway Holding Congestion'],
      },
      '6E302': {
        route: 'BLR ➔ DEL',
        carrier: 'IndiGo · Airbus A321neo',
        prob: 15,
        delayMins: 10,
        risk: 'LOW',
        factors: ['Optimal Jet Stream Flight Path', 'Clear Departure Gate Slot'],
      },
      UK812: {
        route: 'BLR ➔ BOM',
        carrier: 'Vistara · Boeing 787-9 Dreamliner',
        prob: 42,
        delayMins: 25,
        risk: 'MEDIUM',
        factors: ['Mumbai Air Traffic Flow Control', 'Minor Sector Routing Adjustments'],
      },
      SG501: {
        route: 'DEL ➔ BOM',
        carrier: 'SpiceJet · Boeing 737 MAX 8',
        prob: 89,
        delayMins: 95,
        risk: 'CRITICAL',
        factors: ['Severe Ground Congestion at Delhi', 'Late Aircraft Turnaround'],
      },
      AI101: {
        route: 'BOM ➔ BLR',
        carrier: 'Air India · Airbus A320neo',
        prob: 20,
        delayMins: 5,
        risk: 'LOW',
        factors: ['Early Ground Clearances', 'Favorable Wind Conditions'],
      },
    };

    const res = flightDatabase[num.toUpperCase()] || {
      route: 'Custom Route Query',
      carrier: 'Commercial Carrier',
      prob: 28,
      delayMins: 12,
      risk: 'LOW',
      factors: ['Standard En-Route Traffic', 'Normal Ground Operations'],
    };

    setSimulatedRadarResult({
      flight: num.toUpperCase(),
      ...res,
    });
  };

  const scrollToCarRental = () => {
    const el = document.getElementById('car-rental-collection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-30">
      <div className="bg-white rounded-2xl shadow-xl border border-border p-6 sm:p-8">
        {/* Navigation Tabs (Cathay Pacific style) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-6 mb-6 border-b border-border pb-4">
          <button
            onClick={() => setActiveTab('flight')}
            className={`flex items-center gap-2 text-sm font-semibold pb-2 border-b-2 transition-colors ${
              activeTab === 'flight'
                ? 'text-brand border-brand'
                : 'text-content-muted border-transparent hover:text-content-secondary'
            }`}
          >
            <Plane className="w-4 h-4" /> Book a flight
          </button>
          <button
            onClick={() => setActiveTab('delay')}
            className={`flex items-center gap-2 text-sm font-semibold pb-2 border-b-2 transition-colors ${
              activeTab === 'delay'
                ? 'text-brand border-brand'
                : 'text-content-muted border-transparent hover:text-content-secondary'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> AI Delay Risk Radar
          </button>
          <button
            onClick={() => setActiveTab('car')}
            className={`flex items-center gap-2 text-sm font-semibold pb-2 border-b-2 transition-colors ${
              activeTab === 'car'
                ? 'text-brand border-brand'
                : 'text-content-muted border-transparent hover:text-content-secondary'
            }`}
          >
            <Car className="w-4 h-4" /> Car Rental
          </button>
          <Link
            to="/reservations"
            className="flex items-center gap-2 text-sm font-medium text-content-muted hover:text-brand transition-colors pb-2 border-b-2 border-transparent ml-auto"
          >
            <FileText className="w-4 h-4" /> Manage Booking
          </Link>
        </div>

        {/* Tab 1: Book a Flight Form */}
        {activeTab === 'flight' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Origin Airport */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold text-content-muted uppercase tracking-wider mb-2">
                From (Origin)
              </label>
              <div className="relative">
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-lg border border-border bg-surface-subtle text-content-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand appearance-none"
                >
                  {airportOptions.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.city} ({a.code})
                    </option>
                  ))}
                </select>
                <MapPin className="w-4 h-4 text-brand absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Swap button */}
            <div className="hidden md:flex md:col-span-1 items-center justify-center pb-2">
              <button
                type="button"
                onClick={handleSwap}
                className="w-10 h-10 rounded-full border border-border hover:border-brand hover:bg-brand-soft flex items-center justify-center text-content-muted hover:text-brand transition-all shadow-xs"
                title="Swap departure and arrival"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Destination Airport */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold text-content-muted uppercase tracking-wider mb-2">
                To (Destination)
              </label>
              <div className="relative">
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-lg border border-border bg-surface-subtle text-content-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand appearance-none"
                >
                  {airportOptions.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.city} ({a.code})
                    </option>
                  ))}
                </select>
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Departure Date */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold text-content-muted uppercase tracking-wider mb-2">
                Departure Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-lg border border-border bg-surface-subtle text-content-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <Calendar className="w-4 h-4 text-brand absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Search CTA */}
            <div className="md:col-span-2">
              <Link
                to={`/flights?origin=${origin}&destination=${destination}&departure_date=${departureDate}`}
                className="flex items-center justify-center gap-2 bg-brand text-white w-full px-6 py-3.5 rounded-lg font-bold text-sm hover:bg-brand-hover transition-colors shadow-md hover:shadow-lg"
              >
                <Search className="w-4 h-4" /> Search Flights
              </Link>
            </div>
          </div>
        )}

        {/* Tab 2: AI Delay Risk Radar */}
        {activeTab === 'delay' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Enter Flight Number (e.g. AI245, UK812, 6E302)"
                  value={radarFlightNum}
                  onChange={(e) => setRadarFlightNum(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-surface-subtle text-sm text-content-primary font-medium focus:outline-none focus:ring-2 focus:ring-brand uppercase"
                />
              </div>
              <button
                onClick={() => checkRadarFlight(radarFlightNum)}
                className="bg-brand text-white px-6 py-3 rounded-lg text-xs font-bold hover:bg-brand-hover transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" /> Run AI Predictor
              </button>
            </div>

            {/* Quick Flight Buttons */}
            <div className="flex items-center gap-2 flex-wrap text-xs text-content-muted">
              <span>Try sample flights:</span>
              {['AI245', '6E302', 'UK812', 'SG501', 'AI101'].map((code) => (
                <button
                  key={code}
                  onClick={() => checkRadarFlight(code)}
                  className="px-2.5 py-1 rounded-md bg-surface-subtle hover:bg-brand-soft hover:text-brand border border-border text-[11px] font-semibold transition-colors"
                >
                  {code}
                </button>
              ))}
            </div>

            {/* Live Result Card */}
            {simulatedRadarResult && (
              <div className="bg-surface-subtle p-5 rounded-xl border border-border mt-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-content-primary">
                      {simulatedRadarResult.flight} · {simulatedRadarResult.route}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        simulatedRadarResult.risk === 'HIGH' || simulatedRadarResult.risk === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : simulatedRadarResult.risk === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {simulatedRadarResult.risk} DELAY RISK
                    </span>
                  </div>
                  <p className="text-xs text-content-muted">{simulatedRadarResult.carrier}</p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {simulatedRadarResult.factors.map((f, i) => (
                      <span key={i} className="text-[10px] bg-white px-2 py-0.5 rounded border border-border/80 text-content-secondary">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <div className="text-2xl font-black text-brand">{simulatedRadarResult.prob}%</div>
                    <div className="text-[10px] text-content-muted font-medium">Delay Probability</div>
                    <div className="text-xs font-semibold text-rose-600 mt-0.5">+{simulatedRadarResult.delayMins} min est.</div>
                  </div>
                  <Link
                    to="/flights"
                    className="bg-brand text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-brand-hover transition-colors shadow-xs"
                  >
                    View All Flights
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Car Rental Selector */}
        {activeTab === 'car' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
              <label className="block text-[11px] font-semibold text-content-muted uppercase tracking-wider mb-2">
                Pickup City / Airport
              </label>
              <div className="relative">
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-lg border border-border bg-surface-subtle text-content-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand appearance-none"
                >
                  <option value="DEL">Delhi (Indira Gandhi Airport T3)</option>
                  <option value="BLR">Bengaluru (Kempegowda Airport T1/T2)</option>
                  <option value="BOM">Mumbai (Chhatrapati Shivaji T2)</option>
                  <option value="HYD">Hyderabad (Rajiv Gandhi Airport)</option>
                  <option value="CCU">Kolkata (Netaji Subhash Chandra)</option>
                  <option value="MAA">Chennai (Chennai International)</option>
                </select>
                <MapPin className="w-4 h-4 text-brand absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold text-content-muted uppercase tracking-wider mb-2">
                Pickup Date
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-surface-subtle text-content-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold text-content-muted uppercase tracking-wider mb-2">
                Vehicle Category
              </label>
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-surface-subtle text-content-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="All">All Categories (Sedan, SUV, Luxury)</option>
                <option value="Luxury">Luxury Sedans (Mercedes S-Class)</option>
                <option value="SUV">Luxury SUVs (BMW X5, Range Rover)</option>
                <option value="Electric">Electric Vehicles (Tesla Model S)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={scrollToCarRental}
                className="flex items-center justify-center gap-2 bg-brand text-white w-full px-6 py-3.5 rounded-lg font-bold text-sm hover:bg-brand-hover transition-colors shadow-md"
              >
                <Car className="w-4 h-4" /> Browse Cars
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────
   Animated Counter Hook
   ────────────────────────────────────────────── */
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        start += step;
      }
    }, 16);
    return () => clearInterval(timer);
  }, [hasStarted, target, duration]);

  return { count, start: () => setHasStarted(true) };
}

/* ──────────────────────────────────────────────
   Stats Bar Section
   ────────────────────────────────────────────── */
const StatsSection: React.FC = () => {
  const stat1 = useCountUp(500);
  const stat2 = useCountUp(98);
  const stat3 = useCountUp(50);
  const stat4 = useCountUp(24);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          stat1.start(); stat2.start(); stat3.start(); stat4.start();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = [
    { value: `${stat1.count}+`, label: 'Routes Monitored', icon: <Globe className="w-5 h-5" /> },
    { value: `${stat2.count}%`, label: 'Prediction Accuracy', icon: <TrendingUp className="w-5 h-5" /> },
    { value: `${stat3.count}K+`, label: 'Active Passengers', icon: <Users className="w-5 h-5" /> },
    { value: `${stat4.count}/7`, label: 'Live Monitoring', icon: <Clock className="w-5 h-5" /> },
  ];

  return (
    <div ref={ref} className="bg-brand text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                {s.icon}
              </div>
              <div className="text-3xl sm:text-4xl font-serif mb-1">{s.value}</div>
              <div className="text-xs font-medium text-white/60 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────
   Destinations Section (Hyperlinked Image Cards to Booking)
   ────────────────────────────────────────────── */
const DestinationsSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">Destinations</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-content-primary">
            Where would you like to go?
          </h2>
          <p className="text-xs sm:text-sm text-content-muted mt-1.5">
            Click any destination to search live flights with delay risk evaluation.
          </p>
        </div>
        <Link
          to="/flights"
          className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-hover transition-colors"
        >
          View all destinations <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {destinations.map((d) => (
          <Link
            key={d.code}
            to={`/flights?destination=${d.code}`}
            className="group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/40 hover:-translate-y-1 block"
          >
            {/* Airport City Image */}
            <img
              src={d.image}
              alt={d.city}
              className="w-full h-full object-cover img-zoom"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            {/* Tag Badge */}
            <div className="absolute top-3 left-3">
              <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-wider border border-white/20">
                {d.tag}
              </span>
            </div>

            {/* Card Content & Fare */}
            <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white">
              <div className="text-[10px] text-white/70 font-medium uppercase tracking-wider">{d.code} · {d.country}</div>
              <h3 className="font-serif text-lg font-bold leading-tight group-hover:text-amber-200 transition-colors">
                {d.city}
              </h3>
              <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-white/20">
                <span className="font-extrabold text-amber-300">{d.fare}</span>
                <span className="text-[10px] text-emerald-300 font-semibold">{d.onTime}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────
   Featured Flight Offers Section (Cathay Pacific style)
   ────────────────────────────────────────────── */
const FeaturedOffersSection: React.FC = () => {
  return (
    <section className="bg-surface-subtle py-16 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">Exclusive Fares</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-content-primary">
              Latest Flight Offers & Fares
            </h2>
            <p className="text-xs sm:text-sm text-content-muted mt-1.5">
              Handpicked domestic routes featuring predictive AI delay scores and best price guarantees.
            </p>
          </div>
          <Link
            to="/flights"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-hover transition-colors"
          >
            Explore all fares <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredOffers.map((offer) => (
            <div
              key={offer.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/60 hover:border-brand/40 flex flex-col"
            >
              {/* Image with Link */}
              <Link
                to={`/flights?origin=${offer.originCode}&destination=${offer.destCode}`}
                className="relative h-44 overflow-hidden block"
              >
                <img
                  src={offer.image}
                  alt={`${offer.originCity} to ${offer.destCity}`}
                  className="w-full h-full object-cover img-zoom"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-brand text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    {offer.badge}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-xs text-white/80 font-medium">Non-stop · {offer.duration}</div>
                  <div className="text-base font-bold">
                    {offer.originCity} ({offer.originCode}) ➔ {offer.destCity} ({offer.destCode})
                  </div>
                </div>
              </Link>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-content-muted mb-2">
                    <span>{offer.airline}</span>
                    <span>{offer.aircraft}</span>
                  </div>

                  {/* Delay Risk Indicator */}
                  <div className="bg-surface-subtle p-2.5 rounded-lg border border-border/60 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          offer.riskLevel === 'LOW'
                            ? 'bg-emerald-500'
                            : offer.riskLevel === 'MEDIUM'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      <span className="font-semibold text-content-primary text-[11px]">
                        {offer.riskLevel} Delay Risk
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-brand">{offer.riskPercent}% Prob</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-content-muted block">Starting from</span>
                    <span className="text-lg font-extrabold text-brand">₹{offer.fare.toLocaleString('en-IN')}</span>
                  </div>
                  <Link
                    to={`/flights?origin=${offer.originCode}&destination=${offer.destCode}`}
                    className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                  >
                    Book <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────
   Car Rental Section (with Filter, Modal, & Hyperlinks)
   ────────────────────────────────────────────── */
const CarRentalSection: React.FC<{ onSelectCar: (car: CarRentalItem) => void }> = ({ onSelectCar }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Luxury', 'SUV', 'Sports', 'Electric', 'Compact'];

  const filteredCars = selectedCategory === 'All'
    ? carCollection
    : carCollection.filter((c) => c.category === selectedCategory);

  return (
    <section id="car-rental-collection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Ground Transportation</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-content-primary">
            Curated Airport Car Rentals
          </h2>
          <p className="text-content-muted text-xs sm:text-sm mt-2 max-w-xl">
            Complete your journey with premium curbside pickup at all destination airports. Backed by FlightGuard zero-penalty flight delay holds.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-brand text-white shadow-sm'
                  : 'bg-surface-subtle text-content-secondary hover:bg-surface border border-border/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Car Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.map((car) => (
          <div
            key={car.id}
            className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/60 hover:border-brand/40 flex flex-col"
          >
            {/* Car Image with Interactive Click to Book */}
            <div
              onClick={() => onSelectCar(car)}
              className="relative h-56 overflow-hidden cursor-pointer"
            >
              <img
                src={car.image}
                alt={car.name}
                className="w-full h-full object-cover img-zoom"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 bg-brand text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  {car.badge}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-content-primary rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-brand" /> {car.city}
                </span>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-brand text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-1.5">
                  <Car className="w-4 h-4" /> Book This Car
                </span>
              </div>
            </div>

            {/* Car Details */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-content-primary text-base group-hover:text-brand transition-colors">
                      {car.name}
                    </h3>
                    <p className="text-xs text-content-muted mt-0.5">
                      {car.category} · {car.seats} Seats · {car.transmission}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xl font-extrabold text-brand">₹{car.pricePerDay.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-content-muted block font-normal">/ day</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-1.5 mt-3 pt-3 border-t border-border/50 text-[11px] text-content-secondary">
                  {car.features.slice(0, 2).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-border/50">
                <Link
                  to={`/flights?destination=${car.cityCode}`}
                  className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
                  title={`Book flight to ${car.city}`}
                >
                  <Plane className="w-3.5 h-3.5" /> Fly to {car.city}
                </Link>
                <button
                  onClick={() => onSelectCar(car)}
                  className="bg-brand text-white hover:bg-brand-hover px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  Book Car <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────
   Travel Inspiration Hub Section (Cathay "Inspiration" style)
   ────────────────────────────────────────────── */
const InspirationSection: React.FC<{ onSelectStory: (story: TravelStory) => void }> = ({ onSelectStory }) => {
  return (
    <section className="bg-surface-subtle py-20 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">Cathay Inspiration</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-content-primary mb-3">
            Inspiration & Aviation Insights
          </h2>
          <p className="text-content-muted text-xs sm:text-sm max-w-xl mx-auto">
            Curated articles on predictive airline intelligence, luxury lounges, seasonal monsoon travel, and smart airport transfers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {travelStories.map((story) => (
            <div
              key={story.id}
              onClick={() => onSelectStory(story)}
              className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/60 hover:border-brand/40 flex flex-col cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover img-zoom"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-content-primary rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    {story.category}
                  </span>
                </div>
              </div>

              {/* Text */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-content-muted font-medium mb-1.5">
                    {story.date} · {story.readTime}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-content-primary group-hover:text-brand transition-colors line-clamp-2 mb-2 leading-snug">
                    {story.title}
                  </h3>
                  <p className="text-xs text-content-muted line-clamp-3 leading-relaxed">
                    {story.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-brand group-hover:translate-x-1 transition-transform">
                  <span>Read full story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────
   FlightGuard Club Loyalty Tiers (Cathay Asia Miles style)
   ────────────────────────────────────────────── */
const MembershipSection: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<'Green' | 'Silver' | 'Gold' | 'Diamond'>('Gold');

  const tierDetails = {
    Green: {
      tagline: 'Entry Membership',
      milesMultiplier: '1x Points on Flight Bookings',
      perks: [
        'Real-time flight delay SMS & WhatsApp notifications',
        '10% discount on all airport car rental bookings',
        'Hold fare price for 24 hours free of charge',
        'Access to digital boarding pass wallet',
      ],
      badgeColor: 'bg-emerald-700 text-white',
    },
    Silver: {
      tagline: 'Frequent Traveler',
      milesMultiplier: '1.25x Points on Bookings',
      perks: [
        '50% delay cash-back voucher if departure delayed > 60m',
        'Priority airport check-in counters nationwide',
        '15% car rental discount with free cancellation up to 6h',
        'Free seat selection on all domestic routes',
      ],
      badgeColor: 'bg-slate-500 text-white',
    },
    Gold: {
      tagline: 'Premier Advantage',
      milesMultiplier: '1.5x Points on Bookings',
      perks: [
        '100% full delay cash refund if flight delayed > 45m',
        'Unlimited access to partner airport executive lounges',
        'Complimentary vehicle upgrade on car rentals',
        'Priority baggage delivery & 10kg excess luggage allowance',
      ],
      badgeColor: 'bg-amber-600 text-white',
    },
    Diamond: {
      tagline: 'Elite Connoisseur',
      milesMultiplier: '2x Points on Bookings',
      perks: [
        'Guaranteed seat on fully booked flights up to 24h prior',
        'First Class lounge & spa suites access with guest',
        'Dedicated 24/7 personal aviation concierge manager',
        'Complimentary luxury airport chauffeur transfers',
      ],
      badgeColor: 'bg-blue-950 text-white',
    },
  };

  const current = tierDetails[selectedTier];

  return (
    <section className="bg-brand text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300 mb-2">FlightGuard Club</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-white mb-3">
            Elevate Your Journey with Member Privileges
          </h2>
          <p className="text-white/75 text-xs sm:text-sm max-w-xl mx-auto">
            Earn FlightGuard miles on flights and car rentals. Enjoy automatic delay insurance and executive lounge comforts.
          </p>
        </div>

        {/* Tier Selector Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white/10 p-1.5 rounded-2xl border border-white/20 backdrop-blur-sm">
            {(['Green', 'Silver', 'Gold', 'Diamond'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedTier === tier
                    ? 'bg-white text-brand shadow-md scale-105'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Tier Benefit Card */}
        <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/20 mb-6">
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${current.badgeColor}`}>
                {selectedTier} Tier
              </span>
              <h3 className="font-serif text-2xl font-bold text-white mt-2">{current.tagline}</h3>
            </div>
            <div className="text-right">
              <span className="text-emerald-300 font-extrabold text-sm">{current.milesMultiplier}</span>
              <span className="block text-[11px] text-white/60">Asia Miles & Partner Network</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {current.perks.map((perk, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs text-white/90 leading-relaxed">{perk}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/20">
            <div className="text-xs text-white/70">
              Already have bookings? Your membership status upgrades automatically.
            </div>
            <Link
              to="/register"
              className="w-full sm:w-auto bg-white text-brand hover:bg-white/90 px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors text-center"
            >
              Join FlightGuard Club Free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────
   Core Platform Features (Cathay pillar style)
   ────────────────────────────────────────────── */
const PlatformPillarsSection: React.FC = () => {
  return (
    <section className="bg-surface-subtle py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">Platform</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-content-primary mb-3">
            Everything you need to fly smarter
          </h2>
          <p className="text-content-muted text-sm sm:text-base max-w-2xl mx-auto">
            From booking to boarding, FlightGuard AI keeps you informed with predictive intelligence and seamless reservation management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all group border border-border/50">
            <div className="w-14 h-14 rounded-xl bg-brand-soft text-brand flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-white transition-colors">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl text-content-primary mb-3">Smart Reservations</h3>
            <p className="text-sm text-content-muted leading-relaxed mb-5">
              Search, compare, and book flights with server-side fare calculation. Get instant PNR confirmation and manage your itinerary from one place.
            </p>
            <ul className="space-y-2 text-xs text-content-secondary">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" /> Multi-route search & filtering
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" /> Instant PNR generation
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" /> Fare class management
              </li>
            </ul>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all group border border-border/50">
            <div className="w-14 h-14 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl text-content-primary mb-3">Delay Prediction</h3>
            <p className="text-sm text-content-muted leading-relaxed mb-5">
              XGBoost models evaluate carrier performance, weather patterns, and airport congestion to deliver probabilistic delay risk scores.
            </p>
            <ul className="space-y-2 text-xs text-content-secondary">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" /> XGBoost ensemble models
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" /> Weather data integration
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" /> Historical pattern analysis
              </li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all group border border-border/50">
            <div className="w-14 h-14 rounded-xl bg-brand-soft text-brand flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-white transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl text-content-primary mb-3">Operations Centre</h3>
            <p className="text-sm text-content-muted leading-relaxed mb-5">
              Empowers airline staff to monitor high-risk departures, review delay factor attribution, and track affected passenger itineraries.
            </p>
            <ul className="space-y-2 text-xs text-content-secondary">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" /> Real-time risk dashboard
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" /> Factor-level attribution
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" /> Passenger impact analysis
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────
   How It Works Section
   ────────────────────────────────────────────── */
const HowItWorksSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">How it works</p>
        <h2 className="font-serif text-3xl sm:text-4xl text-content-primary">
          Four steps to smarter travel
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { num: '01', title: 'Search Flights', desc: 'Browse available routes, dates, and fare classes across our network.', icon: <Search className="w-5 h-5" /> },
          { num: '02', title: 'Check Delay Risk', desc: 'Our ML model calculates delay probability using 15+ data features in real time.', icon: <AlertTriangle className="w-5 h-5" /> },
          { num: '03', title: 'Book Confidently', desc: 'Reserve your seat knowing the risk profile. Instant PNR and confirmation.', icon: <Lock className="w-5 h-5" /> },
          { num: '04', title: 'Add Ground Rental', desc: 'Reserve an executive vehicle held with zero penalty even if your flight is delayed.', icon: <Car className="w-5 h-5" /> },
        ].map((step) => (
          <div key={step.num} className="text-center group">
            <div className="w-16 h-16 rounded-2xl bg-brand text-white flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform shadow-sm">
              {step.icon}
            </div>
            <div className="text-[10px] font-bold text-content-disabled uppercase tracking-widest mb-2">Step {step.num}</div>
            <h4 className="font-serif text-xl text-content-primary mb-2">{step.title}</h4>
            <p className="text-xs text-content-muted leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────
   Why FlightGuard Section (Split Layout)
   ────────────────────────────────────────────── */
const WhyFlightGuardSection: React.FC = () => {
  return (
    <section className="bg-brand">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image */}
          <div className="relative h-64 sm:h-80 lg:h-auto">
            <img
              src="/assets/airport_singapore.jpg"
              alt="Singapore Changi Airport"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-brand/20" />
          </div>

          {/* Content */}
          <div className="px-8 sm:px-12 lg:px-16 py-16 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">Why FlightGuard AI</p>
            <h2 className="font-serif text-3xl sm:text-4xl mb-6 leading-tight">
              Intelligence that keeps you ahead
            </h2>
            <p className="text-sm text-white/75 leading-relaxed mb-8">
              We go beyond traditional booking systems. FlightGuard AI combines robust airline reservation capabilities with advanced machine learning to give passengers, operations agents, and administrators the tools they need.
            </p>

            <div className="space-y-6">
              {[
                { icon: <Zap className="w-4 h-4" />, title: 'Predictive Intelligence', desc: 'XGBoost models trained on historical flight data deliver real-time delay probability scores.' },
                { icon: <Lock className="w-4 h-4" />, title: 'Enterprise Security', desc: 'JWT authentication, role-based access control, and encrypted data pipelines protect every transaction.' },
                { icon: <Globe className="w-4 h-4" />, title: 'Integrated Travel Ecosystem', desc: 'Book scheduled flights, reserve curbside car rentals, and protect against delay disruptions.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">{item.title}</h4>
                    <p className="text-xs text-white/60 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-brand px-8 py-3.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors shadow-sm"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────
   HomePage Component
   ────────────────────────────────────────────── */
const HomePage: React.FC = () => {
  const [selectedCarForModal, setSelectedCarForModal] = useState<CarRentalItem | null>(null);
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);

  const [selectedStoryForModal, setSelectedStoryForModal] = useState<TravelStory | null>(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  const handleOpenCarModal = (car: CarRentalItem) => {
    setSelectedCarForModal(car);
    setIsCarModalOpen(true);
  };

  const handleOpenStoryModal = (story: TravelStory) => {
    setSelectedStoryForModal(story);
    setIsStoryModalOpen(true);
  };

  return (
    <div>
      {/* ─── Hero Carousel (Cathay Pacific style Full Bleed) ─── */}
      <HeroCarousel />

      {/* ─── Interactive Search & AI Delay Radar Panel ─── */}
      <FlightSearchPanel />

      {/* ─── Popular Destinations (Clickable Image Cards to Booking) ─── */}
      <DestinationsSection />

      {/* ─── Featured Flight Offers & Fares ─── */}
      <FeaturedOffersSection />

      {/* ─── Car Rental Collection (Clickable Cards with City, Price, Specs) ─── */}
      <CarRentalSection onSelectCar={handleOpenCarModal} />

      {/* ─── Stats Bar ─── */}
      <StatsSection />

      {/* ─── Cathay Inspiration & Aviation Insights ─── */}
      <InspirationSection onSelectStory={handleOpenStoryModal} />

      {/* ─── FlightGuard Club Loyalty Tiers ─── */}
      <MembershipSection />

      {/* ─── Platform Pillars ─── */}
      <PlatformPillarsSection />

      {/* ─── How It Works ─── */}
      <HowItWorksSection />

      {/* ─── Why FlightGuard Split Section ─── */}
      <WhyFlightGuardSection />

      {/* ─── Car Rental Modal ─── */}
      <CarRentalModal
        car={selectedCarForModal}
        isOpen={isCarModalOpen}
        onClose={() => setIsCarModalOpen(false)}
      />

      {/* ─── Travel Story Modal ─── */}
      <TravelStoryModal
        story={selectedStoryForModal}
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
      />
    </div>
  );
};

/* ──────────────────────────────────────────────
   App Shell
   ────────────────────────────────────────────── */
export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-surface-bg text-content-primary">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/flights" element={<FlightSearchPage />} />
                <Route path="/flights/:id" element={<FlightDetailPage />} />
                <Route
                  path="/reservations"
                  element={
                    <ProtectedRoute>
                      <MyReservationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/operations"
                  element={
                    <ProtectedRoute allowedRoles={['OPERATIONS_AGENT', 'ADMIN']}>
                      <OperationsDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>

            {/* ─── Premium Footer (Aviation Slate & Blue) ─── */}
            <footer className="bg-slate-900 text-gray-300">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-16">
                  {/* Brand */}
                  <div>
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center">
                        <Plane className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-serif text-xl text-white">FlightGuard AI</span>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-400">
                      Intelligent airline reservation system integrated with machine learning for flight delay prediction and real-time aviation intelligence.
                    </p>
                  </div>

                  {/* Quick Links */}
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider text-xs">Explore</h4>
                    <ul className="space-y-2.5 text-sm">
                      <li><Link to="/flights" className="text-gray-400 hover:text-white transition-colors">Search Flights</Link></li>
                      <li><Link to="/reservations" className="text-gray-400 hover:text-white transition-colors">My Reservations</Link></li>
                      <li><Link to="/operations" className="text-gray-400 hover:text-white transition-colors">Operations Dashboard</Link></li>
                      <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors">Create Account</Link></li>
                    </ul>
                  </div>

                  {/* Platform */}
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider text-xs">Platform</h4>
                    <ul className="space-y-2.5 text-sm text-gray-400">
                      <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> JWT Authentication</li>
                      <li className="flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5 text-blue-400" /> XGBoost ML Models</li>
                      <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-blue-400" /> FastAPI + React</li>
                      <li className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-blue-400" /> Role-Based Access</li>
                    </ul>
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider text-xs">Technology</h4>
                    <ul className="space-y-2.5 text-sm text-gray-400">
                      <li>Backend: FastAPI + SQLAlchemy</li>
                      <li>Frontend: React + TypeScript</li>
                      <li>ML: XGBoost + scikit-learn</li>
                      <li>Database: PostgreSQL / SQLite</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-slate-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-[11px] text-gray-500">
                    &copy; {new Date().getFullYear()} FlightGuard AI Aviation Systems. All rights reserved.
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Built with precision for smarter aviation ✈
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
