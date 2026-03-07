# Google OAuth Setup for Electron App

To fix the "Access blocked: Authorization Error" when using Google Drive in your Electron app, you need to configure the OAuth redirect URI in Google Cloud Console.

## Steps to Fix:

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Select your project (or create one if needed)

### 2. Enable Google Drive API
- Go to "APIs & Services" > "Library"
- Search for "Google Drive API"
- Click "Enable"

### 3. Configure OAuth Consent Screen
- Go to "APIs & Services" > "OAuth consent screen"
- Choose "External" user type
- Fill in required fields:
  - App name: "Grey Loom Manager" (or your app name)
  - User support email: your email
  - Developer contact information: your email
- Add scopes: `https://www.googleapis.com/auth/drive.file`

### 4. Create OAuth 2.0 Credentials
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "OAuth 2.0 Client IDs"
- Choose "Web application"
- Add authorized redirect URIs:
  - `http://localhost:3000/oauth/callback`
  - `http://localhost:5173/oauth/callback` (for development)

### 5. Update Environment Variables
Make sure your `.env.local` has the correct client ID:
```
VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
VITE_GOOGLE_API_KEY=your_api_key_here
```

### 6. Test the Integration
- Build and run your Electron app
- Try the Google Drive backup feature
- The OAuth window should now work properly

## Alternative Solution (Simpler)

If you want to avoid the OAuth complexity, you can use Google Drive's file picker API or implement a simpler file upload/download mechanism using the Google Drive API with service account credentials.

## Troubleshooting

- Make sure the redirect URI in Google Cloud Console exactly matches what's in the code
- Ensure the Google Drive API is enabled
- Check that your OAuth consent screen is properly configured
- Verify your client ID is correct in the environment variables