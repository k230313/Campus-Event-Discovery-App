# CEDA - Complete File and Folder Structure

## Root Directory Structure

```
/workspaces/default/code/
│
├── 📁 src/                          # Source code directory
├── 📁 public/                       # Static assets directory  
├── 📁 database/                     # Database schema and SQL files
├── 📁 node_modules/                 # Dependencies (auto-generated)
├── 📄 package.json                  # Project dependencies and scripts
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 vite.config.ts                # Vite build tool configuration
├── 📄 tailwind.config.js            # Tailwind CSS configuration
├── 📄 .env.example                  # Environment variables template
├── 📄 PROJECT_DOCUMENTATION.md      # Complete project documentation
├── 📄 FILE_STRUCTURE.md             # This file
└── 📄 README.md                     # Project readme
```

---

## Detailed Source Code Structure (`src/`)

### 📁 `src/app/` - Main Application Code

```
src/app/
│
├── 📁 components/                   # Reusable React components
│   ├── 📁 ui/                       # UI component library (Radix UI)
│   │   ├── button.tsx               # Button component
│   │   ├── card.tsx                 # Card component
│   │   ├── input.tsx                # Input component
│   │   ├── badge.tsx                # Badge component
│   │   ├── select.tsx               # Select dropdown component
│   │   ├── tabs.tsx                 # Tabs component
│   │   ├── radio-group.tsx          # Radio button group
│   │   ├── label.tsx                # Form label component
│   │   ├── textarea.tsx             # Textarea component
│   │   ├── scroll-area.tsx          # Scrollable area component
│   │   ├── switch.tsx               # Toggle switch component
│   │   └── [40+ more UI components] # Complete Radix UI library
│   │
│   ├── 📁 figma/                    # Figma-imported components
│   │   └── ImageWithFallback.tsx    # Image component with fallback
│   │
│   ├── Navigation.tsx               # Main navigation bar component
│   └── ChatBot.tsx                  # AI-powered chatbot widget
│
├── 📁 pages/                        # Application pages/routes
│   ├── Home.tsx                     # Landing page
│   ├── Events.tsx                   # Event browsing page
│   ├── EventDetail.tsx              # Individual event detail page
│   ├── Login.tsx                    # User login page
│   ├── Register.tsx                 # User registration page
│   ├── Dashboard.tsx                # User dashboard (Student/Organizer)
│   ├── CreateEvent.tsx              # Event creation form (Organizer)
│   └── EditEvent.tsx                # Event editing form (Organizer)
│
├── 📁 context/                      # State management
│   └── AppContext.tsx               # Global application context/state
│
├── 📁 services/                     # Business logic layer
│   └── openai.ts                    # OpenAI API integration service
│
├── 📁 data/                         # Mock data for development
│   └── mockData.ts                  # Sample events and users
│
├── types.ts                         # TypeScript type definitions
└── App.tsx                          # Main application component
```

### 📁 `src/styles/` - Styling Files

```
src/styles/
├── theme.css                        # Tailwind theme configuration
└── fonts.css                        # Custom font imports
```

### Root Level Files

```
src/
├── main.tsx                         # Application entry point
└── vite-env.d.ts                   # Vite TypeScript definitions
```

---

## Database Structure (`database/`)

```
database/
└── schema.sql                       # Complete MySQL database schema
                                     # Includes:
                                     # - 6 tables (users, events, rsvps, etc.)
                                     # - Triggers for auto-updates
                                     # - Views for common queries
                                     # - Stored procedures
                                     # - Sample data
```

---

## Detailed File Descriptions

### Core Application Files

#### 📄 `src/main.tsx`
- **Purpose**: Application entry point
- **Description**: Initializes React app, renders root component
- **Lines of Code**: ~15
- **Dependencies**: React, ReactDOM

#### 📄 `src/app/App.tsx`
- **Purpose**: Main application component with routing
- **Description**: Sets up React Router, navigation, and page routes
- **Lines of Code**: ~37
- **Key Features**:
  - Route configuration for all pages
  - AppProvider wrapper for global state
  - Navigation component integration
  - ChatBot widget integration

---

### Page Components

#### 📄 `src/app/pages/Home.tsx`
- **Purpose**: Landing/home page
- **Description**: Welcome page with hero section, features, and CTAs
- **Lines of Code**: ~118
- **Key Sections**:
  - Hero section with statistics
  - Feature highlights (4 cards)
  - Call-to-action sections
- **UI Elements**: Buttons, Cards, Badges, Links

