import os
import json
from ai_engine.graph_knn import GraphKNNEngine
from ai_engine.content_engine import ContentEngine

# CORRECTED VARIABLES: Using your exact dataset file naming layout
UNI_DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "ug_educations.json")
STUDENT_DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "test_students.json")
CACHE_DIR = os.path.join(os.path.dirname(__file__), "ai_engine", "model_cache")

def run_test():
    print("Initializing Isolated Engines...")
    
    # Verify file existence explicitly before running constructors
    if not os.path.exists(UNI_DATA_PATH):
        print(f"CRITICAL ERROR: {UNI_DATA_PATH} not found inside the container execution context.")
        return
    if not os.path.exists(STUDENT_DATA_PATH):
        print(f"CRITICAL ERROR: {STUDENT_DATA_PATH} not found inside the container execution context.")
        return

    knn_engine = GraphKNNEngine(STUDENT_DATA_PATH, UNI_DATA_PATH, CACHE_DIR)
    
    # Simple verification query showcasing a chaotic user profile request
    test_query = "I want to study software engineering or AI but I am looking for a campus with active sports and want to take a gap year."
    print(f"\nProcessing Vector Query: '{test_query}'")
    
    recommendations = knn_engine.get_recommendations(test_query, k=3)
    
    print("\n--- TEST RECOMMENDATION RESULTS ---")
    if not recommendations:
        print("No matches generated. Check graph node edge configurations.")
    for uni_id, score in recommendations.items():
        print(f"University ID: {uni_id} | Hybrid Match Confidence: {score * 100:.2f}%")

if __name__ == "__main__":
    run_test()