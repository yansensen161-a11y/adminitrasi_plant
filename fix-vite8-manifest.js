/**
 * fix-vite8-manifest.js
 * 
 * Workaround for Vite 8 / Rolldown bug on Windows:
 * Rolldown generates files without underscore prefix but manifest references them WITH underscore.
 * This script creates copies of the generated files with the underscore-prefixed names.
 * 
 * Run after: npm run build
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildDir = join(__dirname, 'public', 'build');
const assetsDir = join(buildDir, 'assets');
const manifestPath = join(buildDir, 'manifest.json');

if (!existsSync(manifestPath)) {
    console.log('No manifest found, skipping fix.');
    process.exit(0);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
let fixedCount = 0;

for (const [key, entry] of Object.entries(manifest)) {
    // Fix imports that start with underscore but don't have the file
    if (entry.imports) {
        for (const imp of entry.imports) {
            if (imp.startsWith('_')) {
                const withUnderscore = join(assetsDir, imp);
                const withoutUnderscore = join(assetsDir, imp.slice(1)); // remove leading _
                
                if (!existsSync(withUnderscore) && existsSync(withoutUnderscore)) {
                    copyFileSync(withoutUnderscore, withUnderscore);
                    console.log(`Fixed: ${imp.slice(1)} -> ${imp}`);
                    fixedCount++;
                }
            }
        }
    }
    
    // Fix dynamicImports too
    if (entry.dynamicImports) {
        for (const imp of entry.dynamicImports) {
            if (imp.startsWith('_')) {
                const withUnderscore = join(assetsDir, imp);
                const withoutUnderscore = join(assetsDir, imp.slice(1));
                
                if (!existsSync(withUnderscore) && existsSync(withoutUnderscore)) {
                    copyFileSync(withoutUnderscore, withUnderscore);
                    console.log(`Fixed dynamic: ${imp.slice(1)} -> ${imp}`);
                    fixedCount++;
                }
            }
        }
    }
}

if (fixedCount > 0) {
    console.log(`\n✓ Fixed ${fixedCount} missing chunk file(s) for Vite 8/Rolldown Windows compatibility.`);
} else {
    console.log('No missing chunks found. Build looks correct!');
}
