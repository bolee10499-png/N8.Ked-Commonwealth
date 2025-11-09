/**
 * COMPLEXITY ANALYZER
 * 
 * Scans codebase for the 3 most complex functions based on:
 * - Cyclomatic complexity (branches, loops, conditions)
 * - Line count
 * - Nesting depth
 * 
 * Purpose: Identify technical debt hotspots and refactoring candidates
 */

const fs = require('fs');
const path = require('path');

class ComplexityAnalyzer {
  constructor() {
    this.results = [];
  }

  analyzeFile(filePath, content) {
    const lines = content.split('\n');
    let currentFunction = null;
    let braceDepth = 0;
    let functionStart = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Detect function declarations
      const funcMatch = line.match(/(async\s+)?(\w+)\s*\([^)]*\)\s*{/) ||
                        line.match(/(\w+):\s*(async\s+)?function\s*\([^)]*\)\s*{/);

      if (funcMatch && !trimmed.startsWith('//')) {
        if (currentFunction && braceDepth === 0) {
          // End previous function
          this.analyzeFunction(filePath, currentFunction, lines, functionStart, i - 1);
        }

        currentFunction = {
          name: funcMatch[2] || funcMatch[1],
          startLine: i + 1,
          complexity: 1 // Base complexity
        };
        functionStart = i;
        braceDepth = 1;
        continue;
      }

      if (currentFunction) {
        // Track brace depth
        braceDepth += (line.match(/{/g) || []).length;
        braceDepth -= (line.match(/}/g) || []).length;

        // Count complexity contributors
        if (trimmed.match(/\bif\s*\(/) && !trimmed.startsWith('//')) currentFunction.complexity++;
        if (trimmed.match(/\belse\s+(if\s*)?\{/) && !trimmed.startsWith('//')) currentFunction.complexity++;
        if (trimmed.match(/\bfor\s*\(/) && !trimmed.startsWith('//')) currentFunction.complexity++;
        if (trimmed.match(/\bwhile\s*\(/) && !trimmed.startsWith('//')) currentFunction.complexity++;
        if (trimmed.match(/\bcase\s+/) && !trimmed.startsWith('//')) currentFunction.complexity++;
        if (trimmed.match(/\bcatch\s*\(/) && !trimmed.startsWith('//')) currentFunction.complexity++;
        if (trimmed.match(/&&|\|\|/) && !trimmed.startsWith('//')) {
          // Count logical operators
          const operators = (trimmed.match(/&&|\|\|/g) || []).length;
          currentFunction.complexity += operators;
        }

        if (braceDepth === 0) {
          // Function ended
          this.analyzeFunction(filePath, currentFunction, lines, functionStart, i);
          currentFunction = null;
        }
      }
    }
  }

  analyzeFunction(filePath, funcData, lines, start, end) {
    const funcLines = lines.slice(start, end + 1);
    const lineCount = funcLines.length;
    const maxNesting = this.calculateMaxNesting(funcLines);
    const paramCount = this.countParameters(lines[start]);

    this.results.push({
      file: path.basename(filePath),
      fullPath: filePath,
      function: funcData.name,
      complexity: funcData.complexity,
      lines: lineCount,
      maxNesting: maxNesting,
      parameters: paramCount,
      startLine: funcData.startLine,
      score: funcData.complexity * 2 + lineCount * 0.5 + maxNesting * 3 + paramCount
    });
  }

  calculateMaxNesting(lines) {
    let maxDepth = 0;
    let currentDepth = 0;

    for (const line of lines) {
      currentDepth += (line.match(/{/g) || []).length;
      maxDepth = Math.max(maxDepth, currentDepth);
      currentDepth -= (line.match(/}/g) || []).length;
    }

    return maxDepth;
  }

  countParameters(line) {
    const match = line.match(/\(([^)]*)\)/);
    if (!match) return 0;
    const params = match[1].trim();
    if (!params) return 0;
    return params.split(',').length;
  }

  scanDirectory(dir, extensions = ['.js']) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !file.startsWith('.') && !file.includes('node_modules')) {
        this.scanDirectory(fullPath, extensions);
      } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          this.analyzeFile(fullPath, content);
        } catch (error) {
          console.error(`Error reading ${fullPath}:`, error.message);
        }
      }
    }
  }

  getTopComplexFunctions(count = 10) {
    return this.results
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  generateReport() {
    const top = this.getTopComplexFunctions(10);

    console.log('\n📊 COMPLEXITY ANALYSIS REPORT');
    console.log('═'.repeat(80));
    console.log(`Total Functions Analyzed: ${this.results.length}`);
    console.log(`\n🔥 TOP 10 MOST COMPLEX FUNCTIONS (Refactoring Candidates)\n`);

    top.forEach((func, i) => {
      console.log(`${i + 1}. ${func.function}()`);
      console.log(`   File: ${func.file}:${func.startLine}`);
      console.log(`   Cyclomatic Complexity: ${func.complexity}`);
      console.log(`   Lines: ${func.lines}`);
      console.log(`   Max Nesting: ${func.maxNesting}`);
      console.log(`   Parameters: ${func.parameters}`);
      console.log(`   Complexity Score: ${func.score.toFixed(1)}`);
      console.log('');
    });

    // Statistics
    const avgComplexity = this.results.reduce((sum, f) => sum + f.complexity, 0) / this.results.length;
    const avgLines = this.results.reduce((sum, f) => sum + f.lines, 0) / this.results.length;
    const highComplexity = this.results.filter(f => f.complexity > 10).length;

    console.log('📈 CODEBASE STATISTICS');
    console.log('─'.repeat(80));
    console.log(`Average Cyclomatic Complexity: ${avgComplexity.toFixed(2)}`);
    console.log(`Average Function Length: ${avgLines.toFixed(1)} lines`);
    console.log(`High Complexity Functions (>10): ${highComplexity} (${((highComplexity / this.results.length) * 100).toFixed(1)}%)`);
    console.log('');

    // Recommendations
    console.log('💡 RECOMMENDATIONS');
    console.log('─'.repeat(80));
    
    if (avgComplexity > 5) {
      console.log('⚠️  Average complexity above recommended threshold (5)');
      console.log('   → Consider breaking down complex functions into smaller utilities');
    } else {
      console.log('✅ Average complexity within acceptable range');
    }

    if (avgLines > 30) {
      console.log('⚠️  Average function length above ideal (30 lines)');
      console.log('   → Extract helper functions from large methods');
    } else {
      console.log('✅ Function length manageable');
    }

    if (highComplexity > this.results.length * 0.1) {
      console.log(`⚠️  ${highComplexity} functions exceed complexity threshold`);
      console.log('   → Priority refactoring targets identified above');
    } else {
      console.log('✅ Low percentage of complex functions');
    }

    console.log('\n📁 FILES WITH HIGHEST AVERAGE COMPLEXITY\n');
    const fileStats = {};
    
    this.results.forEach(func => {
      if (!fileStats[func.file]) {
        fileStats[func.file] = { total: 0, count: 0, functions: [] };
      }
      fileStats[func.file].total += func.complexity;
      fileStats[func.file].count++;
      fileStats[func.file].functions.push(func);
    });

    const fileComplexity = Object.entries(fileStats)
      .map(([file, stats]) => ({
        file,
        avgComplexity: stats.total / stats.count,
        functionCount: stats.count,
        maxComplexity: Math.max(...stats.functions.map(f => f.complexity))
      }))
      .sort((a, b) => b.avgComplexity - a.avgComplexity)
      .slice(0, 5);

    fileComplexity.forEach((file, i) => {
      console.log(`${i + 1}. ${file.file}`);
      console.log(`   Functions: ${file.functionCount}`);
      console.log(`   Avg Complexity: ${file.avgComplexity.toFixed(2)}`);
      console.log(`   Max Complexity: ${file.maxComplexity}`);
      console.log('');
    });
  }
}

