import { useNavigate } from 'react-router-dom'

const trades = [
  {
    id: 'masonry',
    name: '泥作工程',
    icon: '🧱',
    teams: 8,
    skills: ['砌牆', '貼磚', '防水', '粉光', '找平'],
    desc: '專業泥作班，含浴室防水、廚房磁磚、地板找平等'
  },
  {
    id: 'carpentry',
    name: '木作工程',
    icon: '🪵',
    teams: 6,
    skills: ['天花板', '電視牆', '隔間', '造型木作', '系統櫃'],
    desc: '精細木作班，含造型天花板、電視牆、系統櫃安裝等'
  },
  {
    id: 'electrical',
    name: '水電工程',
    icon: '⚡',
    teams: 5,
    skills: ['配電', '給排水', '冷氣管線', '弱電', '智能家居'],
    desc: '甲級水電班，含全室水電重配、冷氣管線、智能整合'
  },
  {
    id: 'painting',
    name: '油漆工程',
    icon: '🎨',
    teams: 4,
    skills: ['批土', '粉刷', '特殊塗料', '藝術漆', '噴漆'],
    desc: '專業油漆班，含批土粉刷、特殊塗料、藝術漆等'
  },
  {
    id: 'system_cabinet',
    name: '系統櫃',
    icon: '📋',
    teams: 3,
    skills: ['規劃設計', '板材選擇', '安裝施工', '五金配置'],
    desc: '系統櫃專班，含規劃設計、板材選擇、安裝施工'
  },
  {
    id: 'demolition',
    name: '拆除清運',
    icon: '🔨',
    teams: 4,
    skills: ['舊裝拆除', '垃圾清運', '保護工程', '廢棄物處理'],
    desc: '專業拆除班，含舊裝拆除、保護工程、廢棄物清運'
  }
]

export default function PlatformPage() {
  const navigate = useNavigate()

  return (
    <div className="px-5 py-5">
      <h2 className="text-lg font-bold text-brand-800 mb-1">我要工班</h2>
      <p className="text-xs text-gray-500 mb-5">選擇需要的工種，由公司為您媒合專業施工團隊</p>

      {/* 工種列表 */}
      <div className="space-y-3">
        {trades.map(trade => (
          <div key={trade.id} className="card cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
            onClick={() => navigate('/designer/cooperation/apply', { state: { trade: trade.name } })}>
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-2xl flex-shrink-0">
                {trade.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="text-sm font-semibold text-brand-800">{trade.name}</div>
                  <span className="text-[11px] text-brand-500 font-medium">{trade.teams} 組可媒合</span>
                </div>
                <div className="text-[11px] text-gray-500 mb-2">{trade.desc}</div>
                <div className="flex flex-wrap gap-1.5">
                  {trade.skills.map(skill => (
                    <span key={skill} className="text-[10px] px-2 py-0.5 bg-cream-100 text-gray-600 rounded">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end mt-2.5 pt-2.5 border-t border-cream-100">
              <span className="text-xs text-brand-500 font-medium flex items-center gap-1">
                提出需求
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 說明 */}
      <div className="card mt-5 bg-brand-50 border-brand-200">
        <div className="flex items-start gap-2.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F8E4E" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
          </svg>
          <div className="text-[11px] text-brand-700 leading-relaxed">
            選擇工種後填寫需求表，公司將在 48 小時內媒合最適合的施工團隊，並由專人與您聯繫確認施工排程。
          </div>
        </div>
      </div>
    </div>
  )
}
