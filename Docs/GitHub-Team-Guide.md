# GitHub Team Guide

This guide explains how team members can set up GitHub, set up Visual Studio Code, work on the project, and share changes safely.

## 1. What This Project Uses

Before you start, install these:

- [Git](https://git-scm.com/downloads)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Node.js](https://nodejs.org/)
- A GitHub account

## 2. Create a GitHub Account

1. Go to [GitHub](https://github.com/).
2. Click `Sign up`.
3. Create your account using your email.
4. Verify your email if GitHub asks you to.
5. Tell the team leader your GitHub username so you can be added to the repository.

## 3. Install Git

1. Download Git from [git-scm.com](https://git-scm.com/downloads).
2. Install it using the default settings.
3. Open `Command Prompt` or `PowerShell`.
4. Check that Git is installed:

```bash
git --version
```

If you see a version number, Git is working.

## 4. Install Node.js

1. Download Node.js from [nodejs.org](https://nodejs.org/).
2. Install the `LTS` version.
3. Check that Node.js is installed:

```bash
node -v
npm -v
```

If you see version numbers, Node.js and npm are working.

## 5. Install Visual Studio Code

1. Download VS Code from [code.visualstudio.com](https://code.visualstudio.com/).
2. Install it.
3. Open VS Code.

Recommended VS Code extensions:

- `ESLint`
- `Prettier - Code formatter`
- `GitLens` (optional but helpful)

## 6. Sign In to GitHub in VS Code

1. Open VS Code.
2. Click the `Accounts` icon in the bottom left or top right area.
3. Sign in with GitHub.
4. Authorize VS Code if GitHub asks for permission.

This helps with source control and repository access.

## 7. Configure Git One Time

Each team member should run these commands once in terminal:

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

Check the result:

```bash
git config --global --list
```

## 8. Get the Project on Your Computer

There are 2 common ways.

### Option A: Clone with VS Code

1. Open the GitHub repository in your browser.
2. Click the green `Code` button.
3. Copy the repository URL.
4. Open VS Code.
5. Press `Ctrl + Shift + P`.
6. Search for `Git: Clone`.
7. Paste the repository URL.
8. Choose where to save the project.
9. Open the folder when VS Code asks.

### Option B: Clone with Terminal

Run:

```bash
git clone <repository-url>
cd Campus-Event-Discovery-App
code .
```

## 9. Install Project Dependencies

Open the project folder in VS Code.

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd ../client
npm install
```

## 10. Basic Folder Overview

- `Docs/` = reports and documentation
- `server/` = backend code
- `client/` = frontend code
- `README.md` = project overview

## 11. Daily Workflow for Team Members

This is the safest workflow to follow every time.

### Important: What a branch is

A branch is not a new folder.

A branch is a separate Git version of the project. It lets you work on a feature without changing `main` directly.

This means:

- `main` stays safer
- each person can work on their own task
- feature work is easier to review

For this team project, if you are assigned a feature, bug fix, or documentation update, you should make your own branch first.

### Step 1: Open the project

Open the project folder in VS Code.

### Step 2: Pull the latest changes first

Before doing any work, always update your local copy:

```bash
git pull origin main
```

This downloads the newest changes from GitHub.

### Step 3: Create or update your feature branch

Do not work directly on `main` unless the team leader tells you to.

If you are assigned a feature, create your own branch before coding.

Create a branch:

```bash
git checkout -b your-branch-name
```

Example:

```bash
git checkout -b add-event-card-ui
```

If the branch already exists:

```bash
git checkout your-branch-name
```

Examples:

- `feature/event-filter`
- `feature/event-details-page`
- `fix/date-validation`
- `docs/readme-update`

You can check your current branch with:

```bash
git branch
```

The branch with `*` beside it is your current branch.

### Step 4: Make your code changes

Examples:

- add a feature
- fix a bug
- improve documentation
- update UI

### Step 5: Check what changed

```bash
git status
```

This shows which files were changed.

### Step 6: Stage your changes

To stage all changed files:

```bash
git add .
```

Or stage one file only:

```bash
git add README.md
```

### Step 7: Commit your changes

Write a short message that explains what you changed.

```bash
git commit -m "Add event validation"
```

Good commit message examples:

- `Add event creation route`
- `Fix event date validation`
- `Update README documentation`

### Step 8: Push your branch

```bash
git push origin your-branch-name
```

## 12. Important Team Rule

Team members can:

- pull changes
- create branches
- code
- commit changes
- push their branch

Team members should not:

- merge into `main` without approval
- push random unfinished work to `main`
- overwrite other people's code

## 13. Approval Workflow

Use this simple rule:

1. Pull the latest `main` first.
2. Work on your own branch.
3. Commit your changes.
4. Push your branch to GitHub.
5. Tell the team leader what you changed.
6. Wait for approval before merging.

If your team uses Pull Requests, follow this:

1. Push your branch.
2. Open a Pull Request on GitHub.
3. Add a short summary of your changes.
4. Wait for review and approval.
5. Only merge after approval.

## 14. How to Pull New Changes Later

If someone else updated the project:

```bash
git checkout main
git pull origin main
```

If you are working on your own branch and want the latest `main` updates:

```bash
git checkout main
git pull origin main
git checkout your-branch-name
git merge main
```

If there is a merge conflict, ask before deleting or replacing code.

## 15. How to See Changes in VS Code

In VS Code:

1. Click the `Source Control` icon on the left sidebar.
2. You will see changed files.
3. Click a file to compare changes.
4. Use the `+` button to stage files.
5. Type a commit message.
6. Click `Commit`.

VS Code is fine to use, but team members should still understand the terminal commands.

## 16. Basic Commands Cheat Sheet

```bash
git status
git pull origin main
git checkout -b my-branch
git checkout my-branch
git add .
git commit -m "Describe your change"
git push origin my-branch
```

## 17. Good Habits

- Pull before starting work
- Use your own branch for every assigned task
- Commit often with clear messages
- Keep changes small and focused
- Ask before changing someone else's work
- Wait for approval before merge

## 18. Common Mistakes to Avoid

- Working directly on `main`
- Forgetting to pull first
- Writing unclear commit messages like `update stuff`
- Editing too many unrelated files at once
- Merging without approval

## 19. If Something Goes Wrong

If you are unsure:

- stop making random changes
- run `git status`
- take a screenshot if needed
- ask the team leader before trying risky fixes

Do not use dangerous commands unless you understand them.

Examples to avoid:

```bash
git reset --hard
git push --force
```

## 20. Suggested Team Process

For this project, the recommended process is:

1. Team leader updates `main`
2. Team members pull the latest version
3. Team members create their own branch
4. Team members make changes
5. Team members commit and push
6. Team leader reviews the work
7. Team leader approves merge

This keeps the project safer and easier to manage.
