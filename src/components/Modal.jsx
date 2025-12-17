import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-surface-dark p-6 shadow-xl transition-all border border-border-dark">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold leading-6 text-text-primary-dark">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/10 transition-colors text-text-secondary-dark hover:text-text-primary-dark"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
