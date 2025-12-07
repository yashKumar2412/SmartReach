'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, Trash2 } from 'lucide-react'

interface Campaign {
  id: string
  product_service: string
  area: string
  created_at: string
  leads_found: number
  leads_selected: number
  status: 'research-in-progress' | 'research-complete' | 'generation-in-progress' | 'generation-complete' | 'completed'
}

export default function HistoryPage() {
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/history/')
        const data = await response.json()
        setAllCampaigns(data)
      } catch (error) {
        console.error('Failed to fetch campaigns:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  const handleDeleteCampaign = async (campaignId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return
    }
    
    setDeletingCampaignId(campaignId)
    
    try {
      const response = await fetch(`http://localhost:8000/api/history/${campaignId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete campaign')
      }
      
      // Remove campaign from list
      setAllCampaigns(allCampaigns.filter(c => c.id !== campaignId))
    } catch (error) {
      console.error('Failed to delete campaign:', error)
      alert('Failed to delete campaign. Please try again.')
    } finally {
      setDeletingCampaignId(null)
    }
  }

  // Filter campaigns based on status and search query
  const filteredCampaigns = allCampaigns.filter(campaign => {
    // Filter by status
    if (statusFilter !== 'all' && campaign.status !== statusFilter) {
      return false
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      return (
        campaign.product_service.toLowerCase().includes(query) ||
        campaign.area.toLowerCase().includes(query)
      )
    }
    
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'research-in-progress':
      case 'generation-in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'research-complete':
      case 'generation-complete':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'research-in-progress':
        return 'Research In Progress'
      case 'research-complete':
        return 'Research Complete'
      case 'generation-in-progress':
        return 'Generation In Progress'
      case 'generation-complete':
        return 'Generation Complete'
      case 'completed':
        return 'Completed'
      default:
        return status.replace('-', ' ')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Campaign History</h1>
          <p className="mt-2 text-gray-600">
            View and manage your past lead generation campaigns
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white appearance-none cursor-pointer hover:border-gray-400 transition-colors outline-none"
                style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
              >
                <option value="all">All Statuses</option>
                <option value="research-in-progress">Research In Progress</option>
                <option value="research-complete">Research Complete</option>
                <option value="generation-in-progress">Generation In Progress</option>
                <option value="generation-complete">Generation Complete</option>
                <option value="completed">Completed</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="relative bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <Link 
                href={campaign.status !== 'completed' ? `/generate?campaign=${campaign.id}` : `/history/${campaign.id}`}
                className="block"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {campaign.product_service}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {getStatusLabel(campaign.status)}
                      </span>
                      {campaign.status !== 'completed' && (
                        <span className="text-xs text-primary-600 font-medium">
                          Click to continue →
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Location:</span> {campaign.area}
                    </p>
                    <p className="text-sm text-gray-500">
                      Created on {new Date(campaign.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6 flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{campaign.leads_found}</div>
                      <div className="text-xs text-gray-500">Leads Found</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{campaign.leads_selected}</div>
                      <div className="text-xs text-gray-500">Leads Selected</div>
                    </div>
                  </div>
                </div>
              </Link>
              <button
                onClick={(e) => handleDeleteCampaign(campaign.id, e)}
                disabled={deletingCampaignId === campaign.id}
                className="absolute top-4 right-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete campaign"
              >
                {deletingCampaignId === campaign.id ? (
                  <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            </div>
          ))}
        </div>

        {loading && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">Loading campaigns...</p>
          </div>
        )}

        {!loading && allCampaigns.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No campaigns found. Start your first lead generation campaign!</p>
            <a
              href="/generate"
              className="inline-block mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Start New Campaign →
            </a>
          </div>
        )}

        {!loading && allCampaigns.length > 0 && filteredCampaigns.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No campaigns match your filters. Try adjusting your search or status filter.</p>
          </div>
        )}
      </div>
    </main>
  )
}

