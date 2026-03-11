const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(__dirname, '../node_modules/expo-image-loader/android/build.gradle');

if (fs.existsSync(buildGradlePath)) {
  let content = fs.readFileSync(buildGradlePath, 'utf8');
  
  // Check if already patched
  if (!content.includes('compileSdk rootProject.ext.compileSdkVersion')) {
    const oldAndroidBlock = `android {
  namespace "expo.modules.imageloader"
  defaultConfig {
    versionCode 8
    versionName "4.7.0"
  }
}`;

    const newAndroidBlock = `android {
  namespace "expo.modules.imageloader"
  compileSdk rootProject.ext.compileSdkVersion ?: 34
  defaultConfig {
    minSdk rootProject.ext.minSdkVersion ?: 23
    targetSdk rootProject.ext.targetSdkVersion ?: 34
    versionCode 8
    versionName "4.7.0"
  }
}`;

    content = content.replace(oldAndroidBlock, newAndroidBlock);
    fs.writeFileSync(buildGradlePath, content, 'utf8');
    console.log('✓ Patched expo-image-loader build.gradle');
  }
}
