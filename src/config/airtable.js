import Airtable from 'airtable';

const base = new Airtable({
  apiKey: import.meta.env.VITE_AIRTABLE_API_KEY
}).base(import.meta.env.VITE_AIRTABLE_BASE_ID);

export const orderingTable = base('ordering');
export const messageTable = base('message');
export const adminTable = base('Admin');

// Helper function to get admin settings
export async function getAdminSettings() {
  try {
    const records = await adminTable.select({
      maxRecords: 1
    }).firstPage();

    console.log('Fetched records:', records);

    if (records && records.length > 0) {
      const fields = records[0].fields;
      console.log('Current settings:', fields);
      return fields;
    }

    // Create default settings if no record exists
    const defaultSettings = {
      isUp: true,
      isImpastaMode: false,
      canOrder: true
    };

    const newRecord = await adminTable.create([{ fields: defaultSettings }]);
    console.log('Created new settings:', newRecord);
    return defaultSettings;
  } catch (error) {
    console.error('Error in getAdminSettings:', error);
    throw error;
  }
}

// Helper function to update admin settings
export async function updateAdminSettings(updates) {
  try {
    console.log('Updating with:', updates);
    const records = await adminTable.select({
      maxRecords: 1
    }).firstPage();

    if (records && records.length > 0) {
      const record = records[0];
      console.log('Found existing record:', record.id);
      await adminTable.update(record.id, updates);
      console.log('Updated record successfully');
      return true;
    } else {
      console.log('No existing record, creating new');
      await adminTable.create([{ fields: updates }]);
      return true;
    }
  } catch (error) {
    console.error('Error in updateAdminSettings:', error);
    throw error;
  }
} 