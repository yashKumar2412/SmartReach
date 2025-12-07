'use client'

import { useState } from 'react'
import { Loader2, Check, Circle, Search, FileText, Star } from 'lucide-react'
import AgentStatus from '@/components/AgentStatus'

type Stage = 'input' | 'researching' | 'review' | 'generating' | 'refine' | 'complete'

interface Lead {
  id: string
  companyName: string
  industry: string
  location: string
  description: string
  selected: boolean
}

export default function GeneratePage() {
  const [stage, setStage] = useState<Stage>('input')
  const [productService, setProductService] = useState('')
  const [area, setArea] = useState('')
  const [context, setContext] = useState('')
  const [maxLeads, setMaxLeads] = useState(10)
  const [leads, setLeads] = useState<Lead[]>([])
  const [generatedContent, setGeneratedContent] = useState('')
  const [qualityScore, setQualityScore] = useState(0)
  const [researchProgress, setResearchProgress] = useState(0)

  const handleStartResearch = () => {
    if (!productService.trim() || !area.trim()) return
    
    setStage('researching')
    setResearchProgress(0)
    
    // Simulate research progress
    const interval = setInterval(() => {
      setResearchProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          // Mock leads data
          setLeads([
            {
              id: '1',
              companyName: 'TechCorp Inc.',
              industry: 'Technology',
              location: area,
              description: 'Enterprise software solutions provider',
              selected: false,
            },
            {
              id: '2',
              companyName: 'DataFlow Systems',
              industry: 'Data Analytics',
              location: area,
              description: 'Business intelligence and analytics platform',
              selected: false,
            },
            {
              id: '3',
              companyName: 'CloudScale Solutions',
              industry: 'Cloud Services',
              location: area,
              description: 'Cloud infrastructure and migration services',
              selected: false,
            },
            {
              id: '4',
              companyName: 'InnovateLabs',
              industry: 'Software Development',
              location: area,
              description: 'Custom software development and consulting',
              selected: false,
            },
          ])
          setStage('review')
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const handleSelectLeads = () => {
    const selectedLeads = leads.filter(lead => lead.selected)
    if (selectedLeads.length === 0) {
      alert('Please select at least one lead')
      return
    }
    
    setStage('generating')
    setQualityScore(0)
    
    // Simulate content generation
    setTimeout(() => {
      setGeneratedContent(`Subject: Partnership Opportunity - ${productService}

Dear [Decision Maker],

I hope this message finds you well. I've been researching companies in ${area} that could benefit from ${productService}.

Based on our analysis, I believe there's a strong alignment between your company's needs and our solution. We've helped similar businesses in your industry achieve significant improvements.

I'd love to schedule a brief call to discuss how we might collaborate. Would you be available for a 15-minute conversation next week?

Best regards,
[Your Name]`)
      
      setQualityScore(85)
      setStage('refine')
    }, 2000)
  }

  const handleApprove = () => {
    setStage('complete')
  }

  const toggleLeadSelection = (id: string) => {
    setLeads(leads.map(lead => 
      lead.id === id ? { ...lead, selected: !lead.selected } : lead
    ))
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lead Generation</h1>
          <p className="mt-2 text-gray-600">
            Generate leads and create personalized outreach content
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${stage === 'input' || stage === 'researching' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stage === 'input' || stage === 'researching' ? 'bg-primary-100' : 'bg-gray-100'}`}>
                {stage === 'input' ? (
                  <Circle className="w-5 h-5" />
                ) : stage === 'researching' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
              </div>
              <span className="ml-3 font-medium">Research</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${stage !== 'input' && stage !== 'researching' ? 'bg-primary-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center ${stage === 'review' || stage === 'generating' || stage === 'refine' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stage === 'review' || stage === 'generating' || stage === 'refine' ? 'bg-primary-100' : 'bg-gray-100'}`}>
                {stage === 'review' ? (
                  <Circle className="w-5 h-5" />
                ) : stage === 'generating' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : stage === 'refine' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              <span className="ml-3 font-medium">Generate</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${stage === 'complete' ? 'bg-primary-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center ${stage === 'complete' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stage === 'complete' ? 'bg-primary-100' : 'bg-gray-100'}`}>
                {stage === 'complete' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              <span className="ml-3 font-medium">Complete</span>
            </div>
          </div>
        </div>

        {/* Stage 1: Input */}
        {stage === 'input' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Start Lead Generation</h2>
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product or Service
                </label>
                <input
                  type="text"
                  value={productService}
                  onChange={(e) => setProductService(e.target.value)}
                  placeholder="e.g., Enterprise SaaS solutions, Cloud consulting services"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Describe the product or service you're offering
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Area/Location
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g., San Francisco Bay Area, New York City, Remote"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Specify the geographic area or market segment
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Context (Optional)
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g., Target companies with 50-200 employees, focus on companies using legacy systems, prioritize healthcare industry..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Provide additional context to help refine the lead search and content generation
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Leads to Generate
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={maxLeads}
                  onChange={(e) => setMaxLeads(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Select the maximum number of leads to research and generate content for (1-20)
                </p>
              </div>
              <button
                onClick={handleStartResearch}
                disabled={!productService.trim() || !area.trim()}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Start Research →
              </button>
            </div>
          </div>
        )}

        {/* Stage 2: Researching */}
        {stage === 'researching' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Researching Leads</h2>
            <AgentStatus name="Research Agent" status="running" progress={researchProgress} />
            <p className="mt-4 text-gray-600">
              Gathering company information and identifying potential leads in {area}...
            </p>
          </div>
        )}

        {/* Stage 3: Review Leads */}
        {stage === 'review' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Review & Select Leads</h2>
            <p className="text-gray-600 mb-6">
              Found {leads.length} potential leads. Select the companies you'd like to generate content for.
            </p>
            <div className="space-y-4 mb-6">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    lead.selected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleLeadSelection(lead.id)}
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={lead.selected}
                      onChange={() => toggleLeadSelection(lead.id)}
                      className="mt-1 mr-4 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{lead.companyName}</h3>
                      <p className="text-sm text-gray-600 mt-1">{lead.industry} • {lead.location}</p>
                      <p className="text-sm text-gray-500 mt-2">{lead.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStage('input')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSelectLeads}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Generate Content for Selected ({leads.filter(l => l.selected).length}) →
              </button>
            </div>
          </div>
        )}

        {/* Stage 4: Generating */}
        {stage === 'generating' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Generating Content</h2>
            <div className="space-y-4">
              <AgentStatus name="Content Generator" status="running" progress={50} />
              <AgentStatus name="Quality Evaluator" status="running" progress={30} />
            </div>
            <p className="mt-4 text-gray-600">
              Creating personalized cold emails and evaluating quality...
            </p>
          </div>
        )}

        {/* Stage 5: Refine Content */}
        {stage === 'refine' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Generated Content</h2>
                  <button
                    onClick={() => setStage('generating')}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Regenerate
                  </button>
                </div>
                <textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Score</h3>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-primary-600 mb-2">
                    {qualityScore}
                  </div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={handleApprove}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve & Save
                  </button>
                  <button
                    onClick={() => setStage('generating')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Request Revision
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stage 6: Complete */}
        {stage === 'complete' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Campaign Complete!</h2>
            <p className="text-gray-600 mb-6">
              Your lead generation campaign has been saved. You can view it in the history page.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/"
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </a>
              <a
                href="/history"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                View History →
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

