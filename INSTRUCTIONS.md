# How to Run GradeScoped

Follow these instructions to set up and run the GradeScoped application locally.

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local instance or Atlas URI)

## 1. Clone the Repository

```bash
git clone <repository-url>
cd GradeScope
```

## 2. Backend Setup

The backend runs on Node.js and Express.

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Configure Environment Variables:
   - Create a `.env` file in the `server` directory.
   - Add your MongoDB URI and Port (default is localhost:27017 and 5000):
     ```env
     MONGO_URI=mongodb://localhost:27017/gradescoped
     PORT=5000
     ```
4. Start the server:
   ```bash
   node index.js
   ```
   *You should see "Server running on port 5000" and "MongoDB connected".*

## 3. Frontend Setup

The frontend is a React application built with Vite.

1. Open a **new terminal** window/tab and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the link provided in the terminal (usually `http://localhost:5173`) in your browser.

## 4. Using the Application

1. Enter your scores for **Exercises**, **Quizzes**, and **Project** (0-100).
2. Enter your **Long Exam** scores. Use the "+ Add Long Exam" button to add more exams if needed.
3. Click **Calculate**.
4. View your results:
   - **Green**: You are Exempt!
   - **Yellow**: You are NOT Exempt. The app will show the score you need on the Final Exam.

## 5. MVP Features (Beta)

The application now includes features to gather user demand:

1.  **Feedback**: Click the "Give us an honest review" button to submit feedback.
2.  **Email Subscription**: Enter an email in the "Stay Updated" form to subscribe.

## 6. Accessing Data (Emails & Feedback)

All data is stored in your local MongoDB database. To view it:

1.  Open a new terminal.
2.  Start the MongoDB Shell:
    ```bash
    mongosh
    ```
3.  Switch to the database:
    ```bash
    use gradescoped
    ```
4.  View Feedback:
    ```javascript
    db.feedbacks.find()
    ```
5.  View Subscribers:
    ```javascript
    db.subscribers.find()
    ```

## Troubleshooting

-   **MongoDB Error**: Ensure your local MongoDB service is running.
    -   **WSL/Linux**: `sudo service mongod start`
    -   **Windows**: Open Services app and start "MongoDB Server".
-   **Connection Refused**: Make sure the backend is running on port 5000 and the frontend is pointing to `http://localhost:5000` (configured in `App.jsx`).
