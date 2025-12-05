# SmartReach

Autonomous multi-agent framework for B2B lead research, content generation, and personalized outreach.

## Project Structure

```
SmartReach/
├── website/          # Frontend (Next.js)
└── api/              # Backend API (FastAPI)
```

## Getting Started

### Docker (Recommended)

```bash
docker-compose up -d --build
```

Services will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:8000

Both services run in development mode with hot reload enabled.

### Local Development

#### Frontend (Website)

```bash
cd website
npm install
npm run dev
```

#### Backend (API)

```bash
cd api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Overview

SmartReach automates the B2B sales workflow through specialized agents:

- **Lead Research Agent**: Gathers company data and insights
- **Content Generation Agent**: Creates personalized outreach drafts
- **Quality Evaluation Agent**: Assesses draft quality

Built with Next.js (frontend) and FastAPI (backend).

