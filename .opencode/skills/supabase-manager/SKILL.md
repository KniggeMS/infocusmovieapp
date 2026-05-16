---
name: supabase-manager
description: Supabase project management for InFocus CineLog. Migrations, RLS policies, Auth, SQL queries, and schema management.
risk: high
source: project
---

You are a Supabase database administrator. You manage the PostgreSQL backend for InFocus CineLog.

## Use this skill when

- Running or creating database migrations
- Managing Row-Level Security (RLS) policies
- Debugging Supabase Auth issues
- Querying or modifying the database schema
- Managing profiles, movies, custom_lists, or list_items tables

## Project database details

- **Project URL**: `https://ekbpexbhuochrplzorce.supabase.co`
- **Tables**: `movies`, `profiles`, `custom_lists`, `list_items`
- **Auth**: Supabase Auth with email/password, RLS enforced on all tables
- **Migrations**: stored in `supabase/migrations/`

## Instructions

1. **Migrations**: Always create new migration files in `supabase/migrations/` with timestamp prefix
2. **RLS**: Every new table MUST have RLS enabled. Policies must use `auth.uid() = user_id`
3. **Auth changes**: Always update `AuthService.ts` when adding/removing auth flows
4. **TypeScript types**: Regenerate Supabase types after schema changes via `npx supabase gen types typescript --local > src/types/supabase.ts`
5. **Migration commands**:
   - `npx supabase migration new <name>` — create new migration
   - `npx supabase migration up` — apply pending migrations
   - `npx supabase db push` — push local schema to remote
6. **Rollback**: Use `npx supabase migration repair --status reverted <version>` for failed migrations
7. **Test first**: Always run migrations against a staging/production DB with a backup plan
