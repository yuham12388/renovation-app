import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// Plan B：繞過 signIn，直接走 signUp 建立 user + 自動 session
//  - 流程：先在 SQL 預刪同 email 的 user（避免衝突）→ supabase.auth.signUp → 自動建 user + 設 session
//  - signUp 是 anon key 預設開放的端點，不會被 GoTrue 拒絕
export default function AdminSignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@renovation-helper.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      // 1) 嘗試註冊
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: 'admin' }
        }
      })

      if (signUpError) {
        // 常見錯誤：用戶已存在 → 提示先去 SQL 刪
        if (signUpError.message?.toLowerCase().includes('already') ||
            signUpError.status === 422) {
          throw new Error('此 email 已被註冊。請先到 Supabase SQL Editor 跑：\ndelete from auth.users where email = \'' + email + '\';\n然後回來重試。')
        }
        throw signUpError
      }

      // 2) signUp 成功：user 已建立 + session 已設
      if (data?.session) {
        setInfo('註冊成功！session 已建立，跳轉中…')
        setTimeout(() => navigate('/admin', { replace: true }), 800)
      } else if (data?.user) {
        // 沒 session（可能需要 email confirm）— 但因為是 admin 內部流程，
        // 讓用戶看訊息去 SQL 強制設 confirmed_at
        setInfo('User 已建立但未自動登入（需要 email confirm）。\n請到 SQL Editor 跑：\nupdate auth.users set email_confirmed_at = now(), confirmed_at = now() where id = \'' + data.user.id + '\';\n然後回 /admin/login 用相同密碼登入。')
      } else {
        setInfo('註冊回應無 user 資料，請到 SQL Editor 確認 auth.users 狀態。')
      }
    } catch (err) {
      setError(err.message || '註冊失敗')
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
        maxWidth: 460,
        boxShadow: '0 4px 24px rgba(15, 142, 78, 0.12)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🚀</div>
          <h1 style={{ color: '#0A6B3A', fontSize: 22, margin: 0 }}>建立 Admin 帳號</h1>
          <p style={{ color: '#666', fontSize: 12, margin: '8px 0 0' }}>
            Plan B：繞過 signIn，直接走 signUp 建立 user + 自動 session
          </p>
        </div>

        <div style={{
          background: '#FFF7E6',
          border: '1px solid #FFD591',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          fontSize: 12,
          color: '#874D00',
          lineHeight: 1.6
        }}>
          ⚠️ 提交前請先到 Supabase SQL Editor 跑：<br />
          <code style={{ fontFamily: 'monospace', fontSize: 11 }}>
            delete from auth.users where email = 'admin@renovation-helper.com';
          </code>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', color: '#04342C', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid #d0d7d4', fontSize: 15,
                boxSizing: 'border-box', outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#04342C', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
              密碼（至少 6 字）
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="test1234"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid #d0d7d4', fontSize: 15,
                boxSizing: 'border-box', outline: 'none'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#FEE', border: '1px solid #FCC', borderRadius: 8,
              padding: 12, marginBottom: 14, color: '#C33', fontSize: 12,
              whiteSpace: 'pre-wrap', lineHeight: 1.6
            }}>
              {error}
            </div>
          )}

          {info && (
            <div style={{
              background: '#E8F5EE', border: '1px solid #A5D6A7', borderRadius: 8,
              padding: 12, marginBottom: 14, color: '#0A6B3A', fontSize: 12,
              whiteSpace: 'pre-wrap', lineHeight: 1.6
            }}>
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#9DBCAB' : '#0F8E4E',
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '12px 16px', fontSize: 15, fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer'
            }}
          >
            {loading ? '建立中…' : '建立 Admin 帳號'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#888' }}>
          <a href="/admin/login" style={{ color: '#0F8E4E', textDecoration: 'none', marginRight: 16 }}>
            ← 回到登入
          </a>
          <a href="/" style={{ color: '#888', textDecoration: 'none' }}>回首頁</a>
        </div>
      </div>
    </div>
  )
}
