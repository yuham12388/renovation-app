import { useEffect, useState } from 'react'
import { listEstimateRecords, deleteRow } from '../lib/adminApi'

const LEVELS = { basic: '基本', standard: '標準', premium: '高階' }
const fmt = (n) => n ? Number(n).toLocaleString() : '-'
const fmtDate = (s) => s ? new Date(s).toLocaleString('zh-TW', { hour12: false }) : '-'

export default function AdminEstimateRecordsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const load = () => {
    setLoading(true)
    listEstimateRecords().then(r => {
      setRows(r)
      setLoading(false)
    }).catch(e => { console.error(e); setLoading(false) })
  }

  useEffect(load, [])

  const filtered = filter === 'all' ? rows : rows.filter(r => r.level === filter)
  const today = rows.filter(r => new Date(r.created_at).toDateString() === new Date().toDateString()).length

  const onDelete = async (id) => {
    if (!confirm('確定刪除這筆估價記錄？')) return
    await deleteRow('estimate_records', id)
    setSelected(null)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ color: '#04342C', fontSize: 22, margin: 0 }}>💰 估價記錄</h2>
        <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#666' }}>
          <span>總數 <b style={{ color: '#0A6B3A' }}>{rows.length}</b></span>
          <span>今日 <b style={{ color: '#0A6B3A' }}>{today}</b></span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={() => setFilter('all')} style={filterBtn(filter === 'all')}>全部</button>
        {Object.entries(LEVELS).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)} style={filterBtn(filter === k)}>{v}</button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead style={{ background: '#F5F8F5' }}>
            <tr>
              <th style={th}>坪數</th>
              <th style={th}>屋齡</th>
              <th style={th}>等級</th>
              <th style={th}>預算範圍（元）</th>
              <th style={th}>工期（天）</th>
              <th style={th}>附加工程</th>
              <th style={th}>時間</th>
              <th style={th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={loadingTd}>載入中…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={loadingTd}>沒有資料</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} style={{ borderTop: '1px solid #F0F0F0' }}>
                <td style={td}><b>{r.ping} 坪</b></td>
                <td style={td}>{r.house_age || '-'}</td>
                <td style={td}>
                  <span style={{ ...badge, background: '#E8F5EE', color: '#0A6B3A' }}>{LEVELS[r.level] || r.level}</span>
                </td>
                <td style={td}>{fmt(r.total_min)} ~ {fmt(r.total_max)}</td>
                <td style={td}>{r.days_min || '-'} ~ {r.days_max || '-'}</td>
                <td style={td}>
                  {r.extras && r.extras.length > 0 ? (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {r.extras.map(e => <span key={e} style={chip}>{e}</span>)}
                    </div>
                  ) : '-'}
                </td>
                <td style={{ ...td, color: '#888', fontSize: 12 }}>{fmtDate(r.created_at)}</td>
                <td style={td}>
                  <button onClick={() => setSelected(r)} style={viewBtn}>查看</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <DetailModal row={selected} onClose={() => setSelected(null)} onDelete={onDelete} />}
    </div>
  )
}

function DetailModal({ row, onClose, onDelete }) {
  return (
    <div onClick={onClose} style={modalBg}>
      <div onClick={e => e.stopPropagation()} style={modalCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: '#0A6B3A' }}>估價詳情</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, fontSize: 14 }}>
          <Field label="坪數" value={`${row.ping} 坪`} />
          <Field label="屋齡" value={row.house_age} />
          <Field label="等級" value={LEVELS[row.level]} />
          <Field label="工期" value={`${row.days_min || '-'} ~ ${row.days_max || '-'} 天`} />
        </div>

        <div style={{ background: '#F5F8F5', padding: 16, borderRadius: 8, marginBottom: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>預算範圍</div>
          <div style={{ fontSize: 22, color: '#0A6B3A', fontWeight: 700 }}>
            NT$ {fmt(row.total_min)} ~ {fmt(row.total_max)}
          </div>
        </div>

        {row.extras && row.extras.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={labelStyle}>附加工程</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {row.extras.map(e => <span key={e} style={chip}>{e}</span>)}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid #F0F0F0' }}>
          <div style={{ color: '#888', fontSize: 12 }}>建立時間：{fmtDate(row.created_at)}</div>
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
const modalCard = { background: '#fff', borderRadius: 12, padding: 24, maxWidth: 560, width: '100%', maxHeight: '90vh', overflow: 'auto' }
const filterBtn = (active) => ({
  padding: '6px 14px', borderRadius: 20,
  border: '1px solid ' + (active ? '#0F8E4E' : '#E5E5E5'),
  background: active ? '#E8F5EE' : '#fff',
  color: active ? '#0A6B3A' : '#666', fontSize: 13, cursor: 'pointer'
})
