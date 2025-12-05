'use client'

interface AgentStatusProps {
  name: string
  status: 'idle' | 'running' | 'completed' | 'error'
  progress?: number
}

export default function AgentStatus({ name, status, progress }: AgentStatusProps) {
  const statusColors = {
    idle: 'bg-gray-200 text-gray-600',
    running: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
  }

  const statusIcons = {
    idle: '○',
    running: '⟳',
    completed: '✓',
    error: '✗',
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {statusIcons[status]} {status}
        </span>
      </div>
      {status === 'running' && progress !== undefined && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

