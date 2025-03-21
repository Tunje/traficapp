import { useState } from 'react';

interface UseLoadingState {
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useLoadingState = (): UseLoadingState => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return {
    loading,
    error,
    setLoading,
    setError
  };
};
