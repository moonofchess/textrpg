-- =========================================================
-- 그냥 중세 판타지에서 살아남기 — Supabase 스키마
-- 적용 방법(둘 중 하나):
--   1) Supabase 대시보드 → SQL Editor 에 이 파일 전체를 붙여넣고 실행
--   2) CLI:  supabase link --project-ref nngkzgoniblndxlcqayy  &&  supabase db push
-- =========================================================

-- ---------------------------------------------------------
-- 명예의 전당 (완주 기록 / 리더보드)
-- ---------------------------------------------------------
create table if not exists public.runs (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  player_id   text not null,
  player_name text not null default '이름없는 생존자',
  result      text not null,                 -- 예: '1페이즈 클리어', '1부 완결'
  phase       text,                          -- 도달 페이즈
  reputation  integer not null default 0,
  awareness   integer not null default 0,
  days        integer not null default 0,
  survivors   integer,                       -- 마지막 지휘전 생존자 수 (없으면 null)
  status      text                           -- 최종 신분
);

create index if not exists runs_reputation_idx on public.runs (reputation desc, created_at desc);

alter table public.runs enable row level security;

-- 리더보드는 누구나 읽을 수 있고, 누구나 자기 기록을 남길 수 있다.
drop policy if exists "runs_select_public" on public.runs;
create policy "runs_select_public"
  on public.runs for select
  to anon, authenticated
  using (true);

drop policy if exists "runs_insert_public" on public.runs;
create policy "runs_insert_public"
  on public.runs for insert
  to anon, authenticated
  with check (true);

-- ---------------------------------------------------------
-- 클라우드 세이브 (기기 간 진행 동기화)
-- player_id 는 클라이언트가 생성한 무작위 토큰(localStorage 보관).
-- 주의: 이 토이 게임은 별도 로그인이 없어, player_id 를 아는 사람은
--       해당 세이브에 접근할 수 있다. 민감 정보는 저장하지 말 것.
-- ---------------------------------------------------------
create table if not exists public.saves (
  player_id   text primary key,
  updated_at  timestamptz not null default now(),
  player_name text,
  state       jsonb not null
);

alter table public.saves enable row level security;

drop policy if exists "saves_select_public" on public.saves;
create policy "saves_select_public"
  on public.saves for select
  to anon, authenticated
  using (true);

drop policy if exists "saves_insert_public" on public.saves;
create policy "saves_insert_public"
  on public.saves for insert
  to anon, authenticated
  with check (true);

drop policy if exists "saves_update_public" on public.saves;
create policy "saves_update_public"
  on public.saves for update
  to anon, authenticated
  using (true)
  with check (true);
