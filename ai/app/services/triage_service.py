from app.models.schemas import TriageInput, TriageOutput
import re


class TriageService:
    """
    AI-powered triage service using rule-based system + ML (mock implementation).
    In production, this would use a trained ML model.
    """

    def __init__(self):
        # Critical symptoms that require urgent attention
        self.critical_symptoms = [
            "chest pain", "difficulty breathing", "unconscious", "severe bleeding",
            "stroke", "heart attack", "seizure", "severe head injury"
        ]
        
        # High priority symptoms
        self.high_priority_symptoms = [
            "high fever", "severe pain", "vomiting blood", "broken bone",
            "deep cut", "severe burn", "allergic reaction"
        ]
        
        # Moderate symptoms
        self.moderate_symptoms = [
            "fever", "cough", "headache", "abdominal pain", "nausea",
            "dizziness", "rash", "minor injury"
        ]

    def predict(self, data: TriageInput) -> TriageOutput:
        """
        Predict triage priority based on symptoms and vital signs.
        """
        symptoms_lower = data.symptoms.lower()
        score = 0
        priority = "LOW"
        notes = []
        
        # Check for critical symptoms
        for symptom in self.critical_symptoms:
            if symptom in symptoms_lower:
                score = max(score, 90)
                priority = "URGENT"
                notes.append(f"Critical symptom detected: {symptom}")
        
        # Check for high priority symptoms
        if priority != "URGENT":
            for symptom in self.high_priority_symptoms:
                if symptom in symptoms_lower:
                    score = max(score, 70)
                    priority = "HIGH"
                    notes.append(f"High priority symptom: {symptom}")
        
        # Check for moderate symptoms
        if priority not in ["URGENT", "HIGH"]:
            for symptom in self.moderate_symptoms:
                if symptom in symptoms_lower:
                    score = max(score, 40)
                    priority = "NORMAL"
                    notes.append(f"Moderate symptom: {symptom}")
        
        # Adjust based on vital signs
        if data.vitalSigns:
            vital_score, vital_notes = self._analyze_vital_signs(data.vitalSigns)
            score = max(score, vital_score)
            notes.extend(vital_notes)
            
            if vital_score >= 80:
                priority = "URGENT"
            elif vital_score >= 60 and priority not in ["URGENT"]:
                priority = "HIGH"
        
        # Adjust based on age
        if data.age < 2 or data.age > 70:
            score += 10
            notes.append(f"Age factor: {data.age} years (vulnerable age group)")
        
        # Ensure score is within bounds
        score = min(100, max(0, score))
        
        # Default if no symptoms matched
        if score == 0:
            score = 20
            priority = "LOW"
            notes.append("Routine consultation recommended")
        
        # Calculate confidence based on symptom clarity
        confidence = 0.85 if len(notes) > 1 else 0.65
        
        return TriageOutput(
            score=score,
            priority=priority,
            notes="; ".join(notes) if notes else "General consultation",
            confidence=confidence
        )
    
    def _analyze_vital_signs(self, vital_signs: dict) -> tuple[int, list]:
        """Analyze vital signs and return score and notes."""
        score = 0
        notes = []
        
        # Temperature
        if "temperature" in vital_signs:
            temp = vital_signs["temperature"]
            if temp >= 39.5 or temp <= 35:
                score = max(score, 80)
                notes.append(f"Critical temperature: {temp}°C")
            elif temp >= 38.5 or temp <= 36:
                score = max(score, 60)
                notes.append(f"Abnormal temperature: {temp}°C")
        
        # Blood pressure
        if "bloodPressure" in vital_signs:
            bp = vital_signs["bloodPressure"]
            if isinstance(bp, str):
                match = re.match(r"(\d+)/(\d+)", bp)
                if match:
                    systolic = int(match.group(1))
                    diastolic = int(match.group(2))
                    if systolic >= 180 or systolic <= 90 or diastolic >= 120 or diastolic <= 60:
                        score = max(score, 85)
                        notes.append(f"Critical blood pressure: {bp}")
                    elif systolic >= 140 or diastolic >= 90:
                        score = max(score, 65)
                        notes.append(f"Elevated blood pressure: {bp}")
        
        # Heart rate
        if "heartRate" in vital_signs:
            hr = vital_signs["heartRate"]
            if hr >= 120 or hr <= 50:
                score = max(score, 75)
                notes.append(f"Abnormal heart rate: {hr} bpm")
        
        # Oxygen saturation
        if "oxygenSaturation" in vital_signs:
            o2 = vital_signs["oxygenSaturation"]
            if o2 <= 90:
                score = max(score, 90)
                notes.append(f"Critical oxygen saturation: {o2}%")
            elif o2 <= 94:
                score = max(score, 70)
                notes.append(f"Low oxygen saturation: {o2}%")
        
        return score, notes
