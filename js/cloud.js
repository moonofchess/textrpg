/* =========================================================
   Supabase 연동 — 클라우드 세이브 & 명예의 전당(리더보드)
   - @supabase/supabase-js (UMD, CDN) 가 먼저 로드되어야 한다.
   - publishable/anon 키는 공개되어도 안전(RLS로 보호).
   - 라이브러리/네트워크가 없으면 모든 기능이 조용히 비활성화되고,
     게임은 로컬 저장(localStorage)으로 정상 동작한다.
   ========================================================= */
(function () {
  "use strict";

  const SUPABASE_URL = "https://nngkzgoniblndxlcqayy.supabase.co";
  // publishable 키 (클라이언트 노출용 공개 키)
  const SUPABASE_KEY = "sb_publishable_s0kkJc_bcVgGJ1V9Ez68Hw_tTplCmlJ";

  const PID_KEY = "graymarch_pid";
  const PNAME_KEY = "graymarch_pname";

  let client = null;

  function init() {
    if (!window.supabase || !window.supabase.createClient) {
      console.info("[cloud] supabase-js 미로딩 — 클라우드 기능 비활성화");
      return false;
    }
    try {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false },
      });
      return true;
    } catch (e) {
      console.warn("[cloud] 초기화 실패:", e);
      client = null;
      return false;
    }
  }

  function enabled() { return !!client; }

  function playerId() {
    let id = localStorage.getItem(PID_KEY);
    if (!id) {
      id = (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : "p_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(PID_KEY, id);
    }
    return id;
  }
  function playerName() { return localStorage.getItem(PNAME_KEY) || ""; }
  function setPlayerName(n) { localStorage.setItem(PNAME_KEY, (n || "").slice(0, 20)); }

  async function cloudSave(state) {
    if (!client) return { ok: false, error: "disabled" };
    const { error } = await client.from("saves").upsert({
      player_id: playerId(),
      player_name: playerName() || null,
      state: state,
      updated_at: new Date().toISOString(),
    });
    return { ok: !error, error: error };
  }

  async function cloudLoad() {
    if (!client) return { state: null, error: "disabled" };
    const { data, error } = await client
      .from("saves").select("state").eq("player_id", playerId()).maybeSingle();
    return { state: data ? data.state : null, error: error };
  }

  async function submitRun(s) {
    if (!client) return { ok: false, error: "disabled" };
    const { error } = await client.from("runs").insert({
      player_id: playerId(),
      player_name: playerName() || "이름없는 생존자",
      result: s.result,
      phase: s.phase || null,
      reputation: s.reputation | 0,
      awareness: s.awareness | 0,
      days: s.days | 0,
      survivors: s.survivors == null ? null : (s.survivors | 0),
      status: s.status || null,
    });
    return { ok: !error, error: error };
  }

  async function fetchLeaderboard(limit) {
    if (!client) return { data: [], error: "disabled" };
    const { data, error } = await client
      .from("runs").select("*")
      .order("reputation", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit || 25);
    return { data: data || [], error: error };
  }

  window.Cloud = {
    init, enabled, playerId, playerName, setPlayerName,
    cloudSave, cloudLoad, submitRun, fetchLeaderboard,
  };

  init();
})();
