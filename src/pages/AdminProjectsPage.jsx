import { useEffect, useState } from 'react'
import { listProjects, listProjectStages, updateProjectStatus, deleteRow } from '../lib/adminApi'

const STATUSES = [
  { value: 'planning', label: '規劃中', color: '#7B5BE0' },
  { value: '施工中', label: '施工中', color: '#E8A700' },
  { value: '驗收中', label: '驗收中', color: '#3A77E8' },
  { value: '完工', label: '完工', color: '#0F8E4E' },
  { value: '保固中', label: '保固中', color: '#0A6B3A' }
]
const fmtDate = (s) => s ? new Date(s).toLocaleDateString('zh-TW') : '-'
const statusMeta = (s) => STATUSES.find(x => x.value === s) || STATUSES[0]

export default function AdminProjectsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [stages, setStages] = useState([])

  const load = () => {
    setLoading(true)
    listProjects().then(r => {
      setRows(r)
      setLoading(false)
    }).catch(e => { console.error(e); setLoading(false) })
  }

  useEffect(load, [])

  const openDetail = async (row) => {
    setSelected(row)
    setStages([])
    const s = await listProjectStages(row.id)
    setStages(s)
  }

  const filtered = filter === 'all' ? rows : rows.filter(r => r.status === filter)
  const active = rows.filter(r => r.status === '施工中').length
  const done = rows.filter(r => r.status === '完工' || r.status === '保固中').length

  const onStatus = async (id, status) => {
    await updateProjectStatus(id, { status })
    load()
    if (selected?.id === id) setSelected({ ...selected, status })
  }

  const onProgress = async (id, progress) => {
    await updateProjectStatus(id, { progress: Number(progress) })
    load()
    if (selected?.id === id) setSelected({ ...selected, progress: Number(progress) })
  }

  const onDelete = async (id) => {
    if (!confirm('確定刪除這個案件？')) return
    await deleteRow('projects', id)
    setSelected(null)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ color: '#04342C', fontSize: 22, margin: 0 }}>🏗️ 案件管理</h2>
        <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#666' }}>
          <span>總數 <b style={{ color: '#0A6B3A' }}>{rows.length}</b></span>
          <span>施工中 <b style={{ color: '#E8A700' }}>{active}</b></span>
          <span>已完工 <b style={{ color: '#0F8E4E' }}>{done}</b></span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('all')} style={filterBtn(filter === 'all')}>全部</button>
        {STATUSES.map(s => (
          <button key={s.value} onClick={() => setFilter(s.value)} style={filterBtn(filter === s.value)}>{s.label}</button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead style={{ background: '#F5F8F5' }}>
            <tr>
              <th style={th}>案件名稱</th>
              <th style={th}>地址</th>
              <th style={th}>坪數</th>
              <th style={th}>設計師</th>
              <th style={th}>預算</th>
              <th style={th}>進度</th>
              <th style={th}>狀態</th>
              <th style={th}>開工</th>
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
                  <td style={td}><b>{r.title}</b></td>
                  <td style={td}>{r.address || '-'}</td>
                  <td style={td}>{r.ping ? `${r.ping} 坪` : '-'}</td>
                  <td style={td}>{r.designer || '-'}</td>
                  <td style={td}>{r.budget || '-'}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 60, height: 6, background: '#E5E5E5', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${r.progress || 0}%`, height: '100%', background: '#0F8E4E' }} />
                      </div>
                      <span style={{ fontSize: 12, color: '#666' }}>{r.progress || 0}%</span>
                    </div>
                  </td>
                  <td style={td}>
                    <span style={{ ...badge, background: m.color + '20', color: m.color }}>{m.label}</span>
                  </td>
                  <td style={{ ...td, color: '#888', fontSize: 12 }}>{fmtDate(r.start_date)}</td>
                  <td style={td}>
                    <button onClick={() => openDetail(r)} style={viewBtn}>查看</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <div onClick={() => setSelected(null)} style={modalBg}>
          <div onClick={e => e.stopPropagation()} style={{ ...modalCard, maxWidth: 720 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#0A6B3A' }}>{selected.title}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, fontSize: 14 }}>
              <Field label="地址" value={selected.address} />
              <Field label="坪數" value={selected.ping ? `${selected.ping} 坪` : null} />
              <Field label="設計師" value={selected.designer} />
              <Field label="預算" value={selected.budget} />
              <Field label="開工日" value={fmtDate(selected.start_date)} />
              <Field label="完工日" value={fmtDate(selected.end_date)} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={labelStyle}>狀態</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {STATUSES.map(s => (
                  <button key={s.value} onClick={() => onStatus(selected.id, s.value)} style={{
                    padding: '6px 12px', border: selected.status === s.value ? `1px solid ${s.color}` : '1px solid #E5E5E5',
                    background: selected.status === s.value ? s.color + '15' : '#fff',
                    color: selected.status === s.value ? s.color : '#666',
                    borderRadius: 6, fontSize: 13, cursor: 'pointer'
                  }}>{s.label}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={labelStyle}>進度（{selected.progress || 0}%）</div>
              <input
                type="range" min="0" max="100" step="5"
                value={selected.progress || 0}
                onChange={e => setSelected({ ...selected, progress: Number(e.target.value) })}
                onMouseUp={e => onProgress(selected.id, e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            {stages.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={labelStyle}>施工階段</div>
                {stages.map(st => (
                  <div key={st.id} style={{ padding: '8px 12px', background: '#F5F8F5', borderRadius: 6, marginBottom: 4, fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{st.name}</span>
                    <span style={{ color: st.status === 'done' ? '#0F8E4E' : '#888' }}>{st.status}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid #F0F0F0' }}>
              <button onClick={() => onDelete(selected.id)} style={{
                background: '#FEE', color: '#C33', border: '1px solid #FCC',
                borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer'
              }}>刪除</button>
            </div>
          </div>
        </div>
      )}
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
const labelStyle = { fontSize: 11, color: '#888', marginBottom: 4 }
const modalBg = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
const modalCard = { background: '#fff', borderRadius: 12, padding: 24, maxWidth: 560, width: '100%', maxHeight: '90vh', overflow: 'auto' }
const filterBtn = (active) => ({
  padding: '6px 14px', borderRadius: 20,
  border: '1px solid ' + (active ? '#0F8E4E' : '#E5E5E5'),
  background: active ? '#E8F5EE' : '#fff',
  color: active ? '#0A6B3A' : '#666', fontSize: 13, cursor: 'pointer'
})
