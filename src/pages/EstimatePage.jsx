import { useState, useMemo } from 'react'
import { saveEstimate } from '../lib/api'

// 均價參考（台灣中區行情，每坪）
const PRICE_PER_PING = {
  basic: { label: '輕裝修', min: 3, max: 5, desc: '局部修繕、粉刷、簡易木作' },
  standard: { label: '標準裝修', min: 6, max: 9, desc: '全室水電、木作、系統櫃、地板' },
  premium: { label: '高質感裝修', min: 10, max: 15, desc: '全屋定制、綠建材、智能整合' },
  luxury: { label: '頂級豪裝', min: 16, max: 25, desc: '進口建材、訂製工法、全智能宅' }
}

const EXTRA_ITEMS = [
  { id: 'demolition', label: '拆除工程', price: 3 },
  { id: 'waterproof', label: '防水工程', price: 2 },
  { id: 'ac', label: '冷氣空調', price: 4 },
  { id: 'system_cabinet', label: '系統櫃追加', price: 5 },
  { id: 'smart_home', label: '智能家居', price: 6 },
  { id: 'eco_material', label: '綠建材升級', price: 3 }
]

export default function EstimatePage() {
  const [ping, setPing] = useState('')
  const [level, setLevel] = useState('standard')
  const [extras, setExtras] = useState({})
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  const pingNum = parseFloat(ping) || 0

  const result = useMemo(() => {
    if (pingNum <= 0) return null
    const tier = PRICE_PER_PING[level]
    const baseMin = tier.min * pingNum
    const baseMax = tier.max * pingNum
    let extraTotal = 0
    Object.keys(extras).forEach(k => {
      if (extras[k]) {
        const item = EXTRA_ITEMS.find(i => i.id === k)
        if (item) extraTotal += item.price
      }
    })
    const extraFinal = extraTotal * pingNum
    return {
      tier,
      baseMin: Math.round(baseMin),
      baseMax: Math.round(baseMax),
      extra: Math.round(extraFinal),
      totalMin: Math.round(baseMin + extraFinal),
      totalMax: Math.round(baseMax + extraFinal)
    }
  }, [pingNum, level, extras])

  const toggleExtra = (id) => {
    setExtras(prev => ({ ...prev, [id]: !prev[id] }))
    setSavedMsg('')
  }

  async function handleSave() {
    if (!result) return
    setSaving(true)
    setSavedMsg('')
    try {
      const extraIds = Object.keys(extras).filter(k => extras[k])
      await saveEstimate({
        ping: pingNum,
        level,
        extras: extraIds,
        total_min: result.totalMin,
        total_max: result.totalMax
      })
      setSavedMsg('估價已儲存！可在案件中查看歷史記錄')
    } catch (err) {
      setSavedMsg('儲存失敗，請稍後再試')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-5 py-5">
      <h2 className="text-lg font-bold text-brand-800 mb-1">快速估價</h2>
      <p className="text-xs text-gray-500 mb-5">輸入基本資訊，即刻估算裝修預算範圍</p>

      {/* 坪數輸入 */}
      <div className="card mb-4">
        <label className="text-sm font-medium text-brand-800 mb-2 block">房屋坪數</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={ping}
            onChange={e => { setPing(e.target.value); setSavedMsg('') }}
            placeholder="例如：30"
            className="form-input flex-1"
            min="0"
          />
          <span className="text-sm text-gray-500 font-medium">坪</span>
        </div>
        {pingNum > 0 && (
          <div className="text-[11px] text-gray-400 mt-1.5">約 {Math.round(pingNum * 3.3058)} 平方公尺</div>
        )}
      </div>

      {/* 裝修等級 */}
      <div className="mb-4">
        <label className="text-sm font-medium text-brand-800 mb-2 block">裝修等級</label>
        <div className="space-y-2">
          {Object.entries(PRICE_PER_PING).map(([key, v]) => (
            <div key={key}
              onClick={() => { setLevel(key); setSavedMsg('') }}
              className={`card cursor-pointer transition-all ${level === key ? 'border-brand-500 ring-1 ring-brand-500' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-brand-800">{v.label}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{v.desc}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-brand-600">{v.min}–{v.max}萬</div>
                  <div className="text-[10px] text-gray-400">每坪</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 附加工程 */}
      <div className="mb-4">
        <label className="text-sm font-medium text-brand-800 mb-2 block">附加工程（可複選）</label>
        <div className="flex flex-wrap gap-2">
          {EXTRA_ITEMS.map(item => (
            <div key={item.id}
              onClick={() => toggleExtra(item.id)}
              className={`chip ${extras[item.id] ? 'active' : ''}`}>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* 估價結果 */}
      {result ? (
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-2xl p-5 mt-4">
          <div className="text-xs opacity-80 mb-1">預估總價範圍</div>
          <div className="text-3xl font-bold mb-3">
            {result.totalMin}–{result.totalMax}
            <span className="text-base font-normal ml-1">萬元</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between opacity-90">
              <span>{result.tier.label}基礎 ({result.tier.min}–{result.tier.max}萬/坪 × {pingNum}坪)</span>
              <span>{result.baseMin}–{result.baseMax}萬</span>
            </div>
            {result.extra > 0 && (
              <div className="flex justify-between opacity-90">
                <span>附加工程</span>
                <span>+{result.extra}萬</span>
              </div>
            )}
          </div>

          <div className="border-t border-white/20 my-3" />

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-white/15 hover:bg-white/25 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors mb-2"
          >
            {saving ? '儲存中…' : '儲存估價記錄'}
          </button>
          {savedMsg && (
            <div className="text-[11px] text-center opacity-80">{savedMsg}</div>
          )}

          <p className="text-[11px] opacity-60 leading-relaxed mt-2">
            ※ 以上為參考估值，實際價格依現場勘查、材料選擇與施工條件而定。歡迎使用「設計我家」獲取精確報價。
          </p>
        </div>
      ) : (
        <div className="card text-center py-8 text-gray-400">
          <div className="text-3xl mb-2">🧮</div>
          <div className="text-sm">請輸入坪數開始估算</div>
        </div>
      )}
    </div>
  )
}
