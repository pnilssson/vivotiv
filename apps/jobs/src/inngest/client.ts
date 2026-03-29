import { EventSchemas, Inngest } from "inngest";

type Events = {
  "scan.requested": {
    data: {
      leadId: string;
      url: string;
    };
  };
};

export const inngest = new Inngest({
  id: "vivotiv",
  schemas: new EventSchemas().fromRecord<Events>(),
});
