import { useEffect, useState } from 'react'
import { listProjects, listProjectStages, updateProjectStatus, updateStageStatus, deleteRow, createProject } from '../lib/adminApi'
import { uploadStageMedia, fetchStageMedia, deleteStageMedia } from '../lib/api'

const STATUSES = [
  { value: 'planning', label: '規劃中', color: '#7B5BE0' },
  { value: '施工中', label: '施工中', color: '#E8A700' },
  { value: '驗收中', label: '驗收中', color: '#3A77E8' },
  { value: '完工', label: '完工', color: '#0F8E4E' },
  { value: '保固中', label: '保固中', color: '#0A6B3A' }
]
const STAGE_STATUSES = [
  { value: 'pending', label: '待施工', color: '#999' },
  { value: 'active', label: '施工中', color: '#E8A700' },
  { value: 'done', label: '已完成', color: '#0F8E4E' }
]
const fmtDate = (s) => s ? new Date(s).toLocaleDateString('zh-TW') : '-'
const statusMeta = (s) => STATUSES.find(x => x.value === s) || STATUSES[0]

export default function AdminProjectsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [stages, setStages] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [mediaMap, setMediaMap] = useState({})

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
    setMediaMap({})
    const s = await listProjectStages(row.id)
    setStages(s)
    // 載入每個節點的媒體
    const m = {}
    await Promise.all(s.map(async st => {
      const media = await fetchStageMedia(st.id)
      if (media.length > 0) m[st.id] = media
    }))
    setMediaMap(m)
  }

  // 上傳照片到節點
  const onUploadMedia = async (stageId, files) => {
    for (const file of files) {
      try {
        await uploadStageMedia(stageId, selected.id, file, '')
      } catch (e) {
        alert('上傳失敗：' + e.message)
      }
    }
    // 重新載入
    const media = await fetchStageMedia(stageId)
    setMediaMap(prev => ({ ...prev, [stageId]: media }))
  }

  // 刪除媒體
  const onDeleteMedia = async (stageId, mediaId) => {
    await deleteStageMedia(mediaId)
    const media = await fetchStageMedia(stageId)
    setMediaMap(prev => ({ ...prev, [stageId]: media.length > 0 ? media : undefined }))
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

  const onStageStatus = async (stageId, status) => {
    await updateStageStatus(stageId, { status })
    // 重新載入階段
    if (selected) {
      const s = await listProjectStages(selected.id)
      setStages(s)
    }
  }

  const onStageNote = async (stageId, note) => {
    await updateStageStatus(stageId, { note })
    if (selected) {
      const s = await listProjectStages(selected.id)
      setStages(s)
    }
  }

  const onDelete = async (id) => {
    if (!confirm('確定刪除這個案件？')) return
    await deleteRow('projects', id)
    setSelected(null)
    load()
  }

  const onCreate = async (form) => {
    try {
      await createProject(form)
      setShowCreate(false)
      load()
    } catch (e) {
      alert('建立失敗：' + e.message)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ color: '#04342C', fontSize: 22, margin: 0 }}>🏗️ 案件管理</h2>
        <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#666', alignItems: 'center' }}>
          <span>總數 <b style={{ color: '#0A6B3A' }}>{rows.length}</b></span>
          <span>施工中 <b style={{ color: '#E8A700' }}>{active}</b></span>
          <span>已完工 <b style={{ color: '#0F8E4E' }}>{done}</b></span>
          <button onClick={() => setShowCreate(true)} style={{
            padding: '6px 14px', background: '#0F8E4E', color: '#fff',
            border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 600
          }}>+ 新建案件</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('all')} style={filterBtn(filter === 'all')}>全部</button>
        {STATUSES.map(s => (
          <button key={s.value} onClick={() => setFilter(s.value)} style={filterBtn(filter === s.value)}>{s.label}</button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 10, overflow: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 800 }}>
          <thead style={{ background: '#F5F8F5' }}>
            <tr>
              <th style={th}>案件名稱</th>
              <th style={th}>地址</th>
              <th style={th}>坪數</th>
              <th style={th}>屋主電話</th>
              <th style={th}>設計師</th>
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
                  <td style={td}>{r.owner_phone || '-'}</td>
                  <td style={td}>{r.designer || '-'}</td>
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

      {/* 詳情 Modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={modalBg}>
          <div onClick={e => e.stopPropagation()} style={{ ...modalCard, maxWidth: 760 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, color: '#0A6B3A' }}>{selected.title}</h3>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                  屋主電話：{selected.owner_phone || '未設定'}
                </div>
              </div>
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
              <div style={labelStyle}>案件狀態</div>
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
              <div style={labelStyle}>整體進度（{selected.progress || 0}%）</div>
              <input
                type="range" min="0" max="100" step="5"
                value={selected.progress || 0}
                onChange={e => setSelected({ ...selected, progress: Number(e.target.value) })}
                onMouseUp={e => onProgress(selected.id, e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            {/* 施工節點管理 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ ...labelStyle, fontSize: 14, fontWeight: 600, color: '#0A6B3A', marginBottom: 8 }}>
                施工進度節點
              </div>
              {stages.length === 0 ? (
                <div style={{ ...loadingTd, background: '#F5F8F5', borderRadius: 6 }}>尚無節點資料</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stages.map((st, idx) => {
                    const sm = STAGE_STATUSES.find(x => x.value === st.status) || STAGE_STATUSES[0]
                    return (
                      <StageRow
                        key={st.id}
                        stage={st}
                        index={idx}
                        sm={sm}
                        onStatus={onStageStatus}
                        onNote={onStageNote}
                        media={mediaMap[st.id] || []}
                        onUpload={(files) => onUploadMedia(st.id, files)}
                        onDeleteMedia={(mediaId) => onDeleteMedia(st.id, mediaId)}
                      />
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid #F0F0F0' }}>
              <button onClick={() => onDelete(selected.id)} style={{
                background: '#FEE', color: '#C33', border: '1px solid #FCC',
                borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer'
              }}>刪除案件</button>
            </div>
          </div>
        </div>
      )}

      {/* 新建案件 Modal */}
      {showCreate && (
        <CreateProjectModal onClose={() => setShowCreate(false)} onCreate={onCreate} />
      )}
    </div>
  )
}

