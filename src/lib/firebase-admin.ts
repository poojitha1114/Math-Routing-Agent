import * as admin from 'firebase-admin';

let app: admin.app.App;

export function initFirebase() {
  if (app) {
    return app;
  }

  const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!serviceAccount) {
    throw new Error(
      'GOOGLE_APPLICATION_CREDENTIALS environment variable is not set. Cannot initialize Firebase Admin SDK.'
    );
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error(
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set. Cannot initialize Firebase Admin SDK.'
    );
  }

  try {
    app = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: projectId,
    });
    console.log('Firebase Admin SDK initialized.');
    return app;
  } catch (error: any) {
    if (error.code !== 'app/duplicate-app') {
      console.error('Firebase Admin initialization error', error);
      throw error;
    }
    // If it's a duplicate app error, it means it's already initialized, so we can ignore it.
    return admin.app();
  }
}
