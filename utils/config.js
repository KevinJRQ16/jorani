import dotenv from "dotenv";
dotenv.config();

export const JORANI_URL = process.env.JORANI_URL || "http://localhost/session/login";
export const HEADLESS = process.env.HEADLESS === "false" ? false : true;
