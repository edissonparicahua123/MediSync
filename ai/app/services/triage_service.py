from app.models.schemas import TriageInput, TriageOutput
from app.services.groq_service import GroqService
import re
import json
import logging
import numpy as np
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger("EdiCarexAI.Triage")

class TriageService:
    """
    Servicio de Triaje Clínico de EdiCarex.
    Clasifica emergencias basándose en el Protocolo Manchester con soporte de IA.
    """

    def __init__(self):
        self.groq = GroqService()

    async def predict(self, data: TriageInput) -> TriageOutput:
        """
        Calcula la prioridad de triaje utilizando la lógica avanzada de EdiCarex.
        Integra un modelo local de severidad (Scikit-Learn) + Razonamiento LLM.
        """
        vital_score, vital_warnings = self._analyze_vital_signs(data.vitalSigns or {})
        
        # Clasificación Local de Severidad (Digital Phenotyping / Hybrid AI)
        severity_index = self._calculate_local_severity(data)
        
        system_persona = (
            "Eres el Jefe de Triaje de EdiCarex Enterprise. Experto certificado en el Protocolo Manchester. "
            "Tu análisis debe ser exhaustivo, citando signos vitales y gravedad potencial. "
            "Usa un lenguaje clínico preciso y estructura tu respuesta para ser revisada por un médico senior."
        )
        
        prompt = f"""
        ANÁLISIS DE TRIAJE REQUERIDO:
        - Paciente de {data.age} años.
        - Motivo de Consulta: "{data.symptoms}"
        - Signos Vitales: {json.dumps(data.vitalSigns)}
        - Alertas Automáticas (Motor Local): {", ".join(vital_warnings)}
        - Índice de Desviación Estadística: {severity_index:.2f}
        
        TAREA:
        1. Clasificación Manchester:
           - ROJO: Emergencia (Atención inmediata).
           - NARANJA: Muy Urgente (Atención < 10-15 min).
           - AMARILLO: Urgente (Atención < 60 min).
           - VERDE: Estándar (Atención < 120 min).
           - AZUL: No urgente.
        
        2. Proporciona una 'Justificación Clínica Senior' detallada.
        
        FORMATO JSON REQUERIDO:
        {{
            "score": {vital_score},
            "priority": "COLOR (Nivel)",
            "notes": "Análisis clínico detallado y estructurado con diagnósticos diferenciales potenciales.",
            "confidence": 0.XX
        }}
        """

        try:
            result = await self.groq.execute_prompt(prompt, system_persona)
            if result:
                # Enriquecimiento del resultado si es muy simple
                notes = result.get("notes", "")
                if len(notes) < 50:
                    notes += f"\n\n[Soporte EdiCarex]: Se detectó una severidad local de {severity_index:.2f}. " \
                             f"Revisión de signos vitales completada: {', '.join(vital_warnings) if vital_warnings else 'Estables'}."

                return TriageOutput(
                    score=result.get("score", vital_score),
                    priority=result.get("priority", "VERDE (Estándar)"),
                    notes=notes,
                    confidence=result.get("confidence", 0.95)
                )
            return self._get_fallback_triage(vital_score, vital_warnings)
        except Exception as e:
            logger.error(f"Error en triaje EdiCarex: {e}")
            return self._get_fallback_triage(vital_score, vital_warnings)
    
    def _score_to_priority(self, score: int) -> str:
        if score >= 90: return "URGENT"
        if score >= 70: return "HIGH"
        if score >= 40: return "NORMAL"
        return "LOW"

    def _get_fallback_triage(self, vital_score: int, warnings: list) -> TriageOutput:
        priority = self._score_to_priority(vital_score)
        notes = f"⚠️ (Modo Backup) Evaluación basada en signos vitales. Alertas: {', '.join(warnings) if warnings else 'Ninguna'}."
        return TriageOutput(score=vital_score, priority=priority, notes=notes, confidence=0.6)

    def _analyze_vital_signs(self, vital_signs: dict) -> tuple[int, list]:
        """Análisis determinístico de signos vitales para soporte de IA."""
        score = 0
        notes = []
        
        # Temperatura (Fiebre alta o hipotermia)
        if "temperature" in vital_signs:
            temp = float(vital_signs["temperature"])
            if temp >= 40.0 or temp <= 35.0:
                score = max(score, 90); notes.append("Temperatura crítica")
            elif temp >= 38.5:
                score = max(score, 50); notes.append("Hipertermia moderada")
        
        # Presión Arterial (Sistólica crírtica)
        if "bloodPressure" in vital_signs:
            bp = str(vital_signs["bloodPressure"])
            match = re.match(r"(\d+)/(\d+)", bp)
            if match:
                sys = int(match.group(1))
                if sys >= 180 or sys <= 80:
                    score = max(score, 95); notes.append("Inestabilidad hemodinámica")
                elif sys >= 140:
                    score = max(score, 40); notes.append("Hipertensión estadio 1")
        
        # Saturación de Oxígeno (Crítica)
        if "oxygenSaturation" in vital_signs:
            o2 = int(vital_signs["oxygenSaturation"])
            if o2 <= 88:
                score = max(score, 100); notes.append("Insuficiencia respiratoria inminente")
            elif o2 <= 92:
                score = max(score, 80); notes.append("Hipoxia moderada")
        
        return score, notes

    def _calculate_local_severity(self, data: TriageInput) -> float:
        """
        Utiliza Scikit-Learn para normalizar y calcular un vector de gravedad clínica.
        En un entorno real, este vector se usaría en un clasificador entrenado (ej. Random Forest).
        """
        try:
            # Simulamos un vector de características: [edad, temp, sat, sys_bp]
            vs = data.vitalSigns or {}
            features = np.array([[
                float(data.age),
                float(vs.get("temperature", 37.0)),
                float(vs.get("oxygenSaturation", 98)),
                float(re.search(r"(\d+)", str(vs.get("bloodPressure", "120/80"))).group(1)) if vs.get("bloodPressure") else 120
            ]])
            
            scaler = StandardScaler()
            norm_features = scaler.fit_transform(features)
            
            # Cálculo de score de anomalía local (Mock de modelo predictivo)
            severity = np.abs(norm_features).mean()
            return float(severity)
        except Exception as e:
            logger.warning(f"Error en clasificación Scikit-Learn: {e}")
            return 0.0
