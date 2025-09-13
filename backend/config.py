# Configuration settings
CATEGORIES = {
    1: "earning",
    2: "business", 
    3: "safety",
    4: "quarterly_earning",
    5: "daily_earning",
    6: "improve_earning",
    7: "growth",
    8: "weather",
    "default": "others"
}

# Model parameters
MODEL_CONFIG = {
    'tfidf': {
        'lowercase': True,
        'stop_words': 'english',
        'ngram_range': (1, 2),
        'max_features': 500,
        'min_df': 1,
        'max_df': 0.9,
    },
    'classifier': {
        'multi_class': 'multinomial',
        'max_iter': 2000,
        'C': 0.8,
    }
}

# Confidence threshold - lowered for better detection
CONFIDENCE_THRESHOLD = 0.1