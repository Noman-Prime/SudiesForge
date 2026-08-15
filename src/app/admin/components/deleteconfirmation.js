"use client";

import { CircleAlert, LoaderCircle, Trash2, X } from "lucide-react";
import { useEffect } from "react";

const DeleteConfirmationModal = ({
    open,
    title = "Confirm Deletion",
    description,
    itemName,
    confirmText = "Delete",
    loading = false,
    onCancel,
    onConfirm,
}) => {
    useEffect(() => {
        if (!open) {
            return;
        }

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        const closeWithEscape = (event) => {
            if (event.key === "Escape" && !loading) {
                onCancel();
            }
        };

        window.addEventListener("keydown", closeWithEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", closeWithEscape);
        };
    }, [open, loading, onCancel]);

    if (!open) {
        return null;
    }

    const closeModal = () => {
        if (!loading) {
            onCancel();
        }
    };

    return (
        <div role="dialog" aria-modal="true" aria-labelledby="delete-modal-title" className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]" onMouseDown={closeModal}>
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-md">
                            <CircleAlert size={22} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-red-600">
                                Permanent action
                            </p>

                            <h2 id="delete-modal-title" className="mt-1 text-base font-extrabold text-[#071a4a] sm:text-lg">
                                {title}
                            </h2>
                        </div>
                    </div>

                    <button type="button" onClick={closeModal} disabled={loading} aria-label="Close confirmation" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">
                        <X size={18} />
                    </button>
                </div>

                <div className="px-5 py-5 sm:px-6">
                    <p className="text-xs leading-6 text-slate-600 sm:text-sm">
                        {description}
                    </p>

                    {itemName && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-red-500">
                                Selected item
                            </p>

                            <p className="mt-1 break-words text-sm font-extrabold text-red-700">
                                {itemName}
                            </p>
                        </div>
                    )}

                    <p className="mt-4 text-[10px] font-semibold leading-5 text-slate-500 sm:text-xs">
                        This action cannot be undone.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
                    <button type="button" onClick={closeModal} disabled={loading} className="flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">
                        Cancel
                    </button>

                    <button type="button" onClick={onConfirm} disabled={loading} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white shadow-md transition active:scale-[0.98] hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400">
                        {loading ? (
                            <>
                                <LoaderCircle size={16} className="animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} />
                                {confirmText}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;