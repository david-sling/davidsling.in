import env from "react-dotenv";
var processEnv = {};
if (process.env.NODE_ENV == "development")
  processEnv = {
    apiKey: "AIzaSyDfvFYu5wVxOltOIiTkzMyHu_B2NnnF5kA",
    authDomain: "davidsling-in.firebaseapp.com",
    projectId: "davidsling-in",
    storageBucket: "davidsling-in.appspot.com",
    messagingSenderId: "133782068887",
    appId: "1:133782068887:web:bd97c101d52fa2127dd3d2",
    measurementId: "G-0PEE2GHPGM",
  };
else processEnv = process.env;

const {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId,
} = processEnv;
console.log({ env: processEnv });

var params = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId,
};
export default params;
