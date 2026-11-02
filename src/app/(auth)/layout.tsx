export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-7xl place-items-center px-4 py-16">
      <div className="animate-fade-up w-full max-w-sm">{children}</div>
    </div>
  );
}
