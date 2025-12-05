import AgentStatus from '@/components/AgentStatus'
import LeadCard from '@/components/LeadCard'

export default function Home() {
  // Mock data - will be replaced with API calls
  const recentLeads = [
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
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor your automated lead research and outreach pipeline
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Leads</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">24</div>
            <div className="mt-1 text-sm text-green-600">+12% from last week</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Active Agents</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">3</div>
            <div className="mt-1 text-sm text-blue-600">All systems operational</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Avg Quality Score</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">84</div>
            <div className="mt-1 text-sm text-gray-600">Above threshold</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Ready to Send</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">8</div>
            <div className="mt-1 text-sm text-purple-600">Pending review</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agent Status */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Agent Status</h2>
            <div className="space-y-4">
              <AgentStatus name="Research Agent" status="running" progress={75} />
              <AgentStatus name="Content Generator" status="running" progress={45} />
              <AgentStatus name="Quality Evaluator" status="completed" />
            </div>
          </div>

          {/* Recent Leads */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Leads</h2>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentLeads.map((lead, index) => (
                <LeadCard 
                  key={`${lead.companyName}-${index}`}
                  companyName={lead.companyName}
                  industry={lead.industry}
                  status={lead.status}
                  researchProgress={lead.researchProgress}
                  qualityScore={lead.qualityScore}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
