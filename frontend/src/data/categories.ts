import { ServiceCategory } from '../types';

const FEATURED_CATEGORIES: ServiceCategory[] = [
  {
    id: 'electrician',
    name: 'Electrician',
    hindiName: 'बिजली मिस्त्री (Electrician)',
    iconName: 'Zap',
    description: 'Home wiring, MCB tripping, inverter setup, fans, switchboards & lighting installation.',
    avgResponseTime: '15-30 mins',
    techniciansAvailable: 3450,
    popularServices: [
      'Short Circuit & MCB Repair',
      'Ceiling Fan & Chandelier Fitting',
      'Inverter & Battery Wiring',
      'Complete House Concealed Wiring',
      'Geyser & Water Heater Line',
      'Smart Switch & Home Automation'
    ]
  },
  {
    id: 'plumber',
    name: 'Plumber',
    hindiName: 'नल व पाइप मिस्त्री (Plumber)',
    iconName: 'Droplet',
    description: 'Pipe leakage, tap repairs, motor installation, bathroom sanitary fittings & water tanks.',
    avgResponseTime: '20-40 mins',
    techniciansAvailable: 2890,
    popularServices: [
      'Water Tank Cleaning & Overflow Valve',
      'Bathroom Faucets & Shower Fitting',
      'Blockage Removal & Drainage Pipe',
      'Water Motor & Submersible Repair',
      'RO Water Purifier Line Fitting',
      'Grouting & Concealed Pipe Leakage'
    ]
  },
  {
    id: 'carpenter',
    name: 'Carpenter',
    hindiName: 'बढ़ई / वुडवर्क मिस्त्री (Carpenter)',
    iconName: 'Hammer',
    description: 'Custom furniture, modular kitchen, door locks, wardrobe repairs & polishing.',
    avgResponseTime: '30-45 mins',
    techniciansAvailable: 2120,
    popularServices: [
      'Modular Kitchen Cabinets Repair',
      'Main Door Lock & Handle Installation',
      'Bed, Sofa & Wardrobe Assembly',
      'Wood Polishing & PU Lacquer',
      'Termite Wood Treatment & Replacement',
      'Window Meshing & Sliding Track'
    ]
  },
  {
    id: 'appliance-repair',
    name: 'AC & Appliance Repair',
    hindiName: 'एसी व उपकरण रिपेयर (Appliance Repair)',
    iconName: 'AirVent',
    description: 'AC gas refill, compressor fix, washing machine, refrigerator, microwave & chimney.',
    avgResponseTime: '20-35 mins',
    techniciansAvailable: 3100,
    popularServices: [
      'Split / Window AC Deep Jet Cleaning',
      'AC Gas Leakage & Refilling (R32/R410)',
      'Washing Machine Drum & PCB Repair',
      'Single/Double Door Refrigerator Cooling',
      'Kitchen Chimney Degreasing Service',
      'Microwave Oven Magnetron Replacement'
    ]
  },
  {
    id: 'painter',
    name: 'House Painter & Polish',
    hindiName: 'रंगाई व पुट्टी कारीगर (Painter)',
    iconName: 'Paintbrush',
    description: 'Interior & exterior wall painting, waterproof putty, texture design & wood stain.',
    avgResponseTime: 'Scheduled',
    techniciansAvailable: 1950,
    popularServices: [
      'Complete Home Waterproof Putty & Primer',
      'Texture Wall & Metallic Accent Design',
      'Exterior Weather-Proof Painting',
      'Anti-Dampness & Seepage Treatment',
      'Door & Window Enamel Painting',
      'Melamine & PU Wood Polishing'
    ]
  },
  {
    id: 'mason-construction',
    name: 'Mason & Tiles (Raj Mistri)',
    hindiName: 'राजमिस्त्री व टाइल्स कारीगर (Mason)',
    iconName: 'BrickWall',
    description: 'Floor tiling, wall plaster, brickwork, marble fitting, renovation & structural repair.',
    avgResponseTime: 'Scheduled',
    techniciansAvailable: 2480,
    popularServices: [
      'Vitrified Floor Tiles & Wall Cladding',
      'Italian Marble Laying & Diamond Polish',
      'Bathroom Renovation & Slope Correction',
      'Brick Masonry & Cement Plastering',
      'Terrace Waterproofing & Kota Stone',
      'Boundary Wall & Gate Pillar Work'
    ]
  },
  {
    id: 'welder-fabricator',
    name: 'Welder & Fabrication',
    hindiName: 'वेल्डिंग व ग्रिल मिस्त्री (Fabricator)',
    iconName: 'Flame',
    description: 'Iron gates, balcony grills, rolling shutters, stainless steel railings & sheds.',
    avgResponseTime: '30-60 mins',
    techniciansAvailable: 1420,
    popularServices: [
      'Balcony Safety Grill & Window Frame',
      'Heavy-Duty Rolling Shutter Repair',
      'Stainless Steel (SS 304) Stair Railing',
      'Rooftop Tin Shed & Truss Fabrication',
      'Main Gate Hinge & Lock Welding',
      'Custom Metal Racks & Industrial Work'
    ]
  },
  {
    id: 'cctv-security',
    name: 'CCTV & Security Tech',
    hindiName: 'सीसीटीवी व सुरक्षा सिस्टम (CCTV Tech)',
    iconName: 'ShieldCheck',
    description: 'IP & HD CCTV installation, DVR/NVR configuration, intercom, video doorbell.',
    avgResponseTime: '25-45 mins',
    techniciansAvailable: 1180,
    popularServices: [
      '4K IP / HD Camera Setup & Cabling',
      'Mobile Live View App Configuration',
      'Video Doorbell & Electronic Smart Lock',
      'Biometric Attendance Machine Setup',
      'Intercom & EPABX Office Wiring',
      'Night-Vision Camera Angle Correction'
    ]
  },
  {
    id: 'cleaning-pest',
    name: 'Deep Cleaning & Pest Control',
    hindiName: 'सफाई व पेस्ट कंट्रोल (Cleaning)',
    iconName: 'Sparkles',
    description: 'Full home deep cleaning, sofa shampooing, termite drill treatment, cockroach herbal paste.',
    avgResponseTime: '1-2 hours',
    techniciansAvailable: 1650,
    popularServices: [
      'Full Flat Deep Sanitization & Buffing',
      'Sofa & Mattress Foam Wash Extraction',
      'Commercial Termite Piping & Drill',
      'Cockroach & Ant Gel Infestation Cure',
      'Kitchen Oil Stain & Degrease Scrub',
      'Water Tank Chemical-Free Sludge Wash'
    ]
  },
  {
    id: 'mechanic',
    name: 'Auto & Two-Wheeler Mechanic',
    hindiName: 'ऑटो व बाइक मैकेनिक (Mechanic)',
    iconName: 'Wrench',
    description: 'On-spot roadside breakdown assistance, battery jump-start, oil change & puncture repair.',
    avgResponseTime: '15-25 mins',
    techniciansAvailable: 2310,
    popularServices: [
      '24/7 Roadside Battery Jump-Start',
      'Tubeless Tyre Puncture & Air Check',
      'Car Engine Diagnostic & Brake Pad Check',
      'Bike Carburetor & Chain Lubrication',
      'Emergency Towing & Fuel Top-up',
      'Clutch Cable & Alternator Repair'
    ]
  }
];

