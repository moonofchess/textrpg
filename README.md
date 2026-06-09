# 그냥 중세 판타지에서 살아남기 (텍스트 RPG)

무협 세계의 밑바닥 거지 **청연**이, 멸망해가는 중세 판타지 세계의 빈민촌 아이 **로완**으로 환생해
말단 병졸부터 왕까지 올라가는 **생존 대서사**. 핵심은 "왕이 된다"가 아니라 끝까지 **살아남기**다.

브라우저만 있으면 바로 플레이할 수 있는 데이터 기반 텍스트 RPG입니다. 빌드 도구가 필요 없습니다.

## 실행 방법

가장 간단한 방법은 `index.html`을 브라우저로 여는 것입니다.

```powershell
# 파일 탐색기에서 index.html 더블클릭, 또는:
start index.html
```

로컬 서버로 띄우고 싶다면(권장, 일부 브라우저의 보안 정책 회피):

```powershell
# Python 3가 있다면
python -m http.server 8000
# 그 후 브라우저에서 http://localhost:8000 접속
```

## 플레이 개요

- **새로 시작 / 이어하기**: 진행은 `localStorage`에 자동 저장(체크포인트)되고, 상단 `저장` 버튼으로 수동 저장도 됩니다.
- **설정 열람**: 세계관·인물·마물 도감을 언제든 확인할 수 있습니다. 일부 항목은 게임을 진행하며 잠금 해제됩니다.

### 스탯

| 스탯 | 의미 |
| --- | --- |
| 허기 | 0이 되면 매 장면 체력이 깎인다. 빵·죽으로 회복 |
| 체력 | 0이 되면 사망 |
| 눈치 | 청연의 밑바닥 감각. 대부분의 판정에 쓰이는 핵심 능력 |
| 평판 | 이름이 알려진 정도. 설득과 승급에 영향 |

### 판정 규칙

선택지 중 `[눈치 판정]` `[설득 판정]` 등이 붙은 것은 확률 판정입니다.
성공 확률 = `해당 스탯 + 보너스`(5~95% 범위), `1~100` 주사위로 판정합니다.
증거를 모으거나(현장 관찰·정찰) 평판이 높으면 보너스가 붙습니다.

> 로완은 강해서 올라가는 게 아니라, **위험을 먼저 알아보는 놈**으로 인정받는다.

## 현재 구현 범위

**1부: 빵 한 덩이와 창 한 자루 — 전체(1~3페이즈) 플레이 가능**

- **1페이즈 「진흙골의 아이」** — 환생 → 풀죽 다툼 → 마을 잡역 → 식량창고 습격 사전 감지 → 인신매매단 습격 → 첫 보상(빵·이름) → 마을 방어전(우회 침입 간파) → 정식 경비병 등록
- **2페이즈 「남작의 개」** — 하윈 성채 차출 → 훈련/계급 차별 → **잿빛 늑대 무리 전투** → 호송대 매복(보급·후퇴로 vs 귀족 호위 분기) → "쓸모 있는 병사" 인정
- **3페이즈 「열 명의 목숨」** — 칼덴 군영 → **석피 멧돼지(3등급 마물) 전투** → 십장 전사 → **분대 지휘전** → 첫 지휘의 죄책감 → 정식 십장 임명(1부 완결)

다회차 분기: 증거 수집·신고·호위 선택·전투/지휘 결과에 따라 결말 텍스트, 평판, 생존자 수가 달라집니다.

### 미니 시스템

- **마물 전투 (1:1)** — 적의 행동 예고(▶)를 읽고 대응. `약점 찌르기 / 보법 회피 / 방어 / 관찰 / 후퇴`. 회피·관찰로 **틈(개방)**을 벌리고 적이 허점을 보일 때 약점을 찔러 큰 피해. 로완은 힘이 아니라 **위험을 먼저 읽어** 이긴다.
- **분대 지휘 (십장)** — `병력 / 사기 / 적 압력`을 보며 매 파마다 명령 하나. `엄폐 / 전열 유지 / 매복 / 질서 후퇴`. 사기가 낮으면 전열이 무너지고, 끝까지 버티면 증원이 온다. 살린 부하 수가 결말에 남는다.

