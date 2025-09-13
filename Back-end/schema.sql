
-- transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) CHECK (type IN ('credit', 'debit')),
    category VARCHAR(20) CHECK (LOWER (category) IN ('salary', 'food', 'transfer', 'investment', 'utilities', 'fees', 'others')) DEFAULT 'others',
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
