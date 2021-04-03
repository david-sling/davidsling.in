import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/analytics";
import params from "../../config/firebase";

firebase.initializeApp(params);

const analytics = firebase.analytics();

export default firebase;
export { analytics };
