# Online Job Booking System - Use Case Diagram

## PlantUML Diagram

```plantuml
@startuml Online_Job_Booking_UseCase
!theme plain
skinparam actorBackgroundColor #FFE6E6
skinparam usecaseBackgroundColor #E6F2FF
skinparam usecase {
    BackgroundColor #E6F2FF
    BorderColor #0066CC
    ArrowColor #000000
}
skinparam rectangle {
    BackgroundColor #FFF9E6
    BorderColor #FF9900
}

left to right direction

actor User
actor Admin
participant "Brevo\n(Email Service)" as Brevo
participant "Google Gemini\n(AI Service)" as Gemini

package "Authentication System" {
  usecase "Register\nPOST /auth/register" as UC01
  usecase "Send OTP\nPOST /auth/sendingOTP" as UC02
  usecase "Verify OTP\nPUT /auth/verify_otp" as UC03
  usecase "Login\nPOST /auth/login" as UC04
  usecase "Logout\nGET /auth/logout" as UC05
  usecase "Get Profile\nGET /auth/me" as UC06
}

package "Booking Management" {
  usecase "View Companies\nGET /companies" as UC07
  usecase "Create Booking\nPOST /booking" as UC08
  usecase "View My Bookings\nGET /booking" as UC09
  usecase "View All Bookings\nGET /booking/:id" as UC10
  usecase "Edit Booking\nPUT /booking/:id" as UC11
  usecase "Cancel Booking\nDELETE /booking/:id" as UC12
}

package "Company Management" {
  usecase "Add Company\nPOST /companies" as UC13
  usecase "Delete Company\nDELETE /companies/:id" as UC14
}

package "Favoriting System" {
  usecase "Like Company\nPOST /companies/:cid/favoriting" as UC15
  usecase "Unlike Company\nDELETE /companies/:cid/favoriting/:fid" as UC16
}

package "Email Service" {
  usecase "Send Email\nPOST /sendEmail" as UC17
}

' User flows
User --> UC01
User --> UC02
User --> UC03
User --> UC04
User --> UC05
User --> UC06
User --> UC07
User --> UC08
User --> UC09
User --> UC11
User --> UC12
User --> UC15
User --> UC16

' Admin flows
Admin --> UC01
Admin --> UC02
Admin --> UC03
Admin --> UC04
Admin --> UC05
Admin --> UC06
Admin --> UC07
Admin --> UC08
Admin --> UC09
Admin --> UC10
Admin --> UC11
Admin --> UC12
Admin --> UC13
Admin --> UC14
Admin --> UC15
Admin --> UC16

' Include relationships
UC01 .> UC02 : includes
UC02 .> UC03 : includes
UC03 .> UC04 : includes

' Use relationships
UC08 ..> UC07 : needs

' External Services
UC02 --> Brevo : calls
UC17 --> Brevo : calls
UC12 --> Brevo : triggers
UC08 ..> Gemini : may use (AI analysis)

@enduml
```

## External Services Integration

### 📧 Brevo (Email Service Provider)
- **Purpose**: Send transactional emails
- **Integration Points**:
  - **Send OTP** (UC02): Send verification email with OTP code to user
  - **Send Email** (UC17): Generic email sending endpoint
  - **Cancel Booking** (UC12): Trigger notification when timeslot becomes available (background task)

### 🤖 Google Gemini (AI Service)
- **Purpose**: AI analysis and processing
- **Integration Points**:
  - **Create Booking** (UC08): May use AI for analysis or recommendations (optional)
- **Dependencies**: `@google/genai` package

---

## API Summary

### Authentication (6 APIs)

| HTTP Method | Endpoint | Description | Access | Requires Auth |
|-------------|----------|-------------|--------|---------------|
| POST | `/api/v1/auth/register` | Register new user account | Public | No |
| POST | `/api/v1/auth/login` | Login user with credentials | Public | No |
| GET | `/api/v1/auth/logout` | Logout current user | Public | Yes |
| GET | `/api/v1/auth/me` | Get current logged-in user info | Private | Yes |
| POST | `/api/v1/auth/sendingOTP` | Send OTP via email for verification | Private | Yes |
| PUT | `/api/v1/auth/verify_otp` | Verify email using OTP | Private | Yes |

