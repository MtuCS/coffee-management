import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-lg',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`bg-white rounded-xl shadow-2xl p-8 w-full ${maxWidth}`}>
        <h3 className="text-xl font-bold mb-6">{title}</h3>
        <div className="space-y-4">{children}</div>
        {footer && <div className="flex justify-end gap-3 mt-8">{footer}</div>}
      </div>
    </div>
  );
};
