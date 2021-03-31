import firebase from "./init";
const db = firebase.firestore();

const add = async (collection, object) => {
  const res = await db.collection(collection).add({
    ...object,
    _dateCreated: firebase.firestore.FieldValue.serverTimestamp(),
    _dateUpdated: firebase.firestore.FieldValue.serverTimestamp(),
  });
  return res.id;
};

const firestore = { add };

export default firestore;
