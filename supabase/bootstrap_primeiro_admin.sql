-- Rode UMA vez, depois de criar seu usuário em Authentication > Users > Add user
-- (marque "Auto Confirm User"). Troque o e-mail abaixo pelo seu.
update public.profiles
   set papel = 'admin'
 where email = 'seu-email@exemplo.com';
