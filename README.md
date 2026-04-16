# Riverside Business Insurance Quote App

A full-stack web application that streamlines the insurance quote request process for clients and agents. This system replaces manual communication (calls, texts, emails) with a centralized, real-time platform for submitting, tracking, and managing insurance quotes.

---

## Live Demo
https://riverside-api.onrender.com

---

## Features

### Client Side
- Secure client sign up and login
- Submit multiple types of insurance quotes:
  - Home
  - Auto
  - General Liability
  - Workers Comp
  - Life & more
- Upload supporting documents (PDF, images)
- View submitted quotes and real-time status updates

### Agent Side
- Secure agent authentication (JWT-based)
- View all incoming quote requests
- Update quotes with:
  - Premiums
  - Carriers
  - Notes
  - Status (Pending, Quoted, Approved, Rejected)
- Add and compare multiple carrier options
- Delete completed quotes

### Real-Time Updates
- Instant notifications for new quotes using Socket.IO

---

## Tech Stack

### Frontend
- Vue.js
- HTML
- CSS

### Backend
- Node.js
- Express.js
- PostgreSQL (Render)

### Other Tools
- Socket.IO (real-time updates)
- Multer (file uploads)
- JWT (authentication)
- bcrypt (password hashing)

---

## Project Structure

- Frontend handles UI, forms, and API requests  
- Backend handles authentication, business logic, and database operations  
- PostgreSQL stores all quote and user data  

---

## API Endpoints

### Quotes
- `GET /quotes` → Retrieve all quotes
- `POST /quotes` → Create a new quote
- `POST /quotes/auto-upload` → Submit auto quote with file uploads
- `PUT /quotes/:id/agent-update` → Update quote (agent)
- `DELETE /quotes/:id` → Delete quote

### Authentication
- `POST /auth/client/signup`
- `POST /auth/client/login`
- `POST /auth/agent/signup`
- `POST /auth/agent/login`

---

## Environment Variables

Create a `.env` file in the backend:

---

## Deployment

- Hosted on Render
- PostgreSQL database also hosted on Render
- Backend API connected via environment variables

---

## Current Limitations

- File uploads are stored locally on the server
- No external insurance carrier API integration yet
- Notifications (email/SMS) not fully implemented

---

## Future Improvements

- Integrate real insurance carrier APIs for live rate pulling
- Add email and SMS notifications
- Move file storage to AWS S3
- Enhance dashboard analytics

---

## Author

Aolani Oaks  
Senior Project – Full Stack Web Application