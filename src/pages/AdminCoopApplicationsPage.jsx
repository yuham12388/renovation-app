import { useEffect, useState } from 'react'
import { listCoopApplications, listCrewRequests, updateCoopStatus, updateCrewStatus, deleteRow } from '../lib/adminApi'

const COOP_STATUSES = [
  { value: 'pending', label: '待聯繫', color: '#E8A700' },
  { value: 'contacted', label: '已聯繫', color: '#3A77E8' },
  { value: 'signed', label: '已簽約', color: '#0F8E4E' },
  { value: 'closed', label: '已結案', color: '#888' }
]
const CREW_STATUSES = [
  { value: 'pending', label: '待媒合', color: '#E8A700' },
  { value: 'matched', label: '已媒合', color: '#3A77E8' },
  { value: 'confirmed', label: '已確認', color: '#0F8E4E' },
  { value: 'closed', label: '已結案', color: '#888' }
]
const fmtDate = (s) => s ? new Date(s).toLocaleString('zh-TW', { hour12: false }) : '-'
const statusMeta = (s, list) => list.find(x => x.value === s) || list[0]

export default function AdminCoopApplicationsPage() {
  const [coops, setCoops] = useState([])
  const [crews, setCrews] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('coop') // 'coop' | 'crew'
  const [selected, setSelected] = useState(null)

  const load = () => {
    setLoading(true)
    Promise.all([listCoopApplications(), listCrewRequests()]).then(([c, w]) => {
      setCoops(c)
      setCrews(w)
      setLoading(false)
    }).catch(e => { console.error(e); setLoading(false) })
  }

  useEffect(load, [])

  const updateStatus = async (kind, id, status) => {
    if (kind === 'coop') await updateCoopStatus(id, status)
    else await updateCrewStatus(id, status)
    load()
    if (selected?.id === id) setSelected({ ...selected, status })
  }

  const onDelete = async (kind, id) => {
    if (!confirm('確定刪除這筆申請？')) return
    await deleteRow(kind === 'coop' ? 'coop_applications' : 'crew_requests', id)
    setSelected(null)
    load()
  }

  const list = tab === 'coop' ? coops : crews
  const statusList = tab === 'coop' ? COOP_STATUSES : CREW_STATUSES

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ color: '#04342C', fontSize: 22, margin: 0 }}>🤝 申請管理</h2>
        <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#666' }}>
          <span>合作申請 <b style={{ color: '#0A6B3A' }}>{coops.length}</b></span>
          <span>工班需求 <b style={{ color: '#0A6B3A' }}>{crews.length}</b></span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={() => setTab('coop')} style={filterBtn(tab === 'coop')}>商務合作申請</button>
        <button onClick={() => setTab('crew')} style={filterBtn(tab === 'crew')}>工班媒合需求</button>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead style={{ background: '#F5F8F5' }}>
            {tab === 'coop' ? (
              <tr>
                <th style={th}>姓名</th>
                <th style={th}>公司/工作室</th>
                <th style={th}>電話</th>
                <th style={th}>預算</th>
                <th style={th}>狀態</th>
                <th style={th}>時間</th>
                <th style={th}>操作</th>
              </tr>
            ) : (
              <tr>
                <th style={th}>姓名</th>
                <th style={th}>工作室</th>
                <th style={th}>電話</th>
                <th style={th}>類型</th>
                <th style={th}>預算</th>
                <th style={th}>狀態</th>
                <th style={th}>時間</th>
                <th style={th}>操作</th>
              </tr>
            )}
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={tab === 'coop' ? 7 : 8} style={loadingTd}>載入中…</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={tab === 'coop' ? 7 : 8} style={loadingTd}>沒有資料</td></tr>
            ) : list.map(r => {
              const m = statusMeta(r.status, statusList)
              return (
                <tr key={r.id} style={{ borderTop: '1px solid #F0F0F0' }}>
                  <td style={td}><b>{r.name}</b></td>
                  <td style={td}>{r.studio || '-'}</td>
                  <td style={td}>{r.phone}</td>
                  {tab === 'crew' && <td style={td}>{r.type || '-'}</td>}
                  <td style={td}>{r.budget || '-'}</td>
                  <td style={td}>
                    <span style={{ ...badge, background: m.color + '20', color: m.color }}>{m.label}</span>
                  </td>
                  <td style={{ ...td, color: '#888', fontSize: 12 }}>{fmtDate(r.created_at)}</td>
                  <td style={td}>
                    <button onClick={() => setSelected({ ...r, _kind: tab })} style={viewBtn}>查看</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <div onClick={() => setSelected(null)} style={modalBg}>
          <div onClick={e => e.stopPropagation()} style={modalCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#0A6B3A' }}>{selected._kind === 'coop' ? '商務合作申請' : '工班媒合需求'}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, fontSize: 14 }}>
              <Field label="姓名" value={selected.name} />
              <Field label="電話" value={selected.phone} />
              <Field label="公司/工作室" value={selected.studio} />
              {selected._kind === 'crew' && <Field label="案件類型" value={selected.type} />}
              <Field label="預算" value={selected.budget} />
              <Field label="時程" value={selected.timeline} />
            </div>

            {selected.case_desc && (
              <div style={{ marginBottom: 12 }}>
                <div style={labelStyle}>案件說明</div>
                <div style={{ background: '#F5F8F5', padding: 12, borderRadius: 8, fontSize: 13, whiteSpace: 'pre-wrap' }}>{selected.case_desc}</div>
              </div>
            )}

            {selected.needs && (
              <div style={{ marginBottom: 16 }}>
                <div style={labelStyle}>需求描述</div>
                <div style={{ background: '#F5F8F5', padding: 12, borderRadius: 8, fontSize: 13, whiteSpace: 'pre-wrap' }}>{selected.needs}</div>
              </div>
            )}

            <div style={{ marginBottom: 12 }}>
              <div style={labelStyle}>狀態</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {statusList.map(s => (
                  <button key={s.value} onClick={() => updateStatus(selected._kind, selected.id, s.value)} style={{
                    padding: '6px 12px', border: selected.status === s.value ? `1px solid ${s.color}` : '1px solid #E5E5E5',
                    background: selected.status === s.value ? s.color + '15' : '#fff',
                    color: selected.status === s.value ? s.color : '#666',
                    borderRadius: 6, fontSize: 13, cursor: 'pointer'
                  }}>{s.label}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid #F0F0F0' }}>
              <div style={{ color: '#888', fontSize: 12 }}>提交時間：{fmtDate(selected.created_at)}</div>
              <button onClick={() => onDelete(selected._kind, selected.id)} style={{
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
const modalCard = { background: '#fff', borderRadius: 12, padding: 24, maxWidth: 640, width: '100%', maxHeight: '90vh', overflow: 'auto' }
const filterBtn = (active) => ({
  padding: '8px 16px', borderRadius: 8,
  border: '1px solid ' + (active ? '#0F8E4E' : '#E5E5E5'),
  background: active ? '#E8F5EE' : '#fff',
  color: active ? '#0A6B3A' : '#666', fontSize: 13, fontWeight: 500, cursor: 'pointer'
})
