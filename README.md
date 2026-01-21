# Cosmetic E-Commerce Web App

This is the backend for the CBC (Cosmetic Beauty Care) web application, built with Node.js, Express, and MongoDB. It provides RESTful APIs for user management, product management, order processing, OTP email verification, and more.

## Features
- User registration, login (including Google login), and authentication
- Admin and customer roles
- Product CRUD operations
- Order management
- OTP email verification for password reset
- Block/unblock users (admin only)
- Secure password hashing
- JWT-based authentication
- Email notifications using Nodemailer

## Technologies Used
- Node.js
- Express.js
- MongoDB (Mongoose)
- Nodemailer (Gmail SMTP)
- JWT (jsonwebtoken)
- bcrypt
- dotenv

## Getting Started

### Prerequisites
- Node.js and npm installed
- MongoDB database (local or Atlas)

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/geethsenaviratne/cbc-backend.git
   cd cbc-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:5000` by default.

## API Endpoints

### User
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `POST /api/users/google-login` - Login with Google
- `GET /api/users/send-otp/:email` - Send OTP to email
- `POST /api/users/change-password` - Change password via OTP
- `GET /api/users/:email` - Get user details
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/block/:email` - Block/unblock user (admin only)

### Product
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Order
- `POST /api/orders` - Create order
- `GET /api/orders/:userEmail` - Get orders for a user
- `GET /api/orders` - Get all orders (admin only)

## Frontend
The frontend for this project is available at:
- **Live Demo:** [https://cbc-frontend-sept.vercel.app/](https://mizo-beauty.vercel.app/)
- **Source Code:** [https://github.com/geethsenaviratne/cbc-frontend.git](https://github.com/geethsenaviratne/cbc-frontend.git)

## Deployment
The backend is deployed at: Render 

## License
This project is licensed under the MIT License.

## Author
- Geeth Senaviratne

---
Feel free to explore the frontend and backend repositories, try out the live demo, and contribute or raise issues if you have suggestions or find bugs!