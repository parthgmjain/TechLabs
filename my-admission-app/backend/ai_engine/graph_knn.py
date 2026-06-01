import json
import os
import networkx as nx
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

class GraphKNNEngine:
    def __init__(self, student_data_path, uni_data_path, cache_dir):
        """
        Initializes the Graph-KNN recommendation subsystem.
        """
        self.model = SentenceTransformer('all-MiniLM-L6-v2', cache_folder=cache_dir)
        self.G = nx.Graph()
        self.faiss_index = None
        self.student_profiles = []
        self.uni_data = []
        
        # Load datasets and map network architecture
        self.load_data_and_build_graph(student_data_path, uni_data_path)

    def load_data_and_build_graph(self, student_data_path, uni_data_path):
        """
        Loads data dynamically from passed paths and constructs a hybrid network topology.
        """
        # Load University Data
        if not os.path.exists(uni_data_path):
            raise FileNotFoundError(f"University data file missing at: {uni_data_path}")
        with open(uni_data_path, "r", encoding="utf-8") as f:
            self.uni_data = json.load(f)

        # Load Student Data
        if not os.path.exists(student_data_path):
            raise FileNotFoundError(f"Student data file missing at: {student_data_path}")
        with open(student_data_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            self.student_profiles = data.get("student_profiles", [])

        # Step 1: Populate Network Nodes
        # Inject University nodes
        for uni in self.uni_data:
            # Assumes your schema uses 'course_id' or 'id'. Adapts safely.
            uni_id = uni.get("course_id") or uni.get("id")
            if uni_id:
                self.G.add_node(uni_id, type="university", meta=uni)

        # Inject Student nodes and forge behavioral relational edges
        for stu in self.student_profiles:
            stu_id = stu.get("student_id")
            if not stu_id:
                continue
                
            self.G.add_node(stu_id, type="student", meta=stu)

            # Draw explicit graph links based on past interactions
            saved_programs = stu.get("accepted_or_saved_programs", [])
            for uni_id in saved_programs:
                if self.G.has_node(uni_id):
                    self.G.add_edge(stu_id, uni_id, weight=1.0)

        # Step 2: Build the FAISS Vector Index for Spatial Proximity Mapping
        if self.student_profiles:
            # Concat potential lifestyle blocks if your team appends them as separate fields later
            interest_corpus = []
            for stu in self.student_profiles:
                text_block = stu.get("interests", "")
                # Gracefully absorbs extra fields without crashing the layout
                if "preferred_sports" in stu:
                    text_block += f" Sports preferences: {', '.join(stu['preferred_sports'])}."
                if "lifestyle_notes" in stu:
                    text_block += f" Lifestyle constraints: {stu['lifestyle_notes']}."
                interest_corpus.append(text_block)

            # Generate semantic coordinates
            embeddings = self.model.encode(interest_corpus, convert_to_numpy=True)
            faiss.normalize_L2(embeddings)
            
            # Setup Inner Product index for Cosine Similarity
            dimension = embeddings.shape[1]
            self.faiss_index = faiss.IndexFlatIP(dimension)
            self.faiss_index.add(embeddings)

    def get_recommendations(self, user_query, k=3):
        """
        Projects a new user query into the spatial map, isolates the top K peer nodes,
        and aggregates network graph edge paths to compute score mappings.
        """
        if not self.faiss_index or not self.student_profiles:
            return {}

        # Vectorize input query context
        query_vector = self.model.encode([user_query], convert_to_numpy=True)
        faiss.normalize_L2(query_vector)

        # Find closest peer matches in structural coordinate space
        distances, indices = self.faiss_index.search(query_vector, k)
        
        peer_recommendations = {}
        
        # Traverse graph layout from peer matches to structural endpoints
        for rank, idx in enumerate(indices[0]):
            similarity_score = float(distances[0][rank])
            
            # Prevent out of bounds evaluations
            if idx >= len(self.student_profiles):
                continue
                
            matched_student = self.student_profiles[idx]
            matched_stu_id = matched_student["student_id"]

            # Walk the active connections from this neighbor node
            for neighbor in self.G.neighbors(matched_stu_id):
                if self.G.nodes[neighbor].get("type") == "university":
                    # Aggregate weights across intersecting paths
                    if neighbor not in peer_recommendations:
                        peer_recommendations[neighbor] = 0.0
                    peer_recommendations[neighbor] += similarity_score

        # Normalize outputs to a 0.0 - 1.0 boundary score scale
        max_score = max(peer_recommendations.values()) if peer_recommendations else 1.0
        for uni_id in peer_recommendations:
            peer_recommendations[uni_id] = (peer_recommendations[uni_id] / max_score)

        return peer_recommendations