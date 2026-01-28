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


# For task 2
# 2.1 To get referendums by status, hit the following URLs,
http://localhost:3001/mslr/referendums?status=open
http://localhost:3001/mslr/referendums?status=closed

# 2.2 To get the referendum by referendum ID and status, hit the following URL
http://localhost:3001/mslr/referendum/1


# Database information
~This project uses MongoDB Atlas (cloud-hosted database)
~No local database setup is required. The backend connects directly to MongoDB Atlas using the MONGO_URI in .env

# To view the Database details. Use the below credentials
Gmail credentials:
Email ID: tempuser012026@gmail.com
Password: uol@Pass@2026

Mongodb credentials:
Email ID: tempuser012026@gmail.com
Password: uol@Pass@2026

1. Hit this url https://cloud.mongodb.com/v2/691ac66f143522776520b7ac#/explorer/691ac6ba143522776521c848 where you can view the cluster created for this project. 
2. It asks you to login. Use the above given mongodb credentials
3. Then, it asks for MFA, for that check the gmail using the above gmail credentials. Enter the otp here on the mongodb atlas page.
4. Once the login process is done, click the cluster 0
5. Click the database name called “Referendums” under Cluster 0 which includes all the collections created for this project.


