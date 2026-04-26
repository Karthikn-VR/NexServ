# NexServe Project Analysis

This document provides a comprehensive overview of the NexServe food ordering application. It breaks down the directory structure, the purpose of each major file, and how they contribute to the overall functionality of the project.

## 🏗️ High-Level Architecture
NexServe is a full-stack application consisting of:
*   **Frontend**: A React application built with Vite, styled with Tailwind CSS, and using `react-router-dom` for navigation. It communicates with the backend via REST APIs.
*   **Backend**: A Python FastAPI backend that serves API endpoints, handles authentication, processes orders, and connects to a PostgreSQL database (likely hosted on Supabase).

---

## 📁 Root Directory (`c:\Users\karth\Desktop\NexServe\`)
The root folder holds the configuration files that tie the project together.

*   **`package.json` & `package-lock.json`**: Define all the npm dependencies for the frontend (React, Tailwind, Radix UI, GSAP, etc.) and custom scripts like `npm run dev`.
*   **`vite.config.js`**: Configuration for the Vite bundler, telling it how to build and serve the React app locally.
*   **`tailwind.config.js` & `postcss.config.js`**: Configuration for Tailwind CSS, defining custom themes, colors, and the CSS processing pipeline.
*   **`eslint.config.js`**: Rules for linting the code to maintain code quality and catch errors early.

---

## 🖥️ Frontend (`src/`)
This is where the user interface lives.

### Key Entry Points
*   **`main.jsx`**: The root of the React app. It renders the `<App />` component into the DOM and sets up any global providers (like Auth or Toast context).
*   **`App.jsx`**: The main routing component. It defines all the different pages a user can visit (`/login`, `/menu`, `/cart`, etc.) and wraps them in `<ProtectedRoute>` to ensure unauthorized users cannot access certain pages.

### `src/pages/`
These files represent the main screens of the application.
*   **`LandingPage.jsx`**: The welcome screen for new users (`/`).
*   **`Login.jsx`**: Handles user and vendor authentication.
*   **`Menu.jsx`**: Displays the list of available dishes. It fetches data from the backend and allows users to add items to their cart.
*   **`Cart.jsx`**: Shows the user's selected items, calculates totals, and provides a checkout flow.
*   **`Payment.jsx`**: Handles the final step of checkout, collecting payment details or confirming the order.
*   **`Orders.jsx`**: A history screen showing past and current orders for a user.
*   **`Tracking.jsx`**: Shows live status updates for a specific order (e.g., Cooking, Out for Delivery).
*   **`VendorDashboard.jsx`**: A dedicated view for restaurant owners (admins) to see incoming orders, accept/reject them, and update their statuses.

### `src/components/`
Reusable UI building blocks used across different pages.
*   **`Navbar.jsx`**: The top navigation bar, linking to different pages.
*   **`MenuItemCard.jsx`**: A card displaying a single dish, its price, image, and an "Add to Cart" button.
*   **`CartItem.jsx`**: A specific row in the Cart page representing a chosen item.
*   **`OrderCard.jsx`**: Used in the vendor dashboard or order history to summarize an order.
*   **`Loader.jsx`**: A visual spinner or animation shown when data is fetching.
*   **`Effects/`**: Contains visual flourishes like `ClickSpark.jsx` to make the UI feel dynamic and premium.

### Other Important Folders
*   **`hooks/useAuth.js`**: A custom React Hook that likely reads from the local storage or an Auth Context to determine if the user is logged in and what role they have.
*   **`services/api/client.js`**: Contains Axios or Fetch wrappers to communicate with the FastAPI backend endpoints cleanly.

---

## ⚙️ Backend (`backend/`)
The Python server that manages all data and business logic.

### Core Configuration
*   **`requirements.txt`**: Lists all Python packages needed (FastAPI, Uvicorn, Psycopg2, Passlib, etc.).
*   **`.env`**: Stores secret environment variables like Database URLs and JWT secrets.
*   **`init_db.py` & `seed.py`**: Scripts used to create the database tables (Users, Orders, Dishes) and fill them with initial dummy data.
*   **`app/main.py`**: The entry point for FastAPI. It initializes the app, configures CORS so the React app can talk to it, and registers all the API routes.

### `backend/app/routes/`
These files act as the controllers for your API, defining exactly what happens when the frontend makes a request.
*   **`api_auth.py`**: Handles user registration, login, and issuing JWT tokens.
*   **`api_dishes.py`**: Handles requests to get the menu items, or for a vendor to add/update/delete dishes.
*   **`api_orders.py`**: The most complex route. It handles creating new orders from the cart, updating order statuses (Vendor accepting, Driver picking up), and fetching order histories.
*   **`api_coupons.py`**: Manages discount codes.
*   **`api_driver.py`**: Likely handles assigning a delivery driver to an order and updating tracking coordinates.
*   **`image/`**: A static directory configured in `main.py` to serve images for dishes.

### Underlying Logic
*   **`backend/app/models/`**: Defines the Python classes that represent database tables (e.g., `User`, `Order`, `Dish`).
*   **`backend/app/schemas/`**: Defines Pydantic models. These are used to validate incoming JSON requests from the frontend to ensure the data is correct before processing it.
*   **`backend/app/email_service.py`**: A dedicated service for sending automated emails (Order Confirmations, Status Updates) to users.

---

## 🔄 Data Flow Summary
Here is how the project works end-to-end:
1. **User Action**: A user clicks "Checkout" in `Cart.jsx`.
2. **API Call**: The frontend uses `services/api/client.js` to send a POST request to the backend with the cart details.
3. **Backend Route**: The FastAPI server receives this at `api_orders.py`.
4. **Validation**: The data is validated using a Pydantic schema in `schemas/`.
5. **Database**: The new order is inserted into the PostgreSQL database using SQL queries or an ORM.
6. **Notification**: `email_service.py` is triggered to send an order confirmation to the user.
7. **Vendor View**: The vendor, looking at `VendorDashboard.jsx`, sees the new order appear (likely via polling or websockets) and can click "Accept". This triggers another API call to update the order status, continuing the cycle.
