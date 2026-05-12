# CEDA - Setup and Installation Instructions

## Quick Start Guide

Follow these steps to set up and run the Campus Event Discovery App (CEDA) on your local machine.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- ✅ **Node.js** (version 18.0.0 or higher)
- ✅ **pnpm** (version 8.0.0 or higher)
- ✅ **Git** (for version control)
- ✅ **Modern Web Browser** (Chrome, Firefox, Safari, or Edge)
- ✅ **Text Editor** (VS Code recommended)
- ✅ **OpenAI API Key** (for AI chatbot functionality)

### Check Your Node.js Version

```bash
node --version
# Should show v18.0.0 or higher
```

### Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

---

## Step 1: Clone the Project

```bash
# Navigate to your desired directory
cd ~/Desktop

# Clone the repository (or extract from zip file)
# If extracting from zip, skip this step
```

---

## Step 2: Install Dependencies

```bash
# Navigate to project directory
cd code

# Install all project dependencies
pnpm install
```

This will install all required packages including:
- React, TypeScript, React Router
- Tailwind CSS and Radix UI components
- OpenAI SDK
- Vite build tool
- And all other dependencies

**Expected Time**: 2-3 minutes

---

## Step 3: Configure OpenAI API Key (CRITICAL!)

### 3.1 Get Your OpenAI API Key

1. Go to https://platform.openai.com
2. Sign up for an account or log in
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the generated key (starts with `sk-...`)
6. **Important**: Save this key securely - you won't be able to see it again!

### 3.2 Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Now open the `.env` file in your text editor:

```bash
# On Mac/Linux
nano .env

# Or open in VS Code
code .env
```

Replace `your_openai_api_key_here` with your actual API key:

```env
VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Save the file** after making changes.

### 3.3 Verify Environment Setup

```bash
# Check if .env file exists
ls -la .env

# View contents (without exposing full key)
grep VITE_OPENAI .env
```

---

## Step 4: Run the Development Server

```bash
# Start the Vite development server
pnpm run dev
```

You should see output similar to:

```
  VITE v6.3.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

## Step 5: Access the Application

1. Open your web browser
2. Navigate to: **http://localhost:5173**
3. You should see the CEDA landing page!

---

## Step 6: Test the Application

### Test User Login

The application includes a demo authentication system:

1. Click **"Log in"** in the navigation
2. Enter any email and password
3. Click **"Log In"**
4. You'll be logged in as the demo user

**Demo User Credentials:**
- **Email**: Any email address
- **Password**: Any password
- **Default User**: Navroop Kaur (Student role)

### Test the AI Chatbot

1. Click the **orange chat button** in the bottom-right corner
2. Type a question like:
   - "Show me networking events"
   - "What events are happening this week?"
   - "I want to volunteer"
3. The AI should respond with intelligent, context-aware answers!

**Note**: If you haven't set up the OpenAI API key, the chatbot will use fallback pattern-matching responses.

---

## Troubleshooting

### Issue 1: OpenAI API Not Working

**Symptoms**: Chatbot gives generic responses instead of AI-powered ones

**Solutions**:
1. Check that `.env` file exists in project root
2. Verify API key is correct (starts with `sk-`)
3. Ensure no spaces before/after the key in `.env`
4. Restart the development server after adding the key:
   ```bash
   # Stop server (Ctrl+C)
   # Restart
   pnpm run dev
   ```

### Issue 2: Dependencies Not Installing

**Solution**:
```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules
rm -rf node_modules

# Reinstall
pnpm install
```

### Issue 3: Port 5173 Already in Use

**Solution**:
```bash
# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
pnpm run dev --port 3000
```

### Issue 4: TypeScript Errors

**Solution**:
```bash
# Restart TypeScript server in VS Code
# Command Palette (Cmd/Ctrl + Shift + P)
# TypeScript: Restart TS Server
```

---

## Database Setup (Optional for Backend Integration)

