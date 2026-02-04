import { toast as sonnerToast, type ToastT } from "sonner";

// Toast position configuration
const DEFAULT_POSITION: ToastT["position"] = "bottom-right";
const MOBILE_POSITION: ToastT["position"] = "top-center";

// Detect mobile for position
const getPosition = (): ToastT["position"] => {
  if (typeof window === "undefined") return DEFAULT_POSITION;
  return window.innerWidth < 768 ? MOBILE_POSITION : DEFAULT_POSITION;
};

// Default durations
const DURATIONS = {
  short: 2000,
  default: 4000,
  long: 6000,
};

interface ToastOptions {
  duration?: number;
  position?: ToastT["position"];
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  onAutoClose?: () => void;
}

/**
 * Toast helper functions for FCH Noticias
 * Uses Sonner under the hood with custom defaults
 */
export const toast = {
  /**
   * Show a success toast
   */
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      duration: options?.duration ?? DURATIONS.default,
      position: options?.position ?? getPosition(),
      description: options?.description,
      action: options?.action,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  },

  /**
   * Show an error toast
   */
  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      duration: options?.duration ?? DURATIONS.long,
      position: options?.position ?? getPosition(),
      description: options?.description,
      action: options?.action,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  },

  /**
   * Show an info toast
   */
  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      duration: options?.duration ?? DURATIONS.default,
      position: options?.position ?? getPosition(),
      description: options?.description,
      action: options?.action,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  },

  /**
   * Show a warning toast
   */
  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      duration: options?.duration ?? DURATIONS.long,
      position: options?.position ?? getPosition(),
      description: options?.description,
      action: options?.action,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  },

  /**
   * Show a loading toast that auto-dismisses on completion
   */
  loading: (message: string, options?: ToastOptions) => {
    return sonnerToast.loading(message, {
      duration: Infinity,
      position: options?.position ?? getPosition(),
      description: options?.description,
    });
  },

  /**
   * Show a promise-based toast with loading, success, and error states
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    options?: Omit<ToastOptions, 'duration'>
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      position: options?.position ?? getPosition(),
    });
  },

  /**
   * Dismiss a specific toast by ID or dismiss all if no ID provided
   */
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  /**
   * Update an existing toast
   */
  update: (toastId: string | number, message: string, options?: ToastOptions) => {
    sonnerToast.success(message, {
      id: toastId,
      duration: options?.duration ?? DURATIONS.default,
      position: options?.position ?? getPosition(),
      description: options?.description,
    });
  },
};

/**
 * Predefined toast messages for common actions
 */
export const toastMessages = {
  favorites: {
    added: (item: string) => `${item} añadido a favoritos`,
    removed: (item: string) => `${item} eliminado de favoritos`,
    error: "No se pudo actualizar favoritos",
  },
  network: {
    error: "Error de conexión. Verifica tu internet",
    offline: "Estás offline. Algunas funciones no están disponibles",
    online: "¡Conexión restaurada!",
  },
  sync: {
    success: "Sincronización completada",
    error: "Error al sincronizar datos",
    inProgress: "Sincronizando...",
  },
  auth: {
    loginSuccess: "¡Bienvenido!",
    loginError: "Error al iniciar sesión",
    logoutSuccess: "Sesión cerrada",
    sessionExpired: "Tu sesión ha expirado",
  },
  comments: {
    posted: "Comentario publicado",
    deleted: "Comentario eliminado",
    error: "Error al publicar comentario",
  },
  share: {
    copied: "Enlace copiado al portapapeles",
    error: "Error al compartir",
  },
};

/**
 * Hook-style toast helpers for common FCH operations
 */
export function useFCHToasts() {
  return {
    // Favorites
    favoriteAdded: (itemName: string) => 
      toast.success(toastMessages.favorites.added(itemName)),
    
    favoriteRemoved: (itemName: string) => 
      toast.success(toastMessages.favorites.removed(itemName)),
    
    favoriteError: () => 
      toast.error(toastMessages.favorites.error),

    // Network
    networkError: () => 
      toast.error(toastMessages.network.error, { duration: DURATIONS.long }),
    
    offline: () => 
      toast.warning(toastMessages.network.offline, { duration: DURATIONS.long }),
    
    online: () => 
      toast.success(toastMessages.network.online),

    // Sync
    syncSuccess: () => 
      toast.success(toastMessages.sync.success),
    
    syncError: () => 
      toast.error(toastMessages.sync.error),
    
    syncInProgress: () => 
      toast.loading(toastMessages.sync.inProgress),

    // Comments
    commentPosted: () => 
      toast.success(toastMessages.comments.posted),
    
    commentDeleted: () => 
      toast.success(toastMessages.comments.deleted),
    
    commentError: () => 
      toast.error(toastMessages.comments.error),

    // Share
    linkCopied: () => 
      toast.success(toastMessages.share.copied, { duration: DURATIONS.short }),
    
    shareError: () => 
      toast.error(toastMessages.share.error),
  };
}

export default toast;
