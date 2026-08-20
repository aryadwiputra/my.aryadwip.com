/** Helper untuk membuat meta tags per halaman dengan brand "Niat". */
export function pageMeta(page: string) {
  return [
    { title: `${page} — Niat` },
    {
      name: "description",
      content: `${page} — Niat: journal, focus timer, habits, dan task untuk hidup lebih baik.`,
    },
    { property: "og:title", content: `${page} — Niat` },
  ];
}
