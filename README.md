# Soccer Booking Frontend

Angular 21 SPA for browsing soccer fields, booking time slots, and managing reservations.

## Features

- Browse and filter fields (type, surface, name)
- View available time slots per day and book directly
- JWT authentication (login, register)
- My Bookings dashboard with cancel/restore
- Admin panel (field CRUD, pending booking management)
- i18n support (Spanish / English)
- Tailwind CSS styling

## Tech Stack

- Angular 21
- Tailwind CSS 4
- TypeScript 5.9
- JWT auth via `localStorage`

## Setup

```bash
# Clone repository
git clone git@github.com:RicardoBravo92/soccer_booking_frontend.git
cd soccer_booking_frontend

# Install dependencies
npm install

# Start dev server (runs on http://localhost:4200)
npm start
```

## Environment

| File | `apiUrl` | Description |
|------|----------|-------------|
| `environment.ts` | `http://127.0.0.1:8000/api` | Development (local backend) |
| `environment.prod.ts` | `https://api.soccerdev.com/api` | Production |

The backend must be running on `http://127.0.0.1:8000` for the dev server to work.

## Project Structure

```
src/app/
├── components/       # Shared UI (navbar)
├── guards/           # Route guards (auth, admin)
├── interceptors/     # JWT interceptor
├── models/           # TypeScript interfaces
├── pages/            # Route components
│   ├── admin/        # Admin dashboard, bookings management
│   ├── bookings/     # Booking list, detail, create
│   ├── fields/       # Field list, detail (with availability), form
│   ├── login/        # Login page
│   └── register/     # Registration page
├── pipes/            # TranslatePipe
├── services/         # HTTP services (field, booking, i18n, auth)
└── app.routes.ts     # Route definitions
```

## API Endpoints Used

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login/` | JWT login |
| `POST /api/register/` | Register new user |
| `GET /api/fields/` | List fields (paginated) |
| `GET /api/fields/{id}/` | Field detail |
| `GET /api/fields/{id}/availability/?date=YYYY-MM-DD` | Available slots |
| `POST /api/bookings/` | Create booking |
| `GET /api/bookings/my_bookings/` | User's bookings |
| `POST /api/bookings/{id}/cancel/` | Cancel booking |

## License

MIT
