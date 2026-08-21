import { useNavigate } from 'react-router-dom'

export default function DesignerHome() {
  const navigate = useNavigate()

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-600 text-white px-5 pt-6 pb-8 rounded-b-[20px]">
        <h2 className="text-xl font-bold mb-1">設計師工作台</h2>
        <p className="text-sm opacity-80 mb-5">工班媒合 · 商務合作 · 一站管理</p>

        {/* 兩大入口 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 我要工班 */}
          <div className="bg-white/15 border border-white/20 rounded-2xl p-4 cursor-pointer transition-all hover:bg-white/20"
            onClick={() => navigate('/designer/platform')}>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-2.5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="text-sm font-semibold">我要工班</div>
            <div className="text-[11px] opacity-75 mt-0.5">專業施工團隊媒合</div>
          </div>

          {/* 商務合作 */}
          <div className="bg-white/15 border border-white/20 rounded-2xl p-4 cursor-pointer transition-all hover:bg-white/20"
            onClick={() => navigate('/designer/cooperation')}>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-2.5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h20v14H2z" />
                <path d="M2 21h20M8 3v14M16 3v14" />
              </svg>
            </div>
            <div className="text-sm font-semibold">商務合作</div>
            <div className="text-[11px] opacity-75 mt-0.5">長期合作方案</div>
          </div>
        </div>
      </div>

      {/* 公司施工團隊介紹 */}
      <div className="px-5 py-5">
        <h3 className="text-sm font-bold text-brand-800 mb-3">我們的施工團隊</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { name: '泥作班', count: 8, icon: '🧱' },
            { name: '木作班', count: 6, icon: '🪵' },
            { name: '水電班', count: 5, icon: '⚡' },
            { name: '油漆班', count: 4, icon: '🎨' },
            { name: '系統櫃', count: 3, icon: '📋' },
            { name: '清潔班', count: 2, icon: '🧹' }
          ].map(team => (
            <div key={team.name} className="card text-center py-3">
              <div className="text-2xl mb-1">{team.icon}</div>
              <div className="text-xs font-semibold text-brand-800">{team.name}</div>
              <div className="text-[10px] text-gray-400">{team.count} 組</div>
            </div>
          ))}
        </div>
      </div>

      {/* 合作優勢 */}
      <div className="px-5 pb-5">
        <h3 className="text-sm font-bold text-brand-800 mb-3">合作優勢</h3>
        <div className="space-y-2.5">
          {[
            { title: '施工品質保證', desc: '所有工班均經認證，施工品質穩定可靠' },
            { title: '快速媒合', desc: '提出需求後 48 小時內媒合適合工班' },
            { title: '統一管理', desc: '施工進度、品質由公司統一管控把關' },
            { title: '綠建材供應', desc: '公司提供綠建材管道，設計師可安心選用' }
          ].map((item, i) => (
            <div key={i} className="card flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F8E4E" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-brand-800">{item.title}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
