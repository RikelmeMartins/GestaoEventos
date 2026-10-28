export default function Marca({ tamanho = 26 }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="2" y="5" width="28" height="25" rx="6" fill="var(--accent)" />
      <rect x="9" y="2" width="3.5" height="7" rx="1.75" fill="var(--accent-ink)" />
      <rect x="19.5" y="2" width="3.5" height="7" rx="1.75" fill="var(--accent-ink)" />
      <rect x="8" y="14" width="16" height="3" rx="1.5" fill="#fff" />
      <rect x="8" y="20.5" width="10" height="3" rx="1.5" fill="#fff" />
    </svg>
  );
}