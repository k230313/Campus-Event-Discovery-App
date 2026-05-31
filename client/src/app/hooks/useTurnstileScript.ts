import { useEffect, useState } from 'react';

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/**
 * Loads the Cloudflare Turnstile script only on pages that actually render the widget.
 * @returns {{ isReady: boolean, loadError: string }} Script readiness and any load failure.
 */
export function useTurnstileScript() {
  const [isReady, setIsReady] = useState<boolean>(() => typeof window !== 'undefined' && typeof (window as any).turnstile !== 'undefined');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (typeof (window as any).turnstile !== 'undefined') {
      setIsReady(true);
      return undefined;
    }

    let script = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;

    const handleLoad = () => {
      setIsReady(true);
      setLoadError('');
    };

    const handleError = () => {
      setLoadError('Captcha could not be loaded. Please refresh and try again.');
      setIsReady(false);
    };

    if (!script) {
      script = document.createElement('script');
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = TURNSTILE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    if (typeof (window as any).turnstile !== 'undefined') {
      handleLoad();
    }

    return () => {
      script?.removeEventListener('load', handleLoad);
      script?.removeEventListener('error', handleError);
    };
  }, []);

  return { isReady, loadError };
}
