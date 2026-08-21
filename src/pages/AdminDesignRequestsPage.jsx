import { useEffect, useState } from 'react'
import { listDesignRequests, updateDesignRequestStatus, deleteRow } from '../lib/adminApi'

const STATUSES = [
  { value: 'pending', label: '待聯繫', color: '#E8A700' },
  { value: 'contacted', label: '已聯繫', color: '#3A77E8' },
  { value: 'surveying', label: '丈量中', color: '#7B5BE0' },
  { value: 'designing', label: '設計中', color: '#0F8E4E' },
  { value: 'contracted', label: '已簽約', color: '#0A6B3A' },
  { value: 'closed', label: '已結案', color: '#888' }
]

const fmt = (s) => s ? new Date(s).toLocaleString('zh-TW', { hour12: false }) : '-'
const statusMeta = (s) => STATUSES.find(x => x.value === s) || STATUSES[0]

export default function AdminDesignRequestsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const load = () => {
    setLoading(true)
    listDesignRequests().then(r => {
      setRows(r)
      setLoading(false)
    }).catch(e => {
      console.error(e)
      setLoading(false)
    })
  }

  useEffect(load, [])

  const filtered = filter === 'all' ? rows : rows.filter(r => r.status === filter)
  const pending = rows.filter(r => r.status === 'pending').length
  const today = rows.filter(r => {
    const t = new Date(r.created_at)
    const now = new Date()
    return t.toDateString() === now.toDateString()
  }).length

  const onStatus = async (id, status) => {
    await updateDesignRequestStatus(id, status)
    load()
    if (selected?.id === id) setSelected({ ...selected, status })
  }

  const onDelete = async (id) => {
    if (!confirm('確定刪除這筆設計需求？')) return
    await deleteRow('design_requests', id)
    setSelected(null)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ color: '#04342C', fontSize: 22, margin: 0 }}>📋 設計需求</h2>
        <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#666' }}>
          <span>總數 <b style={{ color: '#0A6B3A' }}>{rows.length}</b></span>
          <span>今日 <b style={{ color: '#0A6B3A' }}>{today}</b></span>
          <span>待聯繫 <b style={{ color: '#E8A700' }}>{pending}</b></span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('all')} style={filterBtn(filter === 'all')}>全部</button>
        {STATUSES.map(s => (
          <button key={s.value} onClick={() => setFilter(s.value)} style={filterBtn(filter === s.value)}>
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead style={{ background: '#F5F8F5' }}>
            <tr>
              <th style={th}>姓名</th>
              <th style={th}>電話</th>
              <th style={th}>地區</th>
              <th style={th}>坪數</th>
              <th style={th}>風格</th>
              <th style={th}>預算</th>
              <th style={th}>狀態</th>
              <th style={th}>提交時間</th>
              <th style={th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={loadingTd}>載入中…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} style={loadingTd}>沒有資料</td></tr>
            ) : filtered.map(r => {
              const m = statusMeta(r.status)
              return (
                <tr key={r.id} style={{ borderTop: '1px solid #F0F0F0' }}>
                  <td style={td}><b>{r.name}</b></td>
                  <td style={td}>{r.phone}</td>
                  <td style={td}>{r.area || '-'}</td>
                  <td style={td}>{r.ping ? `${r.ping} 坪` : '-'}</td>
                  <td style={td}>{r.style || '-'}</td>
                  <td style={td}>{r.budget || '-'}</td>
                  <td style={td}>
                    <span style={{ ...badge, background: m.color + '20', color: m.color }}>{m.label}</span>
                  </td>
                  <td style={{ ...td, color: '#888', fontSize: 12 }}>{fmt(r.created_at)}</td>
                  <td style={td}>
                    <button onClick={() => setSelected(r)} style={viewBtn}>查看</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selected && <DetailModal row={selected} onClose={() => setSelected(null)} onStatus={onStatus} onDelete={onDelete} />}
    </div>
  )
}

function DetailModal({ row, onClose, onStatus, onDelete }) {
  return (
    <div onClick={onClose} style={modalBg}>
      <div onClick={e => e.stopPropagation()} style={modalCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: '#0A6B3A' }}>{row.name} 的需求單</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, fontSize: 14 }}>
          <Field label="電話" value={row.phone} />
          <Field label="地區" value={row.area} />
          <Field label="坪數" value={row.ping ? `${row.ping} 坪` : null} />
          <Field label="屋齡" value={row.house_age} />
          <Field label="風格" value={row.style} />
          <Field label="預算" value={row.budget} />
          <Field label="時程" value={row.timeline} />
          <Field label="優惠碼" value={row.promo_code} />
        </div>

        {row.rooms && row.rooms.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={labelStyle}>需求空間</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {row.rooms.map(r => <span key={r} style={chip}>{r}</span>)}
            </div>
          </div>
        )}

        {row.needs && (
          <div style={{ marginBottom: 16 }}>
            <div style={labelStyle}>需求描述</div>
            <div style={{ background: '#F5F8F5', padding: 12, borderRadius: 8, fontSize: 13, whiteSpace: 'pre-wrap' }}>{row.needs}</div>
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <div style={labelStyle}>狀態</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUSES.map(s => (
              <button key={s.value} onClick={() => onStatus(row.id, s.value)} style={{
                padding: '6px 12px',
                border: row.status === s.value ? `1px solid ${s.color}` : '1px solid #E5E5E5',
                background: row.status === s.value ? s.color + '15' : '#fff',
                color: row.status === s.value ? s.color : '#666',
                borderRadius: 6,
                fontSize: 13,
                cursor: 'pointer'
              }}>{s.label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid #F0F0F0' }}>
          <div style={{ color: '#888', fontSize: 12 }}>提交時間：{fmt(row.created_at)}</div>
          <button onClick={() => onDelete(row.id)} style={{
            background: '#FEE', color: '#C33', border: '1px solid #FCC',
            borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer'
          }}>刪除</button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={{ color: value ? '#04342C' : '#999' }}>{value || '-'}</div>
    </div>
  )
}

const th = { padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#666', fontWeight: 600, borderBottom: '1px solid #E5E5E5' }
const td = { padding: '10px 12px', color: '#04342C' }
const loadingTd = { ...td, textAlign: 'center', color: '#888', padding: 30 }
const badge = { padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }
const viewBtn = { background: '#E8F5EE', color: '#0F8E4E', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }
const chip = { background: '#E8F5EE', color: '#0A6B3A', padding: '2px 8px', borderRadius: 4, fontSize: 12 }
const labelStyle = { fontSize: 11, color: '#888', marginBottom: 4 }
const modalBg = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
const modalCard = { background: '#fff', borderRadius: 12, padding: 24, maxWidth: 640, width: '100%', maxHeight: '90vh', overflow: 'auto' }
const filterBtn = (active) => ({
  padding: '6px 14px',
  borderRadius: 20,
  border: '1px solid ' + (active ? '#0F8E4E' : '#E5E5E5'),
  background: active ? '#E8F5EE' : '#fff',
  color: active ? '#0A6B3A' : '#666',
  fontSize: 13,
  cursor: 'pointer'
})
