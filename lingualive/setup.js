#!/usr/bin/env node

/**
 * LinguaLive Setup Script
 * Automated installation and configuration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function exec(command, cwd = process.cwd()) {
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    return false;
  }
}

function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  
  if (major < 18) {
    log('❌ Node.js 18+ is required', 'red');
    log(`   Current version: ${version}`, 'yellow');
    log('   Please upgrade: https://nodejs.org/', 'cyan');
    process.exit(1);
  }
  
  log(`✅ Node.js ${version} detected`, 'green');
}

function createEnvFile(filePath, content) {
  if (fs.existsSync(filePath)) {
    log(`⚠️  ${filePath} already exists, skipping...`, 'yellow');
    return false;
  }
  
  fs.writeFileSync(filePath, content);
  log(`✅ Created ${filePath}`, 'green');
  return true;
}

async function setup() {
  console.clear();
  log('╔════════════════════════════════════════╗', 'cyan');
  log('║     🌍 LinguaLive Setup Wizard 🌍     ║', 'cyan');
  log('╚════════════════════════════════════════╝', 'cyan');
  console.log();
  
  // Step 1: Check Node.js version
  log('📋 Step 1: Checking prerequisites...', 'bright');
  checkNodeVersion();
  console.log();
  
  // Step 2: Install dependencies
  log('📦 Step 2: Installing dependencies...', 'bright');
  log('   This may take a few minutes...', 'yellow');
  console.log();
  
  log('   Installing backend dependencies...', 'cyan');
  if (!exec('npm install', path.join(__dirname, 'backend'))) {
    log('❌ Backend installation failed', 'red');
    process.exit(1);
  }
  
  log('   Installing frontend dependencies...', 'cyan');
  if (!exec('npm install', path.join(__dirname, 'frontend'))) {
    log('❌ Frontend installation failed', 'red');
    process.exit(1);
  }
  
  log('✅ Dependencies installed successfully', 'green');
  console.log();
  
  // Step 3: API Keys
  log('🔑 Step 3: API Key Configuration', 'bright');
  log('   You need two API keys to run LinguaLive:', 'yellow');
  console.log();
  
  log('   1. Speechmatics API Key (required)', 'cyan');
  log('      Get it from: https://www.speechmatics.com/', 'blue');
  console.log();
  
  log('   2. Groq API Key (required for AI features)', 'cyan');
  log('      Get it from: https://console.groq.com/', 'blue');
  console.log();
  
  const hasKeys = await question('   Do you have both API keys ready? (y/n): ');
  
  if (hasKeys.toLowerCase() !== 'y') {
    log('\n⚠️  Please get your API keys first, then run this script again.', 'yellow');
    log('   Run: npm run setup', 'cyan');
    rl.close();
    process.exit(0);
  }
  
  console.log();
  const speechmaticsKey = await question('   Enter Speechmatics API Key: ');
  const groqKey = await question('   Enter Groq API Key: ');
  
  if (!speechmaticsKey || !groqKey) {
    log('\n❌ Both API keys are required', 'red');
    rl.close();
    process.exit(1);
  }
  
  console.log();
  
  // Step 4: Create environment files
  log('📝 Step 4: Creating environment files...', 'bright');
  
  const backendEnv = `# Speechmatics API Key (required for live transcription)
SPEECHMATICS_API_KEY=${speechmaticsKey}

# Groq API Key (required for AI features)
GROQ_API_KEY=${groqKey}

# WebSocket Server Port
WS_PORT=3001

# Node Environment
NODE_ENV=development

# Log Level
LOG_LEVEL=debug
`;
  
  const frontendEnv = `# WebSocket Server URL
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Groq API Key (for AI summarization and formatting)
GROQ_API_KEY=${groqKey}
`;
  
  createEnvFile(path.join(__dirname, '.env'), backendEnv);
  createEnvFile(path.join(__dirname, 'frontend', '.env.local'), frontendEnv);
  
  console.log();
  
  // Step 5: Verify setup
  log('✅ Step 5: Verifying configuration...', 'bright');
  
  const backendEnvExists = fs.existsSync(path.join(__dirname, '.env'));
  const frontendEnvExists = fs.existsSync(path.join(__dirname, 'frontend', '.env.local'));
  
  if (backendEnvExists && frontendEnvExists) {
    log('✅ All configuration files created', 'green');
  } else {
    log('❌ Configuration incomplete', 'red');
    rl.close();
    process.exit(1);
  }
  
  console.log();
  
  // Step 6: Start servers
  log('🚀 Step 6: Ready to launch!', 'bright');
  console.log();
  
  const startNow = await question('   Start LinguaLive now? (y/n): ');
  
  if (startNow.toLowerCase() === 'y') {
    console.log();
    log('🎉 Starting LinguaLive...', 'green');
    console.log();
    log('   Backend will start on port 3001', 'cyan');
    log('   Frontend will start on port 3000', 'cyan');
    console.log();
    log('   Opening in your browser...', 'yellow');
    console.log();
    
    // Start backend in background
    const { spawn } = require('child_process');
    
    const backend = spawn('npm', ['start'], {
      cwd: path.join(__dirname, 'backend'),
      detached: true,
      stdio: 'ignore'
    });
    backend.unref();
    
    // Wait a bit for backend to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start frontend
    log('   Starting frontend...', 'cyan');
    exec('npm run dev', path.join(__dirname, 'frontend'));
  } else {
    console.log();
    log('✅ Setup complete!', 'green');
    console.log();
    log('To start LinguaLive manually:', 'bright');
    log('   1. Backend:  cd backend && npm start', 'cyan');
    log('   2. Frontend: cd frontend && npm run dev', 'cyan');
    log('   3. Open:     http://localhost:3000', 'cyan');
  }
  
  console.log();
  log('╔════════════════════════════════════════╗', 'green');
  log('║   🎉 LinguaLive is ready to use! 🎉   ║', 'green');
  log('╚════════════════════════════════════════╝', 'green');
  console.log();
  
  rl.close();
}

// Run setup
setup().catch(error => {
  log(`\n❌ Setup failed: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});
