import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const greetings = [
  '嗨！想知道裝修要花多少錢嗎？',
  '需要設計師嗎？我可以帶你認識我們的服務！',
  '想看裝修案例嗎？點「我喜歡的家」就對了！',
  '有任何裝修問題都可以問我喔！',
  '本月優惠大驚喜往下捲就看得到！'
]

// 表情系統：5 種情緒狀態
const EMOTIONS = {
  happy:        { label: '開心',   eyes: 'happy',     mouth: 'smile',      blush: true  },
  thinking:     { label: '思考',   eyes: 'thinking',  mouth: 'small',      blush: false },
  surprised:    { label: '驚訝',   eyes: 'wide',      mouth: 'open',       blush: true  },
  confused:     { label: '疑惑',   eyes: 'confused',  mouth: 'wavy',       blush: false },
  enthusiastic: { label: '熱情',   eyes: 'sparkle',   mouth: 'bigSmile',   blush: true  }
}

// 依回覆內容決定情緒
function getEmotion(text) {
  if (/多少錢|費用|預算|估價|報價/.test(text)) return 'surprised'
  if (/案例|看|風格|喜歡|裝修案例/.test(text)) return 'enthusiastic'
  if (/綠建材|綠建築|環保|地球/.test(text)) return 'happy'
  if (/優惠|折扣|驚喜|促銷|活動/.test(text)) return 'enthusiastic'
  if (/設計|我家|裝修|服務/.test(text)) return 'happy'
  if (/工班|施工|配合|簽約|企業|合作/.test(text)) return 'thinking'
  if (/好問題|選擇|或者|可以問/.test(text)) return 'confused'
  return 'happy'
}

