/**
 * Mock navigation data for the FMC.
 * In production, this would be loaded from a Navigraph or Aerosoft database.
 */

// ============================================================================
// AIRPORTS — 150 total (top 50 US + all 50 states + 50 international)
// ============================================================================

export const AIRPORTS: Record<string, { name: string; lat: number; lon: number; runways: string[] }> = {
  // --- Top 50 US airports by passenger volume ---
  KATL: {
    name: 'Hartsfield-Jackson Atlanta Intl',
    lat: 33.6407,
    lon: -84.4277,
    runways: ['08L', '08R', '09L', '09R', '10', '26L', '26R', '27L', '27R', '28'],
  },
  KDFW: {
    name: 'Dallas-Fort Worth Intl',
    lat: 32.8998,
    lon: -97.0403,
    runways: ['13L', '13R', '17L', '17C', '17R', '18L', '18R', '31L', '31R', '35L', '35C', '35R', '36L', '36R'],
  },
  KDEN: {
    name: 'Denver Intl',
    lat: 39.8561,
    lon: -104.6737,
    runways: ['07', '08', '16L', '16R', '17L', '17R', '25', '26', '34L', '34R', '35L', '35R'],
  },
  KORD: {
    name: 'OHare Intl',
    lat: 41.9742,
    lon: -87.9073,
    runways: ['04L', '04R', '09L', '09R', '10C', '10L', '10R', '22L', '22R', '27L', '27R', '28C', '28L', '28R'],
  },
  KLAX: {
    name: 'Los Angeles Intl',
    lat: 33.9425,
    lon: -118.4081,
    runways: ['06L', '06R', '07L', '07R', '24L', '24R', '25L', '25R'],
  },
  KJFK: {
    name: 'John F Kennedy Intl',
    lat: 40.6413,
    lon: -73.7781,
    runways: ['04L', '04R', '13L', '13R', '22L', '22R', '31L', '31R'],
  },
  KLAS: {
    name: 'Harry Reid Intl',
    lat: 36.084,
    lon: -115.1537,
    runways: ['01L', '01R', '08L', '08R', '19L', '19R', '26L', '26R'],
  },
  KMCO: {
    name: 'Orlando Intl',
    lat: 28.4294,
    lon: -81.3089,
    runways: ['17L', '17R', '18L', '18R', '35L', '35R', '36L', '36R'],
  },
  KMIA: {
    name: 'Miami Intl',
    lat: 25.7959,
    lon: -80.287,
    runways: ['08L', '08R', '09', '12', '26L', '26R', '27', '30'],
  },
  KCLT: {
    name: 'Charlotte Douglas Intl',
    lat: 35.214,
    lon: -80.9431,
    runways: ['18C', '18L', '18R', '36C', '36L', '36R'],
  },
  KSEA: {
    name: 'Seattle-Tacoma Intl',
    lat: 47.4502,
    lon: -122.3088,
    runways: ['16L', '16C', '16R', '34L', '34C', '34R'],
  },
  KEWR: { name: 'Newark Liberty Intl', lat: 40.6895, lon: -74.1745, runways: ['04L', '04R', '11', '22L', '22R', '29'] },
  KSFO: {
    name: 'San Francisco Intl',
    lat: 37.6213,
    lon: -122.379,
    runways: ['01L', '01R', '10L', '10R', '19L', '19R', '28L', '28R'],
  },
  KPHX: {
    name: 'Phoenix Sky Harbor Intl',
    lat: 33.4343,
    lon: -112.0116,
    runways: ['07L', '07R', '08', '25L', '25R', '26'],
  },
  KIAH: {
    name: 'George Bush Intercontinental',
    lat: 29.9902,
    lon: -95.3368,
    runways: ['08L', '08R', '09', '15L', '15R', '26L', '26R', '27', '33L', '33R'],
  },
  KBOS: {
    name: 'Boston Logan Intl',
    lat: 42.3656,
    lon: -71.0096,
    runways: ['04L', '04R', '09', '14', '15L', '15R', '22L', '22R', '27', '33L', '33R'],
  },
  KFLL: {
    name: 'Fort Lauderdale-Hollywood Intl',
    lat: 26.0726,
    lon: -80.1524,
    runways: ['09L', '09R', '10L', '10R', '27L', '27R', '28L', '28R'],
  },
  KMSP: {
    name: 'Minneapolis-St Paul Intl',
    lat: 44.882,
    lon: -93.2218,
    runways: ['04', '12L', '12R', '17', '22', '30L', '30R'],
  },
  KLGA: { name: 'LaGuardia', lat: 40.7769, lon: -73.874, runways: ['04', '13', '22', '31'] },
  KDTW: {
    name: 'Detroit Metro Wayne County',
    lat: 42.2124,
    lon: -83.3534,
    runways: ['03', '04L', '04R', '09L', '09R', '21', '22L', '22R', '27L', '27R'],
  },
  KPHL: {
    name: 'Philadelphia Intl',
    lat: 39.8744,
    lon: -75.2428,
    runways: ['08', '09L', '09R', '17', '26', '27L', '27R', '35'],
  },
  KBWI: {
    name: 'Baltimore-Washington Intl',
    lat: 39.1754,
    lon: -76.6683,
    runways: ['10', '15L', '15R', '28', '33L', '33R'],
  },
  KDCA: {
    name: 'Ronald Reagan Washington Natl',
    lat: 38.8512,
    lon: -77.0402,
    runways: ['01', '04', '15', '19', '22', '33'],
  },
  KSAN: { name: 'San Diego Intl', lat: 32.7336, lon: -117.1897, runways: ['09', '27'] },
  KMDW: {
    name: 'Chicago Midway Intl',
    lat: 41.7868,
    lon: -87.7522,
    runways: ['04L', '04R', '13C', '13L', '13R', '22L', '22R', '31C', '31L', '31R'],
  },
  KTPA: { name: 'Tampa Intl', lat: 27.9755, lon: -82.5333, runways: ['01L', '01R', '10', '19L', '19R', '28'] },
  KPDX: { name: 'Portland Intl', lat: 45.5898, lon: -122.5951, runways: ['03', '10L', '10R', '21', '28L', '28R'] },
  PHNL: {
    name: 'Daniel K Inouye Intl',
    lat: 21.3245,
    lon: -157.9251,
    runways: ['04L', '04R', '08L', '08R', '26L', '26R'],
  },
  KBNA: {
    name: 'Nashville Intl',
    lat: 36.1263,
    lon: -86.6774,
    runways: ['02L', '02C', '02R', '13', '20L', '20C', '20R', '31'],
  },
  KAUS: {
    name: 'Austin-Bergstrom Intl',
    lat: 30.1975,
    lon: -97.6664,
    runways: ['17L', '17R', '18L', '18R', '35L', '35R', '36L', '36R'],
  },
  KSTL: { name: 'St Louis Lambert Intl', lat: 38.7487, lon: -90.37, runways: ['06', '11', '12R', '24', '29', '30L'] },
  KSLC: {
    name: 'Salt Lake City Intl',
    lat: 40.7883,
    lon: -111.9778,
    runways: ['14', '16L', '16R', '17', '34L', '34R', '35'],
  },
  KMCI: { name: 'Kansas City Intl', lat: 39.2976, lon: -94.7139, runways: ['01L', '01R', '09', '19L', '19R', '27'] },
  KRDU: { name: 'Raleigh-Durham Intl', lat: 35.8801, lon: -78.788, runways: ['05L', '05R', '14', '23L', '23R', '32'] },
  KSMF: {
    name: 'Sacramento Intl',
    lat: 38.6951,
    lon: -121.5901,
    runways: ['08L', '08R', '17L', '17R', '26L', '26R', '35'],
  },
  KMSY: { name: 'New Orleans Louis Armstrong Intl', lat: 29.9934, lon: -90.258, runways: ['02', '11', '20', '29'] },
  KSJC: { name: 'San Jose Intl', lat: 37.3639, lon: -121.9289, runways: ['11', '12L', '12R', '30L', '30R'] },
  KOAK: {
    name: 'San Francisco Bay Oakland Intl',
    lat: 37.7214,
    lon: -122.2208,
    runways: ['10L', '10R', '11', '28L', '28R', '29'],
  },
  KSNA: { name: 'John Wayne', lat: 33.6757, lon: -117.8682, runways: ['02L', '02R', '20L', '20R'] },
  KSAT: { name: 'San Antonio Intl', lat: 29.5337, lon: -98.4698, runways: ['04', '13L', '13R', '22', '31L', '31R'] },
  KCLE: {
    name: 'Cleveland Hopkins Intl',
    lat: 41.4117,
    lon: -81.8498,
    runways: ['06L', '06R', '10', '24L', '24R', '28'],
  },
  KPIT: { name: 'Pittsburgh Intl', lat: 40.4915, lon: -80.2329, runways: ['10L', '10R', '14', '28L', '28R', '32'] },
  KIND: { name: 'Indianapolis Intl', lat: 39.7173, lon: -86.2944, runways: ['05L', '05R', '14', '23L', '23R', '32'] },
  KCMH: { name: 'John Glenn Columbus Intl', lat: 39.998, lon: -82.8919, runways: ['10L', '10R', '28L', '28R'] },
  KCVG: {
    name: 'Cincinnati/Northern Kentucky Intl',
    lat: 39.0533,
    lon: -84.663,
    runways: ['09', '18C', '18L', '18R', '27', '36C', '36L', '36R'],
  },
  KMKE: {
    name: 'Milwaukee Mitchell Intl',
    lat: 42.9476,
    lon: -87.8969,
    runways: ['01L', '01R', '07L', '07R', '13', '19L', '19R', '25L', '25R', '31'],
  },
  KJAX: { name: 'Jacksonville Intl', lat: 30.4941, lon: -81.6879, runways: ['08', '14', '26', '32'] },
  KRSW: { name: 'Southwest Florida Intl', lat: 26.5362, lon: -81.7552, runways: ['06', '14', '24', '32'] },
  PHOG: { name: 'Kahului', lat: 20.8986, lon: -156.4305, runways: ['02', '05', '20', '23'] },
  KBUF: { name: 'Buffalo Niagara Intl', lat: 42.9405, lon: -78.7322, runways: ['05', '14', '23', '32'] },
  KIAD: {
    name: 'Washington Dulles Intl',
    lat: 38.9531,
    lon: -77.4565,
    runways: ['01L', '01R', '01C', '12', '19L', '19R', '19C', '30'],
  },
  KPBI: { name: 'Palm Beach Intl', lat: 26.6831, lon: -80.0956, runways: ['10L', '10R', '14', '28L', '28R', '32'] },
  KSRQ: { name: 'Sarasota-Bradenton Intl', lat: 27.3954, lon: -82.5544, runways: ['04', '14', '22', '32'] },
  KGEG: { name: 'Spokane Intl', lat: 47.619, lon: -117.5338, runways: ['03', '07', '21', '25'] },
  KELP: { name: 'El Paso Intl', lat: 31.8072, lon: -106.3776, runways: ['04', '08', '22', '26'] },
  KMEM: {
    name: 'Memphis Intl',
    lat: 35.214,
    lon: -89.977,
    runways: ['09', '18C', '18L', '18R', '27', '36C', '36L', '36R'],
  },
  KTUL: { name: 'Tulsa Intl', lat: 36.1984, lon: -95.8881, runways: ['08', '18L', '18R', '26'] },
  KGRR: { name: 'Gerald R Ford Intl', lat: 42.8808, lon: -85.5228, runways: ['08', '17', '26', '35'] },
  KDAY: { name: 'Dayton Intl', lat: 39.9023, lon: -84.2194, runways: ['06L', '06R', '18', '24L', '24R', '36'] },
  KCID: { name: 'The Eastern Iowa', lat: 41.8847, lon: -91.7108, runways: ['09', '13', '27', '31'] },
  KDLH: { name: 'Duluth Intl', lat: 46.8421, lon: -92.1936, runways: ['03', '09', '21', '27'] },
  KCHA: { name: 'Chattanooga Metropolitan', lat: 35.0353, lon: -85.2038, runways: ['02', '20'] },

  // --- Remaining US states (1 per state not already covered above) ---
  KBHM: { name: 'Birmingham-Shuttlesworth Intl', lat: 33.5629, lon: -86.7525, runways: ['06', '18', '24', '36'] },
  PANC: {
    name: 'Ted Stevens Anchorage Intl',
    lat: 61.1743,
    lon: -149.9983,
    runways: ['07L', '07R', '15', '25L', '25R', '33'],
  },
  KLIT: {
    name: 'Bill and Hillary Clinton National',
    lat: 34.7294,
    lon: -92.2242,
    runways: ['04L', '04R', '22L', '22R'],
  },
  KBDL: { name: 'Bradley Intl', lat: 41.9389, lon: -72.6832, runways: ['06', '15', '24', '33'] },
  KILG: { name: 'New Castle', lat: 39.6787, lon: -75.6065, runways: ['01', '09', '14', '27', '32'] },
  KBOI: { name: 'Boise Air Terminal', lat: 43.5644, lon: -116.2228, runways: ['10L', '10R', '28L', '28R'] },
  KDSM: { name: 'Des Moines Intl', lat: 41.534, lon: -93.6631, runways: ['05', '13', '23', '31'] },
  KICT: {
    name: 'Wichita Dwight D Eisenhower National',
    lat: 37.6499,
    lon: -97.4331,
    runways: ['01L', '01R', '14', '19L', '19R', '32'],
  },
  KPWM: { name: 'Portland Intl Jetport', lat: 43.6462, lon: -70.3093, runways: ['11', '18', '29', '36'] },
  KJAN: { name: 'Jackson-Medgar Wiley Evers Intl', lat: 32.3112, lon: -90.0759, runways: ['16L', '16R', '34L', '34R'] },
  KBZN: { name: 'Bozeman Yellowstone Intl', lat: 45.7776, lon: -111.16, runways: ['03', '11', '28', '36'] },
  KOMA: { name: 'Eppley Airfield', lat: 41.3012, lon: -95.8945, runways: ['14L', '14R', '32L', '32R'] },
  KMHT: { name: 'Manchester-Boston Regional', lat: 42.9326, lon: -71.4357, runways: ['06', '17', '24', '35'] },
  KABQ: {
    name: 'Albuquerque Intl Sunport',
    lat: 35.0402,
    lon: -106.609,
    runways: ['03', '08', '12', '17', '21', '26', '30', '35'],
  },
  KFAR: { name: 'Hector Intl', lat: 46.9207, lon: -96.8184, runways: ['09', '13', '18', '27', '31', '36'] },
  KOKC: {
    name: 'Will Rogers World',
    lat: 35.3931,
    lon: -97.6007,
    runways: ['13L', '13R', '17L', '17R', '31L', '31R', '35L', '35R'],
  },
  KPVD: { name: 'T.F. Green', lat: 41.7258, lon: -71.4394, runways: ['05', '16', '23', '34'] },
  KCHS: { name: 'Charleston Intl', lat: 32.8986, lon: -80.0405, runways: ['03', '15', '21', '33'] },
  KFSD: { name: 'Sioux Falls Regional', lat: 43.582, lon: -96.7419, runways: ['03', '15', '21', '33'] },
  KBTV: { name: 'Burlington Intl', lat: 44.4719, lon: -73.1531, runways: ['01', '15', '19', '33'] },
  KCRW: { name: 'Yeager', lat: 38.3731, lon: -81.5932, runways: ['05', '15', '23', '33'] },
  KJAC: { name: 'Jackson Hole', lat: 43.6073, lon: -110.7377, runways: ['01', '19'] },

  // --- International (50 airports) ---
  EGLL: { name: 'London Heathrow', lat: 51.47, lon: -0.4543, runways: ['09L', '09R', '27L', '27R'] },
  LFPG: {
    name: 'Paris Charles de Gaulle',
    lat: 49.0097,
    lon: 2.5479,
    runways: ['08L', '08R', '09L', '09R', '26L', '26R', '27L', '27R'],
  },
  EDDF: {
    name: 'Frankfurt',
    lat: 50.0379,
    lon: 8.5622,
    runways: ['07L', '07C', '07R', '18', '25L', '25C', '25R', '36'],
  },
  EHAM: {
    name: 'Amsterdam Schiphol',
    lat: 52.3105,
    lon: 4.7683,
    runways: ['04', '06', '09', '18C', '18L', '18R', '22', '24', '27', '36C', '36L', '36R'],
  },
  LEMD: {
    name: 'Madrid Barajas',
    lat: 40.4983,
    lon: -3.5676,
    runways: ['14L', '14R', '18L', '18R', '32L', '32R', '36L', '36R'],
  },
  LIRF: { name: 'Rome Fiumicino', lat: 41.8003, lon: 12.2389, runways: ['07', '16L', '16R', '25', '34L', '34R'] },
  EDDM: { name: 'Munich', lat: 48.3538, lon: 11.7861, runways: ['08L', '08R', '26L', '26R'] },
  LSZH: { name: 'Zurich', lat: 47.4647, lon: 8.5492, runways: ['10', '14', '16', '28', '32', '34'] },
  LOWW: { name: 'Vienna', lat: 48.1103, lon: 16.5697, runways: ['11', '16', '29', '34'] },
  LTFM: {
    name: 'Istanbul',
    lat: 41.2753,
    lon: 28.7519,
    runways: ['16L', '16R', '17L', '17R', '18', '34L', '34R', '35L', '35R', '36'],
  },
  EGKK: { name: 'London Gatwick', lat: 51.1481, lon: -0.1903, runways: ['08L', '08R', '26L', '26R'] },
  LEBL: { name: 'Barcelona', lat: 41.2974, lon: 2.0833, runways: ['02', '07L', '07R', '25L', '25R'] },
  EBBR: { name: 'Brussels', lat: 50.901, lon: 4.4844, runways: ['01', '07L', '07R', '19', '25L', '25R'] },
  LSGG: { name: 'Geneva', lat: 46.2381, lon: 6.1089, runways: ['04', '22'] },
  EIDW: { name: 'Dublin', lat: 53.4213, lon: -6.2701, runways: ['10L', '10R', '16', '28L', '28R', '34'] },
  OMDB: { name: 'Dubai Intl', lat: 25.2532, lon: 55.3657, runways: ['12L', '12R', '30L', '30R'] },
  OTHH: { name: 'Doha Hamad Intl', lat: 25.2731, lon: 51.6081, runways: ['16L', '16R', '17L', '17R', '34L', '34R'] },
  OERK: { name: 'Riyadh King Khalid Intl', lat: 24.9576, lon: 46.6988, runways: ['15L', '15R', '33L', '33R'] },
  OJAI: { name: 'Amman Queen Alia Intl', lat: 31.7225, lon: 35.9932, runways: ['08L', '08R', '26L', '26R'] },
  OBBI: { name: 'Bahrain Intl', lat: 26.2708, lon: 50.6336, runways: ['12L', '12R', '30L', '30R'] },
  OKBK: { name: 'Kuwait Intl', lat: 29.2266, lon: 47.9689, runways: ['15L', '15R', '33L', '33R'] },
  WSSS: { name: 'Singapore Changi', lat: 1.3644, lon: 103.9915, runways: ['02L', '02R', '20C', '20L', '20R'] },
  VHHH: { name: 'Hong Kong Intl', lat: 22.308, lon: 113.9185, runways: ['07L', '07R', '25L', '25R'] },
  RJAA: { name: 'Tokyo Narita Intl', lat: 35.7647, lon: 140.3864, runways: ['16L', '16R', '34L', '34R'] },
  RJTT: {
    name: 'Tokyo Haneda',
    lat: 35.5494,
    lon: 139.7798,
    runways: ['04', '05', '16L', '16R', '22', '23', '34L', '34R'],
  },
  RKSI: { name: 'Seoul Incheon Intl', lat: 37.4691, lon: 126.4505, runways: ['15L', '15R', '16', '33L', '33R', '34'] },
  ZBAA: { name: 'Beijing Capital Intl', lat: 40.0799, lon: 116.6031, runways: ['01', '18L', '18R', '36L', '36R'] },
  ZSPD: {
    name: 'Shanghai Pudong Intl',
    lat: 31.1443,
    lon: 121.8083,
    runways: ['16L', '16R', '17L', '17R', '34L', '34R', '35L', '35R'],
  },
  VVNB: { name: 'Hanoi Noi Bai Intl', lat: 21.2212, lon: 105.8071, runways: ['11L', '11R', '29L', '29R'] },
  VCBI: { name: 'Colombo Bandaranaike Intl', lat: 7.1808, lon: 79.8841, runways: ['04', '22'] },
  WIII: { name: 'Jakarta Soekarno-Hatta Intl', lat: -6.1256, lon: 106.6558, runways: ['07L', '07R', '25L', '25R'] },
  YSSY: {
    name: 'Sydney Kingsford Smith',
    lat: -33.9399,
    lon: 151.1753,
    runways: ['07', '16L', '16R', '25', '34L', '34R'],
  },
  YMML: { name: 'Melbourne Tullamarine', lat: -37.6733, lon: 144.8433, runways: ['09', '16', '27', '34'] },
  NZAA: { name: 'Auckland', lat: -37.0082, lon: 174.7917, runways: ['05L', '05R', '23L', '23R'] },
  SBGR: { name: 'Sao Paulo Guarulhos', lat: -23.4356, lon: -46.4731, runways: ['09L', '09R', '27L', '27R'] },
  SAEZ: { name: 'Buenos Aires Ezeiza', lat: -34.8222, lon: -58.5358, runways: ['11', '17', '29', '35'] },
  SPJC: { name: 'Lima Jorge Chavez', lat: -11.7861, lon: -77.1144, runways: ['15', '16', '33', '34'] },
  SCEL: { name: 'Santiago Arturo Merino Benitez', lat: -33.393, lon: -70.7858, runways: ['17L', '17R', '35L', '35R'] },
  FAOR: { name: 'Johannesburg OR Tambo', lat: -26.1392, lon: 28.246, runways: ['03L', '03R', '21L', '21R'] },
  HECA: { name: 'Cairo Intl', lat: 30.1219, lon: 31.4056, runways: ['05C', '05L', '05R', '23C', '23L', '23R'] },
  DNMM: { name: 'Lagos Murtala Muhammed', lat: 6.5774, lon: 3.3212, runways: ['18L', '18R', '36L', '36R'] },
  LEMG: { name: 'Malaga', lat: 36.6749, lon: -4.4991, runways: ['12', '13', '30', '31'] },
  EGPH: { name: 'Edinburgh', lat: 55.9508, lon: -3.3615, runways: ['06', '24'] },
  ENAL: { name: 'Alesund Vigra', lat: 62.5625, lon: 6.1194, runways: ['06', '24'] },
  ENAT: { name: 'Alta', lat: 69.9761, lon: 23.3717, runways: ['11', '29'] },
  ENBO: { name: 'Bodo', lat: 67.2692, lon: 14.3644, runways: ['07', '25'] },
  ENBR: { name: 'Bergen Flesland', lat: 60.2934, lon: 5.2181, runways: ['17', '35'] },
  ENCN: { name: 'Kristiansand Kjevik', lat: 58.2033, lon: 8.0853, runways: ['03', '21'] },
  ENDU: { name: 'Bardufoss', lat: 69.0558, lon: 18.5403, runways: ['10', '28'] },
  ENEV: { name: 'Harstad/Narvik Evenes', lat: 68.4897, lon: 16.6783, runways: ['17', '35'] },
  ENFL: { name: 'Floro', lat: 61.5833, lon: 5.025, runways: ['07', '25'] },
  ENGM: { name: 'Oslo Gardermoen', lat: 60.1939, lon: 11.1004, runways: ['01L', '01R', '19L', '19R'] },
  ENHD: { name: 'Haugesund Karmoy', lat: 59.3444, lon: 5.2136, runways: ['13', '31'] },
  ENHF: { name: 'Hammerfest', lat: 70.6794, lon: 23.6683, runways: ['04', '22'] },
  ENKB: { name: 'Kristiansund Kvernberget', lat: 63.1119, lon: 7.8267, runways: ['07', '25'] },
  ENKR: { name: 'Kirkenes Hoybuktmoen', lat: 69.7258, lon: 29.8889, runways: ['05', '23'] },
  ENML: { name: 'Molde Aro', lat: 62.7447, lon: 7.2628, runways: ['07', '25'] },
  ENTC: { name: 'Tromso Langnes', lat: 69.6814, lon: 18.9189, runways: ['18', '36'] },
  ENTO: { name: 'Sandefjord Torp', lat: 59.1867, lon: 10.2586, runways: ['18', '36'] },
  ENZV: { name: 'Stavanger Sola', lat: 58.8767, lon: 5.6378, runways: ['18', '36', '11', '29'] },
  ESSA: { name: 'Stockholm Arlanda', lat: 59.6518, lon: 17.9186, runways: ['01L', '01R', '08', '19L', '19R', '26'] },
  EKCH: { name: 'Copenhagen Kastrup', lat: 55.618, lon: 12.6561, runways: ['04L', '04R', '12', '22L', '22R', '30'] },
  EFHK: { name: 'Helsinki Vantaa', lat: 60.3172, lon: 24.9633, runways: ['04L', '04R', '15', '22L', '22R', '33'] },
  LROP: { name: 'Bucharest Henri Coanda', lat: 44.5711, lon: 26.0842, runways: ['08L', '08R', '26L', '26R'] },
  LGAV: { name: 'Athens Intl', lat: 37.9364, lon: 23.9445, runways: ['03L', '03R', '21L', '21R'] },
  LMML: { name: 'Malta Intl', lat: 35.8575, lon: 14.4775, runways: ['13', '31'] },
};

