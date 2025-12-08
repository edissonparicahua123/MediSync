from app.models.schemas import SummarizationInput, SummarizationOutput
import re


class SummarizationService:
    """
    Clinical text summarization service.
    Uses extractive summarization (mock implementation).
    In production, would use transformer models like BERT or GPT.
    """

    def summarize(self, data: SummarizationInput) -> SummarizationOutput:
        """
        Summarize clinical text using extractive summarization.
        """
        text = data.text
        max_length = data.max_length
        
        # Split into sentences
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if not sentences:
            return SummarizationOutput(
                summary="",
                original_length=len(text),
                summary_length=0
            )
        
        # Simple extractive summarization: take first few sentences
        # In production, would use TF-IDF or transformer-based ranking
        summary_sentences = []
        current_length = 0
        
        # Prioritize sentences with medical keywords
        medical_keywords = [
            "diagnosis", "treatment", "prescribed", "symptoms", "condition",
            "patient", "examination", "test", "results", "recommendation"
        ]
        
        # Score sentences
        scored_sentences = []
        for sentence in sentences:
            score = sum(1 for keyword in medical_keywords if keyword in sentence.lower())
            scored_sentences.append((score, sentence))
        
        # Sort by score (descending)
        scored_sentences.sort(reverse=True, key=lambda x: x[0])
        
        # Build summary
        for score, sentence in scored_sentences:
            if current_length + len(sentence) <= max_length:
                summary_sentences.append(sentence)
                current_length += len(sentence)
            else:
                break
        
        # If no sentences fit, take the first sentence truncated
        if not summary_sentences and sentences:
            summary_sentences = [sentences[0][:max_length]]
        
        summary = ". ".join(summary_sentences)
        if summary and not summary.endswith('.'):
            summary += "."
        
        return SummarizationOutput(
            summary=summary,
            original_length=len(text),
            summary_length=len(summary)
        )
