import { useState, useEffect } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Chip,
  type ButtonProps
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';

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

const StyledTableCell = styled(TableCell)(() => ({
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  color: 'white',
  fontWeight: 'bold',
  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
}));

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:4000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
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
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
        }}
      >
        <CircularProgress color="primary" />
        <Typography variant="h6" sx={{ ml: 2, color: 'white' }}>Loading tasks...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
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
            My Tasks
          </Typography>
          <StyledButton
            component={Link}
            to="/tasks/new"
            variant="contained"
          >
            Create New Task
          </StyledButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4, width: '100%' }}>
            {error}
          </Alert>
        )}

        {tasks.length === 0 ? (
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', mt: 4 }}>
            You have no tasks yet. Create one to get started!
          </Typography>
        ) : (
          <TableContainer component={GlassPaper}>
            <Table sx={{ minWidth: 650 }} aria-label="task table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Title</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell>Priority</StyledTableCell>
                  <StyledTableCell>Due Date</StyledTableCell>
                  <StyledTableCell>Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow
                    key={task._id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell sx={{ color: 'white' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{task.title}</Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>{task.description}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.status.replace(/_/g, ' ').toUpperCase()}
                        sx={getStatusChipColor(task.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.priority.toUpperCase()}
                        sx={getPriorityChipColor(task.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Button
                        component={Link}
                        to={`/tasks/${task._id}/edit`}
                        size="small"
                        sx={{ color: '#90caf9', mr: 1 }} // Primary color
                      >
                        Edit
                      </Button>
                      <IconButton
                        aria-label="delete"
                        size="small"
                        onClick={() => handleDelete(task._id)}
                        sx={{ color: '#f44336' }} // Red color
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
} 