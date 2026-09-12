import "dotenv/config";
import { prisma } from "../lib/prisma.js";

/**
 * Populates the CMS tables with the data the public site currently hard-codes in
 * frontend/src/data/*.ts and components/AdBannerSection.tsx.
 *
 * Idempotent: rows are matched by their natural key and only CREATED when missing.
 * Existing rows are never overwritten, so re-running never clobbers admin edits.
 * Tables without a natural key (ads, videos, testimonials) are seeded only when empty.
 */

const STATES: Array<{
  name: string;
  code: string;
  regionalTitle: string;
  tagline: string;
  activeTechniciansCount: number;
  cities: string[];
}> = [
  {
    name: "Arunachal Pradesh",
    code: "AR",
    regionalTitle: "अरुणाचल प्रदेश",
    tagline: "Land of Dawn-Lit Mountains",
    activeTechniciansCount: 380,
    cities: ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Roing", "Bomdila", "Tezu", "Namsai", "Aalo"],
  },
  {
    name: "Assam",
    code: "AS",
    regionalTitle: "অসম / असम",
    tagline: "Gateway to Northeast India",
    activeTechniciansCount: 1450,
    cities: [
      "Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Tezpur", "Nagaon", "Tinsukia", "Bongaigaon",
      "Sivasagar", "Karimganj", "Goalpara", "North Lakhimpur",
    ],
  },
  {
    name: "Maharashtra",
    code: "MH",
    regionalTitle: "महाराष्ट्र",
    tagline: "Financial & Industrial Capital",
    activeTechniciansCount: 4200,
    cities: [
      "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad (Chh. Sambhajinagar)", "Thane", "Kolhapur",
      "Solapur", "Navi Mumbai", "Amravati", "Nanded", "Sangli",
    ],
  },
  {
    name: "Meghalaya",
    code: "ML",
    regionalTitle: "मेघालय / Abode of Clouds",
    tagline: "Scotland of the East",
    activeTechniciansCount: 420,
    cities: [
      "Shillong", "Tura", "Jowai", "Nongpoh", "Cherrapunji (Sohra)", "Williamnagar", "Baghmara",
      "Mairang", "Nongstoin", "Resubelpara",
    ],
  },
  {
    name: "Nagaland",
    code: "NL",
    regionalTitle: "नागालैंड / Land of Festivals",
    tagline: "Falcon Capital of the World",
    activeTechniciansCount: 340,
    cities: ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Mon", "Phek", "Chumukedima", "Peren"],
  },
  {
    name: "Rajasthan",
    code: "RJ",
    regionalTitle: "राजस्थान",
    tagline: "Land of Royal Heritage & Craft",
    activeTechniciansCount: 2890,
    cities: [
      "Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Alwar", "Bhilwara", "Sikar",
      "Sri Ganganagar", "Pali", "Bharatpur",
    ],
  },
  {
    name: "Uttar Pradesh",
    code: "UP",
    regionalTitle: "उत्तर प्रदेश",
    tagline: "Heartland of India",
    activeTechniciansCount: 4850,
    cities: [
      "Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj", "Noida", "Ghaziabad", "Meerut",
      "Gorakhpur", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Jhansi",
    ],
  },
  {
    name: "West Bengal",
    code: "WB",
    regionalTitle: "পশ্চিমবঙ্গ / पश्चिम बंगाल",
    tagline: "Cultural Capital & Hub of Eastern India",
    activeTechniciansCount: 3200,
    cities: [
      "Kolkata", "Siliguri", "Asansol", "Durgapur", "Howrah", "Darjeeling", "Kharagpur", "Malda",
      "Bardhaman", "Jalpaiguri", "Baharampur", "Haldia",
    ],
  },
];

