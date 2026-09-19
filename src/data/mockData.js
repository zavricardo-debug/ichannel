// Initial mock data for iChannel Vacation Rental Channel Manager
// Base date is September 2026

export const INITIAL_LISTINGS = [
  {
    id: 'prop-1',
    name: 'Villa Azure Vista - Oceanfront Pool',
    location: 'Malibu, California',
    type: 'Entire Villa',
    bedrooms: 4,
    bathrooms: 3.5,
    maxGuests: 8,
    basePrice: 450,
    weekendPrice: 540,
    minStay: 2,
    cleaningFee: 180,
    active: true,
    channels: {
      airbnb: { enabled: true, listingId: 'AB-883921', status: 'synced' },
      booking: { enabled: true, listingId: 'BK-492019', status: 'synced' },
      vrbo: { enabled: true, listingId: 'VR-301948', status: 'synced' },
      direct: { enabled: true, listingId: 'DIR-001', status: 'active' }
    },
    icalExportUrl: 'https://ichannel.pages.dev/api/ical/prop-1.ics',
    icalImportUrls: {
      airbnb: 'https://www.airbnb.com/calendar/ical/883921.ics?s=xyz',
      booking: 'https://admin.booking.com/hotel/hoteladmin/ical.html?t=abc',
      vrbo: 'https://www.vrbo.com/icalendar/301948.ics'
    },
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    tags: ['Luxury', 'Beachfront', 'Pool', 'High Demand']
  },
  {
    id: 'prop-2',
    name: 'Skyline Luxury Penthouse',
    location: 'Brickell, Miami, Florida',
    type: 'Penthouse Apartment',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    basePrice: 290,
    weekendPrice: 350,
    minStay: 1,
    cleaningFee: 120,
    active: true,
    channels: {
      airbnb: { enabled: true, listingId: 'AB-110294', status: 'synced' },
      booking: { enabled: true, listingId: 'BK-774012', status: 'synced' },
      vrbo: { enabled: true, listingId: 'VR-992381', status: 'synced' },
      direct: { enabled: true, listingId: 'DIR-002', status: 'active' }
    },
    icalExportUrl: 'https://ichannel.pages.dev/api/ical/prop-2.ics',
    icalImportUrls: {
      airbnb: 'https://www.airbnb.com/calendar/ical/110294.ics?s=xyz',
      booking: 'https://admin.booking.com/hotel/hoteladmin/ical.html?t=def',
      vrbo: 'https://www.vrbo.com/icalendar/992381.ics'
    },
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    tags: ['Downtown', 'Skyline View', 'Balcony', 'Fast WiFi']
  },
  {
    id: 'prop-3',
    name: 'Pinecrest Alpine Chalet & Spa',
    location: 'Aspen, Colorado',
    type: 'Mountain Chalet',
    bedrooms: 3,
    bathrooms: 2.5,
    maxGuests: 6,
    basePrice: 380,
    weekendPrice: 460,
    minStay: 3,
    cleaningFee: 150,
    active: true,
    channels: {
      airbnb: { enabled: true, listingId: 'AB-559102', status: 'synced' },
      booking: { enabled: false, listingId: '', status: 'unlinked' },
      vrbo: { enabled: true, listingId: 'VR-441829', status: 'synced' },
      direct: { enabled: true, listingId: 'DIR-003', status: 'active' }
    },
    icalExportUrl: 'https://ichannel.pages.dev/api/ical/prop-3.ics',
    icalImportUrls: {
      airbnb: 'https://www.airbnb.com/calendar/ical/559102.ics?s=xyz',
      booking: '',
      vrbo: 'https://www.vrbo.com/icalendar/441829.ics'
    },
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    tags: ['Ski-in/Ski-out', 'Fireplace', 'Hot Tub', 'Sauna']
  },
  {
    id: 'prop-4',
    name: 'SoHo Modern Designer Loft',
    location: 'Manhattan, New York',
    type: 'Boutique Loft',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    basePrice: 240,
    weekendPrice: 295,
    minStay: 2,
    cleaningFee: 95,
    active: true,
    channels: {
      airbnb: { enabled: true, listingId: 'AB-339182', status: 'synced' },
      booking: { enabled: true, listingId: 'BK-552910', status: 'synced' },
      vrbo: { enabled: false, listingId: '', status: 'paused' },
      direct: { enabled: true, listingId: 'DIR-004', status: 'active' }
    },
    icalExportUrl: 'https://ichannel.pages.dev/api/ical/prop-4.ics',
    icalImportUrls: {
      airbnb: 'https://www.airbnb.com/calendar/ical/339182.ics?s=xyz',
      booking: 'https://admin.booking.com/hotel/hoteladmin/ical.html?t=ghi',
      vrbo: ''
    },
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    tags: ['Central', 'Historic Building', 'Quiet Studio', 'Workstation']
  },
  {
    id: 'prop-5',
    name: 'Sonoran Saguaro Desert Oasis',
    location: 'Scottsdale, Arizona',
    type: 'Desert Villa',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    basePrice: 310,
    weekendPrice: 375,
    minStay: 2,
    cleaningFee: 135,
    active: true,
    channels: {
      airbnb: { enabled: true, listingId: 'AB-772918', status: 'synced' },
      booking: { enabled: true, listingId: 'BK-661028', status: 'synced' },
      vrbo: { enabled: true, listingId: 'VR-882710', status: 'synced' },
      direct: { enabled: true, listingId: 'DIR-005', status: 'active' }
    },
    icalExportUrl: 'https://ichannel.pages.dev/api/ical/prop-5.ics',
    icalImportUrls: {
      airbnb: 'https://www.airbnb.com/calendar/ical/772918.ics?s=xyz',
      booking: 'https://admin.booking.com/hotel/hoteladmin/ical.html?t=jkl',
      vrbo: 'https://www.vrbo.com/icalendar/882710.ics'
    },
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    tags: ['Desert View', 'Heated Pool', 'Outdoor Kitchen', 'Fire Pit']
  }
];

