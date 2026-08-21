import { supabase, isSupabaseReady } from './supabase'

// ===== Auth（admin 用）=====
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getAdminProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // admin email 白名單
  const adminEmails = ['admin2@renovation-helper.com', 'admin@renovation-helper.com', 'spaceuphelper@gmail.com']
  const isAdminEmail = adminEmails.includes(user.email?.toLowerCase())

  // 查 profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // profile 存在且 role 正確
  if (profile && profile.role === 'admin') {
    return { ...user, ...profile }
  }

  // profile 存在但 role 不是 admin → 如果是 admin email，強制放行
  if (profile && isAdminEmail) {
    return { ...user, ...profile, role: 'admin' }
  }

  // profile 不存在 → 嘗試自動建一條
  if (!profile) {
    const role = isAdminEmail ? 'admin' : 'owner'
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({ id: user.id, name: isAdminEmail ? 'Admin' : (user.user_metadata?.name || 'User'), role })
      .select('*')
      .maybeSingle()

    if (newProfile) {
      return { ...user, ...newProfile }
    }
  }

  // 最終 fallback：admin email 直接回傳臨時 profile
  if (isAdminEmail) {
    return { ...user, id: user.id, name: 'Admin', role: 'admin' }
  }

  return null
}

// ===== 列表查询（admin 看所有，RLS 已 bypass）=====
const orderByCreatedDesc = (q) => q.order('created_at', { ascending: false })

export async function listDesignRequests() {
  if (!isSupabaseReady) return []
  const { data, error } = await orderByCreatedDesc(supabase.from('design_requests').select('*'))
  if (error) throw error
  return data || []
}

export async function listEstimateRecords() {
  if (!isSupabaseReady) return []
  const { data, error } = await orderByCreatedDesc(supabase.from('estimate_records').select('*'))
  if (error) throw error
  return data || []
}

export async function listProjects() {
  if (!isSupabaseReady) return []
  const { data, error } = await orderByCreatedDesc(supabase.from('projects').select('*'))
  if (error) throw error
  return data || []
}

export async function listProjectStages(projectId) {
  if (!isSupabaseReady) return []
  const { data, error } = await supabase
    .from('project_stages')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data || []
}

export async function listCases() {
  if (!isSupabaseReady) return []
  const { data, error } = await orderByCreatedDesc(supabase.from('cases').select('*'))
  if (error) throw error
  return data || []
}

export async function listCrewRequests() {
  if (!isSupabaseReady) return []
  const { data, error } = await orderByCreatedDesc(supabase.from('crew_requests').select('*'))
  if (error) throw error
  return data || []
}

export async function listCoopApplications() {
  if (!isSupabaseReady) return []
  const { data, error } = await orderByCreatedDesc(supabase.from('coop_applications').select('*'))
  if (error) throw error
  return data || []
}

export async function listPromoCodes() {
  if (!isSupabaseReady) return []
  const { data, error } = await supabase.from('promo_codes').select('*').order('code', { ascending: true })
  if (error) throw error
  return data || []
}

// ===== 更新（admin 改状态）=====
export async function updateDesignRequestStatus(id, status) {
  const { data, error } = await supabase.from('design_requests').update({ status }).eq('id', id)
  if (error) throw error
  return data
}

export async function updateProjectStatus(id, { status, progress }) {
  const payload = {}
  if (status !== undefined) payload.status = status
  if (progress !== undefined) payload.progress = progress
  const { data, error } = await supabase.from('projects').update(payload).eq('id', id)
  if (error) throw error
  return data
}

export async function updateCoopStatus(id, status) {
  const { data, error } = await supabase.from('coop_applications').update({ status }).eq('id', id)
  if (error) throw error
  return data
}

export async function updateCrewStatus(id, status) {
  const { data, error } = await supabase.from('crew_requests').update({ status }).eq('id', id)
  if (error) throw error
  return data
}

export async function updateCaseStatus(id, status) {
  const { data, error } = await supabase.from('cases').update({ status }).eq('id', id)
  if (error) throw error
  return data
}

export async function togglePromoActive(code, active) {
  const { data, error } = await supabase.from('promo_codes').update({ active }).eq('code', code)
  if (error) throw error
  return data
}

// ===== 刪除 =====
export async function deleteRow(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

// ===== KPI 統計 =====
export async function getKpis() {
  if (!isSupabaseReady) return { design: 0, estimate: 0, projects: 0, coop: 0, today: 0 }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()
  const [{ count: design }, { count: estimate }, { count: projects }, { count: coop }] = await Promise.all([
    supabase.from('design_requests').select('*', { count: 'exact', head: true }),
    supabase.from('estimate_records').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('coop_applications').select('*', { count: 'exact', head: true })
  ])
  const { count: todayCount } = await supabase
    .from('design_requests')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayISO)
  return { design, estimate, projects, coop, today: todayCount }
}
