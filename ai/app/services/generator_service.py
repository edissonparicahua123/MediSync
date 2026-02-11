from app.models.schemas import TextGeneratorInput, TextGeneratorOutput
from datetime import datetime


class GeneratorService:
    """
    Servicio de Generación de Documentación Clínica de EdiCarex.
    Crea documentos médicos de alta fidelidad con la identidad corporativa.
    """

    def __init__(self):
        self.templates = {
            "prescription": self._prescription_template,
            "referral": self._referral_template,
            "discharge": self._discharge_template,
        }

    def generate(self, data: TextGeneratorInput) -> TextGeneratorOutput:
        """Genera documentación profesional de EdiCarex."""
        template_func = self.templates.get(data.template_type.lower())
        if not template_func:
            raise ValueError(f"Tipo de plantilla no soportado: {data.template_type}")
        
        return TextGeneratorOutput(
            generated_text=template_func(data.patient_data, data.additional_notes),
            template_type=data.template_type
        )

    def _prescription_template(self, patient_data: dict, notes: str) -> str:
        """Plantilla de Receta Médica EdiCarex."""
        return f"""
=========================================
      RECETA MÉDICA - EDICAREX AI
=========================================
Fecha: {datetime.now().strftime("%d/%m/%Y")}
Paciente: {patient_data.get("name", "N/A")}
Edad: {patient_data.get("age", "N/A")}

INDICACIONES TERAPÉUTICAS:
{notes if notes else "Siga las instrucciones del médico tratante."}

Firma: ________________________
Sistema de Gestión Hospitalaria EdiCarex
"""

    def _referral_template(self, patient_data: dict, notes: str) -> str:
        """Plantilla de Referencia Médica EdiCarex."""
        return f"""
=========================================
    ORDEN DE REFERENCIA - EDICAREX
=========================================
Fecha: {datetime.now().strftime("%d/%m/%Y")}
Paciente: {patient_data.get("name", "N/A")}

MOTIVO DE REFERENCIA:
{notes if notes else "Evaluación por especialista."}

Atentamente,
Cuerpo Médico EdiCarex
"""

    def _discharge_template(self, patient_data: dict, notes: str) -> str:
        """Plantilla de Alta Médica EdiCarex."""
        return f"""
=========================================
    RESUMEN DE ALTA - EDICAREX
=========================================
Paciente: {patient_data.get("name", "N/A")}
Fecha de Alta: {datetime.now().strftime("%d/%m/%Y")}

INSTRUCCIONES DE SEGUIMIENTO:
{notes if notes else "Reposo absoluto y control en 7 días."}

EdiCarex: Tecnología al servicio de la salud.
"""
