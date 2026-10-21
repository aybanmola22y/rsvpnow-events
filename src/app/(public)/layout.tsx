import { PublicShell } from "@/components/public/site-shell";
import { LocalBusinessJsonLd } from "@/components/seo/json-ld";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LocalBusinessJsonLd />
      <PublicShell>{children}</PublicShell>
    </>
  );
}
