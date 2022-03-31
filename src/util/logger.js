import logger from 'pino';

const log = logger({
  base: { pid: false },
  transport: {
    target: 'pino-pretty',
    options: {
      colorized: true
    }
  },
  timestamp: () => `,"time": "${new Date().toLocaleDateString()}"`
});

export default log;