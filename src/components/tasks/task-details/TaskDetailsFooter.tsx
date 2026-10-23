import type { RefObject } from 'react';
import { LinkIcon } from './icons';

interface TaskDetailsFooterProps {
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}

export default function TaskDetailsFooter({
  closeButtonRef,
  onClose,
}: TaskDetailsFooterProps) {
  return (
    <footer className="relative hidden shrink-0 items-center bg-[#F1F3FF] px-4 py-3 sm:px-6 md:flex">
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        className="rounded-[2px] bg-[#D7E2FF] px-3 py-1.5 text-sm leading-5 font-semibold text-[#041B3C] hover:bg-[#C7D6FF] focus-visible:outline-2 focus-visible:outline-[#003D9B]"
      >
        Close
      </button>
      <span className="absolute left-[55%] inline-flex -translate-x-1/2 items-center gap-2 text-sm leading-5 font-medium text-[#434654]">
        <LinkIcon />
        Copy link
      </span>
      <span aria-hidden="true" className="w-12" />
    </footer>
  );
}
