# SmartReach

**Autonomous Multi-Agent B2B Lead Generation Platform**

SmartReach is an AI-powered platform that automates B2B lead generation and personalized outreach using specialized AI agents with **true agentic capabilities** including tool usage, verification, and iterative refinement.

## 🎯 Project Overview

SmartReach transforms the B2B sales workflow through a multi-agent system that:
- **Researches** potential leads using AI and real-time web verification
- **Generates** personalized cold emails tailored to each company
- **Evaluates** and automatically **refines** content quality
- **Manages** complete campaign workflows with state persistence

### Key Differentiator: True Agentic System

Unlike simple GPT wrappers, SmartReach implements **true agentic capabilities**:
- ✅ **Tool Usage**: Agents use external APIs (SerpAPI for web search)
- ✅ **Company Verification**: Verifies companies exist before using them
- ✅ **Real Data Enrichment**: Enriches leads with real-time web data
- ✅ **Iterative Refinement**: Automatically improves content quality
- ✅ **Autonomous Decision-Making**: Agents decide when to refine content

## 🏗️ Architecture

### Multi-Agent System

1. **Research Agent** (`research_agent.py`)
   - Generates potential leads using GPT-4
   - **Verifies companies exist** using web search (SerpAPI)
   - **Enriches with real data** from web search results
   - Filters out unverified companies

2. **Content Agent** (`content_agent.py`)
   - Generates personalized emails using GPT-4
   - **Automatically refines content** if quality < 80
   - Uses feedback loop for iterative improvement
   - Up to 3 refinement iterations

3. **Quality Agent** (`quality_agent.py`)
   - Evaluates content on 4 criteria (0-100 scale)
   - Provides detailed feedback for improvement
   - Calculates weighted overall score

4. **Orchestrator** (`orchestrator.py`)
   - Coordinates multi-agent workflow
   - Manages async processing
   - Handles state management

### Technology Stack

**Backend:**
- FastAPI (Python) - REST API framework
- SQLAlchemy - Database ORM
- SQLite - Database (development)
- OpenAI GPT-4 - AI/LLM
- SerpAPI - Web search for verification

**Frontend:**
- Next.js 14 - React framework
- TypeScript - Type safety
- Tailwind CSS - Styling

## 📋 Prerequisites

- Python 3.11+ (tested with Python 3.13)
- Node.js 18+ and npm
- OpenAI API key (required)
- SerpAPI key (required for company verification)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SmartReach
```

### 2. Backend Setup

```bash
cd api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with API keys
cat > .env << EOF
OPENAI_API_KEY=your_openai_api_key_here
SERPAPI_API_KEY=your_serpapi_key_here
EOF

# Run the API server
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

### 3. Frontend Setup

```bash
cd website

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at http://localhost:3000

### 4. Verify Setup

Test that everything works:

```bash
# In api directory with venv activated
python -c "from agents.research_agent import LeadResearchAgent; print('✅ Agents loaded')"
python -c "from agents.tools import search_web; print('✅ Tools loaded')"
```

## 🧪 Running Tests

### Functional Tests

```bash
cd api
source venv/bin/activate

# Run agent tests
python tests/test_agents.py

# Run API tests
python tests/test_api.py

