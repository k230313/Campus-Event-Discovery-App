# Campus Event Discovery App (CEDA) - Systems Design and Implementation

**Kent Institute - Capstone Project 2026**  
**Team Member: Navroop Kaur (Front-End Developer)**

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [File and Folder Structure](#file-and-folder-structure)
5. [Database Design](#database-design)
6. [User Interface Design](#user-interface-design)
7. [AI Implementation](#ai-implementation)
8. [Setup and Installation](#setup-and-installation)
9. [Features Implementation](#features-implementation)
10. [Testing and Quality Assurance](#testing-and-quality-assurance)

---

## 1. Project Overview

### 1.1 Project Description
The Campus Event Discovery App (CEDA) is a comprehensive web-based platform designed for Kent Institute to centralize campus event management and discovery. The system enables students to discover, bookmark, and RSVP to events while providing organizers with tools to create and manage events efficiently.

### 1.2 Business Requirements
- **BR-01**: Centralized event information system for all campus activities
- **BR-02**: User authentication and role-based access (Students & Organizers)
- **BR-03**: Event discovery with search and filtering capabilities
- **BR-04**: RSVP management with volunteering options
- **BR-05**: Event bookmarking and personal dashboard
- **BR-06**: AI-powered chatbot for intelligent event assistance

### 1.3 Key Objectives
✅ Provide a single platform for all Kent Institute campus events  
✅ Enable easy event discovery through intelligent search and filtering  
✅ Facilitate student engagement through RSVP and volunteering  
✅ Support organizers in event creation and management  
✅ Enhance user experience with AI-powered assistance  
✅ Ensure accessibility and responsive design across devices  

---

## 2. System Architecture

### 2.1 Three-Tier Architecture

```
┌─────────────────────────────────────────┐
│     Presentation Layer (Front-End)      │
│  React 18 + TypeScript + Tailwind CSS   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│    Application Layer (Business Logic)   │
│   React Context API + Service Layer     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│        Data Layer (Database)             │
│  MySQL Database + OpenAI API Integration │
└─────────────────────────────────────────┘
```

### 2.2 Component Architecture

**Core Components:**
- **Authentication Module**: Login, Registration, User Management
- **Event Management Module**: Browse, Search, Filter, RSVP
- **Dashboard Module**: Student Dashboard, Organizer Dashboard
- **AI Chatbot Module**: OpenAI GPT-4 Integration
- **State Management**: React Context API

### 2.3 Design Patterns
- **Context Pattern**: Centralized state management
- **Component Pattern**: Reusable UI components
- **Service Pattern**: Separated business logic
- **Hook Pattern**: Custom React hooks for reusability

---

## 3. Technology Stack

### 3.1 Front-End Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.6.2 | Type Safety |
| Tailwind CSS | 4.0.0 | Styling Framework |
| React Router | 7.13.0 | Navigation |
| Radix UI | Latest | UI Components |
| Lucide React | Latest | Icons |

### 3.2 AI Integration
| Technology | Version | Purpose |
|------------|---------|---------|
| OpenAI API | 6.36.0 | AI Chatbot (GPT-4) |
| Natural Language Processing | - | Query Understanding |
| Context-Aware Responses | - | Intelligent Assistance |

### 3.3 Development Tools
- **Build Tool**: Vite 6.3.0
- **Package Manager**: pnpm 10.17.1
- **Code Quality**: ESLint, TypeScript
- **Version Control**: Git

---

## 4. File and Folder Structure

### 4.1 Project Directory Structure

```
/workspaces/default/code/
├── src/
│   ├── app/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── ui/               # Radix UI component library
│   │   │   ├── Navigation.tsx    # Main navigation bar
│   │   │   ├── ChatBot.tsx       # AI-powered chatbot
│   │   │   └── figma/            # Figma-imported components
│   │   ├── pages/                # Application pages
│   │   │   ├── Home.tsx          # Landing page
│   │   │   ├── Events.tsx        # Event browse page
│   │   │   ├── EventDetail.tsx   # Event detail page
│   │   │   ├── Login.tsx         # Login page
│   │   │   ├── Register.tsx      # Registration page
│   │   │   ├── Dashboard.tsx     # User dashboard
│   │   │   ├── CreateEvent.tsx   # Event creation form
│   │   │   └── EditEvent.tsx     # Event editing form
│   │   ├── context/              # State management
│   │   │   └── AppContext.tsx    # Global application state
│   │   ├── services/             # Business logic layer
│   │   │   └── openai.ts         # OpenAI API integration
│   │   ├── data/                 # Mock data
│   │   │   └── mockData.ts       # Sample events and users
│   │   ├── types.ts              # TypeScript type definitions
│   │   └── App.tsx               # Main application component
│   ├── styles/                   # Global styles
│   │   ├── theme.css             # Tailwind theme configuration
│   │   └── fonts.css             # Font imports
│   └── main.tsx                  # Application entry point
├── database/
│   └── schema.sql                # Complete database schema
├── public/                       # Static assets
├── .env.example                  # Environment variables template
├── package.json                  # Project dependencies
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── vite.config.ts                # Vite build configuration
```

### 4.2 Key Files Description

**Application Files:**
- `App.tsx`: Main application with routing configuration
- `AppContext.tsx`: Global state management for users, events, bookmarks, RSVPs
- `openai.ts`: AI service for intelligent chatbot responses

**Page Components:**
- `Home.tsx`: Landing page with hero section and features
- `Events.tsx`: Event listing with search, filters, and sorting
- `EventDetail.tsx`: Detailed event view with RSVP functionality
- `Dashboard.tsx`: Role-based dashboard (Student/Organizer)
- `CreateEvent.tsx` & `EditEvent.tsx`: Event management forms

**Core Components:**
- `Navigation.tsx`: Responsive navigation with authentication states
- `ChatBot.tsx`: AI-powered floating chatbot widget

---

## 5. Database Design

### 5.1 Entity Relationship Diagram (ERD)

```
┌─────────────────┐         ┌──────────────────┐
│     USERS       │         │  EVENT_CATEGORIES │
├─────────────────┤         ├──────────────────┤
│ PK: user_id     │         │ PK: category_id  │
│ name            │         │ category_name    │
│ email           │         │ description      │
│ password_hash   │         │ category_color   │
│ role            │         └──────────────────┘
│ created_at      │                  │
│ is_active       │                  │
└─────────────────┘                  │
         │                           │
         │ 1:N                       │
         ↓                           ↓
┌─────────────────────────────────────────────┐
│              EVENTS                          │
├─────────────────────────────────────────────┤
│ PK: event_id                                 │
│ FK: organizer_id → USERS(user_id)          │
│ FK: category → EVENT_CATEGORIES             │
│ title, description                          │
│ event_date, start_time, end_time            │
│ location                                    │
│ status, view_count, rsvp_count              │
│ volunteers_needed, volunteers_registered    │
│ seating_capacity, seats_booked              │
│ food_provided, food_options (JSON)          │
│ notes, image_url                            │
│ created_at, updated_at                      │
└─────────────────────────────────────────────┘
         │                    │
         │ 1:N                │ 1:N
         ↓                    ↓
┌──────────────────┐   ┌───────────────────────┐
│ EVENT_BOOKMARKS  │   │    EVENT_RSVPS        │
├──────────────────┤   ├───────────────────────┤
│ PK: bookmark_id  │   │ PK: rsvp_id           │
│ FK: user_id      │   │ FK: user_id           │
│ FK: event_id     │   │ FK: event_id          │
│ saved_at         │   │ attendee_type         │
└──────────────────┘   │ selected_food_option  │
                       │ seat_number           │
                       │ rsvp_status           │
                       │ created_at            │
                       └───────────────────────┘
                                │ 1:1
                                ↓
                       ┌───────────────────────┐
                       │  EVENT_VOLUNTEERS     │
                       ├───────────────────────┤
                       │ PK: volunteer_id      │
                       │ FK: rsvp_id           │
                       │ shift_start_time      │
                       │ shift_end_time        │
                       │ volunteer_role        │
                       │ tasks_assigned        │
                       │ hours_completed       │
                       └───────────────────────┘
```

### 5.2 Database Tables

**Table 1: users**
- Stores user accounts (students and organizers)
- Fields: user_id (PK), name, email, password_hash, role, created_at, is_active

**Table 2: events**
- Main events table with comprehensive event information
- Fields: event_id (PK), title, description, date/time, location, category, organizer info, metadata

**Table 3: event_rsvps**
- Tracks user registrations (attendees and volunteers)
- Fields: rsvp_id (PK), user_id (FK), event_id (FK), attendee_type, food_option, seat_number

**Table 4: event_bookmarks**
- User saved events
- Fields: bookmark_id (PK), user_id (FK), event_id (FK), saved_at

**Table 5: event_volunteers**
- Extended volunteer information
- Fields: volunteer_id (PK), rsvp_id (FK), shift times, role, tasks, hours

**Table 6: event_categories**
- Predefined event categories
- Fields: category_id (PK), category_name, description, color

### 5.3 Database Normalization
- **3rd Normal Form (3NF)** achieved
- No transitive dependencies
- All non-key attributes depend only on primary key
- Separate tables for entities with different lifecycles

### 5.4 Database Constraints
- Primary Keys: Ensure unique identification
- Foreign Keys: Maintain referential integrity
- Check Constraints: Validate data values (role, status, attendee_type)
- Unique Constraints: Prevent duplicate entries (user email, bookmarks, RSVPs)
- Triggers: Auto-update timestamps and maintain counts

---

## 6. User Interface Design

### 6.1 Design Principles
- **Consistency**: Uniform Kent Institute branding throughout
- **Accessibility**: WCAG 2.1 Level AA compliant
- **Responsive**: Mobile-first design (320px - 1920px)
- **Visual Hierarchy**: Clear information structure
- **User-Friendly**: Intuitive navigation and interactions

### 6.2 Color Scheme
| Color | Hex Code | Usage |
|-------|----------|-------|
| Navy Blue | #1B2E55 | Primary brand color, headers |
| Gold | #EF9B28 | Accent color, CTAs, highlights |
| Light Gray | #F0F3F9 | Backgrounds |
| White | #FFFFFF | Cards, content areas |
| Success Green | #10B981 | Confirmations |
| Error Red | #EF4444 | Errors, warnings |

### 6.3 Typography
- **Headings**: System font stack (optimized for readability)
- **Body**: System font stack
- **Font Sizes**: Responsive scaling with Tailwind utilities
- **Line Height**: Optimized for readability (1.5 - 1.75)

### 6.4 Key UI Screens

#### 6.4.1 Home Page
- Hero section with gradient background
- Feature highlights (4 cards)
- Statistics showcase
- Call-to-action sections

#### 6.4.2 Events Browse Page
- Advanced search bar
- Category and date filters
- Event cards with images, metadata
- Empty state handling

#### 6.4.3 Event Detail Page
- Large hero image
- Comprehensive event information
- RSVP form with food/seating options
- Statistics sidebar
- Volunteer opportunities

#### 6.4.4 Dashboard (Student)
- RSVP'd events tab
- Bookmarked events tab
- Event cards with quick actions

#### 6.4.5 Dashboard (Organizer)
- Statistics cards (events, RSVPs, views)
- Event management list
- Create/Edit/Delete actions

### 6.5 Component Library
Using Radix UI for accessible, customizable components:
- Buttons, Inputs, Cards
- Dropdowns, Selects, Radio Groups
- Tabs, Badges, ScrollAreas
- Modals, Tooltips

---

## 7. AI Implementation

### 7.1 OpenAI Integration

**Technology**: OpenAI GPT-4-mini API  
**Implementation File**: `src/app/services/openai.ts`

### 7.2 AI Features

#### 7.2.1 Natural Language Processing
- Understands user queries in natural language
- Context-aware responses based on conversation history
- Event context integration for accurate recommendations

#### 7.2.2 Intelligent Event Discovery
```typescript
// Example AI prompt structure
const systemPrompt = `You are CEDA Assistant, an intelligent chatbot...
Available events: [event data]
Guidelines: [response guidelines]`;

const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: conversationHistory,
  temperature: 0.7
});
```

#### 7.2.3 Features Implemented
✅ **Natural Language Understanding**: Interprets user intent  
✅ **Context Retention**: Maintains conversation history  
✅ **Smart Recommendations**: Suggests relevant events based on user interest  
✅ **Fallback Responses**: Pattern-matching when API unavailable  
✅ **Event-Aware**: Accesses real-time event data for accurate information  

### 7.3 AI Chatbot UI
- Floating chat widget
- Gradient design matching brand colors
- Typing indicators
- Message history
- Timestamp display
- Responsive layout

### 7.4 AI Configuration
Environment variable: `VITE_OPENAI_API_KEY`  
Model: `gpt-4o-mini` (cost-effective, high performance)  
Max tokens: 200 (concise responses)  
Temperature: 0.7 (balanced creativity)

---

## 8. Setup and Installation

### 8.1 Prerequisites
- Node.js 18+ and pnpm
- OpenAI API key
- Modern web browser
- Text editor (VS Code recommended)

### 8.2 Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd code

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key

# 4. Run development server
pnpm run dev

# 5. Access application
# Open http://localhost:5173 in your browser
```

### 8.3 Database Setup

```bash
# 1. Install MySQL Server
# 2. Create database
mysql -u root -p
CREATE DATABASE ceda_database;

# 3. Import schema
mysql -u root -p ceda_database < database/schema.sql

# 4. Verify tables
SHOW TABLES;
```

### 8.4 OpenAI API Setup

1. Go to https://platform.openai.com
2. Create account / Sign in
3. Navigate to API Keys
4. Create new secret key
5. Copy key to `.env` file:
   ```
   VITE_OPENAI_API_KEY=sk-...your-key-here...
   ```

---

## 9. Features Implementation

### 9.1 User Authentication
✅ **UC-01**: User Registration (Student/Organizer roles)  
✅ **UC-02**: User Login with role-based routing  
✅ Session management with localStorage  
✅ Protected routes  

### 9.2 Event Discovery
✅ **UC-03**: Browse all events  
✅ **UC-04**: Search events by keyword  
✅ **UC-05**: Filter by category and date range  
✅ Event cards with rich information  
✅ Volunteer and seating indicators  

### 9.3 Event Management
✅ **UC-06**: View event details  
✅ **UC-07**: RSVP as attendee  
✅ **UC-08**: RSVP as volunteer  
✅ Food preference selection  
✅ Seat number assignment  
✅ Bookmark events  

### 9.4 Organizer Features
✅ **UC-09**: Create new events  
✅ **UC-10**: Edit existing events  
✅ Delete events  
✅ View event statistics  
✅ Manage RSVPs  

### 9.5 AI Chatbot
✅ Intelligent event recommendations  
✅ Natural language query processing  
✅ Context-aware conversations  
✅ Real-time event data integration  

---

## 10. Testing and Quality Assurance

### 10.1 Testing Approach
- **Manual Testing**: All user flows tested
- **Browser Testing**: Chrome, Firefox, Safari, Edge
- **Responsive Testing**: Mobile, Tablet, Desktop viewports
- **Accessibility Testing**: Keyboard navigation, screen readers

### 10.2 Test Cases Covered
✅ User registration and login  
✅ Event browsing and filtering  
✅ RSVP workflow (attendee and volunteer)  
✅ Bookmark functionality  
✅ Event creation and editing  
✅ Dashboard functionality  
✅ AI chatbot interactions  
✅ Responsive layouts  
✅ Error handling  

### 10.3 Quality Metrics
- **Code Quality**: TypeScript for type safety
- **Performance**: Optimized with Vite
- **Accessibility**: Radix UI components
- **Maintainability**: Modular component structure
- **Scalability**: Context-based state management

---

## Conclusion

The Campus Event Discovery App successfully implements all business requirements with modern web technologies, AI integration, and comprehensive database design. The system provides an intuitive, accessible, and feature-rich platform for Kent Institute's campus event management needs.

**Key Achievements:**
- ✅ Complete front-end implementation with React + TypeScript
- ✅ AI-powered chatbot using OpenAI GPT-4
- ✅ Comprehensive MySQL database schema
- ✅ Professional UI/UX design with Kent Institute branding
- ✅ All SRS requirements implemented
- ✅ Responsive and accessible design

---

**Project Developed By**: Navroop Kaur (Front-End Developer)  
**Institution**: Kent Institute  
**Year**: 2026  
**Assessment**: Capstone Project - Systems Design and Implementation
