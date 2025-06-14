import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface TaskFormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
}

const GlassPaper = styled(Paper)(() => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '15px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '2rem',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  color: 'white',
}));

const StyledTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiSelect-icon': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
}));

const StyledButton = styled(Button)(() => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(5px)',
  borderRadius: '10px',
  padding: '8px 20px',
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
  },
}));

export default function TaskForm() {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [prediction, setPrediction] = useState<{ task_type: string; confidence: number; suggested_actions: string[] } | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchTask = async () => {
    setFetching(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:4000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const task = response.data;
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      setError('Failed to fetch task');
      console.error('Error fetching task:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (id) {
        await axios.put(`http://localhost:4000/api/tasks/${id}`, formData, { headers });
      } else {
        await axios.post('http://localhost:4000/api/tasks', formData, { headers });
      }

      navigate('/tasks');
    } catch (err) {
      setError('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDescriptionChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setFormData(prev => ({ ...prev, description: newDescription }));

    if (newDescription.length > 10) {
      try {
        const response = await axios.post('http://localhost:5001/predict', {
          description: newDescription
        });
        setPrediction(response.data);
      } catch (err) {
        console.error('Failed to get AI prediction:', err);
      }
    }
  };

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
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ color: 'white', mb: 4, fontWeight: 'bold' }}>
          {id ? 'Edit Task' : 'Create New Task'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {fetching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        ) : (
          <>
            {prediction && (
              <GlassPaper sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                  AI Suggestions
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                  Task Type: {prediction.task_type} (Confidence: {Math.round(prediction.confidence * 100)}%)
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 'bold', mb: 1 }}>
                  Suggested Actions:
                </Typography>
                <Stack spacing={1}>
                  {prediction.suggested_actions.map((action, index) => (
                    <Typography key={index} sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      • {action}
                    </Typography>
                  ))}
                </Stack>
              </GlassPaper>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <GlassPaper>
                <Stack spacing={3}>
                  <StyledTextField
                    label="Title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    fullWidth
                  />

                  <StyledTextField
                    label="Description"
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    multiline
                    rows={4}
                    required
                    fullWidth
                  />

                  <StyledTextField
                    select
                    label="Status"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    fullWidth
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </StyledTextField>

                  <StyledTextField
                    select
                    label="Priority"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    fullWidth
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </StyledTextField>

                  <StyledTextField
                    label="Due Date"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    required
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <StyledButton
                      type="button"
                      onClick={() => navigate('/tasks')}
                    >
                      Cancel
                    </StyledButton>
                    <StyledButton
                      type="submit"
                      disabled={loading}
                      sx={{
                        backgroundColor: 'rgba(25, 118, 210, 0.5)',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.7)',
                        },
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        id ? 'Update Task' : 'Create Task'
                      )}
                    </StyledButton>
                  </Box>
                </Stack>
              </GlassPaper>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
} 