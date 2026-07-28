# KickCourt Frontend

Angular 21 SPA for browsing multi-sport courts, booking time slots, and managing reservations.

## Features

- Browse and filter courts (sport, surface, name)
- View available time slots per day and book directly
- JWT authentication (login, register)
- My Bookings dashboard with cancel/restore
- Vendor dashboard with commission tracking
- Admin panel (court CRUD, vendor approval, booking management)
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
git clone git@github.com:RicardoBravo92/kickcourt_frontend.git
cd kickcourt_frontend

# Install dependencies
npm install

# Start dev server (runs on http://localhost:4200)
npm start
```

## Environment

| File | `apiUrl` | Description |
|------|----------|-------------|
| `environment.ts` | `http://127.0.0.1:8000/api` | Development (local backend) |
| `environment.prod.ts` | `https://api.kickcourt.com/api` | Production |

The backend must be running on `http://127.0.0.1:8000` for the dev server to work.

## Project Structure

```
src/app/
├── components/       # Shared UI (navbar)
├── guards/           # Route guards (auth, admin, vendor)
├── interceptors/     # JWT interceptor
├── models/           # TypeScript interfaces
├── pages/            # Route components
│   ├── admin/        # Admin dashboard, bookings, schedules, blocks, vendors
│   ├── bookings/     # Booking list, detail, create
│   ├── courts/       # Court list, detail (with availability), form
│   ├── login/        # Login page
│   ├── profile/      # User profile page
│   ├── register/     # Registration page
│   └── vendor/       # Vendor dashboard, court management
├── pipes/            # TranslatePipe
├── services/         # HTTP services (court, booking, vendor, i18n, auth)
└── app.routes.ts     # Route definitions
```

## API Endpoints Used

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login/` | JWT login |
| `POST /api/register/` | Register new user |
| `GET /api/courts/` | List courts (paginated, filterable by sport/surface) |
| `GET /api/courts/{id}/` | Court detail |
| `GET /api/courts/{id}/availability/?date=YYYY-MM-DD` | Available time slots |
| `POST /api/bookings/` | Create booking |
| `GET /api/bookings/my_bookings/` | User's bookings |
| `POST /api/bookings/{id}/cancel/` | Cancel booking |
| `GET /api/vendors/dashboard/` | Vendor stats |
| `POST /api/vendors/{id}/approve/` | Approve vendor (admin) |
| `POST /api/vendors/{id}/reject/` | Reject vendor (admin) |
| `GET /api/dashboard/stats/` | Admin dashboard stats |

## License

MIT
