import { scanFunction } from "./scan";
import { sendOutreachEmailFunction } from "./send-outreach-email";
import { sendScanEmailFunction } from "./send-scan-email";

export const functions = [scanFunction, sendScanEmailFunction, sendOutreachEmailFunction];
