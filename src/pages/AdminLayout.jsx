import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOut } from '../lib/adminApi'

const tabs = [
  { to: '/admin', label: '設計需求', icon: '📋', end: true },
  { to: '/admin/estimates', label: '估價記錄', icon: '💰' },
  { to: '/admin/projects', label: '案件', icon: '🏗️' },
  { to: '/admin/coop', label: '合作申請', icon: '🤝' }
]

export default function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3' }}>
      {/* 頂部 navbar */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid #E5E5E5',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🛡️</span>
          <div>
            <div style={{ color: '#0A6B3A', fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>
              裝修幫手 Admin
            </div>
            <div style={{ color: '#888', fontSize: 11, lineHeight: 1.2 }}>後台管理看版</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/" style={{
            color: '#666',
            textDecoration: 'none',
            fontSize: 13,
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #E5E5E5'
          }}>看前台</a>
          <button onClick={handleLogout} style={{
            background: 'transparent',
            color: '#C33',
            border: '1px solid #FCC',
            borderRadius: 6,
            padding: '6px 12px',
            fontSize: 13,
            cursor: 'pointer'
          }}>退出</button>
        </div>
      </header>

      {/* Tab 導覽 */}
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #E5E5E5',
        display: 'flex',
        overflowX: 'auto',
        padding: '0 20px'
      }}>
        {tabs.map(t => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            style={({ isActive }) => ({
              padding: '14px 16px',
              color: isActive ? '#0F8E4E' : '#666',
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              textDecoration: 'none',
              borderBottom: isActive ? '2px solid #0F8E4E' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            })}
          >
            <span>{t.icon}</span>{t.label}
          </NavLink>
        ))}
      </nav>

      {/* 子頁面內容 */}
      <main style={{ padding: 24, maxWidth: 1280, margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
