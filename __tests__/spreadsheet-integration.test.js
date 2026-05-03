const fs = require('fs');
const path = require('path');

// Validate environment variables BEFORE importing modules
if (!process.env.SHEETS_CREDENTIALS) {
  console.error('❌ SHEETS_CREDENTIALS environment variable is required');
  console.error('');
  console.error('Cria um ficheiro .env na raiz do projeto com:');
  console.error('SHEETS_CREDENTIALS=<base64-encoded-json>');
  console.error('SPREADSHEET_ID=<spreadsheet-id>');
  console.error('WORKSHEET_NAME=<worksheet-name>');
  process.exit(1);
}

if (!process.env.SPREADSHEET_ID) {
  console.error('❌ SPREADSHEET_ID environment variable is required');
  process.exit(1);
}

if (!process.env.WORKSHEET_NAME) {
  console.error('❌ WORKSHEET_NAME environment variable is required');
  process.exit(1);
}

// Validate SHEETS_CREDENTIALS is valid base64 and contains valid JSON
try {
  const decoded = Buffer.from(process.env.SHEETS_CREDENTIALS, 'base64').toString('utf8');
  const parsed = JSON.parse(decoded);

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('SHEETS_CREDENTIALS JSON must contain client_email and private_key');
  }
  console.log('✅ SHEETS_CREDENTIALS validadas com sucesso');
} catch (error) {
  console.error('❌ Error validating SHEETS_CREDENTIALS:');
  console.error('   Current value:', process.env.SHEETS_CREDENTIALS.substring(0, 50) + '...');
  console.error('   Length:', process.env.SHEETS_CREDENTIALS.length);
  console.error('   Error:', error.message);
  console.error('');
  console.error('Verifica que o .env contém:');
  console.error('SHEETS_CREDENTIALS=<base64-sem-aspas>');
  process.exit(1);
}

// Set defaults
if (!process.env.AUTHORS_AMOUNT) {
  process.env.AUTHORS_AMOUNT = '2';
}
if (!process.env.GITHUB_REPOSITORY) {
  process.env.GITHUB_REPOSITORY = 'test-user/test-repo';
}

// NOW import the modules after env vars are validated
const { GetWorksheet, GetRow } = require('../src/sheets/spreadsheet');
const { Auth } = require('../src/helpers/auth');
const { PostResults } = require('../src/post-results');

