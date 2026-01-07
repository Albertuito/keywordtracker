/**
 * Simple in-memory rate limiter for API routes
 * Note: This is per-instance only. For multi-instance deployments, use Redis/Upstash.
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
        if (now > entry.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}, 5 * 60 * 1000);

interface RateLimitOptions {
    /** Maximum requests allowed in the window */
    limit: number;
    /** Time window in seconds */
    windowSeconds: number;
}

interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetIn: number;
}

/**
 * Check rate limit for a given identifier (usually IP or user ID)
 */
export function checkRateLimit(
    identifier: string,
    options: RateLimitOptions = { limit: 10, windowSeconds: 60 }
): RateLimitResult {
    const { limit, windowSeconds } = options;
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    const existing = rateLimitMap.get(identifier);

    if (!existing || now > existing.resetTime) {
        // First request or window expired
        rateLimitMap.set(identifier, {
            count: 1,
            resetTime: now + windowMs
        });
        return {
            success: true,
            remaining: limit - 1,
            resetIn: windowSeconds
        };
    }

    if (existing.count >= limit) {
        // Rate limit exceeded
        return {
            success: false,
            remaining: 0,
            resetIn: Math.ceil((existing.resetTime - now) / 1000)
        };
    }

    // Increment count
    existing.count++;
    return {
        success: true,
        remaining: limit - existing.count,
        resetIn: Math.ceil((existing.resetTime - now) / 1000)
    };
}

/**
 * Get client IP from request headers (works with Vercel/Cloudflare)
 */
export function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    // Fallback
    return 'unknown';
}
