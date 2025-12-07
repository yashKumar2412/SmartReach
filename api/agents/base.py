"""
Base agent class and utilities
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List
import os
from dotenv import load_dotenv

load_dotenv()


class BaseAgent(ABC):
    """Base class for all agents"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
    
    @abstractmethod
    def execute(self, *args, **kwargs):
        """Execute agent task"""
        pass


def call_llm(prompt: str, model: str = "gpt-3.5-turbo", temperature: float = 0.7) -> str:
    """
    Call OpenAI LLM API
    
    Args:
        prompt: The prompt to send to the LLM
        model: OpenAI model to use (default: gpt-3.5-turbo)
        temperature: Sampling temperature (0-2)
        
    Returns:
        LLM response text
    """
    from openai import OpenAI
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found in environment variables")
    
    client = OpenAI(api_key=api_key)
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature
        )
        return response.choices[0].message.content
    except Exception as e:
        # Raise exception instead of falling back to mock
        raise RuntimeError(f"OpenAI API call failed: {e}") from e

