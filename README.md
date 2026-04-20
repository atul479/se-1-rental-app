# Vehicle Rental Application - Core Backend

Production-ready Node.js + Express backend for a vehicle rental app using MongoDB, JWT auth, role-based access control, Joi validation, and MVC architecture.

## Tech Stack
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: JWT, bcryptjs
- Validation: Joi
- Logging: Morgan

## Features Checklist
- User registration and login
- Password hashing with bcrypt
- JWT token generation and route protection middleware
- Role-based access (user/admin)
- Vehicle CRUD for admin
- Vehicle listing with pagination, search, and filters
- Booking creation with availability overlap checks
- Booking total price calculation by number of days
- User bookings + cancel booking
- Mock payment flow that confirms booking status
- Admin endpoints for all users, all bookings, all payments
- Centralized not-found and error handling middleware

## Prerequisites
- Node.js 14+
- MongoDB (or in-memory MongoDB in development mode)

## Run Instructions
1. Install dependencies

```bash
npm install
```

2. Configure environment (`.env`)

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/vehicle-rental
JWT_SECRET=super_secret_key_vehicle_rental_2026
NODE_ENV=development
```

3. Start the server

```bash
npm run start
```

Server runs at:

```text
http://localhost:5000
```

## API Base Routes
- `/api/auth`
- `/api/vehicles`
- `/api/bookings`
- `/api/payments`

## Postman Sample Requests

Use this header for protected routes:

```text
Authorization: Bearer <JWT_TOKEN>
```

### 1) Auth Module

Register user

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Atul Kumar",
  "age": 24,
  "gender": "male",
  "email": "atul@example.com",
  "dob": "2001-05-14",
  "password": "secret123",
  "drivingLicenseNo": "DL-09-1234567",
  "mobileNo": "9876543210"
}
```

Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "atul@example.com",
  "password": "secret123"
}
```

Get all users (admin)

```http
GET /api/auth/users
Authorization: Bearer <ADMIN_TOKEN>
```

### 2) Vehicle Module

Add vehicle (admin)

```http
POST /api/vehicles
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "name": "Tesla Model S",
  "type": "Car",
  "pricePerDay": 150,
  "availability": true,
  "image": "https://example.com/tesla.jpg",
  "description": "Premium electric sedan"
}
```

Get all vehicles with pagination/search/filter/sort

```http
GET /api/vehicles?pageNumber=1&keyword=tesla&type=Car&availability=true&maxPrice=200&sort=priceLow
```

Get vehicle by ID

```http
GET /api/vehicles/<VEHICLE_ID>
```

Update vehicle (admin)

```http
PUT /api/vehicles/<VEHICLE_ID>
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "pricePerDay": 170,
  "availability": true
}
```

Delete vehicle (admin)

```http
DELETE /api/vehicles/<VEHICLE_ID>
Authorization: Bearer <ADMIN_TOKEN>
```

### 3) Booking Module

Create booking

```http
POST /api/bookings
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "vehicleId": "<VEHICLE_ID>",
  "startDate": "2026-05-01",
  "endDate": "2026-05-05"
}
```

Get my bookings

```http
GET /api/bookings/mybookings
Authorization: Bearer <USER_TOKEN>
```

Cancel booking

```http
PUT /api/bookings/<BOOKING_ID>/cancel
Authorization: Bearer <USER_TOKEN>
```

Get all bookings (admin)

```http
GET /api/bookings
Authorization: Bearer <ADMIN_TOKEN>
```

### 4) Payment Module (Mock)

Process payment for booking

```http
POST /api/payments
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "bookingId": "<BOOKING_ID>"
}
```

Get all payments (admin)

```http
GET /api/payments
Authorization: Bearer <ADMIN_TOKEN>
```

## Folder Structure
- `/config`: DB connection
- `/controllers`: business logic
- `/middleware`: auth and error middleware
- `/models`: Mongoose models
- `/routes`: Express API routes
- `/utils`: helpers (JWT generation)

## Notes
- Booking cost is calculated as `ceil((endDate - startDate) / 1 day) * pricePerDay`.
- Vehicle availability is checked both via availability flag and booking overlap detection.
- Payment is mocked (no external gateway) and marks booking as confirmed on success.
