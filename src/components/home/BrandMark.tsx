export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="3" y="5" width="16" height="20" rx="3" fill="#C45C26" />
      <rect x="13" y="8" width="16" height="20" rx="3" fill="#1AA37A" />
      <text
        x="21"
        y="21"
        textAnchor="middle"
        fill="#08281e"
        fontSize="11"
        fontWeight="700"
      >
        #
      </text>
    </svg>
  );
}
