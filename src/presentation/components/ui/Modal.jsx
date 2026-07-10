import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

/**
 * Standardized Design System Modal component.
 * Features:
 * - Backdrop backdrop-blur blur overlay
 * - Escape key closing
 * - Focus Trap configuration
 * - Locked body scroll when open
 * - Accessibility role="dialog" structure
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  ...props
}) {
  const modalRef = useRef(null);

  // Close on Escape press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap inside modal
  useEffect(() => {
    if (!isOpen) return;
    const modal = modalRef.current;
    if (!modal) return;

    const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first.focus();

    const trap = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      {...props}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        className={`bg-surface border border-surface-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up ${className}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border bg-surface-secondary">
          <h3 id="modal-title" className="text-sm font-semibold text-text">
            {title}
          </h3>
          <Button variant="icon" size="sm" onClick={onClose} aria-label="Close modal">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="px-5 py-5 max-h-[80dvh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
