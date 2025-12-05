'use client'

import { useState } from 'react'
import LeadCard from '@/components/LeadCard'

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data
  const allLeads = [
    {
      companyName: 'TechCorp Inc.',
      industry: 'Technology',
      status: 'ready' as const,
      qualityScore: 87,
    },
    {
      companyName: 'DataFlow Systems',
      industry: 'Data Analytics',
      status: 'evaluating' as const,
      researchProgress: 95,
    },
    {
      companyName: 'CloudScale Solutions',
      industry: 'Cloud Services',
      status: 'generating' as const,
      researchProgress: 100,
    },
    {
      companyName: 'InnovateLabs',
      industry: 'Software Development',
      status: 'researching' as const,
      researchProgress: 65,
    },
    {
      companyName: 'SecureNet Pro',
      industry: 'Cybersecurity',
      status: 'ready' as const,
      qualityScore: 92,
    },
    {
      companyName: 'AI Dynamics',
      industry: 'Artificial Intelligence',
      status: 'researching' as const,
      researchProgress: 30,
    },
  ]

  const filteredLeads = allLeads.filter((lead) =>
    lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.industry.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="mt-2 text-gray-600">
            Manage and track all your leads through the automation pipeline
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by company name or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <option>All Statuses</option>
                <option>Researching</option>
                <option>Generating</option>
                <option>Evaluating</option>
                <option>Ready</option>
              </select>
              <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Add New Lead
              </button>
            </div>
          </div>
        </div>

        {/* Leads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead, index) => (
            <LeadCard key={index} {...lead} />
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No leads found matching your search.</p>
          </div>
        )}
      </div>
    </main>
  )
}

