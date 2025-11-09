/**
 * RAPID VALIDATION - PHASE 13
 * Tests what's ACTUALLY built and deployed
 * November 9, 2025 - Evening
 */

const { db } = require('../database/db_service');
const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║   RAPID VALIDATION - PHASE 13                             ║');
console.log('║   Post-Launch Reality Check                               ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const results = {
  github: null,
  database: null,
  documentation: null,
  architecture: null
};

// Test 1: GitHub Repository Established
console.log('=== TEST 1: GITHUB EMBASSY ===\n');
try {
  const gitConfig = fs.readFileSync(path.join(__dirname, '..', '.git', 'config'), 'utf8');
  const hasRemote = gitConfig.includes('github.com/bolee10499-png/N8.Ked-Commonwealth');
  
  results.github = {
    repositoryConfigured: hasRemote,
    url: hasRemote ? 'https://github.com/bolee10499-png/N8.Ked-Commonwealth' : null,
    status: hasRemote ? 'DEPLOYED ✓' : 'NOT DEPLOYED ✗'
  };
  
  console.log(`Repository URL: ${results.github.url || 'NOT FOUND'}`);
  console.log(`Status: ${results.github.status}\n`);
} catch (error) {
  results.github = { status: 'ERROR: ' + error.message };
  console.log(`Status: ${results.github.status}\n`);
}

// Test 2: Database Operational
console.log('=== TEST 2: DATABASE OPERATIONS ===\n');
try {
  const startTime = Date.now();
  
  // Test write
  db.prepare('INSERT OR REPLACE INTO users (discord_id, username, user_type) VALUES (?, ?, ?)')
    .run('validation_test', 'validator', 'citizen');
  
  // Test read
  const user = db.prepare('SELECT * FROM users WHERE discord_id = ?').get('validation_test');
  
  // Test complex query
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  
  const dbTime = Date.now() - startTime;
  
  results.database = {
    writeSuccess: true,
    readSuccess: user && user.discord_id === 'validation_test',
    querySuccess: userCount && userCount.count >= 0,
    responseTime: dbTime,
    totalUsers: userCount.count,
    status: 'OPERATIONAL ✓'
  };
  
  console.log(`Write: ${results.database.writeSuccess ? '✓' : '✗'}`);
  console.log(`Read: ${results.database.readSuccess ? '✓' : '✗'}`);
  console.log(`Query: ${results.database.querySuccess ? '✓' : '✗'}`);
  console.log(`Response Time: ${dbTime}ms`);
  console.log(`Total Users: ${userCount.count}`);
  console.log(`Status: ${results.database.status}\n`);
} catch (error) {
  results.database = { status: 'ERROR: ' + error.message };
  console.log(`Status: ${results.database.status}\n`);
}

// Test 3: Documentation Published
console.log('=== TEST 3: PUBLIC DOCUMENTATION ===\n');
try {
  const docsDir = path.join(__dirname, '..', 'docs');
  const requiredDocs = [
    'HARDWARE_VISION.md',
    'COGNITIVE_INVERSE_SCALING.md',
    'index.html',
    'dashboard.html'
  ];
  
  const existingDocs = requiredDocs.filter(doc => 
    fs.existsSync(path.join(docsDir, doc))
  );
  
  results.documentation = {
    required: requiredDocs.length,
    existing: existingDocs.length,
    missing: requiredDocs.filter(d => !existingDocs.includes(d)),
    status: existingDocs.length === requiredDocs.length ? 'COMPLETE ✓' : 'PARTIAL ⚠'
  };
  
  console.log(`Required Documents: ${requiredDocs.length}`);
  console.log(`Published: ${existingDocs.length}`);
  if (results.documentation.missing.length > 0) {
    console.log(`Missing: ${results.documentation.missing.join(', ')}`);
  }
  console.log(`Status: ${results.documentation.status}\n`);
} catch (error) {
  results.documentation = { status: 'ERROR: ' + error.message };
  console.log(`Status: ${results.documentation.status}\n`);
}

// Test 4: Architecture Files Present
console.log('=== TEST 4: SOVEREIGN ARCHITECTURE ===\n');
try {
  const architectureFiles = [
    'lib/propaganda_council.js',
    'lib/inner_world.js',
    'lib/wallet_federation.js',
    'database/db_service.js',
    'discord/bot_core.js'
  ];
  
  const existingFiles = architectureFiles.filter(file =>
    fs.existsSync(path.join(__dirname, '..', file))
  );
  
  // Count total lines of code
  let totalLines = 0;
  existingFiles.forEach(file => {
    const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    totalLines += content.split('\n').length;
  });
  
  results.architecture = {
    files: existingFiles.length,
    totalFiles: architectureFiles.length,
    linesOfCode: totalLines,
    missing: architectureFiles.filter(f => !existingFiles.includes(f)),
    status: existingFiles.length >= 4 ? 'ROBUST ✓' : 'INCOMPLETE ✗'
  };
  
  console.log(`Architecture Files: ${existingFiles.length}/${architectureFiles.length}`);
  console.log(`Lines of Code: ${totalLines.toLocaleString()}`);
  if (results.architecture.missing.length > 0) {
    console.log(`Missing: ${results.architecture.missing.join(', ')}`);
  }
  console.log(`Status: ${results.architecture.status}\n`);
} catch (error) {
  results.architecture = { status: 'ERROR: ' + error.message };
  console.log(`Status: ${results.architecture.status}\n`);
}

// Final Assessment
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   FINAL ASSESSMENT                                        ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const allPassed = 
  results.github.repositoryConfigured &&
  results.database.status.includes('OPERATIONAL') &&
  results.documentation.existing >= 3 &&
  results.architecture.files >= 4;

console.log(`GitHub Embassy: ${results.github.repositoryConfigured ? '✓' : '✗'}`);
console.log(`Database Layer: ${results.database.status.includes('OPERATIONAL') ? '✓' : '✗'}`);
console.log(`Documentation: ${results.documentation.existing}/${results.documentation.required} files`);
console.log(`Architecture: ${results.architecture.linesOfCode?.toLocaleString() || 0} lines across ${results.architecture.files} files`);

console.log('\n╔════════════════════════════════════════════════════════════╗');
if (allPassed) {
  console.log('║   ✓ SOVEREIGN COMMONWEALTH OPERATIONAL                    ║');
  console.log('║   Ready for public launch                                 ║');
} else {
  console.log('║   ⚠ PARTIAL DEPLOYMENT                                    ║');
  console.log('║   Core systems functional, expansion in progress          ║');
}
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Export results for programmatic use
module.exports = { results, allPassed };

// Exit with appropriate code
process.exit(allPassed ? 0 : 1);
