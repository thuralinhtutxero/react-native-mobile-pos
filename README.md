# react-native-mobile-pos
Rapid Retail (Mobile App)

Target Sdk Version : 31
## Installation

- Open a terminal window and navigate to the directory where you want to clone the GitHub repository.

- Clone the repository using the following command:
  ```
  git clone https://github.com/empiretylh/react-native-mobile-pos.git
  ```

- Once the repository is cloned, navigate to the project directory:
  ```
  cd react-native-mobile-pos
  ```
- Install the project dependencies using the following command:
  ```
  npm install
  ```
- You need to build the project using the following command:
 
  For IOS
  ```bash
  npx react-native run-ios
  ```
  For Android
  ```bash
  npx react-native run-android
  ```
  This will build the project and launch it in the iOS or Android emulator.

- You can start the development server using the following command:
  ```bash
  npx react-native start
  ```
  Then, launch the app using the emulator or a physical device.
  
## Google Admob Setup
  If you want to monetize this app, Google AdMob frames have already been set up. All you need is your AdMob app ID and AdUnit from your Google AdMob account. If you're unsure how to set up an app in AdMob, you can follow this link to create one.
https://support.google.com/admob/answer/9989980?hl=en&ref_topic=7384409&sjid=4635969408345971373-AP#

  After creating an app in AdMob, you will receive an ``APPID``. Copy this APPID and paste it into the ``app.json`` file in your project's root folder, as shown in the following example:
```json
{
  "name": "Rapid Retail",
  "displayName": "Rapid Retail",

  "react-native-google-mobile-ads":{
    "android_app_id":"ca-app-pub-1234567890123456~1234567890", // Replace the APPID Here
    "ios_app_id":"ca-app-pub-1234567890123456~1234567890", // Replace the APPID Here
  }
}

```
### Changing Your Ad Unit
  In this app, Banner Ads and Interstital Ads are include. So you should need to create both banner and interstital ads. If you don't know how to create adunit, you can follow this to create.

  - Banner : https://support.google.com/admob/answer/7311346?hl=en&ref_topic=7384409&sjid=4635969408345971373-AP
  - Interstital : https://support.google.com/admob/answer/7311435?hl=en&ref_topic=7384409&sjid=4635969408345971373-AP

  After creating the Ad Units, copy the Ad Unit IDs for both types of ads. Then, open the ``Database.js`` file located in the project's root folder. Find the UnitId and paste the Ad Unit ID for each type of ad as shown below:

```javascript
...
export const UnitId = {
  banner : 'ca-app-pub-3940256099942544/6300978111',
  interstitial : 'ca-app-pub-3940256099942544/1033173712',
}
```
## Export Apk
 After updating your Ad Units, you can export an APK file for production using the following setps:
 1. Download the keystore from this link: (https://drive.google.com/file/d/19bIxXoJDlrscxzNgdmGegaOh-IhxIHFc/view?usp=sharing), or you can create your own keystore
 2. Copy the keystore file to the follwing directory: ``/react-native-mobile-pos/android/app/``.
 3. Open the terminal in ``/react-native-mobile-pos/android`` and run the following command line.
     ```
       ./gradlew assembleRelease
     ```
 4. Once the process is complete, you can find the ``release.apk`` file in the follwing directory.
     ```/react-native-mobile-pos/android/app/build/outputs/apk/release```