const CATEGORIES: Array<{
  slug: string;
  name: string;
  hindiName: string;
  iconName: string;
  description: string;
  avgResponseTime: string;
  popularServices: string[];
}> = [
  {
    slug: "electrician",
    name: "Electrician",
    hindiName: "बिजली मिस्त्री (Electrician)",
    iconName: "Zap",
    description: "Home wiring, MCB tripping, inverter setup, fans, switchboards & lighting installation.",
    avgResponseTime: "15-30 mins",
    popularServices: [
      "Short Circuit & MCB Repair",
      "Ceiling Fan & Chandelier Fitting",
      "Inverter & Battery Wiring",
      "Complete House Concealed Wiring",
      "Geyser & Water Heater Line",
      "Smart Switch & Home Automation",
    ],
  },
  {
    slug: "plumber",
    name: "Plumber",
    hindiName: "नल व पाइप मिस्त्री (Plumber)",
    iconName: "Droplet",
    description: "Pipe leakage, tap repairs, motor installation, bathroom sanitary fittings & water tanks.",
    avgResponseTime: "20-40 mins",
    popularServices: [
      "Water Tank Cleaning & Overflow Valve",
      "Bathroom Faucets & Shower Fitting",
      "Blockage Removal & Drainage Pipe",
      "Water Motor & Submersible Repair",
      "RO Water Purifier Line Fitting",
      "Grouting & Concealed Pipe Leakage",
    ],
  },
  {
    slug: "carpenter",
    name: "Carpenter",
    hindiName: "बढ़ई / वुडवर्क मिस्त्री (Carpenter)",
    iconName: "Hammer",
    description: "Custom furniture, modular kitchen, door locks, wardrobe repairs & polishing.",
    avgResponseTime: "30-45 mins",
    popularServices: [
      "Modular Kitchen Cabinets Repair",
      "Main Door Lock & Handle Installation",
      "Bed, Sofa & Wardrobe Assembly",
      "Wood Polishing & PU Lacquer",
      "Termite Wood Treatment & Replacement",
      "Window Meshing & Sliding Track",
    ],
  },
  {
    slug: "appliance-repair",
    name: "AC & Appliance Repair",
    hindiName: "एसी व उपकरण रिपेयर (Appliance Repair)",
    iconName: "AirVent",
    description: "AC gas refill, compressor fix, washing machine, refrigerator, microwave & chimney.",
    avgResponseTime: "20-35 mins",
    popularServices: [
      "Split / Window AC Deep Jet Cleaning",
      "AC Gas Leakage & Refilling (R32/R410)",
      "Washing Machine Drum & PCB Repair",
      "Single/Double Door Refrigerator Cooling",
      "Kitchen Chimney Degreasing Service",
      "Microwave Oven Magnetron Replacement",
    ],
  },
  {
    slug: "painter",
    name: "House Painter & Polish",
    hindiName: "रंगाई व पुट्टी कारीगर (Painter)",
    iconName: "Paintbrush",
    description: "Interior & exterior wall painting, waterproof putty, texture design & wood stain.",
    avgResponseTime: "Scheduled",
    popularServices: [
      "Complete Home Waterproof Putty & Primer",
      "Texture Wall & Metallic Accent Design",
      "Exterior Weather-Proof Painting",
      "Anti-Dampness & Seepage Treatment",
      "Door & Window Enamel Painting",
      "Melamine & PU Wood Polishing",
    ],
  },
  {
    slug: "mason-construction",
    name: "Mason & Tiles (Raj Mistri)",
    hindiName: "राजमिस्त्री व टाइल्स कारीगर (Mason)",
    iconName: "BrickWall",
    description: "Floor tiling, wall plaster, brickwork, marble fitting, renovation & structural repair.",
    avgResponseTime: "Scheduled",
    popularServices: [
      "Vitrified Floor Tiles & Wall Cladding",
      "Italian Marble Laying & Diamond Polish",
      "Bathroom Renovation & Slope Correction",
      "Brick Masonry & Cement Plastering",
      "Terrace Waterproofing & Kota Stone",
      "Boundary Wall & Gate Pillar Work",
    ],
  },
  {
    slug: "welder-fabricator",
    name: "Welder & Fabrication",
    hindiName: "वेल्डिंग व ग्रिल मिस्त्री (Fabricator)",
    iconName: "Flame",
    description: "Iron gates, balcony grills, rolling shutters, stainless steel railings & sheds.",
    avgResponseTime: "30-60 mins",
    popularServices: [
      "Balcony Safety Grill & Window Frame",
      "Heavy-Duty Rolling Shutter Repair",
      "Stainless Steel (SS 304) Stair Railing",
      "Rooftop Tin Shed & Truss Fabrication",
      "Main Gate Hinge & Lock Welding",
      "Custom Metal Racks & Industrial Work",
    ],
  },
  {
    slug: "cctv-security",
    name: "CCTV & Security Tech",
    hindiName: "सीसीटीवी व सुरक्षा सिस्टम (CCTV Tech)",
    iconName: "ShieldCheck",
    description: "IP & HD CCTV installation, DVR/NVR configuration, intercom, video doorbell.",
    avgResponseTime: "25-45 mins",
    popularServices: [
      "4K IP / HD Camera Setup & Cabling",
      "Mobile Live View App Configuration",
      "Video Doorbell & Electronic Smart Lock",
      "Biometric Attendance Machine Setup",
      "Intercom & EPABX Office Wiring",
      "Night-Vision Camera Angle Correction",
    ],
  },
  {
    slug: "cleaning-pest",
    name: "Deep Cleaning & Pest Control",
    hindiName: "सफाई व पेस्ट कंट्रोल (Cleaning)",
    iconName: "Sparkles",
    description:
      "Full home deep cleaning, sofa shampooing, termite drill treatment, cockroach herbal paste.",
    avgResponseTime: "1-2 hours",
    popularServices: [
      "Full Flat Deep Sanitization & Buffing",
      "Sofa & Mattress Foam Wash Extraction",
      "Commercial Termite Piping & Drill",
      "Cockroach & Ant Gel Infestation Cure",
      "Kitchen Oil Stain & Degrease Scrub",
      "Water Tank Chemical-Free Sludge Wash",
    ],
  },
  {
    slug: "mechanic",
    name: "Auto & Two-Wheeler Mechanic",
    hindiName: "ऑटो व बाइक मैकेनिक (Mechanic)",
    iconName: "Wrench",
    description: "On-spot roadside breakdown assistance, battery jump-start, oil change & puncture repair.",
    avgResponseTime: "15-25 mins",
    popularServices: [
      "24/7 Roadside Battery Jump-Start",
      "Tubeless Tyre Puncture & Air Check",
      "Car Engine Diagnostic & Brake Pad Check",
      "Bike Carburetor & Chain Lubrication",
      "Emergency Towing & Fuel Top-up",
      "Clutch Cable & Alternator Repair",
    ],
  },
];

