#!/usr/bin/env node
/* global __dirname */
const fs = require('fs');
const path = require('path');

const targetSdk = process.argv[2];
const mobileDir = path.resolve(__dirname, '..');
const pkgPath = path.join(mobileDir, 'package.json');
const sdk57Path = path.join(mobileDir, 'package.sdk57.json');
const sdk58Path = path.join(mobileDir, 'package.sdk58.json');

function getCurrentSdk() {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.dependencies?.expo || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

if (!targetSdk || targetSdk === 'status' || targetSdk === '--status') {
  const currentExpo = getCurrentSdk();
  console.log('\n======================================================');
  console.log('📱 VITALIS MOBILE — EXPO SDK STATUS');
  console.log('======================================================');
  console.log(`Current Expo version in package.json : ${currentExpo}`);
  console.log('\nTo target a specific Expo Go version:');
  console.log('  • For Expo Go SDK 57:  npm run use:sdk57');
  console.log('  • For Expo Go SDK 58:  npm run use:sdk58');
  console.log('======================================================\n');
  process.exit(0);
}

let sourceFile;
if (targetSdk === '57') {
  sourceFile = sdk57Path;
} else if (targetSdk === '58') {
  sourceFile = sdk58Path;
} else {
  console.error(`\n❌ Error: Unsupported SDK version "${targetSdk}".`);
  console.error('Supported targets: 57 or 58\n');
  console.error('Usage:');
  console.error('  node ./scripts/switch-sdk.js 57');
  console.error('  node ./scripts/switch-sdk.js 58\n');
  process.exit(1);
}

if (!fs.existsSync(sourceFile)) {
  console.error(`\n❌ Error: Profile file not found at ${sourceFile}`);
  process.exit(1);
}

try {
  const profileData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
  fs.writeFileSync(pkgPath, JSON.stringify(profileData, null, 2) + '\n', 'utf8');

  console.log('\n======================================================');
  console.log(`✅ Vitalis Mobile configured for Expo SDK ${targetSdk}!`);
  console.log('======================================================');
  console.log(`• Expo:            ${profileData.dependencies.expo}`);
  console.log(`• React Native:    ${profileData.dependencies['react-native']}`);
  console.log(`• Target Client:   Expo Go (Android & iOS)`);
  console.log('------------------------------------------------------');
  console.log('Next Steps:');
  console.log('1. If switching SDK versions, ensure dependencies are synced:');
  console.log('   npm install');
  console.log('2. Launch dev server directly for Expo Go:');
  console.log('   npm run start:go');
  console.log('   (or "npm run android:go" / "npm run ios:go")');
  console.log('3. Scan the QR code using:');
  console.log('   • Android: Expo Go camera or in-app QR scanner');
  console.log('   • iOS: Standard iOS Camera app (taps open into Expo Go)');
  console.log('======================================================\n');
} catch (err) {
  console.error('❌ Failed to switch SDK configuration:', err.message);
  process.exit(1);
}
