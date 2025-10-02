import uuid
import random
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

# --- 1. Simulated Database and State ---
# This dictionary simulates a database table storing tasks.
# Key: task_id (str)
# Value: Task details (Dict)
TASKS_DB: Dict[str, Dict[str, Any]] = {}

# --- 2. Simulated LLM/Scoring Module ---
# This function simulates the logic that calculates the urgency score
# based on the input text. In a real app, this might involve an ML model
# or an API call to determine priority.
def calculate_urgency_score(text: str) -> int:
    """
    Simulates calculating an urgency score (0-100) based on task text.
    For this example, we generate a random score.
    """
    # Simple logic: tasks mentioning 'urgent' get a higher base score
    if "urgent" in text.lower() or "now" in text.lower():
        return random.randint(80, 100)
    return random.randint(30, 79)


# --- 3. Step 5.5: Frontend Input Structure (Pydantic Model) ---
class UserInput(BaseModel):
    """
    Defines the expected structure of the incoming JSON payload from the user.
    """
    # The client must send a JSON object with a key 'text' containing a string.
    text: str


# --- 4. FastAPI Setup ---
app = FastAPI(title="Task Management API")


# --- 5. Step 5.6: Finalize Task Insertion Endpoint ---
@app.post(
    "/new_task_from_text",
    response_model=None, # We'll return a custom dict for simplicity
    summary="Create a new task from raw text and calculate its urgency score"
)
def new_task_from_text(input_data: UserInput):
    """
    Receives raw task text, calculates the urgency score, saves the task,
    and returns the generated unique task ID.
    """
    task_text = input_data.text

    # 1. Calculate the Urgency Score (Simulation)
    urgency_score = calculate_urgency_score(task_text)

    # 2. Generate a unique ID (Simulated DB ID Generation)
    task_id = str(uuid.uuid4())

    # 3. Store the task in the simulated database
    new_task = {
        "text": task_text,
        "urgency_score": urgency_score,
        "status": "pending"
    }
    TASKS_DB[task_id] = new_task

    # 4. Return the task_id (CRITICAL requirement for Tasbiya's module)
    # This fulfills the requirement of Step 5.6.
    print(f"--- DB INSERTION LOG ---")
    print(f"Task ID: {task_id}, Score: {urgency_score}")
    print(f"------------------------")

    return {
        "message": "Task successfully created and scored.",
        "task_id": task_id
    }


# Helper endpoint to check the contents of the simulated database
@app.get("/tasks", summary="View all tasks in the simulated database")
def get_all_tasks():
    """For testing purposes: displays the current state of the TASKS_DB."""
    return {"total_tasks": len(TASKS_DB), "tasks": TASKS_DB}

# Instructions for running the app are provided below the code block.
