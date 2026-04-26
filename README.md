# NexServe - Modern Food Delivery Platform

NexServe is a high-performance, full-stack food delivery application built with a focus on speed, beautiful UI, and seamless vendor/customer experiences.

## 🚀 Features

- **Vendor Dashboard**: Complete menu management with drag-and-drop image uploads.
- **Customer Experience**: Smooth browsing, cart management, and real-time tracking.
- **Cloud Storage**: Integrated with Supabase Storage for high-speed image delivery.
- **Authentication**: Role-based access control (Vendor/Customer) with JWT.
- **Responsive UI**: Built with Tailwind CSS and Framer Motion for a premium look and feel.
- **Rate Limiting**: Integrated security to prevent API abuse.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) (Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Context API
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: GSAP & Tailwind Animate
- **Components**: Radix UI & Shadcn/UI

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: PostgreSQL (hosted on [Supabase](https://supabase.com/))
- **Storage**: Supabase Storage for dish images
- **Auth**: JWT (JSON Web Tokens)
- **Email**: SMTP integration for transactional emails
- **Validation**: Pydantic v2

## 📦 Project Structure

```text
NexServe/
├── frontend/               # React application (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page-level components (Menu, Orders, etc.)
│   │   ├── services/      # API client and service layers
│   │   └── context/       # Auth and Cart state providers
├── backend/                # FastAPI application
│   ├── app/
│   │   ├── models/        # SQLAlchemy database models
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic layer
│   │   └── core/          # Configuration and security
│   └── scripts/            # Database migration and utility scripts
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Supabase Account

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Configure your `.env` file (refer to `.env.example`):
   ```env
   DATABASE_URL=your_postgresql_url
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   JWT_SECRET=your_secret_key
   ```
4. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the root directory:
   ```bash
   cd NexServe
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env` file:
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🖼️ Image Storage Setup
NexServe uses Supabase Storage for dish images. 
1. Create a public bucket named `dishes` in your Supabase project.
2. The backend automatically handles uploads and provides public URLs for the frontend.

## 📄 License
This project is private and for educational purposes.
