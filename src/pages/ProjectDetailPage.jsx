import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const projectData = {
  id: 'P-2026-0312',
  title: '西區張宅 · 現代簡約翻新',
  address: '台中市西區',
  ping: 28,
  status: '施工中',
  progress: 65,
  startDate: '2026/03/01',
  endDate: '2026/05/15',
  budget: '180萬',
  designer: '陳設計師',
  stages: [
    { name: '拆除工程', status: 'done', date: '03/01 ~ 03/05', detail: '舊裝拆除、垃圾清運' },
    { name: '水電工程', status: 'done', date: '03/06 ~ 03/20', detail: '全室水電重新配置、冷氣管線' },
    { name: '泥作工程', status: 'done', date: '03/21 ~ 04/10', detail: '浴室防水、廚房磁磚、地板找平' },
    { name: '木作工程', status: 'active', date: '04/11 ~ 04/30', detail: '電視牆、天花板、系統櫃安裝' },
    { name: '油漆工程', status: 'pending', date: '05/01 ~ 05/10', detail: '全室粉刷、特殊塗料' },
    { name: '清潔驗收', status: 'pending', date: '05/11 ~ 05/15', detail: '細部清潔、業主驗收' }
  ]
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

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('progress')

  const project = projectData

  return (
    <div className="px-5 py-5">
      {/* 案件標題 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-medium">{project.status}</span>
          <span className="text-[11px] text-gray-400">{project.id}</span>
        </div>
        <h2 className="text-lg font-bold text-brand-800">{project.title}</h2>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
          <span>{project.address} · {project.ping}坪</span>
          <span>·</span>
          <span>{project.startDate} ~ {project.endDate}</span>
        </div>
      </div>

      {/* 進度條 */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-brand-800">整體進度</span>
          <span className="text-lg font-bold text-brand-600">{project.progress}%</span>
        </div>
        <div className="h-2.5 bg-cream-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all"
            style={{ width: `${project.progress}%` }} />
        </div>
        <div className="flex items-center justify-between mt-2 text-[11px] text-gray-400">
          <span>預算：{project.budget}</span>
          <span>設計師：{project.designer}</span>
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
          {project.stages.map((stage, idx) => (
            <div key={idx} className="flex gap-3">
              {/* 左側時間線 */}
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${stageColors[stage.status]}`}>
                  {stageIcons[stage.status]}
                </div>
                {idx < project.stages.length - 1 && (
                  <div className={`w-0.5 flex-1 min-h-[24px] mt-1 ${stage.status === 'done' ? 'bg-brand-300' : 'bg-cream-200'}`} />
                )}
              </div>
              {/* 右側內容 */}
              <div className="flex-1 pb-4">
                <div className="text-sm font-semibold text-brand-800">{stage.name}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{stage.date}</div>
                <div className="text-xs text-gray-500 mt-1">{stage.detail}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 案件資訊 */}
      {activeTab === 'info' && (
        <div className="card space-y-3">
          {[
            { label: '案件編號', value: project.id },
            { label: '案件地址', value: project.address },
            { label: '房屋坪數', value: `${project.ping} 坪` },
            { label: '裝修預算', value: project.budget },
            { label: '負責設計師', value: project.designer },
            { label: '開工日期', value: project.startDate },
            { label: '預計完工', value: project.endDate },
            { label: '目前狀態', value: project.status }
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{row.label}</span>
              <span className="font-medium text-brand-800">{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
