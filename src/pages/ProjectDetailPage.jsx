import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { fetchProjectById, PROJECT_STAGES } from '../lib/api'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('progress')
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await fetchProjectById(id)
        if (mounted) setProject(data)
      } catch (e) {
        console.error('[ProjectDetailPage] load error:', e)
      }
      if (mounted) setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [id])

  if (loading) {
    return <div className="px-5 py-10 text-center text-gray-400 text-sm">載入中…</div>
  }

  if (!project) {
    return (
      <div className="px-5 py-10 text-center">
        <div className="text-3xl mb-2">😕</div>
        <div className="text-sm text-gray-500 mb-4">找不到此案件</div>
        <button onClick={() => navigate('/owner/projects')}
          className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm">
          返回案件列表
        </button>
      </div>
    )
  }

  // 如果 DB 沒有階段資料，用預設 14 個節點
  const stages = (project.project_stages && project.project_stages.length > 0)
    ? project.project_stages
    : PROJECT_STAGES.map((name, i) => ({
        id: `default-${i}`,
        name,
        status: 'pending',
        sort_order: i,
        start_date: '',
        end_date: '',
        detail: '',
        note: ''
      }))

  const progress = project.progress || 0
  const doneCount = stages.filter(s => s.status === 'done').length
  const activeStage = stages.find(s => s.status === 'active')

  return (
    <div className="px-5 py-5">
      {/* 案件標題 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={getStatusStyle(project.status)}>
            {project.status || '規劃中'}
          </span>
        </div>
        <h2 className="text-lg font-bold text-brand-800">{project.title}</h2>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
          <span>{project.address || '地址未定'} · {project.ping ? `${project.ping}坪` : ''}</span>
        </div>
        {(project.start_date || project.end_date) && (
          <div className="text-[11px] text-gray-400 mt-0.5">
            {project.start_date || '?'} ~ {project.end_date || '?'}
          </div>
        )}
      </div>

      {/* 進度條 */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-brand-800">整體進度</span>
          <span className="text-lg font-bold text-brand-600">{progress}%</span>
        </div>
        <div className="h-2.5 bg-cream-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all"
            style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between mt-2 text-[11px] text-gray-400">
          <span>已完成 {doneCount}/{stages.length} 階段</span>
          <span>{activeStage ? `進行中：${activeStage.name}` : '等待開工'}</span>
        </div>
      </div>

      {/* Tab 切換 */}
      <div className="flex gap-2 mb-4">
        <div onClick={() => setActiveTab('progress')}
          className={`flex-1 text-center py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${activeTab === 'progress' ? 'bg-brand-500 text-white' : 'bg-white text-gray-500 border border-cream-300'}`}>
          施工進度
        </div>
        <div onClick={() => setActiveTab('info')}
          className={`flex-1 text-center py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${activeTab === 'info' ? 'bg-brand-500 text-white' : 'bg-white text-gray-500 border border-cream-300'}`}>
          案件資訊
        </div>
      </div>

      {/* 施工進度時間線 */}
      {activeTab === 'progress' && (
        <div className="space-y-0">
          {stages.map((stage, idx) => (
            <div key={stage.id || idx} className="flex gap-3">
              {/* 左側時間線 */}
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${stageColors[stage.status] || stageColors.pending}`}>
                  {stageIcons[stage.status] || stageIcons.pending}
                </div>
                {idx < stages.length - 1 && (
                  <div className={`w-0.5 flex-1 min-h-[28px] mt-1 ${stage.status === 'done' ? 'bg-brand-300' : 'bg-cream-200'}`} />
                )}
              </div>
              {/* 右側內容 */}
              <div className="flex-1 pb-5">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${stage.status === 'done' ? 'text-brand-700' : stage.status === 'active' ? 'text-amber-600' : 'text-gray-400'}`}>
                    {stage.name}
                  </span>
                  {stage.status === 'active' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium animate-pulse">
                      進行中
                    </span>
                  )}
                </div>
                {(stage.start_date || stage.end_date) && (
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {stage.start_date}{stage.end_date ? ` ~ ${stage.end_date}` : ''}
                  </div>
                )}
                {stage.detail && (
                  <div className="text-xs text-gray-500 mt-1">{stage.detail}</div>
                )}
                {stage.note && (
                  <div className="text-xs text-gray-400 mt-1.5 px-2 py-1.5 bg-cream-50 rounded-md">
                    📝 {stage.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 案件資訊 */}
      {activeTab === 'info' && (
        <div className="card space-y-3">
          {[
            { label: '案件地址', value: project.address },
            { label: '房屋坪數', value: project.ping ? `${project.ping} 坪` : null },
            { label: '裝修預算', value: project.budget },
            { label: '負責設計師', value: project.designer },
            { label: '開工日期', value: project.start_date ? fmtDate(project.start_date) : null },
            { label: '預計完工', value: project.end_date ? fmtDate(project.end_date) : null },
            { label: '目前狀態', value: project.status }
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{row.label}</span>
              <span className="font-medium text-brand-800">{row.value || '-'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function fmtDate(s) {
  if (!s) return null
  try {
    return new Date(s).toLocaleDateString('zh-TW')
  } catch {
    return s
  }
}

function getStatusStyle(status) {
  const map = {
    'planning': { background: '#F3E8FF', color: '#7B5BE0' },
    '施工中': { background: '#FFF4D6', color: '#E8A700' },
    '驗收中': { background: '#D6E4FF', color: '#3A77E8' },
    '完工': { background: '#D6F5E0', color: '#0F8E4E' },
    '保固中': { background: '#C8ECD4', color: '#0A6B3A' }
  }
  return map[status] || { background: '#F0F0F0', color: '#888' }
}

const stageIcons = {
  done: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" /></svg>,
  active: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
  pending: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>
}

const stageColors = {
  done: 'text-brand-500 bg-brand-50',
  active: 'text-amber-600 bg-amber-50',
  pending: 'text-gray-300 bg-gray-50'
}
