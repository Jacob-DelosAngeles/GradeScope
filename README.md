# GradeScoped

GradeScoped is a robust **MERN Stack (MongoDB, Express, React, Node.js)** application designed to help students calculate their Pre-Final Standing and determine their eligibility for exemption from the Final Exam.

## 🚀 Features

- **Pre-Final Grade Calculation**: Automatically computes grade based on weighted components:
  - Exercises: 20%
  - Long Exams: 60%
  - Quizzes: 5%
  - Project: 15%
- **Exemption Logic**:
  - **Exempt** if Pre-Final Grade ≥ 77% **AND** no individual Long Exam score < 60%.
- **Final Exam Target**: If not exempt, calculates the exact score needed on the Final Exam to pass (assuming a target final grade of 75).
- **Dynamic Inputs**: Support for variable number of Long Exams.
- **Modern UI**: Built with React and Tailwind CSS for a clean, mobile-responsive experience.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)

## 📦 Installation & Usage

See [INSTRUCTIONS.md](./INSTRUCTIONS.md) for a detailed step-by-step guide on how to run this application locally.
