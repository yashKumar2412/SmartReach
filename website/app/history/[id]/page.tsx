'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, MapPin, Calendar, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'

interface Message {
  id: string
  company_name: string
  industry: string
  location: string
  content: string
  quality_score: number
}

interface Campaign {
  id: string
  product_service: string
  area: string
  created_at: string
  leads_found: number
  leads_selected: number
  status: 'completed' | 'in-progress'
  messages: Message[]
}

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/history/${id}`)
        if (!response.ok) {
          throw new Error('Campaign not found')
        }
        const data = await response.json()
        setCampaign(data)
      } catch (error) {
        console.error('Failed to fetch campaign:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaign()
  }, [id])

  const toggleCompany = (messageId: string) => {
    setExpandedCompanies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(messageId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) {
      return 'bg-green-800 text-white' // Dark green
    } else if (score >= 75) {
      return 'bg-green-600 text-white' // Green
    } else if (score >= 51) {
      return 'bg-yellow-600 text-white' // Yellow/Orange for 51-75
    } else {
      return 'bg-red-600 text-white' // Red for 0-50
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </main>
    )
  }

  if (!campaign) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h1>
            <Link href="/history" className="text-primary-600 hover:text-primary-700">
              ← Back to History
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const avgQualityScore = campaign.messages.length > 0
    ? Math.round(campaign.messages.reduce((sum, m) => sum + m.quality_score, 0) / campaign.messages.length)
    : 0

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/history"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{campaign.product_service}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {campaign.area}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(campaign.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
              {campaign.status.replace('-', ' ')}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Leads Found</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{campaign.leads_found}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Leads Selected</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{campaign.leads_selected}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Avg Quality Score</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {avgQualityScore}
            </div>
          </div>
        </div>

        {/* Companies - Collapsible */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Companies</h2>
          {campaign.messages.map((message) => {
            const isExpanded = expandedCompanies.has(message.id)
            return (
              <div key={message.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="flex items-center gap-4 p-6">
                  <button
                    onClick={() => toggleCompany(message.id)}
                    className="flex items-center gap-4 flex-1 hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors text-left"
                  >
                    <Building2 className="w-6 h-6 text-gray-400" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{message.company_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{message.industry}</span>
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
                    onClick={() => toggleCompany(message.id)}
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
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Generated Content</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(message.content, message.id)
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-600">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                        {message.content}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
