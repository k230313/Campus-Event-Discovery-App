# Deployment Guide

## Overview

This document records how the Campus Event Discovery App was deployed publicly to `ceda.online`.

The deployment used:

- Proxmox for the VM
- Ubuntu Server for the host operating system
- Nginx for serving the frontend and proxying API requests
- Node.js and PM2 for the backend
- MySQL for the database
- Cloudflare Tunnel for public access

## Deployment Steps

### 1. Download Ubuntu ISO in Proxmox

The Ubuntu Server ISO was first downloaded inside Proxmox so it could be attached to the new VM.

![Step 1](../ceda%20server%20screenshtos/1.%20downloading%20ubuntu%20iso%20within%20proxmox.png)

### 2. Create the Ubuntu VM

A dedicated Ubuntu VM for the project was then created in Proxmox for the CEDA server.

![Step 2](../ceda%20server%20screenshtos/3.%20created%20a%20ubuntu%20vs%20for%20ceda-server.png)

### 3. Install Ubuntu Server

Ubuntu was installed on the VM and allowed to complete the normal server installation process.

![Step 3](../ceda%20server%20screenshtos/4.%20screenshot%20of%20ubuntu%20installation%20progress.png)

### 4. Install and Verify Nginx

Nginx was installed on the server to serve the built frontend and later proxy `/api` requests to the backend.

![Step 4](../ceda%20server%20screenshtos/5.%20ngix%20is%20running%20in%20server.png)

### 5. Install PM2

PM2 was installed to keep the backend running as a managed Node.js process.

![Step 5](../ceda%20server%20screenshtos/6.%20PM2%20installed.png)

### 6. Import the Database Schema

The MySQL database schema was imported to create the required tables and initial structure for the application.

![Step 6](../ceda%20server%20screenshtos/7.%20importad%20schema.sql%20to%20server.png)

### 7. Start the Backend with PM2

The backend `index.js` application was started with PM2 so the API would stay online in the background.

![Step 7](../ceda%20server%20screenshtos/8.%20index.js%20is%20running%20using%20pm2.png)

### 8. Install Cloudflared

`cloudflared` was installed on the server to support the Cloudflare Tunnel setup.

![Step 8](../ceda%20server%20screenshtos/9.%20installing%20cloudflared.png)

### 9. Connect the Domain Through Cloudflare Tunnel

The domain was then connected through Cloudflare Tunnel so the site could be reached publicly at `ceda.online`.

![Step 9](../ceda%20server%20screenshtos/2.%20connected%20domain%20with%20cloudflare%20tunnel.%20.png)

## Final Result

After these steps:

- the Ubuntu VM was running in Proxmox
- Nginx was serving the frontend
- the backend was managed by PM2
- the MySQL schema was loaded
- Cloudflare Tunnel exposed the app publicly
- the website became available at `ceda.online`
