export const analyzeSentiment = (purpose) => {
  const text = purpose.toLowerCase();
  
  // Simulated AI logic for demo purposes
  const hostileKeywords = ['fight', 'damage', 'protest', 'steal', 'break', 'kill', 'hurt'];
  const warningKeywords = ['complaint', 'angry', 'issue', 'urgent', 'demand'];
  
  const hasHostile = hostileKeywords.some(kw => text.includes(kw));
  const hasWarning = warningKeywords.some(kw => text.includes(kw));
  
  if (hasHostile) {
    return { score: 15, label: 'Hostile/Suspicious', level: 'danger' };
  }
  
  if (hasWarning) {
    return { score: 45, label: 'Elevated Tension', level: 'warning' };
  }
  
  if (text.length > 5) {
    return { score: 92, label: 'Safe/Routine', level: 'safe' };
  }
  
  return { score: 50, label: 'Analyzing...', level: 'neutral' };
};

export const checkIntentRouting = (purpose) => {
  const text = purpose.toLowerCase();
  
  if (text.includes('repair') || text.includes('fix') || text.includes('leak') || text.includes('broken')) {
    return 'Maintenance Dept';
  }
  
  if (text.includes('interview') || text.includes('hire') || text.includes('job')) {
    return 'HR Dept';
  }
  
  if (text.includes('delivery') || text.includes('package') || text.includes('drop')) {
    return 'Logistics / Mailroom';
  }
  
  return null;
};

export const fuzzyMatchBlacklist = (name, phone) => {
  // Simulated fuzzy matching against a mock database
  const blacklist = [
    { name: 'John Smith', phone: '555-0100', reason: 'Previous incident' },
    { name: 'Jane Doe', phone: '555-0101', reason: 'Banned vendor' }
  ];
  
  const normalizedInputName = name.toLowerCase().replace(/[^a-z]/g, '');
  
  // Extremely simple mock fuzzy check (e.g., 'Jhon' vs 'John')
  for (const person of blacklist) {
    const normalizedDbName = person.name.toLowerCase().replace(/[^a-z]/g, '');
    
    // Check for exact match or close length substring match
    if (
      normalizedInputName && 
      (normalizedDbName.includes(normalizedInputName) || normalizedInputName.includes(normalizedDbName)) &&
      Math.abs(normalizedDbName.length - normalizedInputName.length) <= 2
    ) {
      return person;
    }
    
    if (phone && phone === person.phone) {
      return person;
    }
  }
  
  return null;
};
