import { useState, useEffect, useCallback } from 'react';

export interface BalanceData {
    balance: number;
    totalSpent: number;
    totalRecharged: number;
    recentTransactions: any[];
}

export function useBalance() {
    const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/balance');
            if (!res.ok) throw new Error('Failed to fetch balance');
            const data = await res.json();
            setBalanceData(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    return {
        balance: balanceData?.balance ?? 0,
        balanceData,
        loading,
        error,
        refetch: fetchBalance,
    };
}
