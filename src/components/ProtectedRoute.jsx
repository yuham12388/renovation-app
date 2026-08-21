import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase, isSupabaseReady } from '../lib/supabase'
import { getAdminProfile } from '../lib/adminApi'

// 攔截未登入或非 admin 的用戶
export default function ProtectedRoute({ children }) {
  const [state, setState] = useState('loading') // loading | authed | unauthed
  const [debug, setDebug] = useState(null)

  useEffect(() => {
    (async () => {
      const info = { isSupabaseReady, step: 'init' }
      try {
        const { data: { user } } = await supabase.auth.getUser()
        info.user = user ? { id: user.id, email: user.email } : null
        info.step = 'gotUser'

        if (!user) {
          info.step = 'noUser'
          setDebug(info)
          setState('unauthed')
          return
        }

        const profile = await getAdminProfile()
        info.profile = profile
        info.step = 'gotProfile'

        if (profile && profile.role === 'admin') {
          setDebug(info)
          setState('authed')
        } else {
          info.reason = !profile
            ? 'getAdminProfile 回傳 null（可能 profiles 沒資料 / RLS 擋住）'
            : `profile.role = "${profile.role}"，需要 "admin"`
          setDebug(info)
          setState('unauthed')
        }
      } catch (e) {
        info.error = e?.message || String(e)
        info.step = 'threw'
        setDebug(info)
        setState('unauthed')
      }
    })()
  }, [])

  if (state === 'loading') {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0A6B3A',
        fontSize: 16,
        gap: 12
      }}>
        <div>載入中…</div>
        {debug && (
          <pre style={{
            fontSize: 11, color: '#888', maxWidth: 600,
            background: '#f4f4f4', padding: 12, borderRadius: 8,
            overflow: 'auto', textAlign: 'left'
          }}>
{JSON.stringify(debug, null, 2)}
          </pre>
        )}
      </div>
    )
  }

  if (state === 'unauthed') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #E8F5EE 0%, #FAF8F3 100%)',
        padding: 20,
        gap: 16
      }}>
        <div style={{ fontSize: 36 }}>🔒</div>
        <div style={{ color: '#04342C', fontSize: 18, fontWeight: 600 }}>
          無權進入後台
        </div>
        <pre style={{
          fontSize: 12, color: '#333', maxWidth: 720, width: '100%',
          background: '#FFF7E6', border: '1px solid #FFD591',
          padding: 16, borderRadius: 8,
          overflow: 'auto', textAlign: 'left', whiteSpace: 'pre-wrap'
        }}>
{JSON.stringify(debug, null, 2)}
        </pre>
        <a
          href="/admin/login"
          style={{
            background: '#0F8E4E', color: '#fff',
            padding: '10px 20px', borderRadius: 8,
            textDecoration: 'none', fontWeight: 600
          }}
        >
          回到登入
        </a>
      </div>
    )
  }

  return children
}
