import { supabase, isSupabaseReady } from './supabase'

// ===== 認證 =====
export async function signUp({ email, password, name, role }) {
  if (!isSupabaseReady) return mockResponse({ id: 'mock-user' })
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name, role } }
  })
  if (error) throw error
  return data
}

export async function signIn({ email, password }) {
  if (!isSupabaseReady) return mockResponse({ user: { id: 'mock-user' } })
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  if (!isSupabaseReady) return
  await supabase.auth.signOut()
}

export async function getCurrentUser() {
  if (!isSupabaseReady) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return { ...user, ...profile }
}

// ===== 設計我家需求單 =====
export async function submitDesignRequest(form) {
  if (!isSupabaseReady) return mockResponse({ id: 'mock-001', ...form })
  
  const userId = (await supabase.auth.getUser()).data.user?.id || null
  
  const { data, error } = await supabase
    .from('design_requests')
    .insert({
      user_id: userId,
      name: form.name,
      phone: form.phone,
      area: form.area,
      ping: form.ping ? Number(form.ping) : null,
      style: form.style,
      budget: form.budget,
      timeline: form.timeline,
      rooms: form.rooms,
      needs: form.needs,
      promo_code: form.promoCode || null,
      promo_verified: form.promoVerified || false
    })
    .select()
    .single()

  if (error) {
    console.warn('[submitDesignRequest] Supabase insert failed, saving to localStorage:', error.message)
    // fallback: 存到 localStorage
    const localId = 'local-' + Date.now()
    const localData = { id: localId, ...form, created_at: new Date().toISOString(), _local: true }
    const stored = JSON.parse(localStorage.getItem('design_requests') || '[]')
    stored.push(localData)
    localStorage.setItem('design_requests', JSON.stringify(stored))
    return localData
  }
  return data
}

// ===== 估價記錄 =====
export async function saveEstimate(data) {
  if (!isSupabaseReady) return mockResponse({ id: 'mock-est' })
  
  const userId = (await supabase.auth.getUser()).data.user?.id || null
  
  const { data: result, error } = await supabase
    .from('estimate_records')
    .insert({ user_id: userId, ...data })
    .select()
    .single()

  if (error) {
    console.warn('[saveEstimate] Supabase insert failed, saving to localStorage:', error.message)
    const localId = 'local-est-' + Date.now()
    const localData = { id: localId, ...data, created_at: new Date().toISOString(), _local: true }
    const stored = JSON.parse(localStorage.getItem('estimate_records') || '[]')
    stored.push(localData)
    localStorage.setItem('estimate_records', JSON.stringify(stored))
    return localData
  }
  return result
}

// ===== 案件 =====
export async function fetchProjects() {
  if (!isSupabaseReady) return mockProjects
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_stages(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchProjectById(id) {
  if (!isSupabaseReady) return mockProjects[0]
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_stages(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// ===== 案例 =====
export async function fetchCases(styleFilter) {
  if (!isSupabaseReady) return mockCases
  let query = supabase.from('cases').select('*').eq('status', 'published').order('created_at', { ascending: false })
  if (styleFilter && styleFilter !== '全部') {
    query = query.eq('style', styleFilter)
  }
  const { data, error } = await query
  if (error || !data || data.length === 0) {
    // fallback: 讀 localStorage
    const local = JSON.parse(localStorage.getItem('cases') || '[]')
    const filtered = styleFilter && styleFilter !== '全部' ? local.filter(c => c.style === styleFilter) : local
    return filtered.length > 0 ? filtered : mockCases
  }
  return data
}

export async function fetchCaseById(id) {
  if (!isSupabaseReady) return mockCases[0]
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function submitCase(form) {
  if (!isSupabaseReady) return mockResponse({ id: 'mock-case' })
  
  const { data, error } = await supabase
    .from('cases')
    .insert({
      title: form.title,
      style: form.style,
      ping: form.ping ? Number(form.ping) : null,
      house_age: form.age,
      area: form.area,
      layout: form.layout,
      days: form.days ? Number(form.days) : null,
      budget: form.budget,
      concept: form.concept,
      trades: form.trades,
      designer: form.designer,
      main_image: form.mainImage || null,
      before_images: form.beforeImages || [],
      after_images: form.afterImages || [],
      other_images: form.otherImages || [],
      status: 'draft'
    })
    .select()
    .single()

  if (error) {
    console.warn('[submitCase] Supabase insert failed, saving to localStorage:', error.message)
    const localId = 'local-case-' + Date.now()
    const localData = { id: localId, ...form, created_at: new Date().toISOString(), _local: true }
    const stored = JSON.parse(localStorage.getItem('cases') || '[]')
    stored.push(localData)
    localStorage.setItem('cases', JSON.stringify(stored))
    return localData
  }
  return data
}

// ===== 工班需求單 =====
export async function submitCrewRequest(form) {
  if (!isSupabaseReady) return mockResponse({ id: 'mock-crew' })
  const { data, error } = await supabase
    .from('crew_requests')
    .insert({
      user_id: (await supabase.auth.getUser()).data.user?.id || null,
      name: form.name,
      phone: form.phone,
      studio: form.studio,
      type: form.type,
      case_desc: form.caseDesc,
      budget: form.budget,
      timeline: form.timeline,
      needs: form.needs
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// ===== 商務合作申請 =====
export async function submitCoopApplication(form) {
  if (!isSupabaseReady) return mockResponse({ id: 'mock-coop' })
  const { data, error } = await supabase
    .from('coop_applications')
    .insert({
      name: form.name,
      phone: form.phone,
      studio: form.studio,
      type: form.type,
      case_desc: form.caseDesc,
      budget: form.budget,
      timeline: form.timeline,
      needs: form.needs
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// ===== 優惠代碼驗證 =====
export async function verifyPromoCode(code) {
  if (!isSupabaseReady) {
    // mock 驗證
    if (code.toUpperCase() === 'GREEN2026') {
      return { valid: true, description: '設計費 9 折 + 空氣清淨檢測' }
    }
    return { valid: false }
  }
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .single()
  if (error || !data) return { valid: false }
  // 檢查有效期限
  const now = new Date()
  if (data.valid_from && new Date(data.valid_from) > now) return { valid: false, reason: '尚未開始' }
  if (data.valid_until && new Date(data.valid_until) < now) return { valid: false, reason: '已過期' }
  if (data.max_uses && data.used_count >= data.max_uses) return { valid: false, reason: '已額滿' }
  return { valid: true, description: data.description, discount: data.discount }
}

// ===== 圖片上傳到 Storage =====
export async function uploadImage(file, bucket = 'case-images') {
  if (!isSupabaseReady) return `mock://image-${Date.now()}`
  const fileName = `${Date.now()}-${file.name}`
  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file)
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)
  return publicUrl
}

// ===== Mock 輔助 =====
function mockResponse(data) {
  return new Promise(resolve => setTimeout(() => resolve(data), 500))
}

const mockProjects = [
  {
    id: 'P-2026-0312',
    title: '西區張宅 · 現代簡約翻新',
    address: '台中市西區',
    ping: 28,
    status: '施工中',
    progress: 65,
    start_date: '2026/03/01',
    end_date: '2026/05/15',
    budget: '180萬',
    designer: '陳設計師'
  }
]

const mockCases = [
  { id: '1', title: '現代簡約公寓', size: '28坪', area: '台中西區', style: '現代簡約' },
  { id: '2', title: '北歐風親子宅', size: '35坪', area: '台中北區', style: '北歐風' }
]
