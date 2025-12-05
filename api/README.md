# SmartReach API

Backend API for SmartReach B2B Sales Automation Platform.

## Getting Started

### Setup Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run the API

```bash
uvicorn main:app --reload
```

API will be available at [http://localhost:8000](http://localhost:8000)

## Project Structure

```
api/
├── main.py           # FastAPI application
├── agents/           # Multi-agent framework
├── services/          # Business logic
├── models/           # Data models
└── utils/            # Utility functions
```

