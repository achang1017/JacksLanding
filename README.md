# Jack's Landing RV Resort Website

Welcome to the official repository for the **Jack's Landing RV Resort** website. A modern, responsive web application for my family's RV park located in Grants Pass, Oregon.

This site serves as the digital home for current and prospective guests of Jack's Landing. Visitors can browse resort information, check pricing and availability, and submit reservation requests. Current residents can also log in to their **Resident Portal** to manage their stay, view charges, and access personalized services.

## Project Overview

The purpose of this project is to:
- Provide up-to-date information about Jack’s Landing RV Resort
- Showcase amenities, photos, and local attractions
- Allow potential guests to view availability and submit inquiries or bookings
- Offer existing tenants a secure **Resident Portal** to:
  - View their current charges (rent, utilities, taxes, etc.)
  - Access park policies and updates
  - Manage account details

## Features

- **Home Page:** Hero section, promotional content, and basic information
- **About Us:** History and community culture
- **Pricing & Availability:** Transparent pricing and current lot availability
- **Gallery:** Showcase of the park, amenities, and surrounding nature
- **Contact Page:** Google Maps integration, inquiry form, and park contact info
- **Resident Portal:** Secure login for tenants to view invoices, payment history, and park announcements
- **Responsive Design:** Mobile-friendly UI with a clean, modern aesthetic

## Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Email + OAuth support)
- **Deployment:** (To be determined, e.g., Vercel, Netlify, Render, or Supabase Hosting)

## Folder Structure

```bash
JACKSLANDING/
├── backend/                   # Node.js + Express server (secure logic & webhooks)
│   ├── controllers/           # Stripe and resident logic
│   ├── middleware/            # Optional: auth guards, error handling
│   ├── routes/                # API endpoints (e.g., /create-checkout)
│   ├── services/              # Supabase & Stripe configuration
│   ├── .env                   # Stripe secret key, Supabase service key
│   ├── server.js              # Express server entrypoint
│   └── package.json           # Backend dependencies

├── frontend/                  # React + Vite + Tailwind (UI)
│   ├── public/                # Static files (logo, manifest, etc.)
│   ├── src/
│   │   ├── assets/            # Logos, icons, images, videos
│   │   ├── components/        # Navbar, footer, card, buttons
│   │   ├── pages/             # Home, Activities, Availability, Gallery, Contact Us 
│   │   ├── portal/            # Resident-only views (billing, login, settings)
│   │   ├── services/          # Supabase + Stripe logic (auth, fetch, payments)
│   │   ├── styles/            # Tailwind config & global CSS
│   │   └── App.jsx            # React app entrypoint
│   ├── .env                   # Supabase keys (NOT committed)
│   └── package.json           # Project dependencies

├── supabase/                  # Schema and access control tracking
│   ├── policies.sql           # Row-level security rules
│   └── schema.sql             # Supabase table definitions

├── .gitignore                 # Files Git should ignore
└── README.md                  # This file
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- A [Supabase](https://supabase.com/) account

### Installation

```bash
git clone https://github.com/achang1017/JacksLanding.git
cd JacksLanding

# Frontend
cd frontend
npm install
npm run dev

# In another terminal
cd ../backend
npm install
node server.js