// ============================================================================
// WAYPOINTS — 83 total (33 existing + 50 new)
// ============================================================================

export const WAYPOINTS: Record<string, { lat: number; lon: number }> = {
  // --- Original waypoints ---
  RBV: { lat: 40.3682, lon: -74.4343 },
  LENDY: { lat: 39.875, lon: -75.25 },
  FRDMM: { lat: 39.5, lon: -75.75 },
  BETTE: { lat: 40.5, lon: -73.75 },
  JFK: { lat: 40.6333, lon: -73.7667 },
  DIXIE: { lat: 39.9722, lon: -75.1867 },
  MXE: { lat: 39.9, lon: -75.3167 },
  OTT: { lat: 38.75, lon: -76.8833 },
  AML: { lat: 38.9167, lon: -77.1167 },
  AYAZE: { lat: 42.5833, lon: -80.35 },
  BRNAN: { lat: 41.1833, lon: -75.9167 },
  CHAAP: { lat: 42.5167, lon: -79.25 },
  DORET: { lat: 41.75, lon: -75.5833 },
  EWC: { lat: 40.7833, lon: -80.2167 },
  FJC: { lat: 40.5167, lon: -74.5833 },
  GDM: { lat: 42.55, lon: -72.0167 },
  HNK: { lat: 41.5833, lon: -75.45 },
  IGN: { lat: 41.6667, lon: -74.0667 },
  JAIKE: { lat: 40.4667, lon: -75.4833 },
  KEYNN: { lat: 43.1, lon: -80.3333 },
  LRP: { lat: 40.1167, lon: -76.3 },
  MIP: { lat: 40.4167, lon: -75.0167 },
  PSB: { lat: 40.8333, lon: -78.0833 },
  RACKI: { lat: 41.15, lon: -76.0333 },
  SEG: { lat: 40.6167, lon: -76.85 },
  TRYBE: { lat: 44.0333, lon: -77.6833 },
  ULW: { lat: 42.05, lon: -77.15 },
  VILLA: { lat: 42.9167, lon: -79.9167 },
  WOZEE: { lat: 42.7333, lon: -78.85 },
  XR: { lat: 46.75, lon: -80.5833 },
  YQO: { lat: 42.5833, lon: -82.0667 },
  ZANDR: { lat: 44.2167, lon: -80.9167 },

  // --- 50 new waypoints (US + international) ---
  WHITE: { lat: 41.333, lon: -73.867 },
  MERIT: { lat: 40.933, lon: -73.6 },
  CIVET: { lat: 41.217, lon: -71.5 },
  DEEZZ: { lat: 40.6, lon: -74.0 },
  SHIPP: { lat: 41.0, lon: -71.8 },
  NELIE: { lat: 40.4, lon: -74.5 },
  VIKNG: { lat: 40.2, lon: -74.8 },
  BRAND: { lat: 41.5, lon: -73.833 },
  GREKI: { lat: 42.833, lon: -78.667 },
  LAKES: { lat: 42.0, lon: -80.0 },
  BUGSY: { lat: 41.667, lon: -72.833 },
  HARTF: { lat: 41.767, lon: -72.683 },
  ALB: { lat: 42.75, lon: -73.8 },
  SYR: { lat: 43.117, lon: -76.117 },
  ROC: { lat: 43.117, lon: -77.667 },
  BUF: { lat: 42.94, lon: -78.733 },
  BOS: { lat: 42.367, lon: -71.017 },
  MHT: { lat: 42.933, lon: -71.433 },
  PWM: { lat: 43.65, lon: -70.3 },
  BGR: { lat: 44.8, lon: -68.833 },
  BTV: { lat: 44.467, lon: -73.15 },
  PHL: { lat: 39.867, lon: -75.233 },
  PIT: { lat: 40.5, lon: -80.233 },
  CLE: { lat: 41.417, lon: -81.85 },
  CMH: { lat: 40.0, lon: -82.883 },
  CVG: { lat: 39.05, lon: -84.667 },
  IND: { lat: 39.717, lon: -86.3 },
  DTW: { lat: 42.217, lon: -83.35 },
  MKE: { lat: 42.95, lon: -87.9 },
  MSP: { lat: 44.883, lon: -93.217 },
  FAR: { lat: 46.917, lon: -96.817 },
  DSM: { lat: 41.533, lon: -93.65 },
  OMA: { lat: 41.3, lon: -95.9 },
  MCI: { lat: 39.3, lon: -94.717 },
  STL: { lat: 38.75, lon: -90.367 },
  LIT: { lat: 34.733, lon: -92.233 },
  TUL: { lat: 36.2, lon: -95.883 },
  OKC: { lat: 35.4, lon: -97.6 },
  DFW: { lat: 32.9, lon: -97.033 },
  IAH: { lat: 29.983, lon: -95.35 },
  AUS: { lat: 30.2, lon: -97.667 },
  SAT: { lat: 29.5337, lon: -98.467 },
  ELP: { lat: 31.8, lon: -106.4 },
  ABQ: { lat: 35.05, lon: -106.617 },
  DEN: { lat: 39.858, lon: -104.667 },
  COS: { lat: 38.8, lon: -104.7 },
  PHX: { lat: 33.433, lon: -112.017 },
  SAN: { lat: 32.7336, lon: -117.19 },
  SNA: { lat: 33.6757, lon: -117.867 },
  ROWSY: { lat: 46.52, lon: -122.4519 },

  // --- Procedure waypoints for major hubs ---
  SMKEY: { lat: 33.364, lon: -83.921 },
  MCDON: { lat: 33.442, lon: -84.148 },
  DAWGS: { lat: 33.567, lon: -84.453 },
  VRSTY: { lat: 33.742, lon: -84.582 },
  UGRAA: { lat: 33.865, lon: -84.712 },
  NEPTS: { lat: 33.987, lon: -84.842 },
  AVERY: { lat: 33.152, lon: -84.341 },
  BURNY: { lat: 33.284, lon: -84.212 },

  ORCKA: { lat: 34.012, lon: -118.512 },
  ZIGGY: { lat: 34.123, lon: -118.623 },
  ANJLL: { lat: 33.845, lon: -118.212 },

  ELX: { lat: 42.112, lon: -87.812 },
  BENKY: { lat: 41.812, lon: -87.612 },
  MYKIE: { lat: 41.712, lon: -87.512 },
};

