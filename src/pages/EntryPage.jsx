import { useNavigate } from 'react-router-dom'

export default function EntryPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col text-white px-7 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 30%, #81C784 60%, #558B2F 100%)' }}>
      {/* === 底部綠色房子形狀 === */}
      {/* 房子輪廓 SVG：平順曲線屋頂 + 牆壁，從底部往上延伸超過入口卡片 */}
      <svg className="absolute bottom-0 left-0 w-full pointer-events-none" viewBox="0 0 440 500" preserveAspectRatio="xMidYMax slice" style={{ height: '78%' }}>
        {/* 房子主體（深綠）— 平順曲線屋頂線 */}
        <path d="M0 80 Q110 20 220 40 Q330 60 440 15 L440 500 L0 500 Z"
          fill="#2E7D32" opacity="0.85" />
        {/* 屋頂高光層 */}
        <path d="M0 80 Q110 20 220 40 Q330 60 440 15 L440 35 Q330 75 220 55 Q110 35 0 95 Z"
          fill="#388E3C" opacity="0.6" />
        {/* 牆壁淺色紋理 */}
        <rect x="0" y="95" width="440" height="405" fill="url(#wallGrad)" />
        <defs>
          <linearGradient id="wallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#43A047" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#1B5E20" stop-opacity="0.6"/>
          </linearGradient>
        </defs>
        {/* 窗戶裝飾 */}
        <rect x="60" y="260" width="50" height="50" rx="4" fill="#FFF9C4" opacity="0.25"/>
        <rect x="330" y="280" width="45" height="45" rx="4" fill="#FFF9C4" opacity="0.2"/>
        <rect x="180" y="320" width="40" height="40" rx="3" fill="#FFF9C4" opacity="0.15"/>
        {/* 門 */}
        <rect x="195" y="370" width="50" height="80" rx="3" fill="#1B5E20" opacity="0.5"/>
        <circle cx="237" cy="412" r="2" fill="#FFF9C4" opacity="0.4"/>
      </svg>

      {/* 標題區（綠寶下方，原房子標誌的下方位置） */}
      <div className="flex flex-col items-center text-center pt-[68px] pb-3 relative z-10">
        <h1 className="text-[26px] font-bold mb-1" style={{ color: '#1B5E20' }}>裝修幫手</h1>
        <p className="text-sm leading-relaxed max-w-[260px]" style={{ color: '#2E7D32', opacity: 0.7 }}>從估價到施工，一站搞定你的裝修大小事</p>
      </div>

      {/* 入口卡片 */}
      <div className="flex flex-col gap-2.5 pb-6 relative z-10 mt-auto">
        <EntryCard
          title="我是屋主"
          desc="需要設計和施工，由公司一條龍為您服務"
          onClick={() => navigate('/owner')}
          icon={<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />}
          iconExtra={<><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>}
          cardStyle={{ background: 'rgba(245, 245, 245, 0.92)' }}
          iconStyle={{ background: 'rgba(200, 200, 200, 0.35)' }}
        />
        <EntryCard
          title="我是設計師"
          desc="需要施工工班，接案、管理施工、找工班協作"
          onClick={() => navigate('/designer')}
          icon={<path d="M2 3h20v14H2z" />}
          iconExtra={<><path d="M2 21h20" /><path d="M8 3v14M16 3v14" /></>}
          cardStyle={{ background: 'rgba(235, 235, 235, 0.92)' }}
          iconStyle={{ background: 'rgba(180, 180, 180, 0.35)' }}
        />
        <EntryCard
          title="我喜歡的家"
          desc="瀏覽各種風格裝修案例，找到你喜歡的樣子"
          onClick={() => navigate('/gallery')}
          icon={<rect x="3" y="3" width="18" height="18" rx="2" />}
          iconExtra={<><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>}
          cardStyle={{ background: 'rgba(248, 248, 248, 0.92)' }}
          iconStyle={{ background: 'rgba(210, 210, 210, 0.35)' }}
        />
      </div>

      {/* 每月優惠大驚喜 */}
      <div className="pb-5 relative z-10">
        <div className="relative overflow-hidden rounded-xl p-4"
          style={{ background: 'linear-gradient(135deg, #fff8e1, #ffe0b2)' }}>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full mb-2.5"
            style={{ background: '#ff6b6b' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26z" fill="#fff"/>
            </svg>
            <span className="text-[10px] font-bold text-white">本月限定</span>
          </div>
          <h3 className="text-[16px] font-bold text-gray-800 mb-1">每月優惠大驚喜</h3>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            本月簽約享設計費 9 折，再送全室空氣清淨檢測！<br/>
            名額有限，先搶先贏。
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/60 rounded-lg px-3 py-2">
              <div className="text-[10px] text-gray-500">優惠代碼</div>
              <div className="text-sm font-bold text-gray-800 tracking-wider">GREEN2026</div>
            </div>
            <button onClick={() => { try { sessionStorage.setItem('promoCode', 'GREEN2026') } catch(_){} navigate('/owner/design', { state: { promo: 'GREEN2026' } }) }} className="px-4 py-2.5 rounded-lg text-white text-xs font-semibold"
              style={{ background: '#558B2F' }}>
              立即預約
            </button>
          </div>
          <div className="absolute -right-2 -bottom-2 opacity-15">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#558B2F" strokeWidth="1.5">
              <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" />
              <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4z" fill="#558B2F"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] opacity-40 pb-4 relative z-10">© 2026 裝修幫手</div>
    </div>
  )
}

function EntryCard({ title, desc, onClick, icon, iconExtra, cardStyle, iconStyle }) {
  return (
    <div onClick={onClick} className="border border-white/30 rounded-xl px-3.5 py-3 cursor-pointer transition-all hover:-translate-y-0.5 flex items-center gap-3"
      style={cardStyle}>
      <div className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center flex-shrink-0"
        style={iconStyle}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          {icon}{iconExtra}
        </svg>
      </div>
      <div className="flex-1">
        <div className="text-[17px] font-bold mb-0.5 text-gray-800">{title}</div>
        <div className="text-[12px] opacity-70 leading-snug text-gray-600">{desc}</div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="2" className="flex-shrink-0 opacity-40"><path d="M9 18l6-6-6-6"/></svg>
    </div>
  )
}