자세한 규칙은 게임 내 **설정 열람 → 전투·지휘 안내**에서 볼 수 있습니다.

## 파일 구조

```
index.html                # 화면 구조
css/style.css             # 그을린 회색/호박색 변경 분위기 UI
js/engine.js              # 장면 엔진, 스탯·판정·저장/불러오기, 코덱스, 전당 연동
js/story.js               # 스토리 데이터 (장면·선택지·분기) — 여기를 확장하면 됩니다
js/codex.js               # 설정 열람 데이터 (세계관·인물·마물)
js/combat.js              # 마물 전투 / 분대 지휘 미니 시스템
js/cloud.js               # Supabase 연동 (클라우드 세이브 · 명예의 전당)
supabase/config.toml      # Supabase 프로젝트 참조 (project_id)
supabase/migrations/*.sql # DB 스키마 (runs, saves 테이블 + RLS)
```

## Supabase 연동 (클라우드 세이브 · 명예의 전당)

이 프로젝트는 빌드 도구 없이 CDN으로 `@supabase/supabase-js`를 불러와 연동합니다.
프론트엔드 키(`anon`/`publishable`)는 공개되어도 안전하도록 **RLS(행 수준 보안)**로 보호됩니다.
(DB 비밀번호 같은 비밀 값은 클라이언트에 넣지 않습니다.)

### 1) DB 스키마 적용 (최초 1회, 필수)

아래 둘 중 하나로 `supabase/migrations/20260609000000_init.sql`을 실행하세요.

- **대시보드(가장 간단)**: Supabase 프로젝트 → SQL Editor → 해당 SQL 전체 붙여넣기 → Run
- **CLI**:
  ```bash
  supabase login
  supabase link --project-ref nngkzgoniblndxlcqayy
  supabase db push
  ```

생성되는 테이블:
- `runs` — 명예의 전당(완주 기록). 누구나 읽기/자기 기록 추가 가능.
- `saves` — 클라우드 세이브. `player_id`(브라우저가 생성한 무작위 토큰)별 1행.

### 2) 동작 방식

- **클라우드 저장**: 게임 화면 상단 `저장` 버튼이 로컬(localStorage)과 클라우드에 동시에 기록합니다.
- **클라우드 불러오기**: 타이틀 화면의 `클라우드 불러오기` 버튼으로 다른 기기/브라우저의 진행을 이어받습니다(같은 `player_id` 기준).
- **명예의 전당**: 각 페이즈/부 완주 시 자동으로 기록이 제출됩니다(이름 최초 1회 입력). 타이틀·상단의 `명예의 전당`/`전당` 버튼으로 순위(평판 기준)를 볼 수 있습니다.

### 3) 키 설정 위치

프로젝트 URL과 publishable 키는 `js/cloud.js` 상단 상수에 있습니다.

```js
const SUPABASE_URL = "https://nngkzgoniblndxlcqayy.supabase.co";
const SUPABASE_KEY = "sb_publishable_...";   // 공개 키 (RLS로 보호)
```

> 참고: Supabase가 설정되지 않았거나 오프라인이면 클라우드 기능은 조용히 비활성화되고,
> 게임은 로컬 저장만으로 정상 동작합니다. 또한 별도 로그인이 없으므로 `saves`는
> `player_id`를 아는 사람이 접근할 수 있는 토이 수준 보안입니다. 민감 정보는 저장하지 마세요.

## 다음 페이즈 추가하기 (확장 가이드)

스토리는 전부 `js/story.js`의 `STORY.scenes` 객체에 데이터로 들어 있습니다.
새 장면을 추가하려면 키를 하나 만들고 다음 형식을 따르면 됩니다.

