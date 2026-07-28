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

## License

MIT

---

**Backend**: [github.com/RicardoBravo92/kickcourt_backend](https://github.com/RicardoBravo92/kickcourt_backend)
