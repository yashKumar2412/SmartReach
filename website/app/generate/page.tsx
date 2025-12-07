'use client'

import { useState, useEffect } from 'react'
import { Loader2, Check, Circle, ChevronDown, ChevronUp, Building2 } from 'lucide-react'
import AgentStatus from '@/components/AgentStatus'
import { useRouter, useSearchParams } from 'next/navigation'

type Stage = 'input' | 'researching' | 'review' | 'generating' | 'refine' | 'complete'

interface Lead {
  id: string
  companyName: string
  industry: string
  location: string
  description: string
  selected: boolean
}

interface GeneratedMessage {
  id: string
  company_name: string
  industry: string
  location: string
  content: string
  quality_score: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function GeneratePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [stage, setStage] = useState<Stage>('input')
  const [productService, setProductService] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [angle, setAngle] = useState('')
  const [area, setArea] = useState('')
  const [context, setContext] = useState('')
  const [maxLeads, setMaxLeads] = useState(10)
  const [campaignId, setCampaignId] = useState<string>('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([])
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(0)
  const [researchProgress, setResearchProgress] = useState(0)
  const [error, setError] = useState<string>('')
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set())
  const [averageQualityScore, setAverageQualityScore] = useState<number>(0)
  const [restoring, setRestoring] = useState(false)
  const [services, setServices] = useState<string[]>([])
  const [companyName, setCompanyName] = useState<string>('')
  const [servicesLoading, setServicesLoading] = useState(true)

