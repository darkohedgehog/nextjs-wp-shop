import ResetPasswordClient from '@/components/auth/ResetPasswordClient';
import { Suspense } from 'react';


export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center text-zinc-300 text-sm">
          Učitavanje forme za promjenu zaporke...
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}