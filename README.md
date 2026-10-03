# Money Guardian AI

> An AI-powered personal finance management and financial risk analysis platform built for AI DEV FEST 2026.

## Overview

**Money Guardian AI** is a personal finance management application designed to help users understand, monitor, and manage their financial activity through their own transaction data.

The application analyzes user-provided financial transactions and provides insights about spending, savings, financial health, spending categories, and potentially risky transactions.

The project focuses on practical, transaction-aware financial intelligence rather than claiming an external generative-AI model that is not implemented in the current codebase.

---

## Problem Statement

Managing personal finances can be difficult when users do not have a clear understanding of where their money is going, how much they are spending, how much they are saving, and which transactions may require additional attention.

Many users record financial activity without receiving meaningful analysis from that data.

Money Guardian AI addresses this problem by allowing users to store their own financial transactions and transforming those transactions into understandable financial insights, risk indicators, and interactive analysis.

---

## Solution

Money Guardian AI provides a centralized financial dashboard where authenticated users can manage their transactions and analyze their financial activity.

The system calculates financial metrics from the user's own transaction data and provides:

- Spending analysis
- Savings information
- Category-based spending insights
- Financial health indicators
- Transaction risk analysis
- Risk explanations
- A transaction-aware financial assistant
- What-If financial scenario analysis

---

## Key Features

### 1. User Authentication

Users can create an account and log in securely.

The application provides authenticated, user-specific access to financial data.

### 2. Financial Dashboard

The dashboard provides an overview of the user's financial activity, including:

- Total income
- Total spending
- Savings
- Spending-related information
- Financial activity summaries

Only the authenticated user's transaction data is used for their financial analysis.

### 3. Transaction Management

Users can add and manage their financial transactions.

Transactions can contain information such as:

- Amount
- Merchant
- Category
- Status
- Transaction date

The application uses these transactions as the primary source for financial analysis.

### 4. Money Insights

Money Insights analyzes transaction data to provide useful information about spending behavior and financial activity.

The system can identify spending patterns and calculate relevant financial metrics from the user's stored transactions.

### 5. Risk Guardian

Risk Guardian evaluates transactions using a rule-based risk scoring system.

Each transaction can receive:

- Risk score
- Risk level
- Risk reasons

Risk levels are:

- **Low**
- **Medium**
- **High**

The system also explains the factors contributing to a transaction's risk score.

### 6. AI Financial Assistant

The AI Assistant works with the authenticated user's stored transaction data and can answer questions related to:

- Total spending
- Savings
- Highest spending category
- Transaction risks
- Financial health
- Transaction count

For risk-related questions, the assistant can identify a mentioned merchant and provide the corresponding transaction risk explanation when available.

### 7. What-If Simulator

The What-If Simulator allows users to explore financial scenarios and understand how changes in financial values can affect possible outcomes.

### 8. Responsive Financial UI

The frontend provides a modern dashboard-based interface for managing and understanding financial information.

---

## AI and Financial Intelligence

Money Guardian AI currently uses **transaction-aware rule-based intelligence** rather than claiming a generative-AI or machine-learning model that is not implemented in the current codebase.

### Financial Analysis

The system calculates financial metrics directly from the user's transaction data.

For example:

```text
Savings = Total Income - Total Spending
```

The system also calculates the percentage of income being spent.

### Risk Scoring

Transactions are evaluated using several risk indicators.

#### High Transaction Amount

Transactions with an absolute amount of **Tk 10,000 or more** receive **30 risk points**.

#### Unknown Merchant

Transactions whose merchant name starts with `unknown` receive **25 risk points**.

#### Review Status

Transactions with a `review` status receive **20 risk points**.

#### Transfer Category

Transactions categorized as `transfer` receive **10 risk points**.

#### Unusual Transaction Time

Transactions occurring before **6:00 AM** or at/after **11:00 PM** receive **15 risk points**.

### Risk Calculation

The total risk score is capped at 100.

```text
0 - 39    -> Low Risk
40 - 69   -> Medium Risk
70 - 100  -> High Risk
```

The system also provides reasons explaining why a transaction received its risk score.

---

## AI Assistant Approach

The current AI Assistant is implemented as a **transaction-aware backend service**.

It retrieves the authenticated user's transactions and derives financial information from them.

The assistant identifies intents related to:

- Spending
- Savings
- Categories
- Risk
- Transactions
- Financial health

For risk-related questions, the assistant can identify a mentioned merchant and provide the corresponding transaction risk explanation when the transaction exists in the user's data.

### Important Implementation Note

The current version does **not** claim to use:

- A large language model
- OpenAI API
- Gemini API
- A trained machine-learning prediction model
- A third-party generative-AI chatbot

The financial intelligence described in this README reflects the currently implemented application logic.

---

## Technology Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Recharts
- Lucide React
- JavaScript

### Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic
- Pydantic Settings
- python-dotenv
- HTTPX

### Database

- SQLite
- SQLAlchemy ORM

### Authentication

- JWT-based authentication
- Password/security utilities

### Development

- Node.js
- npm
- Concurrently
- Git
- GitHub

---

