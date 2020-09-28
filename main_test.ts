import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { parse, FilterData, diff } from "./main.ts";

Deno.test("Jfilter #1", () => {
  const filter: FilterData[] = [
    {
      action: "GET",
      values: {
        "vertex.ogit/_type": ["ogit/Mobile/Message"],
      },
    },
    {
      action: "UPDATE",
      values: {
        "vertex.ogit/_type": ["ogit/Mobile/Message"],
      },
    },
  ];

  const res = parse(filter);

  assertEquals(
    res,
    `|(&(action = GET)(vertex.ogit/_type = ogit/Mobile/Message))(&(action = UPDATE)(vertex.ogit/_type = ogit/Mobile/Message))`
  );
});

Deno.test("Jfilter #2", () => {
  const filter: FilterData[] = [
    {
      action: ["GET", "CREATE", "UPDATE", "DELETE"],
      values: {
        "vertex.ogit/_type": ["ogit/Mobile/*"],
      },
    },
  ];

  const res = parse(filter);

  assertEquals(
    res,
    `|(&(|(action = GET)(action = CREATE)(action = UPDATE)(action = DELETE))(vertex.ogit/_type = ogit/Mobile/*))`
  );
});

Deno.test("Jfilter #3", async () => {
  const filter: FilterData[] = [
    {
      action: "GET",
      values: {
        "vertex.ogit/_type": [
          "ogit/Automation/KnowledgeItem",
          "ogit/Automation/AutomationIssue",
          "ogit/Automation/KnowledgePool",
        ],
      },
    },
    {
      action: ["GET", "UPDATE", "CREATE"],
      values: {
        "vertex.ogit/_type": [
          "ogit/Timeseries",
          "ogit/Automation/AutomationIssue",
          "ogit/Knowledge/AcquisitionSession",
        ],
      },
    },
  ];

  const res = parse(filter);

  const d = diff(
    res,
    `|(&(action = GET)(|(vertex.ogit/_type = ogit/Automation/KnowledgeItem)(vertex.ogit/_type = ogit/Automation/AutomationIssue)(vertex.ogit/_type = ogit/Automation/KnowledgePool)))(&(|(action = GET)(action = UPDATE)(action = CREATE))(|(vertex.ogit/_type = ogit/Timeseries)(vertex.ogit/_type = ogit/Knowledge/AcquisitionSession)))`
  );

  assertEquals(d.result, true, d.output);
});
