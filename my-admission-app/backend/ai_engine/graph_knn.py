import json
import os
import networkx as nx
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

class GraphKNNEngine:
    def __init__(self, student_data_path, uni_data_path, cache_dir):
        self.model = SentenceTransformer('all-MiniLM-L6-v2', cache_folder=cache_dir)
        self.G = nx.Graph()
        self.faiss_index = None
        self.student_profiles = []
        self.uni_data = []
        self.load_data_and_build_graph(student_data_path, uni_data_path)

    def _normalize_student(self, stu):
        """
        Normalizes both old and new student schema into a unified internal format.
        """
        # Handle new schema (teammate's format)
        if "id" in stu and "student_id" not in stu:
            saved_programs = []
            if stu.get("target_programme_1"):
                saved_programs.append(stu["target_programme_1"])
            if stu.get("target_programme_2"):
                saved_programs.append(stu["target_programme_2"])

            interests = " ".join(filter(None, [
                stu.get("interest_cluster", ""),
                stu.get("interest_tags", ""),
                stu.get("motivation_quote", ""),
                stu.get("what_you_want", ""),
            ]))

            return {
                "student_id": stu["id"],
                "interests": interests,
                "accepted_or_saved_programs": saved_programs,
                "gpa": stu.get("gpa"),
                "raw": stu,
            }

        # Handle old schema (your original format) — pass through
        return stu

    def load_data_and_build_graph(self, student_data_path, uni_data_path):
        if not os.path.exists(uni_data_path):
            raise FileNotFoundError(f"University data file missing at: {uni_data_path}")
        with open(uni_data_path, "r", encoding="utf-8") as f:
            self.uni_data = json.load(f)

        if not os.path.exists(student_data_path):
            raise FileNotFoundError(f"Student data file missing at: {student_data_path}")
        with open(student_data_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Handle both old {"student_profiles": [...]} and new {"students": [...]} formats
        raw_students = (
            data.get("student_profiles")
            or data.get("students")
            or (data if isinstance(data, list) else [])
        )

        self.student_profiles = [self._normalize_student(s) for s in raw_students]

        # Build university nodes
        self.G = nx.Graph()
        for uni in self.uni_data:
            uni_id = uni.get("course_id") or uni.get("id")
            if uni_id:
                self.G.add_node(uni_id, type="university", meta=uni)

        # Build student nodes and edges
        for stu in self.student_profiles:
            stu_id = stu.get("student_id")
            if not stu_id:
                continue

            self.G.add_node(stu_id, type="student", meta=stu)

            for uni_id in stu.get("accepted_or_saved_programs", []):
                if self.G.has_node(uni_id):
                    self.G.add_edge(stu_id, uni_id, weight=1.0)

        # Build FAISS index
        if self.student_profiles:
            interest_corpus = []
            for stu in self.student_profiles:
                text_block = stu.get("interests", "")
                if "preferred_sports" in stu:
                    text_block += f" Sports preferences: {', '.join(stu['preferred_sports'])}."
                if "lifestyle_notes" in stu:
                    text_block += f" Lifestyle constraints: {stu['lifestyle_notes']}."
                interest_corpus.append(text_block)

            embeddings = self.model.encode(interest_corpus, convert_to_numpy=True)
            faiss.normalize_L2(embeddings)
            dimension = embeddings.shape[1]
            self.faiss_index = faiss.IndexFlatIP(dimension)
            self.faiss_index.add(embeddings)

    def get_recommendations(self, user_query, k=3):
        if not self.faiss_index or not self.student_profiles:
            return {}

        query_vector = self.model.encode([user_query], convert_to_numpy=True)
        faiss.normalize_L2(query_vector)
        distances, indices = self.faiss_index.search(query_vector, k)

        peer_recommendations = {}

        for rank, idx in enumerate(indices[0]):
            similarity_score = float(distances[0][rank])

            if idx >= len(self.student_profiles):
                continue

            matched_student = self.student_profiles[idx]
            matched_stu_id = matched_student["student_id"]

            for neighbor in self.G.neighbors(matched_stu_id):
                if self.G.nodes[neighbor].get("type") == "university":
                    if neighbor not in peer_recommendations:
                        peer_recommendations[neighbor] = 0.0
                    peer_recommendations[neighbor] += similarity_score

        max_score = max(peer_recommendations.values()) if peer_recommendations else 1.0
        for uni_id in peer_recommendations:
            peer_recommendations[uni_id] = peer_recommendations[uni_id] / max_score

        return peer_recommendations