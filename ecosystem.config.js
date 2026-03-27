module.exports = {
  apps: [{
    name: 'leadgen-server',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      REDIS_URL: 'redis://localhost:6379'
    }
  }]
};