import json
import faiss
from sentence_transformers import SentenceTransformer

class ContentEngine:
    def __init__(self, uni_data_path, cache_dir):
        self.model = SentenceTransformer('all-MiniLM-L6-v2', cache_folder=cache_dir)
        self.universities = []
        self.index = None
        self.load_and_index_universities(uni_data_path)

    def load_and_index_universities(self, uni_data_path):
        with open(uni_data_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            self.universities = data.get("universities", [])

        if self.universities:
            course_corpus = [
                f"Degree: {u['degree_name']}. Uni: {u['university']}. Info: {u['description']}"
                for u in self.universities
            ]
            embeddings = self.model.encode(course_corpus, convert_to_numpy=True)
            faiss.normalize_L2(embeddings)
            self.index = faiss.IndexFlatIP(embeddings.shape[1])
            self.index.add(embeddings)

    def get_content_scores(self, user_query):
        if self.index is None or not self.universities:
            return {}

        query_vector = self.model.encode([user_query], convert_to_numpy=True)
        faiss.normalize_L2(query_vector)
        distances, indices = self.index.search(query_vector, len(self.universities))

        return {self.universities[idx]["id"]: float(dist) for dist, idx in zip(distances[0], indices[0]) if idx != -1}