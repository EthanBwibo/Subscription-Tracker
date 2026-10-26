-- rls_auto_enable() backs the ensure_rls event trigger (turns on RLS for new tables). It is SECURITY DEFINER
-- and was exposed as /rest/v1/rpc/rls_auto_enable. Event triggers don't need EXECUTE, so nobody else should have it.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
