import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

const parseUserId = (raw?: string): number | null => {
  if (!raw) {
    return null;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

export const useUserIdParam = (): number | null => {
  const params = useParams<Record<string, string | undefined>>();
  return useMemo(() => parseUserId(params.userId), [params.userId]);
};

export default useUserIdParam;