#### 📄 `src/app/pages/Events.tsx`
- **Purpose**: Event browsing and discovery page
- **Description**: Display all events with search and filters
- **Lines of Code**: ~247
- **Key Features**:
  - Search bar (keyword search)
  - Category filter dropdown
  - Date range filter
  - Event cards grid
  - Bookmark functionality
  - Empty state handling
- **State Management**: useState, useMemo for filtering

#### 📄 `src/app/pages/EventDetail.tsx`
- **Purpose**: Individual event detail page
- **Description**: Complete event information with RSVP form
- **Lines of Code**: ~390
- **Key Features**:
  - Large hero image
  - Event information grid
  - RSVP form (attendee/volunteer)
  - Food preference selection
  - Seat number assignment
  - Event statistics sidebar
  - Volunteer opportunity card
- **Form Elements**: Radio groups, Select dropdowns, Buttons

#### 📄 `src/app/pages/Login.tsx`
- **Purpose**: User authentication page
- **Description**: Login form for students and organizers
- **Lines of Code**: ~100
- **Key Features**:
  - Email and password inputs
  - Form validation
  - Error handling
  - Demo mode instructions
- **Authentication**: Calls AppContext login function

#### 📄 `src/app/pages/Register.tsx`
- **Purpose**: New user registration page
- **Description**: Registration form with role selection
- **Lines of Code**: ~130
- **Key Features**:
  - Name, email, password inputs
  - Password confirmation
  - Role selection (Student/Organizer)
  - Form validation
- **Authentication**: Calls AppContext register function

#### 📄 `src/app/pages/Dashboard.tsx`
- **Purpose**: User dashboard (role-based)
- **Description**: Different views for Students and Organizers
- **Lines of Code**: ~260
- **Student Dashboard**:
  - RSVP'd events tab
  - Bookmarked events tab
  - Event cards with details
- **Organizer Dashboard**:
  - Statistics cards (events, RSVPs, views)
  - Event management list
  - Create/Edit/Delete actions
- **Conditional Rendering**: Based on user role

#### 📄 `src/app/pages/CreateEvent.tsx`
- **Purpose**: Event creation form (Organizer only)
- **Description**: Comprehensive form for creating new events
- **Lines of Code**: ~300
- **Form Fields**:
  - Title, description, category
  - Date, start time, end time, location
  - Image URL
  - Volunteers needed
  - Seating capacity
  - Food options (dynamic array)
  - Important notes
- **Features**: Dynamic food option management, validation

#### 📄 `src/app/pages/EditEvent.tsx`
- **Purpose**: Event editing form (Organizer only)
- **Description**: Edit existing event details
- **Lines of Code**: ~310
- **Features**:
  - Pre-populated form fields
  - Permission checking (only event creator can edit)
  - Status management (draft/published/cancelled)
  - All features from CreateEvent

---

### Component Files

#### 📄 `src/app/components/Navigation.tsx`
- **Purpose**: Main navigation bar
- **Description**: Responsive navigation with authentication states
- **Lines of Code**: ~86
- **Key Features**:
  - Kent Institute branding
  - Conditional menu items based on user role
  - Login/Logout functionality
  - Active route highlighting
- **Responsive**: Mobile-friendly with hamburger menu (hidden class)

#### 📄 `src/app/components/ChatBot.tsx`
- **Purpose**: AI-powered chatbot widget
- **Description**: Floating chat interface with OpenAI integration
- **Lines of Code**: ~150
- **Key Features**:
  - Floating button trigger
  - Chat message history
  - Typing indicator
  - OpenAI API integration
  - Fallback responses
  - Beautiful gradient UI
- **AI Integration**: Calls generateAIResponse from openai.ts service

---

### Context & State Management

#### 📄 `src/app/context/AppContext.tsx`
- **Purpose**: Global state management
- **Description**: React Context for app-wide state
- **Lines of Code**: ~186
- **State Management**:
  - User authentication state
  - Events array
  - Bookmarks array
  - RSVPs array
- **Functions Provided**:
  - `login()` - User authentication
  - `logout()` - User sign out
  - `register()` - New user registration
  - `addBookmark()` - Save event
  - `removeBookmark()` - Remove saved event
  - `isBookmarked()` - Check if event is bookmarked
  - `addRSVP()` - Register for event
  - `hasRSVP()` - Check if user registered
  - `createEvent()` - Create new event (organizer)
  - `updateEvent()` - Edit event (organizer)
  - `deleteEvent()` - Delete event (organizer)

---

### Services Layer

#### 📄 `src/app/services/openai.ts`
- **Purpose**: OpenAI API integration
- **Description**: AI service for intelligent chatbot responses
- **Lines of Code**: ~180
- **Key Functions**:
  - `getOpenAIClient()` - Initialize OpenAI client
  - `generateAIResponse()` - Main AI response generator
  - `generateFallbackResponse()` - Pattern-matching fallback