```js
STORY.scenes.baron_castle = {
  title: "남작의 성채",
  phase: "1부 2페이즈",      // 상단 페이즈 태그 갱신
  location: "하윈 성채",      // 위치 태그 갱신
  status: "남작 근위대 대원",  // 캐릭터 신분 갱신
  onEnter: (G) => { G.mod("hunger", -5); G.nextDay(); }, // 진입 시 효과
  text: [
    { t: "narr", c: "서술 문단" },
    { t: "speak", c: "대사 문단" },
    { t: "think", c: "독백 문단" },
    { t: "sys",  c: "시스템 문단" },
    { t: "danger", c: "위기 문단" },
  ],
  choices: [
    // 단순 선택
    { text: "...", effect: (G) => { G.mod("reputation", 2); }, next: "다음장면키" },
    // 확률 판정 선택
    {
      text: "...", tag: "눈치 판정", tagType: "info",
      check: { stat: "awareness", bonus: (G) => G.flag("evidence") ? 25 : 5 },
      onSuccess: { effect: (G)=>{...}, outcome: { type:"good", text:"..." }, next: "..." },
      onFail:    { effect: (G)=>{...}, outcome: { type:"bad",  text:"..." }, next: "..." },
    },
  ],
};
```

### effect에서 쓸 수 있는 도우미 (`G`)

| 호출 | 설명 |
| --- | --- |
| `G.mod(stat, delta)` | 스탯 증감(0~100 클램프) |
| `G.set(stat, val)` | 스탯 설정 |
| `G.give(itemId)` / `G.take(id)` / `G.has(id)` | 소지품 (아이템은 `STORY.items`에 정의) |
| `G.flag(name)` / `G.setFlag(name, val?)` | 분기용 플래그 |
| `G.addCoins(n)` / `G.addRation(n)` | 동전·배급권 |
| `G.nextDay()` | 날짜 +1 |
| `G.setStatus/setLocation/setPhase` | 신분·위치·페이즈 갱신 |
| `G.toast(msg)` / `G.rand(a,b)` | 토스트 / 난수 |

특수 선택지 속성: `action: "title"`(타이틀로), `action: "restart"`(새 게임), `continue: true`(강조 버튼),
`show: (G)=>bool`(노출 조건), `enabled: (G)=>bool` + `lockedText`(잠금 표시).

### 전투 장면 추가하기

장면에 `combat` 키를 넣으면 엔진이 마물 전투를 실행합니다.

```js
STORY.scenes.my_fight = {
  combat: {
    enemy: {
      name: "석피 멧돼지", grade: "3등급 중형", maxHp: 42, weakness: "복부",
      intro: [ { t: "danger", c: "..." } ],
      moves: [
        { type: "heavy",   name: "돌진", tell: "땅을 박찬다 — 돌진!", dmg: 20, weight: 3 },
        { type: "light",   name: "머리 휘두르기", dmg: 8, weight: 2 },
        { type: "guarded", name: "숨을 고른다 (복부 노출)", dmg: 1, weight: 2 },
      ],
    },
    baseDmg: 6,
    bonus: (G) => G.flag("ready") ? 20 : 8,  // 회피/이탈 판정 보너스(보통 눈치 기반)
    allowFlee: true,
    onWin:  { effect: (G)=>{...}, outcome: { type:"good", text:"..." }, next: "..." },
    onLose: { effect: (G)=>{...}, outcome: { type:"neutral", text:"..." }, next: "..." }, // 후퇴
  },
};
```

`move.type`: `light`(견제) / `heavy`(돌진, 회피 권장) / `guarded`(허점, 찌르기 호기) / `debuff`(교란).
체력이 0이 되면 자동으로 게임 오버로 갑니다.

### 지휘 장면 추가하기

장면에 `command` 키를 넣으면 분대 지휘전을 실행합니다.

```js
STORY.scenes.my_battle = {
  command: {
    intro: [ { t: "danger", c: "..." } ],
    squad: 10, morale: 55,
    waves: [
      { threat: 3, desc: [ { t: "narr", c: "제1파 ..." } ] },
      { threat: 6, desc: [ { t: "danger", c: "최후의 파도 ..." } ] },
    ],
    onComplete: (G, result) => {           // result = {survivors, maxSquad, morale, casualties, routed, result}
      G.s.cmdResult = result;              // state에 임의 값 저장 가능(저장에 포함됨)
      G.mod("reputation", result.survivors >= 7 ? 16 : 10);
      return "다음장면키";                  // 다음 장면 id 반환
    },
  },
};
```

설정 열람 항목은 `js/codex.js`의 `CODEX` 배열에 추가하면 됩니다.

---

원작 설정집(세계관·인물·마물 v2.0)을 바탕으로 한 팬 게임 구현입니다.
