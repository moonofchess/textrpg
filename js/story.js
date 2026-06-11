/* =========================================================
   스토리 데이터 — 1부 1페이즈: 진흙골의 아이
   각 장면: title, text(배열 또는 함수), choices, onEnter 등
   문단 타입: narr(서술) / speak(대사) / think(독백) / sys(시스템) / danger(위기)
   ========================================================= */
const STORY = {
  items: {
    boots: { name: "낡은 장화", desc: "한쪽 굽이 닳았지만, 발만은 따뜻하게 지켜준다." },
    stick: { name: "부러진 창대", desc: "막대기보다 조금 나은 무기." },
    spear: { name: "경비병의 창", desc: "정식 무장의 증거." },
    charm: { name: "마라의 매듭", desc: "회색 끈으로 엮은 부적. 손에 쥐면 전생의 기억이 잔잔히 떠오른다." },
    jerkin: { name: "낡은 가죽 흉갑", desc: "급소를 한 겹 덮어준다. 받는 피해가 줄어든다." },
    whetstone: { name: "숫돌", desc: "창끝을 벼린다. 주는 피해가 조금 늘어난다." },
    ledger: { name: "장부의 이름", desc: "이름이 적혔다는 것은, 비로소 사람이 되었다는 뜻." },
  },

  // 수량형 소모품 (물자) — 사이드바에서 [사용]
  supplies: {
    bread: {
      name: "검은 빵", desc: "허기 +28, 체력 +4",
      use: (G) => { G.mod("hunger", 28); G.mod("health", 4); G.toast("빵을 씹어 넘긴다. 빈속이 가라앉는다."); },
    },
    jerky: {
      name: "말린 고기", desc: "허기 +18",
      use: (G) => { G.mod("hunger", 18); G.toast("질긴 고기를 오래도록 씹는다."); },
    },
    herbs: {
      name: "약초 꾸러미", desc: "체력 +18",
      use: (G) => { G.mod("health", 18); G.toast("약초를 짓이겨 상처에 바른다. 쓰라림 끝에 통증이 가신다."); },
    },
    bandage: {
      name: "붕대", desc: "체력 +12",
      use: (G) => { G.mod("health", 12); G.toast("상처를 단단히 동여맨다."); },
    },
    spirits: {
      name: "독한 술", desc: "허기 +6, 체력 +12",
      use: (G) => { G.mod("hunger", 6); G.mod("health", 12); G.toast("싸구려 술이 식도를 태우며 내려간다. 잠시, 추위도 두려움도 흐려진다."); },
    },
    oiled_torch: {
      name: "기름 횃불", desc: "다음 전투에서 회피가 쉬워진다",
      use: (G) => { G.setFlag("torch_buff"); G.toast("횃불에 기름을 먹였다. 다음 싸움에서 짐승이 불을 꺼릴 것이다."); },
    },
  },

  // 분대 병사 이름 풀
  soldierNames: [
    "한스", "오토", "군터", "빌렘", "데릭", "마르틴", "클라우스", "요르크",
    "베른", "루카", "핀", "토비", "거스", "렘", "발드", "에밋",
    "콘라트", "도른", "케닛", "하랄", "스벤", "외팔이 보른", "곰보 야렉", "쥐새끼 핍",
    "절름발이 콜", "말더듬이 운트", "북부 사내 그림", "고아 닐스",
  ],

  // 무한 전투 모드에 등장하는 적 (순환하며 점점 강해진다)
  endlessFoes: [
    { name: "굶주린 도적단", art: "mob-bandit-horde", flavor: "또 사람이다. 굶주림에 미쳐 칼을 든 자들." },
    { name: "잿빛 늑대 대군", art: "mob-ashwolf", flavor: "붉은 눈이 수십 쌍. 무리가 평소의 몇 배다." },
    { name: "비늘몸 떼", art: "mob-scalecrawler", flavor: "비늘이 달빛에 번들거린다. 자주색 개체가 섞였다." },
    { name: "늪지 시체병 군세", art: "mob-marsh-corpse", flavor: "느리지만 끝이 없다. 베어도 베어도 일어선다." },
    { name: "잿빛 까마귀 떼", art: "mob-ashcrow", flavor: "하늘이 검게 덮인다. 강하 직전의 합창이 울린다." },
    { name: "늪귀 무리", art: "mob-swampwraith", flavor: "사람 우는 소리가 사방에서 들린다. 전부 미끼다." },
    { name: "흑성 광신도 무리", art: "mob-cultist", flavor: "“멸망이야말로 구원이다!” 눈이 검게 물든 자들." },
    { name: "암흑 기사단", art: "mob-darkknight", flavor: "부식된 갑옷이 줄지어 선다. 죽은 기사들의 행군." },
    { name: "속삭이는 갑옷", art: "mob-whispering-armor", flavor: "빈 갑옷이 저 혼자 움직이며 죽은 자의 목소리로 속삭인다." },
    { name: "뿌리 인간 군락", art: "mob-rootman", flavor: "폐허에서 자라난 것들이 사람 목소리로 도움을 청한다." },
    { name: "죽지 않는 기사", art: "mob-undying-knight", flavor: "흑성에 오염된 옛 용사. 명예와 살육이 뒤섞인 괴물." },
    { name: "검은 성자의 그림자", art: "mob-black-saint-shadow", flavor: "걸어오는 흑성. 가까이 있는 것만으로 정신이 갈린다." },
  ],

  // 위치 → 배경 일러스트 (장면에 bg가 없으면 위치로 결정)
  bgByLocation: {
    "진흙골": "bg-mudhollow",
    "회색보리 마을": "bg-greybarley",
    "하윈 성채": "bg-hawin-keep",
    "하윈 영지 · 호송로": "bg-hawin-keep",
    "칼덴 군영": "bg-calden-camp",
    "칼덴 군영 · 외곽": "bg-calden-camp",
  },

  // 막사(출진 전) 공용 선택지 — selfScene으로 되돌아오며, 전투/상점 씬으로 분기
  _campChoices: function (G, selfScene, battleScene, quarterScene, recruitScene) {
    const woundedMost = (g) => { let w = null; (g.s.squad || []).forEach((s) => { if (s.hp < s.maxHp && (!w || (s.maxHp - s.hp) > (w.maxHp - w.hp))) w = s; }); return w; };
    const c = [];
    c.push({
      text: "전 부대를 훈련시킨다. (경험치 +1)",
      enabled: (g) => !g.s.campTrained && (g.s.squad || []).some((s) => s.skill < 5),
      lockedText: "이번 출진 훈련은 끝났다",
      effect: (g) => { g.s.campTrained = true; g.trainSquad(); g.mod("hunger", -8); },
      outcome: { type: "good", text: "진창에서 창을 내지르고 방패를 맞댄다. 고된 훈련이 손끝에 쌓인다. (경험치가 차면 기량 ★이 오른다)" },
      next: selfScene,
    });
    c.push({
      text: "부대를 쉬게 한다. (전원 체력 회복)",
      enabled: (g) => !g.s.campRested,
      lockedText: "이번 출진 회복은 끝났다",
      effect: (g) => { g.s.campRested = true; (g.s.squad || []).forEach((s) => { s.hp = Math.min(s.maxHp, s.hp + 14); }); },
      outcome: { type: "neutral", text: "모닥불 곁에서 언 몸을 녹이고 상처를 싸맨다. 부하들의 핏기가 조금 돌아온다." },
      next: selfScene,
    });
    c.push({
      text: "사비를 털어 회식한다. (10닢, 전원 완쾌)",
      enabled: (g) => g.s.coins >= 10 && !g.s.campRested,
      lockedText: (G.s.campRested ? "이번 출진 회복은 끝났다" : "동전 부족"),
      effect: (g) => { if (g.spend(10)) { g.s.campRested = true; (g.s.squad || []).forEach((s) => { s.hp = s.maxHp; }); g.mod("reputation", 2); } },
      outcome: { type: "good", text: "고기 굽는 냄새가 막사에 퍼진다. 배부른 병사들의 눈에 생기가 돈다." },
      next: selfScene,
    });
    c.push({
      text: "가장 다친 병사에게 약초를 쓴다.",
      show: (g) => g.supplyCount("herbs") > 0 && (g.s.squad || []).some((s) => s.hp < s.maxHp),
      effect: (g) => { const w = woundedMost(g); if (w) w.hp = Math.min(w.maxHp, w.hp + 20); g.s.supplies.herbs -= 1; if (g.s.supplies.herbs <= 0) delete g.s.supplies.herbs; },
      outcome: { type: "good", text: "가장 성치 않은 병사의 상처에 약초를 짓이겨 바른다." },
      next: selfScene,
    });
    c.push({
      text: "가장 다친 병사를 붕대로 싸맨다.",
      show: (g) => g.supplyCount("bandage") > 0 && (g.s.squad || []).some((s) => s.hp < s.maxHp),
      effect: (g) => { const w = woundedMost(g); if (w) w.hp = Math.min(w.maxHp, w.hp + 14); g.s.supplies.bandage -= 1; if (g.s.supplies.bandage <= 0) delete g.s.supplies.bandage; },
      outcome: { type: "neutral", text: "피 밴 천을 단단히 둘러 출혈을 막는다." },
      next: selfScene,
    });
    if (quarterScene) c.push({ text: "보급 — 물자를 산다. (상점)", next: quarterScene });
    if (recruitScene) c.push({ text: "인사 — 병사 모집·방출·정원", next: recruitScene });
    c.push({ text: "출진한다.", continue: true, next: battleScene });
    return c;
  },

  // 병사 인사(영입/방출/정원) 공용 선택지
  _recruitChoices: function (G, selfScene, returnScene) {
    const cap = G.s.squadCap || 10;
    const n = (G.s.squad || []).length;
    const capPrice = 20 + (cap - 10) * 15;
    const c = [];
    c.push({
      text: "병사를 영입한다. (12닢)",
      enabled: (g) => g.s.coins >= 12 && (g.s.squad || []).length < (g.s.squadCap || 10),
      lockedText: (n >= cap ? "정원이 찼다" : "동전 부족"),
      effect: (g) => { if (g.spend(12)) { const r = g.recruit(); g.toast("신병 " + r.name + " 합류"); } },
      outcome: { type: "good", text: "떠도는 병사 하나를 거두어 분대에 넣는다. 겁먹은 눈이지만, 손에 창은 쥐고 있다." },
      next: selfScene,
    });
    c.push({
      text: "병사 한도를 늘린다. (+1, " + capPrice + "닢)",
      enabled: (g) => g.s.coins >= capPrice,
      lockedText: "동전 부족",
      effect: (g) => { if (g.spend(capPrice)) { g.s.squadCap = (g.s.squadCap || 10) + 1; g.toast("분대 정원 +1 (총 " + g.s.squadCap + "명)"); } },
      outcome: { type: "good", text: "천막과 배급을 더 마련해, 한 사람을 더 받을 자리를 만든다." },
      next: selfScene,
    });
    (G.s.squad || []).forEach((s) => {
      c.push({
        text: "방출: " + s.name + " (★" + s.skill + " 공" + (s.atk != null ? s.atk : 3 + s.skill * 2) + " 방" + (s.def != null ? s.def : 1 + s.skill) + ")",
        effect: (g) => { g.s.squad = (g.s.squad || []).filter((x) => x !== s); g.toast(s.name + " 방출"); },
        outcome: { type: "neutral", text: s.name + "을(를) 분대에서 내보낸다. 미안하다는 말은… 하지 않는다." },
        next: selfScene,
      });
    });
    c.push({ text: "인사를 마친다.", next: returnScene });
    return c;
  },

  // 보급(상점) 공용 선택지 — selfScene으로 되돌아오며 returnScene으로 나간다
  _shopChoices: function (G, selfScene, returnScene) {
    const buy = (label, price, fn) => ({
      text: label + " — " + price + "닢",
      enabled: (g) => g.s.coins >= price, lockedText: "동전 부족",
      effect: (g) => { if (g.spend(price)) fn(g); },
      outcome: { type: "good", text: "값을 치르고 물건을 챙긴다." },
      next: selfScene,
    });
    const list = [
      buy("검은 빵", 3, (g) => g.addSupply("bread", 1)),
      buy("말린 고기", 4, (g) => g.addSupply("jerky", 1)),
      buy("붕대", 4, (g) => g.addSupply("bandage", 1)),
      buy("약초 꾸러미", 6, (g) => g.addSupply("herbs", 1)),
      buy("기름 횃불", 5, (g) => g.addSupply("oiled_torch", 1)),
    ];
    if (!G.has("jerkin")) list.push(buy("낡은 가죽 흉갑 (받는 피해 감소)", 18, (g) => g.give("jerkin")));
    if (!G.has("whetstone")) list.push(buy("숫돌 (주는 피해 증가)", 12, (g) => g.give("whetstone")));
    list.push({ text: "보급을 마친다.", next: returnScene });
    return list;
  },

  scenes: {
    /* ---------- 캐릭터 메이킹: 전생의 회상 ---------- */
    creation_intro: {
      title: "마지막 겨울",
      phase: "전생",
      location: "중원, 뒷골목",
      status: "개방의 거지 청연",
      text: [
        { t: "narr", c: "다리 밑은 얼음장 같았다. 청연은 마른 손에 입김을 불며, 천천히 식어가는 제 몸을 가만히 느꼈다. 거지로 살다 거지로 죽는 밤. 딱히 별다를 것도 없었다." },
        { t: "narr", c: "흐려지는 의식 사이로, 살아온 날들이 두서없이 흘러갔다." },
      ],
      choices: [
        { text: "…", continue: true, next: "cre_q1" },
      ],
    },

    cre_q1: {
      title: "뒷골목",
      text: [
        { t: "narr", c: "비좁은 골목, 썩은 짚더미와 굶주린 그림자들. 수많은 거지 틈에서 그를 살린 건 늘 한 가지였다." },
      ],
      choices: [
        {
          text: "누가 칼을 품었는지, 어느 길이 막혔는지 먼저 알아챘다.",
          effect: (G) => { G.mod("awareness", 15); G.mod("evasion", 2); },
          outcome: { type: "good", text: "청연은 골목의 공기를 읽었다. 위험은 늘 냄새부터 풍겼고, 그는 그 냄새를 맡을 줄 알았다." },
          next: "cre_q2",
        },
        {
          text: "빼앗기지 않으려면, 주먹이 매워야 했다.",
          effect: (G) => { G.mod("attack", 6); G.mod("health", 5); },
          outcome: { type: "good", text: "굶주린 손이었지만 주먹만은 단단했다. 한 번 제대로 휘두르고 나면, 다음부턴 아무도 그의 몫에 손대지 않았다." },
          next: "cre_q2",
        },
        {
          text: "두들겨 맞아도, 끝끝내 죽지 않았다.",
          effect: (G) => { G.mod("defense", 6); G.mod("hunger", 10); },
          outcome: { type: "good", text: "맞는 데 이골이 났다. 급소를 틀고 충격을 흘리며, 그는 늘 다시 일어났다. 질긴 것이 곧 재능이었다." },
          next: "cre_q2",
        },
      ],
    },

    cre_q2: {
      title: "벼랑 끝",
      text: [
        { t: "narr", c: "죽을 고비는 셀 수 없었다. 그때마다 그를 빼낸 건 늘 같은 버릇이었다." },
      ],
      choices: [
        {
          text: "싸움이 터지기 전에, 이미 그 자리에 없었다.",
          effect: (G) => { G.mod("awareness", 8); G.mod("evasion", 4); },
          outcome: { type: "good", text: "가장 안전한 승리는 싸우지 않는 것. 그는 위험이 닥치기 전에 늘 먼저 사라졌다." },
          next: "cre_q3",
        },
        {
          text: "도망칠 곳이 없으면, 이를 악물고 맞붙었다.",
          effect: (G) => { G.mod("attack", 5); G.mod("defense", 3); },
          outcome: { type: "good", text: "물러설 데가 없을 땐 끝까지 버텼다. 물러서지 않는 자 앞에서는, 다들 한 걸음씩 물러섰다." },
          next: "cre_q3",
        },
        {
          text: "죽은 척, 숨고, 쥐구멍으로 빠져나왔다.",
          effect: (G) => { G.mod("evasion", 7); G.mod("awareness", 3); },
          outcome: { type: "neutral", text: "체면 따위 없었다. 진창에 엎어져 죽은 척, 똥통에 숨기. 결국 살아남은 자가 이긴 자였다." },
          next: "cre_q3",
        },
      ],
    },

    cre_q3: {
      title: "사람들",
      text: [
        { t: "narr", c: "거지에게도 세상은 결국 사람으로 굴러갔다. 그는 사람들 틈에서 이렇게 처신했다." },
      ],
      choices: [
        {
          text: "굽신거리며 귀를 열어, 소문을 그러모았다.",
          effect: (G) => { G.mod("reputation", 5); G.mod("awareness", 4); },
          outcome: { type: "good", text: "고개를 숙이고 있으면 세상의 소문이 제 발로 굴러들었다. 정보는 곧 목숨값이었다." },
          next: "creation_done",
        },
        {
          text: "제 입에 든 것도 나눠, 패거리를 챙겼다.",
          effect: (G) => { G.mod("reputation", 8); G.mod("defense", 2); },
          outcome: { type: "good", text: "나눈 만큼 등을 맡길 자가 생겼다. 등이 든든한 거지는 쉽게 죽지 않았다." },
          next: "creation_done",
        },
        {
          text: "아무도 믿지 않고, 혼자 모든 걸 익혔다.",
          effect: (G) => { G.mod("attack", 3); G.mod("evasion", 3); G.mod("awareness", 3); },
          outcome: { type: "neutral", text: "기댈 곳이 없으니 전부 혼자 익혔다. 외로웠지만, 배신당할 일도 없었다." },
          next: "creation_done",
        },
      ],
    },

    creation_done: {
      title: "그리고, 어둠",
      text: [
        { t: "narr", c: "기억의 조각들이 하나둘 흩어지고, 어둠이 다시 짙어진다. 청연의 마지막 숨이 가늘게 멀어져 갔다." },
        { t: "think", c: "무엇이 남을지는… 살아보면, 알게 되겠지." },
      ],
      choices: [
        { text: "눈을 감는다.", continue: true, next: "intro" },
      ],
    },

    /* ---------- 도입: 환생 ---------- */
    intro: {
      title: "다시 태어나도 거지",
      phase: "1부 1페이즈",
      location: "진흙골",
      status: "진흙골의 아이",
      art: { key: "motif-blackstar", type: "scenic" },
      text: [
        { t: "think", c: "거지로 살다 거지로 죽었는데, 다시 눈을 떠보니 또 거지였다." },
        { t: "narr", c: "전생의 이름은 청연. 중원 뒷골목 개방의 말단 거지였다. 고수도 협객도 아니었고, 굶주림과 매질 속을 기어다니다 어느 겨울 다리 밑에서 조용히 식어버렸다. 가진 재주라곤 하나, 살아남는 법뿐이었다. 그것만은 어지간한 무림인보다 지독하게 알았다." },
        { t: "narr", c: "그러고는 다시 눈을 떴다." },
        { t: "narr", c: "코를 찌르는 건 시궁창과 썩은 짚 냄새. 올려다본 밤하늘엔 낯선 별자리가 박혀 있었다. 그중 하나는 빛을 내기는커녕 곁의 별빛마저 빨아들이는 듯 검었다. 이곳은 진흙골. 회색보리 마을 바깥, 도랑 건너편에 들러붙은 빈민 취락이다." },
        { t: "sys", c: "당신은 로완. 열세 살. 장부에 이름 한 줄 없는 무적자(無籍者). 목표는 거창하지 않다. 그저 굶어 죽지 않는 것." },
        { t: "think", c: "또 거지라. 뭐, 거지면 어떤가. 죽지만 않으면 됐다." },
      ],
      choices: [
        { text: "몸을 일으킨다.", continue: true, next: "mud_morning" },
      ],
    },

    /* ---------- 풀죽 다툼: 첫 생존 + 눈치 판정 학습 ---------- */
    mud_morning: {
      title: "풀죽 한 솥",
      onEnter: (G) => { G.mod("hunger", -8); },
      text: [
        { t: "narr", c: "취락 한가운데 깨진 솥에서 멀건 풀죽이 끓는다. 누가 끓였는지는 아무도 따지지 않는다. 굶주린 것들이 몰려들 뿐이다. 아이, 노인, 다리 저는 사내. 솥 하나에 열 개의 손이 달려든다." },
        { t: "narr", c: "뱃속이 운다. 어제도 그제도 제대로 먹지 못했다." },
        { t: "think", c: "정면으로 손을 들이밀면 덩치들에게 밀린다. 전생의 버릇대로라면, 가장 약한 틈을 노려야지." },
      ],
      choices: [
        {
          text: "힘으로 비집고 들어가 한 그릇 챙긴다.",
          tag: "위험", tagType: "risk",
          effect: (G) => { G.mod("health", -10); G.mod("hunger", 14); G.mod("reputation", -2); },
          outcome: { type: "bad", text: "남의 팔꿈치가 갈비뼈에 박힌다. 죽 한 그릇은 챙겼지만 옆구리에 멍이 남았고, 사람들의 머릿속엔 '먹을 것에 환장한 들개' 한 마리가 새겨졌다." },
          next: "after_porridge",
        },
        {
          text: "사람들의 빈틈을 읽어, 약한 쪽으로 파고든다.",
          tag: "눈치 판정", tagType: "info",
          check: { stat: "awareness", bonus: 15 },
          onSuccess: {
            effect: (G) => { G.mod("hunger", 16); G.mod("awareness", 3); },
            outcome: { type: "good", text: "노파의 손이 떨리는 찰나, 그 곁으로 몸을 흘려 넣는다. 아무와도 부딪히지 않고 죽 한 그릇이 손에 들어왔다. 힘이 아니라 흐름을 읽는 것. 몸이 아직 그 요령을 기억하고 있었다." },
            next: "after_porridge",
          },
          onFail: {
            effect: (G) => { G.mod("hunger", 5); G.mod("health", -4); },
            outcome: { type: "bad", text: "틈이라 여긴 곳이 함정이었다. 덩치 큰 사내의 어깨에 튕겨 바닥에 나뒹군다. 건진 건 식은 죽 몇 모금이 전부다." },
            next: "after_porridge",
          },
        },
        {
          text: "솥을 포기하고 늙은 마라를 찾아간다.",
          effect: (G) => { G.setFlag("sought_mara"); },
          next: "mara",
        },
        {
          text: "더 어린 아이에게 자리를 양보하고, 바닥에 흘린 죽을 긁어 먹는다.",
          effect: (G) => { G.mod("hunger", 5); G.mod("health", -3); G.mod("reputation", 4); G.setFlag("kind_streak"); },
          outcome: { type: "neutral", text: "비쩍 마른 아이를 솥 앞으로 밀어주고, 바닥에 튄 죽을 손가락으로 긁어 핥는다. 배는 거의 차지 않았다. 그래도 그 아이가 당신을 올려다보는 눈빛만은, 이런 데서 좀처럼 보기 힘든 것이었다. 전생의 자신도 한때 누군가의 그런 눈빛에 기대 목숨을 부지했다." },
          next: "after_porridge",
        },
      ],
    },

    mara: {
      title: "늙은 마라",
      art: "port-mara",
      text: [
        { t: "narr", c: "도랑 끝, 한쪽으로 기운 판잣집. 늙은 마라가 제 몫의 죽을 절반쯤 덜어 이 빠진 그릇에 담는다. 친어머니는 아니다. 그저 갈 곳 없는 아이들을 되는대로 거두어 먹이는 늙은 여자다." },
        { t: "speak", c: "마라: “또 못 비집고 왔구나, 미련한 것. 그래도 안 맞고 온 게 어디냐.”" },
        { t: "narr", c: "그녀가 회색 끈으로 엮은 작은 매듭을 손에 쥐여준다. 손가락이 그 매듭을 더듬자, 전생에 익힌 개방의 표식이 어렴풋이 겹쳐 떠올랐다." },
        { t: "speak", c: "마라: “살아라. 착하게 살 생각은 접고, 일단 살고 봐.”" },
      ],
      onEnter: (G) => { G.mod("hunger", 12); G.give("charm"); G.setFlag("mara_known"); },
      choices: [
        { text: "진흙골을 한 바퀴 돌며 리사를 찾아본다.", show: (G) => !G.flag("lisa_known"), next: "lisa" },
        { text: "매듭을 꼭 쥔다. 일거리를 찾아 마을로 간다.", continue: true, next: "to_village" },
      ],
    },

    lisa: {
      title: "독한 계집애",
      art: "port-lisa",
      onEnter: (G) => { G.setFlag("lisa_known"); },
      text: [
        { t: "narr", c: "무너진 수레 그늘 아래, 또래보다 한두 살 위로 보이는 소녀가 마른 약초를 다듬고 있다. 리사. 이 동네에서 제일 독하고, 제일 눈이 밝은 아이다." },
        { t: "speak", c: "리사: “마라 할멈한테 얹혀사는 애구나. 뭘 봐. 나눠줄 거 없어.”" },
        { t: "narr", c: "약초를 다듬는 손과 달리, 그녀의 눈은 마을 쪽 길과 도랑 양옆을 쉴 새 없이 훑는다. 굶어본 자만이 가지는 경계심. 그 눈빛이라면 익숙하다." },
        { t: "think", c: "이런 아이는 곧 정보다. 밑바닥에선 누가 뭘 아느냐가 누가 사느냐를 가른다." },
      ],
      choices: [
        {
          text: "마을 사정과 위험한 자들에 대해 묻는다.",
          effect: (G) => { G.setFlag("lisa_info"); G.mod("awareness", 4); },
          outcome: { type: "good", text: "리사는 경계하면서도 입을 연다. “요새 마을에 낯선 얼굴이 부쩍 늘었어. 곡물창고 근처를 자꾸 기웃대는 것들이야. 조심해. 사람 사고파는 부류일지도 모르니까.” 마을에 발을 들이기도 전에, 닥쳐올 위험의 윤곽을 먼저 손에 쥐었다." },
          next: "to_village",
        },
        {
          text: "“언젠가 같이 여기서 나가자.” 약초 다듬는 걸 돕는다.",
          effect: (G) => { G.setFlag("lisa_ally"); G.mod("reputation", 3); G.mod("hunger", -2); G.addSupply("herbs", 2); },
          outcome: { type: "neutral", text: "리사가 코웃음을 친다. “나가서 뭐 하게?” 그래도 당신이 잠자코 약초 줄기를 골라내자 더는 쫓아내지 않았다. 한참 뒤 그녀가 약초 꾸러미 하나를 툭 던진다. “병사가 되든 귀족이 되든, 배고픈 놈 눈빛은 못 속여. 그것만 기억해.” 이 바닥에 등을 맡길 사람 하나가 생겼다." },
          next: "to_village",
        },
      ],
    },

    after_porridge: {
      title: "도랑 너머",
      text: [
        { t: "narr", c: "뱃속의 비명이 잦아들자 비로소 머리가 돌아간다. 여기선 죽 한 그릇이 오늘 하루치 목숨이다. 그럼 내일은. 모레는." },
        { t: "think", c: "이대로 눌러앉으면 겨울에 얼어 죽는다. 도랑 건너 회색보리 마을, 그 경비초소에서 잡일이라도 얻어야 한다. 손에 흙 묻히는 일이면 가린 처지가 아니다." },
        { t: "narr", c: "닳아빠진 짚신을 고쳐 신고 도랑을 건넌다." },
      ],
      choices: [
        { text: "마을로 가기 전, 진흙골을 돌며 리사를 찾는다.", show: (G) => !G.flag("lisa_known"), next: "lisa" },
        { text: "회색보리 마을로 향한다.", continue: true, next: "to_village" },
      ],
    },

    /* ---------- 마을 진입: 고구마(몰트) ---------- */
    to_village: {
      title: "회색보리 마을",
      art: "port-molt",
      location: "회색보리 마을",
      onEnter: (G) => { G.mod("hunger", -5); },
      text: [
        { t: "narr", c: "낮은 목책에 감시탑 둘, 보리밭과 순무밭. 시장이라 부르기도 민망한 공터와 낡은 곡물창고. 도랑 건너 빈민촌에 견주면, 여기는 거의 성이나 다름없다." },
        { t: "narr", c: "경비초소 앞에서 선임병 몰트가 창대로 길을 막는다. 흙투성이 발을 위아래로 훑는 눈빛." },
        { t: "speak", c: "몰트: “도랑 너머 거지새끼가 여긴 뭐 하러 기어들어 와? 막대기 쥐었다고 병사라도 된 줄 아나?”" },
      ],
      choices: [
        {
          text: "고개를 숙이고 굽신거린다. 체면보다 밥이다.",
          effect: (G) => { G.mod("reputation", -1); G.setFlag("molt_met"); G.mod("awareness", 2); },
          outcome: { type: "neutral", text: "당신은 보란 듯이 납작 엎드린다. 몰트는 시시하다는 듯 콧방귀를 뀌지만, 그가 우쭐대는 사이 당신의 눈은 초소 안 사정을 죄다 읽어냈다. 비굴함도 잘 쓰면 무기가 된다." },
          next: "meet_bram",
        },
        {
          text: "맞받아친다. “거지라도 두 손은 멀쩡합니다.”",
          tag: "위험", tagType: "risk",
          effect: (G) => { G.mod("health", -8); G.mod("reputation", 2); G.setFlag("molt_grudge"); },
          outcome: { type: "bad", text: "창대가 어깨를 후려친다. 바닥에 처박혔지만, 멀찍이서 신참 요나가 그 광경을 흥미로운 눈으로 지켜본다. 두들겨 맞은 값으로 배짱 하나는 알려졌다." },
          next: "meet_bram",
        },
        {
          text: "몰트를 무시하고, 그 뒤에 선 또래 신참에게 슬쩍 말을 붙인다.",
          effect: (G) => { G.setFlag("yona_early"); G.mod("awareness", 2); G.mod("reputation", 1); },
          outcome: { type: "neutral", text: "몰트를 못 들은 척 지나쳐, 어색하게 서 있던 또래에게 다가간다. “너도 신참이지?” 그가 떨떠름하게 받는다. “요나다. 도랑 너머 놈이 먼저 말을 다 거네. 세상 진짜 망했나 봐.” 비아냥에 가깝지만 적의는 없다. 훗날 가장 오래갈 전우와 나눈 첫마디였다." },
          next: "meet_bram",
        },
      ],
    },

    meet_bram: {
      title: "경비대장 브람",
      art: "port-bram",
      text: [
        { t: "narr", c: "초소 안. 절뚝이는 다리, 낡은 가죽갑옷, 희끗한 수염. 피곤에 절은 사내가 당신을 올려다본다. 경비대장 브람이다." },
        { t: "speak", c: "브람: “일거리라. 마침 손이 모자라긴 하지. 물 긷고 창고 치우고, 시키는 건 군말 없이 한다. 급료는 없고 저녁에 식은 죽 한 그릇. 싫으면 도랑으로 꺼져.”" },
        { t: "think", c: "급료 없는 막일. 그래도 죽 한 그릇이 어딘가. 무엇보다 이 안에 들어가야 장부에 이름 올릴 기회라도 생긴다." },
      ],
      onEnter: (G) => { G.setStatus("경비대 잡역"); },
      choices: [
        {
          text: "“하겠습니다.” 고개를 숙인다.",
          effect: (G) => { G.give("stick"); G.setFlag("hired"); },
          next: "chores",
        },
      ],
    },

    /* ---------- 잡역 중 이상 징후 발견 (핵심 눈치 판정) ---------- */
    chores: {
      title: "곡물창고의 그림자",
      bg: "bg-granary",
      onEnter: (G) => { G.mod("hunger", -6); G.nextDay(); },
      text: [
        { t: "narr", c: "사흘이 흘렀다. 물을 긷고 똥통을 비우고 창고 바닥의 쥐를 잡았다. 병사들은 당신을 '도랑 잡것'이라 부르지만, 적어도 저녁마다 죽은 꼬박꼬박 나온다." },
        { t: "narr", c: "오늘도 곡물창고 뒤편을 쓸다가, 문득 무언가 거슬린다. 위험이 다가올 때면 늘 그렇듯, 목덜미가 싸늘해지는 그 느낌." },
        { t: "think", c: "뭔가 어긋났다. 평소와 다른 게 있다. 그게 뭐지." },
      ],
      choices: [
        {
          text: "걸음을 멈추고, 주변을 천천히 읽는다.",
          tag: "눈치 판정", tagType: "info",
          check: { stat: "awareness", bonus: (G) => 10 + (G.flag("lisa_info") ? 15 : 0) },
          onSuccess: {
            effect: (G) => { G.setFlag("evidence"); G.mod("awareness", 4); },
            outcome: { type: "good", text: "창고 뒤 진창에 낯선 발자국 여럿. 마을 사람의 닳은 짚신이 아니라, 잘 만든 가죽 군화 자국이다. 창고 자물쇠 옆엔 긁힌 흔적. 누군가 안을 들여다봤다. 그것도 한 명이 아니다." },
            next: "decide_report",
          },
          onFail: {
            effect: (G) => { G.mod("awareness", 2); },
            outcome: { type: "neutral", text: "분명 거슬리는데 정체를 잡지 못한다. 불길함만 명치에 얹힌다. 그래도 이 감각이 틀린 적은 없었다. 무언가 다가오고 있다." },
            next: "decide_report",
          },
        },
      ],
    },

    decide_report: {
      title: "고할 것인가",
      text: (G) => {
        const arr = [
          { t: "narr", c: "결정해야 한다. 이름 없이 떠돌던 시절, 괜한 참견은 늘 매질로 돌아왔다. 입을 다무는 게 사는 길이었다. 그런데 이번만은 발이 떨어지지 않는다." },
        ];
        if (G.flag("evidence")) {
          arr.push({ t: "think", c: "낯선 발자국에 긁힌 자물쇠. 증거는 분명하다. 창고를 노리는 자들이 있고, 며칠 안에 일이 터진다." });
        } else {
          arr.push({ t: "think", c: "손에 쥔 건 없다. 그저 목덜미가 싸늘할 뿐. 이 느낌 하나로 사람을 움직일 수 있을까." });
        }
        return arr;
      },
      choices: [
        {
          text: "경비대장 브람에게 알린다.",
          next: "warn_bram",
        },
        {
          text: "밤에 직접 창고를 더 살핀다.",
          tag: "위험", tagType: "risk",
          check: { stat: "awareness", bonus: 5 },
          onSuccess: {
            effect: (G) => { G.setFlag("evidence"); G.setFlag("scouted"); G.mod("awareness", 5); },
            outcome: { type: "good", text: "달도 없는 밤, 진창에 배를 깔고 기다린다. 새벽녘, 그림자 셋이 창고를 돌며 자물쇠와 목책의 약한 곳을 표시한다. 외부인이다. 내일이나 모레, 분명히 온다. 이제 확신이 섰다." },
            next: "warn_bram",
          },
          onFail: {
            effect: (G) => { G.mod("health", -14); G.setFlag("evidence"); },
            outcome: { type: "bad", text: "어둠을 더듬다 누군가의 발을 밟았다. 둔기가 옆구리를 후려친다. 가까스로 굴러 빠져나왔지만 갈비뼈가 나간 것 같다. 대신 놈들의 얼굴만은 똑똑히 봤다." },
            next: "warn_bram",
          },
        },
        {
          text: "입을 다문다. 괜한 참견은 화를 부른다.",
          effect: (G) => { G.setFlag("stayed_silent"); },
          outcome: { type: "neutral", text: "빗자루를 챙겨 슬그머니 자리를 뜬다. 밑바닥에서 배운 본능이 속삭인다. 이름 없는 것은 끼어들지 않는 법이라고. 그래도 등 뒤의 서늘함은 좀처럼 가시지 않았다." },
          next: "raid_unprepared",
        },
      ],
    },

    warn_bram: {
      title: "고변(告變)",
      art: "port-bram",
      text: [
        { t: "narr", c: "브람 앞에 선다. 옆에서 몰트가 코웃음을 친다." },
        { t: "speak", c: "로완: “창고가 털립니다. 외지에서 온 자들이 자물쇠와 목책을 살피고 갔습니다.”" },
        { t: "narr", c: "브람의 지친 눈이 가늘어진다. 당신을 믿을 이유는 없다. 도랑 잡것의 말 한마디로 병사를 움직일 수는 없는 노릇이다." },
      ],
      choices: [
        {
          text: "본 것을 차분히, 구체적으로 설명한다.",
          tag: "설득 판정", tagType: "info",
          check: {
            stat: "awareness",
            bonus: (G) => {
              let b = 5;
              if (G.flag("evidence")) b += 25;
              if (G.flag("scouted")) b += 15;
              if (G.s.stats.reputation > 5) b += 5;
              return b;
            },
          },
          onSuccess: {
            effect: (G) => { G.setFlag("bram_convinced"); G.mod("reputation", 6); G.mod("awareness", 2); },
            outcome: { type: "good", text: "“가죽 군화 자국, 자물쇠 옆 긁힌 자리, 새벽에 어른대던 그림자 셋입니다.” 막연한 짐작이 아니라 두 눈으로 본 것을 짚어내자 브람의 표정이 굳는다. “네 말이 맞다면, 대비를 해 둬야겠지.” 그가 처음으로 당신을 사람 보듯 마주 본다." },
            next: "raid_prepared",
          },
          onFail: {
            effect: (G) => { G.mod("reputation", -1); },
            outcome: { type: "bad", text: "확신 없는 말에는 힘이 실리지 않는다. 브람이 한숨을 쉰다. “느낌이라니. 바쁘다, 가서 네 일이나 봐.” 몰트가 낄낄댄다. 그래도 브람의 눈 한구석엔 작은 의심 한 톨이 남았다." },
            next: "raid_semi",
          },
        },
        {
          text: "그냥 물러난다.",
          effect: (G) => { G.setFlag("stayed_silent"); },
          next: "raid_unprepared",
        },
      ],
    },

    /* ---------- 식량창고 습격 ---------- */
    raid_prepared: {
      title: "습격",
      bg: "bg-battlefield-night",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", -6); },
      text: [
        { t: "narr", c: "이튿날 밤. 브람은 미리 병사 넷을 창고 그늘에 숨겼다. 자정이 지나자, 목책 너머에서 그림자들이 미끄러져 든다. 도적이라기엔 너무 조직적이다. 인신매매단의 무리." },
        { t: "danger", c: "“놈들이다!” 브람의 신호와 함께 횃불이 일제히 타오른다." },
        { t: "narr", c: "아수라장 속에서도 당신의 눈은 판 전체를 훑는다. 병사들과 맞붙는 무리 너머로, 한 패가 슬그머니 빠져나간다. 창고가 아니라 아이들이 모여 자는 헛간 쪽이다." },
      ],
      choices: [
        {
          text: "헛간으로 새는 무리를 브람에게 외친다.",
          tag: "눈치 판정", tagType: "info",
          check: { stat: "awareness", bonus: 25 },
          onSuccess: {
            effect: (G) => { G.setFlag("saved_children"); G.mod("reputation", 12); G.mod("awareness", 4); },
            outcome: { type: "good", text: "“헛간! 진짜 노리는 건 애들이다!” 당신의 외침에 브람이 곧장 둘을 돌려세운다. 문턱에서 매매단의 손이 아이의 멱살을 낚아채기 직전, 창대가 그 팔을 부러뜨린다. 놈들이 진짜 탐낸 건 곡식이 아니라 아이들이었다. 그걸 알아챈 건 당신뿐이었다." },
            next: "raid_resolve",
          },
          onFail: {
            effect: (G) => { G.mod("health", -10); G.mod("reputation", 4); },
            outcome: { type: "bad", text: "당신은 직접 뛰어들지만 한발 늦었다. 아이 둘이 자루에 담겨 사라졌다. 나머지는 막았지만, 빈자리가 명치를 짓누른다. 그래도 더 큰 참사는 막았다." },
            next: "raid_resolve",
          },
        },
        {
          text: "정면의 싸움에 가세한다.",
          effect: (G) => { G.mod("health", -12); G.mod("reputation", 3); G.setFlag("kids_taken"); },
          outcome: { type: "bad", text: "창대를 휘둘러 한 놈을 거꾸러뜨린다. 무장한 병사로서 거둔 첫 전과다. 그러나 그사이 헛간 쪽에서 비명이 터진다. 아이 몇이 끌려간 것이다. 앞만 노려보는 자는 늘 옆구리를 내준다." },
          next: "raid_resolve",
        },
      ],
    },

    raid_semi: {
      title: "습격",
      bg: "bg-battlefield-night",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", -6); },
      text: [
        { t: "narr", c: "브람은 당신의 말을 흘려들었지만, 완전히 무시하지도 못했다. 그날 밤, 그는 평소보다 한 명을 더 깨워 두었다." },
        { t: "danger", c: "자정 무렵, 목책이 소리 없이 넘어가고 그림자들이 창고로 든다. 잠든 마을이 늦게야 깨어난다." },
        { t: "narr", c: "당신은 빗자루 대신 부러진 창대를 쥐고 달려 나간다. 혼란 속에서 무리 일부가 헛간으로 빠지는 게 보인다." },
      ],
      choices: [
        {
          text: "직접 헛간을 막아선다.",
          tag: "위험", tagType: "risk",
          check: { stat: "awareness", bonus: 15 },
          onSuccess: {
            effect: (G) => { G.setFlag("saved_children"); G.mod("reputation", 10); G.mod("health", -6); },
            outcome: { type: "good", text: "헛간 문턱을 막아서고 창대를 비스듬히 세운다. 좁은 길목에서는 머릿수가 소용없다. 전생에 어깨너머로 익힌 봉 다루는 감각이 손끝에 되살아난다. 비명을 듣고 병사들이 달려올 때까지, 당신은 버텼다." },
            next: "raid_resolve",
          },
          onFail: {
            effect: (G) => { G.mod("health", -16); G.mod("reputation", 5); G.setFlag("kids_taken"); },
            outcome: { type: "bad", text: "혼자서는 무리였다. 두들겨 맞고 쓰러진다. 끌려가던 아이 하나는 구했지만, 나머지는 어둠 속으로 사라졌다. 입술에서 피 맛이 난다." },
            next: "raid_resolve",
          },
        },
      ],
    },

    raid_unprepared: {
      title: "준비 없는 밤",
      bg: "bg-battlefield-night",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", -6); },
      text: [
        { t: "danger", c: "사흘 뒤 자정. 비명으로 잠이 깬다. 횃불, 연기, 무너지는 목책. 아무도 대비하지 않았다. 식량창고가 불타고, 헛간에서는 아이들이 끌려간다." },
        { t: "think", c: "…알고 있었다. 입을 다물어서, 이 꼴이 났다. 무적자는 끼어들지 않는다고? 그 대가가 이거다." },
        { t: "narr", c: "당신은 부러진 창대를 쥐고 어둠 속으로 뛰어든다. 너무 늦었지만, 아무것도 안 할 수는 없다." },
      ],
      choices: [
        {
          text: "혼란 속에서 한 명이라도 구한다.",
          tag: "위험", tagType: "risk",
          check: { stat: "awareness", bonus: 5 },
          onSuccess: {
            effect: (G) => { G.mod("health", -12); G.mod("reputation", 4); G.setFlag("kids_taken"); },
            outcome: { type: "bad", text: "연기 속을 기어 들어가, 자루에 담기던 아이 하나를 끌어낸다. 딱 하나. 나머지는 손을 쓰지 못했다. 마을은 그날의 손실을 당신 탓으로 돌리지 않았지만, 막을 수 있었다는 사실만은 당신 자신이 안다." },
            next: "raid_resolve",
          },
          onFail: {
            effect: (G) => { G.mod("health", -22); G.setFlag("kids_taken"); },
            outcome: { type: "bad", text: "어둠과 불길 속에서 방향을 잃는다. 둔기가 뒤통수를 후린다. 정신이 끊기기 직전, 끌려가는 아이들의 울음만 점점 멀어졌다. 당신이 살아남은 건 순전히 운이었다." },
            next: "raid_resolve",
          },
        },
      ],
    },

    raid_resolve: {
      title: "잿더미 아침",
      art: "port-bram",
      text: (G) => {
        const arr = [
          { t: "narr", c: "동이 튼다. 매캐한 연기 사이로 마을이 피해를 셈한다." },
        ];
        if (G.flag("saved_children")) {
          arr.push({ t: "narr", c: "창고도 지켰고 아이들도 무사하다. 그을음 묻은 얼굴로 브람이 당신 앞에 선다. 어제와는 다른 눈빛이다." });
          arr.push({ t: "speak", c: "브람: “네가 옳았다. 너 아니었으면 헛간이 통째로 비었어. 칼은 못 쓰는 놈이, 희한하게 죽을 자리는 먼저 보는군.”" });
        } else if (G.flag("kids_taken")) {
          arr.push({ t: "narr", c: "창고는 절반이 탔고, 아이 몇은 끝내 돌아오지 못했다. 무거운 침묵이 내려앉았지만, 브람은 당신을 기억해 두었다." });
          arr.push({ t: "speak", c: "브람: “넌 도망치진 않았어. 그거면 됐다. 다음엔 더 빨리 봐라. 넌 그게 되는 놈 같으니까.”" });
        } else {
          arr.push({ t: "narr", c: "당신의 경고 덕에 최악은 면했다. 브람이 당신을 돌아본다." });
          arr.push({ t: "speak", c: "브람: “도랑 잡것치곤 눈이 밝아. 쓸 만하다는 소리다.”" });
        }
        return arr;
      },
      choices: [
        { text: "브람의 말을 듣는다.", continue: true, next: "first_reward" },
      ],
    },

    /* ---------- 첫 보상: 빵, 이름 ---------- */
    first_reward: {
      title: "빵 한 덩이와 이름 한 줄",
      art: "port-bram",
      onEnter: (G) => {
        G.mod("hunger", 20); G.addRation(1); G.addSupply("bread", 1); G.give("boots");
        G.addCoins(10); G.mod("reputation", 5); G.setStatus("경비대 말단");
      },
      text: [
        { t: "narr", c: "브람이 검은 빵 한 덩이와 배급권 한 장, 그리고 누군가 신다 버린 낡은 장화를 툭 던진다. 도랑 너머에선 평생 만져보지 못할 재산이다." },
        { t: "speak", c: "브람: “오늘부터 막일꾼이 아니라 말단 병졸로 친다. 죽 말고 빵이 나와. 그리고 하나 더.”" },
        { t: "narr", c: "그가 기름때 전 장부를 펼쳐 거칠게 한 줄을 적어 넣는다." },
        { t: "speak", c: "브람: “로완. 진흙골. 경비병. 이제 네 이름이 적혔다. 죽어도 장부에 한 줄은 남는다는 뜻이지.”" },
        { t: "think", c: "이름이라. 전생에도 이번 생에도 처음 가져보는 것이었다. 이 세상에서 장부에 이름이 오른다는 건, 비로소 사람으로 친다는 뜻이다." },
      ],
      choices: [
        { text: "장화를 신는다. 발이 따뜻하다.", effect: (G) => { G.give("ledger"); }, continue: true, next: "village_hub" },
      ],
    },

    /* ---------- 마을 허브: 상점 · 주점 · 여관 · 광장 ---------- */
    village_hub: {
      title: "회색보리 마을 — 장날",
      location: "회색보리 마을",
      bg: "bg-market",
      text: (G) => {
        const arr = [
          { t: "narr", c: "오랜만에 장이 섰다. 보잘것없는 공터지만, 오늘만은 제법 사람 사는 냄새가 난다. 순무를 쌓아둔 좌판, 절인 생선 통, 헌 옷가지를 늘어놓은 노파. 어딘가에서 싸구려 술 냄새와 누군가의 노랫가락이 흘러나온다." },
          { t: "narr", c: "처음으로 주머니에 동전이 짤랑인다. 무적자였을 땐 구경도 못 하던 무게다." },
          { t: "sys", c: "지금 가진 동전: " + G.s.coins + "닢. 떠나기 전에 둘러볼 수 있다." },
        ];
        return arr;
      },
      choices: [
        { text: "잡화상 좌판으로 간다. (물건 구입)", next: "shop" },
        { text: "주점 「깨진 술통」에 들른다.", next: "tavern" },
        { text: "여관 「잿빛 보리」로 간다.", next: "inn" },
        { text: "광장 사람들 사이를 거닌다.", next: "square" },
        {
          text: "허드렛일을 거들고 동전을 번다. (반나절)",
          enabled: (G) => (G.s.flags.oddjobs || 0) < 3,
          lockedText: "오늘 일감은 동났다",
          effect: (G) => {
            G.s.flags.oddjobs = (G.s.flags.oddjobs || 0) + 1;
            G.addCoins(5); G.mod("hunger", -8);
            G.toast("짐을 나르고 물을 긷는다. +5닢");
          },
          outcome: { type: "neutral", text: "장꾼들의 짐을 나르고 우물물을 길어준다. 허리가 끊어질 듯하지만, 손바닥에 동전 다섯 닢이 떨어진다. 푼돈이라도, 스스로 번 첫 돈이다. 다만 장날에 거들 일이 무한정 있는 건 아니다." },
          next: "village_hub",
        },
        { text: "이만 마을 방어 준비로 돌아간다.", continue: true, next: "interlude" },
      ],
    },

    shop: {
      title: "잡화상 좌판",
      bg: "bg-market",
      text: [
        { t: "narr", c: "곰보 자국이 있는 잡화상이 이 빠진 저울을 두드린다." },
        { t: "speak", c: "잡화상: “싸게 주는 거야. 요샌 북쪽에서 사람이 자꾸 넘어와서 뭐든 동난다고. 살 거면 빨리 골라.”" },
      ],
      choices: (G) => {
        const buy = (label, price, fn) => ({
          text: label + " — " + price + "닢",
          enabled: (g) => g.s.coins >= price,
          lockedText: "동전 부족",
          effect: (g) => { if (g.spend(price)) fn(g); },
          outcome: { type: "good", text: "값을 치르고 물건을 챙긴다." },
          next: "shop",
        });
        const list = [
          buy("검은 빵", 3, (g) => g.addSupply("bread", 1)),
          buy("말린 고기", 4, (g) => g.addSupply("jerky", 1)),
          buy("약초 꾸러미", 6, (g) => g.addSupply("herbs", 1)),
          buy("붕대", 4, (g) => g.addSupply("bandage", 1)),
          buy("기름 횃불", 5, (g) => g.addSupply("oiled_torch", 1)),
        ];
        if (!G.has("jerkin")) list.push(buy("낡은 가죽 흉갑 (받는 피해 감소)", 18, (g) => g.give("jerkin")));
        if (!G.has("whetstone")) list.push(buy("숫돌 (주는 피해 증가)", 12, (g) => g.give("whetstone")));
        list.push({ text: "좌판을 떠난다.", next: "village_hub" });
        return list;
      },
    },

    tavern: {
      title: "주점 「깨진 술통」",
      bg: "bg-tavern",
      text: [
        { t: "narr", c: "그을린 들보에 매달린 등잔, 시큼한 맥주 냄새, 젖은 톱밥이 깔린 바닥. 변경의 주점은 화려할 것도 없지만, 여기엔 마을 어디에도 없는 것이 있다. 사람들의 입이다." },
      ],
      choices: [
        {
          text: "맥주 한 잔. (2닢)",
          enabled: (G) => G.s.coins >= 2,
          lockedText: "동전 부족",
          effect: (G) => { if (G.spend(2)) { G.mod("hunger", 5); G.mod("health", 4); } },
          outcome: { type: "neutral", text: "미지근하고 시큼한 맥주가 목을 적신다. 옆자리 사내가 떠든다. “북부 요새선이 또 한 자락 무너졌다더군. 성자님이 막고 계신다는데, 그 말을 누가 믿어.” 술잔 너머로 세상이 조금 보인다." },
          next: "tavern",
        },
        {
          text: "단골들에게서 마을 사정을 캐낸다. (5닢)",
          enabled: (G) => G.s.coins >= 5,
          lockedText: "동전 부족",
          effect: (G) => { if (G.spend(5)) { G.setFlag("tavern_intel"); G.mod("awareness", 3); } },
          outcome: { type: "good", text: "술 몇 잔을 돌리자 입이 풀린다. “피난민 틈에 도적이 섞여 들었어. 곧 마을을 칠 거란 말이 돌아. 그것도 정문이 아니라 뒤쪽 무너진 목책으로.” 값진 정보다. 방어전에서 한 발 앞설 수 있겠다. (방어전에 도움)" },
          next: "tavern",
        },
        {
          text: "구석의 늙은 용병에게 옛 전쟁 이야기를 청한다. (무료)",
          show: (G) => !G.flag("heard_war"),
          effect: (G) => { G.setFlag("heard_war"); G.mod("awareness", 2); },
          outcome: { type: "neutral", text: "외팔의 늙은 용병이 잔을 비우고 입을 연다. “20년 전 흑성이 뜬 그 밤을 기억해. 그날 이후로 겨울이 길어졌고, 죽은 것들이 잘 안 썩더군. 위에선 다 괜찮다 하지만… 괜찮은 적이 없었어.” 세상의 균열이 그의 빈 소매에 담겨 있다." },
          next: "tavern",
        },
        {
          text: "주사위 노름에 낀다. (3닢)",
          enabled: (G) => G.s.coins >= 3,
          lockedText: "동전 부족",
          effect: (G) => {
            if (!G.spend(3)) return;
            if (G.rand(1, 2) === 1) { G.addCoins(5); G.toast("주사위가 맞았다! +5닢"); }
            else { G.toast("판돈을 날렸다."); }
          },
          outcome: { type: "neutral", text: "기름때 묻은 주사위가 탁자 위를 구른다. 거지 시절에도 노름판 눈치 하나는 기가 막혔지만, 운이란 늘 변덕스럽다." },
          next: "tavern",
        },
        { text: "주점을 나선다.", next: "village_hub" },
      ],
    },

    inn: {
      title: "여관 「잿빛 보리」",
      bg: "bg-inn",
      text: [
        { t: "narr", c: "삐걱이는 이층 목조 여관. 난로에서 장작이 타고, 위층에서는 누군가의 코 고는 소리가 새어 나온다. 따뜻함을 돈 주고 산다는 것 자체가, 무적자였던 로완에겐 낯선 사치다." },
      ],
      choices: [
        {
          text: "방을 잡고 푹 잔다. (4닢)",
          enabled: (G) => G.s.coins >= 4,
          lockedText: "동전 부족",
          effect: (G) => { if (G.spend(4)) { G.mod("health", 22); G.mod("hunger", 12); G.nextDay(); } },
          outcome: { type: "good", text: "오랜만에 지붕 아래, 짚이 아닌 침상에서 잔다. 꿈속에서 진흙골의 도랑이 보였다. 굶주린 아이들의 얼굴, 늙은 마라의 죽 한 그릇. 눈을 뜨니 몸이 한결 가볍다. 그러나 그곳은 여전히 그의 일부였다." },
          next: "village_hub",
        },
        {
          text: "난롯가에서 잠깐 몸을 녹인다. (무료, 1회)",
          enabled: (G) => !G.flag("warmed_fire"),
          lockedText: "여관 주인의 눈치가 보인다",
          effect: (G) => { G.setFlag("warmed_fire"); G.mod("health", 6); },
          outcome: { type: "neutral", text: "불 곁에 쪼그려 언 손을 녹인다. 돈 한 푼 안 들이고도, 잠시나마 사람대접을 받는 기분이다. 하지만 여관 주인이 슬슬 눈치를 준다. 공짜 온기에도 끝은 있다." },
          next: "inn",
        },
        { text: "여관을 나선다.", next: "village_hub" },
      ],
    },

    square: {
      title: "장터의 사람들",
      text: [
        { t: "narr", c: "장터에는 온갖 인생이 뒤엉켜 있다. 헐벗은 피난민 가족, 목청 높여 외치는 태양교단의 떠돌이 사제, 줄 끊긴 류트를 퉁기는 음유시인, 그리고 구석에서 콜록이는 병든 아이. 살아 있는 것들의 소란이 추위를 조금 밀어낸다." },
      ],
      choices: [
        {
          text: "피난민 가족에게 동전 한 닢을 쥐여준다.",
          show: (G) => !G.flag("gave_refugee"),
          enabled: (G) => G.s.coins >= 1,
          lockedText: "동전 부족",
          effect: (G) => { if (G.spend(1)) { G.setFlag("gave_refugee"); G.mod("reputation", 3); } },
          outcome: { type: "good", text: "동전 한 닢. 누군가에겐 푼돈이지만, 굶주린 가족에겐 하루치 목숨이다. 어미가 말없이 고개를 숙인다. 받는 쪽의 마음을, 당신은 너무 잘 안다." },
          next: "square",
        },
        {
          text: "사제의 설교에 귀를 기울인다.",
          show: (G) => !G.flag("heard_sermon"),
          effect: (G) => { G.setFlag("heard_sermon"); G.mod("awareness", 2); },
          outcome: { type: "neutral", text: "“첫 빛은 우리를 버리지 않으셨습니다! 흑성은 우리 신앙을 시험하는 그림자일 뿐!” 사제는 열변을 토하지만, 듣는 이들의 눈은 공허하다. 굶주린 자에게 기도는 빵이 되지 못한다. 그래도 교단이 무엇을 감추려 애쓰는지는 어렴풋이 읽힌다." },
          next: "square",
        },
        {
          text: "음유시인의 노래를 듣는다.",
          show: (G) => !G.flag("heard_bard"),
          effect: (G) => { G.setFlag("heard_bard"); G.mod("health", 3); },
          outcome: { type: "neutral", text: "줄 하나가 끊긴 류트로, 음유시인은 옛 제국의 영광을 노래한다. 이제는 아무도 본 적 없는 황금시대를. 거짓말인 줄 알면서도, 잠시 추위가 가신다. 노래란 원래 그런 것이다." },
          next: "square",
        },
        {
          text: "병든 아이에게 물자를 나눠준다.",
          show: (G) => !G.flag("helped_sick") && (G.supplyCount("herbs") > 0 || G.supplyCount("bread") > 0),
          effect: (G) => {
            G.setFlag("helped_sick"); G.mod("reputation", 4);
            if (G.supplyCount("herbs") > 0) { G.s.supplies.herbs -= 1; if (G.s.supplies.herbs <= 0) delete G.s.supplies.herbs; }
            else { G.s.supplies.bread -= 1; if (G.s.supplies.bread <= 0) delete G.s.supplies.bread; }
          },
          outcome: { type: "good", text: "콜록이는 아이에게 가진 것을 나눈다. 아이 어미가 떨리는 손으로 받아 든다. 청연도, 로완도, 이런 손길 하나에 겨우 목숨을 이어왔다. 빚을 갚는 셈 치자." },
          next: "square",
        },
        { text: "장터를 빠져나온다.", next: "village_hub" },
      ],
    },

    interlude: {
      title: "겨울의 한복판",
      art: "port-yona",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", -4); },
      text: [
        { t: "narr", c: "며칠이 지난다. 창 잡는 법을 배우고, 신참 요나와 같은 열에 선다. 요나는 처음엔 도랑 출신이라며 비웃었지만, 습격이 있던 밤 이후로는 그 입을 다물었다." },
        { t: "speak", c: "요나: “너 같은 놈이랑 한 줄에 서다니, 세상 진짜 망했어.” 투덜대면서도 요나는 당신 곁을 떠나지 않는다." },
        { t: "narr", c: "평온은 길지 않았다. 북쪽에서 밀려온 피난민들이 마을 밖에 진을 치고, 그 뒤를 따라온 굶주린 늑대떼와 도적이 어둠 속에서 마을을 노린다. 밤하늘의 검은 별도 어느새 조금 더 또렷해져 있었다." },
        { t: "danger", c: "겨울 깊은 밤, 비상종이 울린다. 마을 방어전이 시작됐다." },
      ],
      choices: [
        { text: "창을 쥐고 감시탑으로 달려간다.", continue: true, next: "defense" },
      ],
    },

    /* ---------- 1페이즈 결말: 마을 방어전 ---------- */
    defense: {
      title: "감시탑의 밤",
      bg: "bg-battlefield-night",
      onEnter: (G) => { G.give("spear"); G.setStatus("경비병"); },
      text: [
        { t: "narr", c: "감시탑 위. 아래에선 도적과 늑대떼가 정문을 두드리고, 경비대 전원이 그쪽으로 쏠린다. 정문의 함성이 밤공기를 찢는다." },
        { t: "narr", c: "창을 쥐고 정문으로 달려가려다, 발을 멈춘다. 또 그 싸늘한 감각이 목덜미를 훑는다. 모두가 정문만 보고 있다. 하나같이." },
        { t: "think", c: "정문이 지나치게 시끄럽다. 정말 여길 뚫을 작정이라면 이렇게 요란을 떨 리 없다. 시선을 끄는 거다. 그럼 진짜는 어디로 들어오지." },
      ],
      choices: [
        {
          text: "정문으로 가지 않고, 어둠에 잠긴 마을 뒤편을 살핀다.",
          tag: "눈치 판정", tagType: "info",
          check: { stat: "awareness", bonus: (G) => 25 + (G.flag("tavern_intel") ? 12 : 0) },
          onSuccess: {
            effect: (G) => { G.setFlag("defense_win"); G.mod("reputation", 18); G.mod("awareness", 5); },
            outcome: { type: "good", text: "어둠에 잠긴 마을 뒤편, 무너진 목책 틈으로 그림자 한 무리가 소리 없이 스며든다. 정문은 미끼였다. 당신은 비상종을 미친 듯이 두드리고, 좁은 골목으로 그들을 몰아넣는다. 죽을 자리를 피하고 적을 가두는 법, 뒷골목에서 굴러본 자만 아는 수법이다. 우회 침입은 그 골목에서 끊겼다." },
            next: "phase1_end",
          },
          onFail: {
            effect: (G) => { G.mod("health", -18); G.setFlag("defense_partial"); G.mod("reputation", 8); },
            outcome: { type: "bad", text: "뒤편으로 달렸지만 우회한 무리는 이미 안으로 들어선 뒤였다. 좁은 골목에서 홀로 셋을 막아선다. 창대가 부러지고 피가 흘러도 비상종만은 끝까지 두드렸다. 달려온 경비대가 가까스로 막아냈다. 외침이 한 박자 늦었을 뿐, 마을은 살았다." },
            next: "phase1_end",
          },
        },
        {
          text: "동료들과 함께 정문을 지킨다.",
          effect: (G) => { G.mod("health", -10); G.mod("reputation", 4); G.setFlag("defense_front"); },
          outcome: { type: "bad", text: "정문에서 용감히 싸운다. 그러나 동틀 무렵, 마을 뒤편 가옥 몇 채가 잿더미가 된 게 드러난다. 적의 본대는 그쪽으로 들이쳤던 것이다. 앞만 본 대가였다. 그래도 마을은 가까스로 살아남았다." },
          next: "phase1_end",
        },
      ],
    },

    phase1_end: {
      title: "살아남은 놈",
      art: "port-bram",
      onEnter: (G) => { G.mod("hunger", 10); G.addRation(2); G.mod("health", 10); },
      text: (G) => {
        const arr = [
          { t: "narr", c: "아침이 온다. 마을은 그을렸지만, 서 있다. 사람들이 죽은 자를 묻고, 산 자를 센다." },
        ];
        if (G.flag("defense_win")) {
          arr.push({ t: "narr", c: "경비대 전원이 정문에 묶여 있던 사이, 마을을 통째로 내줄 뻔한 우회 침입을 막아낸 건 당신 하나였다. 그 사실을 마을 전체가 안다." });
          arr.push({ t: "speak", c: "브람: “네가 감시탑을 안 버렸으면 우린 등 뒤에서 몰살당했어. 칼은 못 쓰는 놈이, 죽을 자리는 누구보다 먼저 보는군.”" });
        } else {
          arr.push({ t: "narr", c: "완벽하진 못했고 피해도 있었다. 그래도 당신이 한 박자 먼저 위험을 알아챈 덕에, 마을은 몰살만은 면했다." });
          arr.push({ t: "speak", c: "브람: “명예로운 병사는 못 된다. 그래도 넌 살아남았고, 사람들을 살렸어. 그거면 됐다.”" });
        }
        arr.push({ t: "narr", c: "브람이 다시 장부를 편다. 이번엔 갈겨쓰지 않고, 한 자 한 자 또박또박." });
        arr.push({ t: "speak", c: "브람: “로완. 정식 경비병으로 올린다. 남작령에 올리는 보고에도 '징집 대상'이 아니라 '쓸 만한 병사'라 적겠다.”" });
        arr.push({ t: "think", c: "그날 깨달았다. 이 세상에서 빵 한 덩이는 목숨이고, 이름 한 줄은 신분이라는 걸. 그리고 지금, 그 둘을 다 손에 쥐었다." });
        return arr;
      },
      choices: [
        { text: "장부에 적히는 자신의 이름을 본다.", effect: (G) => { G.setStatus("정식 경비병"); }, continue: true, next: "phase1_epilogue" },
      ],
    },

    phase1_epilogue: {
      title: "— 1페이즈 종료 —",
      submit: { result: "1페이즈 클리어" },
      text: (G) => {
        const score = G.s.stats.reputation;
        const arr = [
          { t: "sys", c: "【 1부: 빵 한 덩이와 창 한 자루 — 1페이즈 「진흙골의 아이」 클리어 】" },
          { t: "narr", c: "이름 한 줄 없던 도랑의 아이가, 이제 장부에 이름을 올린 정식 경비병이 되었다. 강해서 올라선 게 아니다. 그저 위험을 남보다 먼저 보았고, 그 자리에서 도망치지 않았을 뿐이다." },
          { t: "sys", c: "최종 평판 " + score + " · 생존 일수 " + G.s.day + "일 · 눈치 " + G.s.stats.awareness },
        ];
        if (G.flag("saved_children")) arr.push({ t: "sys", c: "기록: 인신매매단의 손에서 빈민촌 아이들을 구해냈다." });
        if (G.flag("defense_win")) arr.push({ t: "sys", c: "기록: 우회 침입을 홀로 간파해 마을을 구했다. '죽을 자리를 먼저 보는 놈'이라는 평판을 얻었다." });
        arr.push({ t: "think", c: "다음은 남작의 성채다. 촌놈 병졸에서 제대로 된 무장병으로. 그건 또 다른 겨울에 쓰일 이야기다." });
        return arr;
      },
      choices: [
        { text: "남작령의 차출 명령서를 받는다. (2페이즈 →)", continue: true, next: "p2_intro" },
        { text: "여기까지의 여정을 되새긴다. (타이틀로)", action: "title" },
      ],
    },

    /* =====================================================
       2부 진입 — 1부 2페이즈 「남작의 개」
       ===================================================== */
    p2_intro: {
      title: "남작의 개",
      phase: "1부 2페이즈",
      location: "하윈 성채",
      status: "남작 근위대 대원",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", -6); },
      text: [
        { t: "sys", c: "【 1부 2페이즈 「남작의 개」 】" },
        { t: "narr", c: "'쓸 만한 병사'라는 한 줄짜리 보고가 위로 올라갔다. 그 덕에 로완은 요나와 함께 하윈 남작령의 작은 성채로 차출되었다." },
        { t: "narr", c: "돌담은 군데군데 갈라졌고 말은 모자라며 병사들 장비는 제각각이다. 그래도 도랑과 회색보리에 견주면, 이곳은 권력의 한복판이나 마찬가지다." },
        { t: "speak", c: "요나: “감시탑이나 지키던 놈이 남작님 성에 다 들어오네. 세상 망한 게 실감 난다. 뭐, 같이 굶는 것보단 낫지.”" },
        { t: "narr", c: "노병 가렌이 창 한 자루를 툭 던진다. 검도 명예도 아닌, 변경 병사의 무기다." },
        { t: "speak", c: "가렌: “검술은 기사 나리들 놀음이야. 너 같은 놈은 창을 잡아. 멀찍이서 찔러야 오래 산다.”" },
      ],
      choices: [
        { text: "창을 받아 쥔다.", effect: (G) => { G.give("spear"); G.setFlag("yona_ally"); }, continue: true, next: "p2_training" },
      ],
    },

    p2_training: {
      title: "창을 잡는 법",
      art: "port-garen",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", -5); },
      text: [
        { t: "narr", c: "성채 마당. 노병 가렌이 병사들을 줄 세운다. 갑옷 입은 자, 맨몸인 자, 신발도 짝짝이인 자. 변경 군대의 민낯이다." },
        { t: "speak", c: "가렌: “기사처럼 싸울 생각 마라. 너흰 기사가 아니야. 창은 멀리서, 두 발은 항상 도망갈 곳을 향해. 그게 너희가 내일도 밥 먹는 법이다.”" },
        { t: "narr", c: "훈련은 고되다. 창을 내지르고, 방패를 세우고, 진창에서 행군한다. 영양실조로 근골이 약한 로완에게는 더더욱." },
      ],
      choices: [
        {
          text: "이를 악물고 남들 두 배로 굴러, 몸에 새긴다.",
          tag: "비용", tagType: "cost",
          effect: (G) => { G.mod("health", -6); G.mod("reputation", 3); G.setFlag("drilled_hard"); },
          outcome: { type: "good", text: "당신은 쓰러질 때까지 창을 내지른다. 가렌이 곁눈질로 본다. “…독한 놈.” 몸은 부서질 듯하지만, 창대를 쥔 손이 비로소 ‘무기’를 기억하기 시작한다. (전투에 도움이 된다)" },
          next: "p2_castle",
        },
        {
          text: "힘을 아끼고, 가렌과 고참들의 ‘진짜 요령’을 훔쳐본다.",
          effect: (G) => { G.mod("awareness", 4); G.setFlag("watched_veterans"); },
          outcome: { type: "good", text: "당신은 따라 하는 시늉만 하면서, 오래 살아남은 고참들이 어떻게 힘을 아끼고 어디서 숨을 고르는지를 눈에 담는다. 정직한 노력보다 살아남은 자를 베끼는 편이 빠르다. 늘 그렇게 버텨왔다." },
          next: "p2_castle",
        },
        {
          text: "보급 천막과 마구간을 들락거리며 성채의 ‘배 속’을 익힌다.",
          effect: (G) => { G.mod("awareness", 3); G.setFlag("kitchen_eyes"); G.mod("hunger", 4); },
          outcome: { type: "neutral", text: "훈련을 적당히 빠진 대가로 가렌의 눈총을 받았지만, 당신은 성채의 식량·말·보급이 어떻게 도는지를 손바닥처럼 익혔다. 그리고 부엌에서 식은 빵 한 조각도 얻었다. 전쟁은 결국 배 속에서 진다." },
          next: "p2_castle",
        },
      ],
    },

    p2_castle: {
      title: "성채의 계급",
      art: "port-seria",
      onEnter: (G) => { G.mod("hunger", -5); G.nextDay(); },
      text: [
        { t: "narr", c: "성채라고 별수 없다. 결국 또 다른 먹이사슬이다. 기사는 종자를 부리고, 정규병은 잡병을 무시하고, 잡병은 도랑 출신을 짓밟는다. 글자도 명령 체계도 죄다 낯설다." },
        { t: "narr", c: "남작의 딸 세리아가, 명령서를 읽지 못해 쩔쩔매는 병사들을 한심하다는 듯 바라본다. 그 시선이 로완에게서 멎는다." },
        { t: "speak", c: "세리아: “너. 글자를 배워볼 생각 있나? 천하게 태어난 건 죄가 아니지만, 천하게 머무는 건 네 선택이다.”" },
      ],
      choices: [
        {
          text: "글자와 명령 체계를 배운다.",
          effect: (G) => { G.mod("awareness", 4); G.mod("reputation", 2); G.setFlag("literate"); },
          outcome: { type: "good", text: "밤마다 세리아에게 글자를 배운다. 머리는 빠르게 돌아간다. 명령서, 보급 장부, 전령의 표식까지 읽어내기 시작하자 전장이 전혀 다르게 보였다." },
          next: "p2_rival",
        },
        {
          text: "글자보다 사람을 읽는다. 하인과 마부에게 붙는다.",
          effect: (G) => { G.mod("awareness", 5); G.setFlag("kitchen_eyes"); },
          outcome: { type: "good", text: "마구간, 부엌, 빨래터. 낮은 자들의 입에서 성채의 진짜 사정이 새어 나온다. 누가 급료를 떼였고 어느 보급이 비었으며 어떤 기사가 겁쟁이인지. 밑바닥에서 갈고닦은 눈치가 그대로 자산이 된다." },
          next: "p2_rival",
        },
      ],
    },

    p2_rival: {
      title: "기사의 종자",
      onEnter: (G) => { G.mod("hunger", -4); },
      text: [
        { t: "narr", c: "우물가. 기사의 종자인 젊은 귀족 자제가 물통을 든 로완의 앞을 막는다. 광나는 가죽조끼, 혈통에 대한 자부심으로 빳빳한 목." },
        { t: "speak", c: "종자: “남작님이 진흙 거지까지 병사라 부르다니. 네깟 게 창을 잡으면, 그 창이 부끄러워하지 않겠어?”" },
        { t: "narr", c: "주변 병사들이 흘끔거린다. 여기서의 처신이 성채에서의 위치를 정한다." },
      ],
      choices: [
        {
          text: "고개 숙여 물통을 건넨다. 체면은 나중에 챙긴다.",
          effect: (G) => { G.mod("reputation", -1); G.mod("awareness", 2); },
          outcome: { type: "neutral", text: "순순히 물통을 바친다. 종자가 흡족하게 돌아선다. 굽신댄 값으로 평판은 깎였지만, 그가 우쭐대는 사이 당신은 그자가 칼자루 쥐는 법도 모르는 허세뿐인 애송이임을 읽어냈다." },
          next: "p2_castle2",
        },
        {
          text: "“창은 부끄러워 않습니다. 굶어본 손이 더 꽉 쥐니까.” 받아친다.",
          tag: "위험", tagType: "risk",
          effect: (G) => { G.mod("reputation", 3); G.setFlag("squire_grudge"); },
          outcome: { type: "bad", text: "종자의 얼굴이 벌게진다. “건방진!” 손을 치켜들지만, 마침 가렌이 헛기침을 하며 지나가는 통에 흐지부지 끝난다. 종자는 앙심을 품었다. 다만 지켜보던 병졸들은 도랑 출신의 그 배짱을 눈여겨봤다." },
          next: "p2_castle2",
        },
        {
          text: "약점을 읽어, 모두가 듣는 데서 그의 허세를 들춘다.",
          tag: "눈치 판정", tagType: "info",
          check: { stat: "awareness", bonus: 10 },
          onSuccess: {
            effect: (G) => { G.mod("reputation", 6); G.setFlag("squire_humbled"); },
            outcome: { type: "good", text: "“어제 야간 보초 때 늑대 울음에 사다리에서 굴러떨어지신 분이, 누구 창을 걱정합니까?” 정확한 한 방. 종자는 얼굴이 새빨개져 도망치고, 우물가에 웃음이 터진다. 천한 출신이 머리로 귀족을 이긴 첫 순간이다." },
            next: "p2_castle2",
          },
          onFail: {
            effect: (G) => { G.mod("health", -6); G.setFlag("squire_grudge"); },
            outcome: { type: "bad", text: "넘겨짚은 말이 빗나간다. 종자가 발끈해 당신을 밀쳐 진창에 처박는다. 망신만 샀다. 입은 때론 칼보다 위험하다." },
            next: "p2_castle2",
          },
        },
      ],
    },

    p2_castle2: {
      title: "수상한 정적",
      art: "port-edric-hawin",
      text: [
        { t: "narr", c: "며칠 후, 남작 에드릭 하윈이 병사들을 모은다. 마른 얼굴, 깊게 팬 눈가. 검소하지만 무능하진 않은 귀족이다." },
        { t: "speak", c: "하윈: “영지 외곽에 잿빛 늑대 무리가 돌고, 그 꽁무니에 도적이 따라붙는다. 네게 명예는 바라지 않아. 결과만 가져와라. 가서 길목을 정리해.”" },
        { t: "narr", c: "순찰 사흘째. 마른 풀밭에 들어서는 순간, 또 그 싸늘함이 목덜미를 훑는다. 바람에 짐승 냄새가 실려 오고, 사방은 거짓말처럼 고요하다." },
        { t: "think", c: "늑대는 무리로 사냥한다. 한 마리가 시선을 끄는 동안 나머지가 옆구리로 파고든다. 이미 둘러싸였다는 뜻이다." },
      ],
      choices: [
        {
          text: "횃불을 들고 등을 바위에 붙인다. 사각을 지운다.",
          tag: "눈치 판정", tagType: "info",
          check: { stat: "awareness", bonus: 20 },
          onSuccess: {
            effect: (G) => { G.setFlag("wolf_ready"); G.mod("awareness", 2); },
            outcome: { type: "good", text: "당신은 바위벽을 등지고 횃불을 세운다. 무리가 뒤로 돌 길이 막혔다. 늑대들은 불빛을 꺼린다. 유리한 자리를 먼저 잡았다. (전투에서 회피 보너스)" },
            next: "p2_wolves",
          },
          onFail: {
            outcome: { type: "bad", text: "자리를 잡기 전에 풀숲이 일제히 흔들린다. 늑대 떼가 사방에서 일어난다. 평지에서, 둘러싸인 채로 맞아야 한다." },
            next: "p2_wolves",
          },
        },
      ],
    },

    p2_wolves: {
      combat: {
        enemy: {
          name: "잿빛 늑대 무리",
          grade: "1등급 소형 · 무리",
          art: "mob-ashwolf",
          maxHp: 40,
          weakness: "두목의 목",
          intro: [
            { t: "danger", c: "붉은 눈 여섯 쌍이 풀숲에서 떠오른다. 두목으로 보이는 큰 놈이 앞에 선다." },
            { t: "think", c: "두목을 꺾으면 나머지는 흩어진다. 무리 사냥의 약점은, 무리를 묶는 한 마리다." },
          ],
          moves: [
            { type: "light", name: "측면 물기", dmg: 10, weight: 3 },
            { type: "heavy", name: "일제 강습", tell: "늑대들이 한 점으로 몰려든다 — 일제 강습 준비!", dmg: 22, weight: 2 },
            { type: "guarded", name: "두목이 으르렁대며 무리를 다잡는다", dmg: 3, weight: 2 },
          ],
        },
        baseDmg: 5,
        bonus: (G) => (G.flag("wolf_ready") ? 18 : 6) + (G.flag("drilled_hard") ? 6 : 0),
        allowFlee: true,
        onWin: {
          effect: (G) => { G.setFlag("wolves_won"); G.mod("reputation", 6); G.mod("awareness", 3); G.mod("health", 4); },
          outcome: { type: "good", text: "두목이 목을 꿰뚫린 채 쓰러지자, 나머지는 꼬리를 말고 흩어진다. 따라붙던 도적들도 그 광경을 보고 물러났다. 길목이 정리됐다." },
          next: "p2_wolves_after",
        },
        onLose: {
          effect: (G) => { G.setFlag("wolves_fled"); G.mod("reputation", 1); },
          outcome: { type: "neutral", text: "당신은 무리해서 싸우지 않았다. 횃불을 휘두르며 천천히 물러나, 좁은 바위틈으로 빠진다. 늑대는 좁은 길을 싫어한다. 토벌은 못 했지만, 살아 돌아왔다." },
          next: "p2_wolves_after",
        },
      },
    },

    p2_wolves_after: {
      title: "돌아온 순찰대",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", -4); },
      text: (G) => {
        const arr = [];
        if (G.flag("wolves_won")) {
          arr.push({ t: "narr", c: "당신은 늑대 두목의 가죽을 끌고 성채로 돌아온다. 가렌이 휘파람을 분다." });
          arr.push({ t: "speak", c: "가렌: “창 하나로 무리 두목을 잡아? …진흙골 놈, 오래 살겠다.”" });
        } else {
          arr.push({ t: "narr", c: "토벌은 다음으로 미뤄졌지만, 당신은 한 명도 잃지 않고 순찰대를 데려왔다. 변경에선 그것만으로도 드문 일이다." });
        }
        arr.push({ t: "narr", c: "그날 밤, 성채에 급보가 든다. 남작이 직접 호송대를 이끌고 자작령으로 향해야 한다 — 그리고 호송로에는 이미 매복의 그림자가 깔려 있다." });
        return arr;
      },
      choices: [
        { text: "호송대에 편성된다.", continue: true, next: "p2_escort" },
      ],
    },

    p2_escort: {
      title: "호송대",
      location: "하윈 영지 · 호송로",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", -5); },
      text: [
        { t: "narr", c: "좁은 골짜기 길. 남작과 기사들이 선두에, 보급마차가 후미에, 병졸들이 양옆을 따른다. 청연의 감각이 비명을 지른다 — 능선 위, 까마귀가 한 마리도 없다. 새가 없는 골짜기는, 이미 사람이 숨어 있다는 뜻이다." },
        { t: "danger", c: "“매복이다!” 외침과 동시에 화살이 쏟아진다. 도적과 탈영병의 무리. 기사들은 남작을 둘러싸고, 대열이 무너진다." },
        { t: "think", c: "다들 남작에게 달려간다. 귀족 하나 지키겠다고. 그런데 적이 진짜 노리는 게 그건가. 저들은 사람을 죽이러 온 게 아니다. 굶주린 자들이다. 그렇다면 저들이 원하는 건 따로 있다." },
      ],
      choices: [
        {
          text: "기사들을 따라 남작을 호위한다. (명예로운 선택)",
          effect: (G) => { G.mod("health", -10); G.setFlag("guarded_noble"); G.mod("reputation", -1); },
          outcome: { type: "bad", text: "당신은 남작 곁에서 용감히 싸운다. 남작은 무사하다. 하지만 후미의 보급마차가 통째로 약탈당하고, 후퇴로가 끊긴다. 식량과 화살을 잃은 호송대는, 자작령까지 굶주린 채 기어가야 한다." },
          next: "p2_escort_resolve",
        },
        {
          text: "보급마차와 후퇴로를 먼저 지킨다. (거지의 선택)",
          tag: "눈치 판정", tagType: "info",
          check: { stat: "awareness", bonus: 25 },
          onSuccess: {
            effect: (G) => { G.setFlag("saved_supply"); G.mod("reputation", 10); G.mod("awareness", 4); G.mod("health", -6); },
            outcome: { type: "good", text: "“마차 지켜! 굶으면 다 죽는다!” 당신은 병졸 몇을 끌고 후미로 달려, 좁은 길목에 마차를 세워 방벽으로 삼는다. 적의 진짜 목표였던 식량을 지켜냈고, 끊길 뻔한 후퇴로를 확보했다. 처음엔 비겁하다 욕먹었지만 — 호송대 전체가 살아 돌아왔다." },
            next: "p2_escort_resolve",
          },
          onFail: {
            effect: (G) => { G.mod("health", -14); G.setFlag("saved_supply"); G.mod("reputation", 5); },
            outcome: { type: "bad", text: "당신은 후미로 달렸다. 마차 절반은 지켰지만, 적의 둔기에 어깨를 내줬다. 그래도 후퇴로는 열어뒀다. 굶주린 채로나마, 호송대는 길을 빠져나간다." },
            next: "p2_escort_resolve",
          },
        },
      ],
    },

    p2_escort_resolve: {
      title: "쓸모 있는 병사",
      art: "port-edric-hawin",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", 8); G.addRation(2); G.mod("health", 8); G.addSupply("bread", 1); G.addCoins(14); },
      text: (G) => {
        const arr = [{ t: "narr", c: "자작령 성문이 보인다. 그을리고 피곤한 호송대가, 그래도 살아서 도착했다." }];
        if (G.flag("saved_supply")) {
          arr.push({ t: "narr", c: "남작 에드릭 하윈이 말에서 내려, 당신 앞에 선다. 그의 인정은 따뜻하지 않다. 그래서 더 무겁다." });
          arr.push({ t: "speak", c: "하윈: “다들 내게 달려올 때, 너는 마차로 달렸다. 비겁하다 욕하는 자도 있겠지. 그래도 네 덕에 한 명도 굶겨 죽이지 않았어.”" });
          arr.push({ t: "speak", c: "하윈: “명예로운 병사는 아니다. 그래도 쓸모 있는 병사야.”" });
          arr.push({ t: "think", c: "어지간한 칭찬보다 묵직했다. 명예는 배를 채워주지 않지만, '쓸모'는 다음 겨울을 보장한다." });
        } else {
          arr.push({ t: "narr", c: "남작은 무사했지만, 잃어버린 보급이 호송대를 굶주리게 했다. 그래도 당신은 끝까지 자리를 지켰다." });
          arr.push({ t: "speak", c: "하윈: “용감했다. 다만 다음엔 칼이 향하는 곳 말고, 적이 진짜 원하는 걸 봐라. 너는 그게 보이는 놈 같으니까.”" });
        }
        return arr;
      },
      choices: [
        { text: "남작의 말을 새긴다.", effect: (G) => { G.setStatus("정규 무장병"); G.mod("reputation", 3); }, continue: true, next: "p2_epilogue" },
      ],
    },

    p2_epilogue: {
      title: "— 2페이즈 종료 —",
      submit: { result: "2페이즈 클리어" },
      text: (G) => [
        { t: "sys", c: "【 1부 2페이즈 「남작의 개」 클리어 】" },
        { t: "narr", c: "촌놈 병사 로완은, 이제 남작이 이름을 기억하는 정규 무장병이 되었다. 기사처럼 싸워서가 아니다. 보급을 보고, 후퇴로를 보고, 낮은 사람들의 말에서 전장을 읽었기 때문이다." },
        { t: "sys", c: "평판 " + G.s.stats.reputation + " · 눈치 " + G.s.stats.awareness + " · 생존 " + G.s.day + "일" },
        { t: "think", c: "다음은 자작의 군영이다. 더 큰 군대, 더 많은 깃발. 그리고 그곳에서 나는 처음으로… 남을 지휘하게 된다." },
      ],
      choices: [
        { text: "남작령에 닥친 다음 겨울을 맞는다. (3페이즈 →)", continue: true, next: "p3_bridge" },
        { text: "타이틀로 돌아간다.", action: "title" },
      ],
    },

    /* =====================================================
       1부 3페이즈 「열 명의 목숨」 — 자작령 차출 → 석피 멧돼지 → 분대 지휘
       ===================================================== */
    p3_bridge: {
      title: "윗선의 부름",
      art: "port-edric-hawin",
      phase: "1부 3페이즈",
      location: "하윈 성채",
      status: "정규 무장병",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", -5); },
      text: (G) => {
        const arr = [
          { t: "sys", c: "【 1부 3페이즈 「열 명의 목숨」 】" },
          { t: "narr", c: "겨울이 더 깊어졌다. 그리고 변경의 봉건 질서가 삐걱이며 움직이기 시작한다 — 칼덴 자작이 휘하 봉신들에게 병력 공출을 명한 것이다. 북부 요새선이 또 한 자락 밀렸고, 피난민과 마물이 동시에 남하하고 있다는 소문이 돌았다." },
          { t: "narr", c: "하윈 남작은 가난한 봉신이다. 상위 봉신인 자작의 명을 거스를 수 없다. 그가 내놓을 수 있는 건 몇 안 되는 병사들. 그리고 호송 사건 보고서에는, 한 이름이 붉게 적혀 있었다." },
          { t: "speak", c: "하윈: “자작이 ‘쓸 만한 놈을 보내라’ 했다. 나는 너를 적었다, 로완. 영광인 줄 알아라 — 그리고 동시에, 이건 너를 버리는 패이기도 하다.”" },
          { t: "think", c: "버리는 패. 가난한 영주가 아까운 기사 대신, 천한 출신을 윗선에 바친다. 죽어도 손해가 적은 말(馬)을. …알고 있다. 무적자였을 때부터, 나는 늘 그런 말이었다." },
        ];
        if (G.flag("saved_supply")) {
          arr.push({ t: "speak", c: "세리아: “…아버지는 당신을 아까워하면서도 내놓네요. 살아 돌아와요. 글자를 가르친 값은 받아야겠으니까.”" });
        }
        return arr;
      },
      choices: [
        {
          text: "“가겠습니다.” 짐을 꾸린다. 요나도 함께 차출되었다.",
          effect: (G) => { G.setFlag("yona_ally"); },
          continue: true,
          next: "p3_arrival",
        },
        {
          text: "가렌 노병에게 마지막으로 조언을 청한다.",
          show: (G) => !G.flag("p3_garen_advice"),
          effect: (G) => { G.setFlag("p3_garen_advice"); G.mod("awareness", 3); },
          outcome: { type: "good", text: "가렌이 술 냄새를 풍기며 어깨를 짚는다. “자작 군영엔 혈통 자랑하는 애송이 장교가 깔렸다. 그놈들 앞에서 똑똑한 척 마라. 멍청한 척하면서, 살 자리만 봐 둬. 그게 오래 사는 법이다.” 군영의 생리를 미리 읽었다." },
          next: "p3_arrival",
        },
      ],
    },

    p3_arrival: {
      title: "칼덴 군영",
      art: "port-darion",
      location: "칼덴 군영",
      status: "자작 근위대 대원",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", -6); G.setStatus("자작 근위대 대원"); },
      text: [
        { t: "narr", c: "칼덴 자작의 군영은 하윈 성채와 격이 다르다. 늘어선 막사, 펄럭이는 깃발, 명령 체계와 전령, 수백의 병사. 진흙골 출신에게 이곳은 또 다른 세계다 — 더 크고, 더 차갑다." },
        { t: "narr", c: "신참 점호. 귀족 출신 장교 다리온 베크가 새로 온 병졸들을 훑는다. 광이 나는 갑옷, 곧은 자세. 그의 시선이 로완의 닳은 장화에서 멈춘다." },
        { t: "speak", c: "다리온: “남작이 보낸 게 이런 것들인가. 진흙 냄새 나는 잡병. …전장은 도살장이 아니라 명예의 자리다. 너 같은 놈은 그걸 더럽히지.”" },
      ],
      choices: [
        {
          text: "고개를 숙이고 멍청한 척, 살 자리만 눈에 담는다. (가렌의 조언)",
          show: (G) => G.flag("p3_garen_advice"),
          effect: (G) => { G.mod("awareness", 3); G.setFlag("darion_underestimates"); },
          outcome: { type: "good", text: "당신은 비굴할 만큼 굽신거린다. 다리온은 흥미를 잃고 지나간다. 그가 당신을 ‘하찮은 것’으로 분류하는 동안, 당신은 군영의 막사 배치·보초 교대·식량 천막 위치를 전부 머리에 새겼다. 과소평가는 거지의 갑옷이다." },
          next: "p3_camp",
        },
        {
          text: "맞받아친다. “도살장에 예쁜 이름을 붙인 게 명예 아닙니까.”",
          tag: "위험", tagType: "risk",
          effect: (G) => { G.mod("health", -8); G.mod("reputation", 3); G.setFlag("darion_grudge"); },
          outcome: { type: "bad", text: "다리온의 장갑이 뺨을 후린다. “건방진 혀로군.” 그는 당신을 똑똑히 기억한다 — 적으로. 하지만 지켜보던 병사들 몇은, 처음으로 진흙골 놈에게 흥미를 가졌다." },
          next: "p3_camp",
        },
        {
          text: "침묵한 채, 그저 시선을 받아낸다.",
          effect: (G) => { G.mod("awareness", 1); },
          outcome: { type: "neutral", text: "당신은 아무 말도 하지 않는다. 다리온은 코웃음 치며 지나간다. 시간은 당신 편이다 — 말은 적이 되지만, 침묵은 누구도 되지 않는다." },
          next: "p3_camp",
        },
      ],
    },

    p3_camp: {
      title: "군영의 사람들",
      art: "port-isabel",
      onEnter: (G) => { G.mod("hunger", -4); },
      text: [
        { t: "narr", c: "막사 한구석, 거구의 사내가 묵묵히 방패를 손질한다. 북부에서 내려온 피난민 병사 헬가. 마물에게 가족을 잃은 눈을 하고 있다. 그 옆엔 말 적은 사냥꾼 출신 척후병 카스." },
        { t: "narr", c: "그리고 멀리, 자작가의 천막 그늘에서 한 여인이 신참들을 관찰한다. 자작의 조카 이자벨 칼덴. 귀족 사회의 위선을 누구보다 잘 아는 눈빛이다." },
        { t: "think", c: "기사도, 귀족도 아니다. 내가 살아남으려면 — 같이 살아남을 사람을 알아둬야 한다. 청연은 늘 그렇게 살았다. 거지의 힘은 패거리다." },
      ],
      choices: [
        { text: "헬가에게 다가가 말없이 방패 손질을 돕는다.", show: (G) => !G.flag("helga_bond"), next: "p3_meet_helga" },
        { text: "카스를 따라 척후에 나서, 주변 지형을 익힌다.", show: (G) => !G.flag("scout_terrain"), next: "p3_meet_kas" },
        { text: "이자벨에게 다가가, 군영의 ‘진짜’ 사정을 묻는다.", show: (G) => !G.flag("isabel_contact"), next: "p3_meet_isabel" },
        { text: "그만 둘러보고, 막사로 간다.", continue: true, next: "p3_camp_hub" },
      ],
    },

    p3_meet_helga: {
      title: "헬가",
      art: "port-helga",
      onEnter: (G) => { G.setFlag("helga_bond"); G.mod("reputation", 3); },
      text: [
        { t: "narr", c: "당신은 아무것도 묻지 않고, 거구의 사내 곁에 털썩 앉아 함께 가죽끈을 손본다. 헬가는 한참을 말없이 방패만 문지른다." },
        { t: "speak", c: "헬가: “…북부에선, 마물이 마을을 통째로 삼켰다. 처자식까지. 나는 그때 등을 돌리고 달아났지.”" },
        { t: "narr", c: "굵은 손가락이 방패의 이 빠진 가장자리를 쓸어내린다." },
        { t: "speak", c: "헬가: “도망치라면 도망친다. 버티라면 버틴다. 대신 이유는 제대로 말해라. 영문도 모르고 죽는 건… 두 번은 못 하겠다.”" },
        { t: "think", c: "이런 사내가 등을 맡겨준다면, 전열은 쉽게 무너지지 않는다." },
      ],
      choices: [
        { text: "고개를 끄덕인다. 막사로 돌아간다.", continue: true, next: "p3_camp_hub" },
      ],
    },

    p3_meet_kas: {
      title: "카스",
      art: "port-kas",
      onEnter: (G) => { G.setFlag("scout_terrain"); G.mod("awareness", 4); },
      text: [
        { t: "narr", c: "카스는 말 대신 손짓으로 따라오라 한다. 군영 외곽의 능선을 따라, 그는 짐승처럼 소리 없이 움직인다." },
        { t: "narr", c: "그가 진창에 찍힌 발자국 몇 개를 가리키더니, 손가락 두 개로 방향을 짚어 보인다. 골짜기, 바위 그늘, 빠져나갈 좁은 길." },
        { t: "speak", c: "카스: “사람 발자국은 거짓말을 한다. 짐승 발자국은… 덜 한다.”" },
        { t: "think", c: "군영 둘레의 지형이 머릿속에 그려진다. 이 길들이, 언젠가 누군가의 목숨을 살릴 것이다." },
      ],
      choices: [
        { text: "지형을 머리에 새기고, 막사로 돌아간다.", continue: true, next: "p3_camp_hub" },
      ],
    },

    p3_meet_isabel: {
      title: "이자벨 칼덴",
      art: "port-isabel",
      text: [
        { t: "narr", c: "자작가 천막 그늘. 이자벨 칼덴이 신참들을 관찰하다, 다가오는 당신을 흥미롭다는 듯 바라본다." },
        { t: "speak", c: "이자벨: “천한 병졸이 귀족 천막 앞을 어슬렁대다니. …무슨 볼일이지?”" },
      ],
      choices: [
        {
          text: "군영의 ‘진짜’ 사정을 넌지시 캐묻는다.",
          tag: "눈치 판정", tagType: "info",
          check: { stat: "awareness", bonus: 15 },
          onSuccess: {
            effect: (G) => { G.setFlag("isabel_contact"); G.mod("awareness", 3); G.mod("reputation", 2); },
            outcome: { type: "good", text: "이자벨이 한쪽 눈썹을 올린다. “영리하네. 보급이 두 달째 늦고, 자작은 내전의 전조를 읽고 있어. 곧 이 변경이 시험대에 오를 거야.” 귀족 정치의 한 자락을 엿봤다." },
            next: "p3_camp_hub",
          },
          onFail: {
            effect: (G) => { G.mod("reputation", -1); },
            outcome: { type: "neutral", text: "이자벨이 위아래로 훑더니 등을 돌린다. “냄새나는 입으로 물을 건 아니지.” 무안했지만, 그녀가 무언가를 ‘읽고 있다’는 것만은 알아챘다." },
            next: "p3_camp_hub",
          },
        },
        { text: "괜한 짓이었다. 물러난다.", next: "p3_camp_hub" },
      ],
    },

    p3_camp_hub: {
      title: "출진 전야",
      art: "port-kas",
      text: (G) => {
        const arr = [
          { t: "narr", c: "막사에 모닥불이 사위어 간다. 내일이면 첫 임무다. 자작이 직접 신참 점검에 나선다는 소문이 돈다." },
        ];
        const bonds = [G.flag("helga_bond"), G.flag("scout_terrain"), G.flag("isabel_contact")].filter(Boolean).length;
        if (bonds >= 2) arr.push({ t: "think", c: "하루 만에 두 사람 이상을 ‘내 편’으로 만들었다. 군영이 조금 덜 차갑게 느껴진다." });
        return arr;
      },
      choices: [
        {
          text: "종군 상인의 천막에 들러 물자를 산다.",
          next: "p3_quarter",
        },
        {
          text: "남은 시간, 한 사람을 더 챙긴다.",
          show: (G) => !(G.flag("helga_bond") && G.flag("scout_terrain") && G.flag("isabel_contact")),
          next: "p3_camp",
        },
        {
          text: "창을 손질하고 잠을 청한다. 내일을 맞는다.",
          effect: (G) => { G.mod("health", 5); },
          continue: true,
          next: "p3_intro",
        },
      ],
    },

    p3_quarter: {
      title: "종군 상인",
      text: (G) => [
        { t: "narr", c: "군영 한구석, 수레 가득 잡동사니를 실은 종군 상인이 이를 드러내고 웃는다. 전쟁이 나는 곳엔 늘 이런 자들이 따라붙는다." },
        { t: "speak", c: "상인: “싸게 드립니다, 병사 양반. 살아남으려면 배도 채우고 몸도 챙겨야지. 내일 죽으면 동전이 다 무슨 소용이오?”" },
        { t: "sys", c: "가진 동전: " + G.s.coins + "닢" },
      ],
      choices: (G) => {
        const buy = (label, price, fn) => ({
          text: label + " — " + price + "닢",
          enabled: (g) => g.s.coins >= price,
          lockedText: "동전 부족",
          effect: (g) => { if (g.spend(price)) fn(g); },
          outcome: { type: "good", text: "값을 치르고 물건을 챙긴다." },
          next: "p3_quarter",
        });
        const list = [
          buy("검은 빵", 3, (g) => g.addSupply("bread", 1)),
          buy("말린 고기", 4, (g) => g.addSupply("jerky", 1)),
          buy("붕대", 4, (g) => g.addSupply("bandage", 1)),
          buy("약초 꾸러미", 6, (g) => g.addSupply("herbs", 1)),
          buy("기름 횃불", 5, (g) => g.addSupply("oiled_torch", 1)),
        ];
        if (!G.has("jerkin")) list.push(buy("낡은 가죽 흉갑 (받는 피해 감소)", 18, (g) => g.give("jerkin")));
        if (!G.has("whetstone")) list.push(buy("숫돌 (주는 피해 증가)", 12, (g) => g.give("whetstone")));
        list.push({ text: "천막을 나선다.", next: "p3_camp_hub" });
        return list;
      },
    },

    p3_intro: {
      title: "열 명의 목숨",
      art: "port-albrecht-calden",
      location: "칼덴 군영 · 외곽",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", -6); },
      text: [
        { t: "narr", c: "이튿날, 자작 알브레히트 칼덴이 신참들을 사열한다. 50대의 전략가. 그는 로완을 아끼지 않는다 — 관찰한다." },
        { t: "speak", c: "칼덴: “천한 놈이 이상하게 오래 살아남는군. 왕국은 점잖은 기사보다, 네놈 같은 더러운 생존자를 필요로 하게 될 것이다.”" },
        { t: "narr", c: "그 말이 끝나기도 전에, 군영 외곽에서 비명이 터진다. 척후를 나간 십인조가 무언가에 쫓겨 돌아온다 — 그 뒤로, 땅을 울리며 거대한 그림자가 따라온다." },
        { t: "danger", c: "석피 멧돼지. 돌처럼 굳은 가죽의 3등급 중형 마물. 십장이 창을 들고 막아서지만, 정면으로는 막을 수 없다." },
      ],
      choices: [
        {
          text: "정면에 서지 말라고 외치며, 측면으로 파고들 자리를 잡는다.",
          tag: "눈치 판정", tagType: "info",
          check: { stat: "awareness", bonus: (G) => 20 + (G.flag("scout_terrain") ? 10 : 0) },
          onSuccess: {
            effect: (G) => { G.setFlag("boar_ready"); G.mod("awareness", 2); },
            outcome: { type: "good", text: "“정면 비켜! 돌진은 직선이다!” 당신은 바위 사이로 몸을 숨기며, 멧돼지가 선회하는 사각을 미리 읽는다. 청연의 보법이 살아난다. (전투에서 회피 보너스)" },
            next: "p3_boar",
          },
          onFail: {
            outcome: { type: "neutral", text: "외칠 새도 없이 멧돼지가 들이닥친다. 흙먼지 속에서, 정신없이 맞서야 한다." },
            next: "p3_boar",
          },
        },
      ],
    },

    p3_boar: {
      combat: {
        enemy: {
          name: "석피 멧돼지",
          grade: "3등급 중형",
          art: "mob-stonehide-boar",
          maxHp: 56,
          weakness: "드러난 복부",
          intro: [
            { t: "danger", c: "성인 수소만 한 몸집. 돌 같은 가죽은 창을 튕겨낸다. 약점은 단 하나, 돌진 뒤 숨을 고를 때 드러나는 무른 복부." },
            { t: "think", c: "정면은 죽음이다. 돌진을 흘리고, 놈이 숨을 고를 때 복부를 노린다. 그게 유일한 길이다." },
          ],
          moves: [
            { type: "heavy", name: "돌진", tell: "석피 멧돼지가 땅을 박찬다 — 돌진!", dmg: 28, weight: 3 },
            { type: "light", name: "머리 휘두르기", dmg: 12, weight: 2 },
            { type: "guarded", name: "거친 숨을 고른다 (복부가 드러난다)", dmg: 2, weight: 2 },
          ],
        },
        baseDmg: 6,
        bonus: (G) => (G.flag("boar_ready") ? 20 : 8) + (G.flag("drilled_hard") ? 6 : 0),
        allowFlee: true,
        onWin: {
          effect: (G) => { G.setFlag("boar_won"); G.mod("reputation", 10); G.mod("awareness", 4); },
          outcome: { type: "good", text: "벌려둔 틈으로 창이 복부 깊숙이 박힌다. 거대한 몸이 흙먼지를 일으키며 무너진다. 군영의 병사들이 입을 다물지 못한다 — 진흙골 출신이, 창 한 자루로 3등급 마물을 잡았다." },
          next: "p3_boar_after",
        },
        onLose: {
          effect: (G) => { G.setFlag("boar_fled"); G.mod("reputation", 2); },
          outcome: { type: "neutral", text: "당신은 멧돼지를 죽이진 못했지만, 측면으로 유인해 군영에서 떼어냈다. 그사이 십장과 병사들이 함정으로 몰아 마무리한다. 살아남았고, 한 명도 잃지 않았다." },
          next: "p3_boar_after",
        },
      },
    },

    p3_boar_after: {
      title: "십장의 죽음",
      onEnter: (G) => { G.mod("health", 6); },
      text: [
        { t: "narr", c: "마물은 정리됐다. 하지만 안도할 틈이 없다. 멧돼지를 쫓아낸 자리로, 진짜 위협이 모습을 드러낸다 — 피난민을 약탈하던 도적 무리와, 그들을 뒤따라온 또 다른 마물 떼가 동시에 군영 측면으로 몰려든다." },
        { t: "danger", c: "혼전 속, 십인조의 십장이 화살에 목을 꿰뚫려 쓰러진다. 지휘를 잃은 열 명의 병사가 패닉에 빠진다. 도망치려는 자, 얼어붙은 자, 우는 자." },
        { t: "think", c: "누군가 저들을 묶지 않으면 전부 죽는다. 이름 없는 병졸일 땐 내 목숨 하나만 챙기면 그만이었다. 그런데 지금은." },
        { t: "speak", c: "요나: “로완! 다들 무너진다! 누가… 누가 좀 잡아줘야 해!”" },
      ],
      choices: [
        {
          text: "거칠게 윽박질러 억지로 묶는다. 멋있을 필요 없다. 살리면 된다.",
          effect: (G) => { G.setStatus("임시 십장"); G.mod("reputation", 3); G.setFlag("rally_harsh"); },
          outcome: { type: "neutral", text: "“울 시간 있으면 진흙 발라! 창 버리는 놈은 내가 먼저 죽인다! 살고 싶으면 내 목소리만 따라와!” 낭만 없는 호령. 그래서 더 먹힌다. 흩어지던 열 명이, 한 점으로 모인다." },
          next: "p3_command",
        },
        {
          text: "헬가를 전열 한가운데 세우고, 이유를 또박또박 일러준다.",
          show: (G) => G.flag("helga_bond"),
          effect: (G) => { G.setStatus("임시 십장"); G.mod("reputation", 4); G.setFlag("rally_helga"); },
          outcome: { type: "good", text: "“헬가, 가운데. 너만 안 무너지면 양옆도 안 무너진다. 우린 자작 본대 올 때까지만 버틴다 — 그 한 가지만 한다.” 거구의 헬가가 묵묵히 방패를 세우자, 떨던 병사들이 그 등 뒤로 모여든다. 이유를 아는 부대는, 쉽게 깨지지 않는다." },
          next: "p3_command",
        },
        {
          text: "카스에게 익혀둔 지형으로 적을 끌어들이라 신호한다.",
          show: (G) => G.flag("scout_terrain"),
          effect: (G) => { G.setStatus("임시 십장"); G.mod("reputation", 4); G.setFlag("rally_terrain"); },
          outcome: { type: "good", text: "당신은 어제 카스와 익힌 골짜기 길을 떠올린다. “저 좁은 길로 흘려보낸다. 머릿수는 거기서 소용없어.” 지형을 등에 업자, 열 명이 백 명을 상대할 자리가 생긴다." },
          next: "p3_command",
        },
      ],
    },

    p3_command: {
      bg: "bg-battlefield-night",
      onEnter: (G) => { if (!G.s.squad || !G.s.squad.length) G.initSquad(10); },
      skirmish: {
        useIndex: false,
        battles: [
          {
            morale: (G) => 55 + (G.flag("rally_helga") ? 12 : 0) + (G.flag("helga_bond") ? 4 : 0) + (G.flag("isabel_contact") ? 4 : 0) + (G.flag("rally_terrain") ? 6 : 0) + (G.flag("drilled_hard") ? 4 : 0),
            intro: [
              { t: "danger", c: "도적과 마물이 한꺼번에 측면을 두드린다. 당신의 등에, 처음으로 열 명의 목숨이 매달렸다." },
              { t: "think", c: "버티는 걸론 안 끝난다. 저 무리를 끝까지 부숴야, 우리가 산다." },
            ],
            enemy: { name: "도적·마물 혼성 무리", grade: "혼성 적 부대", maxHp: 130, dmg: 9 },
          },
        ],
        onComplete: (G, r) => {
          G.s.cmdResult = { survivors: r.survivors, maxSquad: 10, casualties: Math.max(0, 10 - r.survivors), result: r.result };
          if (r.result === "held") { G.mod("reputation", r.survivors >= 7 ? 16 : 10); G.mod("awareness", 3); G.awardSquadXp(3); }
          else { G.mod("reputation", 4); }
          return "p3_command_after";
        },
      },
    },

    p3_command_after: {
      title: "등에 매달린 무게",
      art: "port-helga",
      onEnter: (G) => { G.mod("hunger", 6); G.addRation(2); G.mod("health", 6); G.addSupply("bread", 1); G.addCoins(16); },
      text: (G) => {
        const r = G.s.cmdResult || { survivors: 0, maxSquad: 10, casualties: 0, result: "held" };
        const arr = [];
        if (r.result === "held") {
          arr.push({ t: "narr", c: "자작의 본대가 측면을 휩쓸자, 도적과 마물이 썰물처럼 빠진다. 당신의 분대는 — 무너지지 않았다." });
        } else {
          arr.push({ t: "narr", c: "전선은 결국 밀렸다. 자작의 본대에 떠밀려 후퇴하는 길, 당신은 남은 자들을 끌고 빠져나온다." });
        }
        arr.push({ t: "sys", c: "분대 생존 " + r.survivors + "/" + r.maxSquad + " · 전사 " + r.casualties + "명" });
        if (r.casualties > 0) {
          arr.push({ t: "narr", c: "그러나 " + r.casualties + "개의 빈자리가 있다. 어제까지 같은 솥의 죽을 먹던 얼굴들. 당신의 명령 한 마디에 살고 죽은 자들." });
          arr.push({ t: "think", c: "이름 없는 병졸일 땐 죽어봤자 내 죽음 하나로 끝이었다. 십장이 되고 나니, 남의 죽음이 고스란히 내 등에 얹힌다. 이런 게 지휘구나." });
        } else {
          arr.push({ t: "narr", c: "믿기지 않게도, 한 명도 잃지 않았다. 병사들이 당신을 보는 눈이 달라졌다. 두려움과, 신뢰가 섞인 눈." });
        }
        if (r.survivors > 0) {
          arr.push({ t: "speak", c: "헬가 같은 거구의 피난민 병사가 다가온다: “도망치라면 도망치고, 버티라면 버텼다. 이유를 제대로 말해준 지휘관은 네가 처음이다.”" });
        }
        return arr;
      },
      choices: [
        { text: "쓰러진 자들의 이름을 장부에서 확인한다.", continue: true, next: "p3_end" },
      ],
    },

    p3_end: {
      title: "축복이자 저주",
      art: "port-albrecht-calden",
      onEnter: (G) => {
        G.setStatus("자작 근위대 십장"); G.mod("reputation", 4);
        if (!G.s.squad || !G.s.squad.length) {
          const surv = (G.s.cmdResult && G.s.cmdResult.survivors) || 6;
          G.initSquad(Math.max(5, Math.min(10, surv)));
        }
        G.s.skirmishIndex = 0;
      },
      text: [
        { t: "narr", c: "자작 알브레히트 칼덴이 당신을 부른다. 그의 눈은 당신을 칭찬하는 게 아니라, 저울에 다는 듯하다." },
        { t: "speak", c: "칼덴: “십장이 죽은 자리에서, 네가 열 명을 묶었다. 정식으로 임명한다. 너는 이제 칼덴 근위대의 십장이다.”" },
        { t: "narr", c: "병사들이 부러운 눈으로 본다. 승진이다, 출세다. 그러나 로완은 안다. 이건 축복이 아니라 차라리 저주에 가깝다." },
        { t: "think", c: "이름 없는 병졸일 땐 제 목숨만 챙기면 그만이었다. 십장이 된 뒤로는, 열 명의 목숨이 등에 매달린다." },
      ],
      choices: [
        { text: "십장의 표식을 받고, 부하들의 이름을 새긴다.", effect: (G) => { G.give("ledger"); }, continue: true, next: "squad_intro" },
      ],
    },

    /* ---------- 분대 관리 + 추가 교전 3회 ---------- */
    squad_intro: {
      title: "나의 열 명",
      text: (G) => {
        const arr = [
          { t: "narr", c: "임명은 종이 한 장이지만, 책임은 살과 피다. 이제 당신에게는 이름을 가진 부하들이 있다. 어제까지 같은 솥의 죽을 나눠 먹던 자들." },
          { t: "narr", c: "앞으로 자작령을 노리는 세 차례의 큰 싸움이 남았다. 전투 사이사이, 막사에서 부하들을 훈련시키고 상처를 돌볼 수 있다. 죽은 자리는 전투가 끝날 때마다 신병 하나로 메워진다." },
        ];
        const roster = (G.s.squad || []).map((s) => s.name + "(★" + s.skill + ")").join("  ·  ");
        arr.push({ t: "sys", c: "현재 분대 (" + (G.s.squad || []).length + "명): " + roster });
        arr.push({ t: "think", c: "강한 부대를 만들 재주는 없다. 그저 한 명이라도 덜 죽이고 싶을 뿐이다." });
        return arr;
      },
      onEnter: (G) => { G.s.campTrained = false; G.s.campRested = false; },
      choices: [
        { text: "막사로 가 부대를 점검한다.", continue: true, next: "squad_camp" },
      ],
    },

    squad_camp: {
      title: "막사 — 출진 전",
      text: (G) => {
        const idx = (G.s.skirmishIndex || 0) + 1;
        const arr = [
          { t: "narr", c: "모닥불 가, 부하들이 창을 손질하고 상처를 싸맨다. 다음 싸움 전에 해 둘 일을 챙긴다." },
          { t: "sys", c: "다가오는 교전: " + idx + " / 3" },
        ];
        arr.push({ t: "sys", c: "분대 " + (G.s.squad || []).length + "명" });
        arr.push({ t: "html", c: window.rosterHTML ? window.rosterHTML(G.s.squad || []) : "" });
        return arr;
      },
      choices: (G) => STORY._campChoices(G, "squad_camp", "skirmish", "squad_quarter", "squad_recruit"),
    },

    squad_quarter: {
      title: "보급 — 종군 상인",
      text: (G) => [
        { t: "narr", c: "막사 뒤편, 종군 상인이 수레를 풀어 물자를 늘어놓는다." },
        { t: "sys", c: "가진 동전: " + G.s.coins + "닢" },
      ],
      choices: (G) => STORY._shopChoices(G, "squad_quarter", "squad_camp"),
    },

    squad_recruit: {
      title: "인사 — 병사 모집",
      text: (G) => [
        { t: "narr", c: "막사 입구, 일자리를 찾는 떠돌이들이 기웃거린다. 누구를 거두고 누구를 내보낼지는 지휘관의 몫이다." },
        { t: "sys", c: "분대 " + (G.s.squad || []).length + " / 정원 " + (G.s.squadCap || 10) + " · 동전 " + G.s.coins + "닢" },
        { t: "html", c: window.rosterHTML ? window.rosterHTML(G.s.squad || []) : "" },
      ],
      choices: (G) => STORY._recruitChoices(G, "squad_recruit", "squad_camp"),
    },

    skirmish: {
      bg: "bg-battlefield-night",
      skirmish: {
        useIndex: true,
        battles: [
          {
            intro: [
              { t: "danger", c: "첫 임무. 패주한 도적 잔당이 인근 마을을 노린다. 길목에서 이들을 끝까지 부숴 흩어버려야 한다." },
              { t: "think", c: "부하들의 첫 시험이다. 한 명도 잃지 않고 적을 궤멸시키고 싶다." },
            ],
            enemy: { name: "패주한 도적 잔당", grade: "도적 무리", maxHp: 90, dmg: 7 },
          },
          {
            intro: [
              { t: "danger", c: "두 번째 임무. 피난민 행렬을 노리는 약탈자와, 그 뒤를 따라온 마물 떼. 둘 다 쓸어버려야 행렬이 산다." },
              { t: "think", c: "지킬 게 늘면 죽을 자리도 는다. 그래도, 끝장을 봐야 한다." },
            ],
            enemy: { name: "약탈자와 마물 떼", grade: "혼성 무리", maxHp: 120, dmg: 9, art: "mob-stonehide-boar" },
          },
          {
            intro: [
              { t: "danger", c: "마지막 싸움. 검은 별이 유난히 또렷한 밤, 흑성에 물든 것들이 전초로 밀려온다. 부식된 갑옷의 암흑 기사가 그 선두에 섰다." },
              { t: "think", c: "여기서 저것들을 부수면 겨울을 넘긴다. 못 부수면, 이 변경은 통째로 어둠에 먹힌다." },
            ],
            enemy: { name: "흑성에 물든 무리", grade: "흑성 마물", maxHp: 165, dmg: 12, art: "mob-darkknight" },
          },
        ],
        onComplete: (G, r) => {
          G.s.skirmishIndex = (G.s.skirmishIndex || 0) + 1;
          G.s.lastDead = r.dead;
          G.mod("reputation", r.result === "held" ? 6 : 2);
          G.addCoins(8);
          if (r.result === "held") G.awardSquadXp(2);
          return "skirmish_after";
        },
      },
    },

    skirmish_after: {
      title: "교전이 끝나고",
      onEnter: (G) => {
        G.s.campTrained = false; G.s.campRested = false;
        G.mod("hunger", -5); G.addRation(1);
        if ((G.s.skirmishIndex || 0) < 3 && (G.s.squad || []).length < (G.s.squadCap || 10)) {
          const r = G.recruit();
          G.s.lastRecruit = r.name;
        } else {
          G.s.lastRecruit = null;
        }
      },
      text: (G) => {
        const arr = [{ t: "narr", c: "싸움이 끝났다. 살아남은 자들이 거친 숨을 고르며 무기를 내린다." }];
        const dead = G.s.lastDead || [];
        if (dead.length) arr.push({ t: "sys", c: "전사: " + dead.join(", ") + ". 이름을 장부에서 지운다." });
        else arr.push({ t: "narr", c: "이번엔 한 명도 잃지 않았다. 드문 일이다." });
        if (G.s.lastRecruit) arr.push({ t: "narr", c: "빈자리를 메우러 신병 " + G.s.lastRecruit + "이(가) 합류했다. 겁먹은 눈이지만, 손에 창은 쥐고 있다. 어차피 다들 그렇게 시작했다." });
        return arr;
      },
      choices: [
        { text: "막사로 돌아가 다음 싸움을 준비한다.", show: (G) => (G.s.skirmishIndex || 0) < 3, continue: true, next: "squad_camp" },
        { text: "…그렇게, 긴 겨울이 지났다. (1부 완결)", show: (G) => (G.s.skirmishIndex || 0) >= 3, continue: true, next: "p3_epilogue" },
      ],
    },

    p3_epilogue: {
      title: "— 1부 완결 —",
      submit: { result: "1부 완결" },
      text: (G) => {
        const r = G.s.cmdResult || { survivors: 0, maxSquad: 10, casualties: 0 };
        const arr = [
          { t: "sys", c: "【 1부: 빵 한 덩이와 창 한 자루 — 완결 】" },
          { t: "narr", c: "진흙골의 무적자였던 아이는, 이제 자작 근위대의 십장이 되었다. 강해서 올라온 길이 아니다. 매번 세계가 무너지는 틈에서, '죽을 자리를 먼저 보는 놈'이 되었기에 올라왔다." },
          { t: "sys", c: "최종 평판 " + G.s.stats.reputation + " · 눈치 " + G.s.stats.awareness + " · 생존 " + G.s.day + "일" },
        ];
        if (G.flag("boar_won")) arr.push({ t: "sys", c: "기록: 창 한 자루로 3등급 마물 석피 멧돼지를 잡았다." });
        arr.push({ t: "sys", c: "기록: 첫 지휘에서 " + r.survivors + "/" + r.maxSquad + "을 살려냈다." });
        const sq = G.s.squad || [];
        if (sq.length) {
          arr.push({ t: "sys", c: "끝까지 살아남은 분대 (" + sq.length + "명): " + sq.map((s) => s.name).join(", ") });
          arr.push({ t: "narr", c: "세 번의 겨울 싸움을 함께 넘긴 얼굴들. 누군가는 묻혔고, 누군가는 새로 들어왔다. 그래도 이 열 명만은, 로완이 끝까지 데려가야 할 사람들이다." });
        }
        arr.push({ t: "narr", c: "1부의 마지막 정서는 이것이다 — 빵 한 덩이를 위해 머리를 조아리던 아이가, 이제 열 명의 빵을 책임진다. 무게는 늘었고, 굶주림은 끝나지 않았다." });
        arr.push({ t: "think", c: "다음 겨울, 자작은 정치적 이유로 패전의 책임을 뒤집어쓸 것이다. 그리고 버려진 병사들 사이에서, 나는 또 다른 무언가가 되어야 할 것이다. …하지만 그건, 2부의 이야기다." });
        arr.push({ t: "sys", c: "▶ 2부 「거지 남작」 — 깨진방패단의 이야기는 다음 장에서 이어집니다. (현재 1부 전체 플레이 가능)" });
        return arr;
      },
      choices: [
        { text: "▶ 무한 전투 모드에 돌입한다. (끝없이 강해지는 적)", continue: true, next: "endless_intro" },
        { text: "여기까지의 여정을 되새긴다. (타이틀로)", action: "title" },
        { text: "처음부터 다시 시작한다.", action: "restart" },
      ],
    },

    /* =====================================================
       무한 전투 모드 — 끝없이 강해지는 적
       ===================================================== */
    endless_intro: {
      title: "끝없는 겨울",
      phase: "무한 전투",
      location: "그레이마치 변경",
      onEnter: (G) => {
        if (!G.s.squad || !G.s.squad.length) G.initSquad(10);
        G.s.endlessStage = 0;
        G.s.campTrained = false; G.s.campRested = false;
        G.setFlag("endless_mode");
      },
      text: [
        { t: "narr", c: "전쟁은 끝나지 않는다. 한 무리를 부수면 다음 무리가 밀려온다. 흑성은 더 짙어지고, 어둠은 더 자주 토해낸다." },
        { t: "narr", c: "로완은 분대를 추슬러 변경의 길목에 진을 친다. 얼마나 버틸 수 있을지는, 아무도 모른다." },
        { t: "sys", c: "무한 전투: 적은 진(陣)을 거듭할수록 강해진다. 분대가 전멸할 때까지, 몇 진까지 막아내는지 도전한다." },
        { t: "think", c: "끝이 없다는 걸 안다. 그래도 한 진이라도 더. 한 명이라도 더 데리고." },
      ],
      choices: [
        { text: "진을 친다.", continue: true, next: "endless_camp" },
      ],
    },

    endless_camp: {
      title: "진중 — 다음 적을 기다리며",
      text: (G) => {
        const stage = (G.s.endlessStage || 0) + 1;
        const arr = [
          { t: "narr", c: "모닥불 가, 부하들이 무기를 손질하며 다음 적을 기다린다." },
          { t: "sys", c: "다가오는 적: 제 " + stage + " 진 · 최고 기록 " + (G.s.endlessBest || 0) + " 진" },
        ];
        arr.push({ t: "sys", c: "분대 " + (G.s.squad || []).length + "명 / 정원 " + (G.s.squadCap || 10) });
        arr.push({ t: "html", c: window.rosterHTML ? window.rosterHTML(G.s.squad || []) : "" });
        return arr;
      },
      choices: (G) => STORY._campChoices(G, "endless_camp", "endless_battle", "endless_quarter", "endless_recruit"),
    },

    endless_quarter: {
      title: "보급 — 떠돌이 보급상",
      text: (G) => [
        { t: "narr", c: "전쟁이 나는 곳엔 늘 보급상이 따라붙는다. 수레 가득 잡동사니를 풀어놓는다." },
        { t: "sys", c: "가진 동전: " + G.s.coins + "닢" },
      ],
      choices: (G) => STORY._shopChoices(G, "endless_quarter", "endless_camp"),
    },

    endless_recruit: {
      title: "인사 — 병사 모집",
      text: (G) => [
        { t: "narr", c: "끝없는 싸움터에도 굶주린 떠돌이는 모여든다. 누구를 거두고 누구를 내보낼지 정한다." },
        { t: "sys", c: "분대 " + (G.s.squad || []).length + " / 정원 " + (G.s.squadCap || 10) + " · 동전 " + G.s.coins + "닢" },
        { t: "html", c: window.rosterHTML ? window.rosterHTML(G.s.squad || []) : "" },
      ],
      choices: (G) => STORY._recruitChoices(G, "endless_recruit", "endless_camp"),
    },

    endless_battle: {
      bg: "bg-battlefield-night",
      onEnter: (G) => { if (!G.s.squad || !G.s.squad.length) G.initSquad(10); },
      skirmish: {
        makeBattle: (G) => {
          const stage = G.s.endlessStage || 0;
          const foes = STORY.endlessFoes;
          const t = foes[stage % foes.length];
          const cycle = Math.floor(stage / foes.length);
          const maxHp = 90 + stage * 32 + cycle * 45;
          const dmg = 7 + Math.round(stage * 1.7) + cycle * 2;
          return {
            morale: 60,
            intro: [
              { t: "danger", c: "제 " + (stage + 1) + " 진(陣). " + t.name + "이(가) 밀려온다." },
              { t: "think", c: t.flavor || "끝이 없다. 그저 다음 적이 올 뿐." },
            ],
            enemy: { name: t.name, grade: "제 " + (stage + 1) + " 진", maxHp: maxHp, dmg: dmg, art: t.art },
          };
        },
        onComplete: (G, r) => {
          if (r.result === "held") {
            G.s.endlessStage = (G.s.endlessStage || 0) + 1;
            if (G.s.endlessStage > (G.s.endlessBest || 0)) G.s.endlessBest = G.s.endlessStage;
            G.s.lastDead = r.dead;
            G.addCoins(10 + G.s.endlessStage * 2);
            G.mod("reputation", 3);
            G.awardSquadXp(2);
            return "endless_after";
          }
          return "endless_defeat";
        },
      },
    },

    endless_after: {
      title: "한 진을 넘기고",
      onEnter: (G) => {
        G.s.campTrained = false; G.s.campRested = false;
        if ((G.s.squad || []).length < (G.s.squadCap || 10)) { const r = G.recruit(); G.s.lastRecruit = r.name; }
        else G.s.lastRecruit = null;
      },
      text: (G) => {
        const arr = [
          { t: "narr", c: "적이 모두 쓰러졌다. 잠깐의 정적. 하지만 멀리서 또 다른 발소리가 들려온다." },
          { t: "sys", c: "제 " + (G.s.endlessStage || 0) + " 진 돌파 · 최고 기록 " + (G.s.endlessBest || 0) + " 진" },
        ];
        const dead = G.s.lastDead || [];
        if (dead.length) arr.push({ t: "sys", c: "전사: " + dead.join(", ") });
        if (G.s.lastRecruit) arr.push({ t: "narr", c: "빈자리를 메우러 신병 " + G.s.lastRecruit + "이(가) 합류했다." });
        return arr;
      },
      choices: [
        { text: "진을 다시 추스른다.", continue: true, next: "endless_camp" },
      ],
    },

    endless_defeat: {
      title: "마지막 진",
      onEnter: (G) => { G.mod("health", 8); },
      text: (G) => [
        { t: "danger", c: "마침내 분대가 무너졌다. 마지막 한 명이 쓰러지는 것을, 로완은 끝까지 지켜본다." },
        { t: "sys", c: "최종 기록: 제 " + (G.s.endlessStage || 0) + " 진까지 막아냈다. (최고 기록 " + (G.s.endlessBest || 0) + " 진)" },
        { t: "think", c: "끝이 없는 싸움이었다. 그래도 여기까지 끌고 온 이름들이 있었다. 그걸로 됐다." },
      ],
      choices: [
        {
          text: "새 분대를 꾸려 다시 도전한다.",
          effect: (G) => { G.initSquad(10); G.s.endlessStage = 0; },
          continue: true,
          next: "endless_camp",
        },
        { text: "여기서 그만둔다. (타이틀로)", action: "title" },
      ],
    },

    /* ---------- 게임 오버 ---------- */
    game_over: {
      title: "진흙으로 돌아가다",
      art: { key: "cg-gameover", type: "scenic" },
      text: [
        { t: "danger", c: "눈앞이 어두워진다." },
        { t: "narr", c: "청연으로 한 번, 로완으로 또 한 번. 두 번째 삶도 진흙 속에서 식어간다. 장부에 적히지 못한 이름은, 아무도 기억하지 않는다." },
        { t: "think", c: "…그래도, 끝까지 굶지는 않았다. 그거면… 됐나." },
        { t: "sys", c: "당신은 죽었다. 이 세계에서 죽음은 흔하다. 흔하기에, 살아남는 것이 모든 것이다." },
      ],
      choices: [
        { text: "다시 시작한다.", action: "restart" },
      ],
    },
  },
};