// ============================================================================
// AIRWAYS — 30 total (10 existing + 20 new)
// ============================================================================

export const AIRWAYS: Record<string, string[]> = {
  // --- Original airways ---
  J42: ['RBV', 'LENDY', 'FRDMM'],
  J75: ['DIXIE', 'MXE', 'OTT'],
  J191: ['RBV', 'JFK', 'DIXIE'],
  J48: ['ODF', 'MACEY', 'FLO'],
  J6: ['RBV', 'BETTE', 'JFK'],
  V123: ['LENDY', 'FRDMM', 'DIXIE'],
  V229: ['MXE', 'AML', 'OTT'],
  V308: ['RBV', 'DIXIE', 'MXE'],
  Q42: ['RBV', 'LENDY', 'DIXIE'],
  Q97: ['MXE', 'OTT', 'AML'],

  // --- 20 new airways ---
  J1: ['BOS', 'PWM', 'BGR'],
  J2: ['PHL', 'JFK', 'BOS'],
  J3: ['DCA', 'PHL', 'JFK'],
  J4: ['ATL', 'CLT', 'DCA'],
  J5: ['MIA', 'ATL', 'DCA'],
  J8: ['ORD', 'DTW', 'BUF'],
  J9: ['ORD', 'CLE', 'PIT'],
  J10: ['DFW', 'OKC', 'TUL'],
  J12: ['DEN', 'COS', 'ABQ'],
  J14: ['PHX', 'ABQ', 'DEN'],
  J16: ['LAX', 'PHX', 'DEN'],
  J18: ['LAX', 'LAS', 'DEN'],
  J20: ['SFO', 'LAX', 'PHX'],
  J22: ['SEA', 'PDX', 'SFO'],
  J24: ['SEA', 'DEN', 'ORD'],
  J26: ['DFW', 'DEN', 'SEA'],
  J28: ['ATL', 'ORD', 'DFW'],
  J30: ['MIA', 'ATL', 'ORD'],
  J32: ['BOS', 'BUF', 'ORD'],
  J34: ['JFK', 'CLE', 'ORD'],
};

