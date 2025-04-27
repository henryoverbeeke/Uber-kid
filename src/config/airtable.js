import Airtable from 'airtable';

const base = new Airtable({ apiKey: import.meta.env.VITE_AIRTABLE_API_KEY }).base(import.meta.env.VITE_AIRTABLE_BASE_ID);

const orderingTable = base('ordering');
const messageTable = base('message');
const adminTable = base('Admin');
const beepTable = base('beep');

const getAdminSettings = async () => {
  try {
    const records = await adminTable
      .select({
        maxRecords: 1,
        sort: [{ field: 'createdTime', direction: 'desc' }]
      })
      .firstPage();
    return records[0]?.fields || null;
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return null;
  }
};

const updateAdminSettings = async (fields) => {
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
  } catch (error) {
    console.error('Error updating admin settings:', error);
    throw error;
  }
};

export {
  base,
  orderingTable,
  messageTable,
  adminTable,
  beepTable,
  getAdminSettings,
  updateAdminSettings
}; 