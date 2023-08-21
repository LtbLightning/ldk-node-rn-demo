# React Native Demo App for LDK-NODE
This is demo Application for ldk-node, which shows how to start node, open channels, make payments and close channels.

# Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup).

## Step 1: Clone from Github

First, you will need to clone **code** from github repo.

```bash
git clone https://github.com/LtbLightning/ldk-node-rn-demo.git
```

## Step 2: Install node modules and pods(for iOS only)

Navigate to cloned folder and run following commands to install node_modules and pods.

```bash
cd Ldk-node-rn-demo

# using npm
npm install

# using yarn
yarn install
```
**Install Pods:** _for iOS only_

```bash
npx pod-install
OR
cd ios && pod install
```

## Step 3: Start your Application

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.


## Congratulations! :tada:

You've successfully run ldk node Demo App. :partying_face: