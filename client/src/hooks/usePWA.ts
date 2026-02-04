/**
 * FCH Noticias - Hook usePWA
 * 
 * Hook para gestionar el estado de la Progressive Web App (PWA),
 * incluyendo detección de instalación, estado offline y prompt de instalación.
 * 
 * @example
 * ```tsx
 * function InstallButton() {
 *   const { isInstallable, isInstalled, isOffline, installApp } = usePWA();
 *   
 *   if (isInstalled) return <p>App instalada</p>;
 *   if (isOffline) return <p>Modo offline activo</p>;
 *   
 *   return isInstallable ? (
 *     <button onClick={installApp}>Instalar App</button>
 *   ) : null;
 * }
 * ```
 * 
 * @module client/src/hooks/usePWA
 */

import { useState, useEffect } from 'react';

/**
 * Estado de la PWA
 */
interface PWAState {
  /** Si la app puede ser instalada */
  isInstallable: boolean;
  /** Si la app está instalada (standalone mode) */
  isInstalled: boolean;
  /** Si el dispositivo está offline */
  isOffline: boolean;
  /** Evento de prompt de instalación (si disponible) */
  deferredPrompt: Event | null;
}

/**
 * Hook usePWA - Gestión del estado PWA
 * 
 * Características:
 * - Detecta si la app está instalada
 * - Captura el evento beforeinstallprompt
 * - Monitorea estado online/offline
 * - Permite disparar la instalación programáticamente
 * 
 * @returns {PWAState & { installApp: () => Promise<void> }} Estado PWA y función de instalación
 */
export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: false,
    deferredPrompt: null,
  });

  useEffect(() => {
    // Check if running as installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');

    setState(prev => ({ ...prev, isInstalled: isStandalone }));

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setState(prev => ({
        ...prev,
        isInstallable: true,
        deferredPrompt: e,
      }));
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isInstallable: false,
        isInstalled: true,
        deferredPrompt: null,
      }));
    };

    // Listen for online/offline events
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOffline: false }));
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOffline: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial offline state
    setState(prev => ({ ...prev, isOffline: !navigator.onLine }));

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Dispara el prompt de instalación de la PWA
   * Solo funciona si el evento beforeinstallprompt fue capturado
   */
  const installApp = async () => {
    if (!state.deferredPrompt) return;

    const promptEvent = state.deferredPrompt as any;
    promptEvent.prompt();

    const { outcome } = await promptEvent.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed successfully');
    }

    setState(prev => ({
      ...prev,
      deferredPrompt: null,
      isInstallable: false,
    }));
  };

  return {
    ...state,
    installApp,
  };
}

/**
 * Registra el Service Worker para la PWA
 * 
 * Esta función debe llamarse una vez al inicio de la aplicación,
 * típicamente en main.tsx.
 * 
 * @example
 * ```tsx
 * // main.tsx
 * import { registerServiceWorker } from './hooks/usePWA';
 * 
 * if (process.env.NODE_ENV === 'production') {
 *   registerServiceWorker();
 * }
 * ```
 */
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available
                  console.log('New content available, please refresh');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    });
  }
}
