import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import { getDb } from './db';
import { users } from '../drizzle/schema';
import { eq, sql, desc } from 'drizzle-orm';

export interface MemberImportRow {
  name: string;
  email?: string;
  phone?: string;
  personnummer?: string;
  streetAddress?: string;
  postalCode?: string;
  city?: string;
  memberType?: 'ordinarie' | 'hedersmedlem' | 'stodmedlem';
  joinYear?: number;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: Array<{ row: number; error: string; data?: any }>;
}

/**
 * Validate personnummer format (YYYYMMDD or YYYYMMDD-XXXX)
 */
function validatePersonnummer(personnummer: string): boolean {
  if (!personnummer) return false;
  
  // Remove any dashes or spaces
  const cleaned = personnummer.replace(/[-\s]/g, '');
  
  // Must be at least 8 digits (YYYYMMDD) or 12 digits (YYYYMMDDXXXX)
  if (cleaned.length < 8) return false;
  
  // Check if it's a valid date
  const year = parseInt(cleaned.substring(0, 4));
  const month = parseInt(cleaned.substring(4, 6));
  const day = parseInt(cleaned.substring(6, 8));
  
  if (year < 1900 || year > new Date().getFullYear()) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  return true;
}

/**
 * Import members from CSV data
 */
export async function importMembersFromCSV(csvData: string): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    imported: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // Remove Excel metadata rows (e.g., "Tabell 1")
    let cleanedData = csvData;
    const lines = csvData.split('\n');
    if (lines.length > 0 && (lines[0].toLowerCase().includes('tabell') || lines[0].startsWith(';;'))) {
      // Skip first line if it's Excel metadata
      cleanedData = lines.slice(1).join('\n');
    }
    
    // Auto-detect delimiter by checking first line
    const firstLine = cleanedData.split('\n')[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';
    
    const parsed = Papa.parse<MemberImportRow>(cleanedData, {
      header: true,
      skipEmptyLines: true,
      delimiter: delimiter,
      transformHeader: (header) => header.trim(),
    });

    if (parsed.errors.length > 0) {
      result.success = false;
      result.errors.push({
        row: 0,
        error: 'CSV parsing error: ' + parsed.errors[0].message,
      });
      return result;
    }

    const db = await getDb();
    if (!db) {
      result.success = false;
      result.errors.push({ row: 0, error: 'Database not available' });
      return result;
    }

    for (let i = 0; i < parsed.data.length; i++) {
      const row = parsed.data[i];
      const rowNumber = i + 2; // +2 because row 1 is header and array is 0-indexed

      try {
        // Validate required fields - only name is required
        if (!row.name || row.name.trim() === '') {
          result.errors.push({
            row: rowNumber,
            error: 'Missing required field: name',
            data: row,
          });
          result.skipped++;
          continue;
        }

        // Validate personnummer format if provided
        if (row.personnummer && !validatePersonnummer(row.personnummer)) {
          result.errors.push({
            row: rowNumber,
            error: 'Invalid personnummer format',
            data: row,
          });
          result.skipped++;
          continue;
        }

        // Check if member already exists (by personnummer if provided, otherwise by email)
        if (row.personnummer) {
          const existing = await db
            .select()
            .from(users)
            .where(eq(users.personnummer, row.personnummer))
            .limit(1);

          if (existing.length > 0) {
            result.errors.push({
              row: rowNumber,
              error: 'Member with this personnummer already exists',
              data: row,
            });
            result.skipped++;
            continue;
          }
        } else if (row.email) {
          // If no personnummer, check by email to avoid duplicates
          const existing = await db
            .select()
            .from(users)
            .where(eq(users.email, row.email))
            .limit(1);

          if (existing.length > 0) {
            result.errors.push({
              row: rowNumber,
              error: 'Member with this email already exists',
              data: row,
            });
            result.skipped++;
            continue;
          }
        }

        // Generate member number using centralized function
        const { generateMemberNumber } = await import('./db');
        const memberNumber = await generateMemberNumber();
        const currentYear = new Date().getFullYear();

        // Generate unique openId for import
        const openId = row.personnummer 
          ? `import:${row.personnummer}` 
          : `import:${memberNumber}:${Date.now()}`;

        // Map Swedish memberType values to internal format
        let memberType: 'ordinarie' | 'hedersmedlem' | 'stodmedlem' = 'ordinarie';
        if (row.memberType) {
          const typeStr = row.memberType.toLowerCase().trim();
          if (typeStr === 'hedersmedlem' || typeStr === 'heder') {
            memberType = 'hedersmedlem';
          } else if (typeStr === 'stodmedlem' || typeStr === 'stöd' || typeStr === 'stod') {
            memberType = 'stodmedlem';
          }
          // 'aktiv', 'ordinarie', or anything else defaults to 'ordinarie'
        }

        // Insert new member
        await db.insert(users).values({
          openId,
          name: row.name.trim(),
          email: row.email?.trim() || null,
          phone: row.phone?.trim() || null,
          personnummer: row.personnummer?.trim() || null,
          streetAddress: row.streetAddress?.trim() || null,
          postalCode: row.postalCode?.trim() || null,
          city: row.city?.trim() || null,
          membershipNumber: memberNumber,
          membershipStatus: 'active',
          memberType: memberType,
          joinYear: row.joinYear || currentYear,
          paymentStatus: 'unpaid',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        result.imported++;
      } catch (error) {
        result.errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: row,
        });
        result.skipped++;
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
    }
  } catch (error) {
    result.success = false;
    result.errors.push({
      row: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return result;
}

/**
 * Export members to Excel
 */
export async function exportMembersToExcel(): Promise<Buffer> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Fetch all active members
  const members = await db
    .select()
    .from(users)
    .where(eq(users.membershipStatus, 'active'));

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Medlemmar');

  // Define columns
  worksheet.columns = [
    { header: 'Medlemsnummer', key: 'membershipNumber', width: 20 },
    { header: 'Namn', key: 'name', width: 30 },
    { header: 'E-post', key: 'email', width: 30 },
    { header: 'Telefon', key: 'phone', width: 15 },
    { header: 'Personnummer', key: 'personnummer', width: 15 },
    { header: 'Gatuadress', key: 'streetAddress', width: 30 },
    { header: 'Postnummer', key: 'postalCode', width: 10 },
    { header: 'Stad', key: 'city', width: 20 },
    { header: 'Medlemstyp', key: 'memberType', width: 15 },
    { header: 'Inträdesår', key: 'joinYear', width: 12 },
    { header: 'Betalningsstatus', key: 'paymentStatus', width: 18 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Add data rows
  members.forEach((member) => {
    worksheet.addRow({
      membershipNumber: member.membershipNumber,
      name: member.name,
      email: member.email,
      phone: member.phone,
      personnummer: member.personnummer,
      streetAddress: member.streetAddress,
      postalCode: member.postalCode,
      city: member.city,
      memberType: member.memberType,
      joinYear: member.joinYear,
      paymentStatus: member.paymentStatus,
    });
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
