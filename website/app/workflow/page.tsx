'use client'

import AgentStatus from '@/components/AgentStatus'

export default function WorkflowPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agent Workflow</h1>
          <p className="mt-2 text-gray-600">
            Visualize and monitor the multi-agent automation pipeline
          </p>
        </div>

        {/* Workflow Visualization */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Research Agent */}
            <div className="flex-1 text-center">
              <div className="mb-4">
                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Research Agent</h3>
                <p className="text-sm text-gray-600 mt-1">Gathering company data</p>
              </div>
              <AgentStatus name="Research Agent" status="running" progress={75} />
            </div>

            {/* Arrow */}
            <div className="hidden md:block text-4xl text-gray-400">→</div>
            <div className="md:hidden text-4xl text-gray-400">↓</div>

            {/* Content Generator */}
            <div className="flex-1 text-center">
              <div className="mb-4">
                <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl">✍️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Content Generator</h3>
                <p className="text-sm text-gray-600 mt-1">Creating personalized content</p>
              </div>
              <AgentStatus name="Content Generator" status="running" progress={45} />
            </div>

            {/* Arrow */}
            <div className="hidden md:block text-4xl text-gray-400">→</div>
            <div className="md:hidden text-4xl text-gray-400">↓</div>

            {/* Quality Evaluator */}
            <div className="flex-1 text-center">
              <div className="mb-4">
                <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl">⭐</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Quality Evaluator</h3>
                <p className="text-sm text-gray-600 mt-1">Assessing content quality</p>
              </div>
              <AgentStatus name="Quality Evaluator" status="completed" />
            </div>
          </div>
        </div>

        {/* Agent Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Research Agent Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Tasks:</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed Today:</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Processing Time:</span>
                <span className="font-medium">2.5 min</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Content Generator Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Tasks:</span>
                <span className="font-medium">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed Today:</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Processing Time:</span>
                <span className="font-medium">1.8 min</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quality Evaluator Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Tasks:</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed Today:</span>
                <span className="font-medium">15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Processing Time:</span>
                <span className="font-medium">0.9 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