  // Fetch company profile services
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/`)
        const data = await response.json()
        setServices(data.services || [])
        setCompanyName(data.company_name || '')
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setServicesLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // Check for campaign ID in URL to restore in-progress campaign
  useEffect(() => {
    const campaignIdParam = searchParams.get('campaign')
    if (campaignIdParam) {
      handleRestoreCampaign(campaignIdParam)
    }
  }, [searchParams])

  const handleRestoreCampaign = async (id: string) => {
    setRestoring(true)
    setError('')
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/campaigns/${id}/restore`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to restore campaign' }))
        throw new Error(errorData.detail || 'Failed to restore campaign')
      }
      
      const data = await response.json()
      setCampaignId(data.campaign_id)
      
      // Restore form fields from campaign (we'll need to fetch campaign details)
      const campaignResponse = await fetch(`${API_BASE_URL}/api/history/${id}`)
      if (campaignResponse.ok) {
        const campaignData = await campaignResponse.json()
        setProductService(campaignData.product_service)
        setArea(campaignData.area)
        setContext(campaignData.context || '')
        setMaxLeads(campaignData.max_leads)
      }
      
      // Convert API response to Lead format
      const convertedLeads: Lead[] = data.leads.map((lead: any) => ({
        id: lead.id,
        companyName: lead.name,
        industry: lead.industry,
        location: lead.location,
        description: lead.description || '',
        selected: false,
      }))
      
      setLeads(convertedLeads)
      setStage('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore campaign')
    } finally {
      setRestoring(false)
    }
  }

  const handleStartResearch = async () => {
    const serviceToUse = selectedService || productService
    if (!serviceToUse.trim() || !area.trim()) {
      setError('Please select a service and provide a target area.')
      return
    }
    
    setStage('researching')
    setResearchProgress(0)
    setError('')
    
    // Simulate progress while API call is in progress
    const progressInterval = setInterval(() => {
      setResearchProgress((prev) => Math.min(prev + 5, 90))
    }, 200)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/campaigns/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_service: selectedService || productService,
          area: area,
          context: context || null,
          angle: angle || null,
          max_leads: maxLeads,
        }),
      })
      
      clearInterval(progressInterval)
      setResearchProgress(100)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Research failed' }))
        throw new Error(errorData.detail || 'Research failed')
      }
      
      const data = await response.json()
      setCampaignId(data.campaign_id)
      
      // Convert API response to Lead format
      const convertedLeads: Lead[] = data.leads.map((lead: any) => ({
        id: lead.id,
        companyName: lead.name,
        industry: lead.industry,
        location: lead.location,
        description: lead.description || '',
        selected: false,
      }))
      
      setLeads(convertedLeads)
      setStage('review')
    } catch (err) {
      clearInterval(progressInterval)
      setError(err instanceof Error ? err.message : 'Failed to start research')
      setStage('input')
    }
  }

  const handleSelectLeads = async () => {
    const selectedLeads = leads.filter(lead => lead.selected)
    if (selectedLeads.length === 0) {
      alert('Please select at least one lead')
      return
    }
    
    setStage('generating')
    setError('')
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/campaigns/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          selected_lead_ids: selectedLeads.map(lead => lead.id),
          product_service: productService,
          context: context || null,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Content generation failed' }))
        throw new Error(errorData.detail || 'Content generation failed')
      }
      
      const data = await response.json()
      const sortedMessages = [...data.messages].sort((a, b) => b.quality_score - a.quality_score)
      setGeneratedMessages(sortedMessages)
      setAverageQualityScore(data.average_quality_score || 0)
      setExpandedMessages(new Set(sortedMessages.map((m: GeneratedMessage) => m.id)))
      setSelectedMessageIndex(0)
      setStage('refine')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content')
      setStage('review')
    }
  }

  const handleApprove = async () => {
    setError('')
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/campaigns/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          product_service: productService,
          area: area,
          context: context || null,
          max_leads: maxLeads,
          leads_found: leads.length,
          leads_selected: leads.filter(l => l.selected).length,
          messages: generatedMessages,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to save campaign' }))
        throw new Error(errorData.detail || 'Failed to save campaign')
      }
      
      setStage('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save campaign')
    }
  }

  const toggleLeadSelection = (id: string) => {
    setLeads(leads.map(lead => 
      lead.id === id ? { ...lead, selected: !lead.selected } : lead
    ))
  }

  const toggleSelectAll = () => {
    const allSelected = leads.every(lead => lead.selected)
    setLeads(leads.map(lead => ({ ...lead, selected: !allSelected })))
  }

  const toggleMessage = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  const handleRegenerateSingle = async () => {
    // Regenerate all messages (backend doesn't support single regeneration)
    setError('')
    setStage('generating')
    
    try {
      const selectedLeads = leads.filter(lead => lead.selected)
      const response = await fetch(`${API_BASE_URL}/api/campaigns/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          selected_lead_ids: selectedLeads.map(lead => lead.id),
          product_service: selectedService || productService,
          context: context || null,
          angle: angle || null,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Content generation failed' }))
        throw new Error(errorData.detail || 'Content generation failed')
      }
      
      const data = await response.json()
      // Sort messages by quality_score descending (highest first)
      const sortedMessages = [...data.messages].sort((a, b) => b.quality_score - a.quality_score)
      setGeneratedMessages(sortedMessages)
      setAverageQualityScore(data.average_quality_score || 0)
      setExpandedMessages(new Set(sortedMessages.map((m: GeneratedMessage) => m.id)))
      setStage('refine')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate content')
      setStage('refine')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) {
      return 'bg-green-800 text-white'
    } else if (score >= 75) {
      return 'bg-green-600 text-white'
    } else if (score >= 51) {
      return 'bg-yellow-600 text-white'
    } else {
      return 'bg-red-600 text-white'
    }
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Restoring Campaign */}
        {restoring && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800">Restoring campaign state...</p>
          </div>
        )}

        {/* Stage 1: Input */}
        {stage === 'input' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Start Lead Generation</h2>
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Service
                </label>
                {servicesLoading ? (
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-500">Loading services...</span>
                  </div>
                ) : services.length > 0 ? (
                  <>
                    <div className="relative">
                      <select
                        value={selectedService}
                        onChange={(e) => {
                          setSelectedService(e.target.value)
                          if (e.target.value) {
                            setProductService(e.target.value)
                          }
                        }}
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white appearance-none cursor-pointer hover:border-gray-400 transition-colors outline-none"
                        style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                      >
                        <option value="">Select a service...</option>
                        {services.map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Or enter a custom service below
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-amber-600 mb-2">
                    No services found. Please add services in your company profile on the dashboard.
                  </p>
                )}
                <input
                  type="text"
                  value={productService}
                  onChange={(e) => {
                    setProductService(e.target.value)
                    if (!selectedService) {
                      setSelectedService('')
                    }
                  }}
                  placeholder={services.length > 0 ? "Or enter a custom service..." : "e.g., Enterprise SaaS solutions, Cloud consulting services"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mt-2"
                />
                <p className="mt-2 text-sm text-gray-500">
                  {services.length > 0 ? "Custom service description" : "Describe the product or service you're offering"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Angle / How You Can Help
                </label>
                <textarea
                  value={angle}
                  onChange={(e) => setAngle(e.target.value)}
                  placeholder="e.g., We help companies reduce costs by 30% through automation, We specialize in migrating legacy systems to the cloud, We provide 24/7 support with guaranteed response times..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Describe your unique value proposition or how you can help potential leads
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
                disabled={(!selectedService.trim() && !productService.trim()) || !area.trim()}
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
            {/* Select All Button */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <input
                  type="checkbox"
                  checked={leads.length > 0 && leads.every(lead => lead.selected)}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  onClick={(e) => e.stopPropagation()}
                />
                <span>{leads.every(lead => lead.selected) ? 'Deselect All' : 'Select All'}</span>
              </button>
            </div>
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
            <AgentStatus name="Generating Content" status="running" progress={50} />
            <p className="mt-4 text-gray-600">
              Creating personalized cold emails and evaluating quality...
            </p>
          </div>
        )}

        {/* Stage 5: Refine Content */}
        {stage === 'refine' && generatedMessages.length > 0 && (
          <div className="space-y-6">
            {/* Average Quality Score */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Quality Score</h3>
                  <p className="text-sm text-gray-600">Across all {generatedMessages.length} generated messages</p>
                </div>
                <div className={`flex items-center justify-center w-24 h-24 rounded-lg ${getScoreColor(Math.round(averageQualityScore))}`}>
                  <div className="text-center">
                    <div className="text-4xl font-bold">{Math.round(averageQualityScore)}</div>
                    <div className="text-xs opacity-90">/100</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex gap-4">
                <button
                  onClick={handleApprove}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Approve & Save All
                </button>
                <button
                  onClick={handleRegenerateSingle}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Regenerate All
                </button>
              </div>
            </div>

            {/* Generated Messages - Collapsible */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Generated Messages</h2>
              {generatedMessages.map((message) => {
                const isExpanded = expandedMessages.has(message.id)
                return (
                  <div key={message.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="flex items-center gap-4 p-6">
                      <button
                        onClick={() => toggleMessage(message.id)}
                        className="flex items-center gap-4 flex-1 hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors text-left"
                      >
                        <Building2 className="w-6 h-6 text-gray-400" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{message.company_name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>{message.industry}</span>
                            <span>•</span>
                            <span>{message.location}</span>
                          </div>
                        </div>
                      </button>
                      <div className={`flex items-center justify-center w-20 h-20 rounded-lg ${getScoreColor(message.quality_score)} flex-shrink-0`}>
                        <div className="text-center">
                          <div className="text-3xl font-bold">{message.quality_score}</div>
                          <div className="text-xs opacity-90">/100</div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleMessage(message.id)}
                        className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    
                    {isExpanded && (
                      <div className="border-t border-gray-200 p-6 bg-gray-50">
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Generated Content</h4>
                          <textarea
                            value={message.content}
                            onChange={(e) => {
                              const updated = [...generatedMessages]
                              const index = updated.findIndex(m => m.id === message.id)
                              if (index !== -1) {
                                updated[index].content = e.target.value
                                setGeneratedMessages(updated)
                              }
                            }}
                            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm bg-white"
                          />
                        </div>
                        <div className="flex gap-4">
                          <button
                            onClick={handleApprove}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={handleRegenerateSingle}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                          >
                            Regenerate
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Stage 6: Complete */}
        {stage === 'complete' && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Campaign Complete!</h2>
              <p className="text-gray-600 mb-6">
                Your lead generation campaign has been successfully saved.
              </p>
            </div>
            
            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Product/Service</div>
                  <div className="text-base font-medium text-gray-900">{productService}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Target Area</div>
                  <div className="text-base font-medium text-gray-900">{area}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Leads Found</div>
                  <div className="text-base font-medium text-gray-900">{leads.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Messages Generated</div>
                  <div className="text-base font-medium text-gray-900">{generatedMessages.length}</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <a
                href="/"
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </a>
              {campaignId && (
                <a
                  href={`/history/${campaignId}`}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  View Campaign →
                </a>
              )}
              <a
                href="/history"
                className="px-6 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
              >
                View All History →
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

