import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pickle

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
        
        # Split data for training and validation
        X_train, X_test, y_train, y_test = train_test_split(
            texts, labels, test_size=0.2, random_state=42, stratify=labels
        )
        
        self.model = Pipeline([
            ('tfidf', TfidfVectorizer(**self.model_config['tfidf'])),
            ('clf', LogisticRegression(**self.model_config['classifier']))
        ])
        
        self.model.fit(X_train, y_train)
        
        # Check training accuracy
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
            
            confidence = max(probabilities)
            
            # Get the top prediction and its confidence
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
        """Save trained model"""
        with open(filename, 'wb') as f:
            pickle.dump(self.model, f)
        print(f"Model saved as {filename}")
    
    def load_model(self, filename="intent_model.pkl"):
        """Load trained model"""
        with open(filename, 'rb') as f:
            self.model = pickle.load(f)
        print(f"Model loaded from {filename}")

class QueryAgent:
    def __init__(self, classifier, confidence_threshold=0.0001):
        self.classifier = classifier
        self.confidence_threshold = confidence_threshold
    
    def process_request(self, request: str):
        """Process user request"""
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
    
    def get_response(self, category_id):
        """Get appropriate response based on category"""
        responses = {
            1: "I can help with earnings analysis. Which time period are you interested in?",
            2: "I specialize in business metrics. What specific data do you need?",
            3: "Safety and compliance is my expertise. What information do you require?",
            4: "I have quarterly earnings data. Which quarter would you like to see?",
            5: "I can provide daily earnings reports. For which date?",
            6: "Let me help you improve earnings. Are you focusing on costs or revenue?",
            7: "I can analyze growth trends. Historical or projected data?",
            8: "I can check weather information. For which location and time?",
            "default": "I'm not sure about your request. Could you provide more details?"
        }
        return responses.get(category_id, responses["default"])
    
    def handle_query(self, request: str):
        """Handle complete query processing"""
        result = self.process_request(request)
        response = self.get_response(result['category_id'])
        
        if result['is_confident']:
            return f"{response} (Confidence: {result['confidence']:.2%})"
        else:
            return response
    
    def test_queries(self, queries):
        """Test multiple queries at once"""
        print("Testing sample queries:")
        print("=" * 60)
        
        for query in queries:
            result = self.process_request(query)
            response = self.get_response(result['category_id'])
            
            print(f"\nQuery: '{query}'")
            print(f"Category: {result['category_name']} (ID: {result['category_id']})")
            print(f"Confidence: {result['confidence']:.2%}")
            print(f"Confident: {result['is_confident']}")
            print(f"Response: {response}")
            print("-" * 40)