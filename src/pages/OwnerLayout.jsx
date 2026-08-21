import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'

const navItems = [
  { id: '', label: '首頁', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></> },
  { id: 'estimate', label: '估價', icon: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h10M7 12h6M7 16h4" /></> },
  { id: 'design', label: '設計我家', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></> },
  { id: 'projects', label: '案件', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></> }
]

export default function OwnerLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showBack, setShowBack] = useState(false)

  const isSubPage = !['/owner', '/owner/estimate', '/owner/design', '/owner/projects'].includes(location.pathname)

  return (
    <div className="pb-[70px]">
      <div className="bg-brand-500 text-white px-5 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:bg-white/15 ${isSubPage ? 'visible' : 'invisible'}`}
          onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        </div>
        <h1 className="text-[17px] font-semibold">裝修幫手</h1>
        <div className="role-badge cursor-pointer inline-flex items-center gap-1 text-[11px] bg-white/20 px-2.5 py-1 rounded-xl" onClick={() => navigate('/')}>
          <span>屋主</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13L6 13"/><path d="M12 7l-6 6 6 6"/></svg>
        </div>
      </div>

      <Outlet />

      <BottomNav navItems={navItems} basePath="/owner" />
    </div>
  )
}

function BottomNav({ navItems, basePath }) {
  const navigate = useNavigate()
  const location = useLocation()

  const activeId = (() => {
    const path = location.pathname.replace(basePath, '').replace(/^\//, '')
    return path || ''
  })()

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[440px] max-w-full bg-white border-t border-cream-200 flex py-2 pb-3 z-50">
      {navItems.map(item => (
        <div key={item.id} className={`flex-1 flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${activeId === item.id ? 'text-brand-500' : 'text-gray-400'}`}
          onClick={() => navigate(item.id ? `${basePath}/${item.id}` : basePath)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{item.icon}</svg>
          <span className="text-[11px] font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
