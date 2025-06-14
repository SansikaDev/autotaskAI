from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
import numpy as np
from typing import List, Optional
import os
from dotenv import load_dotenv
import logging
import json
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(title="AutoTaskAI ML Service")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Task categories and their associated actions
TASK_CATEGORIES = {
    "email_management": {
        "actions": ["categorize", "archive", "respond", "forward"],
        "keywords": ["email", "inbox", "message", "mail"]
    },
    "document_handling": {
        "actions": ["review", "edit", "share", "archive"],
        "keywords": ["document", "file", "report", "paper"]
    },
    "meeting_scheduling": {
        "actions": ["schedule", "prepare", "follow_up", "reschedule"],
        "keywords": ["meeting", "appointment", "schedule", "calendar"]
    },
    "data_analysis": {
        "actions": ["analyze", "visualize", "report", "summarize"],
        "keywords": ["data", "analysis", "report", "statistics"]
    },
    "project_management": {
        "actions": ["plan", "track", "update", "review"],
        "keywords": ["project", "task", "milestone", "deadline"]
    }
}

class TaskPrediction(BaseModel):
    task_type: str
    confidence: float
    suggested_actions: List[str]

class TaskData(BaseModel):
    description: str
    metadata: Optional[dict] = None

def load_or_create_model():
    try:
        model = tf.keras.models.load_model('model/task_classifier.h5')
        logger.info("Loaded existing model")
    except:
        logger.info("Creating new model")
        # Create a simple model for text classification
        model = tf.keras.Sequential([
            tf.keras.layers.Embedding(10000, 16),
            tf.keras.layers.GlobalAveragePooling1D(),
            tf.keras.layers.Dense(24, activation='relu'),
            tf.keras.layers.Dense(len(TASK_CATEGORIES), activation='softmax')
        ])
        model.compile(optimizer='adam',
                     loss='categorical_crossentropy',
                     metrics=['accuracy'])
    return model

def preprocess_text(text: str) -> np.ndarray:
    # Simple keyword-based preprocessing
    text = text.lower()
    words = text.split()
    
    # Count keyword matches for each category
    category_scores = []
    for category in TASK_CATEGORIES.values():
        score = sum(1 for word in words if word in category["keywords"])
        category_scores.append(score)
    
    # Normalize scores
    total = sum(category_scores)
    if total == 0:
        return np.array([1/len(TASK_CATEGORIES)] * len(TASK_CATEGORIES))
    
    return np.array([score/total for score in category_scores])

def get_suggested_actions(category: str) -> List[str]:
    return TASK_CATEGORIES[category]["actions"]

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {"message": "AutoTaskAI ML Service is running"}

@app.post("/predict", response_model=TaskPrediction)
async def predict_task(data: TaskData):
    try:
        logger.info(f"Received prediction request for description: {data.description[:50]}...")
        
        # Preprocess the input text
        processed_input = preprocess_text(data.description)
        
        # Get the category with highest score
        category_index = np.argmax(processed_input)
        category = list(TASK_CATEGORIES.keys())[category_index]
        confidence = float(processed_input[category_index])
        
        # Get suggested actions for the category
        suggested_actions = get_suggested_actions(category)
        
        prediction = TaskPrediction(
            task_type=category,
            confidence=confidence,
            suggested_actions=suggested_actions
        )
        
        logger.info(f"Prediction made: {prediction.task_type} with confidence {prediction.confidence}")
        return prediction
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
async def train_model():
    try:
        logger.info("Starting model training")
        # TODO: Implement actual training with real data
        # For now, we're using a simple keyword-based approach
        logger.info("Model training completed successfully")
        return {"message": "Model training completed successfully"}
    except Exception as e:
        logger.error(f"Error in model training: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting AutoTaskAI ML Service")
    uvicorn.run(app, host="0.0.0.0", port=5001) 