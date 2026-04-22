import { useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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
      'Echo Night Festival brings a lineup of international and Indian electronic artists. Expect synchronized light shows, immersive stage visuals, live percussion collabs, and premium sound design for a full-energy concert experience.',
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
      'Indie Rhythm Live is curated for fans who enjoy meaningful lyrics and organic live instrumentation. The event includes multi-band performances, acoustic corners, and artist interaction zones.',
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
      'Retro Beats Concert celebrates legendary classics with modern stage production. Enjoy themed segments, nostalgia-inspired visuals, and crowd-driven performances by tribute artists.',
  },
]

function App() {
  const [page, setPage] = useState('home')
  const [selectedEventId, setSelectedEventId] = useState(events[0].id)
  const [ticket, setTicket] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    ticketCount: 1,
    attendeeNotes: '',
  })

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) || events[0],
    [selectedEventId],
  )

  const goToEventDetail = (eventId) => {
    setSelectedEventId(eventId)
    setPage('detail')
  }

  const startRegistration = (eventId) => {
    setSelectedEventId(eventId)
    setSubmitError('')
    setPage('register')
  }

  const handleInputChange = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ticketCount: Number(formData.ticketCount),
          eventId: selectedEvent.id,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.')
      }

      setTicket(data.ticket)
      setPage('confirmation')
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Event Registration System</p>
          <h1>PulsePass</h1>
        </div>
        <nav>
          <button onClick={() => setPage('home')}>Home</button>
          <button onClick={() => setPage('events')}>Events</button>
        </nav>
      </header>

      {page === 'home' && (
        <main className="page">
          <section className="hero-panel">
            <div>
              <h2>Book Music Experiences in Minutes</h2>
              <p>
                Discover concerts, reserve your spot, and receive your ticket
                confirmation via email instantly.
              </p>
              <div className="actions">
                <button onClick={() => setPage('events')}>Explore Events</button>
                <button
                  className="secondary"
                  onClick={() => goToEventDetail(events[0].id)}
                >
                  Featured Event
                </button>
              </div>
            </div>
            <img src={events[0].image} alt={events[0].title} />
          </section>

          <section className="highlights">
            <article>
              <h3>Live Lineups</h3>
              <p>Curated concerts with genres from EDM to indie and retro pop.</p>
            </article>
            <article>
              <h3>Fast Checkout</h3>
              <p>Industry-style registration form for quick and clear booking.</p>
            </article>
            <article>
              <h3>Email Ticket</h3>
              <p>
                Automatic confirmation sent from your configured no-reply mail.
              </p>
            </article>
          </section>
        </main>
      )}

      {page === 'events' && (
        <main className="page">
          <h2>Event List</h2>
          <div className="grid">
            {events.map((event) => (
              <article key={event.id} className="card">
                <img src={event.image} alt={event.title} />
                <div className="card-content">
                  <p className="badge">{event.genre}</p>
                  <h3>{event.title}</h3>
                  <p>{event.summary}</p>
                  <p>
                    <strong>{new Date(event.date).toDateString()}</strong> -{' '}
                    {event.venue}
                  </p>
                  <div className="actions">
                    <button onClick={() => goToEventDetail(event.id)}>
                      View Details
                    </button>
                    <button
                      className="secondary"
                      onClick={() => startRegistration(event.id)}
                    >
                      Register
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
      )}

      {page === 'detail' && (
        <main className="page">
          <button className="link" onClick={() => setPage('events')}>
            ← Back to Event List
          </button>
          <section className="detail">
            <img src={selectedEvent.image} alt={selectedEvent.title} />
            <div>
              <p className="badge">{selectedEvent.genre}</p>
              <h2>{selectedEvent.title}</h2>
              <p>{selectedEvent.detail}</p>
              <ul>
                <li>Date: {new Date(selectedEvent.date).toDateString()}</li>
                <li>Venue: {selectedEvent.venue}</li>
                <li>Ticket Price: INR {selectedEvent.price}</li>
              </ul>
              <button onClick={() => startRegistration(selectedEvent.id)}>
                Register for this Event
              </button>
            </div>
          </section>
        </main>
      )}

      {page === 'register' && (
        <main className="page">
          <h2>Registration</h2>
          <p className="subtle">
            You are booking for <strong>{selectedEvent.title}</strong>
          </p>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Full Name
              <input
                required
                value={formData.fullName}
                onChange={(event) =>
                  handleInputChange('fullName', event.target.value)
                }
                placeholder="Enter your full name"
              />
            </label>
            <label>
              Email
              <input
                required
                type="email"
                value={formData.email}
                onChange={(event) => handleInputChange('email', event.target.value)}
                placeholder="Enter email for ticket confirmation"
              />
            </label>
            <label>
              Phone Number
              <input
                required
                value={formData.phone}
                onChange={(event) => handleInputChange('phone', event.target.value)}
                placeholder="Enter contact number"
              />
            </label>
            <label>
              Number of Tickets
              <input
                required
                min="1"
                max="10"
                type="number"
                value={formData.ticketCount}
                onChange={(event) =>
                  handleInputChange('ticketCount', event.target.value)
                }
              />
            </label>
            <label>
              Notes (Optional)
              <textarea
                rows="3"
                value={formData.attendeeNotes}
                onChange={(event) =>
                  handleInputChange('attendeeNotes', event.target.value)
                }
                placeholder="Accessibility requests, seat preference, etc."
              />
            </label>
            {submitError ? <p className="error">{submitError}</p> : null}
            <div className="actions">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => setPage('detail')}
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
      )}

      {page === 'confirmation' && ticket && (
        <main className="page">
          <section className="ticket">
            <p className="eyebrow">Booking Confirmed</p>
            <h2>Your e-ticket is ready</h2>
            <p>
              A confirmation email has been sent to <strong>{ticket.email}</strong>.
            </p>
            <div className="ticket-grid">
              <p>
                <strong>Ticket ID:</strong> {ticket.ticketId}
              </p>
              <p>
                <strong>Event:</strong> {ticket.eventTitle}
              </p>
              <p>
                <strong>Attendee:</strong> {ticket.fullName}
              </p>
              <p>
                <strong>Seats:</strong> {ticket.ticketCount}
              </p>
              <p>
                <strong>Total:</strong> INR {ticket.totalAmount}
              </p>
            </div>
            <button onClick={() => setPage('events')}>Book Another Event</button>
          </section>
        </main>
      )}
    </div>
  )
}

export default App
