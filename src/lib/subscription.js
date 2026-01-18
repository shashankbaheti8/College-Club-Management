// Plan limits configuration - safe for both client and server
export const PLAN_LIMITS = {
  free: {
    clubs: 3,  // Increased for testing
    activeEventsPerClub: 10,  // Increased for testing
    membersPerClub: 20,
    features: {
      analytics: false,
      csvExport: false,
      customDomain: false,
      prioritySupport: false,
    }
  },
  pro: {
    clubs: 5,
    activeEventsPerClub: 999,
    membersPerClub: 200,
    features: {
      analytics: true,
      csvExport: false,
      customDomain: false,
      prioritySupport: true,
    }
  },
  enterprise: {
    clubs: 999,
    activeEventsPerClub: 999,
    membersPerClub: 999999,
    features: {
      analytics: true,
      csvExport: true,
      customDomain: true,
      prioritySupport: true,
    }
  }
}
