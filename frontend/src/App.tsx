import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import TaskForm from './pages/TaskForm';
import Navbar from './components/Navbar';
import { Box } from '@mui/material';

// This comment is to trigger a re-evaluation for module resolution.

function App() {
  return (
    <AuthProvider>
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <Box sx={{ flexGrow: 1, px: { xs: 2, sm: 3, md: 4 }, py: 4, bgcolor: 'background.default' }}>
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                </Box>
              }
            />
            <Route
              path="/tasks"
              element={
                <Box sx={{ flexGrow: 1, px: { xs: 2, sm: 3, md: 4 }, py: 4, bgcolor: 'background.default' }}>
                  <PrivateRoute>
                    <TaskList />
                  </PrivateRoute>
                </Box>
              }
            />
            <Route
              path="/tasks/new"
              element={
                <Box sx={{ flexGrow: 1, px: { xs: 2, sm: 3, md: 4 }, py: 4, bgcolor: 'background.default' }}>
                  <PrivateRoute>
                    <TaskForm />
                  </PrivateRoute>
                </Box>
              }
            />
            <Route
              path="/tasks/:id/edit"
              element={
                <Box sx={{ flexGrow: 1, px: { xs: 2, sm: 3, md: 4 }, py: 4, bgcolor: 'background.default' }}>
                  <PrivateRoute>
                    <TaskForm />
                  </PrivateRoute>
                </Box>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Box>
      </Router>
    </AuthProvider>
  );
}

export default App;