type AdditionalCategory = { id: string; name: string };

const ADDITIONAL_ACTIVE_CATEGORIES: AdditionalCategory[] = [
  { id: 'carpenter', name: 'Carpenter' },
  { id: 'civil-contractor', name: 'Civil Contractor' },
  { id: 'electrician', name: 'Electrician' },
  { id: 'cc-camera-and-security-devices', name: 'CC Camera & Security Devices' },
  { id: 'ac-repair', name: 'AC Repair' },
  { id: 'tv-and-home-theater-repair-music-system-speakers', name: 'TV & Home Theater Repair (Music System, Speakers)' },
  { id: 'plumber', name: 'Plumber' },
  { id: 'painter-trade', name: 'Painter' },
  { id: 'car-mechanic', name: 'Car Mechanic' },
  { id: 'bike-scooty-bullet-mechanic', name: 'Bike/ Scooty/Bullet Mechanic' },
  { id: 'welder', name: 'Welder' },
  { id: 'inverter-and-battery-mechanic', name: 'Inverter and Battery Mechanic' },
  { id: 'desktop-laptop-technician', name: 'Desktop, Laptop Technician' },
  { id: 'printer-technician', name: 'Printer Technician' },
  { id: 'digital-and-slr-camera', name: 'Digital & SLR Camera' },
  { id: 'tiles-mistri', name: 'Tiles Mistri' },
  { id: 'raaj-mistri', name: 'Raaj Mistri' },
  { id: 'raj-mistri-bengali', name: 'রাজ মিস্ত্রি' },
  { id: 'mobile-and-tab-repair', name: 'Mobile & Tab Repair' },
  { id: 'interior-designer', name: 'Interior Designer' },
  { id: 'shutter-repair', name: 'Shutter Repair' },
  { id: 'revolving-chair-repair', name: 'Revolving Chair Repair' },
  { id: 'lan-networking-wifi', name: 'Lan, Networking, WIFI' },
  { id: 'curtain-and-drapery-repair', name: 'Curtain & Drapery Repair' },
  { id: 'wallpapering-services', name: 'Wallpapering Services' },
  { id: 'water-purifier-ro-repair', name: 'Water Purifier - RO Repair' },
  { id: 'geyser-mechanic', name: 'Geyser Mechanic' },
  { id: 'washing-machine-and-refrigerator-technician', name: 'Washing Machine & Refrigerator Technician' },
  { id: 'aluminium-section-and-steel-expert', name: 'Aluminium Section & Steel Expert' },
  { id: 'photo-copy-machine-technician-xerox', name: 'Photo Copy Machine Technician (Xerox)' },
  { id: 'upvc-windows-and-door-manufacturer', name: 'UPVC Windows & Door Manufacturer' },
  { id: 'car-designer', name: 'Car Designer' },
  { id: 'projector-repair', name: 'Projector Repair' },
  { id: 'roof-fitting-expert', name: 'Roof Fitting Expert' },
  { id: 'interactive-digital-board-expert', name: 'Interactive Digital Board Expert' },
  { id: 'winding-works-technician-expert', name: 'Winding Works Technician / Expert' },
  { id: 'weighing-machine-expert', name: 'Weighing Machine Expert' },
  { id: 'water-treatment-plant', name: 'Water Treatment Plant' },
  { id: 'swiming-pool-expert', name: 'Swiming Pool Expert' },
  { id: 'solar-expert', name: 'Solar Expert' },
  { id: 'water-fountain-mechanic', name: 'Water Fountain Mechanic' },
  { id: 'wheel-balancing-alighnment-expert', name: 'Wheel Balancing Alighnment Expert' },
  { id: 'generator-repair', name: 'Generator Repair' },
  { id: 'treadmill-technician', name: 'Treadmill Technician' },
  { id: 'cycle-mechanic', name: 'Cycle Mechanic' },
  { id: 'cobler', name: 'COBLER' },
  { id: 'sofa-manufacturing-and-repair', name: 'Sofa Manufacturing & Repair' },
  { id: 'car-bike-gps-and-android-player-expert', name: 'CAR/BIKE GPS & ANDROID PLAYER EXPERT' },
  { id: 'ups-repair-technician', name: 'Ups Repair Technician' },
  { id: 'mochi-cobbler', name: 'MOCHI COBBLER' },
  { id: 'welder-fabrication', name: 'Welder & fabrication' },
  { id: 'transformer-repairing-technician', name: 'Transformer repairing Technician' },
  { id: 'vending-tea-and-cofee-machine-repair', name: 'Vending Tea & cofee machine repair' },
  { id: 'ceiling-mistri', name: 'Ceiling mistri' },
  { id: 'truck-mechanic-hmv', name: 'Truck mechanic HMV' },
  { id: 'chimney', name: 'Chimney' },
  { id: 'cloth', name: 'Tailor' },
  { id: 'computer-mobile-repair', name: 'Computer & Mobile Repair' },
];

const categoryKey = (name: string) => name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-IN');
const categoryNames = new Set(FEATURED_CATEGORIES.map((category) => categoryKey(category.name)));

export const SERVICE_CATEGORIES: ServiceCategory[] = [...FEATURED_CATEGORIES];
for (const category of ADDITIONAL_ACTIVE_CATEGORIES) {
  const key = categoryKey(category.name);
  if (categoryNames.has(key)) continue;
  categoryNames.add(key);
  SERVICE_CATEGORIES.push({
    id: category.id,
    name: category.name,
    hindiName: category.name,
    iconName: 'Wrench',
    description: `${category.name} services from local professionals.`,
    avgResponseTime: 'Contact provider',
    techniciansAvailable: 0,
    popularServices: [],
  });
}
