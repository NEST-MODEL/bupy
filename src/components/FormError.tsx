export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-ctl border border-berry-600/30 bg-berry-100 px-4 py-3 text-sm text-berry-700">
      {message}
    </div>
  );
}
