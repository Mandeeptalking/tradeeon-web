import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import SigninPage from './pages/SigninPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ConnectionsPage from './pages/ConnectionsPage';
import PortfolioPage from './pages/PortfolioPage';
import BotsPage from './pages/BotsPage';
import ActivityPage from './pages/ActivityPage';
import SettingsPage from './pages/SettingsPage';
import NewBotPage from './pages/NewBotPage';
import CreateBotWizard from './pages/CreateBotWizard';
import LiveChartWorkspace from './pages/workspace/LiveChartWorkspace';
import LiveChartsPage from './pages/LiveChartsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="connections" element={<ConnectionsPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="bots" element={<BotsPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/dashboard/bots/new" element={<NewBotPage />} />
        <Route path="/dashboard/bots/wizard" element={<CreateBotWizard />} />
        <Route path="/dashboard/bots/workspace" element={<LiveChartWorkspace />} />
        <Route path="/live-charts" element={<LiveChartsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;