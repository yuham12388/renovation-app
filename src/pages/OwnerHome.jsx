import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCases } from '../lib/api'

const gradients = ['from-brand-200 to-brand-300', 'from-brand-300 to-brand-400', 'from-brand-400 to-brand-500']
function getGradient(id) {
  const hash = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return gradients[hash % gradients.length]
}

const features = [
  {
    id: 'estimate',
    title: '快速估價',
    desc: '輸入坪數與需求，秒速估算預算',
    icon: <path d="M9 2h6a1 1 0 0 1 1 1v1h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3V3a1 1 0 0 1 1-1z" />,
    extra: <path d="M9 2h6M7 12h10M7 16h6" />,
    color: 'from-brand-400 to-brand-600'
  },
  {
    id: 'design',
    title: '設計我家',
    desc: '提交需求，由公司專人為您設計',
    icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    extra: <path d="M9 22V12h6v10" />,
    color: 'from-brand-300 to-brand-500'
  },
  {
    id: 'projects',
    title: '我的案件',
    desc: '追蹤施工進度，隨時掌握狀況',
    icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />,
    extra: <><path d="M14 2v6h6" /><path d="M16 13H8M16 17H8M10 9H8" /></>,
    color: 'from-brand-500 to-brand-700'
  }
]

export default function OwnerHome() {
  const navigate = useNavigate()
  const [promoCode, setPromoCode] = useState('')
  const [featuredCases, setFeaturedCases] = useState([])

  useEffect(() => {
    const code = sessionStorage.getItem('promoCode')
    if (code) {
      setPromoCode(code)
    }
    // 載入精選案例（取最新 5 筆 published）
    let mounted = true
    async function loadCases() {
      try {
        const data = await fetchCases()
        if (mounted) setFeaturedCases((data || []).slice(0, 5))
      } catch {
        if (mounted) setFeaturedCases([])
      }
    }
    loadCases()
    return () => { mounted = false }
  }, [])

  const goDesignWithPromo = () => {
    const code = promoCode
    sessionStorage.removeItem('promoCode')
    setPromoCode('')
    navigate('/owner/design', { state: { promo: code } })
  }

  return (
    <div>
      {/* Hero 區塊 */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-600 text-white px-5 pt-6 pb-8 rounded-b-[20px]">
        <h2 className="text-xl font-bold mb-1">歡迎回來 👋</h2>
        <p className="text-sm opacity-80 mb-5">讓裝修變簡單，從這裡開始</p>

        {/* 快速估價入口 */}
        <div className="bg-white/15 border border-white/20 rounded-2xl p-4 cursor-pointer transition-all hover:bg-white/20"
          onClick={() => navigate('/owner/estimate')}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 2h6a1 1 0 0 1 1 1v1h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3V3a1 1 0 0 1 1-1z" />
                <path d="M9 2h6M7 12h10M7 16h6" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">快速估價</div>
              <div className="text-[11px] opacity-75">30 秒算出裝修預算</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" className="opacity-60"><path d="M9 18l6-6-6-6" /></svg>
          </div>
        </div>
      </div>

      {/* 優惠代碼橫幅（從入口頁帶入） */}
      {promoCode && (
        <div className="mx-5 mt-4 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #fff8e1, #ffe0b2)' }}>
          <div className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26z" fill="#fff" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-gray-800">本月限定優惠</div>
              <div className="text-[11px] text-gray-600">優惠碼 <span className="font-bold text-gray-800">{promoCode}</span> · 設計費 9 折 + 空氣清淨檢測</div>
            </div>
            <button onClick={goDesignWithPromo} className="px-3 py-2 rounded-lg text-white text-xs font-semibold whitespace-nowrap" style={{ background: '#558B2F' }}>
              去預約
            </button>
          </div>
        </div>
      )}

      {/* 功能列表 */}
      <div className="px-5 py-5 space-y-3">
        {features.map(f => (
          <div key={f.id}
            onClick={() => navigate(`/owner/${f.id}`)}
            className="card flex items-center gap-3.5 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center flex-shrink-0`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {f.icon}{f.extra}
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-brand-800">{f.title}</div>
              <div className="text-xs text-gray-500">{f.desc}</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300"><path d="M9 18l6-6-6-6" /></svg>
          </div>
        ))}
      </div>

      {/* 精選案例 */}
      {featuredCases.length > 0 && (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-brand-800">精選案例</h3>
            <span className="text-xs text-brand-500 cursor-pointer" onClick={() => navigate('/gallery')}>看全部 →</span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {featuredCases.map(c => (
              <div key={c.id} onClick={() => navigate(`/gallery/${c.id}`)}
                className="flex-shrink-0 w-[130px] bg-white rounded-[10px] overflow-hidden cursor-pointer transition-transform hover:scale-[1.03]">
                <div className="aspect-[4/3] overflow-hidden">
                  {c.main_image ? (
                    <img src={c.main_image} alt={c.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getGradient(c.id)} flex items-center justify-center`}>
                      <span className="text-xl opacity-40">🏠</span>
                    </div>
                  )}
                </div>
                <div className="px-2.5 py-1.5">
                  <div className="text-[11px] font-semibold text-gray-800 truncate">{c.title}</div>
                  <div className="text-[10px] text-gray-500">{c.ping ? `${c.ping}坪` : ''}{c.ping && c.area ? ' · ' : ''}{c.area || ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
