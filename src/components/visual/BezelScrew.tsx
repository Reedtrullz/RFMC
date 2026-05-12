interface BezelScrewProps {
  className?: string;
}

export function BezelScrew({ className = '' }: BezelScrewProps) {
  return (
    <span
      className={[
        'block h-3 w-3 rounded-full border border-black/70 bg-[#3a3a3a]',
        'shadow-[inset_1px_1px_1px_rgba(255,255,255,0.2),inset_-1px_-1px_1px_rgba(0,0,0,0.7)]',
        'after:block after:h-px after:w-2 after:translate-x-[1px] after:translate-y-[5px] after:rotate-45 after:bg-black/70',
        className,
      ].join(' ')}
      aria-hidden="true"
    />
  );
}
