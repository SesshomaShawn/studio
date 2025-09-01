// This script is for testing the basic connection to Firestore.
import { db } from '../src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

async function testFirestoreConnection() {
  console.log('Attempting to connect to Firestore...');
  try {
    const testCollectionRef = collection(db, 'test-connection');
    console.log('Got collection reference. Attempting to add a document...');
    
    const docRef = await addDoc(testCollectionRef, {
      message: 'Connection successful!',
      timestamp: serverTimestamp(),
    });
    
    console.log('\x1b[32m%s\x1b[0m', '✅ SUCCESS: Firestore connection is working.');
    console.log(`Successfully added a test document with ID: ${docRef.id}`);
    console.log('You can now delete the "test-connection" collection in your Firebase console.');
    
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ ERROR: Failed to connect to Firestore.');
    console.error('The error received was:');
    console.error(error);
    console.log('\nPlease double-check the following:');
    console.log('1. You have a stable internet connection.');
    console.log('2. In the Firebase Console, you have created a Firestore database for this project.');
    console.log('3. The project ID in src/lib/firebase.ts matches your Firebase project.');
  }
}

testFirestoreConnection();
