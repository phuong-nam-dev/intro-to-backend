# Copilot Instructions - Intro to Backend

## Architecture Overview

This is an Express.js REST API with MongoDB/Mongoose for authentication and data management.

**Entry point flow**: `src/index.js` → loads env vars → connects MongoDB → starts Express app from `src/app.js`

**Stack**: Express 5, Mongoose 9, JWT auth, bcrypt password hashing, ES modules (`"type": "module"`)

## Project Structure Patterns

```
src/
  index.js          # Server bootstrap & MongoDB connection
  app.js            # Express app config, middleware, route mounting
  config/           # Database connection & constants
  models/           # Mongoose schemas with pre-save hooks
  controllers/      # Request handlers with try-catch error handling
  routes/           # Express Router definitions
```

## Key Conventions

### 1. ES Module Imports
Always use ES6 imports with `.js` extensions:
```javascript
import User from "../models/user.model.js";
import { registerUser } from "../controllers/user.controller.js";
```

### 2. Mongoose Model Patterns
- Pre-save hooks for password hashing (see `user.model.js` line 32-36)
- Instance methods for password comparison: `user.comparePassword()`
- Timestamps enabled: `{ timestamps: true }`
- Field validation with min/max/required/unique directly in schema

### 3. Authentication Flow
- JWT tokens generated with 7-day expiry
- `protect` middleware extracts `Bearer` token from headers
- `loggedIn` boolean flag tracked on User model (updated on login/logout)
- JWT_SECRET must be in `.env`

### 4. Controller Structure
- Always async functions with try-catch
- Return JSON with consistent format: `{ message, user, token }` or `{ message, error }`
- HTTP status codes: 201 (created), 400 (validation), 401 (auth), 409 (conflict), 500 (server error)
- Export named functions AND middleware (see `user.controller.js`)

### 5. Route Mounting
- Routes use Express Router: `Router()`
- Mounted in `app.js` with path prefix: `app.use("/api/users", userRouter)`
- Route methods: `.route("/path").post(handler)` pattern

### 6. CORS Configuration
Whitelist-based CORS in `app.js` - update whitelist array for new frontend origins

## Development Commands

```bash
npm run dev    # Start with nodemon (auto-reload)
npm start      # Production start
```

## Environment Setup

Required `.env` variables:
```
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret-key
PORT=3000
```

## Database Connection

MongoDB connection in `src/config/database.js`:
- Strict query mode disabled: `mongoose.set("strictQuery", false)`
- 10s server selection timeout, 20s connect timeout
- Process exits on connection failure

## Missing Implementations

`post.controller.js` is empty - Post model exists but no CRUD operations implemented yet.
