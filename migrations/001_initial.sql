CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    display_name VARCHAR(100),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- TRADING ACCOUNTS
-- =========================================================

CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,

    account_type VARCHAR(20) NOT NULL DEFAULT 'demo',

    starting_balance NUMERIC(14,2) NOT NULL DEFAULT 0,

    currency VARCHAR(10) NOT NULL DEFAULT 'USD',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- TRADES
-- =========================================================

CREATE TABLE IF NOT EXISTS trades (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    account_id UUID
        REFERENCES accounts(id)
        ON DELETE SET NULL,


    -- Trade information

    trade_date DATE NOT NULL,

    entry_time TIME,

    exit_time TIME,

    pair VARCHAR(50) NOT NULL,

    direction VARCHAR(10) NOT NULL,

    session VARCHAR(30),

    strategy VARCHAR(100),

    setup VARCHAR(255),


    -- Market context

    htf_bias VARCHAR(30),

    mtf_structure VARCHAR(30),

    ltf_confirmation VARCHAR(50),

    liquidity VARCHAR(30),

    mss VARCHAR(30),

    fvg VARCHAR(30),

    order_block VARCHAR(30),

    zone VARCHAR(50),


    -- Execution

    entry_price NUMERIC(20,10) NOT NULL,

    stop_loss NUMERIC(20,10) NOT NULL,

    take_profit NUMERIC(20,10) NOT NULL,

    exit_price NUMERIC(20,10),

    risk_amount NUMERIC(14,2),

    position_size NUMERIC(20,8),

    result VARCHAR(20),

    r_result NUMERIC(10,4),

    pnl NUMERIC(14,2),

    planned_rr NUMERIC(10,4),

    risk_distance NUMERIC(20,10),

    reward_distance NUMERIC(20,10),


    -- Psychology

    psychology_before VARCHAR(50),

    psychology_during VARCHAR(50),

    psychology_after VARCHAR(50),

    followed_plan VARCHAR(30),

    trade_quality VARCHAR(10),

    mistake VARCHAR(100),


    -- Review

    entry_reason TEXT,

    what_happened TEXT,

    what_did_well TEXT,

    improvement TEXT,

    notes TEXT,


    -- Screenshot URLs

    before_screenshot_url TEXT,

    after_screenshot_url TEXT,


    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),


    CONSTRAINT valid_direction
        CHECK (direction IN ('Buy', 'Sell')),

    CONSTRAINT valid_result
        CHECK (
            result IS NULL
            OR result IN ('win', 'loss', 'breakeven')
        )

);


-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_trades_user
ON trades(user_id);

CREATE INDEX IF NOT EXISTS idx_trades_user_date
ON trades(user_id, trade_date DESC);

CREATE INDEX IF NOT EXISTS idx_trades_pair
ON trades(user_id, pair);

CREATE INDEX IF NOT EXISTS idx_accounts_user
ON accounts(user_id);