### Booking (5 APIs)

| HTTP Method | Endpoint | Description | Access | User Role | Requires Auth |
|-------------|----------|-------------|--------|-----------|---------------|
| POST | `/api/v1/booking` | Create new booking | Private | user, admin | Yes |
| GET | `/api/v1/booking` | Get user/admin bookings | Private | user, admin | Yes |
| GET | `/api/v1/booking/:id` | Get specific booking details | Private | admin only | Yes |
| PUT | `/api/v1/booking/:id` | Edit booking (timeslot or status) | Private | user, admin | Yes |
| DELETE | `/api/v1/booking/:id` | Cancel booking | Private | user, admin | Yes |

### Company (3 APIs)

| HTTP Method | Endpoint | Description | Access | User Role | Requires Auth |
|-------------|----------|-------------|--------|-----------|---------------|
| GET | `/api/v1/companies` | Get all companies | Private | user, admin | Yes |
| POST | `/api/v1/companies` | Add new company | Private | admin only | Yes |
| DELETE | `/api/v1/companies/:id` | Delete company | Private | admin only | Yes |

### Favoriting (2 APIs)

| HTTP Method | Endpoint | Description | Access | User Role | Requires Auth |
|-------------|----------|-------------|--------|-----------|---------------|
| POST | `/api/v1/companies/:cid/favoriting` | Like/favorite a company | Private | user, admin | Yes |
| DELETE | `/api/v1/companies/:cid/favoriting/:fid` | Unlike/unfavorite a company | Private | user, admin | Yes |

### Email (1 API)

| HTTP Method | Endpoint | Description | Access | Requires Auth |
|-------------|----------|-------------|--------|---------------|
| POST | `/api/v1/sendEmail` | Send email notification | Public | No |

---

## Total APIs: **17 Endpoints**

### Breakdown by Feature:
- **Authentication:** 6 APIs
- **Booking Management:** 5 APIs
- **Company Management:** 3 APIs
- **Favoriting:** 2 APIs
- **Email Service:** 1 API

---

## Key Features & Business Rules

### Authentication Flow
1. **Register** - Create new user account
2. **Send OTP** - Send verification email with OTP
3. **Verify OTP** - Verify email using OTP code
4. **Login** - Login to system (only verified users)
5. **Logout** - Logout from system
6. **Get Me** - Retrieve current user profile

### Booking Management
- **Create Booking** - User can book company timeslots
  - Maximum 3 confirmed bookings per user
  - Cannot book duplicate timeslot
  - Cannot book same company twice
  - Timeslot must be available (capacity check)
  
- **View Bookings** - User sees own bookings, Admin sees all
- **View Booking Details** - Admin only
- **Edit Booking** - Change timeslot or status (admin can change status)
- **Cancel Booking** - User can cancel own booking, triggers notification if slot becomes available

### Company Management
- **View Companies** - List all available companies
- **Add Company** - Admin only, create new company with timeslots
- **Delete Company** - Admin only, remove company

### Favoriting System
- **Like Company** - Add company to favorites, enables notification waiting list
- **Unlike Company** - Remove from favorites

### Email Service
- **Send Email** - Email notification service (used for slot opening notifications)

---

## Use Case Relationships

- **Include relationships:**
  - Register → Send OTP → Verify OTP → Login
  
- **Extend/Use relationships:**
  - Create Booking uses Get Companies (to validate and check capacity)
  - Cancel Booking may trigger Email notification (if slot availability improves)
  - Like Company enables waiting list notification system

---

## Security & Authorization

### Roles:
1. **User** - Regular users who can book and favorite companies
2. **Admin** - Can manage companies and view all bookings

### Protection Levels:
- **Public:** Register, Login, Logout
- **Protected:** All other endpoints require valid JWT token
- **Role-based:** Some endpoints restricted to admin or user roles

