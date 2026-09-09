# Personal Expense Tracker 📊

A robust, full-stack web application designed to help users manage their personal finances effectively. It provides features for tracking expenses, managing categories and payment methods, setting monthly budgets, and importing records directly from Excel. 

This project was built using an **N-Tier Architecture** on the backend for clean separation of concerns and a modern **React (Vite)** frontend.

## ✨ Features

- **Secure Authentication:** JWT-based stateless authentication with password hashing.
- **Expense Management:** Complete CRUD operations to register and categorize daily expenses.
- **Smart Budgets:** Set monthly limits per category and track your `Spent Amount` and `Remaining Balance` dynamically, with automatic warnings when approaching the limit.
- **Bulk Excel Import:** Upload an `.xlsx` file to import multiple expenses at once. The system features a smart partial-import validation system that rejects invalid rows (e.g. negative amounts, unauthorized categories) while importing the valid ones.
- **Interactive Reports:** Visualize spending habits with Donut Charts and Bar Charts. Export these reports dynamically to various formats (Excel, JSON, TXT) thanks to the **Strategy Pattern**.
- **User Profile Management:** Update personal information and change passwords directly from the dashboard.

## 🛠️ Tech Stack

### Backend
- **Framework:** .NET 9 (ASP.NET Core Web API)
- **Architecture:** N-Tier (Domain, Application, Infrastructure, API)
- **Database:** SQL Server (LocalDB)
- **ORM:** Entity Framework Core
- **Libraries:** ClosedXML (Excel processing), System.IdentityModel.Tokens.Jwt

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **HTTP Client:** Axios (with Interceptors for JWT and Error Handling)
- **Charts:** Recharts
- **Icons:** Lucide React

## 🏗️ Architecture Overview

The backend strictly follows an N-Tier architecture to promote maintainability and decouple business logic from infrastructure:

1. **Domain:** Contains pure business entities (`User`, `Expense`, `Budget`, etc.) and has zero external dependencies.
2. **Application:** Contains business rules, Services, DTOs, and Interfaces (e.g., `IExpenseRepository`, `IReportExportStrategy`).
3. **Infrastructure:** Implements the Application interfaces. Handles Entity Framework `AppDbContext`, repository implementations, and third-party integrations (like ClosedXML for Excel processing).
4. **API:** The presentation layer. Contains RESTful Controllers, JWT configurations, Dependency Injection setups, and the `GlobalExceptionHandler`.

## 🚀 Getting Started

### Prerequisites
- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18 or higher)
- SQL Server Express / LocalDB

### 1. Running the Backend (API)
1. Open a terminal and navigate to the API project folder:
   ```bash
   cd src/PersonalExpenseTracker.API
   ```
2. Run the application using the HTTP profile (runs on port 5211):
   ```bash
   dotnet run --launch-profile "http"
   ```
   *Note: EF Core will automatically create the database `PersonalExpenseTrackerDb` on your LocalDB instance upon the first startup.*

### 2. Running the Frontend (React)
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd src/PersonalExpenseTracker.Frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

## 💡 Key Design Decisions
- **No `SpentAmount` column in DB:** Budget progress is calculated dynamically to prevent data inconsistency. The `Expense` table acts as the single source of truth.
- **SQL Group By:** Solved the N+1 query problem by leveraging SQL `GROUP BY` and dictionaries in memory to calculate exceeded budgets in exactly 2 queries regardless of the number of budgets.
- **Strategy Pattern:** Used for exporting reports. Adding a new export format (like CSV) only requires creating a new class that implements `IReportExportStrategy` without modifying the core service logic (Open/Closed Principle).
- **Security:** The backend never trusts the frontend for determining the user identity on sensitive operations. The `UserId` is always securely extracted from the JWT Claims.

---
*Developed as a Final Project for Programming II.*
z