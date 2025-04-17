import admin from 'firebase-admin';
// import serviceAccount from './firebaseServiceKey.json'; // adjust path

const base64 = process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_JSON;
const jsonString = Buffer.from(base64, 'base64').toString('utf8');
const serviceAccount = JSON.parse(jsonString);



if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export { admin, db };