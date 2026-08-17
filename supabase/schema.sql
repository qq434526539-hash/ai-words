-- ============================================================
-- AI Words · Supabase 数据库脚本
-- 说明：RLS 已按用户隔离学习数据；words / word_categories 只读。
-- 在 Supabase SQL Editor 中整体执行即可。
-- ============================================================

-- ---------- 1. users ----------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  nickname text default '同学',
  english_level text check (english_level in ('beginner','basic','intermediate','advanced')),
  learning_goal text check (learning_goal in ('ui','prompt','coding','docs','agent','systematic')),
  daily_word_target int default 10 check (daily_word_target in (5, 10, 20)),
  created_at timestamptz default now()
);

-- ---------- 2. word_categories ----------
create table if not exists public.word_categories (
  id text primary key,
  name text not null,
  description text,
  icon text,
  difficulty int check (difficulty between 1 and 3),
  sort_order int default 0
);

-- ---------- 3. words ----------
create table if not exists public.words (
  id text primary key,
  word text not null,
  phonetic text,
  pronunciation_url text,
  core_translation text,
  general_meaning text,
  ai_meaning text,
  memory_tip text,
  normal_example text,
  normal_example_translation text,
  ai_example text,
  ai_example_translation text,
  prompt_example text,
  collocations text[] default '{}',
  related_words text[] default '{}',
  confused_words text[] default '{}',
  category_id text not null references public.word_categories (id) on delete cascade,
  difficulty int check (difficulty between 1 and 3),
  tags text[] default '{}',
  created_at timestamptz default now()
);
create index if not exists idx_words_category on public.words (category_id);

-- ---------- 4. user_word_progress ----------
create table if not exists public.user_word_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  word_id text not null references public.words (id) on delete cascade,
  familiarity_level int default 0 check (familiarity_level between 0 and 3),
  correct_count int default 0,
  wrong_count int default 0,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  review_interval bigint default 0,   -- 毫秒
  is_mastered boolean default false,
  pinned boolean default false,
  updated_at timestamptz default now()
);
create unique index if not exists uq_user_word on public.user_word_progress (user_id, word_id);
create index if not exists idx_progress_review on public.user_word_progress (user_id, next_review_at);

-- ---------- 5. study_records ----------
create table if not exists public.study_records (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  word_id text not null references public.words (id) on delete cascade,
  question_type text check (question_type in ('en2zh','zh2en','fill-blank','judge-ai','self')),
  user_answer text,
  is_correct boolean,
  familiarity_level int default 0,
  studied_at timestamptz default now()
);
create index if not exists idx_records_user_time on public.study_records (user_id, studied_at desc);
create index if not exists idx_records_user_word on public.study_records (user_id, word_id);

-- ---------- 6. favorites ----------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  word_id text not null references public.words (id) on delete cascade,
  folder_name text default '默认收藏夹',
  created_at timestamptz default now()
);
create unique index if not exists uq_favorite on public.favorites (user_id, word_id, folder_name);

-- ---------- 7. daily_statistics ----------
create table if not exists public.daily_statistics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  study_date date not null default current_date,
  new_words_count int default 0,
  review_words_count int default 0,
  correct_count int default 0,
  wrong_count int default 0,
  study_duration int default 0,      -- 秒
  updated_at timestamptz default now()
);
create unique index if not exists uq_daily_stat on public.daily_statistics (user_id, study_date);

-- ---------- 8. 错词本（可基于 progress 派生，这里提供独立表便于统计） ----------
create table if not exists public.wrong_words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  word_id text not null references public.words (id) on delete cascade,
  wrong_count int default 1,
  last_wrong_at timestamptz default now(),
  main_question_type text,
  resolved boolean default false,
  created_at timestamptz default now()
);
create unique index if not exists uq_wrong_word on public.wrong_words (user_id, word_id);

-- ============================================================
-- RLS 策略
-- ============================================================
alter table public.users enable row level security;
alter table public.word_categories enable row level security;
alter table public.words enable row level security;
alter table public.user_word_progress enable row level security;
alter table public.study_records enable row level security;
alter table public.favorites enable row level security;
alter table public.daily_statistics enable row level security;
alter table public.wrong_words enable row level security;

-- users：用户只能读/改自己的资料
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);
create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- words / categories：登录用户只读
create policy "words_read_all" on public.words
  for select using (auth.role() = 'authenticated');
create policy "categories_read_all" on public.word_categories
  for select using (auth.role() = 'authenticated');

-- user_word_progress：仅本人
create policy "progress_select_own" on public.user_word_progress
  for select using (auth.uid() = user_id);
create policy "progress_insert_own" on public.user_word_progress
  for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on public.user_word_progress
  for update using (auth.uid() = user_id);

-- study_records：仅本人
create policy "records_select_own" on public.study_records
  for select using (auth.uid() = user_id);
create policy "records_insert_own" on public.study_records
  for insert with check (auth.uid() = user_id);

-- favorites：仅本人
create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);
create policy "favorites_insert_own" on public.favorites
  for insert with check (auth.uid() = user_id);
create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);

-- daily_statistics：仅本人
create policy "stats_select_own" on public.daily_statistics
  for select using (auth.uid() = user_id);
create policy "stats_insert_own" on public.daily_statistics
  for insert with check (auth.uid() = user_id);
create policy "stats_update_own" on public.daily_statistics
  for update using (auth.uid() = user_id);

-- wrong_words：仅本人
create policy "wrong_select_own" on public.wrong_words
  for select using (auth.uid() = user_id);
create policy "wrong_insert_own" on public.wrong_words
  for insert with check (auth.uid() = user_id);
create policy "wrong_update_own" on public.wrong_words
  for update using (auth.uid() = user_id);
create policy "wrong_delete_own" on public.wrong_words
  for delete using (auth.uid() = user_id);

-- ============================================================
-- 触发器：注册时自动创建 users 资料
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, nickname)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nickname', '同学'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
