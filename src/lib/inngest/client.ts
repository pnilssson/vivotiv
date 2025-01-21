import { Inngest } from "inngest";
import { Logger } from "next-axiom";

// Create a client to send and receive events
const logger = new Logger({ source: "inngest" });
export const inngest = new Inngest({ id: "vivotiv", logger: logger });
