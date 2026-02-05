const isProduction = process.env.NODE_ENV === "production";
export const API_URL = process.env.NEXT_PUBLIC_API_URL || (isProduction ? "https://docuflux.onrender.com" : "http://localhost:5000");
