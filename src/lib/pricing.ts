// Pricing configuration for prepaid balance system
// All prices in EUR (€)

export const PRICING = {
    // Keyword tracking
    keyword_check_daily: 0.03,      // €0.03 per check (Auto-tracking Daily - Best value)
    keyword_check_standard: 0.05,   // €0.05 per check (Standard Queue - Every 2 days, weekly, manual)
    keyword_check_live: 0.09,       // €0.09 per check (Live Mode - Instant)

    // AI features
    ai_overview_check: 0.02,        // €0.02 per AI Overview check

    // Data enrichment
    search_volume: 0.05,            // €0.05 - Volume checks are expensive ($0.025)
    competitor_analysis: 0.01,      // €0.01 per competitor analysis
    keyword_research: 0.50,         // €0.50 per report
    onpage_audit: 1.00,             // €1.00 per deep AI audit
    related_keywords: 0.15,         // €0.15 per related keywords search with AI analysis
} as const;

export type PricingAction = keyof typeof PRICING;

// Credit packages with bonus
// Packages deprecated in favor of custom amount
// export const PACKAGES = ...

// Helper to format currency
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
    }).format(amount);
}

// Helper to format credits
export function formatCredits(credits: number): string {
    return new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 3,
    }).format(credits);
}

// Action descriptions for transaction history
export const ACTION_DESCRIPTIONS: Record<PricingAction, string> = {
    keyword_check_daily: 'Keyword ranking check (Daily Auto)',
    keyword_check_standard: 'Keyword ranking check (Standard)',
    keyword_check_live: 'Keyword ranking check (Live)',
    ai_overview_check: 'AI Overview check',
    search_volume: 'Search volume lookup',
    competitor_analysis: 'Competitor analysis',
    keyword_research: 'Keyword Research Report',
    onpage_audit: 'Deep On-Page SEO Audit (A.I.)',
    related_keywords: 'Related keywords search',
};

// Get human-readable description for action
export function getActionDescription(action: PricingAction, metadata?: any): string {
    const baseDescription = ACTION_DESCRIPTIONS[action];

    if (metadata?.keywordTerm) {
        return `${baseDescription}: "${metadata.keywordTerm}"`;
    }

    return baseDescription;
}

// Balance thresholds for warnings
export const BALANCE_THRESHOLDS = {
    critical: 0.50,  // €0.50 - Block actions
    low: 2.00,       // €2.00 - Show warning
    comfortable: 5.00, // €5.00 - All good
} as const;

// Get balance status
export function getBalanceStatus(balance: number): 'critical' | 'low' | 'comfortable' {
    if (balance < BALANCE_THRESHOLDS.critical) return 'critical';
    if (balance < BALANCE_THRESHOLDS.low) return 'low';
    return 'comfortable';
}
