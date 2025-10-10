function ErrorBanner({ error }: { error: string }) {
  return (
    <div className="mb-4 rounded-md border border-red-400 bg-red-100 px-4 py-3 text-red-700">
      <p className="font-medium">¡Error!</p>
      <p className="text-sm">{error}</p>
    </div>
  );
};

export default ErrorBanner;
