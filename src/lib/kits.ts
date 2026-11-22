// PLACEHOLDER: owner to confirm before public claims

export type KitItem = {
  name: string;
  quantityPerHead: number;
  category: string;
};

export type Kit = {
  slug: string;
  name: string;
  audience: string;
  summary: string;
  items: KitItem[];
  indicativePerHeadBudget: { min: number; max: number; indicative: true };
  leadTimeBand: string;
  customisationOptions: string[];
  coverImage: string;
};

export const kits: Kit[] = [
  {
    slug: "employee-welcome",
    name: "Employee Welcome Kit",
    audience: "HR and people teams",
    summary:
      "A considered first-day set for new joiners and distributed teams.",
    items: [
      { name: "Tee or hoodie", quantityPerHead: 1, category: "Apparel" },
      { name: "Bottle", quantityPerHead: 1, category: "Drinkware" },
      { name: "Notebook", quantityPerHead: 1, category: "Stationery" },
      { name: "Tote", quantityPerHead: 1, category: "Carry" },
      { name: "Branded box", quantityPerHead: 1, category: "Packaging" },
    ],
    indicativePerHeadBudget: { min: 900, max: 1800, indicative: true },
    leadTimeBand:
      "Confirmed in the quote after artwork, quantities, and delivery location are reviewed.",
    customisationOptions: [
      "Logo application",
      "Name cards",
      "Packaging inserts",
      "Size assortment",
    ],
    coverImage: "/media/kits/employee-welcome.webp",
  },
  {
    slug: "startup-swag",
    name: "Startup Swag Kit",
    audience: "Early-stage teams and brand launches",
    summary:
      "A flexible identity-led kit for team moments, launch drops, and early communities.",
    items: [
      { name: "Hoodie", quantityPerHead: 1, category: "Apparel" },
      { name: "Cap", quantityPerHead: 1, category: "Apparel" },
      { name: "Sticker set", quantityPerHead: 1, category: "Print" },
      { name: "Laptop sleeve", quantityPerHead: 1, category: "Accessories" },
    ],
    indicativePerHeadBudget: { min: 1200, max: 2500, indicative: true },
    leadTimeBand:
      "Confirmed in the quote after artwork, quantities, and delivery location are reviewed.",
    customisationOptions: [
      "Print placement",
      "Embroidery",
      "Sticker artwork",
      "Colour matching",
    ],
    coverImage: "/media/kits/startup-swag.webp",
  },
  {
    slug: "college-fest",
    name: "College Fest Kit",
    audience: "Fests, societies, and campus committees",
    summary:
      "A practical event package for participants, volunteers, and organizing teams.",
    items: [
      { name: "Fest tee", quantityPerHead: 1, category: "Apparel" },
      { name: "Lanyard", quantityPerHead: 1, category: "Event essentials" },
      { name: "Tote", quantityPerHead: 1, category: "Carry" },
      { name: "Volunteer wear", quantityPerHead: 1, category: "Apparel" },
    ],
    indicativePerHeadBudget: { min: 550, max: 1100, indicative: true },
    leadTimeBand:
      "Confirmed in the quote after artwork, quantities, and delivery location are reviewed.",
    customisationOptions: [
      "Department variants",
      "Sponsor placements",
      "Volunteer identifiers",
      "Size matrices",
    ],
    coverImage: "/media/kits/college-fest.webp",
  },
  {
    slug: "conference",
    name: "Conference Kit",
    audience: "Event organisers and delegates",
    summary:
      "A useful attendee kit designed to keep conference materials together and on-brand.",
    items: [
      { name: "Delegate bag", quantityPerHead: 1, category: "Carry" },
      { name: "Notebook", quantityPerHead: 1, category: "Stationery" },
      { name: "Bottle", quantityPerHead: 1, category: "Drinkware" },
      {
        name: "Lanyard and ID",
        quantityPerHead: 1,
        category: "Event essentials",
      },
    ],
    indicativePerHeadBudget: { min: 700, max: 1450, indicative: true },
    leadTimeBand:
      "Confirmed in the quote after artwork, quantities, and delivery location are reviewed.",
    customisationOptions: [
      "Delegate names",
      "Sponsor placements",
      "Agenda inserts",
      "Packed-by-session bundles",
    ],
    coverImage: "/media/kits/conference.webp",
  },
  {
    slug: "executive-gift",
    name: "Executive Gift Set",
    audience: "Client and leadership gifting",
    summary:
      "A more considered gifting route for leadership moments and key relationships.",
    items: [
      {
        name: "Premium polo or jacket",
        quantityPerHead: 1,
        category: "Apparel",
      },
      { name: "Desk accessory", quantityPerHead: 1, category: "Accessories" },
      { name: "Tech accessory", quantityPerHead: 1, category: "Accessories" },
      { name: "Gift box", quantityPerHead: 1, category: "Packaging" },
    ],
    indicativePerHeadBudget: { min: 1800, max: 4000, indicative: true },
    leadTimeBand:
      "Confirmed in the quote after artwork, quantities, and delivery location are reviewed.",
    customisationOptions: [
      "Premium finishes",
      "Personalised notes",
      "Gift-box branding",
      "Delivery splits",
    ],
    coverImage: "/media/kits/executive-gift.webp",
  },
];

export function getKitBySlug(slug: string) {
  return kits.find((kit) => kit.slug === slug);
}

export type KitBudgetResult = {
  headcount: number | null;
  budgetPerHead: number | null;
  totalRange: { min: number; max: number } | null;
  fits: Kit[];
  belowMinimum: boolean;
};

export function calculateKitBudget(
  headcountInput: number,
  budgetPerHeadInput: number,
  selectedKit?: Kit,
): KitBudgetResult {
  const headcount =
    Number.isInteger(headcountInput) && headcountInput >= 10
      ? headcountInput
      : null;
  const budgetPerHead =
    Number.isFinite(budgetPerHeadInput) && budgetPerHeadInput > 0
      ? budgetPerHeadInput
      : null;

  if (!headcount || !budgetPerHead) {
    return {
      headcount,
      budgetPerHead,
      totalRange: null,
      fits: [],
      belowMinimum: false,
    };
  }

  const fits = kits.filter(
    (kit) =>
      budgetPerHead >= kit.indicativePerHeadBudget.min &&
      budgetPerHead <= kit.indicativePerHeadBudget.max,
  );
  const applicableMinimum =
    selectedKit?.indicativePerHeadBudget.min ??
    Math.min(...kits.map((kit) => kit.indicativePerHeadBudget.min));

  return {
    headcount,
    budgetPerHead,
    totalRange: {
      min:
        headcount * (selectedKit?.indicativePerHeadBudget.min ?? budgetPerHead),
      max:
        headcount * (selectedKit?.indicativePerHeadBudget.max ?? budgetPerHead),
    },
    fits,
    belowMinimum: budgetPerHead < applicableMinimum,
  };
}
