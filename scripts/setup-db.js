const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER || 'weather_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'weather_app',
  password: process.env.DB_PASSWORD || 'w34th3r',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function setupDatabase() {
  const client = await pool.connect();
  try {
    // Read and execute schema file
    const schemaPath = path.join(__dirname, '../app/api/db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schema);
    console.log('Database schema created successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    client.release();
    pool.end();
  }
}

setupDatabase(); 