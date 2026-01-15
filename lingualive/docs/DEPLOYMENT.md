# Deployment Guide

## Overview

LinguaLive consists of two services:
- **Frontend**: Next.js application (port 3000)
- **Backend**: Node.js WebSocket server (port 3001)

Both must be deployed and accessible for the application to function.

## Prerequisites

- Node.js 18+ 
- npm 9+
- Domain with SSL certificate (for production WebSocket)
- API keys for external services

## Environment Variables

### Backend (.env)
```bash
# Required
SPEECHMATICS_API_KEY=your_speechmatics_api_key
WS_PORT=3001

# Optional
LOG_LEVEL=info
NODE_ENV=production
```

### Frontend (.env.local)
```bash
# Required
GROQ_API_KEY=your_groq_api_key

# Optional
NEXT_PUBLIC_WS_URL=wss://your-domain.com:3001
```

## Local Development

### 1. Install Dependencies
```bash
# Backend
cd lingualive/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment
```bash
# Copy example env files
cp .env.example .env
# Edit .env with your API keys
```

### 3. Start Services
```bash
# Terminal 1 - Backend
cd lingualive/backend
npm start

# Terminal 2 - Frontend
cd lingualive/frontend
npm run dev
```

### 4. Network Access (Mobile Testing)
```bash
cd lingualive/frontend
npm run dev -- -H 0.0.0.0
# Access via http://YOUR_IP:3000
```

## Production Deployment

### Option 1: Docker (Recommended)

#### Dockerfile - Backend
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./
COPY shared/ ../shared/
EXPOSE 3001
CMD ["npm", "start"]
```

#### Dockerfile - Frontend
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      - SPEECHMATICS_API_KEY=${SPEECHMATICS_API_KEY}
      - NODE_ENV=production
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - GROQ_API_KEY=${GROQ_API_KEY}
      - NODE_ENV=production
    depends_on:
      - backend
    restart: unless-stopped
```

### Option 2: Vercel + Railway

#### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set root directory to `lingualive/frontend`
3. Add environment variables in Vercel dashboard
4. Deploy

#### Backend (Railway)
1. Create new project in Railway
2. Connect GitHub repository
3. Set root directory to `lingualive/backend`
4. Add environment variables
5. Deploy

### Option 3: AWS

#### EC2 Setup
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/Wesley101-collab/lingualive.git
cd lingualive

# Install PM2
sudo npm install -g pm2

# Start services
cd backend && npm install && pm2 start npm --name "backend" -- start
cd ../frontend && npm install && npm run build && pm2 start npm --name "frontend" -- start

# Save PM2 config
pm2 save
pm2 startup
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket Backend
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

## SSL/TLS Configuration

WebSocket connections require WSS (WebSocket Secure) in production.

### Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Update Frontend WebSocket URL
```typescript
// utils/constants.ts
export const WS_URL = process.env.NODE_ENV === 'production'
  ? 'wss://your-domain.com/ws'
  : `ws://${window.location.hostname}:3001`;
```

## Health Checks

### Backend Health Endpoint
Add to `server.ts`:
```typescript
// HTTP health check endpoint
const healthServer = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
  }
});
healthServer.listen(3002);
```

### Monitoring
- Use PM2 monitoring: `pm2 monit`
- Set up alerts for service downtime
- Monitor WebSocket connection counts

## Scaling Considerations

### Horizontal Scaling
- Frontend: Stateless, can scale horizontally
- Backend: Requires sticky sessions for WebSocket connections

### Load Balancing
```nginx
upstream backend {
    ip_hash;  # Sticky sessions for WebSocket
    server backend1:3001;
    server backend2:3001;
}
```

### Redis for Multi-Instance
For multiple backend instances, add Redis for message broadcasting:
```typescript
import Redis from 'ioredis';
const pub = new Redis();
const sub = new Redis();

// Publish captions to all instances
pub.publish('captions', JSON.stringify({ text, language }));

// Subscribe to captions from other instances
sub.subscribe('captions');
sub.on('message', (channel, message) => {
  // Broadcast to local clients
});
```

## Troubleshooting

### WebSocket Connection Failed
1. Check CORS configuration
2. Verify SSL certificates
3. Check firewall rules for port 3001
4. Ensure WSS URL in production

### High Latency
1. Check network between services
2. Monitor Speechmatics API response times
3. Consider regional deployment

### Memory Issues
1. Monitor with `pm2 monit`
2. Set Node.js memory limits: `node --max-old-space-size=512`
3. Implement connection limits

## Rollback Procedure

```bash
# List deployments
pm2 list

# Stop current version
pm2 stop all

# Checkout previous version
git checkout HEAD~1

# Restart
pm2 restart all
```
