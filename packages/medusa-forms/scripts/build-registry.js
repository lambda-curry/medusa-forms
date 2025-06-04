#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Component metadata configuration
const COMPONENTS = {
  // Base UI Components
  'field-wrapper': {
    description: 'Core wrapper component with error handling and labels',
    dependencies: ['@medusajs/ui'],
    registryDependencies: ['field-error', 'label'],
    files: [
      { name: 'fieldwrapper.tsx', path: 'src/ui/FieldWrapper.tsx' },
      { name: 'types.d.ts', path: 'src/ui/types.d.ts' }
    ]
  },
  'field-error': {
    description: 'Error display component',
    dependencies: ['@medusajs/ui'],
    registryDependencies: [],
    files: [
      { name: 'error.tsx', path: 'src/ui/Error.tsx' }
    ]
  },
  'label': {
    description: 'Label component with tooltip support',
    dependencies: ['@medusajs/ui'],
    registryDependencies: [],
    files: [
      { name: 'label.tsx', path: 'src/ui/Label.tsx' }
    ]
  },
  'input': {
    description: 'Base input component',
    dependencies: ['@medusajs/ui'],
    registryDependencies: ['field-wrapper'],
    files: [
      { name: 'input.tsx', path: 'src/ui/Input.tsx' }
    ]
  },
  'select': {
    description: 'Base select component',
    dependencies: ['@medusajs/ui'],
    registryDependencies: ['field-wrapper'],
    files: [
      { name: 'select.tsx', path: 'src/ui/Select.tsx' }
    ]
  },
  'field-checkbox': {
    description: 'Base checkbox component',
    dependencies: ['@medusajs/ui'],
    registryDependencies: ['field-wrapper', 'label'],
    files: [
      { name: 'fieldcheckbox.tsx', path: 'src/ui/FieldCheckbox.tsx' }
    ]
  },
  'textarea': {
    description: 'Base textarea component',
    dependencies: ['@medusajs/ui'],
    registryDependencies: ['field-wrapper'],
    files: [
      { name: 'textarea.tsx', path: 'src/ui/TextArea.tsx' }
    ]
  },
  'datepicker': {
    description: 'Base datepicker component',
    dependencies: ['@medusajs/ui'],
    registryDependencies: ['field-wrapper'],
    files: [
      { name: 'datepicker.tsx', path: 'src/ui/DatePicker.tsx' }
    ]
  },
  'currency-input': {
    description: 'Base currency input component',
    dependencies: ['@medusajs/ui'],
    registryDependencies: ['field-wrapper'],
    files: [
      { name: 'currency-input.tsx', path: 'src/ui/CurrencyInput.tsx' }
    ]
  },

  // Controlled Components
  'controlled-input': {
    description: 'Input component with react-hook-form integration',
    dependencies: ['react-hook-form'],
    registryDependencies: ['input'],
    files: [
      { name: 'controlled-input.tsx', path: 'src/controlled/ControlledInput.tsx' }
    ]
  },
  'controlled-select': {
    description: 'Select component with react-hook-form integration',
    dependencies: ['react-hook-form'],
    registryDependencies: ['select'],
    files: [
      { name: 'controlled-select.tsx', path: 'src/controlled/ControlledSelect.tsx' }
    ]
  },
  'controlled-checkbox': {
    description: 'Checkbox component with react-hook-form integration',
    dependencies: ['react-hook-form'],
    registryDependencies: ['field-checkbox'],
    files: [
      { name: 'controlled-checkbox.tsx', path: 'src/controlled/ControlledCheckbox.tsx' }
    ]
  },
  'controlled-textarea': {
    description: 'Textarea component with react-hook-form integration',
    dependencies: ['react-hook-form'],
    registryDependencies: ['textarea'],
    files: [
      { name: 'controlled-textarea.tsx', path: 'src/controlled/ControlledTextArea.tsx' }
    ]
  },
  'controlled-datepicker': {
    description: 'DatePicker component with react-hook-form integration',
    dependencies: ['react-hook-form'],
    registryDependencies: ['datepicker'],
    files: [
      { name: 'controlled-datepicker.tsx', path: 'src/controlled/ControlledDatePicker.tsx' }
    ]
  },
  'controlled-currency-input': {
    description: 'CurrencyInput component with react-hook-form integration',
    dependencies: ['react-hook-form'],
    registryDependencies: ['currency-input'],
    files: [
      { name: 'controlled-currency-input.tsx', path: 'src/controlled/ControlledCurrencyInput.tsx' }
    ]
  }
};

function generateRegistryItem(componentName, config) {
  return {
    name: componentName,
    type: 'registry:ui',
    description: config.description,
    dependencies: config.dependencies,
    registryDependencies: config.registryDependencies,
    files: config.files.map(file => ({
      name: file.name,
      path: file.path
    }))
  };
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function buildRegistry() {
  console.log('🏗️  Building medusa-forms registry...');
  
  const registryDir = path.join(__dirname, '../registry');
  ensureDirectoryExists(registryDir);

  // Generate individual component registry files
  Object.entries(COMPONENTS).forEach(([componentName, config]) => {
    const registryItem = generateRegistryItem(componentName, config);
    const filePath = path.join(registryDir, `${componentName}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(registryItem, null, 2));
    console.log(`✅ Generated ${componentName}.json`);
  });

  // Update main registry.json with component list
  const mainRegistry = {
    "$schema": "https://ui.shadcn.com/schema.json",
    "name": "medusa-forms",
    "description": "Controlled form fields for Medusa Admin and Medusa UI",
    "url": "https://raw.githubusercontent.com/lambda-curry/medusa-forms/main/packages/medusa-forms",
    "style": "default",
    "tailwind": {
      "config": "tailwind.config.js",
      "css": "src/styles/globals.css",
      "baseColor": "slate",
      "cssVariables": true
    },
    "aliases": {
      "components": "src/components",
      "utils": "src/lib/utils"
    }
  };

  const mainRegistryPath = path.join(__dirname, '../registry.json');
  fs.writeFileSync(mainRegistryPath, JSON.stringify(mainRegistry, null, 2));
  console.log('✅ Updated main registry.json');

  console.log(`🎉 Registry build complete! Generated ${Object.keys(COMPONENTS).length} component files.`);
}

// Validate that source files exist
function validateSourceFiles() {
  console.log('🔍 Validating source files...');
  
  let allValid = true;
  Object.entries(COMPONENTS).forEach(([componentName, config]) => {
    config.files.forEach(file => {
      const fullPath = path.join(__dirname, '..', file.path);
      if (!fs.existsSync(fullPath)) {
        console.error(`❌ Missing source file: ${file.path} for component ${componentName}`);
        allValid = false;
      }
    });
  });

  if (!allValid) {
    console.error('❌ Some source files are missing. Please check the file paths.');
    process.exit(1);
  }

  console.log('✅ All source files validated');
}

// Main execution
if (require.main === module) {
  validateSourceFiles();
  buildRegistry();
}

module.exports = { buildRegistry, COMPONENTS };

