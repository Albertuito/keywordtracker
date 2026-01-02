import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'worker-debug.log');

export function logWorker(message: string) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${message}\n`;
    try {
        fs.appendFileSync(logFile, line);
    } catch (e) {
        // ignore
    }
}
