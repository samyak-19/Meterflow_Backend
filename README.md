# ⚙️ MeterFlow Backend

MeterFlow Backend powers the API Marketplace platform by handling authentication, API routing, usage tracking, and billing.

It is designed around an API Gateway architecture that enables dynamic interaction with external APIs.

---

## 🚀 Live Service

Backend: https://meterflow-backend-2pas.onrender.com

---

## 🧠 Overview

The backend is responsible for:

- Managing user authentication  
- Handling API creation  
- Routing API requests through a gateway  
- Tracking usage of APIs  
- Calculating billing and revenue  
- Providing analytics data  

---

## 🔑 API Gateway

All API requests go through:

/gateway/:apiKey/:endpoint

The gateway performs:

- API key validation  
- Subscription checks  
- Rate limiting  
- Dynamic URL construction  
- Request forwarding  
- Response handling  
- Usage logging  

---

## 📊 Usage Tracking

Each API request stores:

- userId  
- apiId  
- endpoint  
- latency  
- status  
- timestamp  

This data is used for analytics and billing.

---

## 💰 Billing Logic

- Admin sets price per request  
- Provider earns base amount  
- Platform earns remaining margin  

---

## 🚦 Rate Limiting

- Free users → limited requests  
- Pro users → higher limits  

---

## 📡 API Endpoints

Authentication:
POST /api/auth/login  
POST /api/auth/register  

APIs:
POST /api/apis  
GET /api/apis/public  
POST /api/apis/generate-key  

Gateway:
GET /gateway/:apiKey/:endpoint  

Analytics:
GET /api/analytics/user  
GET /api/analytics/global  

Billing:
GET /api/billing  

---

## 📁 Project Structure

server/
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
└── server.js

---

## ▶️ Running Locally

cd server  
npm install  
npm start  

---

## 🔐 Configuration

Create a .env file:

MONGO_URI=your_database_connection  
JWT_SECRET=your_secret_key  
PORT=5000  

---

## 🚀 Deployment

The backend is deployed on Render and connected to MongoDB Atlas.

---

## ⚠️ Important Notes

- Enable CORS for frontend access  
- Allow MongoDB network access  
- Ensure correct API routing  

---

## 🧪 Example Flow

User → Generate API Key → Call Gateway → Log Usage → Calculate Billing  

---

## 🎯 Highlights

- API Gateway architecture  
- Dynamic request routing  
- Usage tracking system  
- Billing and monetization logic  
- Scalable backend design  

---

## 👨‍💻 Author

Samyak Bahade
