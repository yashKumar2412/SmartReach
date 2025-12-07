"""
Prompt templates for all agents

All prompts are defined here for better maintainability and formatting.
"""


# ============================================================================
# Lead Research Agent Prompts
# ============================================================================

COMPANY_GENERATION_PROMPT = """You are a B2B lead research expert. Generate a list of real companies that would benefit from "{product_service}" in the "{area}" area.

Additional context: {context}

For each company, provide:
- Company name (realistic, professional business names)
- Industry (specific industry category)
- Location (city and state, should be in or near "{area}")
- Description (2-3 sentences about what the company does)
- Website (realistic domain name format, e.g., companyname.com)

Generate {max_leads} companies. Make them diverse in size and industry focus, but all should be realistic businesses that could benefit from {product_service}.

Return as JSON array with this exact format:
[
  {{
    "name": "Company Name",
    "industry": "Industry Category",
    "location": "City, State",
    "description": "Brief description of what the company does",
    "website": "https://companyname.com"
  }},
  ...
]

Return ONLY valid JSON array, no additional text."""


COMPANY_ENRICHMENT_PROMPT = """Analyze this company and provide insights:

Company: {company_name}
Industry: {industry}
Location: {location}
Description: {description}

Product/Service: {product_service}
Context: {context}

Provide:
1. A brief company description (2-3 sentences)
2. Why they might need {product_service}
3. Any recent news or trends (if known)

Format as JSON with keys: description, relevance_reason, recent_news

Return ONLY valid JSON, no additional text."""


# ============================================================================
# Content Generation Agent Prompts
# ============================================================================

EMAIL_GENERATION_PROMPT = """You are an expert B2B sales email writer. Write a personalized cold email FROM YOUR COMPANY TO THE TARGET COMPANY.

CRITICAL: You are writing as {your_company_name}, a company that provides {product_service}. You are reaching out to {company_name} to offer your services. The email should be written from YOUR perspective, not on behalf of the target company.

TARGET COMPANY INFORMATION (the company you're reaching out to):
- Name: {company_name}
- Industry: {industry}
- Location: {location}
- Description: {description}
- Recent News: {recent_news}

YOUR COMPANY INFORMATION:
- Company Name: {your_company_name}
- Product/Service: {product_service}
- Your Value Proposition/Angle: {angle}
- Additional Context: {context}

REQUIREMENTS:
1. Write a compelling subject line (max 60 characters)
2. Start the email by introducing YOUR COMPANY ({your_company_name}) and mention that you provide {product_service}
3. Use your company name ({your_company_name}) naturally throughout the email when referring to your company
4. Explain how {your_company_name}'s services can help {company_name} specifically
5. Personalize based on the target company's information (industry, location, description)
6. Keep body concise (150-200 words)
7. Include a clear, specific call-to-action (e.g., "Would you be open to a brief conversation?", "Can we schedule a call?")
8. Professional but friendly tone
9. Reference specific company details when possible to show you've researched them
10. Emphasize your unique angle/value proposition ({angle}) - explain how {your_company_name} can help {company_name}

IMPORTANT: 
- Use "{your_company_name}" or "we" to refer to your company
- Use "you" or "{company_name}" to refer to the target company
- Make it clear you are offering YOUR services to help THEM
- Do NOT write as if you are the target company
- Include your company name ({your_company_name}) in the email signature/closing

FORMAT:
Subject: [subject line]

[email body]

Return the email in the exact format above."""


# ============================================================================
# Quality Evaluation Agent Prompts
# ============================================================================

QUALITY_EVALUATION_PROMPT = """Evaluate this cold email on a scale of 0-100 for each criterion:

EMAIL CONTENT:
{content}

COMPANY CONTEXT:
- Name: {company_name}
- Industry: {industry}
- Description: {description}

PRODUCT/SERVICE: {product_service}

EVALUATION CRITERIA:
1. Personalization (0-100): How well does it reference company-specific information?
2. Clarity (0-100): Is the message clear and easy to understand?
3. Relevance (0-100): How relevant is the content to the company's needs?
4. Call-to-Action (0-100): How effective and clear is the CTA?

Return scores as JSON:
{{
  "personalization": <score>,
  "clarity": <score>,
  "relevance": <score>,
  "call_to_action": <score>
}}"""