export const INITIAL_CHANNEL_SETTINGS = {
  airbnb: {
    id: 'airbnb',
    name: 'Airbnb',
    color: '#FF385C',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    dotColor: 'bg-rose-500',
    enabled: true,
    status: 'connected', // 'connected' | 'auth_required' | 'syncing' | 'error'
    connectionType: 'direct_api', // 'direct_api' | 'ical'
    markupPercent: 3.0, // Host fee compensation
    syncFrequency: 'realtime', // 'realtime' | '5min' | '15min' | 'hourly'
    credentials: {
      clientId: 'ab_live_oauth_88492019482',
      clientSecret: 'sec_live_9948201938a8e100f89412e',
      hostUserId: 'host_usr_8820194',
      accessToken: 'air_tok_9918402839218_active_valid',
      tokenExpiresAt: '2026-12-31'
    },
    permissions: {
      syncRates: true,
      syncAvailability: true,
      syncMinStay: true,
      instantBook: true,
      importReservations: true,
      autoMessageGuests: true
    },
    webhook: {
      url: 'https://ichannel.pages.dev/api/webhooks/airbnb',
      secret: 'whsec_airbnb_00192849182',
      status: 'active',
      lastPing: '2026-09-19T14:15:22Z'
    },
    stats: {
      syncedListingsCount: 5,
      lastSyncTimestamp: '2026-09-19T14:20:00Z',
      syncSuccessRate: 99.8,
      avgResponseTimeMs: 184
    }
  },
  booking: {
    id: 'booking',
    name: 'Booking.com',
    color: '#003580',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dotColor: 'bg-blue-500',
    enabled: true,
    status: 'connected',
    connectionType: 'direct_api',
    markupPercent: 15.0, // Standard 15% Booking.com commission markup
    syncFrequency: 'realtime',
    credentials: {
      machineAccountId: 'BKG-MACH-XML-99841',
      password: '••••••••••••••••••••••••••••',
      connectivityPartnerId: 'ICHANNEL_PREMIER_CONN',
      hotelCode: 'HTL-GLOBAL-482910',
      ratePlanId: 'BAR_STANDARD_FLEX'
    },
    permissions: {
      syncRates: true,
      syncAvailability: true,
      syncMinStay: true,
      ctaCtdRestrictions: true,
      importReservations: true,
      cancellationsPush: true
    },
    webhook: {
      url: 'https://ichannel.pages.dev/api/webhooks/booking',
      secret: 'whsec_booking_77401928371',
      status: 'active',
      lastPing: '2026-09-19T14:18:45Z'
    },
    stats: {
      syncedListingsCount: 4,
      lastSyncTimestamp: '2026-09-19T14:19:12Z',
      syncSuccessRate: 99.5,
      avgResponseTimeMs: 240
    }
  },
  vrbo: {
    id: 'vrbo',
    name: 'Vrbo (Expedia Group)',
    color: '#1668B8',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    dotColor: 'bg-cyan-500',
    enabled: true,
    status: 'connected',
    connectionType: 'direct_api',
    markupPercent: 5.0, // Vrbo commission offset
    syncFrequency: '5min',
    credentials: {
      advertiserId: 'VRBO-ADV-771920',
      clientId: 'vrbo_oauth_app_991823',
      clientSecret: '••••••••••••••••••••••••••••',
      partnerType: 'Integrated PMS Partner'
    },
    permissions: {
      syncRates: true,
      syncAvailability: true,
      syncMinStay: true,
      importReservations: true,
      instantBooking: true
    },
    webhook: {
      url: 'https://ichannel.pages.dev/api/webhooks/vrbo',
      secret: 'whsec_vrbo_55102938471',
      status: 'active',
      lastPing: '2026-09-19T14:12:10Z'
    },
    stats: {
      syncedListingsCount: 4,
      lastSyncTimestamp: '2026-09-19T14:15:00Z',
      syncSuccessRate: 99.2,
      avgResponseTimeMs: 310
    }
  },
  direct: {
    id: 'direct',
    name: 'Direct Booking Engine',
    color: '#10B981',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dotColor: 'bg-emerald-500',
    enabled: true,
    status: 'connected',
    connectionType: 'internal',
    markupPercent: 0.0,
    syncFrequency: 'instant',
    credentials: {
      apiKey: 'ich_live_dir_992810482910',
      domain: 'book.myvillas.com'
    },
    permissions: {
      syncRates: true,
      syncAvailability: true,
      instantBook: true
    },
    stats: {
      syncedListingsCount: 5,
      lastSyncTimestamp: '2026-09-19T14:23:00Z',
      syncSuccessRate: 100,
      avgResponseTimeMs: 12
    }
  }
};

