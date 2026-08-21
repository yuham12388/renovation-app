import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitCase, uploadImage } from '../lib/api'

export default function CaseUploadPage() {
  const navigate = useNavigate()
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [form, setForm] = useState({
    title: '', style: '', ping: '', age: '', area: '', layout: '', days: '', budget: '', concept: '', designer: ''
  })
  const [selectedTrades, setSelectedTrades] = useState([])
  const [images, setImages] = useState({ main: null, before: [], after: [], other: [] })

  const styles = ['現代簡約', '北歐風', '工業風', '日式無印', '輕奢風', '美式古典', '其他']
  const trades = ['拆除清運', '水電工程', '泥作工程', '木作/系統櫃', '油漆', '地板', '防水', '廚具', '衛浴', '空調', '門窗', '清潔驗收']

  function toggleTrade(t) {
    setSelectedTrades(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  async function handleImageUpload(category, files, multiple = false) {
    const fileList = Array.from(files)
    if (!fileList.length) return

    try {
      if (multiple) {
        const urls = await Promise.all(fileList.map(f => uploadImage(f)))
        setImages(prev => ({ ...prev, [category]: [...prev[category], ...urls] }))
      } else {
        const url = await uploadImage(fileList[0])
        setImages(prev => ({ ...prev, [category]: url }))
      }
    } catch (err) {
      console.warn('Image upload failed, using placeholder:', err)
      if (multiple) {
        setImages(prev => ({ ...prev, [category]: [...prev[category], ...fileList.map(f => URL.createObjectURL(f))] }))
      } else {
        setImages(prev => ({ ...prev, [category]: URL.createObjectURL(fileList[0]) }))
      }
    }
  }

  async function handleSubmit() {
    if (!form.title || !form.style) {
      setErrorMsg('請至少填寫案例名稱和裝修風格')
      return
    }
    setSubmitting(true)
    setErrorMsg('')
    try {
      await submitCase({
        ...form,
        trades: selectedTrades,
        mainImage: images.main,
        beforeImages: images.before,
        afterImages: images.after,
        otherImages: images.other
      })
      setSuccess(true)
    } catch (err) {
      setErrorMsg('送出失敗，請稍後再試')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setSuccess(false)
    setForm({ title: '', style: '', ping: '', age: '', area: '', layout: '', days: '', budget: '', concept: '', designer: '' })
    setSelectedTrades([])
    setImages({ main: null, before: [], after: [], other: [] })
  }

  if (success) {
    return (
      <div className="px-5 py-10 text-center">
        <div className="w-14 h-14 rounded-full bg-brand-500 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div className="text-lg font-bold text-brand-700 mb-2">案例已送出！</div>
        <div className="text-[13px] text-gray-500 leading-relaxed mb-6">案例將在管理員審核後顯示在「我喜歡的家」列表中。</div>
        <button onClick={() => { reset(); navigate('/gallery') }} className="btn-primary mb-2.5">返回案例列表</button>
        <button onClick={reset} className="w-full py-3 border border-brand-500 bg-white text-brand-500 rounded-xl text-sm font-semibold cursor-pointer">再上傳一個</button>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-brand-500 text-white px-5 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:bg-white/15" onClick={() => navigate('/gallery')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        </div>
        <h1 className="text-[17px] font-semibold">上傳新案例</h1>
        <div className="w-8" />
      </div>

      <div className="p-5">
        <FormField label="案例名稱 *">
          <input className="form-input" placeholder="例：現代簡約三房公寓" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        </FormField>

        <FormField label="裝修風格 *">
          <div className="flex flex-wrap gap-2">
            {styles.map(s => (
              <div key={s} className={`chip ${form.style === s ? 'active' : ''}`} onClick={() => setForm({...form, style: s})}>{s}</div>
            ))}
          </div>
        </FormField>

        <div className="flex gap-3 mb-4">
          <FormField label="坪數" className="flex-1">
            <input type="number" className="form-input" placeholder="例：30" value={form.ping} onChange={e => setForm({...form, ping: e.target.value})} />
          </FormField>
          <FormField label="屋齡（年）" className="flex-1">
            <input type="number" className="form-input" placeholder="例：20" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
          </FormField>
        </div>

        <FormField label="所在地區">
          <select className="form-select" value={form.area} onChange={e => setForm({...form, area: e.target.value})}>
            <option value="">請選擇</option>
            <option>台中市西區</option><option>台中市北區</option><option>台中市南區</option>
            <option>台中市北屯區</option><option>台中市西屯區</option><option>其他</option>
          </select>
        </FormField>

        <FormField label="格局">
          <input className="form-input" placeholder="例：3房2廳2衛" value={form.layout} onChange={e => setForm({...form, layout: e.target.value})} />
        </FormField>

        <div className="flex gap-3 mb-4">
          <FormField label="工期（天）" className="flex-1">
            <input type="number" className="form-input" placeholder="例：45" value={form.days} onChange={e => setForm({...form, days: e.target.value})} />
          </FormField>
          <FormField label="總預算（萬）" className="flex-1">
            <input type="number" className="form-input" placeholder="例：98" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} />
          </FormField>
        </div>

        <FormField label="案例主圖">
          <UploadBox text="點擊上傳主圖" hint="建議 4:3 比例，10MB 以內" preview={images.main} onChange={files => handleImageUpload('main', files, false)} />
        </FormField>
        <FormField label="改造前照片（選填）">
          <UploadBox text="點擊上傳改造前照片" previews={images.before} onChange={files => handleImageUpload('before', files, true)} multiple />
        </FormField>
        <FormField label="改造後照片（選填）">
          <UploadBox text="點擊上傳改造後照片" previews={images.after} onChange={files => handleImageUpload('after', files, true)} multiple />
        </FormField>
        <FormField label="其他施工照片（可多張）">
          <UploadBox text="點擊上傳多張照片" previews={images.other} onChange={files => handleImageUpload('other', files, true)} multiple />
        </FormField>

        <FormField label="設計理念">
          <textarea className="form-input" rows="3" placeholder="描述設計想法、屋主需求、解決方案..." value={form.concept} onChange={e => setForm({...form, concept: e.target.value})} style={{resize: 'vertical'}} />
        </FormField>

        <FormField label="主要工項（可複選）">
          <div className="flex flex-wrap gap-2">
            {trades.map(t => (
              <div key={t} className={`chip ${selectedTrades.includes(t) ? 'active' : ''}`} onClick={() => toggleTrade(t)}>{t}</div>
            ))}
          </div>
        </FormField>

        <FormField label="主持設計師">
          <input className="form-input" placeholder="例：陳設計師" value={form.designer} onChange={e => setForm({...form, designer: e.target.value})} />
        </FormField>

        {errorMsg && (
          <div className="text-xs text-red-500 text-center mb-3">{errorMsg}</div>
        )}

        <button onClick={handleSubmit} disabled={submitting} className="btn-primary mb-3">
          {submitting ? '送出中…' : '發佈案例'}
        </button>
        <div className="text-[11px] text-gray-400 text-center pb-6">發佈後案例需管理員審核才會顯示</div>
      </div>
    </div>
  )
}

function FormField({ label, children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="text-[13px] font-medium text-gray-700 mb-1.5 block">{label}</label>
      {children}
    </div>
  )
}

function UploadBox({ text, hint, multiple, preview, previews, onChange }) {
  return (
    <div>
      {(preview || (previews && previews.length > 0)) && (
        <div className="flex flex-wrap gap-2 mb-2">
          {preview && <img src={preview} alt="preview" className="w-20 h-20 object-cover rounded-lg" />}
          {previews && previews.map((url, i) => (
            <img key={i} src={url} alt={`preview ${i}`} className="w-20 h-20 object-cover rounded-lg" />
          ))}
        </div>
      )}
      <label className="block border-2 border-dashed border-cream-300 rounded-xl p-6 text-center cursor-pointer bg-cream-50 hover:border-brand-400 transition-colors">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C8C6BC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <div className="text-[13px] text-gray-500 font-medium">{text}</div>
        {hint && <div className="text-[11px] text-gray-400 mt-1">{hint}</div>}
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={e => e.target.files.length > 0 && onChange(e.target.files)}
        />
      </label>
    </div>
  )
}
