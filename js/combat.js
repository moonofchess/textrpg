/* =========================================================
   미니 시스템 — 마물 전투(Combat) & 분대 지휘(Command)
   엔진(renderScene)이 scene.combat / scene.command 를 만나면 위임한다.
   전역 의존: window.G, window.GO, window.REFRESH_SIDEBAR
   ========================================================= */
(function () {
  "use strict";

  const el = (id) => document.getElementById(id);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

  function bar(label, val, max, cls) {
    const pct = clamp(Math.round((val / max) * 100), 0, 100);
    return (
      '<div class="cbt-stat"><div class="cbt-stat-top"><span>' + label +
      "</span><span>" + Math.max(0, val) + " / " + max + "</span></div>" +
      '<div class="cbt-bar"><div class="cbt-fill ' + cls + '" style="width:' + pct + '%"></div></div></div>'
    );
  }
  function pips(label, val, max) {
    let s = "";
    for (let i = 0; i < max; i++) s += '<span class="pip' + (i < val ? " on" : "") + '"></span>';
    return '<div class="cbt-pips"><span>' + label + '</span><span class="pip-row">' + s + "</span></div>";
  }
  function logHTML(arr) {
    return (
      '<div class="cbt-log">' +
      arr.slice(-8).map((p) => '<p class="' + (p.t || "narr") + '">' + p.c + "</p>").join("") +
      "</div>"
    );
  }
  function actionBtn(wrap, label, hint, fn) {
    const b = document.createElement("button");
    b.className = "choice";
    b.innerHTML = label + (hint ? '<span class="choice-tag">' + hint + "</span>" : "");
    b.addEventListener("click", fn);
    wrap.appendChild(b);
  }
  // ---- 액션 이펙트 ----
  const FX = {
    flash(kind) {
      const f = document.getElementById("fx-flash");
      if (!f) return;
      f.className = "";
      void f.offsetWidth;
      f.classList.add("show-" + kind);
    },
    shake() {
      const g = document.querySelector(".game-body") || document.body;
      g.classList.remove("shake");
      void g.offsetWidth;
      g.classList.add("shake");
      setTimeout(() => g.classList.remove("shake"), 440);
    },
    floatDmg(text, kind) {
      const layer = document.getElementById("fx-layer");
      if (!layer) return;
      const span = document.createElement("span");
      span.className = "float-dmg " + (kind || "");
      span.textContent = text;
      const pane = document.querySelector(".story-pane") || document.body;
      const r = pane.getBoundingClientRect();
      const x = r.left + r.width * (0.32 + Math.random() * 0.32);
      const y = r.top + r.height * 0.28 + (kind === "player" ? 46 : 0);
      span.style.left = x + "px";
      span.style.top = y + "px";
      layer.appendChild(span);
      setTimeout(() => span.remove(), 1000);
    },
  };
  window.FX = FX;

  function showOutcomeThenGo(outcome, next) {
    const cw = el("choices");
    cw.innerHTML = "";
    if (outcome) {
      const div = document.createElement("div");
      div.className = "outcome " + (outcome.type || "neutral");
      div.innerHTML = outcome.text;
      cw.appendChild(div);
    }
    const cont = document.createElement("button");
    cont.className = "choice continue";
    cont.textContent = "계속 →";
    cont.addEventListener("click", () => window.GO(next));
    cw.appendChild(cont);
  }

  /* =====================================================
     마물 전투 (1:1)
     config = {
       enemy: { name, grade, maxHp, weakness, intro:[..], moves:[{type,name,dmg,weight}] },
       baseDmg, bonus, allowFlee,
       onWin: { effect(G), outcome, next },
       onLose:{ effect(G), outcome, next }   // 후퇴/물러남
     }
     move.type: light(견제) / heavy(돌진,회피권장) / guarded(허점,찌르기호기) / debuff(교란)
  ===================================================== */
  const Combat = {
    start(config) {
      const G = window.G;
      const st = {
        ehp: config.enemy.maxHp,
        emax: config.enemy.maxHp,
        opening: 0,
        focusPenalty: 0,
        turn: 0,
        intent: null,
        log: (config.enemy.intro || []).slice(),
      };
      this._cfg = config;
      this._st = st;
      this._pickIntent();
      this._render();
    },

    _pickIntent() {
      const moves = this._cfg.enemy.moves;
      const total = moves.reduce((a, m) => a + (m.weight || 1), 0);
      let r = rand(1, total);
      for (const m of moves) { r -= m.weight || 1; if (r <= 0) { this._st.intent = m; return; } }
      this._st.intent = moves[0];
    },

    _hint(intent) {
      switch (intent.type) {
        case "heavy": return "큰 공격 — 회피 권장";
        case "guarded": return "허점 — 찌르기 호기";
        case "debuff": return "정신 교란";
        default: return "견제";
      }
    },

    _render() {
      const cfg = this._cfg, st = this._st, e = cfg.enemy;
      el("scene-title").textContent = "전투 — " + e.name;
      let html = "";
      html += '<div class="cbt-panel">';
      html += '<div class="cbt-enemy"><span class="cbt-grade">' + (e.grade || "") + "</span>" +
        '<span class="cbt-ename">' + e.name + "</span></div>";
      if (e.art) html += '<div class="cbt-art"><img src="assets/img/' + e.art + '.png" alt="" onerror="this.parentNode.style.display=\'none\'"></div>';
      html += bar("적 체력", st.ehp, st.emax, "ehp");
      html += pips("틈(개방)", st.opening, 3);
      html += '<p class="cbt-hint" style="margin-top:8px">회피율 ' + (window.G.s.stats.evasion || 0) + " — 피격 시 자동으로 회피를 시도한다.</p>";
      html += "</div>";
      html += '<p class="danger cbt-intent">▶ ' + e.name + ': ' +
        (st.intent.tell || st.intent.name) + ' <span class="cbt-hint">(' + this._hint(st.intent) + ")</span></p>";
      html += logHTML(st.log);
      el("scene-text").innerHTML = html;

      const cw = el("choices");
      cw.innerHTML = "";
      const self = this;
      actionBtn(cw, "공격", "틈을 실어 약점을 친다", () => self._act("strike"));
      actionBtn(cw, "방어", "이번 피해를 크게 줄인다", () => self._act("brace"));
      actionBtn(cw, "관찰", "틈 +2 (피해 감수)", () => self._act("observe"));
      if (cfg.allowFlee !== false) actionBtn(cw, "후퇴 / 유인", "전투 이탈", () => self._act("flee"));
      el("scene-text").scrollIntoView({ behavior: "smooth", block: "start" });
    },

    _bonus() {
      const cfg = this._cfg;
      const base = typeof cfg.bonus === "function" ? (cfg.bonus(window.G) || 0) : (cfg.bonus || 0);
      return base + (window.G.flag("torch_buff") ? 10 : 0);
    },

    _act(action) {
      const G = window.G, cfg = this._cfg, st = this._st, e = cfg.enemy, intent = st.intent;
      const cbonus = this._bonus();
      let enemyDmg = intent.dmg || 0;
      let dealt = 0, dodged = false;
      const log = [];

      let braced = false;
      if (action === "strike") {
        let dmg = (cfg.baseDmg || 6) + st.opening * 5 + (G.s.stats.attack || 0);
        if (G.has && G.has("whetstone")) dmg += 3;
        if (intent.type === "guarded") dmg = Math.round(dmg * 1.6);
        dealt = dmg;
        log.push({ t: "narr", c: "창대를 비틀어 " + (e.weakness || "급소") + "를 내지른다. (" + dmg + " 피해)" });
        if (st.opening > 0) log.push({ t: "good", c: "벌려둔 틈으로 깊이 박혔다." });
        st.opening = 0;
      } else if (action === "brace") {
        braced = true;
        enemyDmg = Math.round(enemyDmg * 0.3);
        log.push({ t: "narr", c: "방패와 창대를 세워 " + intent.name + "의 충격을 흘릴 채비를 한다." });
      } else if (action === "observe") {
        st.opening = Math.min(3, st.opening + 2);
        log.push({ t: "think", c: "숨을 죽이고 놈의 결을 읽는다. 약점이 보인다. (틈 +2)" });
      } else if (action === "flee") {
        const chance = clamp(20 + (G.s.stats.evasion || 0) * 3 + cbonus, 5, 95);
        if (rand(1, 100) <= chance) {
          this._end("flee", [{ t: "narr", c: "등을 보이지 않고 천천히 거리를 벌린다. 도망도 엄연한 기술이다." }]);
          return;
        }
        log.push({ t: "bad", c: "물러나려는 순간 놈이 거리를 좁힌다." });
      }

      // 자동 회피 (회피율 기반) — 들어오는 피해가 있을 때 시도
      if (enemyDmg > 0) {
        const evaChance = clamp(10 + (G.s.stats.evasion || 0) * 4 + (braced ? 15 : 0) - (intent.type === "debuff" ? 12 : 0), 5, 88);
        if (rand(1, 100) <= evaChance) {
          dodged = true;
          enemyDmg = 0;
          st.opening = Math.min(3, st.opening + 1);
          log.push({ t: "good", c: "본능적으로 몸을 틀어 " + intent.name + "을(를) 흘려보냈다. (자동 회피, 틈 +1)" });
          FX.floatDmg("회피", "dodge");
        }
      }

      if (intent.type === "debuff" && !dodged) {
        log.push({ t: "bad", c: intent.name + "에 정신이 흔들린다." });
      }
      if (enemyDmg > 0 && G.has && G.has("jerkin")) enemyDmg = Math.max(1, Math.round(enemyDmg * 0.75));
      if (enemyDmg > 0 && (G.s.stats.defense || 0) > 0) enemyDmg = Math.max(1, enemyDmg - (G.s.stats.defense || 0));
      // 액션 이펙트
      if (braced && !dodged && enemyDmg < (intent.dmg || 0)) FX.floatDmg("막음", "guard");
      if (dealt > 0) { FX.floatDmg("-" + dealt, "enemy"); FX.flash("enemy"); }
      if (enemyDmg > 0) {
        G.mod("health", -enemyDmg);
        log.push({ t: "danger", c: "로완이 " + enemyDmg + " 피해를 입었다." });
        FX.floatDmg("-" + enemyDmg, "player");
        FX.flash("hit");
        FX.shake();
      }
      if (dealt > 0) st.ehp = Math.max(0, st.ehp - dealt);

      st.log.push(...log);
      window.REFRESH_SIDEBAR && window.REFRESH_SIDEBAR();

      if (st.ehp <= 0) { this._end("win"); return; }
      if (G.s.stats.health <= 0) { window.GO("game_over"); return; }

      st.turn++;
      this._pickIntent();
      this._render();
    },

    _end(result, extraLog) {
      const G = window.G, cfg = this._cfg, st = this._st;
      if (G.flag("torch_buff")) G.setFlag("torch_buff", false);
      if (extraLog) st.log.push(...extraLog);
      if (result === "win") st.log.push({ t: "good", c: cfg.enemy.name + "이(가) 쓰러졌다." });

      const branch = result === "win" ? cfg.onWin : cfg.onLose;
      if (branch && branch.effect) branch.effect(G);
      window.REFRESH_SIDEBAR && window.REFRESH_SIDEBAR();

      el("scene-title").textContent = "전투 — " + cfg.enemy.name;
      el("scene-text").innerHTML = logHTML(st.log);
      showOutcomeThenGo(branch && branch.outcome, branch && branch.next);
    },
  };

  /* =====================================================
     분대 지휘 (십장 전투)
     config = {
       intro:[..], squad:10, morale:60,
       waves:[ { desc:[..], threat:3 }, ... ],  // 마지막 wave 버티면 승리(증원 도착)
       onComplete(G, result) -> next sceneId   // result={survivors,maxSquad,morale,casualties,routed}
     }
     명령: 엄폐 / 전열 / 매복 / 후퇴
  ===================================================== */
  const Command = {
    start(config) {
      const G = window.G;
      const squad = typeof config.squad === "function" ? config.squad(G) : config.squad;
      const morale = typeof config.morale === "function" ? config.morale(G) : config.morale;
      const st = {
        men: squad,
        maxMen: squad,
        morale: clamp(morale, 0, 100),
        pressure: clamp(typeof config.pressure === "function" ? config.pressure(G) : (config.pressure || 20), 0, 100),
        wave: 0,
        casualties: 0,
        routed: false,
        log: (config.intro || []).slice(),
        phase: "order", // order | result
      };
      this._cfg = config;
      this._st = st;
      this._render();
    },

    _render() {
      const cfg = this._cfg, st = this._st;
      const wave = cfg.waves[st.wave];
      el("scene-title").textContent = "지휘 — 제 " + (st.wave + 1) + " 파";
      let html = "";
      html += '<div class="cmd-panel">';
      html += bar("병력", st.men, st.maxMen, "men");
      html += bar("사기", st.morale, 100, "morale");
      html += bar("적 압력", st.pressure, 100, "pressure");
      html += "</div>";
      if (st.phase === "order" && wave) {
        html += '<div class="cmd-wave">' + wave.desc.map((p) => '<p class="' + (p.t || "narr") + '">' + p.c + "</p>").join("") + "</div>";
      }
      html += logHTML(st.log);
      el("scene-text").innerHTML = html;

      const cw = el("choices");
      cw.innerHTML = "";
      const self = this;
      if (st.phase === "order") {
        actionBtn(cw, "“담 밑으로 기어!” — 엄폐", "사상 최소 · 진지 양보", () => self._order("cover"));
        actionBtn(cw, "“창 버리지 마, 버텨!” — 전열 유지", "사기에 좌우 · 적 격퇴", () => self._order("hold"));
        actionBtn(cw, "“진흙 발라, 골목으로 유인!” — 매복", "눈치 판정 · 대박/쪽박", () => self._order("ambush"));
        actionBtn(cw, "“보급로로, 천천히 물러나!” — 질서 후퇴", "병력 보존 · 사기 회복", () => self._order("retreat"));
      }
      el("scene-text").scrollIntoView({ behavior: "smooth", block: "start" });
    },

    _order(order) {
      const G = window.G, cfg = this._cfg, st = this._st;
      const wave = cfg.waves[st.wave];
      const threat = wave.threat || 4;
      const read = Math.floor((G.s.stats.awareness || 0) / 35); // 눈치가 사상자 경감
      let cas = 0, dMorale = 0, dPressure = 0, romanHurt = 0;
      const log = [];

      if (order === "cover") {
        cas = Math.max(0, rand(0, 1) + threat - 4 - read);
        dMorale = -4; dPressure = +12;
        log.push({ t: "narr", c: "“전부 담 밑으로! 서 있는 놈부터 죽는다!” 화살과 발톱이 머리 위를 스친다. 몸은 지켰지만, 적은 한 걸음 더 들어왔다." });
      } else if (order === "hold") {
        const moraleFactor = 1 - st.morale / 150;
        cas = Math.max(0, Math.round(threat * moraleFactor) - read + rand(0, 1));
        dPressure = -16;
        if (st.morale >= 45) { dMorale = +5; log.push({ t: "good", c: "“창 내려놓는 놈은 내 손에 죽는다!” 전열이 버틴다. 밀려오던 적이 창벽에 부딪혀 무너진다." }); }
        else { dMorale = -6; cas += 1; log.push({ t: "bad", c: "겁에 질린 병사들의 전열이 흔들린다. 한 귀퉁이가 뚫리며 비명이 인다." }); }
      } else if (order === "ambush") {
        const chance = clamp((G.s.stats.awareness || 0) + 10, 10, 90);
        const roll = rand(1, 100);
        if (roll <= chance) {
          cas = Math.max(0, rand(0, 1) - read); dMorale = +10; dPressure = -28;
          log.push({ t: "good", c: "좁은 골목으로 적을 흘려넣는다 — 청연이 뒷골목에서 익힌 가두는 법. 갇힌 적이 우리 창에 차곡차곡 쓰러진다. [" + chance + "% / " + roll + "]" });
        } else {
          cas = Math.round(threat * 0.5) + rand(0, 1); dMorale = -10; dPressure = +10; romanHurt = 6;
          log.push({ t: "bad", c: "유인이 어긋났다. 오히려 우리가 좁은 곳에 몰려 난전이 벌어진다. [" + chance + "% / " + roll + "]" });
        }
      } else if (order === "retreat") {
        cas = Math.max(0, threat - 5 - read); dMorale = +6; dPressure = +14;
        log.push({ t: "narr", c: "“줄 맞춰서, 천천히! 등 보이지 마라!” 질서 있게 물러난다. 땅은 내줬지만 사람은 지켰다." });
      }

      cas = Math.max(0, cas);
      if (cas > 0) {
        st.men = Math.max(0, st.men - cas);
        st.casualties += cas;
        log.push({ t: "danger", c: "아군 " + cas + "명이 쓰러졌다." });
        FX.floatDmg("-" + cas + "명", "player");
        FX.flash("hit");
        FX.shake();
      } else if (dPressure < 0) {
        FX.floatDmg("격퇴", "dodge");
      }
      st.morale = clamp(st.morale + dMorale, 0, 100);
      st.pressure = clamp(st.pressure + dPressure, 0, 100);
      if (romanHurt) { G.mod("health", -romanHurt); FX.flash("hit"); }

      // 사기 붕괴 / 압도 처리
      if (st.morale <= 0 && !st.routed) {
        st.routed = true;
        const flee = Math.min(st.men, rand(1, 2));
        st.men -= flee; st.casualties += flee;
        log.push({ t: "bad", c: "사기가 바닥났다. 병사 " + flee + "명이 창을 버리고 달아난다." });
        st.morale = 12;
      }

      window.REFRESH_SIDEBAR && window.REFRESH_SIDEBAR();

      // 패배 조건
      if (st.men <= 0) { st.log.push(...log); this._finish("wiped"); return; }
      if (st.pressure >= 100) { st.log.push(...log); this._finish("overrun"); return; }
      if (G.s.stats.health <= 0) { window.GO("game_over"); return; }

      st.log.push(...log);
      st.wave++;
      if (st.wave >= cfg.waves.length) { this._finish("held"); return; }
      this._render();
    },

    _finish(result) {
      const G = window.G, cfg = this._cfg, st = this._st;
      const summary = {
        survivors: st.men, maxSquad: st.maxMen, morale: st.morale,
        casualties: st.casualties, routed: st.routed, result: result,
      };
      const next = cfg.onComplete(G, summary);
      window.REFRESH_SIDEBAR && window.REFRESH_SIDEBAR();

      el("scene-title").textContent = "지휘 — 전투 종료";
      let outType = result === "held" ? "good" : "bad";
      let head;
      if (result === "held") head = "증원이 도착했다. 당신의 분대는 전선을 지켰다.";
      else if (result === "wiped") head = "분대가 전멸했다. 당신만이 살아 남았다.";
      else head = "전선이 무너졌다. 살아남은 자들과 함께 떠밀려 후퇴한다.";
      st.log.push({ t: outType === "good" ? "good" : "danger", c: head });
      st.log.push({ t: "sys", c: "생존 " + st.men + "/" + st.maxMen + " · 전사 " + st.casualties + "명 · 사기 " + st.morale });
      el("scene-text").innerHTML = logHTML(st.log);
      showOutcomeThenGo(null, next);
    },
  };

  /* =====================================================
     교전 (Skirmish) — 이름·스탯을 가진 분대 단위 전투
     config = {
       battles: [ { intro:[..], pressure?, waves:[{threat, desc:[..]}] }, ... ],
       onComplete(G, result) -> next   // result={survivors, dead:[names], result}
     }
     state.squad = [{name,hp,maxHp,skill}], state.skirmishIndex 로 회차 선택
  ===================================================== */
  function rosterHTML(squad) {
    const living = squad.filter((s) => s.hp > 0);
    if (!living.length) return '<div class="cmd-wave"><p class="danger">남은 병사가 없다.</p></div>';
    let h = '<div class="roster">';
    living.forEach((s) => {
      const pct = clamp(Math.round((s.hp / s.maxHp) * 100), 0, 100);
      let stars = "";
      for (let i = 0; i < 5; i++) stars += i < s.skill ? "★" : "☆";
      const low = s.hp <= s.maxHp * 0.34 ? " low" : "";
      h += '<div class="soldier' + low + '"><div class="sol-top"><span class="sol-name">' + s.name +
        '</span><span class="sol-skill">' + stars + "</span></div>" +
        '<div class="sol-bar"><div class="sol-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="sol-hp">' + Math.max(0, s.hp) + " / " + s.maxHp + "</div></div>";
    });
    h += "</div>";
    return h;
  }
  window.rosterHTML = rosterHTML;

  function soldierCard(s, clickable) {
    const pct = clamp(Math.round((s.hp / s.maxHp) * 100), 0, 100);
    let stars = "";
    for (let i = 0; i < 5; i++) stars += i < s.skill ? "★" : "☆";
    const low = s.hp <= s.maxHp * 0.34 ? " low" : "";
    const tag = clickable ? "button" : "div";
    const cls = "soldier" + low + (clickable ? " sol-toggle" : "");
    const attr = clickable ? ' data-name="' + s.name.replace(/"/g, "") + '"' : "";
    return "<" + tag + ' class="' + cls + '"' + attr + '><div class="sol-top"><span class="sol-name">' + s.name +
      '</span><span class="sol-skill">' + stars + "</span></div>" +
      '<div class="sol-bar"><div class="sol-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="sol-hp">' + Math.max(0, s.hp) + " / " + s.maxHp + "</div></" + tag + ">";
  }

  const Skirmish = {
    start(config) {
      const G = window.G;
      const idx = config.useIndex ? (G.s.skirmishIndex || 0) : 0;
      const battle = config.battles[idx] || config.battles[config.battles.length - 1];
      this._cfg = config;
      this._battle = battle;
      // 진형 초기화: rank 미지정 병사는 앞 5명 1열, 나머지 2열
      const sq = (G.s.squad || []).filter((s) => s.hp > 0);
      sq.forEach((s, i) => { if (s.rank !== 1 && s.rank !== 2) s.rank = i < 5 ? 1 : 2; });
      const evalNum = (v, d) => (typeof v === "function" ? v(G) : (typeof v === "number" ? v : d));
      this._st = {
        phase: "deploy",
        pressure: clamp(evalNum(battle.pressure, 20), 0, 100),
        morale: clamp(evalNum(battle.morale, 60), 0, 100),
        wave: 0,
        deadNames: [],
        log: (battle.intro || []).slice(),
      };
      this._renderDeploy();
    },

    _living() { return (window.G.s.squad || []).filter((s) => s.hp > 0); },
    _rank(n) { return this._living().filter((s) => s.rank === n); },

    _formationHTML(clickable) {
      const r1 = this._rank(1), r2 = this._rank(2);
      let h = '<div class="rank-block"><div class="rank-label rank1">전열 · 1열 (' + r1.length + "명)</div>";
      h += '<div class="roster">' + (r1.map((s) => soldierCard(s, clickable)).join("") || '<span class="empty">— 비어 있음 —</span>') + "</div></div>";
      h += '<div class="rank-block"><div class="rank-label rank2">후열 · 2열 (' + r2.length + "명)</div>";
      h += '<div class="roster">' + (r2.map((s) => soldierCard(s, clickable)).join("") || '<span class="empty">— 비어 있음 —</span>') + "</div></div>";
      return h;
    },

    // ---- 배치 단계 ----
    _renderDeploy() {
      const st = this._st, self = this;
      el("scene-title").textContent = "진형 배치";
      let html = '<div class="cmd-wave">' + st.log.map((p) => '<p class="' + (p.t || "narr") + '">' + p.c + "</p>").join("") + "</div>";
      html += '<p class="cbt-hint">병사를 눌러 1열·2열을 바꾼다. <b>전열(1열)이 적의 공격을 받아낸다.</b> 5명씩 나누는 것을 권한다.</p>';
      html += this._formationHTML(true);
      el("scene-text").innerHTML = html;
      [...document.querySelectorAll(".sol-toggle")].forEach((btn) => {
        btn.addEventListener("click", () => {
          const name = btn.getAttribute("data-name");
          const s = (window.G.s.squad || []).find((x) => x.name === name);
          if (s) { s.rank = s.rank === 1 ? 2 : 1; self._renderDeploy(); }
        });
      });
      const cw = el("choices");
      cw.innerHTML = "";
      actionBtn(cw, "전투 시작", "이 진형으로 맞선다", () => {
        if (!self._rank(1).length) { self._living().forEach((s) => s.rank = 1); }
        st.phase = "battle"; self._pickTell(); self._renderBattle();
      });
      el("scene-text").scrollIntoView({ behavior: "smooth", block: "start" });
    },

    // ---- 전투 단계 ----
    _pickTell() {
      const pool = [
        { name: "전열을 휩쓰는 범위 공격", mult: 1.0 },
        { name: "전열을 짓밟는 강타", mult: 1.55 },
        { name: "밀어붙이며 진격한다", mult: 0.6 },
      ];
      this._st.tell = pool[rand(0, pool.length - 1)];
    },

    _renderBattle() {
      const G = window.G, st = this._st, battle = this._battle, self = this;
      const total = battle.waves.length;
      el("scene-title").textContent = "지휘 — 제 " + (st.wave + 1) + " / " + total + " 파";
      const wave = battle.waves[st.wave];
      let html = '<div class="cmd-panel">';
      html += bar("적 압력", st.pressure, 100, "pressure");
      html += bar("사기", st.morale, 100, "morale");
      html += "</div>";
      if (wave && wave.desc) html += '<div class="cmd-wave">' + wave.desc.map((p) => '<p class="' + (p.t || "narr") + '">' + p.c + "</p>").join("") + "</div>";
      html += '<p class="danger cbt-intent">▶ 적: ' + st.tell.name + "</p>";
      html += this._formationHTML(false);
      html += logHTML(st.log);
      el("scene-text").innerHTML = html;

      const cw = el("choices");
      cw.innerHTML = "";
      actionBtn(cw, "전열 방어", "1열이 막는다 · 피해 급감", () => self._turn("guard"));
      actionBtn(cw, "후열 지원", "2열이 전열을 치료·엄호", () => self._turn("support"));
      actionBtn(cw, "일제 공격", "양 열 총공격 · 전열 노출", () => self._turn("allout"));
      actionBtn(cw, "진형 교대", "1열↔2열 · 부상자 후방으로", () => self._turn("swap"));
      actionBtn(cw, "사기 진작", "허기 소모 · 사기 +25", () => self._turn("rally"));
      el("scene-text").scrollIntoView({ behavior: "smooth", block: "start" });
    },

    _turn(order) {
      const G = window.G, st = this._st, battle = this._battle;
      const wave = battle.waves[st.wave];
      const threat = wave.threat || 4;
      const log = [];
      let dPressure = threat; // 적은 매 턴 밀고 들어온다
      let incomingMult = st.tell.mult;
      let healFront = 0;

      if (order === "guard") {
        incomingMult *= 0.4; dPressure -= 6;
        log.push({ t: "good", c: "“1열, 방패 들어! 버텨라!” 전열이 몸으로 충격을 받아낸다." });
      } else if (order === "support") {
        healFront = 7; dPressure -= 8; incomingMult *= 0.85;
        log.push({ t: "good", c: "“2열, 부상자 끌어내고 빈자리 메워!” 후열이 전열을 치료하며 받친다." });
      } else if (order === "allout") {
        dPressure -= 16; incomingMult *= 1.4;
        log.push({ t: "narr", c: "“전원 찔러, 밀어내!” 양 열이 한꺼번에 적을 들이친다 — 대신 전열이 그대로 노출된다." });
      } else if (order === "swap") {
        this._living().forEach((s) => { s.rank = s.rank === 1 ? 2 : 1; });
        incomingMult *= 0.7; dPressure += 2;
        log.push({ t: "narr", c: "“1열 뒤로, 2열 앞으로!” 진형이 회전하며 지친 전열이 숨을 돌린다." });
      } else if (order === "rally") {
        if (G.s.stats.hunger >= 8) {
          G.mod("hunger", -10); st.morale = clamp(st.morale + 25, 0, 100);
          log.push({ t: "good", c: "“우린 안 죽어! 본대가 온다, 조금만 더 버텨!” 목이 터져라 외친다. 흔들리던 전열이 다시 곧추선다. (사기 +25)" });
        } else {
          log.push({ t: "bad", c: "외칠 기운조차 없다. 허기가 발목을 잡는다." });
        }
      }

      const moraleFactor = clamp(1 + (60 - st.morale) / 120, 0.6, 1.6);
      if (!this._rank(1).length) this._living().forEach((s) => s.rank = 1);
      if (healFront) this._rank(1).forEach((s) => { s.hp = Math.min(s.maxHp, s.hp + healFront); });

      let incoming = Math.round(threat * 3 * incomingMult * moraleFactor);
      let dealtTotal = 0, dodges = 0, guard2 = 0;
      while (incoming > 0 && this._rank(1).length && guard2++ < 50) {
        const f = this._rank(1);
        const tgt = f[Math.floor(Math.random() * f.length)];
        const eva = clamp(15 + (G.s.stats.evasion || 0) * 3 + tgt.skill * 3, 5, 80);
        const hit = Math.min(incoming, G.rand(5, 12));
        incoming -= hit;
        if (rand(1, 100) <= eva) { dodges++; continue; }
        tgt.hp -= hit; dealtTotal += hit;
        if (tgt.hp <= 0) { tgt.hp = 0; st.deadNames.push(tgt.name); st.morale = clamp(st.morale - 12, 0, 100); log.push({ t: "danger", c: tgt.name + "이(가) 쓰러졌다." }); }
      }
      G.s.squad = (G.s.squad || []).filter((s) => s.hp > 0);

      if (dealtTotal > 0) {
        st.morale = clamp(st.morale - Math.floor(dealtTotal / 8), 0, 100);
        const romanShare = Math.max(0, Math.floor(dealtTotal / 14) - Math.floor((G.s.stats.defense || 0) / 3));
        if (romanShare > 0) G.mod("health", -romanShare);
        FX.flash("hit"); FX.shake(); FX.floatDmg("-" + dealtTotal, "player");
        log.push({ t: "danger", c: "전열이 " + dealtTotal + " 피해를 입었다." + (dodges ? " (" + dodges + "회 회피)" : "") });
      } else {
        FX.floatDmg(dodges ? "전원 회피!" : "격퇴", "dodge");
        if (dodges) log.push({ t: "good", c: "전열이 " + dodges + "회 공격을 모두 흘려냈다." });
      }

      st.pressure = clamp(st.pressure + dPressure, 0, 100);

      if (st.morale <= 0) {
        const f = this._living();
        if (f.length) { f[0].hp = 0; st.deadNames.push(f[0].name + "(이탈)"); G.s.squad = (G.s.squad || []).filter((s) => s.hp > 0); log.push({ t: "bad", c: f[0].name + "이(가) 창을 버리고 달아났다. 사기가 바닥이다." }); }
        st.morale = 15;
      }

      window.REFRESH_SIDEBAR && window.REFRESH_SIDEBAR();
      st.log.push(...log);

      if (this._living().length <= 0) { this._finish("wiped"); return; }
      if (st.pressure >= 100) { this._finish("overrun"); return; }
      if (G.s.stats.health <= 0) { window.GO("game_over"); return; }

      st.wave++;
      if (st.wave >= battle.waves.length) { this._finish("held"); return; }
      this._pickTell();
      this._renderBattle();
    },

    _finish(result) {
      const G = window.G, cfg = this._cfg, st = this._st;
      const summary = { survivors: this._living().length, dead: st.deadNames, result: result, morale: st.morale };
      const next = cfg.onComplete(G, summary);
      window.REFRESH_SIDEBAR && window.REFRESH_SIDEBAR();
      el("scene-title").textContent = "전투 종료";
      let head;
      if (result === "held") head = "적이 물러났다. 진형은 끝내 무너지지 않았다.";
      else if (result === "wiped") head = "분대가 전멸했다. 당신만이 살아 남았다.";
      else head = "압력을 버티지 못하고 진지를 내주며 후퇴한다.";
      st.log.push({ t: result === "held" ? "good" : "danger", c: head });
      if (st.deadNames.length) st.log.push({ t: "sys", c: "전사: " + st.deadNames.join(", ") });
      el("scene-text").innerHTML = rosterHTML(G.s.squad || []) + logHTML(st.log);
      showOutcomeThenGo(null, next);
    },
  };

  window.Combat = Combat;
  window.Command = Command;
  window.Skirmish = Skirmish;
})();
