# SmartReach UI Design

## Overview
The SmartReach platform provides a comprehensive dashboard for managing B2B sales automation through a multi-agent framework.

## Pages & Features

### 1. Dashboard (`/`)
- **Stats Overview**: Key metrics (Total Leads, Active Agents, Avg Quality Score, Ready to Send)
- **Agent Status Panel**: Real-time status of all three agents with progress indicators
- **Recent Leads Grid**: Quick view of leads in the pipeline with status badges

### 2. Lead Management (`/leads`)
- **Search & Filter**: Search by company name or industry, filter by status
- **Lead Cards**: Visual cards showing:
  - Company name and industry
  - Current workflow status (researching → generating → evaluating → ready)
  - Research progress bars
  - Quality scores for completed leads
- **Add New Lead**: Button to add companies to the pipeline

### 3. Agent Workflow (`/workflow`)
- **Visual Pipeline**: Horizontal/vertical flow showing:
  - Research Agent → Content Generator → Quality Evaluator
  - Agent status indicators with progress
  - Visual arrows showing workflow direction
- **Agent Details**: Performance metrics for each agent:
  - Active tasks
  - Completed today
  - Average processing time

### 4. Content Editor (`/content`)
- **Lead Selector**: Dropdown to select which lead's content to view/edit
- **Content Editor**: Large textarea for editing generated outreach content
- **Quality Metrics Sidebar**:
  - Overall quality score (large display)
  - Breakdown by metric (Personalization, Clarity, Relevance, CTA)
  - Progress bars for each metric
- **Research Insights**: Context from research agent:
  - Industry focus
  - Recent news
  - Key decision makers
- **Action Buttons**:
  - Approve & Send
  - Request Revision
  - Export Content
  - Regenerate

## Design System

### Colors
- **Primary**: Blue scale (primary-500: #0ea5e9)
- **Status Colors**:
  - Researching: Blue
  - Generating: Yellow
  - Evaluating: Purple
  - Ready: Green
  - Error: Red

### Components
- **Navbar**: Top navigation with active state indicators
- **AgentStatus**: Reusable component showing agent name, status, and progress
- **LeadCard**: Reusable card component for displaying lead information

## Next Steps for Integration

1. **API Integration**: Connect all components to backend API endpoints
2. **Real-time Updates**: Add WebSocket or polling for live agent status
3. **Lead Detail View**: Expandable lead cards showing full research data
4. **Analytics Dashboard**: Charts and graphs for performance metrics
5. **Settings Page**: Configure agent parameters and thresholds