export default function Mascot() {
  const [bubble, setBubble] = useState(greetings[0])
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: '嗨！我是綠寶，裝修幫手的專屬精靈。有什麼裝修問題都可以問我！' }
  ])
  const [showQuick, setShowQuick] = useState(true)
  const [emotion, setEmotion] = useState('happy')
  const [pos, setPos] = useState({ x: typeof window !== 'undefined' ? Math.max(8, (window.innerWidth - 36) / 2) : 190, y: 12 })
  const [showBubble, setShowBubble] = useState(true)
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [botTyping, setBotTyping] = useState(false)
  const [showCompanyInfo, setShowCompanyInfo] = useState(false)
  const msgIndexRef = useRef(0)
  const recognitionRef = useRef(null)
  const chatBodyRef = useRef(null)
  const handleAskRef = useRef(null)  // 用 ref 保存最新的 handleAsk
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const timer = setInterval(() => {
      msgIndexRef.current = (msgIndexRef.current + 1) % greetings.length
      if (!chatOpen) {
        setBubble(greetings[msgIndexRef.current])
        setEmotion('happy')
      }
    }, 5000)
    return () => clearInterval(timer)
  }, [chatOpen])

  // 自動捲動到最新訊息
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [messages, botTyping])

  // ===== 語音辨識初始化 =====
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SR) {
      const recog = new SR()
      recog.lang = 'zh-TW'
      recog.continuous = false
      recog.interimResults = true
      recog.maxAlternatives = 1
      recog.onresult = (e) => {
        let transcript = ''
        let isFinal = false
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript
          if (e.results[i].isFinal) isFinal = true
        }
        setInputText(transcript)
        if (isFinal) {
          setIsListening(false)
          const text = transcript.trim()
          if (text) {
            // 用 setTimeout 確保在当前 render cycle 之後執行
            setTimeout(() => {
              if (handleAskRef.current) {
                handleAskRef.current(text)
              }
              setInputText('')
            }, 0)
          }
        }
      }
      recog.onerror = (e) => {
        console.warn('語音辨識錯誤:', e.error)
        setIsListening(false)
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          alert('麥克風權限被拒絕，請到瀏覽器設定允許麥克風存取。')
        }
      }
      recog.onend = () => {
        setIsListening(false)
        // 如果還在聆聽狀態但 recog 結束了，檢查是否有文字沒送出
        const currentText = document.querySelector('input[placeholder="輸入裝修問題…"]')
        if (currentText && currentText.value.trim()) {
          // 有未送出的文字，自動送出
          const text = currentText.value.trim()
          setTimeout(() => {
            if (handleAskRef.current) {
              handleAskRef.current(text)
              setInputText('')
            }
          }, 0)
        }
      }
      recognitionRef.current = recog
    }
    return () => {
      try { recognitionRef.current?.stop() } catch(_) {}
    }
  }, [])

  function toggleVoice() {
    if (!recognitionRef.current) {
      alert('你的瀏覽器不支援語音輸入，建議使用 Chrome 或 Safari。')
      return
    }
    if (isListening) {
      try { recognitionRef.current.stop() } catch(_) {}
      setIsListening(false)
    } else {
      setInputText('')
      // 先 stop 再 start，避免「already started」錯誤
      try { recognitionRef.current.stop() } catch(_) {}
      setTimeout(() => {
        try {
          recognitionRef.current.start()
          setIsListening(true)
        } catch(err) {
          console.warn('語音啟動失敗:', err)
          setIsListening(false)
          // 可能是權限被拒或重複啟動，再試一次
          setTimeout(() => {
            try {
              recognitionRef.current.start()
              setIsListening(true)
            } catch(_) {
              alert('無法啟動語音辨識，請確認瀏覽器已允許麥克風權限。')
            }
          }, 200)
        }
      }, 100)
    }
  }

  // ===== 拖動邏輯 =====
  const dragRef = useRef(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const onPointerDown = useCallback((e) => {
    if (e.target.closest('[data-bubble]')) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    }
    setIsDragging(true)
    setShowBubble(false)
    e.target.setPointerCapture?.(e.pointerId)
  }, [pos])

  const onPointerMove = useCallback((e) => {
    if (!isDragging) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    let newX = e.clientX - dragOffset.current.x
    let newY = e.clientY - dragOffset.current.y
    newX = Math.max(4, Math.min(newX, vw - 40))
    newY = Math.max(4, Math.min(newY, vh - 40))
    setPos({ x: newX, y: newY })
  }, [isDragging])

  const onPointerUp = useCallback((e) => {
    if (!isDragging) return
    setIsDragging(false)
    e.target.releasePointerCapture?.(e.pointerId)
    setTimeout(() => setShowBubble(true), 300)
  }, [isDragging])

  function handleSpriteClick() {
    if (isDragging) return
    setChatOpen(prev => !prev)
    setShowBubble(false)
    if (!chatOpen) setEmotion('happy')
  }

  function handleAsk(question) {
    setMessages(prev => [...prev, { role: 'user', text: question }])
    setShowQuick(false)
    setEmotion('thinking')
    setBotTyping(true)
    setTimeout(() => {
      const reply = getReply(question)
      const newEmotion = getEmotion(reply === 'COMPANY_INFO' ? '公司介紹' : reply)
      setEmotion(newEmotion)
      if (reply === 'COMPANY_INFO') {
        setMessages(prev => [...prev, { role: 'bot', text: '以下是孟瀧室內裝修設計有限公司的公司簡介，點擊查看完整資訊 👇' }])
        setShowCompanyInfo(true)
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: reply }])
      }
      setShowQuick(true)
      setBotTyping(false)
    }, 900)
  }
  // 讓語音辨識的 callback 能呼叫到最新的 handleAsk
  handleAskRef.current = handleAsk

  function handleSendText() {
    const text = inputText.trim()
    if (!text) return
    handleAsk(text)
    setInputText('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  function getReply(q) {
    if (/估價|多少錢|費用|預算|多少|花費|成本/.test(q))
      return '你可以先試試我們的「免費線上估價工具」，輸入坪數和屋齡就能立即算出裝修費用！ 點這裡前往'
    if (/設計|我家|裝修|翻新|老屋|舊屋|新成屋/.test(q))
      return '我們公司提供一條龍服務！填寫「設計我家」需求表單，設計師會在 24 小時內聯繫你。 點這裡前往'
    if (/案例|看|風格|喜歡|照片|作品|參考/.test(q))
      return '歡迎到「我喜歡的家」瀏覽各種風格裝修案例，看到喜歡的還可以直接預約！ 點這裡前往'
    if (/工班|施工|師傅|泥作|水電|木工|油漆/.test(q))
      return '如果你是設計師，可以到「設計師專區」，填寫工班需求，我們會為你媒合有經驗的施工團隊。 點這裡前往'
    if (/合作|簽約|企業|加盟|聯絡|電話|聯繫/.test(q))
      return '我們提供商務合作方案：1. 長期工班配合 2. 簽約合作 3. 企業方案。 點這裡了解更多'
    if (/綠建材|綠建築|環保|甲醛|無毒|健康/.test(q))
      return '我們重視綠建材和綠建築理念！在裝修過程中優先使用低甲醛、可回收的環保建材，為你和地球把關。'
    if (/優惠|折扣|驚喜|促銷|活動|方案|贈品/.test(q))
      return '本月優惠大驚喜！首頁往下滑就有專屬方案，錯過要等下個月喔！'
    if (/坪數|坪|幾坪|大小|面積/.test(q))
      return '坪數會直接影響裝修費用！你可以先量好室內坪數，再到「免費線上估價工具」輸入，馬上就有預估價格。 點這裡前往'
    if (/時間|多久|工期|幾天|幾週|完工/.test(q))
      return '一般裝修工期依坪數和工程範圍而定：小坪數約 2-4 週，全室翻新約 6-12 週。填寫「設計我家」後設計師會給你更精確的工期估算。 點這裡前往'
    if (/保固|保固期|售後|維修|保養/.test(q))
      return '我們提供裝修保固服務！一般工程保固 1 年，水電工程保固 2 年。如有保固期內的問題，我們會免費到府處理。'
    if (/付款|分期|頭款|尾款|收費/.test(q))
      return '付款方式彈性：簽約時付 30% 頭款，工程進行中依進度付款，完工驗收後付尾款。也提供分期方案，歡迎洽詢。'
    if (/風格|北歐|無印|現代|工業|日式|簡約|奢華/.test(q))
      return '我們擅長各種風格：北歐風、無印風、現代簡約、工業風、日式禪風等。到「我喜歡的家」可以瀏覽不同風格的完工案例！ 點這裡前往'
    if (/你好|嗨|hi|哈嘍|hello|嗨嗨/.test(q))
      return '嗨！我是綠寶，裝修幫手的專屬精靈。你可以問我估價、設計、案例、工班配合等任何問題！'
    if (/謝謝|感謝|thanks|感恩/.test(q))
      return '不客氣！有任何裝修問題隨時找我，我很樂意幫忙！'
    if (/你是誰|綠寶|名字|什麼精靈/.test(q))
      return '我是綠寶，裝修幫手的專屬精靈！我代表綠建材和環保裝修理念，有任何裝修問題都可以問我喔！'
    if (/公司簡介|公司|孟瀧|統編|統一編號|立案|廠商|介紹/.test(q))
      return 'COMPANY_INFO'
    return '這是個好問題！你可以選擇下方按鈕快速找到你要的服務，或者直接點選首頁的卡片進入。有任何問題都可以再問我喔！'
  }

  function handleLink(path) {
    setChatOpen(false)
    navigate(path)
  }

  function renderReplyText(text) {
    const parts = text.split(/(點這裡)/)
    let linkPath = null
    if (text.includes('估價')) linkPath = '/owner/estimate'
    else if (text.includes('設計我家')) linkPath = '/owner/design'
    else if (text.includes('我喜歡的家')) linkPath = '/gallery'
    else if (text.includes('設計師專區')) linkPath = '/designer'
    else if (text.includes('了解更多')) linkPath = '/designer/cooperation'

    return parts.map((part, i) =>
      part === '點這裡' && linkPath ? (
        <span key={i} className="text-brand-500 font-semibold cursor-pointer underline" onClick={() => handleLink(linkPath)}>點這裡</span>
      ) : (
        <span key={i}>{part}</span>
      )
    )
  }

  const quickQuestions = [
    '公司簡介',
    '裝修要多少錢？',
    '我想看裝修案例',
    '我要設計我家',
    '我是設計師，需要工班',
    '什麼是綠建材？',
    '本月有什麼優惠？'
  ]

  const isEntry = location.pathname === '/'
  const chatOnLeft = pos.x > (typeof window !== 'undefined' ? window.innerWidth / 2 : 200)
  const emo = EMOTIONS[emotion] || EMOTIONS.happy

  // ===== 表情渲染（座標已調整為水滴形臉部位置） =====
  // 水滴身體：頂端尖(50,40) → 底部圓(50,98)，臉部區域約 y=55~80
  function renderEyes(type) {
    switch (type) {
      case 'happy':
        return (
          <>
            <path d="M38 60 Q42 57 46 60" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M54 60 Q58 57 62 60" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )
      case 'thinking':
        return (
          <>
            <line x1="38" y1="60" x2="46" y2="60" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="54" y1="60" x2="62" y2="60" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )
      case 'wide':
        return (
          <>
            <circle cx="42" cy="60" r="4" fill="#fff" stroke="#1a1a2e" strokeWidth="1.5" />
            <circle cx="42" cy="60" r="2.5" fill="#1a1a2e" />
            <circle cx="43" cy="59" r="1" fill="#fff" />
            <circle cx="58" cy="60" r="4" fill="#fff" stroke="#1a1a2e" strokeWidth="1.5" />
            <circle cx="58" cy="60" r="2.5" fill="#1a1a2e" />
            <circle cx="59" cy="59" r="1" fill="#fff" />
          </>
        )
      case 'confused':
        return (
          <>
            <ellipse cx="42" cy="59" rx="3" ry="2" fill="#1a1a2e" transform="rotate(-10 42 59)" />
            <ellipse cx="58" cy="61" rx="3" ry="2" fill="#1a1a2e" transform="rotate(10 58 61)" />
            <line x1="36" y1="53" x2="44" y2="55" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="56" y1="55" x2="64" y2="53" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )
      case 'sparkle':
        return (
          <>
            <g transform="translate(42 60)">
              <path d="M0,-4 L1,-1 L4,0 L1,1 L0,4 L-1,1 L-4,0 L-1,-1 Z" fill="#F39C12" stroke="#E67E22" strokeWidth="0.5" />
            </g>
            <g transform="translate(58 60)">
              <path d="M0,-4 L1,-1 L4,0 L1,1 L0,4 L-1,1 L-4,0 L-1,-1 Z" fill="#F39C12" stroke="#E67E22" strokeWidth="0.5" />
            </g>
          </>
        )
      default:
        return null
    }
  }

  function renderMouth(type) {
    switch (type) {
      case 'smile':
        return <path d="M43 74 Q50 80 57 74" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
      case 'bigSmile':
        return (
          <>
            <path d="M40 73 Q50 83 60 73" fill="#E74C3C" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
            <path d="M46 74 Q50 78 54 74" fill="#fff" stroke="#1a1a2e" strokeWidth="0.5" />
          </>
        )
      case 'small':
        return <ellipse cx="50" cy="76" rx="3" ry="1.5" fill="#1a1a2e" />
      case 'open':
        return <ellipse cx="50" cy="77" rx="3.5" ry="4.5" fill="#E74C3C" stroke="#1a1a2e" strokeWidth="1.5" />
      case 'wavy':
        return <path d="M43 76 Q46 73 49 76 Q52 79 55 76 Q58 73 57 76" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
      default:
        return null
    }
  }

  // ===== 綠寶 5.1 SVG（水滴形 × 蝴蝶結葉 × 無帽 × 無腰帶） =====
  function renderMascotSVG(size = 28) {
    const showBlush = emo.blush
    return (
      <svg className={`w-[${size}px] h-[${size}px] ${isEntry ? 'animate-[mascotFloat_3s_ease-in-out_infinite]' : ''}`} viewBox="0 0 100 100" fill="none">
        {/* 影子 */}
        <ellipse cx="50" cy="96" rx="22" ry="3" fill="#000" opacity="0.08" />

        {/* === 蝴蝶結葉子（在水滴頂端細長處） === */}
        <path className="leaf" style={{ transformOrigin: '50px 43px', animation: 'leafSway 2.5s ease-in-out infinite' }}
          d="M50 42 Q38 38 34 44 Q38 48 50 44" fill="#4CAF50" stroke="#388E3C" strokeWidth="1" />
        <path className="leaf" style={{ transformOrigin: '50px 43px', animation: 'leafSway 2.5s ease-in-out infinite reverse' }}
          d="M50 42 Q62 38 66 44 Q62 48 50 44" fill="#66BB6A" stroke="#388E3C" strokeWidth="1" />
        {/* 蝴蝶結中心結 */}
        <circle cx="50" cy="43" r="2" fill="#388E3C" />

        {/* === 水滴形身體（上窄下寬） === */}
        <path d="M50 40 Q28 50 26 72 Q26 96 50 100 Q74 96 74 72 Q72 50 50 40 Z"
          fill="#2BB673" stroke="#0A6B3A" strokeWidth="2.5" />

        {/* 腹部淺色區域 */}
        <path d="M50 52 Q36 60 36 76 Q36 92 50 94 Q64 92 64 76 Q64 60 50 52 Z"
          fill="#A5D6A7" opacity="0.55" />

        {/* === 紅暈 === */}
        {showBlush && (
          <>
            <ellipse cx="36" cy="68" rx="5" ry="3.5" fill="#E74C3C" opacity="0.3" />
            <ellipse cx="64" cy="68" rx="5" ry="3.5" fill="#E74C3C" opacity="0.3" />
          </>
        )}

        {/* === 眼睛 === */}
        {renderEyes(emo.eyes)}

        {/* === 嘴巴 === */}
        {renderMouth(emo.mouth)}

        {/* === 手臂（無腰帶，直接在身體兩側） === */}
        <ellipse
          className="arm-left"
          style={{ transformOrigin: '28px 64px', animation: 'armWave 2s ease-in-out infinite' }}
          cx="24" cy="70" rx="6" ry="9" fill="#2BB673" stroke="#0A6B3A" strokeWidth="1.5"
        />
        <ellipse cx="76" cy="70" rx="6" ry="9" fill="#2BB673" stroke="#0A6B3A" strokeWidth="1.5" />
      </svg>
    )
  }

  // 對話框 header 中的小精靈
  function renderMiniSVG() {
    return (
      <svg width="24" height="24" viewBox="0 0 100 100" className="flex-shrink-0">
        {/* 蝴蝶結葉 */}
        <path d="M50 42 Q38 38 34 44 Q38 48 50 44" fill="#4CAF50" stroke="#388E3C" strokeWidth="0.8" />
        <path d="M50 42 Q62 38 66 44 Q62 48 50 44" fill="#66BB6A" stroke="#388E3C" strokeWidth="0.8" />
        <circle cx="50" cy="43" r="2" fill="#388E3C" />
        {/* 水滴身體 */}
        <path d="M50 40 Q28 50 26 72 Q26 96 50 100 Q74 96 74 72 Q72 50 50 40 Z"
          fill="#2BB673" stroke="#0A6B3A" strokeWidth="2" />
        {/* 紅暈 */}
        <ellipse cx="36" cy="68" rx="5" ry="3.5" fill="#E74C3C" opacity="0.3" />
        <ellipse cx="64" cy="68" rx="5" ry="3.5" fill="#E74C3C" opacity="0.3" />
        {/* 眼睛 */}
        <path d="M38 60 Q42 57 46 60" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M54 60 Q58 57 62 60" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
        {/* 嘴 */}
        <path d="M43 74 Q50 80 57 74" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <>
      {/* 精靈本體 */}
      <div
        ref={dragRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={handleSpriteClick}
        className={`fixed z-50 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transition: isDragging ? 'none' : 'left 0.1s ease, top 0.1s ease',
          touchAction: 'none'
        }}
      >
        <div className="relative flex flex-col items-center">
          {/* 氣泡 */}
          {showBubble && !chatOpen && isEntry && (
            <div data-bubble className="bg-white/95 text-brand-800 text-xs px-3.5 py-2 rounded-xl max-w-[200px] text-center leading-relaxed mb-1.5 relative animate-[bubblePulse_3s_ease-in-out_infinite] shadow-md whitespace-normal">
              {bubble}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white/95 border-b-0" />
            </div>
          )}

          {/* 綠寶 5.0 SVG */}
          {renderMascotSVG(28)}

          {/* 情緒標籤 */}
          {chatOpen && (
            <div className="absolute -top-1 -right-1 bg-brand-500 text-white text-[8px] px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
              {emo.label}
            </div>
          )}

          {/* 拖動提示 */}
          {isEntry && !isDragging && !chatOpen && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-white/50 whitespace-nowrap pointer-events-none">⠿ 拖動我</div>
          )}
        </div>
      </div>

      {/* 智能客服對話框 */}
      {chatOpen && (
        <div
          className="fixed z-50 w-[300px] max-w-[calc(100%-24px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-[chatSlideUp_0.25s_ease]"
          style={{
            left: chatOnLeft ? `${Math.max(12, pos.x - 300 - 12)}px` : `${Math.max(12, Math.min(pos.x + 36, 440 - 312))}px`,
            top: `${Math.min(pos.y + 10, 400)}px`
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-brand-500 to-brand-400 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {renderMiniSVG()}
              <div>
                <div className="text-[15px] font-bold">綠寶 · 智能客服</div>
                <div className="text-[10px] opacity-80">線上 · {emo.label}中</div>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-base cursor-pointer hover:bg-white/30 transition-colors">✕</button>
          </div>

          {/* Messages */}
          <div ref={chatBodyRef} className="p-4 max-h-[280px] overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed mb-2.5 ${
                msg.role === 'bot' ? 'bg-brand-50 text-gray-800 rounded-bl-md' : 'bg-brand-500 text-white rounded-br-md ml-auto'
              }`}>
                {msg.role === 'bot' ? renderReplyText(msg.text) : msg.text}
              </div>
            ))}
            {/* 綠寶打字中提示 */}
            {botTyping && (
              <div className="max-w-[80%] px-3.5 py-3 rounded-2xl bg-brand-50 rounded-bl-md mb-2.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>

          {/* Quick replies */}
          {showQuick && !botTyping && (
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              {quickQuestions.map(q => (
                <button key={q} onClick={() => handleAsk(q)}
                  className="px-3 py-1.5 border border-brand-500 text-brand-500 rounded-full text-[11px] font-medium cursor-pointer bg-white hover:bg-brand-500 hover:text-white transition-all">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* 語音聆聽中提示 */}
          {isListening && (
            <div className="px-4 py-2 bg-red-50 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[12px] text-red-600 font-medium">聆聽中…請說出你的問題</span>
            </div>
          )}

          {/* 文字輸入 + 語音按鈕 */}
          <div className="flex items-center gap-1.5 px-2.5 py-2.5 border-t border-gray-100 bg-white">
            {/* 語音麥克風 */}
            <button
              onClick={toggleVoice}
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${
                isListening ? 'bg-red-500 animate-pulse' : 'bg-brand-100 hover:bg-brand-200'
              }`}
              title={isListening ? '停止聆聽' : '語音輸入'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isListening ? '#fff' : '#2BB673'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
            {/* 文字輸入框 */}
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="輸入裝修問題…"
              className="flex-1 min-w-0 px-2.5 py-2 text-[12px] rounded-full bg-gray-50 border border-gray-200 outline-none focus:border-brand-400 focus:bg-white transition-colors"
            />
            {/* 發送按鈕 */}
            <button
              onClick={handleSendText}
              disabled={!inputText.trim()}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              title="發送"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 公司簡介 Modal */}
      {showCompanyInfo && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center" onClick={() => setShowCompanyInfo(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div onClick={e => e.stopPropagation()}
            className="relative bg-white rounded-t-3xl w-full max-w-[440px] max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-br from-brand-500 to-brand-600 text-white px-5 pt-5 pb-5 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold">孟瀧室內裝修設計有限公司</div>
                    <div className="text-[10px] opacity-80">統一編號 24838387</div>
                  </div>
                </div>
                <button onClick={() => setShowCompanyInfo(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-lg cursor-pointer">✕</button>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-5">
              {/* 認證徽章 */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-50 border border-green-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F8E4E" strokeWidth="2.5"><path d="M9 12l2 2 4-4M21 12c0 5-3.5 7.5-9 9-5.5-1.5-9-4-9-9V5l9-3 9 3v7z" /></svg>
                  <span className="text-[11px] font-medium text-green-700">政府立案</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2.5"><path d="M9 12l2 2 4-4M21 12c0 5-3.5 7.5-9 9-5.5-1.5-9-4-9-9V5l9-3 9 3v7z" /></svg>
                  <span className="text-[11px] font-medium text-blue-700">合格施工廠商</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8A700" strokeWidth="2.5"><path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26z" /></svg>
                  <span className="text-[11px] font-medium text-amber-700">10+年經驗</span>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                孟瀧室內裝修設計有限公司致力於為每一位屋主打造理想的居住空間。我們提供從設計規劃、工程施工到完工驗收的一條龍服務，擁有經驗豐富的設計團隊與專業施工工班，嚴格把控工程品質與進度。
              </p>

              {/* 公司資訊 */}
              <div className="space-y-0 mb-4">
                <div className="flex items-start gap-2.5 py-2.5 border-b border-gray-100">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F8E4E" strokeWidth="2" className="mt-0.5 flex-shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  <div className="flex-1">
                    <div className="text-[11px] text-gray-400">公司地址</div>
                    <div className="text-xs font-medium text-gray-700">台中市北屯區軍榮五街227巷2弄9號</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 py-2.5 border-b border-gray-100">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F8E4E" strokeWidth="2" className="mt-0.5 flex-shrink-0"><path d="M9 12l2 2 4-4M21 12c0 5-3.5 7.5-9 9-5.5-1.5-9-4-9-9V5l9-3 9 3v7z" /></svg>
                  <div className="flex-1">
                    <div className="text-[11px] text-gray-400">統一編號</div>
                    <div className="text-xs font-medium text-gray-700">24838387</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 py-2.5 border-b border-gray-100">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F8E4E" strokeWidth="2" className="mt-0.5 flex-shrink-0"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                  <div className="flex-1">
                    <div className="text-[11px] text-gray-400">登記狀態</div>
                    <div className="text-xs font-medium text-gray-700">政府立案合格施工廠商</div>
                  </div>
                </div>
              </div>

              {/* 統計 */}
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="bg-brand-50 rounded-lg py-2.5 px-1">
                  <div className="text-lg font-bold text-brand-600">10+</div>
                  <div className="text-[10px] text-gray-500">年經驗</div>
                </div>
                <div className="bg-brand-50 rounded-lg py-2.5 px-1">
                  <div className="text-lg font-bold text-brand-600">200+</div>
                  <div className="text-[10px] text-gray-500">完工案例</div>
                </div>
                <div className="bg-brand-50 rounded-lg py-2.5 px-1">
                  <div className="text-lg font-bold text-brand-600">1年</div>
                  <div className="text-[10px] text-gray-500">工程保固</div>
                </div>
              </div>

              {/* 服務項目 */}
              <div className="mb-4">
                <div className="text-[11px] font-medium text-gray-500 mb-2">服務項目</div>
                <div className="flex flex-wrap gap-1.5">
                  {['室內設計', '舊屋翻新', '全屋定制', '水電工程', '泥作工程', '木作工程', '油漆工程', '系統櫃', '燈具安裝', '清潔服務'].map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-1 rounded-md bg-gray-100 text-gray-600">{tag}</span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button onClick={() => { setShowCompanyInfo(false); setChatOpen(false); navigate('/owner/design') }}
                className="w-full py-3 rounded-xl bg-brand-500 text-white text-sm font-medium cursor-pointer hover:bg-brand-600 transition-colors">
                立即諮詢 · 預約設計
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatSlideUp { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        @keyframes bubblePulse { 0%,100% { transform: translateY(0); opacity: 0.95; } 50% { transform: translateY(-3px); opacity: 1; } }
        @keyframes mascotFloat { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-8px) rotate(2deg); } }
        @keyframes blink { 0%,42%,48%,100% { transform: scaleY(1); } 45% { transform: scaleY(0.1); } }
        @keyframes leafSway { 0%,100% { transform: rotate(-5deg); } 50% { transform: rotate(8deg); } }
        @keyframes armWave { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-15deg); } }
      `}</style>
    </>
  )
}
