export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">📭</div>
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      {description && <p className="text-sm text-slate-400 mt-1 max-w-sm">{description}</p>}
    </div>
  );
}
