# CelebrityChat

A React app where you can chat with AI-powered celebrity personalities powered by Google's Gemini API.

## Features

- 🎭 Chat with multiple celebrity personalities (Charlie Munger, Warren Buffett, Elon Musk, Benjamin Franklin, Mahatma Gandhi)
- 📝 Create custom celebrity personalities
- 💬 Real-time AI responses using Google Gemini API
- 🎨 Clean, responsive UI with Tailwind CSS

## Local Development

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Create a `.env.local` file with your Google API key:
```bash
cp .env.example .env.local
```

3. Add your Google API key to `.env.local`:
```
VITE_GOOGLE_API_KEY=your_actual_google_api_key
```

### Running Locally

Start the development server:
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment to Zeabur

1. Push your code to GitHub
2. Connect your GitHub repository to Zeabur
3. Set the environment variable in Zeabur:
   - Variable name: `VITE_GOOGLE_API_KEY`
   - Variable value: Your Google API key
4. Zeabur will automatically detect the Vite config and build/deploy your app

The app will be available at your Zeabur domain.

## Getting a Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Generative Language API
4. Create an API key (credentials)
5. Use this key for the `VITE_GOOGLE_API_KEY` environment variable

## Project Structure

- `app.jsx` - Main React component with all celebrity personalities and chat logic
- `index.jsx` - React entry point
- `index.html` - HTML template
- `vite.config.js` - Vite configuration
- `.env.example` - Example environment variables