import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AddPhoneForm } from "@/components/AddPhoneForm";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PhoneList, type Filter } from "@/components/PhoneList";
import { getTranslation } from "@/i18n/server";
import { fetchPhones } from "@/lib/api";
import { authOptions } from "@/lib/auth";
import { phoneKeys } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || session.error) {
    // Session expired (refresh token no longer valid): sign in again via Keycloak.
    redirect("/login");
  }
  const accessToken = session.accessToken;

  // Prefetch on the server so the page arrives with the list. A failed prefetch is not dehydrated,
  // so PhoneList simply loads again in the browser and handles the error there.
  const queryClient = new QueryClient();
  await queryClient
    .query({ queryKey: phoneKeys.all, queryFn: () => fetchPhones(accessToken) })
    .catch((error) => console.error("Prefetching the phone list failed", error));

  const { filter: rawFilter } = await searchParams;
  const filter: Filter = rawFilter === "private" || rawFilter === "shared" ? rawFilter : "all";
  const { t } = await getTranslation();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("app.title")}</h1>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <span className="text-gray-600">{session.user.username ?? session.user.name}</span>
          <form action="/logout" method="post">
            <button type="submit" className="text-sm text-blue-600 hover:underline">
              {t("auth.logout")}
            </button>
          </form>
        </div>
      </header>

      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium">{t("home.addTitle")}</h2>
        <AddPhoneForm />
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium">{t("home.savedTitle")}</h2>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <PhoneList filter={filter} />
        </HydrationBoundary>
      </section>
    </main>
  );
}
