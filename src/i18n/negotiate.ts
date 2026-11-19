import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

// "id-ID,id;q=0.9,en;q=0.8" -> "id". Highest q first; region is ignored.
// "in" is an old code for Indonesian that some browsers still send.
export function fromAcceptLanguage(header: string | null): Locale {
  const wanted = (header ?? "")
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return {
        lang: tag.split("-")[0].toLowerCase(),
        q: q ? Number(q.trim().slice(2)) || 0 : 1,
      };
    })
    .filter((entry) => entry.lang && entry.q > 0)
    // Stable sort: equal q keeps the browser's order
    .sort((a, b) => b.q - a.q);
  for (const { lang } of wanted) {
    const code = lang === "in" ? "id" : lang;
    if (isLocale(code)) return code;
  }
  return DEFAULT_LOCALE;
}