### Prerequisites
- MySQL Server 8.0 or higher
- MySQL client or MySQL Workbench

### Steps

```bash
# 1. Install MySQL (if not installed)
# Mac
brew install mysql

# Ubuntu/Debian
sudo apt-get install mysql-server

# 2. Start MySQL service
# Mac
brew services start mysql

# Ubuntu/Debian
sudo service mysql start

# 3. Log in to MySQL
mysql -u root -p

# 4. Create database
CREATE DATABASE ceda_database;

# 5. Exit MySQL
exit;

# 6. Import schema
mysql -u root -p ceda_database < database/schema.sql

# 7. Verify tables
mysql -u root -p ceda_database
SHOW TABLES;
```

**Expected Tables**:
- users
- events
- event_categories
- event_rsvps
- event_bookmarks
- event_volunteers

---

## Building for Production

To create a production build:

```bash
# Build the application
pnpm run build

# Preview production build
pnpm run preview
```

The build files will be in the `dist/` directory.

---

## Project Structure Overview

```
code/
├── src/
│   ├── app/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # State management
│   │   ├── services/      # Business logic
│   │   └── data/          # Mock data
│   ├── styles/            # CSS files
│   └── main.tsx           # Entry point
├── database/
│   └── schema.sql         # Database schema
├── public/                # Static assets
├── .env                   # Environment variables (create this!)
├── package.json           # Dependencies
└── vite.config.ts         # Build configuration
```

---

## Important Notes

### Security
- ⚠️ **Never commit `.env` file to version control**
- ⚠️ **Keep your OpenAI API key secret**
- ⚠️ **The `.env` file is listed in `.gitignore`**

### API Usage
- OpenAI API calls consume credits
- Monitor usage at: https://platform.openai.com/usage
- The app uses `gpt-4o-mini` model (cost-effective)
- Each chat message costs approximately $0.0001-0.0002

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## Development Tips

### Hot Module Replacement (HMR)
Vite provides instant updates when you save files:
- React components reload instantly
- CSS updates without page refresh
- No manual browser refresh needed!

### VS Code Extensions (Recommended)
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **ESLint**
- **Prettier**
- **TypeScript and JavaScript Language Features**

### Keyboard Shortcuts in Development
- **Ctrl + C** - Stop development server
- **R** - Restart server
- **O** - Open in browser
- **H** - Show help

---

## Getting Help

### Documentation
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- TypeScript: https://www.typescriptlang.org
- OpenAI API: https://platform.openai.com/docs
- Vite: https://vitejs.dev

### Common Commands Reference

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Type check
pnpm run type-check

# Format code
pnpm run format
```

---

## Next Steps

Once the application is running:

1. ✅ Explore the home page
2. ✅ Browse events
3. ✅ Test the AI chatbot
4. ✅ Register a new account
5. ✅ Create an event (as organizer)
6. ✅ RSVP to an event
7. ✅ Check your dashboard

---

## Support

For issues or questions:
1. Check this documentation first
2. Review the PROJECT_DOCUMENTATION.md file
3. Check the troubleshooting section
4. Review OpenAI API documentation for API-related issues

---

**Project**: Campus Event Discovery App (CEDA)  
**Institution**: Kent Institute  
**Developer**: Navroop Kaur  
**Year**: 2026  
**Assessment**: Capstone Project

---

## Quick Setup Checklist

- [ ] Node.js installed (v18+)
- [ ] pnpm installed
- [ ] Project dependencies installed (`pnpm install`)
- [ ] OpenAI API key obtained
- [ ] `.env` file created
- [ ] OpenAI API key added to `.env`
- [ ] Development server running (`pnpm run dev`)
- [ ] Application accessible at http://localhost:5173
- [ ] AI chatbot responding to queries
- [ ] All features tested and working

**Setup Complete!** 🎉

You're ready to develop and demonstrate the Campus Event Discovery App!
