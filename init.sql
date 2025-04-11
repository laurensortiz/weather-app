-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create searches table
CREATE TABLE IF NOT EXISTS searches (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    location VARCHAR(255) NOT NULL,
    recommendations JSONB,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    search_id INTEGER REFERENCES searches(id),
    date TIMESTAMP WITH TIME ZONE,
    temperature DECIMAL,
    recommendation_text TEXT,
    purchase_link TEXT,
    weather_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 