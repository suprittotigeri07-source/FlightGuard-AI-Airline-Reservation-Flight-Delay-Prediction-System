/**
 * Landing Page — Demo / Placeholder Data
 *
 * All values below are illustrative placeholders for the initial UI.
 * Components are designed so these can be replaced by real backend API
 * responses (e.g. GET /api/v1/flights, GET /api/v1/operations/summary).
 *
 * Do NOT treat these as real production statistics.
 */

/* ── Hero Floating Cards ─────────────────────── */

export interface HeroFlightCard {
  flightNumber: string;
  route: string;
  status: string;
  statusColor: 'green' | 'amber' | 'red';
}

export interface HeroPredictionCard {
  probability: number;
  riskLevel: string;
  estimatedDelay: number;
}

export interface HeroTrackingCard {
  flightCount: string;
  isLive: boolean;
}

export const heroFlightCard: HeroFlightCard = {
  flightNumber: 'AI245',
  route: 'BLR → DEL',
  status: 'IN AIR',
  statusColor: 'green',
};

export const heroPredictionCard: HeroPredictionCard = {
  probability: 78,
  riskLevel: 'HIGH',
  estimatedDelay: 64,
};

export const heroTrackingCard: HeroTrackingCard = {
  flightCount: '12,482',
  isLive: true,
};

/* ── Live Flight Preview Section ─────────────── */

export interface DemoFlightRow {
  flight: string;
  airline: string;
  route: string;
  status: string;
  statusVariant: 'in-air' | 'delayed' | 'scheduled' | 'landed';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const demoFlightRows: DemoFlightRow[] = [
  { flight: 'AI245', airline: 'Air India', route: 'BLR → DEL', status: 'In Air', statusVariant: 'in-air', riskLevel: 'HIGH' },
  { flight: '6E302', airline: 'IndiGo', route: 'DEL → BOM', status: 'Delayed', statusVariant: 'delayed', riskLevel: 'HIGH' },
  { flight: 'UK812', airline: 'Vistara', route: 'BOM → BLR', status: 'On Time', statusVariant: 'scheduled', riskLevel: 'LOW' },
  { flight: 'SG401', airline: 'SpiceJet', route: 'HYD → CCU', status: 'In Air', statusVariant: 'in-air', riskLevel: 'MEDIUM' },
  { flight: 'QP119', airline: 'Akasa Air', route: 'BLR → GOI', status: 'Scheduled', statusVariant: 'scheduled', riskLevel: 'LOW' },
];

export const liveDashboardStats = {
  totalFlights: 1247,
  inAir: 312,
  delayed: 48,
  highRisk: 23,
};

/* ── AI Prediction Card ──────────────────────── */

export const demoPrediction = {
  flightNumber: 'AI245',
  route: 'BLR → DEL',
  origin: 'Kempegowda International',
  destination: 'Indira Gandhi International',
  probability: 0.78,
  estimatedDelay: 64,
  riskLevel: 'HIGH' as const,
  modelVersion: 'FlightDelay-v1',
  factors: [
    'Peak departure time — runway congestion at BLR hub',
    'Historical sector delay rate on BLR–DEL corridor',
    'Extended turnaround from inbound aircraft delay',
  ],
};

/* ── Feature Cards ───────────────────────────── */

export interface FeatureItem {
  id: string;
  icon: string; // Lucide icon name reference
  title: string;
  description: string;
}

export const features: FeatureItem[] = [
  {
    id: 'feat-tracking',
    icon: 'Radar',
    title: 'Real-Time Flight Tracking',
    description: 'Track live flights, status updates, routes and real-time locations across major Indian airports.',
  },
  {
    id: 'feat-prediction',
    icon: 'BrainCircuit',
    title: 'AI Delay Prediction',
    description: 'Machine learning models analyze 15+ variables to estimate flight delay probability before pushback.',
  },
  {
    id: 'feat-reservations',
    icon: 'TicketCheck',
    title: 'Smart Reservations',
    description: 'Search, compare, and book flights through a secure, validated reservation workflow with PNR generation.',
  },
  {
    id: 'feat-security',
    icon: 'ShieldCheck',
    title: 'Secure & Reliable',
    description: 'Enterprise-grade JWT authentication, role-based access control, and encrypted data protection.',
  },
  {
    id: 'feat-operations',
    icon: 'BarChart3',
    title: 'Operations Intelligence',
    description: 'Help airline operations teams identify high-risk flights, analyze delay patterns, and make data-driven decisions.',
  },
];

/* ── How It Works Steps ──────────────────────── */

export interface StepItem {
  number: string;
  title: string;
  description: string;
}

export const howItWorksSteps: StepItem[] = [
  { number: '01', title: 'Search', description: 'Find available flights by route, date, and airline.' },
  { number: '02', title: 'Analyze', description: 'AI analyzes flight data, weather, and operational factors.' },
  { number: '03', title: 'Predict', description: 'Receive estimated delay probability and risk assessment.' },
  { number: '04', title: 'Reserve & Track', description: 'Book your flight and monitor live status in real time.' },
];

/* ── Why FlightGuard Split ───────────────────── */

export const passengerBenefits = [
  'Search flights across major routes',
  'View live flight status and tracking',
  'See AI-powered delay risk before booking',
  'Make secure reservations with PNR',
  'Track active bookings and itineraries',
];

export const operationsBenefits = [
  'Monitor all active flights in real time',
  'Identify high-risk flights instantly',
  'Analyze delay patterns and root causes',
  'View operational analytics and KPIs',
  'Make data-driven operational decisions',
];

/* ── Statistics ───────────────────────────────── */

export interface StatItem {
  value: string;
  suffix: string;
  label: string;
  numericTarget: number; // for counter animation
}

export const statistics: StatItem[] = [
  { value: '12', suffix: 'K+', label: 'Live Flights', numericTarget: 12 },
  { value: '95', suffix: '%+', label: 'Data Availability', numericTarget: 95 },
  { value: '24/7', suffix: '', label: 'Flight Monitoring', numericTarget: 24 },
  { value: 'AI', suffix: '', label: 'Powered Predictions', numericTarget: 0 },
];

/* ── Footer Links ────────────────────────────── */

export const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Flight Search', href: '/flights' },
      { label: 'Live Tracking', href: '/flights' },
      { label: 'Delay Prediction', href: '/flights' },
      { label: 'Reservations', href: '/reservations' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/api/v1/docs' },
      { label: 'API', href: '/api/v1/docs' },
      { label: 'Security', href: '#security' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#privacy' },
      { label: 'Terms', href: '#terms' },
    ],
  },
];