## Project Structure

```text
money-guardian-ai/
|
+-- backend/
|   +-- app/
|       +-- core/
|       |   +-- dependencies.py
|       |   +-- jwt.py
|       |   +-- security.py
|       |
|       +-- database/
|       |   +-- connection.py
|       |   +-- init_db.py
|       |   +-- migration.py
|       |   +-- seed.py
|       |
|       +-- models/
|       |   +-- transaction.py
|       |   +-- user.py
|       |
|       +-- routes/
|       |   +-- assistant.py
|       |   +-- auth.py
|       |   +-- insights.py
|       |   +-- prediction.py
|       |   +-- risk.py
|       |   +-- transactions.py
|       |
|       +-- schemas/
|       |   +-- transaction.py
|       |
|       +-- services/
|       |   +-- ai_assistant.py
|       |   +-- ai_service.py
|       |   +-- prediction_service.py
|       |   +-- risk_service.py
|       |   +-- spending_service.py
|       |
|       +-- main.py
|
+-- frontend-vite/
|   +-- public/
|   +-- src/
|       +-- pages/
|       |   +-- AI Assistant.jsx
|       |   +-- Dashboard.jsx
|       |   +-- Login.jsx
|       |   +-- MoneyInsights.jsx
|       |   +-- RiskGuardian.jsx
|       |   +-- Signup.jsx
|       |   +-- Transactions.jsx
|       |   +-- WhatIfSimulator.jsx
|       |
|       +-- services/
|       |   +-- api.js
|       |
|       +-- App.jsx
|       +-- App.css
|       +-- index.css
|       +-- main.jsx
|
+-- ml/
|   +-- data/
|   +-- feature_engineering.py
|   +-- prediction_model.py
|   +-- preprocessing.py
|   +-- risk_model.py
|   +-- spending_analysis.py
|
+-- docs/
|   +-- architecture.md
|   +-- problem-statement.md
|   +-- solution.md
|
+-- .gitignore
+-- LICENSE
+-- package.json
+-- package-lock.json
+-- README.md
```

> The `ml/` and `docs/` directories are included in the repository structure for project organization. The currently implemented financial intelligence described above is based on the active backend services and application logic.

---

## Requirements

Before running the project, install:

- Node.js
- npm
- Python 3.x
- pip
- Git

Backend dependencies are listed in:

```text
backend/requirements.txt
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mahadi044/ai-dev-fest-2026.git
cd ai-dev-fest-2026/money-guardian-ai
```

### 2. Install Root Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
cd ..
```

---

## Running the Application

From the project root:

```bash
npm run dev
```

This starts both the frontend and backend using `concurrently`.

### Frontend

```text
http://localhost:5173/
```

### Backend

```text
http://127.0.0.1:8001
```

### Run Backend Separately

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8001
```

### Run Frontend Separately

```bash
npm --prefix frontend-vite run dev
```

---

## Frontend Production Build

To create a production frontend build:

```bash
npm --prefix frontend-vite run build
```

To preview the production build:

```bash
npm --prefix frontend-vite run preview
```

---

## Testing and Verification

### Frontend Linting

```bash
npm --prefix frontend-vite run lint
```

### Application Verification

After starting the application:

1. Open the frontend URL.
2. Create or log into an account.
3. Add financial transactions.
4. Verify that the dashboard reflects the entered transactions.
5. Check the Transactions page.
6. Check Money Insights.
7. Check Risk Guardian.
8. Test the AI Assistant using questions about the available transaction data.
9. Test the What-If Simulator.

---

## Data Privacy and Local Development

The project uses a local SQLite database during development.

The local database file is:

```text
money_guardian.db
```

This file is excluded from Git using `.gitignore`.

Environment files and local development artifacts should also remain outside the public repository.

Users should avoid entering real sensitive financial information into development or demo environments unless appropriate security controls are in place.

---

## External Libraries and Services

The project uses open-source software libraries listed in:

```text
package.json
frontend-vite/package.json
backend/requirements.txt
```

No external generative-AI API is claimed as part of the currently implemented AI Assistant.

Any external service, API, dataset, or third-party component added during development should be documented appropriately.

---

## Current Development Status

Money Guardian AI currently includes:

- User authentication
- User-specific transaction management
- Financial dashboard
- Spending analysis
- Money Insights
- Risk Guardian
- Transaction risk scoring
- Transaction-aware AI Assistant
- What-If Simulator
- React/Vite frontend
- FastAPI backend
- SQLite database

The project may continue to evolve during the AI DEV FEST 2026 competition.

---

## Hackathon

**Event:** AI DEV FEST 2026

**Project:** Money Guardian AI

The project is developed as a financial technology solution focused on practical transaction analysis, financial insights, transaction risk detection, and personalized financial information.

The project is maintained through Git version control with incremental commits during development.

---

## Repository

GitHub repository:

https://github.com/mahadi044/ai-dev-fest-2026

---

## Deployment

The application is currently configured for local development.

A public deployment URL can be added here if the application is deployed:

```text
<YOUR_DEPLOYMENT_URL>
```

---

## License

This project is distributed under the license included in the repository.
