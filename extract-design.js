import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const zipFile = path.resolve('design.zip');

// Files that live OUTSIDE design.zip (kept at the repo root) and are copied into public/
// so Vite publishes them: video.mp4 -> /video.mp4 , "version html/" -> /version%20html/
function syncExternalAssets() {
  fs.mkdirSync('public', { recursive: true });
  if (fs.existsSync('video.mp4')) {
    fs.copyFileSync('video.mp4', path.join('public', 'video.mp4'));
    console.log('🎬 [Assets] video.mp4 copied to public/video.mp4');
  } else {
    console.warn('⚠️ [Assets] video.mp4 not found at repo root.');
  }
  if (fs.existsSync('version html')) {
    fs.cpSync('version html', path.join('public', 'version html'), { recursive: true });
    console.log('📁 [Assets] "version html" folder copied to public/version html');
  } else {
    console.warn('⚠️ [Assets] "version html" folder not found at repo root.');
  }
}

if (!fs.existsSync(zipFile)) {
  console.log('ℹ️ [Render Auto-Unzip] "design.zip" not found. Continuing with existing files.');
  syncExternalAssets();
  process.exit(0);
}

console.log('📦 [Render Auto-Unzip] Extracting "design.zip"...');

try {
  // Use unzip with overwrite
  execSync('unzip -o -q design.zip', { stdio: 'inherit' });
} catch (err) {
  // Unzip on Linux often exits with code 1/2 for Windows zip attribute warnings
  // Check if the files were actually extracted despite the warning
  if (!fs.existsSync('src') && !fs.existsSync('index.html')) {
    try {
      execSync('tar -xf design.zip', { stdio: 'inherit' });
    } catch (_) {
      console.warn('⚠️ Fallback extraction attempted.');
    }
  }
}

// Verify that extraction succeeded
if (fs.existsSync('src') || fs.existsSync('index.html')) {
  console.log('✅ [Render Auto-Unzip] Files extracted successfully.');
} else {
  console.error('❌ [Render Auto-Unzip] Error: Could not extract design.zip files.');
  process.exit(1);
}

// Crucial: Fix directory and file permissions on Linux
// Windows zip archives do not include execute (+x) permissions on folders,
// which causes "Permission denied" errors on Linux.
if (process.platform !== 'win32') {
  console.log('🔧 [Render Auto-Unzip] Applying Linux read/write/execute permissions...');
  try {
    execSync('chmod -R 777 . 2>/dev/null || chmod -R 755 . 2>/dev/null || true');
  } catch (_) {}

  function fixPermissionsRecursively(dir) {
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        if (item.name === 'node_modules' || item.name === '.git') continue;
        const full = path.join(dir, item.name);
        try {
          if (item.isDirectory()) {
            fs.chmodSync(full, 0o755);
            fixPermissionsRecursively(full);
          } else {
            fs.chmodSync(full, 0o644);
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  fixPermissionsRecursively(path.resolve('.'));
}

syncExternalAssets();

console.log('🚀 [Render Auto-Unzip] Ready for build!');
