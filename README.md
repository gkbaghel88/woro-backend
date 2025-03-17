
# WORO Backend

This is the backend service for the WORO application, built using Node.js and Express.js.  
It includes authentication, database operations, caching, real-time WebSockets, and security enhancements.

---

##  Features
 REST API with Express.js  
. MongoDB (Mongoose) for database operations  
. Redis Caching for performance optimization  
. JWT Authentication for security  
. RabbitMQ (amqplib) for messaging queue  
. WebSockets (socket.io) for real-time communication  
. Email Sending (nodemailer)  
. Rate Limiting & Security Enhancements  

---

##  Installation & Setup

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/your-repo/woro-backend.git
cd woro-backend
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Configure Environment Variables
Create a `.env` file and set the required variables:
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/woro
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
SMTP_HOST=smtp.example.com
SMTP_USER=your_email@example.com
SMTP_PASS=your_password
RABBITMQ_URL=amqp://localhost
```

### 4️⃣ Start the Server
```sh
npm start
```

For development mode with nodemon:
```sh
npm run dev
```

---

##  API Endpoints

Please find postman file download and import in your system.

🔹 More APIs available in the project!

---

##  Security & Performance Enhancements
. Helmet for HTTP security headers  
. XSS-Clean to prevent cross-site scripting  
. Express-Rate-Limit to prevent brute force attacks  
. Mongo-Sanitize to prevent NoSQL injection  
. Caching with Redis for optimized API performance  

---

##  Message Queue (RabbitMQ)
The system uses RabbitMQ for handling asynchronous tasks like email notifications & background jobs.

Start RabbitMQ locally:
```sh
rabbitmq-server
```

---

##  WebSockets (Real-Time Communication)
The project uses Socket.io for real-time updates.  
Example connection:
```javascript
const socket = io("http://localhost:4000");
socket.on("connect", () => console.log("Connected to WebSocket!"));
```

---

##  Task Scheduling (node-cron)
Used for automated jobs like sending reports or data cleanup.

Example scheduled task:
```javascript
const cron = require("node-cron");
cron.schedule("0 0 * * *", () => console.log("Running a daily task!"));
```

---

##  Logging (Winston)
The system logs requests, errors, and important events using Winston.

Example log:
```javascript
const logger = require("winston");
logger.info("Server started on port 4000");
```

---

##  Contributing
1. Fork the repo  
2. Create a new branch (`feature/new-feature`)  
3. Commit your changes  
4. Push to GitHub & create a Pull Request  

---

##  License
This project is open-source under the ISC License.

---

Now, your backend is ready to run with full documentation!   
Let me know if you need any modifications. 
