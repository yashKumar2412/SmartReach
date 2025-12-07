"""
Base agent class and utilities
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Tuple
import os
import json
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


def call_llm_with_tools(
    prompt: str, 
    tools: Optional[List[Dict]] = None,
    tool_choice: str = "auto",
    model: str = "gpt-4",
    temperature: float = 0.7,
    max_iterations: int = 5
) -> Tuple[str, List[Dict]]:
    """
    Call OpenAI LLM with function calling support
    
    This enables agents to use external tools and APIs.
    
    Args:
        prompt: The prompt to send to the LLM
        tools: List of tool definitions (function schemas)
        tool_choice: "auto", "none", or "required"
        model: OpenAI model to use (default: gpt-4)
        temperature: Sampling temperature (0-2)
        max_iterations: Maximum number of tool call iterations
        
    Returns:
        (response_text, tool_calls_made) - Response and list of tool calls executed
    """
    from openai import OpenAI
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found in environment variables")
    
    client = OpenAI(api_key=api_key)
    
    messages = [{"role": "user", "content": prompt}]
    tool_calls_executed = []
    iteration = 0
    
    try:
        while iteration < max_iterations:
            # Call LLM with current messages and tools
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                tools=tools if tools else None,
                tool_choice=tool_choice if iteration == 0 else "auto",
                temperature=temperature
            )
            
            message = response.choices[0].message
            messages.append({
                "role": message.role,
                "content": message.content or ""
            })
            
            # Check if LLM wants to call tools
            if message.tool_calls:
                # Add tool calls to messages
                for tool_call in message.tool_calls:
                    messages.append({
                        "role": "assistant",
                        "content": None,
                        "tool_calls": [{
                            "id": tool_call.id,
                            "type": "function",
                            "function": {
                                "name": tool_call.function.name,
                                "arguments": tool_call.function.arguments
                            }
                        }]
                    })
                    
                    tool_calls_executed.append({
                        "id": tool_call.id,
                        "function": tool_call.function.name,
                        "arguments": json.loads(tool_call.function.arguments)
                    })
                
                # Note: In a real implementation, you would execute the tools here
                # and add the results back to messages. For now, we'll return the tool calls.
                # The actual execution will happen in the agent's execute method.
                break  # Exit loop after tool calls are requested
            else:
                # No tool calls, we have the final answer
                break
            
            iteration += 1
        
        final_response = messages[-1].get("content", "")
        return final_response, tool_calls_executed
        
    except Exception as e:
        raise RuntimeError(f"OpenAI API call with tools failed: {e}") from e


def execute_tool_calls(tool_calls: List[Dict], available_tools: Dict[str, callable]) -> List[Dict]:
    """
    Execute tool calls and return results
    
    Args:
        tool_calls: List of tool call requests with format:
            [{"id": "...", "function": "function_name", "arguments": {...}}, ...]
        available_tools: Dict mapping function names to callable functions
            e.g., {"search_web": search_web_function, ...}
    
    Returns:
        List of tool results formatted for feeding back to LLM
    """
    results = []
    
    for tool_call in tool_calls:
        func_name = tool_call.get("function")
        args = tool_call.get("arguments", {})
        tool_call_id = tool_call.get("id", "")
        
        if func_name in available_tools:
            try:
                # Execute the tool function
                func = available_tools[func_name]
                result = func(**args)
                
                # Format result for LLM
                if isinstance(result, dict):
                    result_str = json.dumps(result, indent=2)
                elif isinstance(result, (list, tuple)):
                    result_str = json.dumps(result, indent=2)
                else:
                    result_str = str(result)
                
                results.append({
                    "tool_call_id": tool_call_id,
                    "role": "tool",
                    "name": func_name,
                    "content": result_str
                })
            except Exception as e:
                results.append({
                    "tool_call_id": tool_call_id,
                    "role": "tool",
                    "name": func_name,
                    "content": f"Error executing {func_name}: {str(e)}"
                })
        else:
            results.append({
                "tool_call_id": tool_call_id,
                "role": "tool",
                "name": func_name,
                "content": f"Tool '{func_name}' is not available"
            })
    
    return results

