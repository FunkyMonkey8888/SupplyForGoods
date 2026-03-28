# SupplyForGoods
# Supply Chain Management System

## 📌 Project Overview
The Supply Chain Management System is a role‑based web application designed to manage and streamline product flow between **Manufacturers, Wholesalers, and Consumers**.  
The system focuses on **secure access, structured workflows, real‑world order lifecycles, and inventory management**, while keeping the architecture simple and maintainable.

---

## 🎯 Project Objectives
- Provide a unified platform for all supply chain stakeholders
- Enforce role‑based access and secure authentication
- Manage inventory and orders with real‑world business rules
- Simulate enterprise‑level workflows without unnecessary complexity

---

## 👥 User Roles
- **Manufacturer** – Creates products and supplies wholesalers
- **Wholesaler** – Procures products in bulk and sells to consumers
- **Consumer** – Browses products and places orders

---

## ⚙️ Core Features

### ✅ Authentication & Security
- User registration and login
- JWT‑based authentication
- Role‑based authorization
- Token expiry handling

### ✅ Product & Inventory Management
- Manufacturer product creation
- Real‑time stock tracking
- Inventory reservation and deduction
- Overselling prevention

### ✅ Order Management
- Order placement and tracking
- Controlled order lifecycle:
  - `PLACED → CONFIRMED → SHIPPED → DELIVERED / CANCELLED`
- Validation for invalid actions and states

### ✅ Role‑Specific Dashboards
- Manufacturer dashboard for products and bulk orders
- Wholesaler dashboard for procurement and inventory
- Consumer dashboard for browsing and order tracking

### ✅ Error & Validation Handling
- Insufficient stock checks
- Unauthorized access handling
- Meaningful API error responses

---

## 🏗️ System Architecture

### High‑Level Architecture
- **Frontend**: Angular
- **Backend**: Spring Boot (REST APIs)
- **Security**: Spring Security + JWT
- **Database**: MySQL
