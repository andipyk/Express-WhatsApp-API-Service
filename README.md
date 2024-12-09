# WhatsApp API Service

A robust RESTful API service for sending and scheduling WhatsApp messages, built with Express.js and TypeScript following clean architecture principles.

## Features

- 📱 Send WhatsApp messages
- ⏰ Schedule message delivery
- 🔄 Auto-reconnect on disconnection
- 📝 Message tracking and logging
- 🔒 WhatsApp session authentication
- 📊 Message history management
- ✨ Clean and simple architecture

## Prerequisites

- Node.js (v16 or higher)
- Bun.js (latest version)
- WhatsApp account for testing

## Installation

1. Clone repository
```bash
git clone https://github.com/andipyk/Express-WhatsApp-API-Service
cd whatsapp-api
```

2. Install dependencies
```bash
bun install
```



## Usage

1. Start the server
```bash
bun run dev
```

### Production
```bash
bun run build
bun run start
```

2. Scan the QR code that appears in the console with your WhatsApp mobile app

3. The server is ready once WhatsApp is connected

## API Endpoints

### Send Message
```http
POST /api/messages/send
Content-Type: application/json

{
  "to": "628123456789",
  "message": "Hello World!"
}
```

### Schedule Message
```http
POST /api/messages/schedule
Content-Type: application/json

{
  "to": "628123456789",
  "message": "Reminder!",
  "scheduledTime": "2024-01-01T10:00:00Z"
}
```

## Project Structure

```
src/
├── config/         # Application configuration
├── controllers/    # Request handlers
├── services/       # Business logic
├── routes/         # API routes
├── models/         # Data models
├── utils/          # Helper functions
└── app.ts         # Entry point
```


Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `503` - Service Unavailable (WhatsApp not ready)

## Validation

Input validation is implemented for all endpoints:
- Phone numbers must be 10-15 digits
- Messages have a maximum length of 4096 characters
- Scheduled times must be in the future
- All required fields are checked
