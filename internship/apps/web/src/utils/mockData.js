// Backup mock data if PocketBase is unreachable or empty
export const mockReports = [
  {
    id: 'mock_1',
    alertType: 'Forest Fire',
    status: 'Team Dispatched',
    latitude: 18.5204,
    longitude: 73.8567,
    description: 'Smoke spotted near the western ridge. Seems to be spreading quickly due to winds.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'mock_2',
    alertType: 'Illegal Tree Cutting',
    status: 'Verified',
    latitude: 18.4529,
    longitude: 73.8012,
    description: 'Sound of chainsaws heard deep in the protected sector. Tire tracks visible.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'mock_3',
    alertType: 'Wildlife Sighting',
    status: 'Reported',
    latitude: 18.6011,
    longitude: 73.7541,
    description: 'Leopard pugmarks found near the hiking trail edge.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const mockEducationTips = [
  {
    id: 'edu_1',
    title: 'Preventing Campfire Spreads',
    category: 'Fire Safety',
    description: 'Always ensure campfires are completely extinguished. Drown with water, stir, and feel for heat.',
    icon: 'Flame'
  },
  {
    id: 'edu_2',
    title: 'Identifying Poacher Traps',
    category: 'Wildlife Protection',
    description: 'Look out for unnatural wire snares or concealed pits off the main trails. Report immediately.',
    icon: 'ShieldAlert'
  },
  {
    id: 'edu_3',
    title: 'Recognizing Landslide Risks',
    category: 'Landslide Awareness',
    description: 'Cracks in soil, leaning trees, or sudden changes in water flow can indicate an impending landslide.',
    icon: 'Mountain'
  }
];