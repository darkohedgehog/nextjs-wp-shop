import type { ReactNode } from 'react';

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, icon, children }: AuthLayoutProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div
        className="
          w-full
          max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl
          mx-auto
          border border-[#adb5bd]/70
          bg-linear-to-br from-zinc-900/80 via-zinc-900/60 to-zinc-800/80
          rounded-2xl
          shadow-[0_20px_60px_rgba(0,0,0,0.45)]
          backdrop-blur-md
          p-6 md:p-10
        "
      >
        {/* Header */}
        <div className="flex flex-col items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-3">
            {icon && (
              <span className="text-3xl md:text-4xl text-[#adb5bd]">
                {icon}
              </span>
            )}
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-100">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-sm md:text-base text-zinc-400 text-center max-w-lg">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content (forme, poruke, dugmad...) */}
        <div className="max-w-xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}