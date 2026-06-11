/* =========================================================
   그냥 중세 판타지에서 살아남기 — 게임 엔진
   데이터 기반 장면 엔진. 스토리는 js/story.js 에 정의.
   ========================================================= */
(function () {
  "use strict";

  const SAVE_KEY = "graymarch_save_v1";

  // ---- 스탯 정의 ----
  // 사이드바에 바(bar)로 항상 표시되는 스탯 (상한 0~100)
  const SIDEBAR_STATS = [
    { key: "hunger", name: "허기", hint: "낮을수록 굶주린다", bar: true },
    { key: "health", name: "체력", hint: "0이 되면 죽는다", bar: true },
  ];
  // 능력치 — 상태창 팝업에서 확인 (상한 없음)
  const ABILITY_STATS = [
    { key: "attack", name: "공격력", hint: "전투에서 주는 피해가 늘어난다" },
    { key: "defense", name: "방어력", hint: "전투에서 받는 피해가 줄어든다" },
    { key: "evasion", name: "회피율", hint: "전투에서 회피 성공률이 오른다" },
    { key: "awareness", name: "눈치", hint: "위험을 먼저 읽는다 (대부분의 판정)" },
    { key: "reputation", name: "평판", hint: "이름이 알려진 정도" },
  ];
  // 상한(0~100)이 있는 스탯. 나머지는 0 이상으로만 제한, 상한 없음.
  const CAPPED = { hunger: true, health: true };

  function defaultState() {
    return {
      stats: { hunger: 35, health: 55, awareness: 35, reputation: 0, attack: 3, defense: 3, evasion: 3 },
      coins: 0,
      ration: 0,
      day: 1,
      scene: "intro",
      flags: {},
      inventory: [],
      supplies: {},
      squad: [],
      skirmishIndex: 0,
      phase: "1부 1페이즈",
      location: "진흙골",
      status: "진흙골의 아이",
    };
  }

  let state = defaultState();

  // ---- 도우미 API (스토리 effect 에서 사용) ----
  const G = {
    get s() { return state; },
    mod(stat, delta) {
      const v = state.stats[stat] + delta;
      state.stats[stat] = CAPPED[stat] ? clamp(v, 0, 100) : Math.max(0, v);
    },
    set(stat, val) {
      state.stats[stat] = CAPPED[stat] ? clamp(val, 0, 100) : Math.max(0, val);
    },
    give(id) {
      if (!state.inventory.includes(id)) {
        state.inventory.push(id);
        const it = STORY.items[id];
        if (it) G.toast("획득: " + it.name);
      }
    },
    take(id) { state.inventory = state.inventory.filter((x) => x !== id); },
    has(id) { return state.inventory.includes(id); },
    flag(name) { return !!state.flags[name]; },
    setFlag(name, val) { state.flags[name] = val === undefined ? true : val; },
    addCoins(n) { state.coins = Math.max(0, state.coins + n); },
    addRation(n) { state.ration = Math.max(0, state.ration + n); },
    spend(n) { if (state.coins >= n) { state.coins -= n; return true; } return false; },
    addSupply(id, n) {
      n = n || 1;
      if (!state.supplies) state.supplies = {};
      state.supplies[id] = (state.supplies[id] || 0) + n;
      const s = STORY.supplies && STORY.supplies[id];
      if (s) G.toast("획득: " + s.name + (n > 1 ? " ×" + n : ""));
    },
    supplyCount(id) { return (state.supplies && state.supplies[id]) || 0; },
    makeSoldier() {
      const names = (typeof STORY !== "undefined" && STORY.soldierNames) || ["병사"];
      if (!state.squad) state.squad = [];
      const used = new Set(state.squad.map((s) => s.name));
      let name = names[Math.floor(Math.random() * names.length)];
      let tries = 0;
      while (used.has(name) && tries++ < 40) name = names[Math.floor(Math.random() * names.length)];
      if (used.has(name)) name = name + " 2세";
      // 대부분 별 1개, 가끔 2개, 드물게 3개
      const r = Math.random();
      const skill = r < 0.7 ? 1 : r < 0.95 ? 2 : 3;
      const maxHp = 16 + skill * 3;
      return { name: name, hp: maxHp, maxHp: maxHp, skill: skill, xp: 0 };
    },
    // 다음 랭크까지 필요한 훈련 경험치 (1→2:1, 2→3:3, 3→4:5, 4→5:7)
    xpToNext(skill) { return 2 * skill - 1; },
    trainSquad() {
      let leveled = 0;
      (state.squad || []).forEach((s) => {
        if (s.hp <= 0) return;
        s.xp = (s.xp || 0) + 1;
        while (s.skill < 5 && s.xp >= G.xpToNext(s.skill)) { s.xp -= G.xpToNext(s.skill); s.skill++; leveled++; }
        if (s.skill >= 5) s.xp = 0;
      });
      if (leveled > 0) G.toast(leveled + "명의 기량 ★이 올랐다!");
      return leveled;
    },
    initSquad(n) {
      state.squad = [];
      for (let i = 0; i < n; i++) state.squad.push(G.makeSoldier());
    },
    recruit() {
      if (!state.squad) state.squad = [];
      const s = G.makeSoldier();
      state.squad.push(s);
      return s;
    },
    squadAlive() { return (state.squad || []).filter((s) => s.hp > 0).length; },
    nextDay() { state.day += 1; },
    setStatus(t) { state.status = t; },
    setLocation(l) { state.location = l; },
    setPhase(p) { state.phase = p; },
    toast: showToast,
    rand: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
  };
  window.G = G;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // ---- DOM ----
  const el = (id) => document.getElementById(id);
  const titleScreen = el("title-screen");
  const gameScreen = el("game-screen");

  // ===== 화면 전환 =====
  function showScreen(which) {
    titleScreen.classList.toggle("active", which === "title");
    gameScreen.classList.toggle("active", which === "game");
  }

  // ===== 토스트 =====
  let toastTimer;
  function showToast(msg) {
    const t = el("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  // ===== 저장 / 불러오기 =====
  function save() {
    let localOk = true;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
    catch (e) { localOk = false; }
    if (window.Cloud && window.Cloud.enabled()) {
      showToast("기록 저장 중…");
      window.Cloud.cloudSave(state).then((r) => {
        showToast(r.ok ? "장부와 구름에 모두 기록했다." : "로컬 저장 완료 (클라우드 실패).");
      });
    } else {
      showToast(localOk ? "기록을 장부에 적었다." : "저장 실패.");
    }
  }

  async function cloudContinue() {
    if (!window.Cloud || !window.Cloud.enabled()) { showToast("클라우드에 연결할 수 없다."); return; }
    showToast("구름에서 불러오는 중…");
    const r = await window.Cloud.cloudLoad();
    if (r && r.state) {
      state = Object.assign(defaultState(), r.state);
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {}
      showScreen("game");
      renderScene();
      showToast("구름에서 기록을 되살렸다.");
    } else {
      showToast(r && r.error && r.error !== "disabled" ? "클라우드 불러오기 실패." : "클라우드에 저장된 기록이 없다.");
    }
  }

  // 페이즈 완주 기록을 명예의 전당에 제출 (장면당 1회)
  function maybeSubmitRun(scene) {
    if (!scene.submit) return;
    if (!window.Cloud || !window.Cloud.enabled()) return;
    const key = "_sent_" + state.scene;
    if (state.flags[key]) return;
    state.flags[key] = true;
    let name = window.Cloud.playerName();
    if (!name) {
      name = (window.prompt("명예의 전당에 남길 이름을 입력하세요.", "이름없는 생존자") || "이름없는 생존자").slice(0, 20);
      window.Cloud.setPlayerName(name);
    }
    window.Cloud.submitRun({
      result: scene.submit.result,
      phase: state.phase,
      reputation: state.stats.reputation,
      awareness: state.stats.awareness,
      days: state.day,
      survivors: state.cmdResult ? state.cmdResult.survivors : null,
      status: state.status,
    }).then((r) => { showToast(r.ok ? "명예의 전당에 이름을 올렸다." : "전당 기록 실패."); });
  }
  function hasSave() { return !!localStorage.getItem(SAVE_KEY); }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      state = Object.assign(defaultState(), JSON.parse(raw));
      return true;
    } catch (e) { return false; }
  }

  // ===== 렌더링 =====
  function renderSidebar() {
    el("phase-tag").textContent = state.phase;
    el("loc-tag").textContent = state.location;
    el("char-status").textContent = state.status;
    el("res-coins").textContent = state.coins;
    el("res-ration").textContent = state.ration;
    el("res-day").textContent = state.day;

    // 스탯
    const wrap = el("stats");
    wrap.innerHTML = "";
    SIDEBAR_STATS.forEach((d) => {
      const v = state.stats[d.key];
      const div = document.createElement("div");
      div.title = d.hint;
      div.className = "stat";
      div.innerHTML =
        '<div class="stat-top"><span class="stat-name">' + d.name +
        '</span><span class="stat-val">' + v + " / 100</span></div>" +
        '<div class="stat-bar"><div class="stat-fill ' + d.key +
        (v <= 20 ? " low" : "") + '" style="width:' + v + '%"></div></div>';
      wrap.appendChild(div);
    });

    renderItems();
  }

  function renderInventoryList(invEl) {
    invEl.innerHTML = "";
    if (!state.inventory.length) { invEl.innerHTML = '<li class="empty">없음</li>'; return; }
    state.inventory.forEach((id) => {
      const it = STORY.items[id] || { name: id, desc: "" };
      const li = document.createElement("li");
      if (it.consumable) li.classList.add("consumable");
      let html = '<div class="item-row"><span class="item-name">' + it.name + "</span>";
      if (it.consumable) html += '<button class="item-use">사용</button>';
      html += "</div>";
      if (it.desc) html += '<span class="item-desc">' + it.desc + "</span>";
      li.innerHTML = html;
      if (it.consumable) {
        const btn = li.querySelector(".item-use");
        if (btn) btn.addEventListener("click", () => useItem(id));
      }
      invEl.appendChild(li);
    });
  }

  function renderSuppliesList(supEl) {
    supEl.innerHTML = "";
    const entries = Object.keys(state.supplies || {}).filter((id) => state.supplies[id] > 0);
    if (!entries.length) { supEl.innerHTML = '<li class="empty">없음</li>'; return; }
    entries.forEach((id) => {
      const s = (STORY.supplies && STORY.supplies[id]) || { name: id, desc: "" };
      const n = state.supplies[id];
      const li = document.createElement("li");
      li.classList.add("consumable");
      let html = '<div class="item-row"><span class="item-name">' + s.name +
        ' <span class="item-qty">×' + n + "</span></span>";
      html += '<button class="item-use">사용</button></div>';
      if (s.desc) html += '<span class="item-desc">' + s.desc + "</span>";
      li.innerHTML = html;
      const btn = li.querySelector(".item-use");
      if (btn) btn.addEventListener("click", () => useSupply(id));
      supEl.appendChild(li);
    });
  }

  function renderItems() {
    ["inventory-list", "bag-inventory-list"].forEach((id) => {
      const e = el(id); if (e) renderInventoryList(e);
    });
    ["supplies-list", "bag-supplies-list"].forEach((id) => {
      const e = el(id); if (e) renderSuppliesList(e);
    });
  }

  function imgUrl(key) { return key ? "assets/img/" + key + ".png" : null; }

  function setSceneVisuals(scene) {
    const bgEl = el("scene-bg");
    if (bgEl) {
      const bgKey = scene.bg || (STORY.bgByLocation && STORY.bgByLocation[state.location]);
      if (bgKey) { bgEl.style.backgroundImage = "url('" + imgUrl(bgKey) + "')"; bgEl.classList.add("on"); }
      else { bgEl.classList.remove("on"); }
    }
    const artEl = el("scene-art");
    if (artEl) {
      artEl.innerHTML = "";
      artEl.className = "";
      if (scene.art && !scene.combat && !scene.command && !scene.skirmish) {
        const a = scene.art;
        const key = typeof a === "string" ? a : a.key;
        const type = (typeof a === "object" && a.type) ? a.type : "portrait";
        artEl.className = type;
        artEl.innerHTML = '<img src="' + imgUrl(key) + '" alt="" onerror="this.parentNode.style.display=\'none\'">';
      }
    }
  }

  function paragraphsToHTML(arr) {
    return arr
      .map((p) => {
        if (typeof p === "string") return '<p class="narr">' + p + "</p>";
        const cls = p.t || "narr";
        return '<p class="' + cls + '">' + p.c + "</p>";
      })
      .join("");
  }

  function renderScene() {
    const scene = STORY.scenes[state.scene];
    if (!scene) { console.error("Unknown scene:", state.scene); return; }

    // 장면 진입 효과 (1회)
    if (scene.phase) state.phase = scene.phase;
    if (scene.location) state.location = scene.location;
    if (scene.status) state.status = scene.status;
    if (scene.onEnter) scene.onEnter(G);

    // 굶주림 (허기 0이면 체력을 깎는다)
    if (state.stats.hunger <= 0 && state.scene !== "game_over") {
      G.mod("health", -6);
      showToast("굶주림이 살을 깎는다.");
    }

    // 사망 체크
    if (state.stats.health <= 0 && state.scene !== "game_over") {
      state.scene = "game_over";
      return renderScene();
    }

    renderSidebar();
    maybeSubmitRun(scene);
    setSceneVisuals(scene);

    // 미니 시스템 위임 (전투 / 지휘)
    if (scene.combat && window.Combat) { window.Combat.start(scene.combat); return; }
    if (scene.command && window.Command) { window.Command.start(scene.command); return; }
    if (scene.skirmish && window.Skirmish) { window.Skirmish.start(scene.skirmish); return; }

    el("scene-title").textContent = typeof scene.title === "function" ? scene.title(G) : scene.title;
    const textArr = typeof scene.text === "function" ? scene.text(G) : scene.text;
    el("scene-text").innerHTML = paragraphsToHTML(textArr);

    // 선택지
    const choicesWrap = el("choices");
    choicesWrap.innerHTML = "";
    const choices = (typeof scene.choices === "function" ? scene.choices(G) : scene.choices) || [];

    choices.forEach((c, i) => {
      if (c.show && !c.show(G)) return;
      const btn = document.createElement("button");
      const enabled = c.enabled ? c.enabled(G) : true;
      btn.className = "choice" + (c.continue ? " continue" : "") + (enabled ? "" : " locked");
      btn.style.animationDelay = i * 0.06 + "s";

      let label = c.text;
      if (c.tag) {
        label += '<span class="choice-tag ' + (c.tagType || "") + '">[' + c.tag + "]</span>";
      }
      if (!enabled && c.lockedText) {
        label += '<span class="choice-tag risk">[' + c.lockedText + "]</span>";
      }
      btn.innerHTML = label;

      if (enabled) btn.addEventListener("click", () => handleChoice(c));
      choicesWrap.appendChild(btn);
    });

    el("scene-text").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ===== 판정 =====
  function resolveCheck(check) {
    const stat = state.stats[check.stat] || 0;
    const bonus = check.bonus ? (typeof check.bonus === "function" ? check.bonus(G) : check.bonus) : 0;
    const chance = clamp(stat + bonus, 5, 95);
    const roll = G.rand(1, 100);
    return { success: roll <= chance, chance, roll };
  }

  // ===== 선택 처리 =====
  function handleChoice(c) {
    if (c.action === "title") {
      showScreen("title");
      el("btn-continue").disabled = !hasSave();
      return;
    }
    if (c.action === "restart") { newGame(); return; }
    if (c.check) {
      const res = resolveCheck(c.check);
      const branch = res.success ? c.onSuccess : c.onFail;
      applyBranch(branch, res);
    } else {
      if (c.effect) c.effect(G);
      finishChoice(c.outcome, c.next);
    }
  }

  function applyBranch(branch, res) {
    if (!branch) return;
    if (branch.effect) branch.effect(G);
    let outcome = branch.outcome;
    if (outcome && typeof outcome.text === "function") {
      outcome = { type: outcome.type, text: outcome.text(res) };
    }
    finishChoice(outcome, branch.next, res);
  }

  function finishChoice(outcome, next, res) {
    renderSidebar();
    // 사망 우선
    if (state.stats.health <= 0) { go("game_over"); return; }

    if (outcome) {
      const choicesWrap = el("choices");
      choicesWrap.innerHTML = "";
      const div = document.createElement("div");
      div.className = "outcome " + (outcome.type || "neutral");
      let txt = outcome.text;
      if (res) {
        txt += ' <span style="opacity:.8">(판정 ' + res.chance + "% / 주사위 " + res.roll + ")</span>";
      }
      div.innerHTML = txt;
      choicesWrap.appendChild(div);

      const cont = document.createElement("button");
      cont.className = "choice continue";
      cont.textContent = "계속 →";
      cont.style.marginTop = "10px";
      cont.addEventListener("click", () => go(next));
      choicesWrap.appendChild(cont);
    } else {
      go(next);
    }
  }

  window.REFRESH_SIDEBAR = renderSidebar;

  function useItem(id) {
    const it = STORY.items[id];
    if (!it || !it.consumable || !state.inventory.includes(id)) return;
    if (it.use) it.use(G);
    state.inventory = state.inventory.filter((x) => x !== id);
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {}
    renderSidebar();
  }

  function useSupply(id) {
    const s = STORY.supplies && STORY.supplies[id];
    if (!s || !state.supplies || (state.supplies[id] || 0) <= 0) return;
    if (s.use) s.use(G);
    state.supplies[id] -= 1;
    if (state.supplies[id] <= 0) delete state.supplies[id];
    if (window.FX) window.FX.flash("heal");
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {}
    renderSidebar();
  }

  function go(sceneId) {
    state.scene = sceneId;
    // 자동 저장 (체크포인트)
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {}
    renderScene();
  }
  window.GO = go;

  // ===== 코덱스 =====
  function openCodex() {
    const modal = el("codex-modal");
    modal.classList.add("active");
    const tabs = el("codex-tabs");
    const content = el("codex-content");
    tabs.innerHTML = "";
    CODEX.forEach((entry, idx) => {
      const b = document.createElement("button");
      b.className = "codex-tab" + (idx === 0 ? " active" : "");
      b.textContent = entry.title;
      b.addEventListener("click", () => {
        [...tabs.children].forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        content.innerHTML = entry.html(state);
        content.scrollTop = 0;
      });
      tabs.appendChild(b);
    });
    content.innerHTML = CODEX[0].html(state);
  }
  function closeCodex() { el("codex-modal").classList.remove("active"); }

  // ===== 명예의 전당 =====
  function escapeHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }
  function renderRow(r, i) {
    const me = window.Cloud && r.player_id === window.Cloud.playerId();
    const rankCls = i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : "";
    const meta = [r.result, r.status, "생존 " + (r.days | 0) + "일",
      (r.survivors != null ? "지휘생존 " + r.survivors : null)]
      .filter(Boolean).join(" · ");
    return (
      '<div class="board-row ' + rankCls + (me ? " me" : "") + '">' +
      '<div class="board-rank">' + (i + 1) + "</div>" +
      '<div class="board-main"><div class="board-pname">' + escapeHTML(r.player_name) +
      (me ? '<span class="me-tag">(나)</span>' : "") + "</div>" +
      '<div class="board-meta">' + escapeHTML(meta) + "</div></div>" +
      '<div class="board-score"><div class="rep">' + (r.reputation | 0) +
      '</div><div class="rep-label">평판</div></div>' +
      "</div>"
    );
  }
  async function openBoard() {
    const modal = el("board-modal");
    modal.classList.add("active");
    const statusEl = el("board-status");
    const listEl = el("board-list");
    const nameInput = el("board-name");
    nameInput.value = window.Cloud ? window.Cloud.playerName() : "";

    if (!window.Cloud || !window.Cloud.enabled()) {
      statusEl.className = "board-status err";
      statusEl.textContent = "클라우드에 연결할 수 없습니다 (오프라인이거나 Supabase 미설정).";
      listEl.innerHTML = "";
      return;
    }
    statusEl.className = "board-status";
    statusEl.textContent = "불러오는 중…";
    listEl.innerHTML = "";
    const r = await window.Cloud.fetchLeaderboard(25);
    if (r.error) {
      statusEl.className = "board-status err";
      const hint = (r.error && r.error.code === "42P01")
        ? " — 테이블이 아직 없습니다. supabase/migrations 의 SQL을 실행하세요."
        : "";
      statusEl.textContent = "전당을 불러오지 못했습니다." + hint;
      return;
    }
    if (!r.data.length) {
      statusEl.textContent = "아직 기록이 없습니다. 첫 생존자가 되어 보세요.";
      return;
    }
    statusEl.textContent = "";
    listEl.innerHTML = r.data.map(renderRow).join("");
  }
  function closeBoard() { el("board-modal").classList.remove("active"); }

  // ===== 소지품 팝업 =====
  function openBag() { renderItems(); el("bag-modal").classList.add("active"); }
  function closeBag() { el("bag-modal").classList.remove("active"); }

  // ===== 능력치(상태창) 팝업 =====
  function renderStatus() {
    const body = el("status-body");
    if (!body) return;
    let html = '<div class="status-charline">' +
      '<span class="status-name">로완</span>' +
      '<span class="status-sub">' + state.status + " · 생존 " + state.day + "일</span></div>";
    html += '<ul class="status-list">';
    ABILITY_STATS.forEach((d) => {
      const v = state.stats[d.key] || 0;
      html += '<li title="' + d.hint + '"><span class="st-name">' + d.name +
        '</span><span class="st-val">' + v + '</span><span class="st-hint">' + d.hint + "</span></li>";
    });
    html += "</ul>";
    html += '<div class="status-foot">허기 ' + state.stats.hunger + " / 100 · 체력 " + state.stats.health + " / 100</div>";
    body.innerHTML = html;
  }
  function openStatus() { renderStatus(); el("status-modal").classList.add("active"); }
  function closeStatus() { el("status-modal").classList.remove("active"); }

  // ===== 새 게임 / 이어하기 =====
  function newGame() {
    state = defaultState();
    showScreen("game");
    go("creation_intro");
  }
  function continueGame() {
    if (load()) { showScreen("game"); renderScene(); }
    else showToast("저장된 기록이 없다.");
  }

  // ===== 초기화 =====
  function init() {
    el("btn-new").addEventListener("click", newGame);
    el("btn-continue").addEventListener("click", continueGame);
    el("btn-continue").disabled = !hasSave();
    el("btn-codex-title").addEventListener("click", openCodex);
    el("btn-cloud-load").addEventListener("click", cloudContinue);
    el("btn-board-title").addEventListener("click", openBoard);

    el("btn-codex").addEventListener("click", openCodex);
    el("btn-board").addEventListener("click", openBoard);
    el("btn-bag").addEventListener("click", openBag);
    el("btn-status").addEventListener("click", openStatus);
    el("codex-close").addEventListener("click", closeCodex);
    el("board-close").addEventListener("click", closeBoard);
    el("bag-close").addEventListener("click", closeBag);
    el("status-close").addEventListener("click", closeStatus);
    el("board-name-save").addEventListener("click", () => {
      if (window.Cloud) {
        window.Cloud.setPlayerName(el("board-name").value);
        showToast("이름을 저장했다: " + (window.Cloud.playerName() || "이름없는 생존자"));
      }
    });
    el("btn-save").addEventListener("click", save);
    el("btn-menu").addEventListener("click", () => {
      showScreen("title");
      el("btn-continue").disabled = !hasSave();
    });
    el("codex-modal").addEventListener("click", (e) => {
      if (e.target === el("codex-modal")) closeCodex();
    });
    el("board-modal").addEventListener("click", (e) => {
      if (e.target === el("board-modal")) closeBoard();
    });
    el("bag-modal").addEventListener("click", (e) => {
      if (e.target === el("bag-modal")) closeBag();
    });
    el("status-modal").addEventListener("click", (e) => {
      if (e.target === el("status-modal")) closeStatus();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeCodex(); closeBoard(); closeBag(); closeStatus(); }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