describe('Spreadsheet Integration Tests', () => {
  beforeAll(() => {
    console.log('');
    console.log('🧪 A executar testes de integração...');
    console.log('   SPREADSHEET_ID:', process.env.SPREADSHEET_ID);
    console.log('   WORKSHEET_NAME:', process.env.WORKSHEET_NAME);
    console.log('');
  });

  describe('Spreadsheet Module', () => {
    test('should connect to spreadsheet and get worksheet', async () => {
      const sheet = await GetWorksheet(
        process.env.SPREADSHEET_ID,
        process.env.WORKSHEET_NAME
      );

      expect(sheet).toBeDefined();
      expect(sheet.title).toBeDefined();
      console.log(`✅ Connected to worksheet: ${sheet.title}`);
    }, 30000);

    test('should load header row and verify columns', async () => {
      const sheet = await GetWorksheet(
        process.env.SPREADSHEET_ID,
        process.env.WORKSHEET_NAME
      );

      await sheet.loadHeaderRow();
      const headers = sheet.headerValues;

      expect(headers).toBeDefined();
      expect(headers.length).toBeGreaterThan(0);

      // Verify essential columns exist
      expect(headers).toContain('numero');
      expect(headers).toContain('nome');
      expect(headers).toContain('repositorio');

      console.log(`✅ Found columns: ${headers.join(', ')}`);
    }, 30000);

    test('should read rows from worksheet', async () => {
      const sheet = await GetWorksheet(
        process.env.SPREADSHEET_ID,
        process.env.WORKSHEET_NAME
      );

      const rows = await sheet.getRows({ offset: 0, limit: 5 });

      expect(rows).toBeDefined();
      expect(Array.isArray(rows)).toBe(true);

      if (rows.length > 0) {
        console.log(`✅ Read ${rows.length} rows`);
        console.log(`   First row numero: ${rows[0].get('numero')}`);
      }
    }, 30000);
  });

  describe('GetRow Function', () => {
    test('should find row by numero', async () => {
      // Try to read student number from AUTHORS.txt
      const authorsPath = path.join(__dirname, '..', 'AUTHORS.txt');
      let testNumero;

      if (fs.existsSync(authorsPath)) {
        const authorsContent = fs.readFileSync(authorsPath, 'utf-8');
        const authors = authorsContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);

        if (authors.length > 0) {
          testNumero = authors[0];
          console.log(`Using student from AUTHORS.txt: ${testNumero}`);
        }
      }

      // Fallback: get first student from sheet if AUTHORS.txt doesn't exist
      if (!testNumero) {
        console.log('AUTHORS.txt not found, using first row from sheet');
        const sheet = await GetWorksheet(
          process.env.SPREADSHEET_ID,
          process.env.WORKSHEET_NAME
        );
        const rows = await sheet.getRows({ offset: 0, limit: 1 });

        if (rows.length === 0) {
          console.log('⚠️  No rows in sheet, skipping test');
          return;
        }

        testNumero = rows[0].get('numero');
      }

      const foundRows = await GetRow(
        process.env.SPREADSHEET_ID,
        process.env.WORKSHEET_NAME,
        { title: 'numero', instance: testNumero }
      );

      expect(foundRows).toBeDefined();
      expect(foundRows.length).toBeGreaterThan(0);
      expect(foundRows[0].get('numero')).toBe(testNumero);

      console.log(`✅ Found student ${testNumero}: ${foundRows[0].get('nome')}`);
    }, 30000);
  });

  describe('Cell-Level Updates', () => {
    test('should update only repositorio cell without affecting other cells', async () => {
      // Try to read student number from AUTHORS.txt
      const authorsPath = path.join(__dirname, '..', 'AUTHORS.txt');
      let testNumero;

      if (fs.existsSync(authorsPath)) {
        const authorsContent = fs.readFileSync(authorsPath, 'utf-8');
        const authors = authorsContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);

        if (authors.length > 0) {
          testNumero = authors[0];
          console.log(`Using student from AUTHORS.txt: ${testNumero}`);
        }
      }

      const sheet = await GetWorksheet(
        process.env.SPREADSHEET_ID,
        process.env.WORKSHEET_NAME
      );

      await sheet.loadHeaderRow();
      const headers = sheet.headerValues;
      const repositorioColIndex = headers.indexOf('repositorio');

      expect(repositorioColIndex).toBeGreaterThanOrEqual(0);

      // Get row for the student from AUTHORS.txt or first row
      let testRow;
      if (testNumero) {
        const foundRows = await GetRow(
          process.env.SPREADSHEET_ID,
          process.env.WORKSHEET_NAME,
          { title: 'numero', instance: testNumero }
        );
        if (foundRows.length === 0) {
          console.log(`⚠️  Student ${testNumero} not found in sheet, using first row`);
          const rows = await sheet.getRows({ offset: 0, limit: 1 });
          testRow = rows[0];
        } else {
          testRow = foundRows[0];
        }
      } else {
        console.log('No AUTHORS.txt, using first row from sheet');
        const rows = await sheet.getRows({ offset: 0, limit: 1 });
        if (rows.length === 0) {
          console.log('⚠️  No rows in sheet, skipping test');
          return;
        }
        testRow = rows[0];
      }

      const rowIndex = testRow._rowNumber - 1;

      // Store original values of other columns
      const originalNome = testRow.get('nome');
      const originalNumero = testRow.get('numero');

      // Load cells and update only repositorio
      await sheet.loadCells(`A${rowIndex + 1}:Z${rowIndex + 1}`);

      const testRepoUrl = `https://github.com/test/repo-${Date.now()}`;
      const cell = sheet.getCell(rowIndex, repositorioColIndex);
      cell.value = testRepoUrl;

      await sheet.saveUpdatedCells();

      // Verify the update
      const updatedRows = await sheet.getRows({ offset: 0, limit: 1 });
      const updatedRow = updatedRows[0];

      expect(updatedRow.get('repositorio')).toBe(testRepoUrl);
      expect(updatedRow.get('nome')).toBe(originalNome);
      expect(updatedRow.get('numero')).toBe(originalNumero);

      console.log(`✅ Updated only repositorio cell`);
      console.log(`   Original nome: ${originalNome} -> Current: ${updatedRow.get('nome')}`);
      console.log(`   Original numero: ${originalNumero} -> Current: ${updatedRow.get('numero')}`);
      console.log(`   New repositorio: ${testRepoUrl}`);
    }, 30000);

    test('should update multiple test score cells in batch', async () => {
      const sheet = await GetWorksheet(
        process.env.SPREADSHEET_ID,
        process.env.WORKSHEET_NAME
      );

      await sheet.loadHeaderRow();
      const headers = sheet.headerValues;

      // Find test columns (you might need to adjust these column names)
      const testColumns = headers.filter(h =>
        h.toLowerCase().includes('test') || h.toLowerCase().includes('exerc')
      );

      if (testColumns.length === 0) {
        console.log('⚠️  No test columns found, skipping test');
        return;
      }

      const rows = await sheet.getRows({ offset: 0, limit: 1 });
      if (rows.length === 0) {
        console.log('⚠️  No rows in sheet, skipping test');
        return;
      }

      const testRow = rows[0];
      const rowIndex = testRow._rowNumber - 1;

      await sheet.loadCells(`A1:Z${rowIndex + 1}`);

      // Update multiple test columns
      const testScores = [5, 10, 8];
      testColumns.slice(0, 3).forEach((colName, idx) => {
        const colIndex = headers.indexOf(colName);
        const cell = sheet.getCell(rowIndex, colIndex);
        cell.value = testScores[idx] || 0;
      });

      await sheet.saveUpdatedCells();

      // Verify updates
      const updatedRows = await sheet.getRows({ offset: 0, limit: 1 });
      const updatedRow = updatedRows[0];

      console.log(`✅ Updated ${testColumns.slice(0, 3).length} test score cells in single batch`);
      testColumns.slice(0, 3).forEach((colName, idx) => {
        console.log(`   ${colName}: ${updatedRow.get(colName)}`);
      });
    }, 30000);
  });

  describe('Auth Module Integration', () => {
    test('should authenticate authors and get their info', async () => {
      // Read AUTHORS.txt if it exists
      const authorsPath = path.join(__dirname, '..', 'AUTHORS.txt');

      if (!fs.existsSync(authorsPath)) {
        console.log('⚠️  AUTHORS.txt not found, skipping test');
        console.log('   Create AUTHORS.txt with student numbers (one per line)');
        return;
      }

      const authorsContent = fs.readFileSync(authorsPath, 'utf-8');
      const authors = authorsContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (authors.length === 0) {
        console.log('⚠️  AUTHORS.txt is empty, skipping test');
        return;
      }

      console.log(`Testing with authors: ${authors.join(', ')}`);

      return new Promise((resolve, reject) => {
        Auth(authors, {
          success: (authorsInfo) => {
            expect(authorsInfo).toBeDefined();
            expect(authorsInfo.length).toBeGreaterThan(0);

            console.log(`✅ Authenticated ${authorsInfo.length} authors:`);
            authorsInfo.forEach(info => {
              console.log(`   ${info.get('numero')} - ${info.get('nome')}`);
            });

            resolve();
          },
          failure: (error) => {
            reject(error);
          }
        });
      });
    }, 60000);
  });

  describe('PostResults Integration', () => {
    test('should post test results using cell-level updates', async () => {
      const authorsPath = path.join(__dirname, '..', 'AUTHORS.txt');

      if (!fs.existsSync(authorsPath)) {
        console.log('⚠️  AUTHORS.txt not found, skipping test');
        return;
      }

      const authorsContent = fs.readFileSync(authorsPath, 'utf-8');
      const authors = authorsContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (authors.length === 0) {
        console.log('⚠️  AUTHORS.txt is empty, skipping test');
        return;
      }

      // Mock test results
      const mockResults = [
        {
          runner: 'test1',
          results: {
            status: 'pass',
            max_score: 10
          }
        },
        {
          runner: 'test2',
          results: {
            status: 'pass',
            max_score: 15
          }
        }
      ];

      // Temporarily set environment variables for test
      const originalRepo = process.env.GITHUB_REPOSITORY;
      const originalWorkspace = process.env.GITHUB_WORKSPACE;

      process.env.GITHUB_REPOSITORY = `test-user/test-repo-${Date.now()}`;
      process.env.GITHUB_WORKSPACE = path.join(__dirname, '..');

      try {
        await PostResults(mockResults);
        console.log(`✅ Successfully posted test results`);
        console.log(`   Total score: 25`);
      } finally {
        // Restore original environment variables
        process.env.GITHUB_REPOSITORY = originalRepo;
        if (originalWorkspace) {
          process.env.GITHUB_WORKSPACE = originalWorkspace;
        } else {
          delete process.env.GITHUB_WORKSPACE;
        }
      }
    }, 60000);
  });
});
