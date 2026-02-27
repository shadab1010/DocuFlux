const isProduction = process.env.NODE_ENV === "production";

// Use a smarter default: if we are on localhost or a local IP, use the local backend
const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        const isLocal =
            hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname.startsWith("192.168.") ||
            hostname.startsWith("172.") ||
            hostname.startsWith("10.");

        if (isLocal) {
            return "http://" + hostname + ":5000";
        }
    }

    return isProduction ? "https://docuflux.onrender.com" : "http://localhost:5000";
};

export const API_URL = getBaseUrl();
console.log("Detected API_URL in config.ts:", API_URL);
