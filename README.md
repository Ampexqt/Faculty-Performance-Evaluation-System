# Faculty Performance Evaluation System

A full-stack web application designed to streamline faculty performance evaluations at Zamboanga Peninsula Polytechnic State University (ZPPSU). The system supports multiple roles including Zonal Admins, QCE Managers, Faculty, and Students to manage and conduct evaluations efficiently.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 (via Vite)
- **Styling:** CSS Modules with vanilla CSS
- **Routing:** React Router DOM
- **Icons:** Lucide React

### Backend
- **Server:** Node.js with Express.js
- **Database:** MySQL (using `mysql2`)
- **Authentication:** JWT (JSON Web Tokens) & generic session handling
- **Security:** bcryptjs for password hashing, CORS

## 📂 Folder Organization

The project is divided into two main distinct directories:

### Root Directory (Frontend)
Contains the React application source code.
- **`src/components/`**: Reusable UI components (Buttons, Inputs, Modals, etc.).
- **`src/pages/`**: Application pages separated by user role (President, ZonalAdmin, QCEManager, Faculty, Student).
- **`src/styles/`**: Global CSS variables and styles.
- **`src/utils/`**: Helper functions and constants.

### `server/` Directory (Backend)
Contains the Node.js API server code.
- **`config/`**: Database configuration and connection logic.
- **`routes/`**: API route definitions separated by feature/role (e.g., `auth.js`, `faculty.js`, `evaluations.js`).
- **`middleware/`**: Custom middleware (if applicable).
- **`database-schema.sql`**: SQL file for initializing the database structure.

## 🛠️ Installation & Setup

Follow these steps to get the project running locally.

### Prerequisites
- Node.js (v18 or higher)
- MySQL Server (via WAMP, XAMPP, or standalone)
- Git

### 1. Database Setup
1. Start your MySQL server (e.g., via WAMP).
2. Create a new database named `faculty_evaluation_db` (or check `server/config` for the exact expected name).
3. Import the schema file located at `server/database-schema.sql` into your database to create the necessary tables.

### 2. Backend Setup
1. Open a terminal and navigate to the server folder:
   ```bash
   cd server
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and configure your database connection details (host, user, password, database name).
4. Start the backend server:
   ```bash
   npm run dev
   ```
   *The server usually runs on port 3000 or 5000.*

### 3. Frontend Setup
1. Open a **new** terminal instance and navigate to the project root:
   ```bash
   cd path/to/Faculty-Performance-Evaluation-System
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL shown (usually `http://localhost:5173`).

## 🔑 Default Accounts (For Testing)
- **Zonal Admin**: Check database for seeded admin accounts.
- **Faculty/Student**: You may need to register or use seeded data.

---
**Note:** Ensure both the backend and frontend terminals are running simultaneously for the application to work correctly.
