# MSLR Project
This is a responsive web application for MSLR created using JavaScript language and MERN stack framework (React.js, Node.js, Express.js, MongoDB (Atlas))

## Tech stacks used in detail

### Frontend (Client – Web Application)
* React.js (Vite) – For building the user interface (Voter Dashboard, EC Dashboard, Login, Register, QR scan, charts, word cloud, responsive layout).
* React Router – For routing between pages (login, register, voter, EC).
* Axios – For making REST API calls (AJAX) to the backend.
* Bootstrap + Custom CSS – For responsive design and layout styling.
* Chart.js (react-chartjs-2) – For bar charts and donut charts in EC dashboard.
* QR-Scanner (qr-scanner) – For scanning SCC QR codes via camera.
* Word Cloud (custom canvas / d3-cloud logic) – For data mashup visualisation (highest voted options).
  
### Backend (Server – REST API)
* Node.js – Runtime environment.
* Express.js – RESTful web service framework.
* JWT (jsonwebtoken) – Secure authentication & role-based access (Voter / EC).
* bcrypt – Secure password hashing.
* CORS – Cross-origin request handling.
* dotenv – Environment variable management.

### Database (Cloud)
* MongoDB Atlas (Cloud MongoDB) – For storing:
    * Voters
    * Referendums
    * Options & votes
    * VoterHistory
    * SCC Codes
    * Counters (auto-increment IDs)
* Mongoose – ODM for schema and database access.
  
### Security & Architecture
* JWT-based authentication (OAuth2-style token flow)
* Role-based authorization (EC vs Voter)
* Protected REST endpoints
* Hashed passwords
* API interceptors with auto-logout on token expiry
  
### Open Data REST API
* MSLR Public API endpoints
    * /mslr/referendums?status=open
    * /mslr/referendum/:id

## Prerequisites:
Please ensure the following are installed:
1. Node.js (recommended version: v18 or above)
2. npm (comes with Node.js)
3. Internet connection (as MongoDB is cloud-hosted using MongoDB Atlas)

## To run the application
1. Open MS Visual Studio code or some editor. File -> Open Folder -> MSLR-Project
2. STEP 1: Run backend server
    Open a terminal, enter the following commands one after another:
        cd server
        npm install
        npm start
3. Backend runs at http://localhost:3001 
4. STEP 2: Run frontend client
    Open another terminal, enter the following commands one after another:
        cd client
        npm install
        npm run dev
5. Frontend runs at http://localhost:5173 
6. Login Details
    Election Commission Account (Default)
        Email: ec@referendum.gov.sr
        Password: Shangrilavote&2025@

    Voter Dashboard
        Please register or Sign up by clicking the link from login page or try to hit this URL to register - http://localhost:5173/register 

## Database information
* This project uses MongoDB Atlas (cloud-hosted database)
* No local database setup is required. The backend connects directly to MongoDB Atlas using the MONGO_URI in .env

## Screenshots
### Login page
<img width="2880" height="1794" alt="Login page" src="https://github.com/user-attachments/assets/5f5445c7-c262-46a4-b467-a6ff4ee91a2f" />

### Register page
<img width="2880" height="1794" alt="Register page" src="https://github.com/user-attachments/assets/04465c9e-3a60-4556-a45c-669ae3c9270a" />

### Scan QR code feature
<img width="2880" height="1794" alt="Scan QR code" src="https://github.com/user-attachments/assets/f8ca0b9d-ebb5-41bc-8670-a5a6c754aae4" />

### Election Commission Dashboard
<img width="2880" height="1654" alt="EC Dashboard" src="https://github.com/user-attachments/assets/c2d71727-2e7c-47df-81ee-c8252c4f7de2" />

### Referendum page
<img width="2880" height="4432" alt="Referendum page" src="https://github.com/user-attachments/assets/8470018e-540c-4d56-9d2c-b10586bbd0a0" />

### Responses page
<img width="2880" height="10700" alt="Responses page" src="https://github.com/user-attachments/assets/8ffff001-a10c-4d72-b862-ce79c5e3570c" />

### Voter Dashboard
<img width="2880" height="4046" alt="Voter dashboard" src="https://github.com/user-attachments/assets/4754d85a-18b5-485d-b82a-1511e498a00b" />









