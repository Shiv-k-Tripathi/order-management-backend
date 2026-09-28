# Backend - Multi-Store Order Management System

A RESTful backend API built with **Node.js, Express, TypeScript, Prisma, MongoDB, and Socket.IO** to manage stores, products, orders, and real-time order notifications.

## 🚀 Tech Stack

* **Node.js** – JavaScript runtime
* **Express.js** – REST API framework
* **TypeScript** – Static typing
* **MongoDB** – NoSQL database
* **Prisma ORM** – Database access and schema management
* **Socket.IO** – Real-time order notifications
* **Zod** – Request validation, if configured
* **dotenv** – Environment configuration

## 📁 Project Structure

```text
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   └── prisma.ts
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── sockets/
│   │   └── order.socket.ts
│   ├── validators/
│   │   └── order.validator.ts
│   ├── types/
│   └── server.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

*This is a suggested structure based on the project. Adjust filenames and directories to match your actual backend.*

## ⚙️ Prerequisites

Install the following:

* Node.js compatible with your package versions
* npm
* MongoDB local instance or MongoDB Atlas
* Git

Verify your installation:

```bash
node -v
npm -v
git --version
```

## 🛠️ Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Navigate to the backend directory:

```bash
cd full-stack-order-management/backend
```

Install dependencies:

```bash
npm install
```

Generate the Prisma client:

```bash
npx prisma generate
```

## 🔐 Environment Configuration

Create a `.env` file in the backend root directory.

```env
PORT=5000
DATABASE_URL="mongodb://127.0.0.1:27017/order_management"
CLIENT_URL="http://localhost:3000"
```

| Variable       | Description                              |
| -------------- | ---------------------------------------- |
| `PORT`         | Express server port                      |
| `DATABASE_URL` | MongoDB connection string used by Prisma |
| `CLIENT_URL`   | Frontend origin permitted by CORS        |

For MongoDB Atlas, replace the local connection string with your Atlas connection string.

Do not commit `.env` or expose database credentials. Maintain a sanitized `.env.example` file for other developers.

## 🗄️ Database Configuration

This project uses MongoDB with Prisma.

Prisma configuration is maintained in:

```text
src/config/prisma.ts
```

The Prisma schema is located at:

```text
prisma/schema.prisma
```

Example Prisma MongoDB datasource:

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

Use the actual schema and generator configuration from your repository.

After changing the Prisma schema, regenerate the client:

```bash
npx prisma generate
```

For MongoDB, use the migration and schema-management workflow appropriate to your Prisma version and project configuration.

## ▶️ Running the Backend

Start the development server:

```bash
npm run dev
```

If the project uses a different script, check `package.json`.

Build the TypeScript project:

```bash
npm run build
```

Start the compiled production server:

```bash
npm start
```

The development API is expected to run at:

```text
http://localhost:5000
```

Example API base URL:

```text
http://localhost:5000/api
```

Confirm the actual port and route prefix in your server configuration.

## 🏗️ Architecture

The backend follows a layered architecture:

* **Routes:** Define HTTP endpoints and middleware.
* **Controllers:** Handle incoming requests and HTTP responses.
* **Services:** Contain business logic and database operations.
* **Validators:** Validate request parameters and payloads.
* **Config:** Initialize Prisma and shared infrastructure.
* **Sockets:** Manage Socket.IO connections, store rooms, and order events.

This separation helps keep business logic independent of HTTP handling and makes the application easier to maintain and test.

## 🏬 Store Management APIs

| Method | Endpoint      | Description     |
| ------ | ------------- | --------------- |
| GET    | `/api/stores` | Retrieve stores |
| POST   | `/api/stores` | Create a store  |

Example create-store request:

```json
{
  "name": "Zomato"
}
```

Example response (illustrative):

```json
{
  "success": true,
  "data": {
    "id": "STORE_ID",
    "name": "Zomato"
  }
}
```

The actual response fields depend on the implemented store model and controller.

## 📦 Product Management APIs

| Method | Endpoint        | Description       |
| ------ | --------------- | ----------------- |
| GET    | `/api/products` | Retrieve products |
| POST   | `/api/products` | Create a product  |

Example create-product request:

```json
{
  "name": "Coffee",
  "price": 4.5
}
```

**Important:** Products are not associated with a store at creation time. Store association is established when an order is created.

Example response (illustrative):

```json
{
  "success": true,
  "data": {
    "id": "PRODUCT_ID",
    "name": "Coffee",
    "price": 4.5
  }
}
```

## 🛒 Order Management APIs

| Method | Endpoint                        | Description                 |
| ------ | ------------------------------- | --------------------------- |
| POST   | `/api/orders`                   | Create an order             |
| GET    | `/api/orders`                   | Retrieve orders             |
| GET    | `/api/orders?store_id=STORE_ID` | Retrieve orders for a store |
| PATCH  | `/api/orders/:id/status`        | Update order status         |

Confirm the exact query parameter names and route prefix in the backend implementation.

### Create Order

**Endpoint:**

```http
POST /api/orders
```

Example request:

```json
{
  "storeId": "STORE_ID",
  "items": [
    {
      "itemId": "PRODUCT_ID",
      "qty": 2
    }
  ]
}
```

The backend should validate the store and products, calculate the total using trusted product prices, and persist the order.

### Get Orders

**Endpoint:**

```http
GET /api/orders?page=1&limit=10
```

Example store-filtered request:

```http
GET /api/orders?store_id=STORE_ID&page=1&limit=10
```

Pagination and filtering behavior should match the actual service implementation.

### Update Order Status

**Endpoint:**

```http
PATCH /api/orders/ORDER_ID/status
```

Example request:

```json
{
  "status": "PREPARING"
}
```

Supported status values may include:

* `PLACED`
* `PREPARING`
* `COMPLETED`

Use the exact enum defined in the project.

## 🔔 Real-Time Notifications with Socket.IO

Socket.IO is used to notify clients when orders are created or their statuses change.

Socket implementation:

```text
src/sockets/order.socket.ts
```

### Event Flow

1. The client establishes a Socket.IO connection.
2. The client requests to join the relevant store room.
3. The server validates and processes the room join.
4. When an order is created, the backend emits an order-created event.
5. When an order status changes, the backend emits a status-updated event.
6. Clients subscribed to the relevant store receive the notification.

### Expected Events

| Event                 | Direction       | Purpose                       |
| --------------------- | --------------- | ----------------------------- |
| `store:join`          | Client → Server | Request to join a store room  |
| `store:joined`        | Server → Client | Confirm room membership       |
| `order:created`       | Server → Client | Notify about a new order      |
| `order:statusUpdated` | Server → Client | Notify about a status change  |
| `socket:error`        | Server → Client | Report a socket-related error |

These are illustrative event names based on the frontend integration. Ensure they exactly match the actual backend implementation.

### Store Room Convention

A common room naming convention is:

```text
store:<STORE_ID>
```

For example:

```text
store:65f0123456789abcdef01234
```

The server should verify that the connecting user is authorized to subscribe to the requested store. Room membership must not be treated as secure merely because the client supplied a store ID.

### Reconnection

Socket.IO clients should reconnect automatically after transient network interruptions. On reconnect, the frontend should rejoin its authorized store rooms. The server should clean up disconnected sockets and avoid duplicate listener registration.

## 📊 Analytics and Archival

The assessment includes these additional requirements:

* Orders per day
* Revenue per store
* Top five selling items
* Archiving orders older than 30 days
* Separate storage for archived orders

Potential endpoint:

```http
POST /api/archive-old-orders
```

This endpoint is an assessment example, not a confirmed implemented route. Verify the actual route, service, schema, and behavior before documenting it as available.

Analytics endpoints and response structures should likewise be documented from the actual implementation.

## ✅ Validation and Error Handling

The backend should validate incoming requests before performing database operations.

Recommended validations:

* Required store ID for order creation
* Valid store and product references
* Non-empty order item list
* Positive integer quantities
* Valid order status
* Server-side total calculation
* Appropriate pagination limits

Recommended error handling:

* `400 Bad Request` for invalid input
* `404 Not Found` for missing resources
* `500 Internal Server Error` for unexpected server failures

Use the project's actual HTTP status codes and error response format.

Example illustrative error response:

```json
{
  "success": false,
  "message": "Validation failed"
}
```

## 🧪 Testing the API

You can test endpoints using Postman, Insomnia, or cURL.

Retrieve stores:

```bash
curl http://localhost:5000/api/stores
```

Retrieve products:

```bash
curl http://localhost:5000/api/products
```

Create a product:

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Coffee","price":4.5}'
```