// ============================================================================
// SIDs / STARs — simplified names for top 20 airports
// ============================================================================

export const SID_STARS: Record<string, { sids: string[]; stars: string[] }> = {
  KATL: {
    sids: ['HARHS2', 'SMKEY2', 'VRSTY2', 'CHPPR2'],
    stars: ['AVERY2', 'BURNY2', 'CHARR2', 'FILDS2'],
  },
  KDFW: {
    sids: ['AKUNA2', 'BLEAK2', 'BOOVE2', 'BRDJE2'],
    stars: ['CROSS2', 'LOWGN2', 'NELYN2', 'SEEVR2'],
  },
  KDEN: {
    sids: ['BANNR1', 'DAWGS1', 'JEPP1', 'MESA1'],
    stars: ['GOLDN1', 'POWDR1', 'SLAMM1', 'TIMBR1'],
  },
  KORD: {
    sids: ['ELX1', 'NOLES1', 'OBENE1', 'RAPIC1'],
    stars: ['BENKY1', 'KUBBS1', 'MYKIE1', 'PINGG1'],
  },
  KLAX: {
    sids: ['ANDDE1', 'DEPP1', 'DRTHR1', 'GORM1'],
    stars: ['ANJLL1', 'PIRUE1', 'RYSMM1', 'ZUUMA1'],
  },
  KJFK: {
    sids: ['BETTE1', 'DEEZZ1', 'GAYEL1', 'ROBER1'],
    stars: ['CAMRN1', 'GANDR1', 'MERIT1', 'WHITE1'],
  },
  KLAS: {
    sids: ['BLD1', 'GRNPA1', 'KEENE1', 'NAVJO1'],
    stars: ['BLD1', 'GRNPA1', 'KEENE1', 'NAVJO1'],
  },
  KMCO: {
    sids: ['BAIRN1', 'LEESE1', 'MICKI1', 'OSBOU1'],
    stars: ['CYYON1', 'DAALE1', 'FFOOR1', 'MICKI1'],
  },
  KMIA: {
    sids: ['ANNEY1', 'FROGZ1', 'GWAVA1', 'HURCN1'],
    stars: ['ANNEY1', 'FROGZ1', 'GWAVA1', 'HURCN1'],
  },
  KCLT: {
    sids: ['BARMY1', 'BUDDD1', 'JOJO1', 'WEAZL1'],
    stars: ['BARBY1', 'BESTT1', 'KRITR1', 'WEAZL1'],
  },
  KSEA: {
    sids: ['BANGR1', 'ELMAA1', 'HAROB1', 'JAWBN1'],
    stars: ['ELMAA1', 'HAROB1', 'ISBRG1', 'SUMMA1'],
  },
  KEWR: {
    sids: ['BDR1', 'DIXIE1', 'WHITE1', 'ZIGGY1'],
    stars: ['ARD1', 'DIXIE1', 'MERIT1', 'WHITE1'],
  },
  KSFO: {
    sids: ['BDEGA1', 'DYAMD1', 'OFFSH1', 'SSTIK1'],
    stars: ['DEEZZ1', 'DYAMD1', 'OFFSH1', 'SSTIK1'],
  },
  KPHX: {
    sids: ['AVERY1', 'BRDJE1', 'COUNTRY1', 'DRK1'],
    stars: ['AVERY1', 'BRDJE1', 'COUNTRY1', 'DRK1'],
  },
  KIAH: {
    sids: ['BNDTO1', 'CBASS1', 'DRLLR1', 'FZOOL1'],
    stars: ['BLUBL1', 'GUSHR1', 'KOLLR1', 'TEJAS1'],
  },
  KBOS: {
    sids: ['BOSOX1', 'HYPER1', 'LINNG1', 'MINKS1'],
    stars: ['BOSOX1', 'HYPER1', 'LINNG1', 'MINKS1'],
  },
  KFLL: {
    sids: ['CYPRESS1', 'FROGZ1', 'GWAVA1', 'HURCN1'],
    stars: ['ANNEY1', 'CYPRESS1', 'FROGZ1', 'GWAVA1'],
  },
  KMSP: {
    sids: ['ALMAY1', 'BAINY1', 'HASTY1', 'KILRO1'],
    stars: ['ALMAY1', 'BAINY1', 'HASTY1', 'KILRO1'],
  },
  KLGA: {
    sids: ['BDR1', 'DIXIE1', 'GAYEL1', 'LENDY1'],
    stars: ['BDR1', 'DIXIE1', 'GAYEL1', 'MERIT1'],
  },
  KDTW: {
    sids: ['BURNY1', 'CROWE1', 'FNT1', 'GRATI1'],
    stars: ['BURNY1', 'CROWE1', 'FNT1', 'GRATI1'],
  },
};

