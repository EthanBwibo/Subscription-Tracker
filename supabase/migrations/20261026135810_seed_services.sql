-- M2: seed preset services from docs/spec.md. No prices: they change, the user confirms the amount.
-- Logos come from Google's favicon service; currencies are the usual billing currency in Kenya.

insert into public.services (name, slug, category, logo_url, default_currency, cancel_url) values
  ('Netflix',           'netflix',          'streaming', 'https://www.google.com/s2/favicons?domain=netflix.com&sz=128',      'KES', 'https://www.netflix.com/cancelplan'),
  ('Showmax',           'showmax',          'streaming', 'https://www.google.com/s2/favicons?domain=showmax.com&sz=128',      'KES', 'https://www.showmax.com'),
  ('DStv',              'dstv',             'tv',        'https://www.google.com/s2/favicons?domain=dstv.com&sz=128',         'KES', 'https://www.dstv.com'),
  ('GOtv',              'gotv',             'tv',        'https://www.google.com/s2/favicons?domain=gotvafrica.com&sz=128',   'KES', 'https://www.gotvafrica.com'),
  ('Spotify',           'spotify',          'music',     'https://www.google.com/s2/favicons?domain=spotify.com&sz=128',      'KES', 'https://www.spotify.com/account/subscription/'),
  ('YouTube Premium',   'youtube-premium',  'streaming', 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',      'KES', 'https://www.youtube.com/paid_memberships'),
  ('Apple One',         'apple-one',        'streaming', 'https://www.google.com/s2/favicons?domain=apple.com&sz=128',        'USD', 'https://apps.apple.com/account/subscriptions'),
  ('Safaricom bundles', 'safaricom-bundles','mobile',    'https://www.google.com/s2/favicons?domain=safaricom.co.ke&sz=128',  'KES', 'https://www.safaricom.co.ke'),
  ('Zuku',              'zuku',             'internet',  'https://www.google.com/s2/favicons?domain=zuku.co.ke&sz=128',       'KES', 'https://zuku.co.ke'),
  ('Faiba',             'faiba',            'internet',  'https://www.google.com/s2/favicons?domain=faiba.co.ke&sz=128',      'KES', 'https://faiba.co.ke'),
  ('ChatGPT',           'chatgpt',          'ai',        'https://www.google.com/s2/favicons?domain=chatgpt.com&sz=128',      'USD', 'https://chatgpt.com/#settings/Subscription'),
  ('Claude',            'claude',           'ai',        'https://www.google.com/s2/favicons?domain=claude.ai&sz=128',        'USD', 'https://claude.ai/settings/billing'),
  ('GitHub',            'github',           'software',  'https://www.google.com/s2/favicons?domain=github.com&sz=128',       'USD', 'https://github.com/settings/billing'),
  ('Canva',             'canva',            'software',  'https://www.google.com/s2/favicons?domain=canva.com&sz=128',        'USD', 'https://www.canva.com/settings/billing-and-teams'),
  ('iCloud+',           'icloud',           'storage',   'https://www.google.com/s2/favicons?domain=icloud.com&sz=128',       'USD', 'https://apps.apple.com/account/subscriptions'),
  ('Google One',        'google-one',       'storage',   'https://www.google.com/s2/favicons?domain=one.google.com&sz=128',   'KES', 'https://one.google.com/settings'),
  ('Gym',               'gym',              'fitness',   null,                                                                'KES', null)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  logo_url = excluded.logo_url,
  default_currency = excluded.default_currency,
  cancel_url = excluded.cancel_url;
