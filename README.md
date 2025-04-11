# Weather App with AI Recommendations

Modern web application that provides weather and clothing recommendations powered by AI.

## Features

- 🎯 Location-based weather search
- 🤖 AI-generated clothing recommendations
- 📱 Modern and responsive interface
- 🔐 User authentication
- 📊 Search history
- 🌡️ Real-time weather data

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Material-UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **AI**: OpenAI API
- **Weather**: OpenWeather API
- **Deployment**: DigitalOcean App Platform

## Requirements

- Node.js 18+
- PostgreSQL
- OpenAI Account
- OpenWeather Account
- DigitalOcean Account

## Environment Variables

```env
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
DB_HOST=your_db_host
DB_PORT=your_db_port
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_jwt_secret
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/weather-app.git
cd weather-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. Initialize the database:
```bash
psql -U your_user -d your_db -f init.sql
```

5. Start the development server:
```bash
npm run dev
```

## Project Structure

```
weather-app/
├── app/
│   ├── api/              # API Routes
│   ├── components/       # React Components
│   ├── lib/             # Utilities
│   └── styles/          # Global Styles
├── public/              # Static Files
├── .env.example         # Environment Variables Example
├── .gitignore
├── next.config.js
├── package.json
└── README.md
```

## Deployment

1. Create a DigitalOcean account
2. Install doctl and authenticate
3. Configure environment variables in DigitalOcean
4. Deploy using App Platform

```bash
doctl apps create --spec .do/app.yaml
```

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.