export const INITIAL_DISCOUNT_RULES = [
  {
    id: 'disc-weekly',
    name: 'Weekly Stay Discount',
    type: 'length_of_stay',
    minNights: 7,
    discountPercent: 10,
    active: true,
    description: '10% off automatically applied on 7+ night reservations across all channels',
    channels: ['airbnb', 'booking', 'vrbo', 'direct'],
    listings: 'all'
  },
  {
    id: 'disc-extended',
    name: 'Two-Week Extended Stay',
    type: 'length_of_stay',
    minNights: 14,
    discountPercent: 15,
    active: true,
    description: '15% discount for reservations of 14 nights or more',
    channels: ['airbnb', 'booking', 'vrbo', 'direct'],
    listings: 'all'
  },
  {
    id: 'disc-monthly',
    name: 'Monthly Workation Deal',
    type: 'length_of_stay',
    minNights: 28,
    discountPercent: 25,
    active: true,
    description: '25% discount for 28+ night monthly bookings (digital nomads & snowbirds)',
    channels: ['airbnb', 'booking', 'vrbo', 'direct'],
    listings: 'all'
  },
  {
    id: 'disc-last-minute',
    name: 'Last Minute Flash Sale',
    type: 'last_minute',
    leadDays: 3,
    discountPercent: 12,
    active: true,
    description: '12% discount for check-ins within 3 days to fill empty gaps',
    channels: ['airbnb', 'booking', 'vrbo', 'direct'],
    listings: 'all'
  },
  {
    id: 'disc-early-bird',
    name: 'Early Bird Booking Advantage',
    type: 'early_bird',
    advanceDays: 60,
    discountPercent: 8,
    active: true,
    description: '8% discount for bookings made at least 60 days ahead of check-in',
    channels: ['airbnb', 'booking', 'vrbo', 'direct'],
    listings: 'all'
  }
];

