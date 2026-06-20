import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: "success" | "error" | "info", duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [exitingIds, setExitingIds] = useState<string[]>([]);

  const removeToast = useCallback((id: string) => {
    setExitingIds((prev) => [...prev, id]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setExitingIds((prev) => prev.filter((exitingId) => exitingId !== id));
    }, 200); // match fade out transition
  }, []);

  const toast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info", duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => toast(message, "success", duration),
    [toast]
  );
  const error = useCallback(
    (message: string, duration?: number) => toast(message, "error", duration),
    [toast]
  );
  const info = useCallback(
    (message: string, duration?: number) => toast(message, "info", duration),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => {
          const isExiting = exitingIds.includes(t.id);
          return (
            <div
              key={t.id}
              className={`toast-item ${isExiting ? "exit" : ""}`}
            >
              <span className={`toast-indicator ${t.type}`}></span>
              <div className="toast-message">{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                className="toast-close-btn"
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
