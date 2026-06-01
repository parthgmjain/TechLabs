import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# Import your Graph-KNN engine class
from ai_engine.graph_knn import GraphKNNEngine

app = FastAPI(title="Admission AI Engine API")

# Enable CORS so the frontend application can access this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core data and model paths matching your container structure
UNI_DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "ug_educations.json")
STUDENT_DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "test_students.json")
CACHE_DIR = os.path.join(os.path.dirname(__file__), "ai_engine", "model_cache")

# Persistent engine instance placeholder
engine = None

@app.on_event("startup")
def startup_event():
    """Boots the vector and network structures into memory at server launch."""
    global engine
    print("Booting AI Recommendation Engine into memory...")
    engine = GraphKNNEngine(STUDENT_DATA_PATH, UNI_DATA_PATH, CACHE_DIR)

# Network data structure validators
class StudentProfileInput(BaseModel):
    student_id: str
    interests: str
    accepted_or_saved_programs: List[str]
    preferred_sports: Optional[List[str]] = None
    lifestyle_notes: Optional[str] = None

class QueryInput(BaseModel):
    query: str
    k: Optional[int] = 3

@app.get("/")
def read_root():
    return {"status": "Backend is running!", "engine_loaded": engine is not None}

@app.post("/api/students")
def add_or_update_student_profile(profile: StudentProfileInput):
    """
    Endpoint 1: Ingests a student profile. If the student_id already exists, 
    it updates their record. Otherwise, it appends a new user.
    Forces an immediate matrix and graph re-build.
    """
    global engine
    try:
        with open(STUDENT_DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        data = {"student_profiles": []}

    profiles = data.get("student_profiles", [])
    
    # Locate index if the student already exists in our dataset
    existing_index = next((i for i, p in enumerate(profiles) if p["student_id"] == profile.student_id), None)
    new_profile_dict = profile.dict(exclude_none=True)

    if existing_index is not None:
        # User exists: Overwrite their old data profile completely
        profiles[existing_index] = new_profile_dict
        message = f"Profile {profile.student_id} updated successfully."
    else:
        # User is new: Append them to the array
        profiles.append(new_profile_dict)
        message = f"Profile {profile.student_id} created and integrated into graph."

    # Save mutated data array back down to disk
    data["student_profiles"] = profiles
    with open(STUDENT_DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Hot-reload the AI engine state to reflect the new profile strings instantly
    engine.load_data_and_build_graph(STUDENT_DATA_PATH, UNI_DATA_PATH)
    
    return {"status": "success", "message": message}

@app.post("/api/recommend")
def get_recommendations(input_data: QueryInput):
    """
    Endpoint 2: Receives plain-text query vectors from the client search layout, 
    processes them via the memory network, and drops the sorted results back.
    """
    global engine
    if not engine:
        raise HTTPException(status_code=503, detail="AI engine is offline.")
    
    results = engine.get_recommendations(input_data.query, k=input_data.k)
    return {"query": input_data.query, "recommendations": results}