export const INITIAL_RESERVATIONS = [
  {
    id: 'res-101',
    listingId: 'prop-1',
    guestName: 'Elena Rostova',
    channel: 'airbnb',
    confirmationCode: 'HM8892KQ1',
    checkIn: '2026-09-20',
    checkOut: '2026-09-24',
    nights: 4,
    guests: 4,
    nightlyRate: 450,
    totalPayout: 1800,
    status: 'confirmed', // confirmed, checked_in, checked_out, cancelled
    bookedAt: '2026-09-12T10:30:00Z',
    contactEmail: 'elena.rostova@example.com',
    contactPhone: '+1 (555) 349-1029',
    notes: 'Arriving at 4 PM, requested early luggage drop-off.'
  },
  {
    id: 'res-102',
    listingId: 'prop-2',
    guestName: 'Marcus Vance',
    channel: 'booking',
    confirmationCode: 'BK-9918230',
    checkIn: '2026-09-21',
    checkOut: '2026-09-25',
    nights: 4,
    guests: 2,
    nightlyRate: 334, // includes markup
    totalPayout: 1336,
    status: 'confirmed',
    bookedAt: '2026-09-14T14:12:00Z',
    contactEmail: 'm.vance@techcorp.io',
    contactPhone: '+1 (555) 771-8820',
    notes: 'Business travel, needs fast Wi-Fi and quiet floor.'
  },
  {
    id: 'res-103',
    listingId: 'prop-3',
    guestName: 'Sarah & David Jenkins',
    channel: 'vrbo',
    confirmationCode: 'HA-4091829',
    checkIn: '2026-09-25',
    checkOut: '2026-09-29',
    nights: 4,
    guests: 5,
    nightlyRate: 399,
    totalPayout: 1596,
    status: 'confirmed',
    bookedAt: '2026-09-08T09:44:00Z',
    contactEmail: 'jenkins.family@gmail.com',
    contactPhone: '+1 (555) 234-9988',
    notes: 'Family hiking trip, requested hot tub preheated on arrival.'
  },
  {
    id: 'res-104',
    listingId: 'prop-4',
    guestName: 'Claire Dupont',
    channel: 'airbnb',
    confirmationCode: 'HM4410928',
    checkIn: '2026-09-22',
    checkOut: '2026-09-26',
    nights: 4,
    guests: 2,
    nightlyRate: 247,
    totalPayout: 988,
    status: 'confirmed',
    bookedAt: '2026-09-15T18:20:00Z',
    contactEmail: 'c.dupont@artgallery.fr',
    contactPhone: '+33 6 12 34 56 78',
    notes: 'Visiting NY Fashion Week exhibitions.'
  },
  {
    id: 'res-105',
    listingId: 'prop-5',
    guestName: 'Robert & Emily Taylor',
    channel: 'direct',
    confirmationCode: 'DIR-88192',
    checkIn: '2026-09-26',
    checkOut: '2026-09-30',
    nights: 4,
    guests: 4,
    nightlyRate: 310,
    totalPayout: 1240,
    status: 'confirmed',
    bookedAt: '2026-09-17T11:05:00Z',
    contactEmail: 'robert.taylor@outlook.com',
    contactPhone: '+1 (555) 901-2244',
    notes: 'Repeat guests from last year, welcome wine requested.'
  },
  {
    id: 'res-106',
    listingId: 'prop-1',
    guestName: 'Alexander Wright',
    channel: 'booking',
    confirmationCode: 'BK-5520912',
    checkIn: '2026-10-02',
    checkOut: '2026-10-07',
    nights: 5,
    guests: 6,
    nightlyRate: 518,
    totalPayout: 2590,
    status: 'confirmed',
    bookedAt: '2026-09-10T16:00:00Z',
    contactEmail: 'awright@londoncapital.co.uk',
    contactPhone: '+44 20 7946 0912',
    notes: 'Executive retreat.'
  },
  {
    id: 'res-107',
    listingId: 'prop-2',
    guestName: 'Chloe Bennett',
    channel: 'vrbo',
    confirmationCode: 'HA-8827104',
    checkIn: '2026-10-05',
    checkOut: '2026-10-09',
    nights: 4,
    guests: 3,
    nightlyRate: 305,
    totalPayout: 1220,
    status: 'confirmed',
    bookedAt: '2026-09-13T08:15:00Z',
    contactEmail: 'chloe.bennett@creative.co',
    contactPhone: '+1 (555) 489-0192',
    notes: 'Attending music festival.'
  },
  {
    id: 'res-108',
    listingId: 'prop-3',
    guestName: 'Liam O\'Connor',
    channel: 'airbnb',
    confirmationCode: 'HM9921847',
    checkIn: '2026-10-10',
    checkOut: '2026-10-15',
    nights: 5,
    guests: 6,
    nightlyRate: 391,
    totalPayout: 1955,
    status: 'confirmed',
    bookedAt: '2026-09-16T19:40:00Z',
    contactEmail: 'liam.oc@irishwhiskey.ie',
    contactPhone: '+353 87 123 4567',
    notes: 'Fall foliage photography group.'
  }
];

