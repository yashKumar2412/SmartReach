'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Campaign {
  id: string
  productService: string
  area: string
  date: string
  leadsFound: number
  contentGenerated: number
  status: 'completed' | 'in-progress'
}

export default function HistoryPage() {
  const [campaigns] = useState<Campaign[]>([
    {
      id: '1',
      productService: 'Enterprise SaaS Solutions',
      area: 'San Francisco Bay Area',
      date: '2024-12-03',
      leadsFound: 12,
      contentGenerated: 12,
      status: 'completed',
    },
    {
      id: '2',
      productService: 'Cloud Consulting Services',
      area: 'New York City',
      date: '2024-12-02',
      leadsFound: 8,
      contentGenerated: 8,
      status: 'completed',
    },
    {
      id: '3',
      productService: 'Data Analytics Platform',
      area: 'Remote',
      date: '2024-12-01',
      leadsFound: 15,
      contentGenerated: 15,
      status: 'in-progress',
    },
    {
      id: '4',
      productService: 'Cybersecurity Solutions',
      area: 'Austin, TX',
      date: '2024-11-28',
      leadsFound: 6,
      contentGenerated: 6,
      status: 'completed',
    },
  ])

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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
              <option>All Statuses</option>
              <option>Completed</option>
              <option>In Progress</option>
            </select>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <Link 
              key={campaign.id} 
              href={`/history/${campaign.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {campaign.productService}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {campaign.status.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Location:</span> {campaign.area}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created on {new Date(campaign.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 md:ml-6 flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{campaign.leadsFound}</div>
                    <div className="text-xs text-gray-500">Leads Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{campaign.contentGenerated}</div>
                    <div className="text-xs text-gray-500">Content Generated</div>
                  </div>
                  {campaign.status === 'completed' && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        // Handle export
                      }}
                      className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Export
                    </button>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {campaigns.length === 0 && (
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
      </div>
    </main>
  )
}

