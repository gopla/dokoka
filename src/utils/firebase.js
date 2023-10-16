import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, onValue } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { useEffect } from 'react';

import { withSuspense } from './with-suspense.js';

const firebaseConfig = {
  apiKey: `${import.meta.env.VITE_API_KEY}`,
  authDomain: `${import.meta.env.VITE_AUTH_DOMAIN}`,
  databaseURL: `${import.meta.env.VITE_DATABASE_URL}`,
  projectId: `${import.meta.env.VITE_PROJECTID}`,
  storageBucket: `${import.meta.env.VITE_STORAGEBUCKET}`,
  messagingSenderId: `${import.meta.env.VITE_MESSAGINGSENDERID}`,
  appId: `${import.meta.env.VITE_APPID}`,
  measurementId: `${import.meta.env.VITE_MEASUREMENTID}`,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = getDatabase();
export const auth = getAuth();
export const storage = getStorage(app);

/** @param {import("firebase/database").Query} query */
export let reference_or_query_to_string = (query) => {
  // @ts-ignore
  let query_identifier = query?._queryIdentifier ?? '';
  let result = query.toString() + '?q=' + query_identifier;
  return result;
};

let useFirebaseFirstValue = withSuspense(
  (/** @type {import("firebase/database").Query} */ path) => {
    return reference_or_query_to_string(path);
  },
  (/** @type {import("firebase/database").Query} */ path) => {
    // return get(path).then((x) => x.val());
    return new Promise((yell) => {
      let unsub = () => { };
      unsub = onValue(path, (snapshot) => {
        unsub();
        yell(snapshot.val());
      });
    });
  }
);

export let useFirebase = (
  /** @type {import("firebase/database").Query} */ path
) => {
  let value = useFirebaseFirstValue(path);

  // let [value, set_value] = React.useState(initial_value);
  useEffect(() => {
    let dispose = onValue(path, (snapshot) => {
      useFirebaseFirstValue.refetch(path, snapshot.val());
      // set_value(snapshot.val());
    });

    return () => dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference_or_query_to_string(path)]);

  return value;
};
