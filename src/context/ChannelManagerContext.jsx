import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, parseISO, isWithinInterval, addDays, getDay } from 'date-fns';
import {
  INITIAL_LISTINGS,
  INITIAL_CHANNEL_SETTINGS,
  INITIAL_DISCOUNT_RULES,
  INITIAL_RESERVATIONS,
  INITIAL_DATE_OVERRIDES,
  INITIAL_AUDIT_LOGS,
  INITIAL_TEAM_MEMBERS
} from '../data/mockData';

const ChannelManagerContext = createContext();

const STORAGE_KEYS = {
  LISTINGS: 'ich_listings_v1',
  CHANNELS: 'ich_channels_v1',
  DISCOUNTS: 'ich_discounts_v1',
  RESERVATIONS: 'ich_reservations_v1',
  OVERRIDES: 'ich_overrides_v1',
  AUDIT: 'ich_audit_v1',
  TEAM: 'ich_team_v1'
};

export function ChannelManagerProvider({ children }) {
  // Load initial states from localStorage if available, otherwise mock data
  const [listings, setListings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    return saved ? JSON.parse(saved) : INITIAL_LISTINGS;
  });

  const [channelSettings, setChannelSettings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    return saved ? JSON.parse(saved) : INITIAL_CHANNEL_SETTINGS;
  });

  const [discountRules, setDiscountRules] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DISCOUNTS);
    return saved ? JSON.parse(saved) : INITIAL_DISCOUNT_RULES;
  });

  const [reservations, setReservations] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });

  const [dateOverrides, setDateOverrides] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OVERRIDES);
    return saved ? JSON.parse(saved) : INITIAL_DATE_OVERRIDES;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [teamMembers, setTeamMembers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEAM);
    return saved ? JSON.parse(saved) : INITIAL_TEAM_MEMBERS;
  });

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ active: false, currentStep: '', percentage: 0, log: [] });
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channelSettings));
  }, [channelSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DISCOUNTS, JSON.stringify(discountRules));
  }, [discountRules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OVERRIDES, JSON.stringify(dateOverrides));
  }, [dateOverrides]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(teamMembers));
  }, [teamMembers]);

  // Helper to log audit events
  const addAuditLog = (channel, event, description, status = 'success', httpStatus = 200) => {
    const newLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      channel,
      event,
      description,
      status,
      httpStatus,
      latencyMs: Math.floor(Math.random() * 180) + 70
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 99)]);
    return newLog;
  };

  // Calculate pricing for a specific listing and date
  const getNightlyRate = (listing, dateKey) => {
    const dateObj = typeof dateKey === 'string' ? parseISO(dateKey) : dateKey;
    const formattedKey = typeof dateKey === 'string' ? dateKey : format(dateKey, 'yyyy-MM-dd');
    const dayOfWeek = getDay(dateObj); // 0 = Sun, 5 = Fri, 6 = Sat
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

    const listingOverrides = dateOverrides[listing.id] || {};
    const override = listingOverrides[formattedKey];

    let baseRate = listing.basePrice;

    if (override && override.price !== undefined && override.price !== null) {
      baseRate = Number(override.price);
    } else if (isWeekend && listing.weekendPrice) {
      baseRate = Number(listing.weekendPrice);
    }

    const minStay = override?.minStay !== undefined ? Number(override.minStay) : (listing.minStay || 1);

    // Calculate rates with channel markups
    const airbnbRate = Math.round(baseRate * (1 + (channelSettings.airbnb?.markupPercent || 0) / 100));
    const bookingRate = Math.round(baseRate * (1 + (channelSettings.booking?.markupPercent || 0) / 100));
    const vrboRate = Math.round(baseRate * (1 + (channelSettings.vrbo?.markupPercent || 0) / 100));
    const directRate = baseRate;

    return {
      baseRate,
      minStay,
      isWeekend,
      hasOverride: Boolean(override?.price || override?.minStay),
      channelRates: {
        airbnb: airbnbRate,
        booking: bookingRate,
        vrbo: vrboRate,
        direct: directRate
      }
    };
  };

  // Get status of a cell: booked, blocked, or available
  const getDateStatus = (listingId, dateKey) => {
    const formattedKey = typeof dateKey === 'string' ? dateKey : format(dateKey, 'yyyy-MM-dd');
    const targetDate = parseISO(formattedKey);

    // 1. Check if reservation exists for this listing & date
    // Note: checkOut date is morning departure, so booking spans checkIn <= targetDate < checkOut
    const reservation = reservations.find(res => {
      if (res.listingId !== listingId || res.status === 'cancelled') return false;
      const checkIn = parseISO(res.checkIn);
      const checkOut = parseISO(res.checkOut);
      return targetDate >= checkIn && targetDate < checkOut;
    });

    if (reservation) {
      const isCheckInDay = resDateMatches(reservation.checkIn, formattedKey);
      const isCheckOutDay = resDateMatches(reservation.checkOut, formattedKey);
      return {
        type: 'booked',
        reservation,
        isCheckInDay,
        isCheckOutDay
      };
    }

    // 2. Check if date is blocked manually
    const listingOverrides = dateOverrides[listingId] || {};
    const override = listingOverrides[formattedKey];
    if (override?.blocked) {
      return {
        type: 'blocked',
        reason: override.reason || 'Manual Host Block',
        override
      };
    }

    // 3. Available
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return { type: 'available', price: 0, minStay: 1 };

    const rateInfo = getNightlyRate(listing, formattedKey);
    return {
      type: 'available',
      price: rateInfo.baseRate,
      minStay: rateInfo.minStay,
      isWeekend: rateInfo.isWeekend,
      hasOverride: rateInfo.hasOverride,
      channelRates: rateInfo.channelRates,
      override
    };
  };

  const resDateMatches = (dateStr1, dateStr2) => {
    return dateStr1 === dateStr2;
  };

  // Update a single date override
  const updateDateOverride = (listingId, dateKey, data) => {
    setDateOverrides(prev => {
      const listingPrev = prev[listingId] || {};
      const updatedDate = { ...(listingPrev[dateKey] || {}), ...data };

      // If clearing both price and blocked
      if (!updatedDate.blocked && updatedDate.price === undefined && updatedDate.minStay === undefined) {
        const copy = { ...listingPrev };
        delete copy[dateKey];
        return { ...prev, [listingId]: copy };
      }

      return {
        ...prev,
        [listingId]: {
          ...listingPrev,
          [dateKey]: updatedDate
        }
      };
    });

    const listing = listings.find(l => l.id === listingId);
    addAuditLog('all', 'RATE_OVERRIDE', `Updated date ${dateKey} for "${listing?.name || listingId}": Price $${data.price || 'default'}, Blocked: ${data.blocked ? 'YES' : 'NO'}`);
  };

  // Bulk update dates across listings
  const bulkUpdateDates = ({
    listingIds,
    startDate,
    endDate,
    daysOfWeek = [0, 1, 2, 3, 4, 5, 6], // Sunday = 0 to Saturday = 6
    actionType, // 'set_price' | 'adjust_percent' | 'adjust_amount' | 'block' | 'unblock' | 'set_min_stay'
    value,
    reason = 'Bulk management update',
    targetChannels = ['airbnb', 'booking', 'vrbo', 'direct']
  }) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    let currentDate = start;
    const targetDates = [];

    while (currentDate <= end) {
      const dayNum = getDay(currentDate);
      if (daysOfWeek.includes(dayNum)) {
        targetDates.push(format(currentDate, 'yyyy-MM-dd'));
      }
      currentDate = addDays(currentDate, 1);
    }

    setDateOverrides(prev => {
      const next = { ...prev };

      listingIds.forEach(lId => {
        const listing = listings.find(l => l.id === lId);
        const lOverrides = { ...(next[lId] || {}) };

        targetDates.forEach(dKey => {
          const currentCell = lOverrides[dKey] || {};

          if (actionType === 'set_price') {
            lOverrides[dKey] = { ...currentCell, price: Number(value) };
          } else if (actionType === 'adjust_percent') {
            const currentPrice = currentCell.price !== undefined ? currentCell.price : (listing?.basePrice || 100);
            const multiplier = 1 + Number(value) / 100;
            lOverrides[dKey] = { ...currentCell, price: Math.round(currentPrice * multiplier) };
          } else if (actionType === 'adjust_amount') {
            const currentPrice = currentCell.price !== undefined ? currentCell.price : (listing?.basePrice || 100);
            lOverrides[dKey] = { ...currentCell, price: Math.max(10, currentPrice + Number(value)) };
          } else if (actionType === 'block') {
            lOverrides[dKey] = { ...currentCell, blocked: true, reason };
          } else if (actionType === 'unblock') {
            const updated = { ...currentCell };
            delete updated.blocked;
            delete updated.reason;
            lOverrides[dKey] = updated;
          } else if (actionType === 'set_min_stay') {
            lOverrides[dKey] = { ...currentCell, minStay: Number(value) };
          }
        });

        next[lId] = lOverrides;
      });

      return next;
    });

    const channelNames = targetChannels.map(c => channelSettings[c]?.name || c).join(', ');
    addAuditLog(
      'all',
      'BULK_UPDATE',
      `Applied bulk ${actionType} across ${listingIds.length} listing(s) and ${targetDates.length} date(s). Target channels: ${channelNames}.`
    );

    return targetDates.length;
  };

  // Full Channel Sync Simulation
  const triggerSync = async (specificChannel = null) => {
    setIsSyncing(true);
    const channelsToSync = specificChannel ? [specificChannel] : ['airbnb', 'booking', 'vrbo', 'direct'];

    setSyncProgress({
      active: true,
      currentStep: 'Initializing API connections...',
      percentage: 10,
      log: ['Authenticating with Cloudflare Edge Workers...']
    });

    for (let i = 0; i < channelsToSync.length; i++) {
      const chKey = channelsToSync[i];
      const channel = channelSettings[chKey];
      const pct = Math.round(15 + ((i + 1) / channelsToSync.length) * 75);

      setSyncProgress(prev => ({
        ...prev,
        currentStep: `Syncing rates & calendars with ${channel.name}...`,
        percentage: pct,
        log: [
          ...prev.log,
          `Connecting to ${channel.name} (${channel.connectionType === 'direct_api' ? 'Direct API v2' : 'iCal Feed'})...`
        ]
      }));

      // Simulate API latency
      await new Promise(r => setTimeout(r, 650));

      setSyncProgress(prev => ({
        ...prev,
        log: [
          ...prev.log,
          `✓ ${channel.name}: Verified credentials, pushed ${listings.length} listings. 200 OK.`
        ]
      }));

      addAuditLog(
        chKey,
        'CHANNEL_SYNC',
        `Pushed full rates and availability package for ${listings.length} listings. Status: 200 OK`,
        'success',
        200
      );
    }

    setSyncProgress(prev => ({
      ...prev,
      currentStep: 'Sync Complete! All channels up-to-date.',
      percentage: 100,
      log: [...prev.log, 'All calendar feeds & OTAs synchronized successfully!']
    }));

    await new Promise(r => setTimeout(r, 500));
    const nowTime = new Date().toLocaleTimeString();
    setLastSyncTime(nowTime);

    // Update last sync time on channel settings
    setChannelSettings(prev => {
      const next = { ...prev };
      channelsToSync.forEach(key => {
        if (next[key]) {
          next[key] = {
            ...next[key],
            stats: {
              ...next[key].stats,
              lastSyncTimestamp: new Date().toISOString()
            }
          };
        }
      });
      return next;
    });

    setIsSyncing(false);
  };

  // Test individual channel connection
  const testChannelConnection = async (channelKey) => {
    const channel = channelSettings[channelKey];
    const pingTime = Math.floor(Math.random() * 90) + 110;

    await new Promise(r => setTimeout(r, 800));

    const result = {
      success: true,
      channel: channel.name,
      responseTimeMs: pingTime,
      endpoint: channel.webhook?.url || 'https://api.partner.channel.com/v2/rates',
      timestamp: new Date().toISOString()
    };

    addAuditLog(
      channelKey,
      'PING_TEST',
      `Diagnostic ping to ${channel.name} endpoint succeeded. Latency: ${pingTime}ms`,
      'success',
      200
    );

    return result;
  };

  // Channel settings updater
  const updateChannel = (channelKey, newFields) => {
    setChannelSettings(prev => ({
      ...prev,
      [channelKey]: {
        ...prev[channelKey],
        ...newFields
      }
    }));
    addAuditLog(channelKey, 'CONFIG_UPDATE', `Updated configuration for ${channelSettings[channelKey]?.name}`);
  };

  // Listing operations
  const addListing = (newListing) => {
    const listingId = `prop-${Date.now()}`;
    const listing = {
      id: listingId,
      active: true,
      icalExportUrl: `https://ichannel.pages.dev/api/ical/${listingId}.ics`,
      channels: {
        airbnb: { enabled: true, listingId: `AB-${Math.floor(100000 + Math.random() * 900000)}`, status: 'synced' },
        booking: { enabled: true, listingId: `BK-${Math.floor(100000 + Math.random() * 900000)}`, status: 'synced' },
        vrbo: { enabled: true, listingId: `VR-${Math.floor(100000 + Math.random() * 900000)}`, status: 'synced' },
        direct: { enabled: true, listingId: `DIR-${Date.now().toString().slice(-4)}`, status: 'active' }
      },
      ...newListing
    };
    setListings(prev => [...prev, listing]);
    addAuditLog('all', 'LISTING_ADDED', `Created new listing "${listing.name}" with automatic channel distribution.`);
    return listing;
  };

  const updateListing = (id, updatedFields) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, ...updatedFields } : l));
    addAuditLog('all', 'LISTING_UPDATED', `Updated details for listing "${updatedFields.name || id}"`);
  };

  const deleteListing = (id) => {
    const listing = listings.find(l => l.id === id);
    setListings(prev => prev.filter(l => l.id !== id));
    addAuditLog('all', 'LISTING_DELETED', `Deleted listing "${listing?.name || id}" and revoked channel feeds.`);
  };

  // Discount rules operations
  const addDiscountRule = (rule) => {
    const newRule = {
      id: `disc-${Date.now()}`,
      active: true,
      ...rule
    };
    setDiscountRules(prev => [...prev, newRule]);
    addAuditLog('all', 'DISCOUNT_CREATED', `Added new pricing discount rule: "${newRule.name}"`);
  };

  const updateDiscountRule = (id, fields) => {
    setDiscountRules(prev => prev.map(r => r.id === id ? { ...r, ...fields } : r));
    addAuditLog('all', 'DISCOUNT_UPDATED', `Updated discount rule settings`);
  };

  const deleteDiscountRule = (id) => {
    setDiscountRules(prev => prev.filter(r => r.id !== id));
    addAuditLog('all', 'DISCOUNT_DELETED', `Removed discount rule`);
  };

  // Reservation operations
  const addReservation = (resData) => {
    const newRes = {
      id: `res-${Date.now()}`,
      confirmationCode: resData.confirmationCode || `ICH-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
      ...resData
    };
    setReservations(prev => [newRes, ...prev]);

    const listing = listings.find(l => l.id === resData.listingId);
    addAuditLog(
      resData.channel || 'direct',
      'RESERVATION_CREATED',
      `Manual reservation recorded for ${listing?.name || 'Property'} (${resData.guestName}, ${resData.checkIn} to ${resData.checkOut}). Auto-blocked across all OTA channels.`
    );
    return newRes;
  };

  const cancelReservation = (id) => {
    const res = reservations.find(r => r.id === id);
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
    if (res) {
      addAuditLog(
        res.channel,
        'RESERVATION_CANCELLED',
        `Reservation ${res.confirmationCode} cancelled. Freed up dates ${res.checkIn} to ${res.checkOut} across all channels.`
      );
    }
  };

  // Reset to initial mock data
  const resetToDefaults = () => {
    localStorage.clear();
    setListings(INITIAL_LISTINGS);
    setChannelSettings(INITIAL_CHANNEL_SETTINGS);
    setDiscountRules(INITIAL_DISCOUNT_RULES);
    setReservations(INITIAL_RESERVATIONS);
    setDateOverrides(INITIAL_DATE_OVERRIDES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setTeamMembers(INITIAL_TEAM_MEMBERS);
    addAuditLog('all', 'SYSTEM_RESET', 'Restored original demo dataset with sample listings, rates, and reservations.');
  };

  // Export & Import backup
  const exportAllData = () => {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      listings,
      channelSettings,
      discountRules,
      reservations,
      dateOverrides,
      auditLogs,
      teamMembers
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ichannel-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importAllData = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.listings) setListings(data.listings);
      if (data.channelSettings) setChannelSettings(data.channelSettings);
      if (data.discountRules) setDiscountRules(data.discountRules);
      if (data.reservations) setReservations(data.reservations);
      if (data.dateOverrides) setDateOverrides(data.dateOverrides);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      if (data.teamMembers) setTeamMembers(data.teamMembers);
      addAuditLog('all', 'BACKUP_RESTORED', 'Successfully imported channel manager dataset from JSON.');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <ChannelManagerContext.Provider
      value={{
        listings,
        channelSettings,
        discountRules,
        reservations,
        dateOverrides,
        auditLogs,
        teamMembers,
        isSyncing,
        syncProgress,
        lastSyncTime,
        setSyncProgress,
        getNightlyRate,
        getDateStatus,
        updateDateOverride,
        bulkUpdateDates,
        triggerSync,
        testChannelConnection,
        updateChannel,
        addListing,
        updateListing,
        deleteListing,
        addDiscountRule,
        updateDiscountRule,
        deleteDiscountRule,
        addReservation,
        cancelReservation,
        addAuditLog,
        resetToDefaults,
        exportAllData,
        importAllData
      }}
    >
      {children}
    </ChannelManagerContext.Provider>
  );
}

export function useChannelManager() {
  const context = useContext(ChannelManagerContext);
  if (!context) {
    throw new Error('useChannelManager must be used within a ChannelManagerProvider');
  }
  return context;
}
