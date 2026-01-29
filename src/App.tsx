import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import SearchDetail from './pages/SearchDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search/:id" element={<SearchDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
