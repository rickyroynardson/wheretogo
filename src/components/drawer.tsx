"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

// Mobile-style bottom sheet on the native <dialog>, which gives focus
// trapping, Escape to close and a backdrop for free. Drag the handle down to
// dismiss; tapping the backdrop also closes it.
export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const dragStart = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);
  // State, not the ref, drives rendering: no animation while a finger drags
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  const endDrag = () => {
    if (dragStart.current === null) return;
    dragStart.current = null;
    setDragging(false);
    // Past ~100px counts as a dismiss; otherwise snap back
    if (offset > 100) onClose();
    else setOffset(0);
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard users close with Escape (native <dialog>)
    <dialog
      ref={dialog}
      // Fires however it closes (drag, backdrop, Escape); reset for next open
      onClose={() => {
        setOffset(0);
        onClose();
      }}
      // A click whose target is the <dialog> itself landed on the backdrop
      onClick={(e) => e.target === dialog.current && onClose()}
      aria-label={title}
      className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[85dvh] w-full max-w-none bg-transparent p-0 backdrop:bg-black/40"
    >
      <div
        style={{ translate: `0 ${offset}px` }}
        className={`mx-auto flex max-h-[85dvh] w-full max-w-140 flex-col rounded-t-2xl bg-background text-foreground shadow-xl starting:translate-y-full ${dragging ? "" : "transition-[translate] duration-300"}`}
      >
        <div
          className="cursor-grab touch-none px-5 pt-3 pb-2 active:cursor-grabbing"
          onPointerDown={(e) => {
            dragStart.current = e.clientY - offset;
            setDragging(true);
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (dragStart.current === null) return;
            setOffset(Math.max(0, e.clientY - dragStart.current));
          }}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div className="mx-auto h-1.5 w-10 rounded-full bg-border" />
          <h2 className="pt-3 text-lg font-semibold">{title}</h2>
        </div>
        <div className="overflow-y-auto px-5 pt-1 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </dialog>
  );
}
