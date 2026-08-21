import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { verifyPromoCode, submitDesignRequest } from '../lib/api'

const styles = ['現代簡約', '北歐風', '日式無印', '工業風', '輕奢風', '美式古典', '其他']
const rooms = ['客廳', '廚房', '臥室', '浴室', '書房', '陽台', '小孩房', '儲藏室']
const budgets = ['50萬以下', '50–100萬', '100–200萬', '200–400萬', '400萬以上']

export default function DesignPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const presetPromo = location.state?.promo || ''
  const [promoVerified, setPromoVerified] = useState(false)
  const [promoError, setPromoError] = useState('')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    area: '',
    ping: '',
    style: '',
    budget: '',
    timeline: '',
    rooms: [],
    needs: '',
    promoCode: ''
  })
  const [submitted, setSubmitted] = useState(false)

  // 從入口頁「立即預約」帶入優惠碼
  useEffect(() => {
    if (presetPromo) {
      setForm(prev => ({ ...prev, promoCode: presetPromo }))
    }
  }, [presetPromo])

  const toggleRoom = (room) => {
    setForm(prev => ({
      ...prev,
      rooms: prev.rooms.includes(room)
        ? prev.rooms.filter(r => r !== room)
        : [...prev.rooms, room]
    }))
  }

  async function verifyPromo() {
    setPromoError('')
    const code = form.promoCode.trim().toUpperCase()
    if (!code) { setPromoError('請輸入優惠代碼'); return }
    try {
      const result = await verifyPromoCode(code)
      if (result.valid) {
        setPromoVerified(true)
      } else {
        setPromoVerified(false)
        setPromoError(result.reason || '優惠代碼無效，請確認後再試')
      }
    } catch (err) {
      setPromoVerified(false)
      setPromoError('驗證失敗，請稍後再試')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await submitDesignRequest({ ...form, promoVerified })
      setSubmitted(true)
    } catch (err) {
      setPromoError('送出失敗，請稍後再試或來電洽詢')
    }
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
          我們將在 1–2 個工作天內與您聯繫，<br />安排免費到府諮詢。
        </p>
        <div className="card text-left mb-4">
          <div className="text-xs text-gray-400 mb-2">您的需求摘要</div>
          <div className="space-y-1.5 text-sm text-gray-700">
            <div>姓名：<span className="font-medium">{form.name || '—'}</span></div>
            <div>區域：<span className="font-medium">{form.area || '—'} {form.ping && `· ${form.ping}坪`}</span></div>
            <div>風格：<span className="font-medium">{form.style || '—'}</span></div>
            <div>預算：<span className="font-medium">{form.budget || '—'}</span></div>
            {promoVerified && (
              <div className="pt-1.5 mt-1.5 border-t border-cream-200">
                <div>優惠代碼：<span className="font-medium text-brand-600">{form.promoCode}</span></div>
                <div className="text-xs text-brand-600 mt-0.5">已套用：設計費 9 折 + 空氣清淨檢測</div>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2.5">
          <button onClick={() => navigate('/owner/projects')} className="btn-primary">查看案件進度</button>
          <button onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', area: '', ping: '', style: '', budget: '', timeline: '', rooms: [], needs: '', promoCode: '' }); setPromoVerified(false) }}
            className="btn-outline">再填一次</button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-brand-800 mb-1">設計我家</h2>
        <p className="text-xs text-gray-500">填寫需求，由公司專人為您規劃設計</p>
      </div>

      {/* 聯絡資訊 */}
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
      </div>

      {/* 房屋資訊 */}
      <div className="card space-y-3">
        <div>
          <label className="text-sm font-medium text-brand-800 mb-1.5 block">所在地區 *</label>
          <select required value={form.area}
            onChange={e => setForm({ ...form, area: e.target.value })}
            className="form-select">
            <option value="">請選擇地區</option>
            <option>台中市 - 西區</option>
            <option>台中市 - 北區</option>
            <option>台中市 - 南區</option>
            <option>台中市 - 東區</option>
            <option>台中市 - 西屯區</option>
            <option>台中市 - 北屯區</option>
            <option>台中市 - 南屯區</option>
            <option>彰化縣</option>
            <option>南投縣</option>
            <option>其他</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-brand-800 mb-1.5 block">坪數 *</label>
          <input type="number" required value={form.ping} min="0"
            onChange={e => setForm({ ...form, ping: e.target.value })}
            className="form-input" placeholder="例如：30" />
        </div>
      </div>

      {/* 風格偏好 */}
      <div className="card">
        <label className="text-sm font-medium text-brand-800 mb-2.5 block">喜歡的風格</label>
        <div className="flex flex-wrap gap-2">
          {styles.map(s => (
            <div key={s} onClick={() => setForm({ ...form, style: s })}
              className={`chip ${form.style === s ? 'active' : ''}`}>{s}</div>
          ))}
        </div>
      </div>

      {/* 預算 */}
      <div className="card">
        <label className="text-sm font-medium text-brand-800 mb-2.5 block">預算範圍</label>
        <div className="flex flex-wrap gap-2">
          {budgets.map(b => (
            <div key={b} onClick={() => setForm({ ...form, budget: b })}
              className={`chip ${form.budget === b ? 'active' : ''}`}>{b}</div>
          ))}
        </div>
      </div>

      {/* 空間需求 */}
      <div className="card">
        <label className="text-sm font-medium text-brand-800 mb-2.5 block">需要規劃的空間（可複選）</label>
        <div className="flex flex-wrap gap-2">
          {rooms.map(r => (
            <div key={r} onClick={() => toggleRoom(r)}
              className={`chip ${form.rooms.includes(r) ? 'active' : ''}`}>{r}</div>
          ))}
        </div>
      </div>

      {/* 補充說明 */}
      <div className="card">
        <label className="text-sm font-medium text-brand-800 mb-1.5 block">補充需求</label>
        <textarea value={form.needs}
          onChange={e => setForm({ ...form, needs: e.target.value })}
          className="form-input min-h-[80px] resize-none" placeholder="例如：有小孩需要安全考量、希望有大量收納空間…" />
      </div>

      {/* 優惠代碼 */}
      <div className="card">
        <label className="text-sm font-medium text-brand-800 mb-1.5 block">優惠代碼（選填）</label>
        <div className="flex gap-2">
          <input type="text" value={form.promoCode}
            onChange={e => { setForm({ ...form, promoCode: e.target.value }); setPromoVerified(false); setPromoError('') }}
            className="form-input flex-1" placeholder="例如：GREEN2026" />
          <button type="button" onClick={verifyPromo}
            className="px-4 py-2.5 border border-brand-500 text-brand-500 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-brand-50 transition-colors">
            {promoVerified ? '已驗證' : '驗證'}
          </button>
        </div>
        {promoVerified && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-brand-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
            優惠已套用：設計費 9 折 + 空氣清淨檢測
          </div>
        )}
        {promoError && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-red-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
            {promoError}
          </div>
        )}
      </div>

      <button type="submit" className="btn-primary">送出需求</button>
      <p className="text-[11px] text-center text-gray-400 pb-2">提交後將由專人聯繫，安排免費到府諮詢</p>
    </form>
  )
}
