import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LoginRedirect } from "@/components/LoginRedirect";
import { getTranslation } from "@/i18n/server";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string; loggedOut?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl, loggedOut, error } = await searchParams;
  // Only allow redirects back into this application.
  const target = callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/";
  const { t } = await getTranslation();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <h1 className="text-3xl font-semibold">{t("app.title")}</h1>
      <LoginRedirect callbackUrl={target} auto={loggedOut === undefined && error === undefined} loggedOut={loggedOut !== undefined} />
    </main>
  );
}
