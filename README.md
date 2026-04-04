# Freelance Marketplace (MERN Stack)

A complete MERN-stack freelance platform where clients can post projects, manage proposals, and hire talent; and freelancers can browse work, submit proposals, and track their jobs.

## Features

**For Clients:**
- Create and manage projects (open, assigned, completed)
- View proposals specific to each project
- Accept proposals (automatically rejects others)
- Mark projects as complete once work is done
- Dashboard with high-level statistics

**For Freelancers:**
- Browse and filter available open projects
- Submit customized proposals with bid amount and cover letter
- Dashboard to track status of all sent proposals (pending, accepted, rejected)
- Edit or withdraw proposals while they are pending

**Core/Shared:**
- Secure authentication via JSON Web Tokens (JWT)
- Role-based route protection
- Fully responsive dark mode UI
- Global Toast notification system
- Clean RESTful API architecture

---

## Tech Stack

- **Frontend:** React 19, React Router v7, Custom CSS (Variables, Flex/Grid)
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Auth:**  BcryptJS (password hashing), JWT (Bearer token on Protected routes)

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas connection string.

### 1. Backend Setup

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Create a `.env` file in the `server` directory with:
   ```
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/freelance_db
   JWT_SECRET=your_super_secret_jwt_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *(Server will run on `http://localhost:5000`)*

### 2. Frontend Setup

1. Open a **new** terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```
   *(App will open at `http://localhost:3000`)*

---

## Testing the App

1. Click **Register** in the nav bar.
2. Select **Client** role. Create an account ("Client Test").
3. You will land on the Client Dashboard. Click **Post Project**, fill in the details, and submit.
4. **Log out**, then head to **Register** again.
5. Select **Freelancer** role. Create another account ("Freelancer Test").
6. You will land on the Freelancer Dashboard. Browse to **Projects**, find the open project, and submit a proposal.
7. Return to the Freelancer Dashboard—you'll see the proposal is **Pending**.
8. You can experiment with editing or deleting it while it's pending.
9. **Log out** and log back in as the **Client** (or simply use another browser).
10. Navigate to your project's **Proposals** page from the dashboard, click **Accept**.
11. Mark the project as complete when ready.

Enjoy exploring the full workflow!