function StageRow({ stage, index, sm, onStatus, onNote, media, onUpload, onDeleteMedia }) {
  const [showNote, setShowNote] = useState(false)
  const [noteText, setNoteText] = useState(stage.note || '')
  const [uploading, setUploading] = useState(false)
  const fileRef = useState({})[0]

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    await onUpload(files)
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div style={{ padding: '10px 12px', background: '#F5F8F5', borderRadius: 8, fontSize: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#999', fontSize: 11, minWidth: 20 }}>{index + 1}.</span>
          <b style={{ color: '#04342C' }}>{stage.name}</b>
          <span style={{ ...badge, background: sm.color + '20', color: sm.color }}>{sm.label}</span>
          {media.length > 0 && (
            <span style={{ ...badge, background: '#E6F1FB', color: '#185FA5' }}>{media.length} 張</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {STAGE_STATUSES.map(s => (
            <button key={s.value} onClick={() => onStatus(stage.id, s.value)} style={{
              padding: '3px 8px', fontSize: 11,
              border: stage.status === s.value ? `1px solid ${s.color}` : '1px solid #E0E0E0',
              background: stage.status === s.value ? s.color + '15' : '#fff',
              color: stage.status === s.value ? s.color : '#999',
              borderRadius: 4, cursor: 'pointer'
            }}>{s.label}</button>
          ))}
        </div>
      </div>
      {(stage.start_date || stage.end_date) && (
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 4, paddingLeft: 28 }}>
          {stage.start_date}{stage.end_date ? ` ~ ${stage.end_date}` : ''}
        </div>
      )}
      {stage.note && !showNote && (
        <div style={{ fontSize: 12, color: '#666', marginTop: 4, paddingLeft: 28, cursor: 'pointer' }}
          onClick={() => { setNoteText(stage.note); setShowNote(true) }}>
          📝 {stage.note}
        </div>
      )}
      {showNote ? (
        <div style={{ marginTop: 6, paddingLeft: 28, display: 'flex', gap: 6 }}>
          <input
            type="text"
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="輸入備註…"
            style={{ flex: 1, padding: '4px 8px', fontSize: 12, border: '1px solid #E0E0E0', borderRadius: 4 }}
          />
          <button onClick={() => { onNote(stage.id, noteText); setShowNote(false) }}
            style={{ padding: '4px 10px', fontSize: 11, background: '#0F8E4E', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            儲存
          </button>
          <button onClick={() => setShowNote(false)}
            style={{ padding: '4px 10px', fontSize: 11, background: '#eee', color: '#666', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            取消
          </button>
        </div>
      ) : (
        !stage.note && (
          <div style={{ marginTop: 4, paddingLeft: 28 }}>
            <button onClick={() => setShowNote(true)}
              style={{ fontSize: 11, color: '#0F8E4E', background: 'none', border: 'none', cursor: 'pointer' }}>
              + 加備註
            </button>
          </div>
        )
      )}

      {/* 照片/影片區 */}
      <div style={{ marginTop: 6, paddingLeft: 28 }}>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          ref={el => { fileRef.current = el }}
          onChange={handleFiles}
          style={{ display: 'none' }}
          id={`upload-${stage.id}`}
        />
        <button
          onClick={() => document.getElementById(`upload-${stage.id}`).click()}
          disabled={uploading}
          style={{
            fontSize: 11, color: '#fff', background: uploading ? '#ccc' : '#185FA5',
            border: 'none', borderRadius: 4, padding: '4px 10px', cursor: uploading ? 'default' : 'pointer'
          }}>
          {uploading ? '上傳中…' : '+ 上傳照片/影片'}
        </button>

        {media.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
            {media.map((m, mi) => (
              <div key={m.id || mi} style={{ position: 'relative', width: 56, height: 56, borderRadius: 6, overflow: 'hidden' }}>
                {m.type === 'video' ? (
                  <video src={m.url} className="w-full h-full object-cover" preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img src={m.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                <button
                  onClick={() => onDeleteMedia(m.id)}
                  style={{
                    position: 'absolute', top: 2, right: 2, width: 16, height: 16,
                    borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff',
                    border: 'none', fontSize: 10, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', lineHeight: 1
                  }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CreateProjectModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '', address: '', ping: '', owner_phone: '', owner_name: '',
    budget: '', designer: '', start_date: '', end_date: '', status: 'planning'
  })

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) { alert('請輸入案件名稱'); return }
    if (!form.owner_phone.trim()) { alert('請輸入屋主電話'); return }
    onCreate(form)
  }

  return (
    <div onClick={onClose} style={modalBg}>
      <div onClick={e => e.stopPropagation()} style={{ ...modalCard, maxWidth: 560 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: '#0A6B3A' }}>新建案件</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>×</button>
        </div>
        <form onSubmit={submit} style={{ display: 'grid', gap: 12, fontSize: 14 }}>
          <Input label="案件名稱 *" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="例：西區張宅 · 現代簡約翻新" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="屋主電話 *" value={form.owner_phone} onChange={v => setForm({ ...form, owner_phone: v })} placeholder="0912345678" />
            <Input label="屋主姓名" value={form.owner_name} onChange={v => setForm({ ...form, owner_name: v })} placeholder="張先生" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="地址" value={form.address} onChange={v => setForm({ ...form, address: v })} placeholder="台中市西區" />
            <Input label="坪數" value={form.ping} onChange={v => setForm({ ...form, ping: v })} placeholder="28" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="設計師" value={form.designer} onChange={v => setForm({ ...form, designer: v })} placeholder="陳設計師" />
            <Input label="預算" value={form.budget} onChange={v => setForm({ ...form, budget: v })} placeholder="180萬" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="開工日期" type="date" value={form.start_date} onChange={v => setForm({ ...form, start_date: v })} />
            <Input label="完工日期" type="date" value={form.end_date} onChange={v => setForm({ ...form, end_date: v })} />
          </div>
          <div>
            <div style={labelStyle}>初始狀態</div>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 14 }}>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div style={{ fontSize: 12, color: '#888', background: '#F5F8F5', padding: '8px 12px', borderRadius: 6 }}>
            建立後會自動產生 14 個施工節點：工程保護 → 拆除 → 水電 → 泥作 → 冷氣拉管 → 木作 → 油漆 → 系統櫃下單 → 系統櫃安裝 → 燈具安裝 → 冷氣安裝 → 屋主驗收 → 保護拆除 → 清潔
          </div>
          <button type="submit" style={{
            padding: '10px', background: '#0F8E4E', color: '#fff', border: 'none',
            borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer'
          }}>建立案件</button>
        </form>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '8px 10px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
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

const th = { padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#666', fontWeight: 600, borderBottom: '1px solid #E5E5E5', whiteSpace: 'nowrap' }
const td = { padding: '10px 12px', color: '#04342C' }
const loadingTd = { ...td, textAlign: 'center', color: '#888', padding: 30 }
const badge = { padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }
const viewBtn = { background: '#E8F5EE', color: '#0F8E4E', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }
const labelStyle = { fontSize: 11, color: '#888', marginBottom: 4 }
const modalBg = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', overflow: 'auto' }
const modalCard = { background: '#fff', borderRadius: 12, padding: 24, maxWidth: 560, width: '100%', maxHeight: '85vh', overflow: 'auto' }
const filterBtn = (active) => ({
  padding: '6px 14px', borderRadius: 20,
  border: '1px solid ' + (active ? '#0F8E4E' : '#E5E5E5'),
  background: active ? '#E8F5EE' : '#fff',
  color: active ? '#0A6B3A' : '#666', fontSize: 13, cursor: 'pointer'
})
