import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const dailyRotateFileTransportInfo = new DailyRotateFile({
  filename: 'logs/app-info-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'info',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

const dailyRotateFileTransportError = new DailyRotateFile({
  filename: 'logs/app-error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    dailyRotateFileTransportInfo,
    dailyRotateFileTransportError
  ]
});

export default logger; 