- **AI Features**:
  - Natural language processing
  - Context-aware responses
  - Event data integration
  - Conversation history tracking
  - Error handling
- **API Configuration**:
  - Model: gpt-4o-mini
  - Max tokens: 200
  - Temperature: 0.7

---

### Data Layer

#### 📄 `src/app/data/mockData.ts`
- **Purpose**: Sample data for development/demo
- **Description**: Mock users and events
- **Lines of Code**: ~180
- **Contents**:
  - 1 mock user (Navroop Kaur)
  - 8 detailed events across all categories
  - Complete event metadata (RSVPs, volunteers, food, etc.)

#### 📄 `src/app/types.ts`
- **Purpose**: TypeScript type definitions
- **Description**: Interface definitions for type safety
- **Lines of Code**: ~57
- **Interfaces Defined**:
  - `User` - User account structure
  - `Event` - Event data structure
  - `EventCategory` - Event category type
  - `Bookmark` - Saved event structure
  - `RSVP` - Event registration structure

---

### Database Files

#### 📄 `database/schema.sql`
- **Purpose**: Complete database schema
- **Description**: MySQL database structure
- **Lines of Code**: ~450
- **Contents**:
  - 6 main tables
  - Foreign key relationships
  - Check constraints
  - Indexes for performance
  - 6 triggers for auto-updates
  - 3 views for common queries
  - 2 stored procedures
  - Sample data inserts
- **Tables**:
  1. `users` - User accounts
  2. `event_categories` - Event categories
  3. `events` - Main events table
  4. `event_bookmarks` - Saved events
  5. `event_rsvps` - Event registrations
  6. `event_volunteers` - Volunteer details

---

### Configuration Files

#### 📄 `package.json`
- **Purpose**: Project dependencies and scripts
- **Key Dependencies**:
  - react: 18.3.1
  - typescript: 5.6.2
  - tailwindcss: 4.0.0
  - openai: 6.36.0
  - @radix-ui: Complete UI library
- **Scripts**:
  - `dev` - Start development server
  - `build` - Build for production
  - `preview` - Preview production build

#### 📄 `tsconfig.json`
- **Purpose**: TypeScript compiler configuration
- **Settings**: Strict mode, ES modules, JSX support

#### 📄 `vite.config.ts`
- **Purpose**: Vite build tool configuration
- **Plugins**: React plugin, TypeScript support

#### 📄 `tailwind.config.js`
- **Purpose**: Tailwind CSS configuration
- **Customization**: Kent Institute colors, fonts

#### 📄 `.env.example`
- **Purpose**: Environment variables template
- **Variables**:
  - `VITE_OPENAI_API_KEY` - OpenAI API key

---

## File Statistics Summary

| Category | File Count | Total Lines |
|----------|------------|-------------|
| Page Components | 8 | ~1,600 |
| React Components | 2 | ~240 |
| UI Components (Radix) | 45+ | ~5,000 |
| Context/State | 1 | ~186 |
| Services | 1 | ~180 |
| Types/Data | 2 | ~240 |
| Database | 1 | ~450 |
| Configuration | 5 | ~150 |
| **Total** | **65+** | **~8,000+** |

---

## Technology Implementation Summary

### Front-End Technologies
✅ React 18.3.1 - Component-based UI  
✅ TypeScript 5.6.2 - Type safety  
✅ Tailwind CSS 4.0.0 - Utility-first styling  
✅ React Router 7.13.0 - Client-side routing  
✅ Radix UI - Accessible component library  

### AI Technologies
✅ OpenAI API 6.36.0 - GPT-4 integration  
✅ Natural Language Processing  
✅ Context-aware conversations  

### Build Tools
✅ Vite 6.3.0 - Fast build tool  
✅ pnpm 10.17.1 - Package manager  
✅ ESLint - Code quality  

---

## How to Navigate This Project

1. **Start with**: `src/main.tsx` - Application entry point
2. **Then**: `src/app/App.tsx` - Main routing configuration
3. **Pages**: `src/app/pages/` - All page components
4. **Components**: `src/app/components/` - Reusable components
5. **State**: `src/app/context/AppContext.tsx` - Global state
6. **AI Service**: `src/app/services/openai.ts` - OpenAI integration
7. **Database**: `database/schema.sql` - Database schema

---

**Created for**: Kent Institute Capstone Project 2026  
**Developer**: Navroop Kaur (Front-End Developer)  
**Last Updated**: May 2026
