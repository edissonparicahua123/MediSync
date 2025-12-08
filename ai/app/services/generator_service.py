from app.models.schemas import TextGeneratorInput, TextGeneratorOutput
from datetime import datetime


class GeneratorService:
    """
    Medical text generation service.
    Uses template-based generation (mock implementation).
    In production, would use GPT or other LLM models.
    """

    def __init__(self):
        self.templates = {
            "prescription": self._prescription_template,
            "referral": self._referral_template,
            "discharge": self._discharge_template,
        }

    def generate(self, data: TextGeneratorInput) -> TextGeneratorOutput:
        """
        Generate medical text based on template type.
        """
        template_func = self.templates.get(data.template_type.lower())
        
        if not template_func:
            raise ValueError(f"Unknown template type: {data.template_type}")
        
        generated_text = template_func(data.patient_data, data.additional_notes)
        
        return TextGeneratorOutput(
            generated_text=generated_text,
            template_type=data.template_type
        )

    def _prescription_template(self, patient_data: dict, notes: str) -> str:
        """Generate prescription document."""
        patient_name = patient_data.get("name", "Patient")
        age = patient_data.get("age", "N/A")
        diagnosis = patient_data.get("diagnosis", "N/A")
        medications = patient_data.get("medications", [])
        
        text = f"""MEDICAL PRESCRIPTION

Date: {datetime.now().strftime("%Y-%m-%d")}
Patient: {patient_name}
Age: {age}
Diagnosis: {diagnosis}

PRESCRIBED MEDICATIONS:
"""
        
        for i, med in enumerate(medications, 1):
            text += f"\n{i}. {med.get('name', 'Medication')} - {med.get('dosage', 'As directed')}"
            text += f"\n   Frequency: {med.get('frequency', 'As directed')}"
            text += f"\n   Duration: {med.get('duration', 'As directed')}\n"
        
        if notes:
            text += f"\nAdditional Notes:\n{notes}\n"
        
        text += "\n\nPhysician Signature: ___________________"
        
        return text

    def _referral_template(self, patient_data: dict, notes: str) -> str:
        """Generate referral document."""
        patient_name = patient_data.get("name", "Patient")
        age = patient_data.get("age", "N/A")
        reason = patient_data.get("reason", "Further evaluation")
        specialist = patient_data.get("specialist", "Specialist")
        
        text = f"""MEDICAL REFERRAL

Date: {datetime.now().strftime("%Y-%m-%d")}
Patient: {patient_name}
Age: {age}

REFERRAL TO: {specialist}

REASON FOR REFERRAL:
{reason}

CLINICAL SUMMARY:
{notes if notes else "Patient requires specialist consultation."}

Please evaluate and provide recommendations.

Referring Physician: ___________________
"""
        
        return text

    def _discharge_template(self, patient_data: dict, notes: str) -> str:
        """Generate discharge summary."""
        patient_name = patient_data.get("name", "Patient")
        age = patient_data.get("age", "N/A")
        admission_date = patient_data.get("admission_date", "N/A")
        discharge_date = datetime.now().strftime("%Y-%m-%d")
        diagnosis = patient_data.get("diagnosis", "N/A")
        treatment = patient_data.get("treatment", "N/A")
        
        text = f"""DISCHARGE SUMMARY

Patient: {patient_name}
Age: {age}
Admission Date: {admission_date}
Discharge Date: {discharge_date}

DIAGNOSIS:
{diagnosis}

TREATMENT PROVIDED:
{treatment}

DISCHARGE INSTRUCTIONS:
{notes if notes else "Follow up with primary care physician in 1-2 weeks."}

MEDICATIONS ON DISCHARGE:
{patient_data.get('discharge_medications', 'As prescribed')}

FOLLOW-UP:
{patient_data.get('follow_up', 'Schedule appointment in 2 weeks')}

Attending Physician: ___________________
"""
        
        return text
