-- Періодичність у тижнях (для «Кожні 4 тижні» у мобільному зв’язку).
-- Виконайте один раз у Supabase → SQL Editor.
alter table public.payments
  add column if not exists period_weeks smallint
  check (period_weeks is null or period_weeks > 0);