// Execute analysis
const analyzer = new ComplexityAnalyzer();

console.log('🔍 Scanning codebase for complexity analysis...\n');

const projectRoot = path.join(__dirname);
const directories = ['core', 'discord', 'identity', 'circuits', 'governance', 'income'];

directories.forEach(dir => {
  const fullPath = path.join(projectRoot, dir);
  if (fs.existsSync(fullPath)) {
    console.log(`Analyzing ${dir}/...`);
    analyzer.scanDirectory(fullPath);
  }
});

analyzer.generateReport();

// Export top 3 for detailed analysis
console.log('\n📝 DETAILED ANALYSIS OF TOP 3 FUNCTIONS\n');
console.log('═'.repeat(80));

const top3 = analyzer.getTopComplexFunctions(3);

top3.forEach((func, i) => {
  console.log(`\n### ${i + 1}. ${func.function}() - ${func.file}:${func.startLine}`);
  console.log(`**Complexity Score:** ${func.score.toFixed(1)}`);
  console.log(`**Cyclomatic Complexity:** ${func.complexity} (branches/conditions)`);
  console.log(`**Lines:** ${func.lines}`);
  console.log(`**Max Nesting Depth:** ${func.maxNesting}`);
  console.log(`**Parameters:** ${func.parameters}`);
  console.log('');
  console.log('**What It Does:**');
  
  // Read and display first 5 lines of function for context
  try {
    const content = fs.readFileSync(func.fullPath, 'utf8');
    const lines = content.split('\n');
    const functionLines = lines.slice(func.startLine - 1, func.startLine + 4);
    
    console.log('```javascript');
    functionLines.forEach((line, idx) => {
      console.log(`${func.startLine + idx}: ${line}`);
    });
    console.log('... [truncated]');
    console.log('```');
  } catch (error) {
    console.log('(Unable to read file)');
  }
  
  console.log('\n**Refactoring Suggestions:**');
  
  if (func.complexity > 15) {
    console.log('- ⚠️  CRITICAL: Complexity >15 - high risk for bugs');
    console.log('- Extract branching logic into separate validator functions');
    console.log('- Consider state machine pattern if handling multiple states');
  }
  
  if (func.lines > 50) {
    console.log('- ⚠️  Function exceeds 50 lines - difficult to unit test');
    console.log('- Break into smaller, single-responsibility functions');
  }
  
  if (func.maxNesting > 4) {
    console.log('- ⚠️  Deep nesting detected - reduces readability');
    console.log('- Use early returns to reduce nesting');
    console.log('- Extract nested blocks into helper functions');
  }
  
  if (func.parameters > 4) {
    console.log('- ⚠️  Too many parameters - consider options object');
    console.log('- Refactor: (param1, param2, options = {}) instead of 5+ params');
  }
  
  console.log('─'.repeat(80));
});

console.log('\n✅ Analysis complete. Report saved above.\n');
