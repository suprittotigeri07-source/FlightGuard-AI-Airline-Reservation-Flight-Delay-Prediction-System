import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { flightService } from '../../services/flightService';
import { aeroApiService, AeroAPIStatus } from '../../services/aeroApiService';
import { UserAdmin, AuditLog, FlightCreatePayload, AirportCreatePayload, AirlineCreatePayload } from '../../types/admin';
import { Flight, Airport, Airline } from '../../types/flight';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Users,
  Plane,
  FileText,
  Search,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  Radio,
  Key,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'flights' | 'fleet' | 'audit' | 'aeroapi'>('users');

  // Users tab state
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [userSearch, setUserSearch] = useState<string>('');
  const [isUsersLoading, setIsUsersLoading] = useState<boolean>(true);

  // Flights tab state
  const [flights, setFlights] = useState<Flight[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [isFlightsLoading, setIsFlightsLoading] = useState<boolean>(false);
  const [isAddFlightOpen, setIsAddFlightOpen] = useState<boolean>(false);

  // Add Flight Form
  const [flightForm, setFlightForm] = useState<FlightCreatePayload>({
    flight_number: '',
    airline_id: '',
    aircraft_id: '',
    origin_airport_id: '',
    destination_airport_id: '',
    scheduled_departure: '',
    scheduled_arrival: '',
    base_price: 5000,
  });

  // Fleet Forms state
  const [airportForm, setAirportForm] = useState<AirportCreatePayload>({ code: '', name: '', city: '', country: 'India', timezone: 'Asia/Kolkata' });
  const [airlineForm, setAirlineForm] = useState<AirlineCreatePayload>({ code: '', name: '', country: 'India' });

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isAuditLoading, setIsAuditLoading] = useState<boolean>(false);

  // AeroAPI Integration State
  const [aeroStatus, setAeroStatus] = useState<AeroAPIStatus | null>(null);
  const [aeroKeyInput, setAeroKeyInput] = useState<string>('');
  const [isAeroLoading, setIsAeroLoading] = useState<boolean>(false);
  const [isAeroSaving, setIsAeroSaving] = useState<boolean>(false);
  const [isAeroSyncing, setIsAeroSyncing] = useState<boolean>(false);
  const [aeroSyncHub, setAeroSyncHub] = useState<string>('');
  const [aeroSyncLimit, setAeroSyncLimit] = useState<number>(10);

  // General Status Alerts
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  // Fetch Users
  const loadUsers = async () => {
    setIsUsersLoading(true);
    try {
      const data = await adminService.getUsers(userSearch);
      setUsers(data);
    } catch {
      showFeedback('danger', 'Failed to load system users.');
    } finally {
      setIsUsersLoading(false);
    }
  };

  // Fetch Flights & Meta
  const loadFlightsAndFleet = async () => {
    setIsFlightsLoading(true);
    try {
      const [fRes, apRes, alRes] = await Promise.all([
        flightService.searchFlights({ limit: 50 }),
        flightService.getAirports(),
        flightService.getAirlines(),
      ]);
      setFlights(fRes.items);
      setAirports(apRes);
      setAirlines(alRes);

      if (apRes.length >= 2 && alRes.length >= 1) {
        setFlightForm((prev) => ({
          ...prev,
          airline_id: prev.airline_id || alRes[0].id,
          origin_airport_id: prev.origin_airport_id || apRes[0].id,
          destination_airport_id: prev.destination_airport_id || apRes[1].id,
        }));
      }
    } catch {
      showFeedback('danger', 'Failed to load flight schedule or airport catalog.');
    } finally {
      setIsFlightsLoading(false);
    }
  };

  // Fetch Audit Logs
  const loadAuditLogs = async () => {
    setIsAuditLoading(true);
    try {
      const data = await adminService.getAuditLogs(50);
      setAuditLogs(data);
    } catch {
      showFeedback('danger', 'Failed to load system audit trail.');
    } finally {
      setIsAuditLoading(false);
    }
  };

  // Fetch AeroAPI Status
  const loadAeroStatus = async () => {
    setIsAeroLoading(true);
    try {
      const statusData = await aeroApiService.getStatus();
      setAeroStatus(statusData);
    } catch {
      showFeedback('danger', 'Failed to retrieve AeroAPI status.');
    } finally {
      setIsAeroLoading(false);
    }
  };

  const handleSaveAeroKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aeroKeyInput.trim()) return;
    setIsAeroSaving(true);
    try {
      const res = await aeroApiService.configureKey(aeroKeyInput.trim());
      setAeroStatus(res);
      setAeroKeyInput('');
      showFeedback('success', `AeroAPI key updated! Status: ${res.status}`);
    } catch {
      showFeedback('danger', 'Failed to update AeroAPI key.');
    } finally {
      setIsAeroSaving(false);
    }
  };

  const handleAdminLiveSync = async () => {
    setIsAeroSyncing(true);
    try {
      const res = await aeroApiService.triggerAdminSync(aeroSyncHub || undefined, aeroSyncLimit);
      showFeedback('success', res.message);
      await loadAeroStatus();
      await loadFlightsAndFleet();
    } catch {
      showFeedback('danger', 'Failed to execute live sync from AeroAPI.');
    } finally {
      setIsAeroSyncing(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    else if (activeTab === 'flights' || activeTab === 'fleet') loadFlightsAndFleet();
    else if (activeTab === 'audit') loadAuditLogs();
    else if (activeTab === 'aeroapi') loadAeroStatus();
  }, [activeTab]);

  const showFeedback = (type: 'success' | 'danger', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // User Actions
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const updated = await adminService.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      showFeedback('success', `User role updated to ${newRole}.`);
    } catch {
      showFeedback('danger', 'Failed to update user role.');
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      const updated = await adminService.updateUserStatus(userId, !currentStatus);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      showFeedback('success', `User account ${!currentStatus ? 'activated' : 'deactivated'}.`);
    } catch {
      showFeedback('danger', 'Failed to toggle user status.');
    }
  };

  // Add Flight Submit
  const handleCreateFlightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightForm.flight_number || !flightForm.scheduled_departure || !flightForm.scheduled_arrival) {
      showFeedback('danger', 'Please complete all required flight schedule fields.');
      return;
    }

    try {
      await adminService.createFlight({
        ...flightForm,
        // Default aircraft id if not selected
        aircraft_id: flightForm.aircraft_id || (airlines[0] ? airlines[0].id : ''),
        scheduled_departure: new Date(flightForm.scheduled_departure).toISOString(),
        scheduled_arrival: new Date(flightForm.scheduled_arrival).toISOString(),
      });
      showFeedback('success', `Flight ${flightForm.flight_number} created with initial ML delay evaluation!`);
      setIsAddFlightOpen(false);
      loadFlightsAndFleet();
    } catch {
      showFeedback('danger', 'Failed to create flight. Check aircraft/airline inputs.');
    }
  };

  // Add Airport Submit
  const handleCreateAirportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!airportForm.code || !airportForm.name || !airportForm.city) return;
    try {
      await adminService.createAirport(airportForm);
      showFeedback('success', `Airport hub ${airportForm.code.toUpperCase()} registered!`);
      setAirportForm({ code: '', name: '', city: '', country: 'India', timezone: 'Asia/Kolkata' });
      loadFlightsAndFleet();
    } catch {
      showFeedback('danger', 'Failed to register airport.');
    }
  };

  // Add Airline Submit
  const handleCreateAirlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!airlineForm.code || !airlineForm.name) return;
    try {
      await adminService.createAirline(airlineForm);
      showFeedback('success', `Airline carrier ${airlineForm.code.toUpperCase()} registered!`);
      setAirlineForm({ code: '', name: '', country: 'India' });
      loadFlightsAndFleet();
    } catch {
      showFeedback('danger', 'Failed to register airline carrier.');
    }
  };

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border rounded-xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-content-primary">System Administration Portal</h1>
            <Badge variant="high">ADMIN PRIVILEGES</Badge>
          </div>
          <p className="text-xs text-content-muted">
            Manage user roles, create flight schedules, configure fleet infrastructure, and review security audit trails.
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex flex-wrap gap-2 bg-surface-subtle p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab('users')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'users' ? 'bg-brand text-white shadow-xs' : 'text-content-muted hover:text-content-primary'
            }`}
          >
            <Users className="w-4 h-4" /> Users & Roles
          </button>
          <button
            onClick={() => setActiveTab('flights')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'flights' ? 'bg-brand text-white shadow-xs' : 'text-content-muted hover:text-content-primary'
            }`}
          >
            <Plane className="w-4 h-4" /> Flight Schedule
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'fleet' ? 'bg-brand text-white shadow-xs' : 'text-content-muted hover:text-content-primary'
            }`}
          >
            <Building2 className="w-4 h-4" /> Fleet & Hubs
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'audit' ? 'bg-brand text-white shadow-xs' : 'text-content-muted hover:text-content-primary'
            }`}
          >
            <FileText className="w-4 h-4" /> Audit Logs
          </button>
          <button
            onClick={() => setActiveTab('aeroapi')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'aeroapi' ? 'bg-brand text-white shadow-xs' : 'text-content-muted hover:text-content-primary'
            }`}
          >
            <Radio className="w-4 h-4" /> AeroAPI Live Feed
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-semantic-success-soft text-semantic-success border-semantic-success/30'
              : 'bg-semantic-danger-soft text-semantic-danger border-semantic-danger/30'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {feedback.message}
        </div>
      )}

      {/* TAB 1: USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="bg-surface border border-border rounded-xl shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <h2 className="text-lg font-bold text-content-primary">System Users & Role Matrix</h2>
              <p className="text-xs text-content-muted">Assign privileges (PASSENGER, OPERATIONS_AGENT, ADMIN) and modify account active status.</p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-content-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                className="w-full pl-9 pr-4 py-2 bg-surface-subtle border border-border rounded-lg text-xs font-medium text-content-primary focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border text-content-muted font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Role Assignment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isUsersLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-content-muted">Loading user database...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-content-muted">No matching users found.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-subtle/50">
                      <td className="py-3.5 px-4 font-bold text-content-primary">
                        {u.first_name} {u.last_name}
                      </td>
                      <td className="py-3.5 px-4 text-content-secondary font-mono">{u.email}</td>
                      <td className="py-3.5 px-4">
                        {u.is_active ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-semantic-success-soft text-semantic-success border border-semantic-success/20">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-semantic-danger-soft text-semantic-danger border border-semantic-danger/20">
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={u.role_name}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-surface-subtle border border-border rounded px-2.5 py-1 text-xs font-bold text-content-primary focus:outline-none focus:border-brand"
                        >
                          <option value="PASSENGER">PASSENGER</option>
                          <option value="OPERATIONS_AGENT">OPERATIONS_AGENT</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant={u.is_active ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => handleStatusToggle(u.id, u.is_active)}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FLIGHT SCHEDULE MANAGEMENT */}
      {activeTab === 'flights' && (
        <div className="bg-surface border border-border rounded-xl shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <h2 className="text-lg font-bold text-content-primary">Flight Schedule Management</h2>
              <p className="text-xs text-content-muted">Create new flight routes. System automatically initializes XGBoost delay prediction models upon creation.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setIsAddFlightOpen(true)} className="font-bold">
              <Plus className="w-4 h-4 mr-1.5" /> Add Scheduled Flight
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border text-content-muted font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Carrier & Flight #</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Departure & Arrival</th>
                  <th className="py-3 px-4">Base Fare</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">ML Initial Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isFlightsLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-content-muted">Loading active flight schedule...</td>
                  </tr>
                ) : flights.map((f) => (
                  <tr key={f.id} className="hover:bg-surface-subtle/50">
                    <td className="py-3.5 px-4 font-bold text-content-primary">
                      {f.airline.code} {f.flight_number} ({f.airline.name})
                    </td>
                    <td className="py-3.5 px-4 font-bold text-content-primary">
                      {f.origin.code} &rarr; {f.destination.code}
                    </td>
                    <td className="py-3.5 px-4 text-content-secondary">
                      {formatDateTime(f.scheduled_departure)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-content-primary">
                      ₹{f.base_price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-semantic-success font-semibold">
                      {f.available_seats} remaining
                    </td>
                    <td className="py-3.5 px-4">
                      {f.delay_prediction ? (
                        <span className="font-bold text-content-primary">
                          {f.delay_prediction.risk_level} ({Math.round(f.delay_prediction.delay_probability * 100)}%)
                        </span>
                      ) : (
                        <span className="text-content-muted">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FLEET & HUB OPERATIONS */}
      {activeTab === 'fleet' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Airport Hub */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-content-primary flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand" /> Register Airport Hub
            </h3>
            <form onSubmit={handleCreateAirportSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-content-muted mb-1">IATA Code (3 letters)</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    placeholder="e.g. PNQ"
                    value={airportForm.code}
                    onChange={(e) => setAirportForm({ ...airportForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-content-primary font-bold focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-content-muted mb-1">City Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune"
                    value={airportForm.city}
                    onChange={(e) => setAirportForm({ ...airportForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-content-primary font-medium focus:outline-none focus:border-brand"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-content-muted mb-1">Full Airport Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune International Airport"
                  value={airportForm.name}
                  onChange={(e) => setAirportForm({ ...airportForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-content-primary font-medium focus:outline-none focus:border-brand"
                />
              </div>
              <Button type="submit" variant="primary" size="sm" className="w-full font-bold">
                Register Airport
              </Button>
            </form>
          </div>

          {/* Add Airline Carrier */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-content-primary flex items-center gap-2">
              <Plane className="w-5 h-5 text-brand" /> Register Airline Carrier
            </h3>
            <form onSubmit={handleCreateAirlineSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-content-muted mb-1">Carrier Code (2 letters)</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    placeholder="e.g. QP"
                    value={airlineForm.code}
                    onChange={(e) => setAirlineForm({ ...airlineForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-content-primary font-bold focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-content-muted mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={airlineForm.country}
                    onChange={(e) => setAirlineForm({ ...airlineForm, country: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-content-primary font-medium focus:outline-none focus:border-brand"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-content-muted mb-1">Airline Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Akasa Air"
                  value={airlineForm.name}
                  onChange={(e) => setAirlineForm({ ...airlineForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-content-primary font-medium focus:outline-none focus:border-brand"
                />
              </div>
              <Button type="submit" variant="primary" size="sm" className="w-full font-bold">
                Register Airline
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-surface border border-border rounded-xl shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h2 className="text-lg font-bold text-content-primary">System Audit Trail</h2>
              <p className="text-xs text-content-muted">Immutable log of security events, administrative updates, and resource mutations.</p>
            </div>
          </div>

          <div className="space-y-3">
            {isAuditLoading ? (
              <div className="py-8 text-center text-xs text-content-muted">Loading audit log entries...</div>
            ) : auditLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-content-muted">No security audit logs recorded yet.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="bg-surface-subtle border border-border rounded-lg p-4 text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-brand-soft text-brand text-[11px]">
                        {log.action}
                      </span>
                      <span className="font-semibold text-content-primary">
                        {log.resource} {log.resource_id ? `(${log.resource_id.substring(0, 8)}...)` : ''}
                      </span>
                    </div>
                    <div className="text-[11px] text-content-muted flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {formatDateTime(log.created_at)} • IP: {log.ip_address || '127.0.0.1'}
                    </div>
                  </div>
                  <div className="text-[11px] text-content-secondary">
                    Actor: <strong className="text-content-primary">{log.user_email || 'System'}</strong>
                  </div>
                  {log.details_json && (
                    <pre className="bg-surface p-2 rounded border border-border text-[11px] font-mono text-content-muted overflow-x-auto">
                      {log.details_json}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: AeroAPI Integration & Live Feed */}
      {activeTab === 'aeroapi' && (
        <div className="space-y-6">
          {/* Status & Diagnostics Card */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-content-primary">FlightAware AeroAPI (v4) Status</h2>
                  {aeroStatus?.status === 'CONNECTED' ? (
                    <Badge variant="low">CONNECTED & ACTIVE</Badge>
                  ) : aeroStatus?.status === 'UNCONFIGURED' ? (
                    <Badge variant="medium">SIMULATED FALLBACK ACTIVE</Badge>
                  ) : (
                    <Badge variant="critical">{aeroStatus?.status || 'INITIALIZING'}</Badge>
                  )}
                </div>
                <p className="text-xs text-content-muted mt-1">
                  Connects FlightGuard AI directly to FlightAware worldwide flight radar and schedule databases.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={loadAeroStatus}
                isLoading={isAeroLoading}
                className="font-bold text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isAeroLoading ? 'animate-spin' : ''}`} />
                Test Connection
              </Button>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-surface-subtle border border-border">
                <div className="text-xs font-semibold text-content-muted mb-1">Active API Key</div>
                <div className="font-mono text-sm font-bold text-content-primary truncate">
                  {aeroStatus?.masked_key || 'None (Using High-Fidelity Simulator)'}
                </div>
                <div className="text-[11px] text-content-muted mt-1">
                  {aeroStatus?.is_configured ? 'Key loaded from environment / admin config' : 'Fallback simulation active'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-subtle border border-border">
                <div className="text-xs font-semibold text-content-muted mb-1">AeroAPI Endpoint</div>
                <div className="font-mono text-xs font-bold text-brand truncate">
                  {aeroStatus?.base_url || 'https://aeroapi.flightaware.com/aeroapi'}
                </div>
                <div className="text-[11px] text-content-muted mt-1">API Protocol: REST v4 JSON</div>
              </div>

              <div className="p-4 rounded-xl bg-surface-subtle border border-border">
                <div className="text-xs font-semibold text-content-muted mb-1">Database Flights Tracked</div>
                <div className="text-2xl font-black text-content-primary">
                  {aeroStatus?.total_flights_in_db ?? flights.length}
                </div>
                <div className="text-[11px] text-semantic-success font-medium">Scored with XGBoost AI Model</div>
              </div>
            </div>

            {aeroStatus?.message && (
              <div className="p-3 bg-cream-soft border border-cream-border rounded-lg text-xs text-secondary-hover font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand shrink-0" />
                <span>{aeroStatus.message}</span>
              </div>
            )}
          </div>

          {/* Update API Key Card & Trigger Live Ingestion */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configure Key Form */}
            <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Key className="w-4 h-4 text-brand" />
                <h3 className="text-sm font-bold text-content-primary">Configure AeroAPI Key</h3>
              </div>
              <p className="text-xs text-content-muted">
                Enter your FlightAware AeroAPI personal or enterprise key. It will be validated against AeroAPI immediately and securely saved.
              </p>

              <form onSubmit={handleSaveAeroKey} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-content-muted mb-1">AeroAPI Key</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter AeroAPI key"
                    value={aeroKeyInput}
                    onChange={(e) => setAeroKeyInput(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-content-primary font-mono text-xs focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="flex justify-end">
                  <Button variant="primary" size="sm" type="submit" isLoading={isAeroSaving} className="font-bold">
                    Validate & Save Key
                  </Button>
                </div>
              </form>
            </div>

            {/* Live Ingestion Trigger */}
            <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Radio className="w-4 h-4 text-brand" />
                <h3 className="text-sm font-bold text-content-primary">Sync Live Hub Departures</h3>
              </div>
              <p className="text-xs text-content-muted">
                Pull real-time departures from AeroAPI (or realistic live radar) and automatically evaluate delay probabilities with FlightGuard's ML pipeline.
              </p>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-content-muted mb-1">Airport Hub</label>
                    <select
                      value={aeroSyncHub}
                      onChange={(e) => setAeroSyncHub(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-content-primary font-medium focus:outline-none focus:border-brand"
                    >
                      <option value="">All Major Hubs (BLR, DEL, BOM, HYD)</option>
                      <option value="BLR">BLR — Bengaluru</option>
                      <option value="DEL">DEL — Delhi</option>
                      <option value="BOM">BOM — Mumbai</option>
                      <option value="HYD">HYD — Hyderabad</option>
                      <option value="CCU">CCU — Kolkata</option>
                      <option value="MAA">MAA — Chennai</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-content-muted mb-1">Max Flights per Hub</label>
                    <select
                      value={aeroSyncLimit}
                      onChange={(e) => setAeroSyncLimit(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-content-primary font-medium focus:outline-none focus:border-brand"
                    >
                      <option value={5}>5 Departures</option>
                      <option value={10}>10 Departures</option>
                      <option value={20}>20 Departures</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAdminLiveSync}
                    isLoading={isAeroSyncing}
                    className="font-bold"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isAeroSyncing ? 'animate-spin' : ''}`} />
                    Sync Live Data Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Scheduled Flight */}
      {isAddFlightOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-content-primary">Create New Scheduled Flight</h3>
              <button onClick={() => setIsAddFlightOpen(false)} className="text-content-muted hover:text-content-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFlightSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-content-muted mb-1">Airline Carrier</label>
                  <select
                    value={flightForm.airline_id}
                    onChange={(e) => setFlightForm({ ...flightForm, airline_id: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-content-primary font-medium focus:outline-none focus:border-brand"
                  >
                    {airlines.map((al) => (
                      <option key={al.id} value={al.id}>{al.name} ({al.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-content-muted mb-1">Flight Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI-505"
                    value={flightForm.flight_number}
                    onChange={(e) => setFlightForm({ ...flightForm, flight_number: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-content-primary font-bold focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-content-muted mb-1">Origin Airport</label>
                  <select
                    value={flightForm.origin_airport_id}
                    onChange={(e) => setFlightForm({ ...flightForm, origin_airport_id: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-content-primary font-medium focus:outline-none focus:border-brand"
                  >
                    {airports.map((ap) => (
                      <option key={ap.id} value={ap.id}>{ap.code} - {ap.city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-content-muted mb-1">Destination Airport</label>
                  <select
                    value={flightForm.destination_airport_id}
                    onChange={(e) => setFlightForm({ ...flightForm, destination_airport_id: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-content-primary font-medium focus:outline-none focus:border-brand"
                  >
                    {airports.map((ap) => (
                      <option key={ap.id} value={ap.id}>{ap.code} - {ap.city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-content-muted mb-1">Departure Datetime</label>
                  <input
                    type="datetime-local"
                    required
                    value={flightForm.scheduled_departure}
                    onChange={(e) => setFlightForm({ ...flightForm, scheduled_departure: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-content-primary font-medium focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-content-muted mb-1">Arrival Datetime</label>
                  <input
                    type="datetime-local"
                    required
                    value={flightForm.scheduled_arrival}
                    onChange={(e) => setFlightForm({ ...flightForm, scheduled_arrival: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-content-primary font-medium focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-content-muted mb-1">Base Price (₹)</label>
                <input
                  type="number"
                  required
                  min={500}
                  value={flightForm.base_price}
                  onChange={(e) => setFlightForm({ ...flightForm, base_price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-surface-subtle border border-border rounded-lg text-content-primary font-bold focus:outline-none focus:border-brand"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3 border-t border-border">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsAddFlightOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" className="font-bold">
                  Create Flight & Trigger ML
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
