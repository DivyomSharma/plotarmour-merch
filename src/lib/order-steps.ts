// Customer-facing description of what happens after an enquiry. Keep this strictly true to the
// process that exists today: do not list features (accounts, workspaces, online payment) until
// they are built.
export const orderSteps = [
  "Send a short enquiry: the product or kit, quantity, and the date you need it by.",
  "We review it and reply with a quote that covers customisation, packaging, freight and GST.",
  "You approve mockups and specifications, and confirm the order, before production starts.",
  "We produce, pack and dispatch, and keep you updated until delivery.",
] as const;
