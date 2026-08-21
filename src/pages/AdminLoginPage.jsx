import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '../lib/adminApi'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn({ email, password })
      // 登入成功 → 由 ProtectedRoute 再驗一次 role
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || '登入失敗，請檢查 email / 密碼')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #E8F5EE 0%, #FAF8F3 100%)',
      padding: 20
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 40,
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 4px 24px rgba(15, 142, 78, 0.12)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🛡️</div>
          <h1 style={{ color: '#0A6B3A', fontSize: 24, margin: 0 }}>後台管理登入</h1>
          <p style={{ color: '#666', fontSize: 13, margin: '8px 0 0' }}>裝修幫手 Admin Console</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#04342C', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@renovation-helper.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #d0d7d4',
                fontSize: 15,
                boxSizing: 'border-box',
                outline: 'none'
              }}
              onFocus={e => e.target.style.borderColor = '#0F8E4E'}
              onBlur={e => e.target.style.borderColor = '#d0d7d4'}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#04342C', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
              密碼
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="至少 8 位"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #d0d7d4',
                fontSize: 15,
                boxSizing: 'border-box',
                outline: 'none'
              }}
              onFocus={e => e.target.style.borderColor = '#0F8E4E'}
              onBlur={e => e.target.style.borderColor = '#d0d7d4'}
            />
          </div>

          {error && (
            <div style={{
              background: '#FEE',
              border: '1px solid #FCC',
              borderRadius: 8,
              padding: '10px 12px',
              marginBottom: 16,
              color: '#C33',
              fontSize: 13
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#9DBCAB' : '#0F8E4E',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 16px',
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {loading ? '登入中…' : '登入'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#888' }}>
          <a href="/" style={{ color: '#0F8E4E', textDecoration: 'none' }}>← 回首頁</a>
        </div>
      </div>
    </div>
  )
}