# Or use pytest (if installed)
pytest tests/ -v
```

### Expected Test Results

- ✅ Research Agent: Generates and verifies leads
- ✅ Content Agent: Generates and refines content
- ✅ Quality Agent: Evaluates content quality
- ✅ Tools: Web search and verification working
- ✅ API Endpoints: All endpoints responding correctly

See `TEST_RESULTS.md` for detailed test results and screenshots.

## 📖 Usage

### Creating a Campaign

1. **Navigate to Generate Leads** page
2. **Fill in campaign details**:
   - Service: Select or enter service name
   - Your Angle: Value proposition
   - Target Area: Geographic location
   - Additional Context: Optional details
   - Max Leads: Number of leads to find

3. **Start Research**
   - System generates potential leads
   - **Verifies companies exist** (using SerpAPI)
   - **Enriches with real data**
   - Filters out unverified companies

4. **Select Leads**
   - Review verified leads
   - Select companies to target

5. **Generate Content**
   - System generates personalized emails
   - **Automatically refines if quality < 80**
   - Shows quality scores (0-100)

6. **Review & Approve**
   - Review generated emails
   - Approve and save campaign

### Viewing Campaign History

- Navigate to **History** page
- View all campaigns
- Click on campaign to see details
- View all generated messages with quality scores

## 🔧 Agentic Features

### 1. Company Verification

**Before**: Generated companies may not be real  
**After**: Only verified, real companies are used

```python
# Research Agent automatically verifies companies
leads = research_agent.execute(...)
# Only verified companies are returned
```

### 2. Real Data Enrichment

**Before**: Only GPT-generated data  
**After**: Enriched with real web search data

```python
# Companies enriched with real data from SerpAPI
[RESEARCH AGENT] Enriched CompanyName with real data from web_search
```

### 3. Iterative Content Refinement

**Before**: Content generated once, quality just reported  
**After**: Automatically refined if quality is low

```python
# Content Agent automatically refines
content, quality = content_agent.execute_with_refinement(...)
# If quality < 80, content is automatically improved
```

## 📁 Project Structure

```
SmartReach/
├── api/                          # Backend (FastAPI)
│   ├── agents/                   # Multi-agent system
│   │   ├── base.py              # Base agent with function calling
│   │   ├── research_agent.py    # Lead research with verification
│   │   ├── content_agent.py     # Content generation with refinement
│   │   ├── quality_agent.py     # Quality evaluation
│   │   ├── orchestrator.py      # Workflow coordination
│   │   └── tools/               # Agentic tools
│   │       ├── web_search.py    # Web search tool
│   │       └── company_data.py   # Company data tool
│   ├── routers/                  # API endpoints
│   ├── tests/                    # Functional tests
│   │   ├── test_agents.py       # Agent tests
│   │   └── test_api.py          # API tests
│   ├── main.py                  # FastAPI app
│   └── requirements.txt         # Dependencies
│
├── website/                      # Frontend (Next.js)
│   ├── app/                     # Pages
│   └── components/              # React components
│
└── README.md                     # This file
```

## 🎓 Key Features

### Core Features
- ✅ Automated lead research
- ✅ Personalized email generation
- ✅ Quality scoring (0-100)
- ✅ Campaign state management
- ✅ Company profile management
- ✅ Campaign history

### Agentic Features (Additional)
- ✅ **Company verification** using web search
- ✅ **Real data enrichment** from APIs
- ✅ **Iterative content refinement** (automatic)
- ✅ **Tool usage** (SerpAPI integration)
- ✅ **Autonomous decision-making**

## 📊 API Endpoints

### Campaigns
- `POST /api/campaigns/research` - Start lead research
- `POST /api/campaigns/generate` - Generate content
- `POST /api/campaigns/save` - Save campaign
- `GET /api/campaigns/{id}/restore` - Restore campaign

### Dashboard
- `GET /api/dashboard/` - Get statistics

### History
- `GET /api/history/` - List campaigns
- `GET /api/history/{id}` - Campaign details

### Profile
- `GET /api/profile/` - Get profile
- `PUT /api/profile/` - Update profile

## 🔒 Environment Variables

Create `.env` file in `api/` directory:

```env
OPENAI_API_KEY=your_openai_key
SERPAPI_API_KEY=your_serpapi_key
```

## 📝 Testing

See `TEST_RESULTS.md` for:
- Test execution results
- Screenshots of passing tests
- Functional test coverage

## 🤝 Contributing

This is a course project. For questions or issues, please contact the development team.

## 📄 License

This project is for educational purposes.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- SerpAPI for web search capabilities
- FastAPI and Next.js communities

---

**SmartReach - True Agentic Multi-Agent System for B2B Lead Generation**