export const INITIAL_DATE_OVERRIDES = {
  // listingId -> dateKey (YYYY-MM-DD) -> { price, minStay, blocked, reason, channelOverrides: { airbnb, booking, vrbo } }
  'prop-3': {
    '2026-09-20': { blocked: true, reason: 'Hot tub & spa maintenance' },
    '2026-09-21': { blocked: true, reason: 'Hot tub & spa maintenance' },
    '2026-09-22': { blocked: true, reason: 'Chimney sweep & winterizing' }
  },
  'prop-4': {
    '2026-10-01': { blocked: true, reason: 'Deep sanitation & architectural photo shoot' },
    '2026-10-02': { blocked: true, reason: 'Deep sanitation & architectural photo shoot' }
  },
  'prop-1': {
    '2026-09-28': { price: 580, minStay: 3, note: 'High demand holiday teaser' },
    '2026-09-29': { price: 580, minStay: 3, note: 'High demand holiday teaser' },
    '2026-09-30': { price: 580, minStay: 3, note: 'High demand holiday teaser' }
  }
};

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'log-1',
    timestamp: '2026-09-19T14:22:10Z',
    channel: 'airbnb',
    event: 'RATE_PUSH',
    description: 'Updated rate to $450/night for Villa Azure Vista across 30 dates',
    status: 'success',
    httpStatus: 200,
    latencyMs: 142
  },
  {
    id: 'log-2',
    timestamp: '2026-09-19T14:21:45Z',
    channel: 'booking',
    event: 'AVAILABILITY_SYNC',
    description: 'Pushed inventory block for Skyline Luxury Penthouse dates 2026-09-21 to 2026-09-25',
    status: 'success',
    httpStatus: 200,
    latencyMs: 231
  },
  {
    id: 'log-3',
    timestamp: '2026-09-19T14:18:02Z',
    channel: 'vrbo',
    event: 'WEBHOOK_RECEIVED',
    description: 'Inbound reservation HA-4091829 processed for Pinecrest Alpine Chalet',
    status: 'success',
    httpStatus: 200,
    latencyMs: 88
  },
  {
    id: 'log-4',
    timestamp: '2026-09-19T14:15:30Z',
    channel: 'airbnb',
    event: 'TOKEN_REFRESH',
    description: 'OAuth 2.0 handshake verified. Scopes: [rates, calendar, messaging]',
    status: 'success',
    httpStatus: 200,
    latencyMs: 110
  },
  {
    id: 'log-5',
    timestamp: '2026-09-19T14:10:11Z',
    channel: 'booking',
    event: 'MIN_STAY_UPDATE',
    description: 'Set minimum length of stay to 2 nights for 5 listings',
    status: 'success',
    httpStatus: 200,
    latencyMs: 198
  }
];

export const INITIAL_TEAM_MEMBERS = [
  {
    id: 'team-1',
    name: 'Alex Mercer (You)',
    email: 'alex@luxuryrentals.com',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    permissions: ['all']
  },
  {
    id: 'team-2',
    name: 'Elena Gilbert',
    email: 'elena@luxuryrentals.com',
    role: 'Revenue Manager',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    permissions: ['rates_read_write', 'calendar_edit', 'discounts_manage']
  },
  {
    id: 'team-3',
    name: 'Carlos Mendez',
    email: 'carlos@luxuryrentals.com',
    role: 'Operations & Cleaning',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    permissions: ['calendar_view', 'block_dates_maintenance']
  }
];
