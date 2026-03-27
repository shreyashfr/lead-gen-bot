module.exports = {
  apps: [{
    name: 'lead-gen-bot',
    script: './server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      SECRET_KEY: 'your-secret-key'
    }
  }]
};