const PLANS: Array<{
  slug: string;
  name: string;
  price: string;
  duration: string;
  badge: string;
  features: string[];
  idealFor: string;
  highlighted: boolean;
  popular: boolean;
}> = [
  {
    slug: "free_starter",
    name: "Starter Free Trial",
    price: "₹0",
    duration: "First 30 Days Free",
    badge: "Standard Starter",
    highlighted: false,
    popular: false,
    features: [
      "Basic listing in your registered city",
      "Receive up to 15 direct customer calls/mo",
      "Standard profile with 1 gallery photo",
      "0% commission on all earnings",
      "Standard SMS notifications",
    ],
    idealFor: "New mistris trying the platform for the first time",
  },
  {
    slug: "silver_pro",
    name: "Silver Pro",
    price: "₹299",
    duration: "per month (or ₹799/quarter)",
    badge: "Silver Pro Badge",
    highlighted: false,
    popular: false,
    features: [
      "Verified Silver Ustad Badge on profile",
      "Top 10 search priority in your city & category",
      "Receive up to 60 direct customer calls & WhatsApp",
      "Upload up to 3 gallery photos of past work",
      "Google Maps locality navigation enabled",
      "Dedicated helpline support",
    ],
    idealFor: "Full-time technicians wanting steady daily customer calls",
  },
  {
    slug: "gold_master",
    name: "Gold Master Ustad",
    price: "₹599",
    duration: "per month (or ₹1,499/quarter)",
    badge: "Gold Master Badge",
    highlighted: true,
    popular: true,
    features: [
      "Gold Master Ustad Verified Seal (2.5x more trust)",
      "#1 Top 3 Featured placement in state & city search",
      "Unlimited customer calls & direct WhatsApp connects",
      "Emergency 24/7 SOS alert lead broadcasts",
      "Full digital visiting card & QR code link",
      "Priority customer dispute resolution & support",
      "Zero lead fees forever",
    ],
    idealFor: "Established master craftsmen & busy contractors",
  },
  {
    slug: "platinum_partner",
    name: "Platinum Partner / Agency",
    price: "₹1,999",
    duration: "per year (Save 45%)",
    badge: "Platinum Partner",
    highlighted: false,
    popular: false,
    features: [
      "Exclusive Platinum Crown Verification Badge",
      "Multi-city coverage across your entire state",
      "Priority lead routing across all sub-categories",
      "Physical MistriKhoj laminated ID Card & Work Vest kit mailed to your address",
      "Commercial & contractor direct inquiry access",
      "Personal account manager for profile promotion",
      "SMS & WhatsApp marketing broadcast promotion",
    ],
    idealFor: "Contractors, multi-worker teams & top-rated specialists",
  },
];

