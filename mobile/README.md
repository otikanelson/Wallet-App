# CFC Wallet - Mobile App

A React Native mobile application for utility payments including airtime, data, electricity, and cable TV subscriptions.

## Features

- 🔐 Secure authentication with JWT tokens
- 💰 Wallet management
- 📱 Airtime purchase (MTN, Airtel, Glo, 9mobile)
- 📊 Data bundle purchase
- ⚡ Electricity bill payment
- 📺 Cable TV subscription
- 📜 Transaction history
- 🔔 Push notifications

## Tech Stack

- **Framework**: Expo / React Native
- **Language**: TypeScript
- **State Management**: Zustand
- **Navigation**: React Navigation
- **Forms**: React Hook Form + Zod
- **API Client**: Axios
- **Storage**: Expo Secure Store

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```
EXPO_PUBLIC_API_URL=http://your-api-url/api/v1
```

### Running the App

```bash
# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## Project Structure

```
src/
├── api/              # API client and endpoints
├── components/       # Reusable components
├── constants/        # Theme, colors, API constants
├── navigation/       # Navigation configuration
├── screens/          # Screen components
├── store/            # Zustand stores
└── utils/            # Utility functions
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Environment Variables

- `EXPO_PUBLIC_API_URL` - Backend API base URL
- `EXPO_PUBLIC_APP_NAME` - Application name
- `EXPO_PUBLIC_SUPPORT_EMAIL` - Support email address

## Authentication Flow

1. Welcome/Onboarding screens
2. Register or Login
3. Email verification (optional)
4. Set transaction PIN
5. Access main app

## Security

- JWT tokens stored in Expo Secure Store (encrypted)
- Automatic token refresh on expiry
- Transaction PIN for sensitive operations
- Secure API communication (HTTPS)

## Phase 2 Completed ✅

- [x] Auth store with Zustand
- [x] User store with Zustand
- [x] Common UI components (Button, Input, ErrorMessage)
- [x] Welcome/Onboarding screen
- [x] Register screen
- [x] Login screen
- [x] Forgot Password screen
- [x] OTP Verification screen
- [x] Reset Password screen
- [x] Set Transaction PIN screen
- [x] Navigation structure
- [x] Root navigator with auth check

## Next Steps (Phase 3)

- [ ] Home/Dashboard screen
- [ ] Balance card component
- [ ] Quick access component
- [ ] Transaction history list
- [ ] Profile screen

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and type checking
4. Submit a pull request

## License

Private - All rights reserved
