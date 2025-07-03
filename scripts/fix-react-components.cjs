#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// React component patterns that need fixing
const REACT_COMPONENT_PATTERNS = [
  // Function components
  { from: /^function _([A-Z]\w*)/gm, to: 'function $1' },
  { from: /^const _([A-Z]\w*) = /gm, to: 'const $1 = ' },
  { from: /^export default _([A-Z]\w*);$/gm, to: 'export default $1;' },
  { from: /^export { _([A-Z]\w*) };$/gm, to: 'export { $1 };' },
  
  // Function declarations at end of file
  { from: /'([A-Z]\w*)' is not defined/g, to: "'$1' is not defined" },
  
  // Import fixes for missing React imports
  { from: /import React from 'react';\s*import { ([^}]+) } from '([^']+)';/g, to: "import React, { $1 } from 'react';\nimport { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';" },
];

// Common React imports that are often missing
const COMMON_IMPORTS = {
  'useNavigate': "import { useNavigate } from 'react-router-dom';",
  'useLocation': "import { useLocation } from 'react-router-dom';",
  'useSearchParams': "import { useSearchParams } from 'react-router-dom';",
  'Link': "import { Link } from 'react-router-dom';",
  'useSupabaseAuth': "import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';",
};

// Icons that are commonly missing
const LUCIDE_ICONS = [
  'CheckCircle', 'AlertCircle', 'Star', 'Calendar', 'Coffee', 'Edit2', 'User', 'Mail', 
  'Phone', 'Save', 'X', 'Lock', 'EyeOff', 'Eye', 'Shield', 'ChevronRight', 'ChevronLeft',
  'Award', 'Truck', 'Target', 'FileText', 'Building'
];

function fixReactComponent(content, filePath) {
  let fixed = content;
  let changes = 0;

  // Fix React component function names
  REACT_COMPONENT_PATTERNS.forEach(pattern => {
    const matches = fixed.match(pattern.from);
    if (matches) {
      fixed = fixed.replace(pattern.from, pattern.to);
      changes += matches.length;
    }
  });

  // Add missing React Router imports if useNavigate, Link etc are used
  if (content.includes('useNavigate') && !content.includes("from 'react-router-dom'")) {
    const reactImportLine = fixed.match(/import React.*from 'react';/);
    if (reactImportLine) {
      fixed = fixed.replace(
        reactImportLine[0],
        `${reactImportLine[0]}\nimport { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';`
      );
      changes++;
    }
  }

  // Add missing Supabase Auth import
  if (content.includes('useSupabaseAuth') && !content.includes('SupabaseAuthContext')) {
    const reactImportLine = fixed.match(/import React.*from 'react';/);
    if (reactImportLine) {
      fixed = fixed.replace(
        reactImportLine[0],
        `${reactImportLine[0]}\nimport { useSupabaseAuth } from '../contexts/SupabaseAuthContext';`
      );
      changes++;
    }
  }

  // Add missing Lucide React icons
  const usedIcons = LUCIDE_ICONS.filter(icon => content.includes(icon));
  if (usedIcons.length > 0 && !content.includes('lucide-react')) {
    const reactImportLine = fixed.match(/import React.*from 'react';/);
    if (reactImportLine) {
      fixed = fixed.replace(
        reactImportLine[0],
        `${reactImportLine[0]}\nimport { ${usedIcons.join(', ')} } from 'lucide-react';`
      );
      changes++;
    }
  }

  // Fix common variable declaration issues
  fixed = fixed.replace(/const _(\w+) = /g, (match, varName) => {
    // Keep underscore for variables that are truly unused, but not for React components
    if (varName.match(/^[A-Z]/)) {
      changes++;
      return `const ${varName} = `;
    }
    return match;
  });

  // Fix function parameters that shouldn't have underscores
  fixed = fixed.replace(/function (\w+)\(([^)]*)\)/g, (match, funcName, params) => {
    if (funcName.startsWith('_') && funcName.match(/^_[A-Z]/)) {
      const newFuncName = funcName.substring(1);
      changes++;
      return `function ${newFuncName}(${params})`;
    }
    return match;
  });

  return { content: fixed, changes };
}

function fixVariableDeclarations(content) {
  let fixed = content;
  let changes = 0;

  // Common variable declaration patterns that need fixing
  const declarations = [
    'sum', 'digit', 'numbers', 'formattedValue', 'newErrors', 'result', 'features',
    'fullURL', 'currentURL', 'params', 'accessToken', 'refreshToken', 'type',
    'sessionData', 'strength', 'cart', 'cleanup', 'mockUser', 'mockProducts',
    'localStorageMock', 'sessionStorageMock', 'clientData', 'createCustomerAPI',
    'initialState', 'supabaseResult'
  ];

  declarations.forEach(varName => {
    // Add declarations for commonly undefined variables
    if (content.includes(`'${varName}' is not defined`) && !content.includes(`const ${varName}`)) {
      // Add a basic declaration at the beginning of the function
      const functionMatch = fixed.match(/function \w+\([^)]*\)\s*{/);
      if (functionMatch) {
        fixed = fixed.replace(
          functionMatch[0],
          `${functionMatch[0]}\n  let ${varName};`
        );
        changes++;
      }
    }
  });

  return { content: fixed, changes };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let result = content;
    let totalChanges = 0;

    // Apply React component fixes
    const componentResult = fixReactComponent(result, filePath);
    result = componentResult.content;
    totalChanges += componentResult.changes;

    // Apply variable declaration fixes
    const varResult = fixVariableDeclarations(result);
    result = varResult.content;
    totalChanges += varResult.changes;

    // Only write if changes were made
    if (totalChanges > 0 && result !== content) {
      fs.writeFileSync(filePath, result, 'utf8');
      console.log(`✅ Fixed ${totalChanges} React issues in ${filePath}`);
      return totalChanges;
    }

    return 0;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return 0;
  }
}

function getAllFiles(dir, extensions = ['.jsx', '.js', '.tsx', '.ts']) {
  let files = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(entry)) {
      files = files.concat(getAllFiles(fullPath, extensions));
    } else if (stat.isFile() && extensions.some(ext => fullPath.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function main() {
  console.log('🔧 Fixing React component naming issues...\n');

  const files = getAllFiles('src');
  let totalFiles = 0;
  let totalChanges = 0;

  files.forEach(file => {
    const changes = processFile(file);
    if (changes > 0) {
      totalFiles++;
      totalChanges += changes;
    }
  });

  console.log(`\n✨ React fixes completed:`);
  console.log(`📁 Files processed: ${totalFiles}`);
  console.log(`🔧 Total changes: ${totalChanges}`);
}

if (require.main === module) {
  main();
}