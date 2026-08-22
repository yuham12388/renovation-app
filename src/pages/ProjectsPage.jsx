import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchProjectsByPhone } from '../lib/api'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 從 sessionStorage 恢复登入狀態
  useEffect(() => {
    const savedPhone = sessionStorage.getItem('ownerPhone')
    if (savedPhone) {
      setPhone(savedPhone)
      setLoggedIn(true)
      loadProjects(savedPhone)
    }
  }, [])

  const loadProjects = async (phoneNumber) => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchProjectsByPhone(phoneNumber)
      setProjects(data)
    } catch (e) {
      setError('查詢失敗，請稍後再試')
      setProjects([])
    }
    setLoading(false)
  }

  const handleLogin = (e) => {
    e?.preventDefault()
    const cleaned = phone.replace(/[\s-]/g, '').trim()
    if (cleaned.length < 8) {
      setError('請輸入正確的電話號碼')
      return
    }
    sessionStorage.setItem('ownerPhone', cleaned)
    setLoggedIn(true)
    loadProjects(cleaned)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('ownerPhone')
    setLoggedIn(false)
    setPhone('')
    setProjects([])
  }

  // 未登入：顯示電話登入頁
  if (!loggedIn) {
    return (
      <div className="px-5 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-50 flex items-center justify-center text-3xl">
            📋
          </div>
          <h2 className="text-lg font-bold text-brand-800 mb-1">我的案件</h2>
          <p className="text-xs text-gray-500">輸入您的電話號碼查看裝修進度</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">電話號碼</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="例：0912345678"
              className="w-full px-4 py-3 rounded-xl border border-cream-300 focus:border-brand-400 focus:ring-1 focus:ring-brand-400 outline-none text-sm"
              autoComplete="tel"
            />
          </div>
          {error && <div className="text-xs text-red-500">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-brand-500 text-white font-medium text-sm hover:bg-brand-600 transition-colors"
          >
            查看我的案件
          </button>
        </form>

        <div className="mt-6 p-4 bg-cream-50 rounded-xl text-xs text-gray-500 leading-relaxed">
          <div className="font-medium text-brand-700 mb-1">說明</div>
          電話號碼為您填寫需求單時留下的聯絡電話。如果您還沒有案件，請先至「設計我家」提交需求。
        </div>
      </div>
    )
  }

  // 已登入：顯示案件列表
  return (
    <div className="px-5 py-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold text-brand-800">我的案件</h2>
        <button onClick={handleLogout} className="text-[11px] text-gray-400 hover:text-gray-600">
          登出
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-5">登入電話：{phone}</p>

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">載入中…</div>
      ) : projects.length === 0 ? (
        <div className="card text-center py-10 text-gray-400">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-sm mb-1">尚無案件紀錄</div>
          <div className="text-xs text-gray-400">如果您剛提交需求，請等待客服與您聯繫建立案件</div>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(p => (
            <div key={p.id} onClick={() => navigate(`/owner/projects/${p.id}`)}
              className="card cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-start justify-between mb-2.5">
                <div>
                  <div className="text-sm font-semibold text-brand-800">{p.title}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {p.address || '地址未定'} · {p.ping ? `${p.ping}坪` : '坪數未定'}
                  </div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                  style={getStatusStyle(p.status)}>
                  {p.status || '規劃中'}
                </span>
              </div>

              {/* 進度條 */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-500">進度</span>
                  <span className="text-[11px] font-semibold text-brand-600">{p.progress || 0}%</span>
                </div>
                <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full transition-all"
                    style={{ width: `${p.progress || 0}%` }} />
                </div>
              </div>

              {/* 目前階段 */}
              <div className="text-[11px] text-gray-500">
                {(() => {
                  const stages = p.project_stages || []
                  const active = stages.find(s => s.status === 'active')
                  const lastDone = [...stages].reverse().find(s => s.status === 'done')
                  const current = active || lastDone
                  return current ? `目前階段：${current.name}` : '尚未開工'
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function getStatusStyle(status) {
  const map = {
    'planning': { background: '#F3E8FF', color: '#7B5BE0' },
    '施工中': { background: '#FFF4D6', color: '#E8A700' },
    '驗收中': { background: '#D6E4FF', color: '#3A77E8' },
    '完工': { background: '#D6F5E0', color: '#0F8E4E' },
    '保固中': { background: '#C8ECD4', color: '#0A6B3A' }
  }
  return map[status] || { background: '#F0F0F0', color: '#888' }
}
