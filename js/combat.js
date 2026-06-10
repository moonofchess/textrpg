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
      html += bar("적 체력", st.ehp, st.emax, "ehp");
      html += pips("틈(개방)", st.opening, 3);
      html += "</div>";
      html += '<p class="danger cbt-intent">▶ ' + e.name + ': ' +
        (st.intent.tell || st.intent.name) + ' <span class="cbt-hint">(' + this._hint(st.intent) + ")</span></p>";
      html += logHTML(st.log);
      el("scene-text").innerHTML = html;

      const cw = el("choices");
      cw.innerHTML = "";
      const self = this;
      actionBtn(cw, "약점 찌르기", "틈 소모 · 큰 피해", () => self._act("strike"));
      actionBtn(cw, "보법 회피", "눈치 판정 · 틈 확보", () => self._act("dodge"));
      actionBtn(cw, "방어 태세", "피해 경감", () => self._act("brace"));
      actionBtn(cw, "관찰", "틈 +2 · 피해 감수", () => self._act("observe"));
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

      if (action === "strike") {
        let dmg = (cfg.baseDmg || 6) + st.opening * 5;
        if (G.has && G.has("whetstone")) dmg += 3;
        if (intent.type === "guarded") dmg = Math.round(dmg * 1.6);
        dealt = dmg;
        log.push({ t: "narr", c: "창대를 비틀어 " + (e.weakness || "급소") + "를 내지른다. (" + dmg + " 피해)" });
        if (st.opening > 0) log.push({ t: "good", c: "벌려둔 틈으로 깊이 박혔다." });
        st.opening = 0;
      } else if (action === "dodge") {
        const chance = clamp((G.s.stats.awareness || 0) + cbonus - st.focusPenalty, 5, 95);
        const roll = rand(1, 100);
        if (roll <= chance) {
          dodged = true; enemyDmg = 0;
          const gain = intent.type === "heavy" ? 2 : 1;
          st.opening = Math.min(3, st.opening + gain);
          log.push({ t: "good", c: "보법으로 " + intent.name + "을(를) 흘려보낸다. 사각이 열렸다. (틈 +" + gain + ") [" + chance + "% / " + roll + "]" });
          st.focusPenalty = 0;
        } else {
          log.push({ t: "bad", c: "피하려 했지만 한 박자 늦었다. " + intent.name + "이(가) 적중한다. [" + chance + "% / " + roll + "]" });
        }
      } else if (action === "brace") {
        enemyDmg = Math.round(enemyDmg * 0.3);
        log.push({ t: "narr", c: "방패와 창대를 세워 " + intent.name + "의 충격을 흘린다." });
      } else if (action === "observe") {
        st.opening = Math.min(3, st.opening + 2);
        st.focusPenalty = 0;
        log.push({ t: "think", c: "숨을 죽이고 놈의 결을 읽는다. 약점이 보인다. (틈 +2)" });
      } else if (action === "flee") {
        const chance = clamp((G.s.stats.awareness || 0) + cbonus + 10, 5, 95);
        if (rand(1, 100) <= chance) {
          this._end("flee", [{ t: "narr", c: "등을 보이지 않고 천천히 거리를 벌린다. 청연은 도망도 기술이라 배웠다." }]);
          return;
        }
        log.push({ t: "bad", c: "물러나려는 순간 놈이 거리를 좁힌다." });
      }

      if (intent.type === "debuff" && !dodged && action !== "brace") {
        st.focusPenalty = 15;
        log.push({ t: "bad", c: intent.name + "에 정신이 흔들린다. 다음 회피가 둔해진다." });
      }
      if (enemyDmg > 0 && G.has && G.has("jerkin")) enemyDmg = Math.max(1, Math.round(enemyDmg * 0.75));
      // 액션 이펙트
      if (action === "dodge" && dodged) FX.floatDmg("회피", "dodge");
      if (action === "brace" && enemyDmg < (intent.dmg || 0)) FX.floatDmg("막음", "guard");
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

  const Skirmish = {
    start(config) {
      const G = window.G;
      const idx = G.s.skirmishIndex || 0;
      const battle = config.battles[idx] || config.battles[config.battles.length - 1];
      this._cfg = config;
      this._battle = battle;
      this._st = {
        pressure: clamp(typeof battle.pressure === "number" ? battle.pressure : 15, 0, 100),
        wave: 0,
        deadNames: [],
        log: (battle.intro || []).slice(),
      };
      this._render();
    },

    _living() { return (window.G.s.squad || []).filter((s) => s.hp > 0); },

    _render() {
      const G = window.G, st = this._st, battle = this._battle;
      const idx = (G.s.skirmishIndex || 0) + 1;
      el("scene-title").textContent = "교전 " + idx + "/3 — 제 " + (st.wave + 1) + " 파";
      const wave = battle.waves[st.wave];
      let html = '<div class="cmd-panel">';
      html += bar("적 압력", st.pressure, 100, "pressure");
      html += "</div>";
      html += rosterHTML(G.s.squad || []);
      if (wave) html += '<div class="cmd-wave">' + wave.desc.map((p) => '<p class="' + (p.t || "narr") + '">' + p.c + "</p>").join("") + "</div>";
      html += logHTML(st.log);
      el("scene-text").innerHTML = html;

      const cw = el("choices");
      cw.innerHTML = "";
      const self = this;
      actionBtn(cw, "“담 밑으로 기어!” — 엄폐", "사상 최소 · 진지 양보", () => self._order("cover"));
      actionBtn(cw, "“창 들어, 버텨!” — 전열 유지", "적 격퇴 · 부상 위험", () => self._order("hold"));
      actionBtn(cw, "“골목으로 유인!” — 매복", "눈치 판정 · 대박/쪽박", () => self._order("ambush"));
      actionBtn(cw, "“줄 맞춰 물러나!” — 질서 후퇴", "병사 회복 · 진지 양보", () => self._order("retreat"));
      el("scene-text").scrollIntoView({ behavior: "smooth", block: "start" });
    },

    _distribute(amount) {
      const G = window.G;
      const log = [];
      // 로완도 일부를 짊어진다
      const romanShare = Math.round(amount * 0.15);
      if (romanShare > 0) { G.mod("health", -romanShare); FX.flash("hit"); }
      let rest = amount - romanShare;
      let guard = 0;
      while (rest > 0 && guard++ < 30) {
        const living = this._living();
        if (!living.length) break;
        const tgt = living[Math.floor(Math.random() * living.length)];
        const hit = Math.min(rest, G.rand(5, 11));
        tgt.hp -= hit;
        rest -= hit;
        if (tgt.hp <= 0) {
          tgt.hp = 0;
          this._st.deadNames.push(tgt.name);
          log.push({ t: "danger", c: tgt.name + "이(가) 쓰러졌다." });
          FX.shake();
        }
      }
      // 사망자 제거
      G.s.squad = (G.s.squad || []).filter((s) => s.hp > 0);
      if (amount > 0) FX.floatDmg("-" + amount, "player");
      return log;
    },

    _order(order) {
      const G = window.G, st = this._st, battle = this._battle;
      const wave = battle.waves[st.wave];
      const threat = wave.threat || 4;
      const living = this._living();
      const power = living.reduce((a, s) => a + s.skill, 0) + Math.floor((G.s.stats.awareness || 0) / 20);
      let incoming = 0, dPressure = 0;
      const log = [];

      if (order === "cover") {
        incoming = Math.round(threat * 1.5);
        dPressure = +12;
        log.push({ t: "narr", c: "“전부 담 밑으로!” 화살과 발톱이 머리 위를 스친다. 몸은 지켰지만 적이 한 걸음 더 들어왔다." });
      } else if (order === "hold") {
        incoming = Math.max(0, threat * 4 - power * 2);
        dPressure = -16;
        log.push({ t: "good", c: "“창 내려놓는 놈은 내 손에 죽는다!” 전열이 적을 창벽으로 받아낸다." });
      } else if (order === "ambush") {
        const chance = clamp((G.s.stats.awareness || 0) + 10, 10, 90);
        const roll = rand(1, 100);
        if (roll <= chance) {
          incoming = Math.round(threat * 1);
          dPressure = -28;
          log.push({ t: "good", c: "좁은 길로 적을 흘려 넣어 가둔다. 갇힌 적이 우리 창에 쓰러진다. [" + chance + "% / " + roll + "]" });
        } else {
          incoming = Math.round(threat * 5);
          dPressure = +8;
          log.push({ t: "bad", c: "유인이 어긋났다. 오히려 우리가 몰려 난전이 벌어진다. [" + chance + "% / " + roll + "]" });
        }
      } else if (order === "retreat") {
        incoming = Math.round(threat * 1);
        dPressure = +12;
        this._living().forEach((s) => { s.hp = Math.min(s.maxHp, s.hp + 3); });
        log.push({ t: "narr", c: "“줄 맞춰서, 천천히! 등 보이지 마라!” 질서 있게 물러나며 부상자를 추스른다." });
      }

      if (incoming > 0) log.push(...this._distribute(incoming));
      else { FX.floatDmg("격퇴", "dodge"); }
      st.pressure = clamp(st.pressure + dPressure, 0, 100);

      window.REFRESH_SIDEBAR && window.REFRESH_SIDEBAR();
      st.log.push(...log);

      if (this._living().length <= 0) { this._finish("wiped"); return; }
      if (st.pressure >= 100) { this._finish("overrun"); return; }
      if (G.s.stats.health <= 0) { window.GO("game_over"); return; }

      st.wave++;
      if (st.wave >= battle.waves.length) { this._finish("held"); return; }
      this._render();
    },

    _finish(result) {
      const G = window.G, cfg = this._cfg, st = this._st;
      const summary = { survivors: this._living().length, dead: st.deadNames, result: result };
      const next = cfg.onComplete(G, summary);
      window.REFRESH_SIDEBAR && window.REFRESH_SIDEBAR();
      el("scene-title").textContent = "교전 종료";
      let head;
      if (result === "held") head = "적이 물러났다. 분대는 전선을 지켜냈다.";
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
