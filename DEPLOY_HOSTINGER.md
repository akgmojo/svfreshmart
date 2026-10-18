# Deploying SV Freshmart to Hostinger

Because **SV Freshmart** is a full-stack Next.js application (with API routes, server-side price/stock verification, and Excel processing), it requires a **Node.js runtime environment**.

---

## Which Hostinger Plan do you have?

- **Option A: Hostinger VPS (Recommended)** — Full root access, Ubuntu, PM2, Nginx, Let's Encrypt SSL. Best performance and reliability.
- **Option B: Hostinger Cloud / Business Web Hosting (hPanel Node.js)** — If your hPanel plan includes the "Node.js" section.

---

# Option A: Deploying on Hostinger VPS (Ubuntu) — Recommended

### 1. Connect to your VPS via SSH
Open your terminal (PowerShell or Command Prompt) and connect:
```bash
ssh root@YOUR_SERVER_IP
```

### 2. Install Node.js (v20 or v22) and Git
```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# Verify installation
node -v
npm -v
```

### 3. Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 4. Clone or Upload your SV Freshmart Project
```bash
cd /var/www
sudo git clone https://github.com/YOUR_USERNAME/svfreshmart.git
cd svfreshmart
```
*(Alternatively, you can upload your files via FileZilla / WinSCP SFTP to `/var/www/svfreshmart`)*

### 5. Install Dependencies and Build
```bash
npm install
npm run build
```

### 6. Start the Application with PM2
```bash
# Start Next.js using the included PM2 configuration
pm2 start ecosystem.config.js

# Save PM2 process list to restart automatically on server reboot
pm2 save
pm2 startup
```

### 7. Configure Nginx Reverse Proxy
Create an Nginx configuration file for your domain:
```bash
sudo nano /etc/nginx/sites-available/svfreshmart
```

Paste the following configuration (replace `yourdomain.com` with your real domain):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 20M; # Needed for Excel bulk catalogue uploads
}
```

Enable the configuration and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/svfreshmart /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Enable Free SSL (HTTPS) with Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

# Option B: Deploying on Hostinger Shared / Cloud Hosting (hPanel Node.js)

If your Hostinger plan has the **Node.js** feature in **hPanel**:

### 1. Prepare files locally
In your project folder on your PC, generate the production build:
```powershell
npm run build
```

### 2. Compress files for upload
Zip your project files, **excluding** `node_modules` and `.git`. Make sure to include:
- `.next/`
- `src/`
- `public/`
- `data/`
- `package.json`
- `package-lock.json`
- `next.config.ts`

### 3. Upload to Hostinger File Manager
1. Log into **Hostinger hPanel**.
2. Go to **File Manager** -> `public_html`.
3. Upload the `.zip` file and extract it.

### 4. Configure Node.js in hPanel
1. In hPanel, search for **Node.js**.
2. Click **Create Application**:
   - **Node.js version:** Select `20.x` or higher.
   - **Application root:** `/home/uXXXX/public_html` (or your extracted directory).
   - **Application startup file:** `node_modules/next/dist/bin/next`
   - **Application mode:** `Production`
3. Click **Save** or **Run NPM Install**.
4. Set the startup script argument to: `start -p 3000`.
5. Start the Node.js application.

---

# Maintenance & Deploying Updates

Whenever you make changes to the code:
```bash
# On the server:
cd /var/www/svfreshmart
git pull origin main
npm install
npm run build
pm2 reload svfreshmart
```
