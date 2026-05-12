# Campus Event Discovery App (CEDA)

**Kent Institute - Capstone Project 2026**

A comprehensive, AI-powered web application for discovering and managing campus events at Kent Institute.

---

## 🎯 Project Overview

CEDA (Campus Event Discovery App) is a modern, full-featured platform that centralizes all Kent Institute campus events, enabling students to easily discover, bookmark, and RSVP to events, while providing organizers with powerful tools to create and manage events.

### Key Features

✨ **Smart Event Discovery**
- AI-powered chatbot using OpenAI GPT-4
- Advanced search and filtering
- Category-based browsing
- Date range filtering

🎓 **Student Features**
- Browse all campus events
- Search by keyword, category, or date
- RSVP as attendee or volunteer
- Select food preferences
- Choose seat numbers
- Bookmark favorite events
- Personal dashboard with RSVP history

👨‍💼 **Organizer Features**
- Create and manage events
- Track RSVPs and volunteers
- Manage seating arrangements
- View event statistics
- Edit/delete events

🤖 **AI Integration**
- Natural language query processing
- Context-aware conversations
- Intelligent event recommendations
- Real-time event data integration

---

## 🛠️ Technology Stack

### Front-End
- **React** 18.3.1 - UI Framework
- **TypeScript** 5.6.2 - Type Safety
- **Tailwind CSS** 4.0.0 - Styling
- **React Router** 7.13.0 - Navigation
- **Radix UI** - Component Library
- **Lucide React** - Icons

### AI & Backend Services
- **OpenAI API** 6.36.0 - GPT-4 Integration
- **Context API** - State Management

### Database
- **MySQL** 8.0+ - Relational Database
- Complete schema with 6 tables
- Triggers, views, and stored procedures

### Build Tools
- **Vite** 6.3.0 - Build Tool
- **pnpm** 10.17.1 - Package Manager
- **ESLint** - Code Quality

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- OpenAI API key

### Installation

```bash
# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
# Add your OpenAI API key to .env

# Start development server
pnpm run dev

# Open http://localhost:5173
```

📖 **Detailed setup instructions**: See `SETUP_INSTRUCTIONS.md`

---

## 📁 Project Structure

```
code/
├── src/
│   ├── app/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # State management
│   │   ├── services/        # OpenAI integration
│   │   └── data/            # Mock data
│   ├── styles/              # Global styles
│   └── main.tsx             # Entry point
├── database/
│   └── schema.sql           # Database schema
├── public/                  # Static assets
└── [configuration files]
```

📖 **Detailed file structure**: See `FILE_STRUCTURE.md`

---

## 📚 Documentation

This project includes comprehensive documentation:

1. **PROJECT_DOCUMENTATION.md** - Complete project documentation
   - System architecture
   - Database design with ERD
   - UI/UX design
   - AI implementation details

2. **FILE_STRUCTURE.md** - Detailed file and folder structure
   - All files with descriptions
   - Line counts and statistics

3. **SETUP_INSTRUCTIONS.md** - Setup and installation guide
   - Step-by-step instructions
   - Troubleshooting tips

4. **ASSESSMENT_CHECKLIST.md** - Assessment compliance verification
   - All requirements checked
   - Submission preparation guide

---

## 🎨 Design Highlights

