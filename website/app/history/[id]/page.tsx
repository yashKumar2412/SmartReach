'use client'

import Link from 'next/link'
import { ArrowLeft, Mail, Building2, MapPin, Calendar } from 'lucide-react'

interface Message {
  id: string
  companyName: string
  industry: string
  location: string
  content: string
  qualityScore: number
  status: 'draft' | 'approved' | 'sent'
}

interface Campaign {
  id: string
  productService: string
  area: string
  date: string
  leadsFound: number
  contentGenerated: number
  status: 'completed' | 'in-progress'
  messages: Message[]
}

// Mock data - in real app, this would come from API
const mockCampaigns: Record<string, Campaign> = {
  '1': {
    id: '1',
    productService: 'Enterprise SaaS Solutions',
    area: 'San Francisco Bay Area',
    date: '2024-12-03',
    leadsFound: 12,
    contentGenerated: 12,
    status: 'completed',
    messages: [
      {
        id: '1',
        companyName: 'TechCorp Inc.',
        industry: 'Technology',
        location: 'San Francisco, CA',
        content: `Subject: Partnership Opportunity with TechCorp Inc.

Dear [Decision Maker],

I hope this message finds you well. I've been following TechCorp Inc.'s innovative work in the technology sector, particularly your recent expansion into cloud infrastructure solutions.

Based on our research, I believe there's a strong alignment between your company's goals and our enterprise SaaS solutions. We've helped similar technology companies achieve significant improvements in operational efficiency and cost reduction.

I'd love to schedule a brief call to discuss how we might collaborate. Would you be available for a 15-minute conversation next week?

Best regards,
[Your Name]`,
        qualityScore: 87,
        status: 'sent',
      },
      {
        id: '2',
        companyName: 'DataFlow Systems',
        industry: 'Data Analytics',
        location: 'Palo Alto, CA',
        content: `Subject: Partnership Opportunity - Enterprise SaaS Solutions

Dear [Decision Maker],

I hope this message finds you well. I've been researching companies in the San Francisco Bay Area that could benefit from enterprise SaaS solutions.

Based on our analysis, I believe there's a strong alignment between your company's needs and our solution. We've helped similar businesses in your industry achieve significant improvements.

I'd love to schedule a brief call to discuss how we might collaborate. Would you be available for a 15-minute conversation next week?

Best regards,
[Your Name]`,
        qualityScore: 85,
        status: 'sent',
      },
      {
        id: '3',
        companyName: 'CloudScale Solutions',
        industry: 'Cloud Services',
        location: 'Mountain View, CA',
        content: `Subject: Partnership Opportunity - Enterprise SaaS Solutions

Dear [Decision Maker],

I hope this message finds you well. I've been researching companies in the San Francisco Bay Area that could benefit from enterprise SaaS solutions.

Based on our analysis, I believe there's a strong alignment between your company's needs and our solution. We've helped similar businesses in your industry achieve significant improvements.

I'd love to schedule a brief call to discuss how we might collaborate. Would you be available for a 15-minute conversation next week?

Best regards,
[Your Name]`,
        qualityScore: 82,
        status: 'approved',
      },
    ],
  },
  '2': {
    id: '2',
    productService: 'Cloud Consulting Services',
    area: 'New York City',
    date: '2024-12-02',
    leadsFound: 8,
    contentGenerated: 8,
    status: 'completed',
    messages: [
      {
        id: '1',
        companyName: 'Enterprise Cloud Co.',
        industry: 'Cloud Services',
        location: 'New York, NY',
        content: `Subject: Cloud Consulting Services Opportunity

Dear [Decision Maker],

I hope this message finds you well. I've been researching companies in New York City that could benefit from cloud consulting services.

Based on our analysis, I believe there's a strong alignment between your company's needs and our solution.

I'd love to schedule a brief call to discuss how we might collaborate.

Best regards,
[Your Name]`,
        qualityScore: 90,
        status: 'sent',
      },
    ],
  },
  '3': {
    id: '3',
    productService: 'Data Analytics Platform',
    area: 'Remote',
    date: '2024-12-01',
    leadsFound: 15,
    contentGenerated: 15,
    status: 'in-progress',
    messages: [
      {
        id: '1',
        companyName: 'Analytics Pro',
        industry: 'Data Analytics',
        location: 'Remote',
        content: `Subject: Data Analytics Platform Opportunity

Dear [Decision Maker],

I hope this message finds you well. I've been researching companies that could benefit from our data analytics platform.

Based on our analysis, I believe there's a strong alignment between your company's needs and our solution.

I'd love to schedule a brief call to discuss how we might collaborate.

Best regards,
[Your Name]`,
        qualityScore: 88,
        status: 'draft',
      },
    ],
  },
  '4': {
    id: '4',
    productService: 'Cybersecurity Solutions',
    area: 'Austin, TX',
    date: '2024-11-28',
    leadsFound: 6,
    contentGenerated: 6,
    status: 'completed',
    messages: [
      {
        id: '1',
        companyName: 'SecureNet Pro',
        industry: 'Cybersecurity',
        location: 'Austin, TX',
        content: `Subject: Cybersecurity Solutions Opportunity

Dear [Decision Maker],

I hope this message finds you well. I've been researching companies in Austin, TX that could benefit from cybersecurity solutions.

Based on our analysis, I believe there's a strong alignment between your company's needs and our solution.

I'd love to schedule a brief call to discuss how we might collaborate.

Best regards,
[Your Name]`,
        qualityScore: 92,
        status: 'sent',
      },
    ],
  },
}

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const campaign = mockCampaigns[id]

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

  const getMessageStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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
              <h1 className="text-3xl font-bold text-gray-900">{campaign.productService}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {campaign.area}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(campaign.date).toLocaleDateString('en-US', {
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
            <div className="mt-2 text-3xl font-bold text-gray-900">{campaign.leadsFound}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Content Generated</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{campaign.contentGenerated}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Avg Quality Score</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {Math.round(campaign.messages.reduce((sum, m) => sum + m.qualityScore, 0) / campaign.messages.length)}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Generated Messages</h2>
          {campaign.messages.map((message) => (
            <div key={message.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-900">{message.companyName}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 ml-8">
                    <span>{message.industry}</span>
                    <span>•</span>
                    <span>{message.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Quality Score</div>
                    <div className="text-lg font-bold text-primary-600">{message.qualityScore}/100</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMessageStatusColor(message.status)}`}>
                    {message.status}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>Generated Content</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {message.content}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

