import { Rocket, Search, FileText, Star, BarChart3, Users, ClipboardList } from 'lucide-react'

export default function Home() {
  return (
    <main className="h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="mt-auto pt-6 border-t border-gray-200">
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
                <div className="mt-2 text-3xl font-bold text-gray-900">12</div>
                <div className="mt-1 text-xs text-gray-600">Total campaigns</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-500">Leads Found</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">247</div>
                <div className="mt-1 text-xs text-gray-600">This month</div>
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
              <div className="space-y-2 mb-6 flex-1 min-h-0">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">SaaS Tools Campaign</p>
                    <p className="text-sm text-gray-500">Generated 12 cold emails</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Completed
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Cloud Services - Bay Area</p>
                    <p className="text-sm text-gray-500">Researching leads...</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    In Progress
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Enterprise Software - NYC</p>
                    <p className="text-sm text-gray-500">Content generation in progress</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    In Progress
                  </span>
                </div>
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
