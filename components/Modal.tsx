"use client";

type ModalProps = {
  isOpen: Boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl rounded-md bg-white p-8 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-6 top-4 text-4xl font-bold text-red-600 hover:text-red-700"
        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
}
