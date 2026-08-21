import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchCaseById } from '../lib/api'

export default function CaseDetailPage() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await fetchCaseById(caseId)
        if (mounted) setCaseData(data)
      } catch {
        if (mounted) setCaseData(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [caseId])

  if (loading) {
    return (
      <div className="pt-20 text-center text-sm text-gray-400">載入中…</div>
    )
  }

  if (!caseData) {
    return (
      <div>
        <Header onBack={() => navigate('/gallery')} />
        <div className="pt-20 text-center">
          <p className="text-sm text-gray-400 mb-4">找不到此案例</p>
          <button onClick={() => navigate('/gallery')} className="btn-outline">返回案例列表</button>
        </div>
      </div>
    )
  }

  const trades = caseData.trades || []
  const beforeImages = caseData.before_images || []
  const afterImages = caseData.after_images || []

  return (
    <div>
      <Header onBack={() => navigate('/gallery')} />

      {/* 主圖 */}
      <div className="aspect-[4/3] overflow-hidden rounded-b-2xl">
        {caseData.main_image ? (
          <img src={caseData.main_image} alt={caseData.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-200 to-brand-300 flex items-center justify-center">
            <span className="text-5xl opacity-40">🏠</span>
          </div>
        )}
      </div>

      {/* 標題 + 標籤 */}
      <div className="px-5 mb-4 mt-4">
        <div className="text-xl font-bold text-gray-800 mb-1.5">{caseData.title || '未命名案例'}</div>
        <div className="flex gap-1.5 flex-wrap mb-3">
          {caseData.style && (
            <span className="text-[11px] bg-brand-50 text-brand-500 px-2.5 py-1 rounded">{caseData.style}</span>
          )}
          {caseData.ping && (
            <span className="text-[11px] bg-cream-200 text-gray-500 px-2.5 py-1 rounded">{caseData.ping}坪</span>
          )}
          {caseData.area && (
            <span className="text-[11px] bg-cream-200 text-gray-500 px-2.5 py-1 rounded">{caseData.area}</span>
          )}
          {caseData.house_age && (
            <span className="text-[11px] bg-cream-200 text-gray-500 px-2.5 py-1 rounded">{caseData.house_age}</span>
          )}
        </div>
        <div className="flex gap-4 py-3 border-y border-cream-200">
          {caseData.house_age && <Stat label="屋齡" value={caseData.house_age} />}
          {caseData.layout && <Stat label="格局" value={caseData.layout} />}
          {caseData.days && <Stat label="工期" value={`${caseData.days}天`} />}
          {caseData.budget && <Stat label="總預算" value={caseData.budget} />}
        </div>
      </div>

      {/* 設計理念 */}
      {caseData.concept && (
        <div className="px-5 mb-5">
          <h3 className="text-base font-bold text-gray-800 mb-2.5">設計理念</h3>
          <p className="text-[13px] text-gray-600 leading-relaxed">{caseData.concept}</p>
        </div>
      )}

      {/* 改造前後 */}
      {(beforeImages.length > 0 || afterImages.length > 0) && (
        <div className="px-5 mb-5">
          <h3 className="text-base font-bold text-gray-800 mb-2.5">改造前後</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {beforeImages.length > 0 ? (
              <BeforeAfterImage label="Before" src={beforeImages[0]} />
            ) : (
              <BeforeAfter label="Before" color="from-gray-300 to-gray-400" />
            )}
            {afterImages.length > 0 ? (
              <BeforeAfterImage label="After" src={afterImages[0]} />
            ) : (
              <BeforeAfter label="After" color="from-brand-100 to-brand-200" textColor="text-brand-500" />
            )}
          </div>
        </div>
      )}

      {/* 主要工項 */}
      {trades.length > 0 && (
        <div className="px-5 mb-5">
          <h3 className="text-base font-bold text-gray-800 mb-2.5">主要工項</h3>
          <div className="bg-cream-50 rounded-xl p-3.5">
            {trades.map((t, i) => (
              <div key={i} className="flex justify-between py-1.5 text-[13px] border-b border-cream-200 last:border-0">
                <span className="text-gray-600">{typeof t === 'string' ? t : t.name}</span>
                {typeof t === 'object' && t.days && <span className="text-gray-800 font-semibold">{t.days}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 主持設計師 */}
      {caseData.designer && (
        <div className="px-5 mb-5">
          <h3 className="text-base font-bold text-gray-800 mb-2.5">主持設計師</h3>
          <div className="flex items-center gap-3 bg-cream-50 rounded-xl p-3.5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-200 to-brand-500 flex items-center justify-center flex-shrink-0">
              <span className="text-lg text-white font-bold">{caseData.designer.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-semibold text-gray-800">{caseData.designer}</div>
              <div className="text-xs text-gray-500">{caseData.style || ''}</div>
            </div>
          </div>
        </div>
      )}

      {/* 其他照片 */}
      {caseData.other_images && caseData.other_images.length > 0 && (
        <div className="px-5 mb-5">
          <h3 className="text-base font-bold text-gray-800 mb-2.5">更多照片</h3>
          <div className="grid grid-cols-3 gap-2">
            {caseData.other_images.map((img, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden">
                <img src={img} alt={`照片 ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 pb-6">
        <button onClick={() => navigate('/owner/design')} className="btn-primary w-full">我也要這樣裝修</button>
      </div>
    </div>
  )
}

function Header({ onBack }) {
  return (
    <div className="bg-brand-500 text-white px-5 py-3.5 flex items-center justify-between sticky top-0 z-50">
      <div className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:bg-white/15" onClick={onBack}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
      </div>
      <h1 className="text-[17px] font-semibold">案例詳情</h1>
      <div className="w-8" />
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="text-center flex-1">
      <div className="text-[11px] text-gray-500 mb-0.5">{label}</div>
      <div className="text-[15px] font-semibold text-gray-800">{value}</div>
    </div>
  )
}

function BeforeAfter({ label, color, textColor }) {
  return (
    <div>
      <div className={`aspect-[4/3] bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}>
        <span className={`text-sm opacity-60 ${textColor || 'text-gray-600'}`}>{label}</span>
      </div>
      <div className="text-[11px] text-gray-500 text-center mt-1">{label}</div>
    </div>
  )
}

function BeforeAfterImage({ label, src }) {
  return (
    <div>
      <div className="aspect-[4/3] rounded-xl overflow-hidden">
        <img src={src} alt={label} className="w-full h-full object-cover" />
      </div>
      <div className="text-[11px] text-gray-500 text-center mt-1">{label}</div>
    </div>
  )
}
