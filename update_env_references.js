/**
 * This script helps update references to the serverEnv object
 * after we've restructured it to use the unified environment variable approach.
 * 
 * Run this with: node update_env_references.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_DIR = path.join(__dirname, 'src', 'server');

// Map of old references to new references
const REFERENCE_MAP = {
  'serverEnv.supabaseUrl': 'serverEnv.supabase.url',
  'serverEnv.supabaseAnonKey': 'serverEnv.supabase.anonKey',
  'process.env.VITE_SUPABASE_URL': 'process.env.SUPABASE_URL',
  'process.env.VITE_SUPABASE_ANON_KEY': 'process.env.SUPABASE_ANON_KEY',
  'process.env.VITE_SNAPTRADE_CLIENT_ID': 'process.env.SNAPTRADE_CLIENT_ID',
  'process.env.VITE_SNAPTRADE_CONSUMER_KEY': 'process.env.SNAPTRADE_CONSUMER_KEY',
  'process.env.VITE_APP_ENV': 'process.env.NODE_ENV',
  'process.env.VITE_APP_URL': 'process.env.APP_URL',
  'process.env.VITE_API_RATE_LIMIT': 'process.env.API_RATE_LIMIT',
};

// File extensions to process
const FILE_EXTENSIONS = ['.ts', '.js', '.tsx', '.jsx'];

// Count of files updated
let filesUpdated = 0;

/**
 * Process a file and update references
 */
function processFile(filePath) {
  // Skip node_modules
  if (filePath.includes('node_modules')) return;
  
  // Check file extension
  const ext = path.extname(filePath);
  if (!FILE_EXTENSIONS.includes(ext)) return;
  
  // Read file content
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return;
  }
  
  // Check if any replacements are needed
  let needsUpdate = false;
  let updatedContent = content;
  
  // Perform replacements
  for (const [oldRef, newRef] of Object.entries(REFERENCE_MAP)) {
    if (updatedContent.includes(oldRef)) {
      updatedContent = updatedContent.replace(new RegExp(oldRef.replace(/\./g, '\\.'), 'g'), newRef);
      needsUpdate = true;
    }
  }
  
  // Write updated content if needed
  if (needsUpdate) {
    try {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      filesUpdated++;
    } catch (err) {
      console.error(`Error writing file ${filePath}:`, err);
    }
  }
}

/**
 * Recursively traverse directory
 */
function traverseDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      traverseDirectory(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

// Run the script
console.log('Starting environment variable reference update...');
traverseDirectory(SERVER_DIR);
console.log(`Finished! Updated ${filesUpdated} files.`);
console.log('Remember to manually check any complicated references or imports.'); 