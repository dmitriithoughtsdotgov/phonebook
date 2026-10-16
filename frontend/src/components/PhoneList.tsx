"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { dateLocales, timeZone, toLanguage } from "@/i18n/settings";
import { formatPhone } from "@/lib/phoneFormat";
import { getPhones, isUnauthorized, phoneKeys } from "@/lib/queries";

export type Filter = "all" | "private" | "shared";

const filters: Filter[] = ["all", "private", "shared"];

export function PhoneList({ filter }: { filter: Filter }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { data: phones, error } = useQuery({ queryKey: phoneKeys.all, queryFn: getPhones });

  const sessionExpired = isUnauthorized(error);
  useEffect(() => {
    if (sessionExpired) router.replace("/login");
  }, [sessionExpired, router]);

  if (!phones) {
    return (
      <p role={error ? "alert" : "status"} className={`py-8 text-center ${error ? "text-red-600" : "text-gray-500"}`}>
        {error ? t("list.loadFailed") : t("list.loading")}
      </p>
    );
  }

  const dateLocale = dateLocales[toLanguage(i18n.language)];
  // The whole list is loaded and filtered here; see "Known limitations" in the README.
  const visible = phones.filter(
    (p) =>
      filter === "all" ||
      (filter === "private" && p.visibility === "PRIVATE") ||
      (filter === "shared" && p.visibility === "SHARED"),
  );

  return (
    <div>
      <nav className="mb-4 flex gap-2">
        {filters.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/" : `/?filter=${f}`}
            className={`rounded-full px-4 py-1.5 text-sm ${
              f === filter ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t(`list.filters.${f}`)}
          </Link>
        ))}
      </nav>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-gray-500">{t("list.empty")}</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {visible.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="font-mono text-lg">{formatPhone(p.number)}</p>
                <p className="text-sm text-gray-500">
                  {p.label && <span className="text-gray-700">{p.label} · </span>}
                  {t("list.addedBy", {
                    owner: p.mine ? t("list.me") : p.ownerUsername,
                    date: new Date(p.createdAt).toLocaleString(dateLocale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone,
                    }),
                  })}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                  p.visibility === "PRIVATE" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                }`}
              >
                {t(`list.visibility.${p.visibility}`)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
