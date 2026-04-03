"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const CONSENT_KEY = "vivotiv-cookie-consent";
const CONSENT_VERSION = "1";

export interface CookieConsent {
  analytics: boolean;
  version: string;
  timestamp: string;
}

interface CookieConsentContextValue {
  consent: CookieConsent | null;
  loaded: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  updateConsent: (updates: Partial<Pick<CookieConsent, "analytics">>) => void;
  openPreferences: () => void;
  isPreferencesOpen: boolean;
  setIsPreferencesOpen: (open: boolean) => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null,
);

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx)
    throw new Error(
      "useCookieConsent must be used inside CookieConsentProvider",
    );
  return ctx;
}

function saveConsent(consent: CookieConsent) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch {
    // localStorage may be unavailable
  }
}

function loadConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = loadConsent();
    if (stored) {
      // localStorage-backed consent is applied after mount by design.
      // This avoids SSR mismatch while preserving previous user choice.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConsent(stored);
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((next: CookieConsent) => {
    setConsent(next);
    saveConsent(next);
  }, []);

  const acceptAll = useCallback(() => {
    persist({
      analytics: true,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    });
  }, [persist]);

  const rejectAll = useCallback(() => {
    persist({
      analytics: false,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    });
  }, [persist]);

  const updateConsent = useCallback(
    (updates: Partial<Pick<CookieConsent, "analytics">>) => {
      const base = consent ?? {
        analytics: false,
        version: CONSENT_VERSION,
        timestamp: new Date().toISOString(),
      };
      persist({ ...base, ...updates, timestamp: new Date().toISOString() });
    },
    [consent, persist],
  );

  const openPreferences = useCallback(() => setIsPreferencesOpen(true), []);

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        loaded,
        acceptAll,
        rejectAll,
        updateConsent,
        openPreferences,
        isPreferencesOpen,
        setIsPreferencesOpen,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}
