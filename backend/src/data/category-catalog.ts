export type CategoryCatalogEntry = {
  name: string;
  slug?: string;
  status: "ACTIVE" | "INACTIVE";
};

/**
 * Legacy category master plus categories already used by the current Mistri data.
 * Names are intentionally kept close to the source data so existing filters and
 * imported records continue to match.
 */
export const CATEGORY_CATALOG_ADDITIONS: readonly CategoryCatalogEntry[] = [
  { name: "Carpenter", status: "ACTIVE" },
  { name: "Civil Contractor", status: "ACTIVE" },
  { name: "Electrician", status: "ACTIVE" },
  { name: "CC Camera & Security Devices", status: "ACTIVE" },
  { name: "AC Repair", status: "ACTIVE" },
  { name: "TV & Home Theater Repair (Music System, Speakers)", status: "ACTIVE" },
  { name: "Plumber", status: "ACTIVE" },
  { name: "Painter", slug: "painter-trade", status: "ACTIVE" },
  { name: "Car Mechanic", status: "ACTIVE" },
  { name: "Bike/ Scooty/Bullet Mechanic", status: "ACTIVE" },
  { name: "Welder", status: "ACTIVE" },
  { name: "Inverter and Battery Mechanic", status: "ACTIVE" },
  { name: "Desktop, Laptop Technician", status: "ACTIVE" },
  { name: "Printer Technician", status: "ACTIVE" },
  { name: "Digital & SLR Camera", status: "ACTIVE" },
  { name: "Tiles Mistri", status: "ACTIVE" },
  { name: "Raaj Mistri", status: "ACTIVE" },
  { name: "রাজ মিস্ত্রি", status: "ACTIVE" },
  { name: "Mobile & Tab Repair", status: "ACTIVE" },
  { name: "Interior Designer", status: "ACTIVE" },
  { name: "Shutter Repair", status: "ACTIVE" },
  { name: "Revolving Chair Repair", status: "ACTIVE" },
  { name: "Lan, Networking, WIFI", status: "ACTIVE" },
  { name: "Curtain & Drapery Repair", status: "ACTIVE" },
  { name: "Wallpapering Services", status: "ACTIVE" },
  { name: "Water Purifier - RO Repair", status: "ACTIVE" },
  { name: "Geyser Mechanic", status: "ACTIVE" },
  { name: "Washing Machine & Refrigerator Technician", status: "ACTIVE" },
  { name: "Aluminium Section & Steel Expert", status: "ACTIVE" },
  { name: "Photo Copy Machine Technician (Xerox)", status: "ACTIVE" },
  { name: "UPVC Windows & Door Manufacturer", status: "ACTIVE" },
  { name: "Car Designer", status: "ACTIVE" },
  { name: "Projector Repair", status: "ACTIVE" },
  { name: "Roof Fitting Expert", status: "ACTIVE" },
  { name: "Interactive Digital Board Expert", status: "ACTIVE" },
  { name: "Winding Works Technician / Expert", status: "ACTIVE" },
  { name: "Weighing Machine Expert", status: "ACTIVE" },
  { name: "Water Treatment Plant", status: "ACTIVE" },
  { name: "Swiming Pool Expert", status: "ACTIVE" },
  { name: "Solar Expert", status: "ACTIVE" },
  { name: "Water Fountain Mechanic", status: "ACTIVE" },
  { name: "Wheel Balancing Alighnment Expert", status: "ACTIVE" },
  { name: "Generator Repair", status: "ACTIVE" },
  { name: "Treadmill Technician", status: "ACTIVE" },
  { name: "Cycle Mechanic", status: "ACTIVE" },
  { name: "COBLER", status: "ACTIVE" },
  { name: "Sofa Manufacturing & Repair", status: "ACTIVE" },
  { name: "CAR/BIKE GPS & ANDROID PLAYER EXPERT", status: "ACTIVE" },
  { name: "Ups Repair Technician", status: "ACTIVE" },
  { name: "MOCHI COBBLER", status: "ACTIVE" },
  { name: "Welder & fabrication", status: "ACTIVE" },
  { name: "Transformer repairing Technician", status: "ACTIVE" },
  { name: "Vending Tea & cofee machine repair", status: "ACTIVE" },
  { name: "Test", status: "INACTIVE" },
  { name: "Ceiling mistri", status: "ACTIVE" },
  { name: "Truck mechanic HMV", status: "ACTIVE" },
  { name: "Chimney", status: "ACTIVE" },
  { name: "Tailor", slug: "cloth", status: "ACTIVE" },
  { name: "Computer & Mobile Repair", status: "ACTIVE" },
];

export function normalizeCategoryName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-IN");
}

export function categorySlug(name: string): string {
  return (
    name
      .trim()
      .toLocaleLowerCase("en-IN")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80)
      .replace(/-+$/g, "") || "category"
  );
}
