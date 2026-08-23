import { RecaptchaProvider } from "@/components/providers/RecaptchaProvider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RecaptchaProvider siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""}>
      {children}
    </RecaptchaProvider>
  );
}
