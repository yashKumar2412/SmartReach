'use client'

interface LeadCardProps {
  companyName: string
  industry: string
  status: 'researching' | 'generating' | 'evaluating' | 'ready'
  researchProgress?: number
  qualityScore?: number
}

export default function LeadCard({
  companyName,
  industry,
  status,
  researchProgress,
  qualityScore,
}: LeadCardProps) {
  const statusColors = {
    researching: 'bg-blue-100 text-blue-800',
    generating: 'bg-yellow-100 text-yellow-800',
    evaluating: 'bg-purple-100 text-purple-800',
    ready: 'bg-green-100 text-green-800',
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{companyName}</h3>
          <p className="text-sm text-gray-500 mt-1">{industry}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {status}
        </span>
      </div>
      
      {researchProgress !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Research Progress</span>
            <span>{researchProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${researchProgress}%` }}
            />
          </div>
        </div>
      )}

      {qualityScore !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Quality Score:</span>
          <span className="text-lg font-semibold text-primary-600">{qualityScore}/100</span>
        </div>
      )}
    </div>
  )
}

