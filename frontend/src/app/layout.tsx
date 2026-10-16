import type { Metadata } from "next";
import { QueryProvider } from "@/components/QueryProvider";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getTranslation } from "@/i18n/server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation();
  return {
    title: t("app.title"),
    description: t("app.description"),
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { lng } = await getTranslation();
  return (
    <html lang={lng}>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <I18nProvider lng={lng}>
          <QueryProvider>{children}</QueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
