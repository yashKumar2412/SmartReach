'use client'

import React, { useState } from 'react'

export default function ContentPage() {
  const [selectedLead, setSelectedLead] = useState('TechCorp Inc.')
  const [content, setContent] = useState(`Subject: Partnership Opportunity with TechCorp Inc.

Dear [Decision Maker],

I hope this message finds you well. I've been following TechCorp Inc.'s innovative work in the technology sector, particularly your recent expansion into cloud infrastructure solutions.

Based on our research, I believe there's a strong alignment between your company's goals and our enterprise solutions. We've helped similar technology companies achieve significant improvements in operational efficiency and cost reduction.

I'd love to schedule a brief call to discuss how we might collaborate. Would you be available for a 15-minute conversation next week?

Best regards,
[Your Name]`)

  const qualityMetrics = {
    personalization: 92,
    clarity: 88,
    relevance: 85,
    callToAction: 90,
    overall: 87,
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content Editor</h1>
          <p className="mt-2 text-gray-600">
            Review and edit generated outreach content with quality insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lead Selector */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Lead
              </label>
              <select
                value={selectedLead}
                onChange={(e) => setSelectedLead(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option>TechCorp Inc.</option>
                <option>DataFlow Systems</option>
                <option>CloudScale Solutions</option>
                <option>InnovateLabs</option>
              </select>
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Generated Content</h2>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                    Regenerate
                  </button>
                  <button className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Save Changes
                  </button>
                </div>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                placeholder="Generated content will appear here..."
              />
            </div>
          </div>

          {/* Quality Metrics Sidebar */}
          <div className="space-y-6">
            {/* Quality Score */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Score</h3>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-primary-600 mb-2">
                  {qualityMetrics.overall}
                </div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>

              <div className="space-y-4">
                {Object.entries(qualityMetrics)
                  .filter(([key]) => key !== 'overall')
                  .map(([metric, score]) => (
                    <div key={metric}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 capitalize">{metric}</span>
                        <span className="font-medium">{score}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Research Insights */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Insights</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-medium text-gray-900 mb-1">Industry Focus</div>
                  <div className="text-gray-600">Cloud Infrastructure, Enterprise Solutions</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-1">Recent News</div>
                  <div className="text-gray-600">Expansion into cloud services announced Q3 2024</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-1">Key Decision Makers</div>
                  <div className="text-gray-600">CTO: John Smith, VP Engineering: Jane Doe</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Approve & Send
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Request Revision
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Export Content
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