Create an order:

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"storeId":"STORE_ID","items":[{"itemId":"PRODUCT_ID","qty":2}]}'
```

Update an order status:

```bash
curl -X PATCH http://localhost:5000/api/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status":"PREPARING"}'
```

Replace placeholder IDs with valid IDs from your database.

## 🔒 Security and Performance

Recommended practices:

* Validate all request bodies, parameters, and query strings.
* Keep database credentials in environment variables.
* Enforce store-level authorization on the server.
* Avoid trusting client-submitted order totals.
* Use database indexes for frequently queried fields, such as store ID and creation date, where appropriate.
* Apply pagination to order listings.
* Avoid returning unnecessary database fields.
* Configure CORS for approved frontend origins.
* Use centralized error handling and structured logging.
* Protect administrative or scheduled archival operations from unauthorized access.

## 🐳 Docker

If Docker support is configured in the repository, document the exact build and run commands here. Do not assume a Dockerfile or Compose configuration exists unless it has been added and tested.

## 🚀 Deployment

For production deployment:

1. Provision a MongoDB database.
2. Configure production environment variables.
3. Set the frontend origin in the backend CORS configuration.
4. Build the TypeScript backend.
5. Start the production server.
6. Configure the hosting platform and network access for Socket.IO.
7. Verify API endpoints and real-time events from the deployed frontend.
8. Review logs and database access permissions.

## 👨‍💻 Developer

**Shiv Kumar Tripathi**
Full Stack Developer

**Project:** Multi-Store Order Management System
**Repository:** `full-stack-order-management`

## 📄 License

This project was developed as part of a Full Stack Developer Assessment.
