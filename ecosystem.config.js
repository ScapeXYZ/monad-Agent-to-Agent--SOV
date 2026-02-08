module.exports = {
  apps: [{
    name: 'a2a-telegram-bot',
    script: 'bot.js',
    cwd: '/root/mev-bot',
    interpreter: 'node',
    env: {
      NODE_ENV: 'production',
      TELEGRAM_BOT_TOKEN: 'YOUR_TOKEN_HERE',
      CLIENT_PRIVATE_KEY: '0xYOUR_PRIVATE_KEY',
      WORKER_ADDRESS: '0x164e7A98fa7Bd34679522c470bF68D66C5b00C66'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    kill_timeout: 5000,
    log_file: '/var/log/a2a-bot.log',
    out_file: '/var/log/a2a-bot-out.log',
    error_file: '/var/log/a2a-bot-err.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