const TESTIMONIALS = [
  {
    author: "Priyanka Borah",
    location: "Guwahati",
    state: "Assam",
    rating: 5,
    serviceCategory: "Plumbing",
    technicianName: "Bipul Hazarika",
    comment:
      "Our main overhead water tank valve broke during Sunday evening flooding the terrace. Found Bipul da on MistriKhoj within 3 minutes. He reached Zoo Road in 25 mins with replacement parts. Clean, polite, and reasonable charge with zero hidden platform cut!",
    displayDate: "3 days ago",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
  {
    author: "Sunil R. Deshmukh",
    location: "Pune",
    state: "Maharashtra",
    rating: 5,
    serviceCategory: "AC Repair",
    technicianName: "Sachin Kadam",
    comment:
      "Booked Sachin for a severe AC cooling failure in peak summer. Unlike other apps that assign random third-party workers, MistriKhoj showed me his exact ITI credentials, previous work photos, and direct phone number. Repaired the capacitor right in front of us.",
    displayDate: "1 week ago",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    author: "Ananya Roychowdhury",
    location: "Kolkata",
    state: "West Bengal",
    rating: 5,
    serviceCategory: "House Painting",
    technicianName: "Subrata Mukherjee",
    comment:
      "Our ancestral home in Gariahat had chronic dampness that kept peeling new paint. Subrata da diagnosed the seepage source and used proper waterproof primer before finishing with beautiful velvet paint. The craftsmanship is pure art.",
    displayDate: "2 weeks ago",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  },
  {
    author: "Dawa Tsering",
    location: "Itanagar",
    state: "Arunachal Pradesh",
    rating: 5,
    serviceCategory: "Carpentry",
    technicianName: "Tage Nyokum",
    comment:
      "Finding skilled modular kitchen woodworkers in Itanagar was always tough before MistriKhoj. Tage Nyokum built our custom kitchen cabinets with perfect alignment and soft-close hinges. Highly recommended for all Northeast homeowners!",
    displayDate: "3 weeks ago",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    author: "Mahendra Choudhary",
    location: "Jaipur",
    state: "Rajasthan",
    rating: 5,
    serviceCategory: "Electrician",
    technicianName: "Rameshwar Sharma",
    comment:
      "Late night MCB sparking in our garment shop. Rameshwar ji answered my direct call immediately and was at Mansarovar within 20 mins. Fixed the heavy load fuse and saved our inventory. Truly Bharat's best technician platform.",
    displayDate: "1 month ago",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
  },
];

const HOME_BANNERS = [
  {
    companyName: "UltraTech Cement",
    title: "Build Beautiful Homes",
    description: "The Engineer's Choice. Get 10% off on bulk orders for your next big project.",
    ctaText: "View Offers",
    linkUrl: "https://www.ultratechcement.com",
    imageUrl:
      "https://images.unsplash.com/photo-1541888086425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200&h=400",
  },
  {
    companyName: "Local Hardware Pros",
    title: "Premium Tools on Sale",
    description: "Upgrade your toolkit with premium brands at 30% discount.",
    ctaText: "Shop Now",
    linkUrl: "https://mistrikhoj.in",
    imageUrl:
      "https://images.unsplash.com/photo-1581147036324-c1c9bf6c4b19?auto=format&fit=crop&q=80&w=1200&h=400",
  },
  {
    companyName: "Asian Paints",
    title: "Bring Colors to Life",
    description: "Explore the new Royale range. Water-proof, dust-proof, and vibrant.",
    ctaText: "Explore Colors",
    linkUrl: "https://www.asianpaints.com",
    imageUrl:
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=1200&h=400",
  },
];

const VIDEOS = [
  {
    title: "MistriKhoj",
    videoUrl:
      "https://player.vimeo.com/video/677741698?h=582d68ae61&badge=0&autopause=0&player_id=0&app_id=58479",
  },
  {
    title: "Mohit Todi Review",
    videoUrl:
      "https://player.vimeo.com/video/685897253?h=76424b76f0&badge=0&autopause=0&player_id=0&app_id=58479",
  },
  {
    title: "Welcome",
    videoUrl:
      "https://player.vimeo.com/video/675509060?h=50def86385&badge=0&autopause=0&player_id=0&app_id=58479",
  },
];

const REFERRALS = [
  { code: "roing21022", name: "Biru sonar", phone: "7628064053" },
  { code: "Gopal10222", name: "Gopal", phone: "9706128862" },
  { code: "Rohit10222", name: "Rohit das tinsukia", phone: "8011629580" },
  { code: "Sushanta1012022", name: "Sushant", phone: "7002604309" },
  { code: "Kundan10122", name: "Kundan kumar", phone: "8876680450" },
  { code: "chanda21222", name: "H Chanda", phone: "9435134548" },
  { code: "rohit21222", name: "Rohit das", phone: "8011629580" },
  { code: "Sanjay130222", name: "Sanjay Sharma", phone: "7002956475" },
  { code: "Rajesh130222", name: "Rajesh Kumar", phone: "9436632022" },
  { code: "Pankaj140222", name: "Pankaj konwar", phone: "9957005542" },
];

const SITE_SETTINGS: Array<{ key: string; value: unknown; label: string; settingGroup: string }> = [
  { key: "whatsapp_number", value: "+919957005542", label: "WhatsApp contact number", settingGroup: "contact" },
  { key: "sos_number", value: "+919957005542", label: "Emergency SOS phone number", settingGroup: "contact" },
  { key: "support_email", value: "support@mistrikhoj.in", label: "Support email address", settingGroup: "contact" },
  { key: "ad_rotation_seconds", value: 6, label: "Home banner rotation interval (seconds)", settingGroup: "homepage" },
  { key: "directory_states_label", value: "Supported Indian States & 50+ Cities", label: "Locations section heading", settingGroup: "homepage" },
  { key: "sos_enabled", value: true, label: "Show the Emergency SOS button", settingGroup: "features" },
];

async function seed(): Promise<void> {
  let created = { states: 0, cities: 0, categories: 0, plans: 0, referrals: 0, settings: 0 };

  for (const [index, entry] of STATES.entries()) {
    const state = await prisma.state.upsert({
      where: { name: entry.name },
      update: {},
      create: {
        name: entry.name,
        code: entry.code,
        regionalTitle: entry.regionalTitle,
        tagline: entry.tagline,
        activeTechniciansCount: entry.activeTechniciansCount,
        sortOrder: index,
      },
    });
    created.states += 1;

    for (const [cityIndex, cityName] of entry.cities.entries()) {
      await prisma.city.upsert({
        where: { stateId_name: { stateId: state.id, name: cityName } },
        update: {},
        create: { stateId: state.id, name: cityName, sortOrder: cityIndex },
      });
      created.cities += 1;
    }
  }

  for (const [index, entry] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: entry.slug },
      update: {},
      create: {
        slug: entry.slug,
        name: entry.name,
        hindiName: entry.hindiName,
        iconName: entry.iconName,
        description: entry.description,
        avgResponseTime: entry.avgResponseTime,
        popularServices: entry.popularServices,
        sortOrder: index,
      },
    });
    created.categories += 1;
  }

  for (const [index, entry] of PLANS.entries()) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: entry.slug },
      update: {},
      create: { ...entry, sortOrder: index },
    });
    created.plans += 1;
  }

  for (const [index, entry] of REFERRALS.entries()) {
    await prisma.referral.upsert({
      where: { code: entry.code },
      update: {},
      create: { code: entry.code, name: entry.name, phone: entry.phone },
    });
    void index;
    created.referrals += 1;
  }

  for (const entry of SITE_SETTINGS) {
    await prisma.siteSetting.upsert({
      where: { key: entry.key },
      update: {},
      create: {
        key: entry.key,
        value: entry.value as never,
        label: entry.label,
        settingGroup: entry.settingGroup,
      },
    });
    created.settings += 1;
  }

  if ((await prisma.testimonial.count()) === 0) {
    await prisma.testimonial.createMany({
      data: TESTIMONIALS.map((item, index) => ({ ...item, sortOrder: index })),
    });
  }

  if ((await prisma.advertisement.count({ where: { placement: "HOME_BANNER" } })) === 0) {
    await prisma.advertisement.createMany({
      data: HOME_BANNERS.map((item, index) => ({
        ...item,
        placement: "HOME_BANNER" as const,
        sortOrder: index,
      })),
    });
  }

  if ((await prisma.advertisement.count({ where: { placement: "VIDEO" } })) === 0) {
    await prisma.advertisement.createMany({
      data: VIDEOS.map((item, index) => ({ ...item, placement: "VIDEO" as const, sortOrder: index })),
    });
  }

  console.log("Content seed complete:", {
    ...created,
    testimonials: await prisma.testimonial.count(),
    homeBanners: await prisma.advertisement.count({ where: { placement: "HOME_BANNER" } }),
    videos: await prisma.advertisement.count({ where: { placement: "VIDEO" } }),
  });
}

seed()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
