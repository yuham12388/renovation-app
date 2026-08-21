import { useNavigate } from 'react-router-dom'

const tiers = [
  {
    name: '專案合作',
    badge: '單次',
    color: 'from-brand-300 to-brand-500',
    desc: '依單一案件需求媒合工班，靈活彈性',
    features: [
      '依案件需求媒合工班',
      '公司統一施工管理',
      '施工品質保證',
      '完工驗收機制',
      '專人對接溝通'
    ],
    best: '適合偶爾需要配合工班的設計師'
  },
  {
    name: '年度合作',
    badge: '推薦',
    color: 'from-brand-500 to-brand-700',
    desc: '年度合約，優先媒合 + 進度管理',
    features: [
      '年度合約工班優先媒合',
      '線上進度管理系統',
      '施工品質雙重把關',
      '綠建材供應管道',
      '專屬窗口快速回應',
      '季度品質檢討會議'
    ],
    best: '適合有穩定接案量的設計師'
  },
  {
    name: '戰略夥伴',
    badge: 'VIP',
    color: 'from-brand-600 to-brand-800',
    desc: '深度合作，共同投標 + 利潤共享',
    features: [
      '共同投標大型建案',
      '利潤共享機制',
      '專屬工班團隊',
      '品牌聯合推廣',
      '設計與施工深度整合',
      '年度策略會議'
    ],
    best: '適合有固定案源、追求長期成長的設計師'
  }
]

export default function CooperationPage() {
  const navigate = useNavigate()

  return (
    <div className="px-5 py-5">
      <h2 className="text-lg font-bold text-brand-800 mb-1">商務合作</h2>
      <p className="text-xs text-gray-500 mb-5">選擇適合您的合作方案，與公司建立長期夥伴關係</p>

      {/* 合作方案 */}
      <div className="space-y-3.5">
        {tiers.map((tier, idx) => (
          <div key={idx} className="card overflow-hidden">
            {/* 頂部色帶 */}
            <div className={`bg-gradient-to-r ${tier.color} text-white px-4 py-3 -mx-4 -mt-4 mb-3`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full mr-2">{tier.badge}</span>
                  <span className="text-base font-bold">{tier.name}</span>
                </div>
              </div>
              <div className="text-[11px] opacity-80 mt-1">{tier.desc}</div>
            </div>

            {/* 權益列表 */}
            <div className="space-y-2 mb-3">
              {tier.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F8E4E" strokeWidth="2" className="flex-shrink-0">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
                  </svg>
                  {f}
                </div>
              ))}
            </div>

            <div className="text-[11px] text-gray-400 italic mb-3">{tier.best}</div>

            <button onClick={() => navigate('/designer/cooperation/apply', { state: { tier: tier.name } })}
              className="btn-outline">申請合作</button>
          </div>
        ))}
      </div>

      {/* 聯繫資訊 */}
      <div className="card mt-5 bg-cream-100 border-cream-300 text-center">
        <div className="text-sm font-semibold text-brand-800 mb-1">有任何疑問？</div>
        <div className="text-xs text-gray-500">歡迎來電洽詢：04-XXXX-XXXX</div>
        <div className="text-[11px] text-gray-400 mt-1">服務時間：週一至週五 09:00–18:00</div>
      </div>
    </div>
  )
}
