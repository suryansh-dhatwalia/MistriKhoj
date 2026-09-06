import { StateLocationInfo, SupportedState } from '../types';

export const SUPPORTED_STATES: StateLocationInfo[] = [
  {
    name: 'Arunachal Pradesh',
    code: 'AR',
    regionalTitle: 'अरुणाचल प्रदेश',
    tagline: 'Land of Dawn-Lit Mountains',
    cities: [
      'Itanagar',
      'Naharlagun',
      'Pasighat',
      'Tawang',
      'Ziro',
      'Roing',
      'Bomdila',
      'Tezu',
      'Namsai',
      'Aalo'
    ],
    activeTechniciansCount: 380
  },
  {
    name: 'Assam',
    code: 'AS',
    regionalTitle: 'অসম / असम',
    tagline: 'Gateway to Northeast India',
    cities: [
      'Guwahati',
      'Dibrugarh',
      'Silchar',
      'Jorhat',
      'Tezpur',
      'Nagaon',
      'Tinsukia',
      'Bongaigaon',
      'Sivasagar',
      'Karimganj',
      'Goalpara',
      'North Lakhimpur'
    ],
    activeTechniciansCount: 1450
  },
  {
    name: 'Maharashtra',
    code: 'MH',
    regionalTitle: 'महाराष्ट्र',
    tagline: 'Financial & Industrial Capital',
    cities: [
      'Mumbai',
      'Pune',
      'Nagpur',
      'Nashik',
      'Aurangabad (Chh. Sambhajinagar)',
      'Thane',
      'Kolhapur',
      'Solapur',
      'Navi Mumbai',
      'Amravati',
      'Nanded',
      'Sangli'
    ],
    activeTechniciansCount: 4200
  },
  {
    name: 'Meghalaya',
    code: 'ML',
    regionalTitle: 'मेघालय / Abode of Clouds',
    tagline: 'Scotland of the East',
    cities: [
      'Shillong',
      'Tura',
      'Jowai',
      'Nongpoh',
      'Cherrapunji (Sohra)',
      'Williamnagar',
      'Baghmara',
      'Mairang',
      'Nongstoin',
      'Resubelpara'
    ],
    activeTechniciansCount: 420
  },
  {
    name: 'Nagaland',
    code: 'NL',
    regionalTitle: 'नागालैंड / Land of Festivals',
    tagline: 'Falcon Capital of the World',
    cities: [
      'Kohima',
      'Dimapur',
      'Mokokchung',
      'Tuensang',
      'Wokha',
      'Zunheboto',
      'Mon',
      'Phek',
      'Chumukedima',
      'Peren'
    ],
    activeTechniciansCount: 340
  },
  {
    name: 'Rajasthan',
    code: 'RJ',
    regionalTitle: 'राजस्थान',
    tagline: 'Land of Royal Heritage & Craft',
    cities: [
      'Jaipur',
      'Jodhpur',
      'Udaipur',
      'Kota',
      'Bikaner',
      'Ajmer',
      'Alwar',
      'Bhilwara',
      'Sikar',
      'Sri Ganganagar',
      'Pali',
      'Bharatpur'
    ],
    activeTechniciansCount: 2890
  },
  {
    name: 'Uttar Pradesh',
    code: 'UP',
    regionalTitle: 'उत्तर प्रदेश',
    tagline: 'Heartland of India',
    cities: [
      'Lucknow',
      'Kanpur',
      'Varanasi',
      'Agra',
      'Prayagraj',
      'Noida',
      'Ghaziabad',
      'Meerut',
      'Gorakhpur',
      'Bareilly',
      'Aligarh',
      'Moradabad',
      'Saharanpur',
      'Jhansi'
    ],
    activeTechniciansCount: 4850
  },
  {
    name: 'West Bengal',
    code: 'WB',
    regionalTitle: 'পশ্চিমবঙ্গ / पश्चिम बंगाल',
    tagline: 'Cultural Capital & Hub of Eastern India',
    cities: [
      'Kolkata',
      'Siliguri',
      'Asansol',
      'Durgapur',
      'Howrah',
      'Darjeeling',
      'Kharagpur',
      'Malda',
      'Bardhaman',
      'Jalpaiguri',
      'Baharampur',
      'Haldia'
    ],
    activeTechniciansCount: 3200
  }
];

export const getCitiesForState = (stateName: SupportedState | string): string[] => {
  const found = SUPPORTED_STATES.find(s => s.name === stateName);
  return found ? found.cities : [];
};
