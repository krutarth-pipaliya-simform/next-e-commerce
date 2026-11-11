export type ProductAboutProps = {
  /** Product name, for the heading. */
  name: string;
  /** The seller's description. Blank lines split it into paragraphs. */
  description: string;
  /** Facts for the table beside the description, e.g. category and sizes. Rows with no value are skipped. */
  details: { label: string; value?: string }[];
};

/** "About <product>": the description beside a table of product facts. */
export function ProductAbout({
  name,
  description,
  details,
}: ProductAboutProps) {
  const paragraphs = description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const rows = details.filter((row) => row.value);

  return (
    <section
      aria-labelledby="about-heading"
      className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-x-16 gap-y-12 rounded-panel bg-surface p-6 shadow-[0_1px_2px_rgb(17_18_20/0.04)] sm:p-12"
    >
      <div>
        <h2
          id="about-heading"
          className="font-display text-[clamp(32px,5vw,48px)] leading-[1.05] tracking-[-0.02em]"
        >
          About {name}
        </h2>
        {paragraphs.map((paragraph, i) => (
          <p
            key={i}
            className="mt-4 max-w-[60ch] text-base leading-[1.65] whitespace-pre-line text-body first-of-type:mt-6"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {rows.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold">Details</h3>
          <table className="w-full border-collapse text-[15px]">
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className="border-t border-hairline last:border-b"
                >
                  <th
                    scope="row"
                    className="w-[40%] py-3.5 pr-4 text-left align-top font-normal text-muted"
                  >
                    {row.label}
                  </th>
                  <td className="py-3.5 text-ink">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
