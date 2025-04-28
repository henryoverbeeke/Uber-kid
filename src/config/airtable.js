import Airtable from 'airtable';

const base = new Airtable({ apiKey: import.meta.env.VITE_AIRTABLE_API_KEY }).base(import.meta.env.VITE_AIRTABLE_BASE_ID);

const orderingTable = base('ordering');
const messageTable = base('message');
const adminTable = base('Admin');
const beepTable = base('beep');

let cachedSystemStatus = true; // Default to true initially

const getAdminSettings = async () => {
  try {
    const records = await adminTable
      .select({
        maxRecords: 1,
        sort: [{ field: 'createdTime', direction: 'desc' }]
      })
      .firstPage();
    const settings = records[0]?.fields || null;
    cachedSystemStatus = settings?.isUp ?? true;
    return settings;
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return null;
  }
};

const isSystemOnline = () => cachedSystemStatus;

const checkSystemStatusBeforeAPI = async (apiCall) => {
  if (!isSystemOnline()) {
    console.log('System is offline. Skipping API call.');
    return null;
  }
  return apiCall();
};

const updateAdminSettings = async (fields) => {
  // Always allow admin settings updates
  try {
    const records = await adminTable
      .select({
        maxRecords: 1,
        sort: [{ field: 'createdTime', direction: 'desc' }]
      })
      .firstPage();
    
    if (records.length > 0) {
      await adminTable.update(records[0].id, fields);
    } else {
      await adminTable.create([{ fields }]);
    }
    
    // Update cached status if isUp is being changed
    if ('isUp' in fields) {
      cachedSystemStatus = fields.isUp;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating admin settings:', error);
    throw error;
  }
};

// Wrapped table operations
const wrappedOrderingTable = {
  select: (...args) => checkSystemStatusBeforeAPI(() => orderingTable.select(...args)),
  create: (...args) => checkSystemStatusBeforeAPI(() => orderingTable.create(...args)),
  update: (...args) => checkSystemStatusBeforeAPI(() => orderingTable.update(...args)),
  destroy: (...args) => checkSystemStatusBeforeAPI(() => orderingTable.destroy(...args))
};

const wrappedMessageTable = {
  select: (...args) => checkSystemStatusBeforeAPI(() => messageTable.select(...args)),
  create: (...args) => checkSystemStatusBeforeAPI(() => messageTable.create(...args)),
  update: (...args) => checkSystemStatusBeforeAPI(() => messageTable.update(...args)),
  destroy: (...args) => checkSystemStatusBeforeAPI(() => messageTable.destroy(...args))
};

const wrappedBeepTable = {
  select: (...args) => checkSystemStatusBeforeAPI(() => beepTable.select(...args)),
  create: (...args) => checkSystemStatusBeforeAPI(() => beepTable.create(...args)),
  update: (...args) => checkSystemStatusBeforeAPI(() => beepTable.update(...args)),
  destroy: (...args) => checkSystemStatusBeforeAPI(() => beepTable.destroy(...args))
};

export {
  base,
  wrappedOrderingTable as orderingTable,
  wrappedMessageTable as messageTable,
  wrappedBeepTable as beepTable,
  adminTable,
  getAdminSettings,
  updateAdminSettings,
  isSystemOnline
}; 