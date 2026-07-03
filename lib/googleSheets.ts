import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const LISTS_SHEET = 'lists';
const TASKS_SHEET = 'tasks';

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !key) {
    throw new Error(
      'Missing Google credentials. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env.local'
    );
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: key.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: 'v4', auth });
}

/** Read all rows from a sheet tab (skips header row) */
export async function readSheet(sheetName: string): Promise<string[][]> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A2:Z`,
  });
  return (res.data.values as string[][]) || [];
}

/** Append a new row to a sheet */
export async function appendRow(sheetName: string, row: (string | boolean)[]) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [row],
    },
  });
}

/** Find the row index (1-based, including header) of a row by its ID in column A */
export async function findRowIndex(sheetName: string, id: string): Promise<number> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:A`,
  });
  const col = (res.data.values as string[][]) || [];
  const idx = col.findIndex((r) => r[0] === id);
  if (idx < 0) throw new Error(`Row with id "${id}" not found in ${sheetName}`);
  return idx + 1; // 1-based
}

/** Update specific cells in a row by row number (1-based) */
export async function updateRow(
  sheetName: string,
  rowNumber: number,
  values: (string | boolean)[]
) {
  const sheets = await getSheets();
  const endCol = String.fromCharCode(64 + values.length); // A=1, B=2,...
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A${rowNumber}:${endCol}${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  });
}

export { SHEET_ID, LISTS_SHEET, TASKS_SHEET };
