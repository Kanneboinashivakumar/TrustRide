import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useNotifications } from '@/providers/notification-provider';

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  error: <AlertCircle className="w-5 h-5 text-rose-500" />,
  critical: <AlertCircle className="w-5 h-5 text-rose-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  command: <Info className="w-5 h-5 text-blue-500" />,
  security: <AlertTriangle className="w-5 h-5 text-red-500" />,
  audit: <CheckCircle2 className="w-5 h-5 text-purple-500" />,
};

export const Toaster: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-lg p-4 flex items-start gap-3 pointer-events-auto"
          >
            <div className="flex-shrink-0 mt-0.5">
              {icons[notification.type as keyof typeof icons] || <Info className="w-5 h-5 text-blue-500" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-foreground)]">{notification.title}</p>
              {notification.message && (
                <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{notification.message}</p>
              )}
            </div>
            
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
