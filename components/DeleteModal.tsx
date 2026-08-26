"use client";

import Modal from "./Modal";

type DeleteModalProps = {
  isOpen: boolean;
  title?: string;
  itemLabel: string;
  description?: string;

  isDeleting?: boolean;
  error?: string;

  onClose: () => void;
  onDelete: () => void | Promise<void>;
};

export default function DeleteModal({
  isOpen,
  title = "DELETE",
  itemLabel,
  description = "This action cannot be undone.",
  isDeleting = false,
  error = "",
  onClose,
  onDelete,
}: DeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isDeleting) {
          onClose();
        }
      }}
    >
      <div className="w-full ">
        <h2 className="text-center text-3xl font-bold">{title}</h2>

        <div className="mt-2 text-center">
          <p className="text-2xl">
            Are you sure you want to delete:{" "}
            <span className="text-park-green font-bold underline">
              {itemLabel}
            </span>
          </p>

          <p className="mt-2 text-base text-red-600">{description}</p>
        </div>

        {error && (
          <p className="mt-4 text-center font-semibold text-red-600">{error}</p>
        )}

        <div className="mt-2 grid grid-cols-2 gap-4">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="cursor-pointer rounded-md bg-zinc-500 px-6 py-3 text-xl font-semibold text-white transition hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onDelete}
            className="cursor-pointer rounded-md bg-red-600 px-6 py-3 text-xl font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
