import { Outlet, useNavigate, useLocation } from 'react-router-dom'

const navItems = [
  { id: '', label: '首頁', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></> },
  { id: 'platform', label: '我要工班', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
  { id: 'cooperation', label: '商務合作', icon: <><path d="M2 3h20v14H2z" /><path d="M2 21h20M8 3v14M16 3v14" /></> }
]

export default function DesignerLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const isSubPage = !['/designer', '/designer/platform', '/designer/cooperation'].includes(location.pathname)

  return (
    <div className="pb-[70px]">
      <div className="bg-brand-500 text-white px-5 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:bg-white/15 ${isSubPage ? 'visible' : 'invisible'}`}
          onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </div>
        <h1 className="text-[17px] font-semibold">裝修幫手</h1>
        <div className="role-badge cursor-pointer inline-flex items-center gap-1 text-[11px] bg-white/20 px-2.5 py-1 rounded-xl" onClick={() => navigate('/')}>
          <span>設計師</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13L6 13" /><path d="M12 7l-6 6 6 6" /></svg>
        </div>
      </div>

      <Outlet />

      <BottomNav navItems={navItems} basePath="/designer" />
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
