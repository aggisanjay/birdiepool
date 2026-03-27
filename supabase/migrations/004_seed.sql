-- supabase/migrations/004_seed.sql

INSERT INTO public.charities (name, slug, description, long_description, category, is_featured, is_active, sort_order) VALUES
  ('Golf Foundation UK', 'golf-foundation-uk', 'Getting young people into golf across the UK', 'The Golf Foundation is the leading children''s golf charity, committed to growing and sustaining junior participation in golf by delivering fun and inclusive programmes.', 'Youth & Sport', true, true, 1),
  ('Cancer Research UK', 'cancer-research-uk', 'Together we will beat cancer', 'Cancer Research UK is the world''s leading cancer charity dedicated to saving lives through research, influence and information.', 'Health', true, true, 2),
  ('Mind Charity', 'mind-charity', 'For better mental health', 'Mind provides advice and support to empower anyone experiencing a mental health problem.', 'Mental Health', true, true, 3),
  ('British Heart Foundation', 'british-heart-foundation', 'Beating heartbreak forever', 'We fund research into all heart and circulatory diseases and their risk factors.', 'Health', false, true, 4),
  ('RSPCA', 'rspca', 'For every kind', 'The RSPCA is the UK''s oldest and largest animal welfare charity.', 'Animals', false, true, 5),
  ('Macmillan Cancer Support', 'macmillan-cancer-support', 'No one should face cancer alone', 'We''re here to help everyone with cancer live life as fully as they can.', 'Health', true, true, 6);

INSERT INTO public.charity_events (charity_id, title, description, event_date, location, is_active)
SELECT id, 'Annual Charity Golf Day 2024', 'Join us for our annual charity golf day — all proceeds go directly to supporting our mission.', '2024-09-15T09:00:00Z', 'Wentworth Golf Club, Surrey', true
FROM public.charities WHERE slug = 'golf-foundation-uk';

INSERT INTO public.charity_events (charity_id, title, description, event_date, location, is_active)
SELECT id, 'Fundraiser Tournament', 'Celebrity golf tournament raising funds for cancer research.', '2024-10-01T10:00:00Z', 'St Andrews Links, Scotland', true
FROM public.charities WHERE slug = 'cancer-research-uk';
