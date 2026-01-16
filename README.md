# 🛒 ShopNest – E-Commerce Backend API

A modern, scalable e-commerce backend API built with Node.js, Express, and
MongoDB (Mongoose). Features secure authentication, product management, order
processing, and integrated Stripe payments with webhook handling.

## 🚀 Features

- **User Authentication**: JWT-based auth with access/refresh tokens
- **Product Management**: CRUD operations with inventory tracking
- **Order Processing**: Complete order lifecycle management
- **Payment Integration**: Stripe Checkout with webhook handling
- **Role-Based Access**: Admin and customer role separation
- **Real-time Updates**: Webhook-driven order status updates
- **Security**: CORS, bcrypt password hashing, input validation

## � Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Payments**: Stripe API
- **Security**: bcryptjs, CORS
- **Environment**: dotenv

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud)
- Stripe account for payment processing
- Git for version control

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/programmerrakibul/shop-nest.git
cd shop-nest
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database_name>?appName=<app_name>

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Client URL (for payment redirects)
CLIENT_URL=http://localhost:3000

# Server Port (optional)
PORT=8000
```

### 4. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:8000`

## 🔐 Authentication Flow

### User Registration & Login

1. **Register**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login` - Returns access & refresh tokens
3. **Token Refresh**: `POST /api/auth/refresh` - Get new access token
4. **Logout**: `POST /api/auth/logout` - Invalidate tokens

### Token Usage

Include the access token in request headers:

```
Authorization: Bearer <access_token>
```

## 💳 Payment Flow

### Complete Payment Process

1. **Create Order**

   ```
   POST /api/orders
   Headers: Authorization: Bearer <token>
   Body: { "productID": "...", "quantity": 2 }
   ```

   - Validates product availability
   - Creates pending order in database
   - Generates Stripe Checkout session
   - Returns checkout URL

2. **Customer Payment**
   - Customer redirected to Stripe Checkout
   - Completes payment on Stripe's secure platform
   - Redirected to success/cancel URL

3. **Webhook Processing**

   ```
   POST /api/orders/webhook (Stripe webhook)
   ```

   - Stripe sends payment events to webhook
   - Updates order status based on payment result
   - Reduces product inventory on successful payment
   - Handles payment failures and cancellations

4. **Order Status Updates**
   - `pending` → `processing` (payment successful)
   - `pending` → `cancelled` (payment failed/expired)
   - Inventory automatically updated

### Payment States

- **pending**: Order created, awaiting payment
- **processing**: Payment successful, order being prepared
- **shipped**: Order dispatched
- **delivered**: Order completed
- **cancelled**: Order cancelled

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register     # Register new user
POST   /api/auth/login        # User login
POST   /api/auth/logout       # User logout (requires auth)
POST   /api/auth/refresh      # Refresh access token
```

### Product Endpoints

```
GET    /api/products          # Get all products (public)
GET    /api/products/:id      # Get product by ID (public)
POST   /api/products          # Create product (admin only)
```

### Order Endpoints

```
POST   /api/orders            # Create new order (auth required)
GET    /api/orders            # Get all orders (admin only)
GET    /api/orders/customer   # Get user's orders (auth required)
POST   /api/orders/webhook    # Stripe webhook (public)
```

### Example Requests

#### Register User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword"
  }'
```

#### Create Order

```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "productID": "product_id_here",
    "quantity": 1
  }'
```

## 🗄 Database Schema

### User Model

```javascript
{
  name: String (required, 3-50 chars)
  email: String (required, unique)
  password: String (required, min 6 chars, hashed)
  image: String (default placeholder)
  uid: String (unique identifier)
  role: String (customer/admin)
  emailVerified: Boolean
  tokens: { accessToken, refreshToken }
  lastLoggedIn: Date
}
```

### Product Model

```javascript
{
  name: String (required, 3-200 chars)
  description: String (required, 10-2000 chars)
  price: Number (required, min 0)
  category: String (required)
  subcategory: String (optional)
  quantity: Number (required, 0-100000)
  imageUrl: String
}
```

### Order Model

```javascript
{
  userInfo: { uid, email }
  orderID: String (unique)
  product: {
    name: String
    productID: ObjectId (ref: Product)
    price: Number
    quantity: Number
  }
  status: String (pending/processing/shipped/cancelled/delivered)
  paymentStatus: String (pending/paid/failed/cancelled/processing)
}
```

## 🔧 Configuration

### Stripe Webhook Setup

1. Login to Stripe Dashboard
2. Go to Developers → Webhooks
3. Add endpoint: `https://yourdomain.com/api/orders/webhook`
4. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `checkout.session.async_payment_failed`
   - `checkout.session.async_payment_succeeded`
5. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### MongoDB Setup

- **Local**: Install MongoDB and use `mongodb://localhost:27017/shopnest`
- **Cloud**: Use MongoDB Atlas connection string

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=<production_mongodb_uri>
JWT_SECRET=<strong_production_secret>
JWT_REFRESH_SECRET=<strong_production_refresh_secret>
STRIPE_SECRET_KEY=<live_stripe_key>
STRIPE_WEBHOOK_SECRET=<production_webhook_secret>
CLIENT_URL=<production_frontend_url>
```

### Deployment Platforms

- **Vercel**: Configured with `vercel.json`
- **Heroku**: Add environment variables in dashboard
- **Railway**: Connect GitHub repo and set env vars
- **DigitalOcean**: Use App Platform or Droplets

## 🛡 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- CORS protection
- Input validation and sanitization
- Role-based access control
- Secure webhook signature verification
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check existing documentation
- Review API endpoints and examples above
