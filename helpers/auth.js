import dotenv from 'dotenv';
import admin from 'firebase-admin';
dotenv.config();

// const serviceAccount = require('../config/fbServiceAccountKey.json');
const serviceAccount = JSON.parse(new Buffer(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('ascii'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  //databaseURL: "https://gql-react-node-udemy.firebaseio.com"
});

const authCheck = async (req) => {
  try {
    const currentUser = await admin.auth().verifyIdToken(req.headers.authtoken);
    return currentUser;
  } catch (error) {
    throw new Error('Invalid or Expired Token');
  }
};

const authCheckMiddleware = async (req, res, next) => {
  if (req.headers.authtoken) {
    try {
      await admin.auth().verifyIdToken(req.headers.authtoken);
      next()
    } catch (error) {
      throw new Error('Invalid or Expired Token');
    }
  } else {
    throw new Error('Unauthorized');
  }
};

export { authCheck, authCheckMiddleware };