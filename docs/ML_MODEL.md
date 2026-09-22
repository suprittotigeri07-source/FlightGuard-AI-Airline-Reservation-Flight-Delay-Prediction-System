# FlightGuard AI — Machine Learning Model Architecture

## 1. Overview
The FlightGuard AI ML Pipeline predicts flight delay risk and delay duration using historical carrier flight data, scheduled departure features, airport traffic metrics, and route distance metrics.

---

## 2. Feature Pipeline

### Input Features
1. `airline_code` (Categorical: carrier IATA code)
2. `origin_airport` (Categorical: origin IATA code)
3. `dest_airport` (Categorical: destination IATA code)
4. `departure_hour` (Numerical: 0–23)
5. `day_of_week` (Numerical: 0–6, Mon-Sun)
6. `month` (Numerical: 1–12)
7. `scheduled_duration_minutes` (Numerical)
8. `distance_km` (Numerical)
9. `historical_route_delay_rate` (Numerical: 0.0–1.0)
10. `origin_airport_congestion_score` (Numerical: 0.0–1.0)

### Preprocessing Steps
- **Categorical Encoding**: Target encoding or One-Hot Encoding for low-cardinality codes.
- **Scaling**: StandardScaler for numerical distance and duration features.
- **Imputation**: SimpleImputer (median strategy) for missing numerical attributes.

---

## 3. Model Architecture & Selection

### Baseline Model
- **Logistic Regression** (Classification) for delay probability (`ARR_DELAY >= 15 min`).
- Metrics benchmark: ROC-AUC = ~0.68, F1 = ~0.60.

### Production Candidate Models
1. **Random Forest Classifier**: Handles non-linear feature interactions well.
2. **XGBoost Classifier**: Gradient boosted trees for optimal tabular classification.
3. **XGBoost Regressor**: For predicting exact continuous delay minutes (`predicted_delay_minutes`).

### Selected Production Pipeline
- `XGBoost Classifier` (Model v1.0.0) exported as a Joblib artifact along with the scikit-learn preprocessing pipeline.

---

## 4. Risk Classification Mapping
- **LOW**: `delay_probability < 0.25`
- **MEDIUM**: `0.25 <= delay_probability < 0.50`
- **HIGH**: `0.50 <= delay_probability < 0.75`
- **CRITICAL**: `delay_probability >= 0.75`

---

## 5. Artifact Management & Serving
- Model binary saved at `ml/models/delay_model_v1.joblib`
- Pipeline loaded lazily upon backend startup in `backend/app/ml/inference.py`.
- Thread-safe, sub-10ms CPU inference per flight evaluation.
