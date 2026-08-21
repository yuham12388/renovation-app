import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function CoopFormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialType = location.state?.trade || location.state?.tier || ''

  const [form, setForm] = useState({
    name: '',
    phone: '',
    studio: '',
    type: initialType,
    caseDesc: '',
    budget: '',
    timeline: '',
    needs: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="px-5 py-10 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-brand-100 flex items-center justify-center mb-4">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0F8E4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="M22 4L12 14.01l-3-3" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-brand-800 mb-2">需求已送出！</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          我們將在 48 小時內與您聯繫，<br />確認施工需求與排程。
        </p>
        <div className="card text-left mb-4">
          <div className="text-xs text-gray-400 mb-2">需求摘要</div>
          <div className="space-y-1.5 text-sm text-gray-700">
            <div>姓名：<span className="font-medium">{form.name || '—'}</span></div>
            <div>工作室：<span className="font-medium">{form.studio || '—'}</span></div>
            <div>需求類型：<span className="font-medium">{form.type || '—'}</span></div>
          </div>
        </div>
        <button onClick={() => navigate('/designer')} className="btn-primary">返回首頁</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-brand-800 mb-1">合作申請</h2>
        <p className="text-xs text-gray-500">填寫需求，由專人為您安排合作事宜</p>
      </div>

      {/* 設計師資訊 */}
      <div className="card space-y-3">
        <div>
          <label className="text-sm font-medium text-brand-800 mb-1.5 block">姓名 *</label>
          <input type="text" required value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="form-input" placeholder="請輸入姓名" />
        </div>
        <div>
          <label className="text-sm font-medium text-brand-800 mb-1.5 block">聯絡電話 *</label>
          <input type="tel" required value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            className="form-input" placeholder="09xx-xxx-xxx" />
        </div>
        <div>
          <label className="text-sm font-medium text-brand-800 mb-1.5 block">工作室 / 公司名稱</label>
          <input type="text" value={form.studio}
            onChange={e => setForm({ ...form, studio: e.target.value })}
            className="form-input" placeholder="例如：某某設計工作室" />
        </div>
      </div>

      {/* 需求類型 */}
      <div className="card">
        <label className="text-sm font-medium text-brand-800 mb-1.5 block">需求類型 *</label>
        <input type="text" required value={form.type}
          onChange={e => setForm({ ...form, type: e.target.value })}
          className="form-input" placeholder="例如：泥作工程 / 年度合作" />
      </div>

      {/* 案件描述 */}
      <div className="card space-y-3">
        <div>
          <label className="text-sm font-medium text-brand-800 mb-1.5 block">案件描述</label>
          <textarea value={form.caseDesc}
            onChange={e => setForm({ ...form, caseDesc: e.target.value })}
            className="form-input min-h-[80px] resize-none" placeholder="簡述案件內容、坪數、地點…" />
        </div>
        <div>
          <label className="text-sm font-medium text-brand-800 mb-1.5 block">預算範圍</label>
          <select value={form.budget}
            onChange={e => setForm({ ...form, budget: e.target.value })}
            className="form-select">
            <option value="">請選擇預算</option>
            <option>50萬以下</option>
            <option>50–100萬</option>
            <option>100–200萬</option>
            <option>200–400萬</option>
            <option>400萬以上</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-brand-800 mb-1.5 block">希望施工時間</label>
          <select value={form.timeline}
            onChange={e => setForm({ ...form, timeline: e.target.value })}
            className="form-select">
            <option value="">請選擇時間</option>
            <option>越快越好</option>
            <option>1個月內</option>
            <option>2個月內</option>
            <option>3個月內</option>
            <option>可討論</option>
          </select>
        </div>
      </div>

      {/* 補充需求 */}
      <div className="card">
        <label className="text-sm font-medium text-brand-800 mb-1.5 block">補充說明</label>
        <textarea value={form.needs}
          onChange={e => setForm({ ...form, needs: e.target.value })}
          className="form-input min-h-[80px] resize-none" placeholder="其他需求或特殊說明…" />
      </div>

      <button type="submit" className="btn-primary">送出申請</button>
      <p className="text-[11px] text-center text-gray-400 pb-2">提交後將由專人在 48 小時內聯繫</p>
    </form>
  )
}
