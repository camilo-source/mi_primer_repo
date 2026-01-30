import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import SearchNew from './pages/SearchNew';
import SearchDetail from './pages/SearchDetail';
import CalendarPage from './pages/CalendarPage';
import BookingPage from './pages/BookingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Public Booking Page (Calendly-style) */}
        <Route path="/book/:token" element={<BookingPage />} />

        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search/new" element={<SearchNew />} />
          <Route path="/search/:id" element={<SearchDetail />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
