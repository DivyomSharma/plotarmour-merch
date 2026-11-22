const questions = [
  ["What is the minimum order?", "10 pieces per style. Larger programmes are reviewed for sourcing and delivery."],
  ["What does the indicative price include?", "Prices on this site are indicative blank-garment prices excluding GST. Decoration, packaging, freight and GST are extra and itemised in your quote. Volume pricing is confirmed in your quote."],
  ["Can I get a sample first?", "Yes: tick the sample box on the enquiry form. Sample pricing, and whether it can be adjusted against a bulk order, is confirmed in your quote."],
  ["How do approvals work?", "Before production we align mockups, specifications and commercial details with you. Production starts after your approval."],
  ["How long will it take?", "Turnaround depends on quantity, decoration and delivery location. We state it in your quote instead of promising a generic number."],
  ["Can you deliver to several cities?", "Add your delivery cities and dates to the enquiry. Split deliveries are reviewed by hand before we quote."],
  ["How do I send my logo?", "Share it on WhatsApp or reply to our quote message. File upload on the form is not available yet."],
] as const;

export function OrderFaq() {
  return (
    <section aria-labelledby="order-faq-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">Questions</p>
      <h2 id="order-faq-heading" className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-foreground">
        Before you order
      </h2>
      <div className="mt-5 divide-y divide-[color:var(--border)] border-y border-[color:var(--border)]">
        {questions.map(([question, answer]) => (
          <details key={question} className="group">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm font-semibold leading-6 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-details-marker]:hidden">
              <span>{question}</span>
              <span aria-hidden="true" className="shrink-0 text-lg leading-none transition-transform motion-reduce:transition-none group-open:rotate-45">+</span>
            </summary>
            <p className="pb-4 pr-8 text-sm leading-7 text-text-soft">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
