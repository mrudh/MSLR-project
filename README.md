# MSLR Project
This is a responsive web application for MSLR created using JavaScript language and MERN stack framework (React.js, Node.js, Express.js, MongoDB (Atlas))

# Prerequisites:
Please ensure the following are installed:
1. Node.js (recommended version: v18 or above)
2. npm (comes with Node.js)
3. Internet connection (as MongoDB is cloud-hosted using MongoDB Atlas)

# To run the application
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

# Database information
~This project uses MongoDB Atlas (cloud-hosted database)
~No local database setup is required. The backend connects directly to MongoDB Atlas using the MONGO_URI in .env

# Screenshots
<img width="2880" height="1794" alt="Login page" src="https://github.com/user-attachments/assets/5f5445c7-c262-46a4-b467-a6ff4ee91a2f" />




