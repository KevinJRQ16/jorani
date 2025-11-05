// import dotenv from "dotenv";
// dotenv.config();

// export const JORANI_URL = process.env.JORANI_URL || "http://localhost/session/login";
// export const HEADLESS = process.env.HEADLESS === "false" ? false : true;

import dotenv from "dotenv";
dotenv.config();

const base = process.env.JORANI_URL || "http://localhost:8080";

export const JORANI_URL = `${base}/session/login`;
export const HEADLESS = process.env.HEADLESS === "false" ? false : true;
