// this script can be utilized to convert our firebase service account key json config
const base64 = Buffer.from(JSON.stringify({
  // Put your json config here to convert it to base64
})).toString("base64");

console.log(base64)