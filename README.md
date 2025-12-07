# SmartReach

Autonomous multi-agent framework for B2B lead research, content generation, and personalized outreach.

## Project Structure

```
SmartReach/
├── website/          # Frontend (Next.js)
└── api/              # Backend API (FastAPI)
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- OpenAI API key (required for lead generation and content creation)

### Environment Setup

#### Backend (API)

1. Create a virtual environment:
```bash
cd api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables (create `.env` file in `api/` directory):
```env
OPENAI_API_KEY=your_openai_api_key
```

4. Run the API server:
```bash
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

#### Frontend (Website)

1. Install dependencies:
```bash
cd website
npm install
```

2. Run the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000

## Overview

SmartReach automates the B2B sales workflow through specialized agents:

- **Lead Research Agent**: Generates company leads using LLM based on your criteria
- **Content Generation Agent**: Creates personalized outreach drafts using LLM
- **Quality Evaluation Agent**: Assesses draft quality and provides scores

Built with Next.js (frontend) and FastAPI (backend).

## Test Case

### Basic Lead Generation and Content Creation

**Setup:**
1. Start both the API and frontend servers (see Getting Started above)
2. Navigate to http://localhost:3000
3. Set up your company profile on the dashboard:
   - Company Name: `Global Marketing Solutions Inc.`
   - Add a service: `Digital Marketing Strategy`

**Test Steps:**
1. Go to the "Generate Leads" page
2. Fill in the form:
   - **Service**: Select `Digital Marketing Strategy` from dropdown
   - **Your Angle / How You Can Help**: 
     ```
     We are a full-service marketing agency with 15+ years of experience helping companies achieve measurable growth. Our team provides end-to-end solutions from strategy to execution, delivering proven results through data-driven campaigns.
     ```
   - **Target Area**: `San Francisco Bay Area`
   - **Additional Context**: `Target technology companies and SaaS businesses looking to scale their marketing efforts`
   - **Maximum Leads to Generate**: `5`
3. Click "Start Research"
4. Wait for research to complete (status will show `research-complete`)
5. Review the found leads
6. Select 3-5 leads by checking the boxes
7. Click "Generate Content for Selected"
8. Wait for content generation (status will show `generation-complete`)
9. Review the generated emails and quality scores
10. Click "Approve & Save All" to complete the campaign
11. Verify the campaign appears in the History page

**Expected Results:**
- ✅ Research phase finds leads matching the criteria (technology/SaaS companies in SF Bay Area)
- ✅ Generated emails are personalized and mention relevant marketing services
- ✅ Quality scores are displayed (0-100 scale) for each message
- ✅ Campaign is saved and viewable in History page
- ✅ Can view campaign details and all generated messages

**Note:** The system uses OpenAI's GPT-4 to generate realistic company leads based on your criteria. This approach is more reliable than web scraping and doesn't require additional API keys beyond OpenAI.

