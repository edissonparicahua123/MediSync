from app.models.schemas import PharmacyDemandInput, PharmacyDemandOutput
import random


class PharmacyService:
    """
    Pharmacy demand prediction service.
    Uses simple time series forecasting (mock implementation).
    In production, would use ARIMA, Prophet, or LSTM models.
    """

    def predict_demand(self, data: PharmacyDemandInput) -> PharmacyDemandOutput:
        """
        Predict medication demand for the next period.
        """
        # Mock prediction logic
        # In production, would analyze historical_data with time series models
        
        if data.historical_data and len(data.historical_data) > 0:
            # Simple moving average
            avg_demand = sum(data.historical_data) / len(data.historical_data)
            # Add some variance
            predicted = int(avg_demand * random.uniform(0.9, 1.1))
            confidence = 0.75
        else:
            # Default prediction
            predicted = random.randint(50, 150)
            confidence = 0.50
        
        # Generate recommendation
        if predicted > 100:
            recommendation = "HIGH DEMAND: Consider increasing stock levels"
        elif predicted > 50:
            recommendation = "MODERATE DEMAND: Maintain current stock levels"
        else:
            recommendation = "LOW DEMAND: Consider reducing stock levels"
        
        return PharmacyDemandOutput(
            medication_id=data.medication_id,
            predicted_demand=predicted,
            confidence=confidence,
            recommendation=recommendation
        )
