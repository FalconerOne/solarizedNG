-- Full schema for SolarizedNG-GiveAway (simplified for demo)

CREATE TABLE IF NOT EXISTS users ( id BIGSERIAL PRIMARY KEY, full_name VARCHAR(120) NOT NULL, phone VARCHAR(20) UNIQUE NOT NULL, email VARCHAR(120) UNIQUE NOT NULL, location VARCHAR(80), activated BOOLEAN DEFAULT FALSE, activation_amount NUMERIC(10,2) DEFAULT 0, referral_code VARCHAR(20) UNIQUE, referred_by VARCHAR(20), total_points NUMERIC(10,2) DEFAULT 0, total_referrals INT DEFAULT 0, extra_entries INT DEFAULT 0, created_at TIMESTAMP DEFAULT NOW() );

CREATE TABLE IF NOT EXISTS giveaways ( id BIGSERIAL PRIMARY KEY, title VARCHAR(150) NOT NULL, description TEXT, start_date TIMESTAMP, end_date TIMESTAMP, min_activated_users INT DEFAULT 10 CHECK (min_activated_users BETWEEN 10 AND 500), total_prizes INT DEFAULT 1 CHECK (total_prizes BETWEEN 1 AND 5), status VARCHAR(20) DEFAULT 'pending', created_at TIMESTAMP DEFAULT NOW() );
