import { useNavigate } from 'react-router-dom'

const projects = [
  {
    id: 'P-2026-0312',
    title: '西區張宅 · 現代簡約翻新',
    address: '台中市西區',
    ping: 28,
    status: '施工中',
    progress: 65,
    startDate: '2026/03/01',
    endDate: '2026/05/15',
    stage: '木作進場'
  },
  {
    id: 'P-2026-0288',
    title: '北區李宅 · 北歐風新成屋',
    address: '台中市北區',
    ping: 35,
    status: '設計中',
    progress: 20,
    startDate: '2026/03/10',
    endDate: '預計 2026/06/30',
    stage: '平面配置定稿'
  },
  {
    id: 'P-2026-0301',
    title: '西屯王宅 · 全屋定制',
    address: '台中市西屯區',
    ping: 50,
    status: '已完工',
    progress: 100,
    startDate: '2025/12/01',
    endDate: '2026/02/28',
    stage: '驗收完成'
  }
]

const statusColors = {
  '設計中': 'bg-amber-100 text-amber-700',
  '施工中': 'bg-brand-100 text-brand-700',
  '已完工': 'bg-gray-200 text-gray-600'
}

export default function ProjectsPage() {
  const navigate = useNavigate()

  return (
    <div className="px-5 py-5">
      <h2 className="text-lg font-bold text-brand-800 mb-1">我的案件</h2>
      <p className="text-xs text-gray-500 mb-5">追蹤所有裝修案件進度</p>

      <div className="space-y-3">
        {projects.map(p => (
          <div key={p.id} onClick={() => navigate(`/owner/projects/${p.id}`)}
            className="card cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-2.5">
              <div>
                <div className="text-sm font-semibold text-brand-800">{p.title}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{p.id} · {p.address} · {p.ping}坪</div>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusColors[p.status]}`}>{p.status}</span>
            </div>

            {/* 進度條 */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-gray-500">進度</span>
                <span className="text-[11px] font-semibold text-brand-600">{p.progress}%</span>
              </div>
              <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <span>目前階段：{p.stage}</span>
              <span>{p.startDate} ~ {p.endDate}</span>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="card text-center py-10 text-gray-400">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-sm">尚無案件紀錄</div>
        </div>
      )}
    </div>
  )
}
