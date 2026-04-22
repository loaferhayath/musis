# Event Registration System (MERN Basic)

Music-themed event registration demo with:
- Event listing and event detail pages
- Registration form for concert booking
- Confirmation ticket UI
- Email confirmation flow using Nodemailer

## Project Structure

- `client/` - React (Vite) frontend UI
- `app.js` - Express backend (single-file as requested)

## Setup

1. Backend setup
   - Copy `.env.example` to `.env`
   - Update MongoDB and SMTP values
   - Install dependencies in root:
     - `npm install`
   - Start backend:
     - `npm run server`

2. Frontend setup
   - Open `client/`
   - Install dependencies:
     - `npm install`
   - Start frontend:
     - `npm run dev`

## Backend Routes

- `GET /api/health`
- `GET /api/events`
- `GET /api/events/:eventId`
- `POST /api/register`

## Notes

- Email uses SMTP credentials from `.env`.
- If SMTP values are not provided, booking works and email is skipped safely.