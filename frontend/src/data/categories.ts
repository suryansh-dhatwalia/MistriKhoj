import { ServiceCategory } from '../types';

export const SERVICE_CATEGORIES: ServiceCategory[] = [
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
