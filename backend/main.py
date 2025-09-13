#!/usr/bin/env python3
"""
Simple Intent Classification System
"""

import argparse
from config import CATEGORIES, MODEL_CONFIG, CONFIDENCE_THRESHOLD
from training_data import training_data
from utils import IntentClassifier, QueryAgent

def main():
    parser = argparse.ArgumentParser(description="Simple Intent Classifier")
    parser.add_argument('--train', '-t', action='store_true', help='Train the model')
    parser.add_argument('--query', '-q', type=str, help='Process a single query')
    parser.add_argument('--interactive', '-i', action='store_true', help='Interactive mode')
    
    args = parser.parse_args()
    
    # Initialize classifier and agent
    classifier = IntentClassifier(MODEL_CONFIG, CATEGORIES)
    agent = QueryAgent(classifier, CONFIDENCE_THRESHOLD)
    
    if args.train:
        print("Training the model...")
        classifier.train(training_data)
        classifier.save_model()
        print("Training completed!")
        return
    
    # Try to load existing model or train if not exists
    try:
        classifier.load_model()
        print("Model loaded successfully!")
    except:
        print("No trained model found. Training new model...")
        classifier.train(training_data)
        classifier.save_model()
    
    if args.query:
        # Process single query
        result = agent.process_request(args.query)
        response = agent.handle_query(args.query)
        
        print(f"\nQuery: '{args.query}'")
        print(f"Category: {result['category_name']} (ID: {result['category_id']})")
        print(f"Confidence: {result['confidence']:.2%}")
        print(f"Response: {response}")
    
    elif args.interactive:
        # Interactive mode
        print("Intent Classification Agent - Interactive Mode")
        print("Type 'quit' to exit")
        print("-" * 40)
        
        while True:
            user_input = input("\nEnter your query: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                break
            
            if not user_input:
                continue
            
            result = agent.process_request(user_input)
            response = agent.handle_query(user_input)
            
            print(f"\nCategory: {result['category_name']}")
            print(f"Confidence: {result['confidence']:.2%}")
            print(f"Agent: {response}")
    
    else:
        # Demo mode - show sample queries
        print("Intent Classification Demo")
        print("=" * 40)
        
        sample_queries = [
            "What are the quarterly earnings?",
            "Business performance metrics",
            "Safety protocols",
            "How to improve revenue",
            "Weather forecast",
            "Tell me a joke",
            "Safety protocols and procedures"
        ]
        
        for query in sample_queries:
            result = agent.process_request(query)
            response = agent.handle_query(query)
            
            print(f"\nQuery: '{query}'")
            print(f"Category: {result['category_name']} (ID: {result['category_id']})")
            print(f"Confidence: {result['confidence']:.2%}")
            print(f"Response: {response}")
            print("-" * 40)

if __name__ == "__main__":
    main()