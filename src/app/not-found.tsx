import Link from "next/link";
import { PublicShell } from "@/components/public/site-shell";

export default function NotFound() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-xl px-6 py-28 text-center">
        <p className="text-[11px] tracking-[0.22em] text-gold uppercase">404</p>
        <h1 className="mt-3 font-display text-5xl">This page has left the room</h1>
        <p className="mt-4 text-sm text-stone-600">That address does not match a page on this site.</p>
        <Link href="/" className="mt-8 inline-block underline">Return home</Link>
      </div>
    </PublicShell>
  );
}
