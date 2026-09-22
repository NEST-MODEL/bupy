export function Logo({ size = 40, withWord = true }: { size?: number; withWord?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <img src="./logo.svg" width={size} height={size} alt="" aria-hidden="true" />
      {withWord && <span className="text-2xl font-extrabold tracking-tight text-lagoon-700">Bupy</span>}
    </span>
  );
}
