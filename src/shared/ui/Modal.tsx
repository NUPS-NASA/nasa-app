import React, { useCallback, useMemo } from 'react';
import { cn } from '../utils/index';
import { createPortal } from 'react-dom';
import Button from './Button';

interface Props {
  onClose: () => void;
  className?: string;
  children?: React.ReactNode;
  rootId?: string;
  dismissible?: boolean;
}

const Modal: React.FC<Props> = ({ onClose, children, className, rootId, dismissible = true }) => {
  const targetId = rootId ?? 'modal_root';

  // Create or reuse a modal root element
  const modalRoot = useMemo(() => {
    const existing = document.getElementById(targetId);
    if (existing) return existing;

    const element = document.createElement('div');
    element.id = targetId;
    document.body.appendChild(element);
    return element;
  }, [targetId]);

  // Prevent clicks inside the modal from closing it
  const handleInnerClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  }, []);

  // Handle overlay click (outside the modal)
  const handleOverlayClick = useCallback(() => {
    if (!dismissible) return;
    onClose();
  }, [dismissible, onClose]);

  // Render modal using portal
  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
      onClick={handleOverlayClick}
    >
      <div
        className={cn(
          'relative w-full h-full bg-white overflow-auto rounded-none', // full screen modal
          className,
        )}
        onClick={handleInnerClick}
      >
        {dismissible ? (
          <button
            className="absolute top-4 right-4 text-3xl text-gray-700 hover:text-black transition"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        ) : null}
        {children}
      </div>
    </div>,
    modalRoot,
  );
};

export default Modal;
