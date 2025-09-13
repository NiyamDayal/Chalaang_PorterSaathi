import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pickle

# Import all handler functions
from response_handlers import (
    handle_earning, handle_business, handle_safety, 
    handle_quarterly_earning, handle_daily_earning,
    handle_improve_earning, handle_growth, handle_weather,
    handle_default
)

class TextPreprocessor:
    def preprocess(self, text: str) -> str:
        """Enhanced text preprocessing"""
        text = text.lower().strip()
        text = re.sub(r'[^\w\s]', '', text)  # Remove punctuation
        text = re.sub(r'\s+', ' ', text).strip()  # Remove extra spaces
        return text

class IntentClassifier:
    def __init__(self, model_config, categories):
        self.categories = categories
        self.preprocessor = TextPreprocessor()
        self.model_config = model_config
        self.model = None

    def train(self, training_data):
        """Train the model with validation"""
        texts, labels = zip(*training_data)
        labels = [str(label) for label in labels]

        X_train, X_test, y_train, y_test = train_test_split(
            texts, labels, test_size=0.2, random_state=42, stratify=labels
        )

        self.model = Pipeline([
            ('tfidf', TfidfVectorizer(**self.model_config['tfidf'])),
            ('clf', LogisticRegression(**self.model_config['classifier']))
        ])

        self.model.fit(X_train, y_train)

        train_preds = self.model.predict(X_train)
        test_preds = self.model.predict(X_test)

        train_acc = accuracy_score(y_train, train_preds)
        test_acc = accuracy_score(y_test, test_preds)

        print(f"Training accuracy: {train_acc:.3f}")
        print(f"Test accuracy: {test_acc:.3f}")

        if train_acc > 0.9 and test_acc > 0.7:
            print("Model trained successfully!")
        else:
            print("Warning: Model may need more training data or tuning")

    def predict(self, request: str, confidence_threshold=0.3):
        """Predict intent with confidence"""
        try:
            processed_text = self.preprocessor.preprocess(request)

            if not processed_text.strip():
                return "default", "others", 0.0

            prediction = self.model.predict([processed_text])[0]
            probabilities = self.model.predict_proba([processed_text])[0]

            predicted_index = np.argmax(probabilities)
            predicted_class = self.model.classes_[predicted_index]
            confidence = probabilities[predicted_index]

            if confidence < confidence_threshold:
                return "default", "others", confidence

            if predicted_class == 'default':
                category_id = "default"
            else:
                category_id = int(predicted_class)

            category_name = self.categories.get(category_id, "others")

            return category_id, category_name, confidence

        except Exception as e:
            print(f"Error in prediction: {e}")
            return "default", "others", 0.0

    def save_model(self, filename="intent_model.pkl"):
        with open(filename, 'wb') as f:
            pickle.dump(self.model, f)
        print(f"Model saved as {filename}")

    def load_model(self, filename="intent_model.pkl"):
        with open(filename, 'rb') as f:
            self.model = pickle.load(f)
        print(f"Model loaded from {filename}")

class QueryAgent:
    def __init__(self, classifier, confidence_threshold=0.0001):
        self.classifier = classifier
        self.confidence_threshold = confidence_threshold

        # Mapping of category_id to handler functions
        self.handler_map = {
            1: handle_earning,
            2: handle_business,
            3: handle_safety,
            4: handle_quarterly_earning,
            5: handle_daily_earning,
            6: handle_improve_earning,
            7: handle_growth,
            8: handle_weather,
            "default": handle_default
        }

    def process_request(self, request: str):
        category_id, category_name, confidence = self.classifier.predict(
            request, self.confidence_threshold
        )

        return {
            "request": request,
            "category_id": category_id,
            "category_name": category_name,
            "confidence": round(confidence, 4),
            "is_confident": confidence > self.confidence_threshold
        }

    def get_response(self, category_id, request):
        """Call the appropriate handler function"""
        handler = self.handler_map.get(category_id, self.handler_map["default"])
        return handler(request)

    def handle_query(self, request: str):
        result = self.process_request(request)
        response = self.get_response(result['category_id'], request)

        if result['is_confident']:
            return f"{response} (Confidence: {result['confidence']:.2%})"
        else:
            return response

    def test_queries(self, queries):
        print("Testing sample queries:")
        print("=" * 60)

        for query in queries:
            result = self.process_request(query)
            response = self.get_response(result['category_id'], query)

            print(f"\nQuery: '{query}'")
            print(f"Category: {result['category_name']} (ID: {result['category_id']})")
            print(f"Confidence: {result['confidence']:.2%}")
            print(f"Confident: {result['is_confident']}")
            print(f"Response: {response}")
            print("-" * 40)
