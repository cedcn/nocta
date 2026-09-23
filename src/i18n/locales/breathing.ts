import type { Language } from '../languages';

// Copy ported from XMSLEEP res/values*/strings.xml.
export const breathing: Record<Language, Record<string, unknown>> = {
  'zh-CN': {
    title: '呼吸练习',
    meditation: '冥想',
    inhale: '吸气',
    hold: '屏息',
    exhale: '呼气',
    holdAfter: '屏息',
    breathCount: '第 {{n}} 次呼吸',
    rhythm: '呼吸节奏',
    presetDuration: '预设时长',
    customDuration: '自定义时长',
    selectDuration: '选择时长',
    done: '完成',
    gotIt: '我知道了',
    tutorial: '教程',
    steps: '操作步骤',
    primary: '主推',
    start: '播放',
    stop: '停止',
    minutes_other: '{{count}}分钟',
    rhythmInhale_other: '吸气 {{count}} 秒',
    rhythmHold_other: '屏息 {{count}} 秒',
    rhythmExhale_other: '呼气 {{count}} 秒',
    ready: '准备开始',
    finished: '练习完成',
    methods: {
      sleep_478: {
        name: '4–7–8 助眠呼吸法',
        subtitle: '主推・失眠首选',
        desc: '哈佛医学院安德鲁・韦尔博士研发，被称为「天然生理安眠药」。超长呼气强制降低心率、减少大脑皮层活跃度，快速缓解睡前胡思乱想、入睡困难、夜间易醒。坚持2周可大幅缩短入睡时长。',
        steps: [
          '平躺放松，舌尖轻抵上颚，先用嘴巴彻底吐尽空气',
          '闭紧嘴巴，鼻子轻柔吸气4秒，腹部自然鼓起',
          '屏住气息7秒，全身保持松弛不紧绷',
          "嘴唇微张，缓慢呼气8秒，呼气可发出轻柔'嘶'风声",
          '循环4–8轮，思绪飘走只需轻轻拉回呼吸即可',
        ],
        tags: [
          '睡前助眠',
          '深度助眠',
          '深夜放松',
        ]
      },
      box_4444: {
        name: '箱式呼吸',
        subtitle: '方形呼吸・平衡专注',
        desc: '美国海豹突击队抗压训练法，四方均等呼吸节奏，像画正方形得名。平衡交感与副交感神经，缓解心慌、烦躁、职场高压。放松同时不会产生困倦，适合午休、工作间隙、考前平复情绪。',
        steps: [
          '腰背挺直坐好或平躺，全身放松',
          '鼻子匀速吸气4秒，腹部扩张',
          '屏住气息4秒，内心保持平静',
          '鼻子缓慢呼气4秒，排空肺部空气',
          '呼气结束后短暂屏息4秒，完整一轮循环',
        ],
        tags: [
          '日间减压',
          '静心专注',
          '情绪稳定',
        ]
      },
      belly_46: {
        name: '基础腹式呼吸',
        subtitle: '入门通用・新手友好',
        desc: '无固定计时节奏，所有呼吸法的底层基础，零基础零门槛。用横膈膜呼吸，而非胸腔呼吸。改善浅短急促的浅呼吸习惯，缓解长期胸闷、焦虑、疲劳。随时随地可练习，适合呼吸新手、轻度焦虑人群。',
        steps: [
          '一手放在胸口、一手放在腹部',
          '鼻缓慢吸气，只有腹部鼓起，胸口保持不动',
          '嘴匀速呼气，腹部向内收紧下沉',
          '全程缓慢绵长，呼气时长尽量为吸气的1.5–2倍，自由循环',
        ],
        tags: [
          '新手入门',
          '日常舒缓',
          '放松基底',
        ]
      },
      stress_426: {
        name: '4–2–6 快速减压呼吸',
        subtitle: '短时舒缓・紧张时刻',
        desc: '轻量化短节奏，适合突发心慌、情绪崩溃、睡前烦躁，门槛极低。快速下调压力激素皮质醇，1分钟内平复心跳加速、紧张手抖，适合通勤、开会前、情绪失控时快速缓冲。',
        steps: [
          '闭眼放松肩膀，鼻子吸气4秒',
          '短暂屏息2秒，不刻意憋气',
          '拉长呼气至6秒，把烦躁、压力全部呼出',
        ],
        tags: [
          '快速解压',
          '即时舒缓',
          '短时放松',
        ]
      },
    }
  },
  'zh-TW': {
    title: '呼吸練習',
    meditation: '冥想',
    inhale: '吸氣',
    hold: '屏息',
    exhale: '呼氣',
    holdAfter: '屏息',
    breathCount: '第 {{n}} 次呼吸',
    rhythm: '呼吸節奏',
    presetDuration: '預設時長',
    customDuration: '自訂時長',
    selectDuration: '選擇時長',
    done: '完成',
    gotIt: '我明白了',
    tutorial: '教程',
    steps: '操作步驟',
    primary: '主推',
    start: '播放',
    stop: '停止',
    minutes_other: '{{count}}分鐘',
    rhythmInhale_other: '吸氣 {{count}} 秒',
    rhythmHold_other: '屏息 {{count}} 秒',
    rhythmExhale_other: '呼氣 {{count}} 秒',
    ready: '準備開始',
    finished: '練習完成',
    methods: {
      sleep_478: {
        name: '4–7–8 助眠呼吸法',
        subtitle: '主推・失眠首選',
        desc: '哈佛醫學院安德魯・韋爾博士研發，被稱為「天然生理安眠藥」。超長呼氣強制降低心率、減少大腦皮層活躍度，快速緩解睡前胡思亂想、入睡困難、夜間易醒。堅持2週可大幅縮短入睡時長。',
        steps: [
          '平躺放鬆，舌尖輕抵上顎，先用嘴巴徹底吐盡空氣',
          '閉緊嘴巴，鼻子輕柔吸氣4秒，腹部自然鼓起',
          '屏住氣息7秒，全身保持鬆弛不緊繃',
          "嘴脣微張，緩慢呼氣8秒，呼氣可發出輕柔'嘶'風聲",
          '循環4–8輪，思緒飄走只需輕輕拉回呼吸即可',
        ],
        tags: [
          '睡前助眠',
          '深度助眠',
          '深夜放鬆',
        ]
      },
      box_4444: {
        name: '箱式呼吸',
        subtitle: '方形呼吸・平衡專注',
        desc: '美國海豹突擊隊抗壓訓練法，四方均等呼吸節奏，像畫正方形得名。平衡交感與副交感神經，緩解心慌、煩躁、職場高壓。放鬆同時不會產生困倦，適合午休、工作間隙、考前平復情緒。',
        steps: [
          '腰背挺直坐好或平躺，全身放鬆',
          '鼻子勻速吸氣4秒，腹部擴張',
          '屏住氣息4秒，內心保持平靜',
          '鼻子緩慢呼氣4秒，排空肺部空氣',
          '呼氣結束後短暫屏息4秒，完整一輪循環',
        ],
        tags: [
          '日間減壓',
          '靜心專注',
          '情緒穩定',
        ]
      },
      belly_46: {
        name: '基礎腹式呼吸',
        subtitle: '入門通用・新手友好',
        desc: '無固定計時節奏，所有呼吸法的底層基礎，零基礎零門檻。用橫膈膜呼吸，而非胸腔呼吸。改善淺短急促的淺呼吸習慣，緩解長期胸悶、焦慮、疲勞。隨時隨地可練習，適合呼吸新手、輕度焦慮人群。',
        steps: [
          '一手放在胸口、一手放在腹部',
          '鼻緩慢吸氣，只有腹部鼓起，胸口保持不動',
          '嘴勻速呼氣，腹部向內收緊下沉',
          '全程緩慢綿長，呼氣時長盡量為吸氣的1.5–2倍，自由循環',
        ],
        tags: [
          '新手入門',
          '日常舒緩',
          '放鬆基底',
        ]
      },
      stress_426: {
        name: '4–2–6 快速減壓呼吸',
        subtitle: '短時舒緩・緊張時刻',
        desc: '輕量化短節奏，適合突發心慌、情緒崩潰、睡前煩躁，門檻極低。快速下調壓力激素皮質醇，1分鐘內平復心跳加速、緊張手抖，適合通勤、開會前、情緒失控時快速緩衝。',
        steps: [
          '閉眼放鬆肩膀，鼻子吸氣4秒',
          '短暫屏息2秒，不刻意憋氣',
          '拉長呼氣至6秒，把煩躁、壓力全部呼出',
        ],
        tags: [
          '快速解壓',
          '即時舒緩',
          '短時放鬆',
        ]
      },
    }
  },
  en: {
    title: 'Breathing',
    meditation: 'Meditation',
    inhale: 'Inhale',
    hold: 'Hold',
    exhale: 'Exhale',
    holdAfter: 'Hold',
    breathCount: 'Breath {{n}}',
    rhythm: 'Breathing Rhythm',
    presetDuration: 'Preset Duration',
    customDuration: 'Custom Duration',
    selectDuration: 'Select Duration',
    done: 'Done',
    gotIt: 'Got it',
    tutorial: 'Tutorial',
    steps: 'Steps',
    primary: 'Recommended',
    start: 'Play',
    stop: 'Stop',
    minutes_one: '{{count}} minute',
    minutes_other: '{{count}} minutes',
    rhythmInhale_one: 'Inhale {{count}} sec',
    rhythmInhale_other: 'Inhale {{count}} secs',
    rhythmHold_one: 'Hold {{count}} sec',
    rhythmHold_other: 'Hold {{count}} secs',
    rhythmExhale_one: 'Exhale {{count}} sec',
    rhythmExhale_other: 'Exhale {{count}} secs',
    ready: 'Ready',
    finished: 'Session complete',
    methods: {
      sleep_478: {
        name: '4–7–8 Sleep Breathing',
        subtitle: 'Recommended • For Insomnia',
        desc: "Developed by Dr. Andrew Weil at Harvard Medical School, known as \"nature's sleeping pill.\" Extended exhale forcefully lowers heart rate and reduces brain cortex activity, quickly relieving pre-sleep racing thoughts, difficulty falling asleep, and nighttime awakenings. 2 weeks of practice can significantly shorten sleep onset time.",
        steps: [
          'Lie down relaxed, tongue tip lightly touching the roof of your mouth, exhale completely through your mouth',
          'Close mouth, gently inhale through nose for 4 seconds, abdomen naturally expands',
          'Hold breath for 7 seconds, keep body relaxed without tension',
          "Lips slightly open, slowly exhale for 8 seconds, you may make a soft 'shh' sound",
          'Repeat 4–8 cycles, gently bring attention back if mind wanders',
        ],
        tags: [
          'Sleep Aid',
          'Deep Sleep',
          'Night Relax',
        ]
      },
      box_4444: {
        name: 'Box Breathing',
        subtitle: 'Square Breathing • Balance Focus',
        desc: 'US Navy SEAL stress relief training method, named for its square-like equal breathing rhythm. Balances sympathetic and parasympathetic nervous systems, relieves panic, irritability, and workplace stress. Promotes relaxation without drowsiness, ideal for lunch breaks, work intervals, and pre-exam calm.',
        steps: [
          'Sit upright or lie down with straight back, relax entire body',
          'Inhale steadily through nose for 4 seconds, abdomen expands',
          'Hold breath for 4 seconds, maintain inner calm',
          'Exhale slowly through nose for 4 seconds, empty lungs completely',
          'Brief pause after exhale for 4 seconds, complete one full cycle',
        ],
        tags: [
          'Daytime Relief',
          'Focus',
          'Emotion Balance',
        ]
      },
      belly_46: {
        name: 'Basic Belly Breathing',
        subtitle: 'Universal • Beginner Friendly',
        desc: 'No fixed timing rhythm, the foundation of all breathing techniques, zero threshold. Uses diaphragmatic breathing instead of chest breathing. Improves shallow, rapid breathing habits, relieves chronic chest tightness, anxiety, and fatigue. Practice anytime, anywhere - perfect for beginners and those with mild anxiety.',
        steps: [
          'One hand on chest, one hand on abdomen',
          'Inhale slowly through nose, only abdomen rises, chest stays still',
          'Exhale steadily through mouth, abdomen draws inward and downward',
          'Keep slow and smooth throughout, exhale should be 1.5–2x longer than inhale, cycle freely',
        ],
        tags: [
          'Beginner',
          'Daily Calm',
          'Foundation',
        ]
      },
      stress_426: {
        name: '4–2–6 Quick Stress Relief',
        subtitle: 'Quick Calm • Tense Moments',
        desc: 'Lightweight short rhythm, perfect for sudden panic, emotional breakdown, or pre-sleep irritability. Extremely low barrier to entry. Rapidly reduces stress hormone cortisol, calms racing heartbeat and nervous trembling within 1 minute. Ideal for commutes, before meetings, or quick buffer during emotional overload.',
        steps: [
          'Close eyes, relax shoulders, inhale through nose for 4 seconds',
          "Briefly hold for 2 seconds, don't force breath holding",
          'Extend exhale to 6 seconds, breathing out all tension and stress',
        ],
        tags: [
          'Quick Relief',
          'Instant Calm',
          'Short Relax',
        ]
      },
    }
  },
  ko: {
    title: '호흡',
    meditation: '명상',
    inhale: '들이마시기',
    hold: '멈춤',
    exhale: '내쉬기',
    holdAfter: '멈춤',
    breathCount: '{{n}}번째 호흡',
    rhythm: '호흡 리듬',
    presetDuration: '기본 시간',
    customDuration: '사용자 정의 시간',
    selectDuration: '시간 선택',
    done: '완료',
    gotIt: '알겠어요',
    tutorial: '튜토리얼',
    steps: '작동 단계',
    primary: '추천',
    start: '재생',
    stop: '중지',
    minutes_other: '{{count}}분',
    rhythmInhale_other: '들이마시기 {{count}}초',
    rhythmHold_other: '멈춤 {{count}}초',
    rhythmExhale_other: '내쉬기 {{count}}초',
    ready: '준비',
    finished: '연습 완료',
    methods: {
      sleep_478: {
        name: '4–7–8 수면 호흡법',
        subtitle: '추천・불면증에',
        desc: '하버드 의대 앤드루 웨일 박사가 개발한 "천연 수면제". 긴 날숨이 심박수를 강제로 낮추고 대뇌 피질 활동을 줄여, 잠들기 전 잡생각, 입면 장애, 야간 각성을 빠르게 완화합니다. 2주간 꾸준히 하면 입면 시간이 크게 단축됩니다.',
        steps: [
          '눕고 편안히, 혀끝을 입천장에 가볍게 대고 입으로 완전히 숨을 내쉰다',
          '입을 다물고 코로 4초간 부드럽게 들이마시며 배를 자연스럽게 부풀린다',
          '7초간 숨을 멈추고 온몸의 긴장을 푼다',
          "입술을 살짝 벌리고 8초간 천천히 내쉰다, '쉬'하는 소리를 내도 좋다",
          '4~8회 반복, 생각이 흩어지면 부드럽게 호흡으로 다시 집중한다',
        ],
        tags: [
          '수면 보조',
          '깊은 수면',
          '야간 이완',
        ]
      },
      box_4444: {
        name: '박스 호흡',
        subtitle: '스퀘어 호흡・균형 집중',
        desc: '미 해군 특수부대 스트레스 해소 훈련법. 정사각형을 그리듯 균등한 호흡 리듬에서 이름이 유래. 교감신경과 부교감신경의 균형을 맞추고, 불안감, 짜증, 직장 스트레스를 완화. 이완되면서도 졸음이 오지 않아 점심시간, 업무 중간, 시험 전 마음 가라앉히기에 적합.',
        steps: [
          '허리를 펴고 앉거나 누워 온몸을 이완한다',
          '코로 4초간 일정하게 들이마시며 배를 확장한다',
          '4초간 숨을 멈추고 마음을 평온하게 유지한다',
          '코로 4초간 천천히 내쉬며 폐를 완전히 비운다',
          '내쉰 후 4초간 멈추어 한 사이클을 완성한다',
        ],
        tags: [
          '주간 스트레스 해소',
          '집중력',
          '감정 안정',
        ]
      },
      belly_46: {
        name: '기본 복식 호흡',
        subtitle: '보편적・초보자 친화적',
        desc: '고정된 리듬이 없으며 모든 호흡법의 기초. 제로 레벨부터 시작 가능. 가슴 호흡 대신 횡격막 호흡을 사용. 얕고 빠른 호흡 습관을 개선하고 만성적인 가슴 답답함, 불안, 피로를 완화. 언제 어디서나 연습 가능하며 호흡 초보자나 경미한 불안이 있는 사람에게 적합.',
        steps: [
          '한 손은 가슴에, 다른 손은 배에 올린다',
          '코로 천천히 들이마시며 배만 부풀리고 가슴은 움직이지 않는다',
          '입으로 일정하게 내쉬며 배를 안쪽으로 당겨 수축시킨다',
          '전체 과정을 천천히 부드럽게, 날숨은 들숨의 1.5~2배 길이로 자유롭게 순환',
        ],
        tags: [
          '초보자',
          '일상의 평온',
          '기초',
        ]
      },
      stress_426: {
        name: '4–2–6 빠른 스트레스 해소',
        subtitle: '빠른 진정・긴장 순간',
        desc: '가벼운 짧은 리듬. 갑작스러운 불안, 감정 폭발, 잠들기 전 짜증에 적합. 진입 장벽이 매우 낮음. 스트레스 호르몬 코르티솔을 빠르게 낮추고 1분 이내에 심장 박동과 긴장 떨림을 진정시킴. 출퇴근, 회의 전, 감정이 북받칠 때 빠른 완충제로 적합.',
        steps: [
          '눈을 감고 어깨를 편안히, 코로 4초간 들이마신다',
          '2초간 가볍게 멈춘다, 억지로 숨을 참지 않는다',
          '날숨을 6초로 늘려 불안과 스트레스를 모두 내뱉는다',
        ],
        tags: [
          '빠른 해소',
          '즉각적인 진정',
          '짧은 이완',
        ]
      },
    }
  },
  ja: {
    title: '呼吸',
    meditation: 'メディテーション',
    inhale: '吸う',
    hold: '止める',
    exhale: '吐く',
    holdAfter: '止める',
    breathCount: '呼吸 {{n}}',
    rhythm: '呼吸リズム',
    presetDuration: '標準時間',
    customDuration: 'カスタム時間',
    selectDuration: '時間を選択',
    done: '完了',
    gotIt: 'わかりました',
    tutorial: 'チュートリアル',
    steps: '操作手順',
    primary: 'おすすめ',
    start: '再生',
    stop: '停止',
    minutes_other: '{{count}}分',
    rhythmInhale_other: '吸う {{count}} 秒',
    rhythmHold_other: '止める {{count}} 秒',
    rhythmExhale_other: '吐く {{count}} 秒',
    ready: '準備OK',
    finished: '練習完了',
    methods: {
      sleep_478: {
        name: '4–7–8 睡眠呼吸法',
        subtitle: 'おすすめ・不眠に',
        desc: 'ハーバード医科大学のアンドリュー・ワイル博士が開発した「天然の睡眠薬」。長い呼気で心拍数を強制的に下げ、大脳皮質の活性を抑え、寝る前の考えすぎや入眠困難、夜中に目覚める症状を素早く緩和。2週間の継続で入眠時間が大幅に短縮されます。',
        steps: [
          '仰向けにリラックスし、舌先を上あごに軽く当て、口から完全に息を吐き出す',
          '口を閉じ、鼻から4秒かけて優しく吸い、腹部を自然に膨らませる',
          '7秒間息を止め、全身の力を抜く',
          "唇を軽く開け、8秒かけてゆっくり吐き出す、'スー'という音を立ててもよい",
          '4～8サイクル繰り返す、雑念が浮かんでも優しく呼吸に意識を戻す',
        ],
        tags: [
          '睡眠補助',
          '深い睡眠',
          '夜のリラックス',
        ]
      },
      box_4444: {
        name: 'ボックス呼吸',
        subtitle: 'スクエア呼吸・集中力',
        desc: '米海軍特殊部隊のストレス対策訓練法。正方形を描くように均等な呼吸リズムから名付けられた。交感神経と副交感神経のバランスを整え、動悸、イライラ、仕事のストレスを緩和。リラックスしながらも眠くならないので、昼休みや仕事の合間、試験前の気持ちの安定に最適。',
        steps: [
          '背筋を伸ばして座るか仰向けに寝て、全身をリラックスさせる',
          '鼻から4秒かけて一定の速度で吸い、腹部を膨らませる',
          '4秒間息を止め、心を落ち着かせる',
          '鼻から4秒かけてゆっくり吐き、肺の空気を完全に出す',
          '吐き終えたら4秒間休止し、1サイクル完了',
        ],
        tags: [
          '日中のストレス解消',
          '集中力',
          '感情の安定',
        ]
      },
      belly_46: {
        name: '基本腹式呼吸',
        subtitle: 'ユニバーサル・初心者向け',
        desc: '固定のリズムがなく、すべての呼吸法の基礎。ゼロから始められる。胸呼吸ではなく横隔膜呼吸を使う。浅く速い呼吸習慣を改善し、慢性的な胸の詰まり、不安、疲労を緩和。いつでもどこでも練習可能で、呼吸初心者や軽度の不安を持つ人に最適。',
        steps: [
          '片手を胸に、もう一方を腹部に置く',
          '鼻からゆっくり吸い、腹部だけが膨らみ、胸は動かさない',
          '口から一定の速度で吐き、腹部を内側に引き締める',
          '全体を通してゆっくりと滑らかに、呼気は吸気の1.5～2倍の長さを目安に自由に循環',
        ],
        tags: [
          '初心者',
          '日常の安らぎ',
          '基礎',
        ]
      },
      stress_426: {
        name: '4–2–6 クイックストレス解消',
        subtitle: 'クイックカーム・緊張時に',
        desc: '軽量な短いリズム。突然のパニック、感情の崩壊、寝る前のイライラに最適。非常に低いハードル。ストレスホルモンのコルチゾールを急速に低下させ、1分以内に心拍数の上昇や緊張による震えを鎮める。通勤中、会議前、感情が高ぶった時のクイックバッファーに。',
        steps: [
          '目を閉じて肩の力を抜き、鼻から4秒かけて吸う',
          '2秒間軽く止める、無理に息を止めない',
          '呼気を6秒に延ばし、緊張とストレスをすべて吐き出す',
        ],
        tags: [
          'クイック解消',
          'インスタントカーム',
          'ショートリラックス',
        ]
      },
    }
  },
  ru: {
    title: 'Дыхание',
    meditation: 'Медитация',
    inhale: 'Вдох',
    hold: 'Задержка',
    exhale: 'Выдох',
    holdAfter: 'Задержка',
    breathCount: 'Дыхание {{n}}',
    rhythm: 'Ритм дыхания',
    presetDuration: 'Длительность',
    customDuration: 'Своё время',
    selectDuration: 'Выбрать время',
    done: 'Готово',
    gotIt: 'Понятно',
    tutorial: 'Руководство',
    steps: 'Шаги выполнения',
    primary: 'Рекомендуется',
    start: 'Воспроизвести',
    stop: 'Стоп',
    minutes_one: '{{count}} минута',
    minutes_few: '{{count}} минуты',
    minutes_many: '{{count}} минут',
    minutes_other: '{{count}} минут',
    rhythmInhale_one: 'Вдох {{count}} с',
    rhythmInhale_few: 'Вдох {{count}} с',
    rhythmInhale_many: 'Вдох {{count}} с',
    rhythmInhale_other: 'Вдох {{count}} с',
    rhythmHold_one: 'Задержка {{count}} с',
    rhythmHold_few: 'Задержка {{count}} с',
    rhythmHold_many: 'Задержка {{count}} с',
    rhythmHold_other: 'Задержка {{count}} с',
    rhythmExhale_one: 'Выдох {{count}} с',
    rhythmExhale_few: 'Выдох {{count}} с',
    rhythmExhale_many: 'Выдох {{count}} с',
    rhythmExhale_other: 'Выдох {{count}} с',
    ready: 'Готовы',
    finished: 'Практика завершена',
    methods: {
      sleep_478: {
        name: '4–7–8 Дыхание для сна',
        subtitle: 'Рекомендуется • От бессонницы',
        desc: 'Разработано доктором Эндрю Вейлом из Гарвардской медицинской школы, известно как «натуральное снотворное». Удлинённый выдох принудительно снижает частоту сердечных сокращений и активность коры головного мозга, быстро облегчая тревожные мысли перед сном, трудности с засыпанием и ночные пробуждения. 2 недели практики значительно сокращают время засыпания.',
        steps: [
          'Лягте расслабленно, кончик языка слегка касается нёба, полностью выдохните через рот',
          'Закройте рот, мягко вдохните через нос на 4 секунды, живот естественно расширяется',
          'Задержите дыхание на 7 секунд, тело остаётся расслабленным',
          "Слегка приоткройте губы, медленно выдыхайте 8 секунд, можно издавать мягкий звук 'ш-ш-ш'",
          'Повторите 4–8 циклов, если мысли отвлекаются — мягко верните внимание к дыханию',
        ],
        tags: [
          'Помощь ко сну',
          'Глубокий сон',
          'Ночное расслабление',
        ]
      },
      box_4444: {
        name: 'Квадратное дыхание',
        subtitle: 'Квадратное дыхание • Фокус',
        desc: 'Метод снятия стресса морских котиков США, названный в честь равномерного дыхательного ритма, напоминающего квадрат. Балансирует симпатическую и парасимпатическую нервные системы, снимает панику, раздражительность и рабочий стресс. Расслабляет, не вызывая сонливости, идеально для обеденных перерывов, рабочих пауз и успокоения перед экзаменом.',
        steps: [
          'Сядьте прямо или лягте на спину, расслабьте всё тело',
          'Равномерно вдохните через нос на 4 секунды, живот расширяется',
          'Задержите дыхание на 4 секунды, сохраняйте внутреннее спокойствие',
          'Медленно выдохните через нос на 4 секунды, полностью опорожняя лёгкие',
          'Короткая пауза после выдоха на 4 секунды — завершён полный цикл',
        ],
        tags: [
          'Дневное снятие стресса',
          'Фокус',
          'Эмоциональный баланс',
        ]
      },
      belly_46: {
        name: 'Базовое диафрагмальное дыхание',
        subtitle: 'Универсально • Для начинающих',
        desc: 'Без фиксированного ритма — основа всех дыхательных техник, нулевой порог входа. Использует диафрагмальное дыхание вместо грудного. Улучшает поверхностное и учащённое дыхание, снимает хроническую заложенность в груди, тревожность и усталость. Практикуйте в любое время — идеально для новичков и людей с лёгкой тревожностью.',
        steps: [
          'Положите одну руку на грудь, другую на живот',
          'Медленно вдохните носом — только живот поднимается, грудь остаётся неподвижной',
          'Равномерно выдохните ртом — живот втягивается внутрь и опускается',
          'Всё выполняйте медленно и плавно, выдох должен быть в 1,5–2 раза длиннее вдоха, свободный цикл',
        ],
        tags: [
          'Новичок',
          'Ежедневное спокойствие',
          'Основа',
        ]
      },
      stress_426: {
        name: '4–2–6 Быстрое снятие стресса',
        subtitle: 'Быстрое успокоение • Напряжённые моменты',
        desc: 'Лёгкий короткий ритм. Подходит для внезапной паники, эмоционального срыва или раздражительности перед сном. Очень низкий порог входа. Быстро снижает уровень кортизола, в течение 1 минуты успокаивает учащённое сердцебиение и нервную дрожь. Идеально для дороги, перед встречами или для быстрой разрядки при эмоциональной перегрузке.',
        steps: [
          'Закройте глаза, расслабьте плечи, вдохните через нос на 4 секунды',
          'Короткая задержка на 2 секунды, не форсируйте',
          'Удлините выдох до 6 секунд, выдыхая всё напряжение и стресс',
        ],
        tags: [
          'Быстрое облегчение',
          'Мгновенное спокойствие',
          'Короткое расслабление',
        ]
      },
    }
  },
};
