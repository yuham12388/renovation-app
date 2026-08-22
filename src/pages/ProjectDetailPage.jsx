import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { fetchProjectById, fetchProjectMedia, PROJECT_STAGES } from '../lib/api'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('progress')
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mediaMap, setMediaMap] = useState({})
  const [lightbox, setLightbox] = useState(null) // { items, index }

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await fetchProjectById(id)
        if (mounted) {
          setProject(data)
          // 載入此案件的所有媒體
          const media = await fetchProjectMedia(id)
          if (mounted) setMediaMap(media)
        }
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

  // 收集所有媒體用於 lightbox 輪播
  const allMedia = stages.flatMap(s => mediaMap[s.id] || [])

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
          {stages.map((stage, idx) => {
            const media = mediaMap[stage.id] || []
            return (
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
                    {media.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-500 font-medium">
                        {media.length} 張照片
                      </span>
                    )}
                  </div>
                  {(stage.start_date || stage.end_date) && (
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {stage.start_date}{stage.end_date ? ` ~ ${stage.end_date}` : ''}
                    </div>
                  )}
                  {stage.note && (
                    <div className="text-xs text-gray-400 mt-1.5 px-2 py-1.5 bg-cream-50 rounded-md">
                      📝 {stage.note}
                    </div>
                  )}

                  {/* 照片縮圖區 */}
                  {media.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {media.map((m, mi) => (
                        <div key={m.id || mi}
                          onClick={() => setLightbox({ items: media, index: mi })}
                          className="relative w-14 h-14 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                          {m.type === 'video' ? (
                            <>
                              <video src={m.url} className="w-full h-full object-cover" preload="metadata" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </>
                          ) : (
                            <img src={m.url} className="w-full h-full object-cover" loading="lazy" alt={m.caption || ''} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
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

      {/* Lightbox 燈箱 */}
      {lightbox && (
        <Lightbox
          items={lightbox.items}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onIndex={i => setLightbox({ ...lightbox, index: i })}
        />
      )}
    </div>
  )
}

// ===== Lightbox 全螢幕照片瀏覽 =====
function Lightbox({ items, index, onClose, onIndex }) {
  const touchStartX = useRef(0)

  const prev = () => onIndex((index - 1 + items.length) % items.length)
  const next = () => onIndex((index + 1) % items.length)

  const item = items[index]

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col"
      onClick={onClose}
      onTouchStart={e => touchStartX.current = e.touches[0].clientX}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - touchStartX.current
        if (dx > 50) prev()
        else if (dx < -50) next()
      }}>
      {/* 頂部列 */}
      <div className="flex items-center justify-between px-4 py-3 text-white" onClick={e => e.stopPropagation()}>
        <span className="text-xs">{index + 1} / {items.length}</span>
        <button onClick={onClose} className="text-white text-2xl leading-none">×</button>
      </div>

      {/* 媒體內容 */}
      <div className="flex-1 flex items-center justify-center px-4" onClick={e => e.stopPropagation()}>
        {item?.type === 'video' ? (
          <video src={item.url} controls className="max-w-full max-h-[70vh] rounded-lg" />
        ) : (
          <img src={item.url} className="max-w-full max-h-[70vh] object-contain rounded-lg" alt={item.caption || ''} />
        )}
      </div>

      {/* 底部 */}
      <div className="px-4 pb-6" onClick={e => e.stopPropagation()}>
        {item?.caption && (
          <div className="text-center text-xs text-white/80 mb-3">{item.caption}</div>
        )}
        {items.length > 1 && (
          <div className="flex items-center justify-center gap-8">
            <button onClick={prev} className="text-white/60 hover:text-white text-sm">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            {/* 縮圖列 */}
            <div className="flex gap-1 overflow-x-auto max-w-[200px]">
              {items.map((m, i) => (
                <div key={i} onClick={() => onIndex(i)}
                  className={`w-10 h-10 rounded overflow-hidden flex-shrink-0 cursor-pointer border-2 ${i === index ? 'border-white' : 'border-transparent opacity-50'}`}>
                  {m.type === 'video' ? (
                    <video src={m.url} className="w-full h-full object-cover" preload="metadata" />
                  ) : (
                    <img src={m.url} className="w-full h-full object-cover" alt="" />
                  )}
                </div>
              ))}
            </div>
            <button onClick={next} className="text-white/60 hover:text-white text-sm">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>
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
