import { Request, Response } from 'express';
import { Task } from '../models/Task';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

interface AIResponse {
  task_type: string;
  confidence: number;
  suggested_actions: string[];
}

async function getAIPrediction(description: string): Promise<AIResponse | null> {
  try {
    console.log(`[TaskController] Sending task description to AI service: ${description.substring(0, 50)}...`);
    const response = await axios.post(`${AI_SERVICE_URL}/predict`, {
      description: description,
      metadata: {}
    });
    console.log('[TaskController] AI service response:', response.data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('[TaskController] Error calling AI service:', error.message);
      if (error.response) {
        console.error('[TaskController] AI service responded with status:', error.response.status);
        console.error('[TaskController] AI service response data:', error.response.data);
      }
    } else {
      console.error('[TaskController] Unexpected error calling AI service:', error);
    }
    return null;
  }
}

export const createTask = async (req: Request, res: Response) => {
  try {
    console.log(`[TaskController] Creating new task for user: ${req.user.id}`);
    const taskData = { ...req.body, user: req.user.id };

    if (taskData.description) {
      const aiPrediction = await getAIPrediction(taskData.description);
      if (aiPrediction) {
        taskData.ai_task_type = aiPrediction.task_type;
        taskData.ai_confidence = aiPrediction.confidence;
        taskData.ai_suggested_actions = aiPrediction.suggested_actions;
      }
    }

    const task = new Task(taskData);
    await task.save();
    console.log(`[TaskController] Task created successfully: ${task._id}`);
    res.status(201).json(task);
  } catch (error: unknown) {
    console.error('[TaskController] Error creating task:', error);
    res.status(400).json({ message: 'Error creating task' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    console.log(`[TaskController] Updating task ${req.params.id} for user: ${req.user.id}`);
    const taskData = req.body;

    if (taskData.description) {
      const aiPrediction = await getAIPrediction(taskData.description);
      if (aiPrediction) {
        taskData.ai_task_type = aiPrediction.task_type;
        taskData.ai_confidence = aiPrediction.confidence;
        taskData.ai_suggested_actions = aiPrediction.suggested_actions;
      }
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      taskData,
      { new: true }
    );
    if (!task) {
      console.log(`[TaskController] Task not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Task not found' });
    }
    console.log(`[TaskController] Task updated successfully: ${task._id}`);
    res.json(task);
  } catch (error: unknown) {
    console.error('[TaskController] Error updating task:', error);
    res.status(400).json({ message: 'Error updating task' });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    console.log(`[TaskController] Fetching tasks for user: ${req.user.id}`);
    const tasks = await Task.find({ user: req.user.id });
    console.log(`[TaskController] Found ${tasks.length} tasks`);
    res.json(tasks);
  } catch (error: unknown) {
    console.error('[TaskController] Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    console.log(`[TaskController] Fetching task ${req.params.id} for user: ${req.user.id}`);
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      console.log(`[TaskController] Task not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Task not found' });
    }
    console.log(`[TaskController] Task found: ${task._id}`);
    res.json(task);
  } catch (error: unknown) {
    console.error('[TaskController] Error fetching task:', error);
    res.status(500).json({ message: 'Error fetching task' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    console.log(`[TaskController] Deleting task ${req.params.id} for user: ${req.user.id}`);
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    if (!task) {
      console.log(`[TaskController] Task not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Task not found' });
    }
    console.log(`[TaskController] Task deleted successfully: ${req.params.id}`);
    res.json({ message: 'Task deleted successfully' });
  } catch (error: unknown) {
    console.error('[TaskController] Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
}; 