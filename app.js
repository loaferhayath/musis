const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/fst-demo'

app.use(cors())
app.use(express.json())

const events = [
  {
    id: 'echo-night-festival',
    title: 'Echo Night Festival',
    date: '2026-05-18',
    venue: 'Skyline Arena, Mumbai',
    genre: 'EDM / House',
    price: 1499,
    summary: 'An immersive electronic night with laser visuals and top DJs.',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80',
    detail:
      'Echo Night Festival brings international artists, deep bass sound design, and immersive stage effects.',
  },
  {
    id: 'indie-rhythm-live',
    title: 'Indie Rhythm Live',
    date: '2026-06-02',
    venue: 'Open Grounds, Bengaluru',
    genre: 'Indie / Alternative',
    price: 999,
    summary: 'A soulful evening featuring emerging indie bands and storytellers.',
    image:
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80',
    detail:
      'A carefully curated lineup with acoustic sessions, band performances, and audience interaction.',
  },
  {
    id: 'retro-beats-concert',
    title: 'Retro Beats Concert',
    date: '2026-06-29',
    venue: 'Riverfront Stage, Ahmedabad',
    genre: 'Retro / Pop',
    price: 799,
    summary: 'Classic hits, sing-along moments, and timeless retro stage vibes.',
    image:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    detail:
      'Nostalgia themed production with classic songs and modern performance choreography.',
  },
]

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log('MongoDB connected')
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message)
  })

const registrationSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    eventId: { type: String, required: true },
    eventTitle: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    ticketCount: { type: Number, required: true },
    attendeeNotes: { type: String, default: '' },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true },
)

const Registration = mongoose.model('Registration', registrationSchema)

const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
})

app.get('/api/health', (_req, res) => {
  res.json({ message: 'API is running' })
})

app.get('/api/events', (_req, res) => {
  res.json(events)
})

app.get('/api/events/:eventId', (req, res) => {
  const event = events.find((item) => item.id === req.params.eventId)
  if (!event) {
    return res.status(404).json({ message: 'Event not found' })
  }
  return res.json(event)
})

app.post('/api/register', async (req, res) => {
  try {
    const { eventId, fullName, email, phone, ticketCount, attendeeNotes } =
      req.body

    if (!eventId || !fullName || !email || !phone || !ticketCount) {
      return res.status(400).json({ message: 'Required fields are missing.' })
    }

    const event = events.find((item) => item.id === eventId)
    if (!event) {
      return res.status(404).json({ message: 'Selected event is invalid.' })
    }

    const quantity = Number(ticketCount)
    if (Number.isNaN(quantity) || quantity < 1) {
      return res
        .status(400)
        .json({ message: 'Ticket count must be a valid positive number.' })
    }

    const ticketId = `PP-${Date.now()}`
    const totalAmount = event.price * quantity

    const registration = await Registration.create({
      ticketId,
      eventId: event.id,
      eventTitle: event.title,
      fullName,
      email,
      phone,
      ticketCount: quantity,
      attendeeNotes: attendeeNotes || '',
      totalAmount,
    })

    const fromAddress =
      process.env.MAIL_FROM || `noreply-${process.env.SMTP_USER || 'music'}`

    const html = `
      <h2>PulsePass Ticket Confirmation</h2>
      <p>Hello ${fullName}, your booking is confirmed.</p>
      <p><strong>Ticket ID:</strong> ${ticketId}</p>
      <p><strong>Event:</strong> ${event.title}</p>
      <p><strong>Date:</strong> ${new Date(event.date).toDateString()}</p>
      <p><strong>Venue:</strong> ${event.venue}</p>
      <p><strong>Tickets:</strong> ${quantity}</p>
      <p><strong>Total:</strong> INR ${totalAmount}</p>
    `

    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await mailTransporter.sendMail({
          from: fromAddress,
          to: email,
          subject: `Your ticket for ${event.title}`,
          html,
        })
      } else {
        console.warn('SMTP_USER/SMTP_PASS missing. Email skipped.')
      }
    } catch (mailError) {
      console.error('Email send error:', mailError.message)
    }

    return res.status(201).json({
      message: 'Registration successful.',
      ticket: {
        ticketId: registration.ticketId,
        eventTitle: registration.eventTitle,
        fullName: registration.fullName,
        email: registration.email,
        ticketCount: registration.ticketCount,
        totalAmount: registration.totalAmount,
      },
    })
  } catch (error) {
    console.error('Registration error:', error.message)
    return res.status(500).json({ message: 'Server error while registering.' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
