"""
FlightGuard AI — Delay Prediction ML Model Training Script
"""
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, roc_auc_score
from xgboost import XGBClassifier

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODEL_DIR, exist_ok=True)
MODEL_PATH = os.path.join(MODEL_DIR, "delay_model_v1.joblib")

def generate_synthetic_training_data(n_samples=2000):
    """Generates realistic synthetic flight training dataset for baseline calibration."""
    np.random.seed(42)
    airlines = ['AI', '6E', 'UK', 'SG', 'G8']
    airports = ['BLR', 'DEL', 'BOM', 'HYD', 'CCU', 'MAA']
    
    data = []
    for _ in range(n_samples):
        carrier = np.random.choice(airlines)
        origin = np.random.choice(airports)
        dest = np.random.choice([a for a in airports if a != origin])
        dep_hour = np.random.randint(0, 24)
        day_of_week = np.random.randint(0, 7)
        month = np.random.randint(1, 13)
        dist = np.random.randint(400, 2500)
        sched_dur = int(dist / 8.0) + np.random.randint(20, 60)
        hist_delay_rate = np.random.uniform(0.05, 0.45)
        congestion = np.random.uniform(0.1, 0.9)
        
        # Logistic probability for delay ground truth
        logit = -2.5 + (dep_hour >= 17) * 0.8 + congestion * 1.5 + hist_delay_rate * 2.0
        prob = 1.0 / (1.0 + np.exp(-logit))
        is_delayed = int(np.random.rand() < prob)
        
        data.append({
            'airline_code': carrier,
            'origin_airport': origin,
            'dest_airport': dest,
            'departure_hour': dep_hour,
            'day_of_week': day_of_week,
            'month': month,
            'scheduled_duration_minutes': sched_dur,
            'distance_km': dist,
            'historical_route_delay_rate': hist_delay_rate,
            'origin_airport_congestion_score': congestion,
            'is_delayed': is_delayed
        })
        
    return pd.DataFrame(data)

def train_and_export_model():
    print("Generating training dataset...")
    df = generate_synthetic_training_data(2500)
    
    X = df.drop(columns=['is_delayed'])
    y = df['is_delayed']
    
    categorical_features = ['airline_code', 'origin_airport', 'dest_airport']
    numerical_features = [
        'departure_hour', 'day_of_week', 'month',
        'scheduled_duration_minutes', 'distance_km',
        'historical_route_delay_rate', 'origin_airport_congestion_score'
    ]
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ]
    )
    
    model = XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.05,
        random_state=42,
        eval_metric='logloss'
    )
    
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', model)
    ])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training XGBoost Classifier...")
    pipeline.fit(X_train, y_train)
    
    preds = pipeline.predict(X_test)
    probs = pipeline.predict_proba(X_test)[:, 1]
    
    print("=== Model Evaluation ===")
    print(classification_report(y_test, preds))
    print(f"ROC-AUC Score: {roc_auc_score(y_test, probs):.4f}")
    
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Successfully saved model artifact to {MODEL_PATH}")

if __name__ == "__main__":
    train_and_export_model()
