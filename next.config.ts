/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_OPENWEATHER_API_KEY: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    DB_USER: process.env.DB_USER,
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_PORT: process.env.DB_PORT
  }
};

module.exports = nextConfig;
