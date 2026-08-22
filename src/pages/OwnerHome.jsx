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
  const [showCompany, setShowCompany] = useState(false)

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

      {/* 公司簡介入口 */}
      <div className="px-5 pb-2">
        <div onClick={() => setShowCompany(true)}
          className="card flex items-center gap-3.5 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 p-3.5"
          style={{ background: 'linear-gradient(135deg, #f0f9f3 0%, #e8f5e9 100%)' }}>
          <div className="w-11 h-11 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-brand-800">孟瀧室內裝修設計有限公司</div>
            <div className="text-xs text-gray-500">政府立案 · 合格施工廠商 · 統編 24838387</div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300"><path d="M9 18l6-6-6-6" /></svg>
        </div>
      </div>

      {/* 公司簡介 Modal */}
      {showCompany && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center" onClick={() => setShowCompany(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div onClick={e => e.stopPropagation()}
            className="relative bg-white rounded-t-3xl w-full max-w-[440px] max-h-[85vh] overflow-y-auto animate-[slideUp_0.3s_ease]">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-br from-brand-500 to-brand-600 text-white px-5 pt-5 pb-5 rounded-t-3xl">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold">孟瀧室內裝修設計有限公司</div>
                    <div className="text-[10px] opacity-80">統一編號 24838387</div>
                  </div>
                </div>
                <button onClick={() => setShowCompany(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-lg cursor-pointer">✕</button>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-5">
              {/* 認證徽章 */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-50 border border-green-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F8E4E" strokeWidth="2.5"><path d="M9 12l2 2 4-4M21 12c0 5-3.5 7.5-9 9-5.5-1.5-9-4-9-9V5l9-3 9 3v7z" /></svg>
                  <span className="text-[11px] font-medium text-green-700">政府立案</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2.5"><path d="M9 12l2 2 4-4M21 12c0 5-3.5 7.5-9 9-5.5-1.5-9-4-9-9V5l9-3 9 3v7z" /></svg>
                  <span className="text-[11px] font-medium text-blue-700">合格施工廠商</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8A700" strokeWidth="2.5"><path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26z" /></svg>
                  <span className="text-[11px] font-medium text-amber-700">10+年經驗</span>
                </div>
              </div>

              {/* 公司簡介 */}
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                孟瀧室內裝修設計有限公司致力於為每一位屋主打造理想的居住空間。我們提供從設計規劃、工程施工到完工驗收的一條龍服務，擁有經驗豐富的設計團隊與專業施工工班，嚴格把控工程品質與進度。
              </p>

              {/* 公司資訊 */}
              <div className="space-y-2.5 mb-4">
                <div className="flex items-start gap-2.5 py-2 border-b border-gray-100">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F8E4E" strokeWidth="2" className="mt-0.5 flex-shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  <div>
                    <div className="text-[11px] text-gray-400">公司地址</div>
                    <div className="text-xs font-medium text-gray-700">台中市西區</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 py-2 border-b border-gray-100">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F8E4E" strokeWidth="2" className="mt-0.5 flex-shrink-0"><path d="M9 12l2 2 4-4M21 12c0 5-3.5 7.5-9 9-5.5-1.5-9-4-9-9V5l9-3 9 3v7z" /></svg>
                  <div>
                    <div className="text-[11px] text-gray-400">統一編號</div>
                    <div className="text-xs font-medium text-gray-700">24838387</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 py-2 border-b border-gray-100">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F8E4E" strokeWidth="2" className="mt-0.5 flex-shrink-0"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                  <div>
                    <div className="text-[11px] text-gray-400">登記狀態</div>
                    <div className="text-xs font-medium text-gray-700">政府立案合格施工廠商</div>
                  </div>
                </div>
              </div>

              {/* 統計 */}
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="bg-brand-50 rounded-lg py-2.5 px-1">
                  <div className="text-lg font-bold text-brand-600">10+</div>
                  <div className="text-[10px] text-gray-500">年經驗</div>
                </div>
                <div className="bg-brand-50 rounded-lg py-2.5 px-1">
                  <div className="text-lg font-bold text-brand-600">200+</div>
                  <div className="text-[10px] text-gray-500">完工案例</div>
                </div>
                <div className="bg-brand-50 rounded-lg py-2.5 px-1">
                  <div className="text-lg font-bold text-brand-600">1年</div>
                  <div className="text-[10px] text-gray-500">工程保固</div>
                </div>
              </div>

              {/* 服務項目 */}
              <div className="mb-4">
                <div className="text-[11px] font-medium text-gray-500 mb-2">服務項目</div>
                <div className="flex flex-wrap gap-1.5">
                  {['室內設計', '舊屋翻新', '全屋定制', '水電工程', '泥作工程', '木作工程', '油漆工程', '系統櫃', '燈具安裝', '清潔服務'].map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-1 rounded-md bg-gray-100 text-gray-600">{tag}</span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button onClick={() => { setShowCompany(false); navigate('/owner/design') }}
                className="w-full py-3 rounded-xl bg-brand-500 text-white text-sm font-medium cursor-pointer hover:bg-brand-600 transition-colors">
                立即諮詢 · 預約設計
              </button>
            </div>
          </div>
        </div>
      )}

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
