# GitHub Team Guide

This guide shows the simplest way for team members to set up the project on their own computer, pull updates, and avoid accidentally pushing the wrong changes.

## 1. What You Need

Install these first:

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/)
- [Visual Studio Code](https://code.visualstudio.com/)
- a GitHub account

Optional for backend work:

- [XAMPP](https://www.apachefriends.org/)
- [Postman](https://www.postman.com/downloads/)

## 2. Join the Repository

1. Create a GitHub account if you do not already have one.
2. Send your GitHub username to the team leader.
3. Wait until you are added to the repository.

## 3. Install Git and Check It

Open `PowerShell` or `Command Prompt` and run:

```bash
git --version
```

If you see a version number, Git is working.

## 4. Install Node.js and Check It

Run:

```bash
node -v
npm -v
```

If you see version numbers, Node.js is working.

## 5. Set Up Git One Time

Run these once:

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

## 6. Download the Project

In terminal, run:

```bash
git clone <repository-url>
cd Campus-Event-Discovery-App
code .
```

This will:

- copy the project to your computer
- open it in VS Code

## 7. Install Project Files

Open terminal in VS Code.

Install backend packages:

```bash
cd server
npm install
```

Install frontend packages:

```bash
cd ../client
npm install
```

## 8. Basic Project Folders

- `Docs/` = documentation
- `server/` = backend code
- `client/` = frontend code

## 9. Before You Start Working

Always pull the latest version first.

Run:

```bash
git checkout main
git pull origin main
```

This updates your local project with the newest changes from GitHub.

## 10. Very Important: Do Not Work Directly on `main`

Do not code directly on the `main` branch.

Always make your own branch first.

A branch is not a folder.

A branch is a separate Git version of the project so your work does not change `main` right away.

## 11. Make Your Own Branch

If you are assigned a feature or task, create your own branch:

```bash
git checkout -b your-branch-name
```

Example:

```bash
git checkout -b feature/event-card
```

To check your current branch:

```bash
git branch
```

The branch with `*` is the one you are on.

## 12. Do Your Work

Make only the changes for your assigned task.

Try not to edit unrelated files.

## 13. Check Your Changes

Before saving your work with Git, run:

```bash
git status
```

This shows:

- which files changed
- which branch you are on

## 14. Save Your Work Safely

### Stage your changes

```bash
git add .
```

### Commit your changes

```bash
git commit -m "Describe your change"
```

Example:

```bash
git commit -m "Add event details page"
```

Important:

- `commit` saves changes only on your own computer
- it does not send anything to GitHub yet

## 15. How Not to Accidentally Push

Before using `push`, always check:

```bash
git branch
git status
```

Make sure:

- you are not on `main`
- you are on your own branch
- the files changed are only for your task

If you are on `main`, stop and do not push.

## 16. Push Only Your Branch

When your work is ready, push your branch:

```bash
git push origin your-branch-name
```

Example:

```bash
git push origin feature/event-card
```

Do not push to `main`.

## 17. Team Rule for This Project

You can:

- pull from `main`
- make your own branch
- work on your task
- commit your work
- push your branch

You should not:

- work directly on `main`
- push unfinished random changes
- merge into `main` without approval

## 18. Safe Workflow to Follow Every Time

Use this order:

1. `git checkout main`
2. `git pull origin main`
3. `git checkout -b your-branch-name`
4. do your work
5. `git status`
6. `git add .`
7. `git commit -m "Your message"`
8. `git push origin your-branch-name`
9. wait for approval before merge

## 19. If You Only Need to Pull and Not Code

Run:

```bash
git checkout main
git pull origin main
```

That is enough if you are only updating your local copy.

## 20. If You Are Scared You Might Push the Wrong Thing

Do this before every push:

```bash
git branch
git status
```

Ask yourself:

- Am I on my own branch?
- Did I change only the files for my task?
- Did I commit the correct work?

If you are unsure, ask before pushing.

## 21. Commands You Should Avoid

Do not use these unless the team leader tells you to:

```bash
git push --force
git reset --hard
```

These can remove work or overwrite other people's changes.

## 22. Simple Summary

- pull from `main`
- create your own branch
- do your work there
- check `git status`
- commit your work
- push your branch only
- wait for approval before merge
