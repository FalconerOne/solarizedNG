-- Seed demo data for SolarizedNG-GiveAway
INSERT INTO giveaways (title, description, start_date, end_date, min_activated_users, total_prizes, status) VALUES ('Solarized Launch Giveaway', 'Help SolarizedNG raise funds for sick children and win prizes', NOW(), NOW() + INTERVAL '7 days', 10, 2, 'active');

INSERT INTO users (full_name, phone, email, location, activated, referral_code, total_points, total_referrals) VALUES ('Demo Admin','08130000000','admin@solarizedng.com','Lagos',TRUE,'ADMIN01',0,0);
