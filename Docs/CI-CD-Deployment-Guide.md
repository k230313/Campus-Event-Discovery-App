# CI/CD Deployment Guide

## Overview

This project now uses GitHub Actions to automate build checks and production deployment.

The pipeline currently works like this:

1. A push to `main` that changes `client/**`, `server/**`, or `.github/workflows/deploy.yml` triggers the workflow in `.github/workflows/deploy.yml`
2. GitHub Actions runs CI checks
3. If CI passes, GitHub Actions connects to the private server through Tailscale
4. The server updates to the latest `main`, installs dependencies, rebuilds the frontend, restarts PM2, and runs a health check

## Why Tailscale Is Used

Public SSH and router port forwarding are not used for deployment.

Instead, the GitHub-hosted runner joins the Tailscale network first, then SSHes to the server over its Tailscale IP. This keeps deployment traffic on the private tailnet.

## Workflow File

Main workflow:

- `.github/workflows/deploy.yml`

## Current CI Steps

The `ci` job runs:

- `npm ci` in `server/`
- `npm test` in `server/`
- `npm ci` in `client/`
- `npm run build` in `client/`

### Backend Test Behavior

The backend does not yet have a full automated test suite.

Right now:

- `server/package.json` uses `npm test`
- `npm test` runs `node scripts/smoke-check.js`
- this smoke check syntax-validates the backend JavaScript files

This catches broken commits and malformed server-side code, but it is not a substitute for real backend tests.

## Current Deploy Steps

If CI passes, the `deploy` job:

1. Connects to Tailscale using `tailscale/github-action@v3`
2. SSHes into the server using `appleboy/ssh-action`
3. Runs:
   - `git fetch origin main`
   - `git reset --hard origin/main`
   - `npm ci` in `server/`
   - `npm ci` in `client/`
   - `npm run build` in `client/`
   - `pm2 restart ceda-backend --update-env`
   - `pm2 save`
4. Runs a health check against:
   - `http://127.0.0.1:3001/api/csrf-token`

## GitHub Actions Secrets

The workflow depends on these repository secrets:

- `TS_AUTHKEY`
- `SERVER_HOST`
- `SERVER_PORT`
- `SERVER_USER`
- `SERVER_SSH_KEY`

Current production values/usage:

- `SERVER_HOST` = server Tailscale IP
- `SERVER_PORT` = `22`
- `SERVER_USER` = `adamson`

## Server-Side Requirements

### SSH

SSH key login must be configured for the `adamson` user:

- public key in `/home/adamson/.ssh/authorized_keys`
- matching private key stored in `SERVER_SSH_KEY`

### Repo Ownership

The repository path:

- `/var/www/ceda/Campus-Event-Discovery-App`

must be writable by `adamson`.

This matters because deploys run:

- `git fetch`
- `git reset --hard`

and these fail if `.git` files are owned by another user.

### PM2 Ownership

PM2 processes are user-specific.

The active production backend must run under the `adamson` user, not under `root`.

Recommended PM2 startup command:

```bash
pm2 start npm --name ceda-backend -- start
pm2 save
```

That relies on this script existing in `server/package.json`:

```json
"start": "node index.js"
```

## Health Check

The expected local backend health check is:

```bash
curl -i http://127.0.0.1:3001/api/csrf-token
```

If that request succeeds, the backend is up and CSRF token issuance is working.

## Timeout Note

The SSH deployment step uses:

```yaml
command_timeout: 20m
```

This was added because `npm ci` and frontend build steps on the server can exceed the default remote command timeout.

## Important Limitation

### Docs-Only Pushes Do Not Trigger Deploy

The workflow now has push path filters.

Only changes to these paths trigger the workflow automatically:

- `client/**`
- `server/**`
- `.github/workflows/deploy.yml`

That means documentation-only pushes, README-only pushes, and other unrelated repository changes do not trigger CI/CD automatically.

## Current Rollback Status

The workflow does **not** currently do automatic rollback.

Current behavior:

- if CI fails, deployment does not start
- if deploy fails, the workflow fails
- rollback remains manual

## Recommended Next Improvements

1. Add real backend tests instead of only syntax smoke checks
2. Add automatic rollback if the post-deploy health check fails
3. Consider a release-based deployment strategy instead of hard-resetting the working tree
