import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'debug.log');

export function debugLog(...args: any[]) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');

    const logLine = `[${timestamp}] ${message}\n`;

    // Escribir a archivo
    fs.appendFileSync(logFile, logLine);

    // También console.log por si acaso
    console.log(logLine);
}

export function clearDebugLog() {
    try {
        fs.unlinkSync(logFile);
    } catch { }
}
