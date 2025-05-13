/**
 * Script to update Supabase migration metadata files to reflect only the essential tables
 * This updates any migration management files to remove references to removed tables
 */

const fs = require('fs');
const path = require('path');

// Define essential tables we're keeping
const ESSENTIAL_TABLES = [
  'profiles',
  'trades',
  'snaptrade_credentials', 
  'sessions',
  'user_data',
  'auth_attempts'
];

// Helper to recursively find files
function findFiles(dir, pattern) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results = results.concat(findFiles(filePath, pattern));
    } else if (pattern.test(file)) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Find metadata files (might be in different locations depending on Supabase setup)
function findMetadataFiles() {
  const possibleDirs = [
    'supabase',
    'supabase/migrations',
    'supabase/supabase',
  ];
  
  let metaFiles = [];
  for (const dir of possibleDirs) {
    if (fs.existsSync(dir)) {
      metaFiles = metaFiles.concat(
        findFiles(dir, /meta\.(js|ts|json)$/),
        findFiles(dir, /metadata\.(js|ts|json)$/)
      );
    }
  }
  
  return metaFiles;
}

// Process metadata files to remove references to unneeded tables
function processMetadataFiles() {
  const metaFiles = findMetadataFiles();
  console.log(`Found ${metaFiles.length} metadata files to process`);
  
  for (const file of metaFiles) {
    console.log(`Processing ${file}...`);
    
    try {
      // Read file content
      let content = fs.readFileSync(file, 'utf8');
      const isJson = file.endsWith('.json');
      
      if (isJson) {
        // Process JSON files
        try {
          const data = JSON.parse(content);
          if (data.tables) {
            data.tables = data.tables.filter(table => 
              ESSENTIAL_TABLES.includes(table.name) || 
              ESSENTIAL_TABLES.includes(table.table)
            );
            content = JSON.stringify(data, null, 2);
          }
        } catch (e) {
          console.error(`Error parsing JSON in ${file}: ${e.message}`);
          continue;
        }
      } else {
        // Process JS/TS files - this is more complex as they're code not data
        // Use a simple regex approach to comment out non-essential tables
        for (const tableName of getTableNames(content)) {
          if (!ESSENTIAL_TABLES.includes(tableName)) {
            // Comment out lines with this table name
            const tableRegex = new RegExp(`(.*?)['"]${tableName}['"](.*)`, 'g');
            content = content.replace(tableRegex, '// REMOVED: $&');
          }
        }
      }
      
      // Create backup of original file
      const backupPath = `${file}.bak`;
      fs.writeFileSync(backupPath, fs.readFileSync(file));
      console.log(`Created backup at ${backupPath}`);
      
      // Write updated content
      fs.writeFileSync(file, content);
      console.log(`Updated ${file}`);
    } catch (e) {
      console.error(`Error processing ${file}: ${e.message}`);
    }
  }
}

// Helper to extract potential table names from content
function getTableNames(content) {
  // This is a simplistic approach - in a real scenario, you'd want to parse the file properly
  const tablePattern = /['"]([a-z_]+)['"]\s*:/g;
  const tableNames = new Set();
  let match;
  
  while ((match = tablePattern.exec(content)) !== null) {
    tableNames.add(match[1]);
  }
  
  return Array.from(tableNames);
}

// Main execution
console.log('Starting Supabase migration metadata update...');
processMetadataFiles();
console.log('Completed Supabase migration metadata update'); 