import { useEffect, useState } from 'react';

/**
 * Tells if current execution is happening in the browser or the server
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Side effects do not run in the server, so if we reach this, we can safely set isClient to `true`
    setIsClient(true);
  }, []);

  return isClient;
}
