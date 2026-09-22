import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import { Footer } from './components/layout/Footer';
import { LandingPage } from './features/landing/LandingPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppShell: React.FC = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-content-primary">
      {/* Show standard app Navbar on non-landing routes (LandingPage has its own dedicated LandingNavbar) */}
      {!isLanding && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
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

      {/* Show standard Footer on non-landing routes (LandingPage includes Footer) */}
      {!isLanding && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppShell />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
