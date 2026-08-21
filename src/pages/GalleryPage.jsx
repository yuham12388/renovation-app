import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCases } from '../lib/api'

const styleOptions = ['全部', '現代簡約', '北歐風', '日式無印', '工業風', '輕奢風', '美式古典', '其他']

// 沒有圖片時的 fallback 漸層色
const gradients = [
  'from-brand-200 to-brand-300',
  'from-brand-300 to-brand-400',
  'from-orange-200 to-orange-300',
  'from-amber-200 to-amber-300',
  'from-brand-400 to-brand-500',
  'from-brand-300 to-brand-600',
]
function getGradient(id) {
  const hash = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return gradients[hash % gradients.length]
}

export default function GalleryPage() {
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeStyle, setActiveStyle] = useState('全部')

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const data = await fetchCases(activeStyle === '全部' ? undefined : activeStyle)
        if (mounted) setCases(data || [])
      } catch {
        if (mounted) setCases([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [activeStyle])

  return (
    <div className="pb-6">
      <AppHeader title="我喜歡的家" onBack={() => navigate('/')} />

      {/* 風格篩選 */}
      <div className="flex gap-2 px-5 py-3 overflow-x-auto">
        {styleOptions.map(s => (
          <div
            key={s}
            onClick={() => setActiveStyle(s)}
            className={`filter-chip cursor-pointer whitespace-nowrap ${activeStyle === s ? 'active' : ''}`}
          >
            {s}
          </div>
        ))}
      </div>

      {/* 載入中 */}
      {loading && (
        <div className="px-5 py-10 text-center text-sm text-gray-400">載入中…</div>
      )}

      {/* 空狀態 */}
      {!loading && cases.length === 0 && (
        <div className="px-5 py-10 text-center">
          <div className="text-4xl mb-3 opacity-30">🏠</div>
          <p className="text-sm text-gray-400">尚無此風格的案例</p>
        </div>
      )}

      {/* 案例卡片 */}
      {!loading && cases.length > 0 && (
        <div className="px-5 grid grid-cols-2 gap-2.5">
          {cases.map(c => (
            <div
              key={c.id}
              onClick={() => navigate(`/gallery/${c.id}`)}
              className="bg-white rounded-[10px] overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <div className={`aspect-[4/3] ${c.main_image ? '' : `bg-gradient-to-br ${getGradient(c.id)}`} flex items-center justify-center overflow-hidden`}>
                {c.main_image ? (
                  <img src={c.main_image} alt={c.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl opacity-40">🏠</span>
                )}
              </div>
              <div className="px-2.5 py-2">
                <div className="text-xs font-semibold text-gray-800 truncate">{c.title}</div>
                <div className="text-[10px] text-gray-500">
                  {c.ping ? `${c.ping}坪` : ''}{c.ping && c.area ? ' · ' : ''}{c.area || ''}
                </div>
                {c.style && (
                  <div className="text-[10px] text-brand-500 mt-0.5">{c.style}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AppHeader({ title, onBack }) {
  return (
    <div className="bg-brand-500 text-white px-5 py-3.5 flex items-center justify-between sticky top-0 z-50">
      <div className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:bg-white/15" onClick={onBack}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
      </div>
      <h1 className="text-[17px] font-semibold">{title}</h1>
      <div className="w-8" />
    </div>
  )
}
