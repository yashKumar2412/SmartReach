'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Rocket, Search, FileText, Star, BarChart3, Users, ClipboardList, Building2, Plus, X } from 'lucide-react'

interface DashboardStats {
  total_campaigns: number
  total_leads_found: number
}

interface RecentActivity {
  id: string
  name: string
  status: 'completed' | 'in-progress'
}

interface DashboardData {
  stats: DashboardStats
  recent_activity: RecentActivity[]
}

interface CompanyProfile {
  company_name: string | null
  services: string[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function Home() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<CompanyProfile>({ company_name: "Marketmind AI Hub", services: [] })
  const [editingProfile, setEditingProfile] = useState(false)
  const [newCompanyName, setNewCompanyName] = useState('Marketmind AI Hub')
  const [newService, setNewService] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/`)
        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        // Fallback to mock data on error
        setDashboardData({
          stats: {
            total_campaigns: 0,
            total_leads_found: 0
          },
          recent_activity: []
        })
      } finally {
        setLoading(false)
      }
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/`)
      const data = await response.json()
      setProfile(data)
      setNewCompanyName(data.company_name || 'Marketmind AI Hub')
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setProfileLoading(false)
      }
    }

    fetchDashboard()
    fetchProfile()
  }, [])

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: newCompanyName,
          services: profile.services,
        }),
      })
      const data = await response.json()
      setProfile(data)
      setEditingProfile(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('Failed to save profile. Please try again.')
    }
  }

  const handleAddService = () => {
    if (newService.trim() && !profile.services.includes(newService.trim())) {
      setProfile({
        ...profile,
        services: [...profile.services, newService.trim()]
      })
      setNewService('')
    }
  }

  const handleRemoveService = (service: string) => {
    setProfile({
      ...profile,
      services: profile.services.filter(s => s !== service)
    })
  }

  const handleResetProfile = async () => {
    if (confirm('Are you sure you want to reset the company profile? This will clear all services and reset the company name to "Marketmind AI Hub".')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            company_name: 'Marketmind AI Hub',
            services: [],
          }),
        })
        const data = await response.json()
        setProfile(data)
        setNewCompanyName('Marketmind AI Hub')
      } catch (error) {
        console.error('Failed to reset profile:', error)
        alert('Failed to reset profile. Please try again.')
      }
    }
  }

  if (loading || !dashboardData) {
    return (
      <main className="h-full bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Welcome back, {profile.company_name || 'Marketmind AI Hub'}
          </h1>
        </div>

        {/* Company Profile Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Company Profile</h2>
            </div>
            {!editingProfile ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingProfile(true)}
                  className="px-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={handleResetProfile}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Reset
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingProfile(false)
                    setNewCompanyName(profile.company_name || 'Marketmind AI Hub')
                  }}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          {editingProfile ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="Enter your company name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Products & Services
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddService()}
                    placeholder="Add a service"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddService}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.services.map((service) => (
                    <span
                      key={service}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                    >
                      {service}
                      <button
                        onClick={() => handleRemoveService(service)}
                        className="hover:text-primary-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
              <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Company Name: </span>
                <span className="text-sm font-medium text-gray-900">
                  {profile.company_name || 'Marketmind AI Hub'}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Services: </span>
                {profile.services.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.services.map((service) => (
                      <span
                        key={service}
                        className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">No services added</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Half - What We Do */}
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col h-full">
            <div className="flex-1">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <Rocket className="w-12 h-12 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">SmartReach</h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Speed up your sales by automating your B2B lead generation with our intelligent multi-agent system. 
                  Our platform researches potential clients, generates personalized outreach content, 
                  and evaluates quality automatically.
                </p>
              </div>
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Search className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Lead Research</h3>
                    <p className="text-sm text-gray-600">Gather comprehensive company data and insights for your target market.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Content Generation</h3>
                    <p className="text-sm text-gray-600">Create personalized cold emails tailored to each lead.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Quality Assessment</h3>
                    <p className="text-sm text-gray-600">Assess content quality before sending.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-auto pt-6">
              <a
                href="/generate"
                className="w-full block text-center px-6 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-lg"
              >
                Start New Lead Generation →
              </a>
            </div>
          </div>

          {/* Right Half - Statistics & Activity */}
          <div className="flex flex-col space-y-6 h-full">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-500">Campaigns</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">{dashboardData.stats.total_campaigns}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-500">Leads Found</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">{dashboardData.stats.total_leads_found}</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                </div>
              </div>
              <div className="space-y-2 mb-6 flex-1 min-h-0 overflow-y-auto">
                {dashboardData.recent_activity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <ClipboardList className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium mb-2">No recent activity</p>
                    <p className="text-sm text-gray-400">Start your first campaign to see activity here</p>
                  </div>
                ) : (
                  dashboardData.recent_activity.map((activity, index) => (
                    <Link
                      key={activity.id}
                      href={`/history/${activity.id}`}
                      className="block"
                    >
                      <div className={`flex items-center justify-between py-3 ${
                        index < dashboardData.recent_activity.length - 1 ? 'border-b border-gray-200' : ''
                      } hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors`}>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{activity.name}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {activity.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              <a
                href="/history"
                className="w-full block text-center px-6 py-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
              >
                View Full History →
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
