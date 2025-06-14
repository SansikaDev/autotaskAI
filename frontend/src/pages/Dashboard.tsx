import { useState, useEffect } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Chip,
  type ButtonProps,
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '15px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: theme.spacing(3),
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  color: 'white',
}));

const StyledButton = styled(Button)<ButtonProps & LinkProps>(() => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(5px)',
  borderRadius: '10px',
  padding: '10px 20px',
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
  },
}));

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChipColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return { backgroundColor: '#4caf50', color: 'white' }; // Green
      case 'in_progress':
        return { backgroundColor: '#ffc107', color: 'rgba(0,0,0,0.87)' }; // Yellow
      case 'pending':
      default:
        return { backgroundColor: '#9e9e9e', color: 'white' }; // Grey
    }
  };

  const getPriorityChipColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return { backgroundColor: '#f44336', color: 'white' }; // Red
      case 'medium':
        return { backgroundColor: '#ffc107', color: 'rgba(0,0,0,0.87)' }; // Yellow
      case 'low':
      default:
        return { backgroundColor: '#2196f3', color: 'white' }; // Blue
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)', // Assuming Navbar height is 64px
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
        }}
      >
        <CircularProgress color="primary" />
        <Typography variant="h6" sx={{ ml: 2, color: 'white' }}>
          Loading tasks...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)', // Assuming Navbar height is 64px
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
        padding: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
            Welcome, {user?.name || 'User'}!
          </Typography>
          <StyledButton component={Link} to="/tasks/new" variant="contained">
            Create New Task
          </StyledButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4, width: '100%' }}>
            {error}
          </Alert>
        )}

        {tasks.length === 0 ? (
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              mt: 4,
            }}
          >
            You have no tasks yet. Create one to get started!
          </Typography>
        ) : (
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={4}>
              {tasks.map((task) => (
                <Grid 
                  key={task._id}
                  sx={{
                    width: {
                      xs: '100%',
                      sm: 'calc(50% - 32px)',
                      md: 'calc(33.33% - 32px)'
                    }
                  }}
                >
                  <GlassPaper>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {task.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.8)' }}
                    >
                      {task.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        Status:
                      </Typography>
                      <Chip
                        label={task.status.replace(/_/g, ' ').toUpperCase()}
                        sx={getStatusChipColor(task.status)}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        Priority:
                      </Typography>
                      <Chip
                        label={task.priority.toUpperCase()}
                        sx={getPriorityChipColor(task.priority)}
                        size="small"
                      />
                    </Box>
                    {task.dueDate && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          Due Date:
                        </Typography>
                        <Typography component="span" sx={{ fontWeight: 'bold' }}>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </GlassPaper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
}