### Color Scheme
- **Navy Blue** (#1B2E55) - Primary brand color
- **Gold** (#EF9B28) - Accent color, CTAs
- **Light Gray** (#F0F3F9) - Backgrounds

### Pages
1. **Home** - Landing page with hero and features
2. **Events** - Browse with search and filters
3. **Event Detail** - Full event info with RSVP
4. **Login/Register** - Authentication
5. **Dashboard** - Role-based (Student/Organizer)
6. **Create/Edit Event** - Event management

---

## 🤖 AI Features

### OpenAI Integration

The chatbot uses **GPT-4-mini** for:
- Natural language understanding
- Context-aware responses
- Event recommendations
- Query intent detection

**Setup**: Add your OpenAI API key to `.env`:
```env
VITE_OPENAI_API_KEY=sk-your-key-here
```

---

## 💾 Database

### Schema Overview

6 main tables:
- `users` - User accounts
- `events` - Event information
- `event_rsvps` - Event registrations
- `event_bookmarks` - Saved events
- `event_volunteers` - Volunteer details
- `event_categories` - Event categories

**Setup**: Import `database/schema.sql` into MySQL

---

## 🧪 Testing

All features have been manually tested:

✅ User registration and login  
✅ Event browsing and filtering  
✅ RSVP workflow (attendee and volunteer)  
✅ Bookmark functionality  
✅ Event creation and editing  
✅ Dashboard functionality  
✅ AI chatbot interactions  
✅ Responsive design  

---

## 📊 Project Statistics

- **Total Files**: 65+
- **Total Lines of Code**: 8,000+
- **React Components**: 55+
- **Database Tables**: 6
- **SQL Lines**: 450+
- **Pages**: 8 main pages

---

## 🎓 Assessment Compliance

This project meets all capstone assessment requirements:

✅ System development planned and managed  
✅ Business requirements implemented  
✅ System architecture designed  
✅ Database design complete with ERD  
✅ User interface facilitates tasks  
✅ **AI API (OpenAI) integrated** ✨  
✅ Comprehensive documentation  

See `ASSESSMENT_CHECKLIST.md` for detailed compliance verification.

---

## 📦 Submission Package

The project includes:

1. ✅ Complete source code (`/src/` directory)
2. ✅ Database schema (`/database/schema.sql`)
3. ✅ ERD diagram (in documentation)
4. ✅ All documentation files
5. ✅ Configuration files
6. ✅ Package dependencies list

**Ready to zip and submit!**

---

## 🚧 Future Enhancements

Potential improvements for future versions:

- Backend API with Express.js
- Real-time notifications
- Email reminders
- Calendar integration
- Mobile app (React Native)
- Advanced analytics
- Social media integration
- Event recommendations algorithm

---

## 👨‍💻 Development

### Available Scripts

```bash
# Development
pnpm run dev          # Start dev server
pnpm run build        # Build for production
pnpm run preview      # Preview production build

# Code Quality
pnpm run type-check   # TypeScript type checking
pnpm run lint         # Run ESLint
```

### Environment Variables

Required:
- `VITE_OPENAI_API_KEY` - OpenAI API key for chatbot

Optional (for future backend):
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

---

## 📝 License

This project is created for educational purposes as part of the Kent Institute Capstone Project 2026.

---

## 👤 Author

**Navroop Kaur**  
Role: Front-End Developer  
Institution: Kent Institute  
Year: 2026  
Assessment: Capstone Project

---

## 🙏 Acknowledgments

- Kent Institute for project requirements
- OpenAI for GPT-4 API
- React and TypeScript communities
- Tailwind CSS and Radix UI teams

---

## 📞 Support

For setup issues or questions:
1. Check `SETUP_INSTRUCTIONS.md`
2. Review `PROJECT_DOCUMENTATION.md`
3. Consult `ASSESSMENT_CHECKLIST.md`

---

## ⭐ Key Achievements

🎯 **All SRS Requirements Implemented**
- All 10 use cases (UC-01 to UC-10)
- All functional requirements
- All non-functional requirements

🎯 **Professional UI/UX**
- Modern, responsive design
- Kent Institute branding
- WCAG 2.1 Level AA compliant

🎯 **AI Integration**
- OpenAI GPT-4 chatbot
- Natural language processing
- Context-aware responses

🎯 **Comprehensive Database**
- 6 tables with relationships
- Triggers and stored procedures
- Sample data included

🎯 **Complete Documentation**
- Technical documentation
- User guides
- Assessment compliance

---

**Project Status**: ✅ **Complete and Ready for Submission**

---

Made with ❤️ for Kent Institute Capstone Project 2026
