# ClubLink 🎓

_A modern club & society management platform for universities._

> This full-stack project was developed for my final-year university dissertation, focused on improving student club management through digital tools.

---

## 📌 Overview

**ClubLink** is a responsive web platform designed to help student societies and university clubs manage members, handle transactions, and promote memberships with ease.

Built using modern technologies like **React**, **Tailwind CSS**, and **TypeScript**, the platform prioritizes clean UI/UX and scalable architecture.

---

## 🚀 Features

### ✅ For Committees & Admins

- **📋 Member Management**  
  Add, expire, and remove members with full control and filtering.

- **💳 Transaction Dashboard**  
  View real-time summaries of money in/out with exportable tables.

- **🎟️ Memberships & Tickets**  
  Create ticket types with custom pricing, expiry logic, and visibility controls.

- **🧾 Promo Codes**  
  Create limited-use discount codes tied to specific ticket types.

- **🕵️ Audit Logs**  
  Track committee actions for accountability with a searchable log.

### 📱 Mobile-Responsive UI

A fully responsive design, including:

- Hamburger menu navigation
- Scrollable, stacked tables on smaller screens
- Adaptive layouts for dashboard stats and forms

---

## ⚙️ Tech Stack

- **Frontend**: React + Tailwind CSS + TypeScript
- **Routing**: React Router
- **Icons**: FontAwesome
- **Auth**: JWT (Token stored via `localStorage`)
- **Backend**: Node + Express (TypeScript)
- **Database**: PostgreSQL
- **CI/CD**: GitHub Actions
- **Security Testing**: Snyk

---

## 🧪 Testing

- **Unit Testing**: Jest
- **Integration Testing**: Jest + Supertest + React Testing Library
- **End-to-End (E2E)**: Cypress
- **Security Audits**: Snyk CLI

---

## 🛠️ Getting Started

### 📦 Requirements

- Node.js (v20+)
- PostgreSQL running locally or via Docker

### 🔧 Development

```bash
npm run dev
```
