/* =========================================================
   그냥 중세 판타지에서 살아남기 — 게임 엔진
   데이터 기반 장면 엔진. 스토리는 js/story.js 에 정의.
   ========================================================= */
(function () {
  "use strict";

  const SAVE_KEY = "graymarch_save_v1";

  // ---- 스탯 정의 ----
  const STAT_DEFS = [
    { key: "hunger", name: "허기", hint: "낮을수록 굶주린다" },
    { key: "health", name: "체력", hint: "0이 되면 죽는다" },
    { key: "awareness", name: "눈치", hint: "청연의 밑바닥 감각" },
    { key: "reputation", name: "평판", hint: "이름이 알려진 정도" },
  ];

  function defaultState() {
    return {
      stats: { hunger: 35, health: 55, awareness: 45, reputation: 5 },
      coins: 0,
      ration: 0,
      day: 1,
      scene: "intro",
      flags: {},
      inventory: [],
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
      state.stats[stat] = clamp(state.stats[stat] + delta, 0, 100);
    },
    set(stat, val) { state.stats[stat] = clamp(val, 0, 100); },
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
    STAT_DEFS.forEach((d) => {
      const v = state.stats[d.key];
      const div = document.createElement("div");
      div.className = "stat";
      div.title = d.hint;
      div.innerHTML =
        '<div class="stat-top"><span class="stat-name">' + d.name +
        '</span><span class="stat-val">' + v + "</span></div>" +
        '<div class="stat-bar"><div class="stat-fill ' + d.key +
        (v <= 20 ? " low" : "") + '" style="width:' + v + '%"></div></div>';
      wrap.appendChild(div);
    });

    // 소지품
    const inv = el("inventory-list");
    inv.innerHTML = "";
    if (state.inventory.length === 0) {
      inv.innerHTML = '<li class="empty">없음</li>';
    } else {
      state.inventory.forEach((id) => {
        const it = STORY.items[id] || { name: id, desc: "" };
        const li = document.createElement("li");
        li.innerHTML = it.name + (it.desc ? '<span class="item-desc">' + it.desc + "</span>" : "");
        inv.appendChild(li);
      });
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

    // 미니 시스템 위임 (전투 / 지휘)
    if (scene.combat && window.Combat) { window.Combat.start(scene.combat); return; }
    if (scene.command && window.Command) { window.Command.start(scene.command); return; }

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

  // ===== 새 게임 / 이어하기 =====
  function newGame() {
    state = defaultState();
    showScreen("game");
    go("intro");
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
    el("codex-close").addEventListener("click", closeCodex);
    el("board-close").addEventListener("click", closeBoard);
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
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeCodex(); closeBoard(); }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
