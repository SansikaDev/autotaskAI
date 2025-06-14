import express from 'express';
import { auth } from '../middleware/auth';
import { createTask, getTasks, getTaskById, updateTask, deleteTask } from '../controllers/taskController';

const router = express.Router();

// Get all tasks for the authenticated user
router.get('/', auth, getTasks);

// Get a single task by ID
router.get('/:id', auth, getTaskById);

// Create a new task
router.post('/', auth, createTask);

// Update a task
router.put('/:id', auth, updateTask);

// Delete a task
router.delete('/:id', auth, deleteTask);

export const taskRoutes = router; 