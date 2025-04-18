const isBrowser = typeof window !== "undefined";

let firebaseConfig: any = {};

const base64 = process.env.NEXT_PUBLIC_GOOGLE_CONFIG;

if (base64) {
  try {
    const jsonString = isBrowser
      ? atob(base64) // browser-safe
      : Buffer.from(base64, "base64").toString("utf-8"); // server-safe

    firebaseConfig = JSON.parse(jsonString);
  } catch (err) {
    console.error("Failed to parse Firebase config:", err);
  }
} else {
  console.warn("NEXT_PUBLIC_GOOGLE_CONFIG is not set");
}

export default firebaseConfig;
