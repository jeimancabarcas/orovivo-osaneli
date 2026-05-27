const fs = require('fs');
const path = require('path');

// Target directory and files
const envDirectory = path.join(__dirname, 'src', 'environments');
const targetPathProd = path.join(envDirectory, 'environment.ts');
const targetPathDev = path.join(envDirectory, 'environment.development.ts');

// Create directory if it doesn't exist
if (!fs.existsSync(envDirectory)) {
  fs.mkdirSync(envDirectory, { recursive: true });
}

// Helper to get environment variables with clean fallback defaults
const getEnv = (key, defaultValue) => {
  return process.env[key] !== undefined ? process.env[key] : defaultValue;
};

// Map configuration
const config = {
  boldApiKey: getEnv('BOLD_API_KEY', 'zLDLlEmrn3wSGbG-u6VojBWXnMfJyZtRICAutPNDCF0'),
  boldSecretKey: getEnv('BOLD_SECRET_KEY', 'W97RSxbKflrCj4bJ7RC3Ig'),
  boldRedirectUrl: getEnv('BOLD_REDIRECT_URL', 'https://orovivo.osaneli.com/payment-redirect'),
  preSaleEndDate: getEnv('PRE_SALE_END_DATE', '2026-05-30T00:00:00-05:00'),
  productPrice: Number(getEnv('PRODUCT_PRICE', '280000')),
  dropLimit: Number(getEnv('DROP_LIMIT', '100')),
  firebase: {
    apiKey: getEnv('FIREBASE_API_KEY', 'AIzaSyDC5zTjrdT7DNEzZj3Z7Sg9pKCBBv-oOR4'),
    authDomain: getEnv('FIREBASE_AUTH_DOMAIN', 'osaneli-oro-vivo.firebaseapp.com'),
    databaseURL: getEnv('FIREBASE_DATABASE_URL', 'https://osaneli-oro-vivo-default-rtdb.firebaseio.com'),
    projectId: getEnv('FIREBASE_PROJECT_ID', 'osaneli-oro-vivo'),
    storageBucket: getEnv('FIREBASE_STORAGE_BUCKET', 'osaneli-oro-vivo.firebasestorage.app'),
    messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID', '749450568007'),
    appId: getEnv('FIREBASE_APP_ID', '1:749450568007:web:f263f61ff0642b71342c62'),
    measurementId: getEnv('FIREBASE_MEASUREMENT_ID', 'G-QG486E5ZCY')
  }
};

// Generate content for Production environment
const environmentFileContentProd = `export const environment = {
  production: true,
  boldApiKey: '${config.boldApiKey}',
  boldSecretKey: '${config.boldSecretKey}',
  boldRedirectUrl: '${config.boldRedirectUrl}',
  preSaleEndDate: '${config.preSaleEndDate}',
  productPrice: ${config.productPrice},
  dropLimit: ${config.dropLimit},
  firebase: {
    apiKey: "${config.firebase.apiKey}",
    authDomain: "${config.firebase.authDomain}",
    databaseURL: "${config.firebase.databaseURL}",
    projectId: "${config.firebase.projectId}",
    storageBucket: "${config.firebase.storageBucket}",
    messagingSenderId: "${config.firebase.messagingSenderId}",
    appId: "${config.firebase.appId}",
    measurementId: "${config.firebase.measurementId}"
  }
};
`;

// Generate content for Development environment
const environmentFileContentDev = `export const environment = {
  production: false,
  boldApiKey: '${config.boldApiKey}',
  boldSecretKey: '${config.boldSecretKey}',
  boldRedirectUrl: '${config.boldRedirectUrl}',
  preSaleEndDate: '${config.preSaleEndDate}',
  productPrice: ${config.productPrice},
  dropLimit: ${config.dropLimit},
  firebase: {
    apiKey: "${config.firebase.apiKey}",
    authDomain: "${config.firebase.authDomain}",
    databaseURL: "${config.firebase.databaseURL}",
    projectId: "${config.firebase.projectId}",
    storageBucket: "${config.firebase.storageBucket}",
    messagingSenderId: "${config.firebase.messagingSenderId}",
    appId: "${config.firebase.appId}",
    measurementId: "${config.firebase.measurementId}"
  }
};
`;

console.log('Generating Angular environment files dynamically from Vercel process.env...');

// Write files
fs.writeFileSync(targetPathProd, environmentFileContentProd, { encoding: 'utf8' });
console.log(`Successfully generated environment.ts at ${targetPathProd}`);

fs.writeFileSync(targetPathDev, environmentFileContentDev, { encoding: 'utf8' });
console.log(`Successfully generated environment.development.ts at ${targetPathDev}`);
