export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="absolute left-4 top-4 z-50 bg-background px-4 py-2 text-sm font-medium border rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
      >
        Skip to main content
      </a>
      <a
        href="#main-navigation"
        className="absolute left-4 top-16 z-50 bg-background px-4 py-2 text-sm font-medium border rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
      >
        Skip to navigation
      </a>
    </div>
  );
}