// ============================================================================
// PROCEDURE LEGS (ARINC-LITE)
// Maps a procedure name to its constituent sequence of waypoints.
// ============================================================================

export const PROCEDURE_LEGS: Record<string, string[]> = {
  BETTE1: ['JFK', 'BETTE', 'RBV'],
  DEEZZ1: ['JFK', 'DEEZZ', 'NELIE', 'VIKNG'],
  CAMRN1: ['FRDMM', 'CAMRN', 'JFK'],
  LENDY1: ['LENDY', 'DIXIE', 'JFK'],

  // KATL
  SMKEY2: ['KATL', 'DAWGS', 'MCDON', 'SMKEY'],
  VRSTY2: ['KATL', 'NEPTS', 'UGRAA', 'VRSTY'],
  AVERY2: ['AVERY', 'KATL'],
  BURNY2: ['BURNY', 'KATL'],

  // KLAX
  ORCKA1: ['KLAX', 'ZIGGY', 'ORCKA'],
  ANJLL1: ['ANJLL', 'KLAX'],

  // KORD
  ELX1: ['KORD', 'ELX'],
  BENKY1: ['BENKY', 'KORD'],
  MYKIE1: ['MYKIE', 'KORD'],
};

// ============================================================================
// Helper functions
// ============================================================================

export function getAirport(icao: string) {
  return AIRPORTS[icao.toUpperCase()];
}

export function getWaypoint(ident: string) {
  return WAYPOINTS[ident.toUpperCase()];
}

export function getAirway(name: string) {
  return AIRWAYS[name.toUpperCase()];
}

export function getSidStar(icao: string) {
  return SID_STARS[icao.toUpperCase()];
}
