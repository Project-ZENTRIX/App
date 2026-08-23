revoke execute on function public.handle_new_user() from public;
revoke execute on function public.is_tenant_member(uuid) from public;
revoke execute on function public.has_tenant_role(uuid, text[]) from public;
