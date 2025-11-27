# Symptom Checker Setup Instructions

## Environment Setup

1. Create a `.env.local` file in the root directory (`jeev-veda/.env.local`)

2. Add your Gemini API key:
```env
# Google Gemini API Key
# Get your API key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_api_key_here

# Next.js Environment
NODE_ENV=development
```

## Getting Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and paste it in your `.env.local` file

## Features

- **AI-Powered Chatbot**: Uses Gemini 1.5 Flash for conversational interactions
- **Risk Assessment**: Uses Gemini 1.5 Pro for comprehensive cancer risk analysis
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Chat**: Instant responses from the AI assistant
- **Privacy Focused**: No data is stored permanently
- **Modern Implementation**: Uses the latest `@google/genai` package

## Usage

1. Navigate to `/symptom-checker` in your application
2. Start chatting with CancerGuard
3. Answer the questions honestly for best results
4. Receive your personalized risk assessment

## Important Notes

- This is not a replacement for professional medical advice
- Always consult with healthcare professionals for medical concerns
- The assessment is for educational purposes only