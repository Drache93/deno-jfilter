import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { parse, parseNested, FilterData, diff } from "./jfilter.ts";

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
    `&(|(action = GET)(action = CREATE)(action = UPDATE)(action = DELETE))(vertex.ogit/_type = ogit/Mobile/*)`
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

Deno.test("Jfilter #4", async () => {
  const filter: FilterData[] = [
    {
      action: "CONNECT",
      values: [
        {
          "edge.ogit/_type": ["ogit/generates"],
          "in.ogit/_type": ["ogit/Timeseries"],
          "out.ogit/_type": ["ogit/Automation/KnowledgeItem"],
        },
        {
          "edge.ogit/_type": ["ogit/relates"],
          "in.ogit/_type": ["ogit/Knowledge/AcquisitionSession"],
          "out.ogit/_type": ["ogit/Automation/AutomationIssue"],
        },
      ],
    },
  ];

  const res = parse(filter);

  const d = diff(
    res,
    `&(action = CONNECT)(|(&(edge.ogit/_type = ogit/generates)(in.ogit/_type = ogit/Timeseries)(out.ogit/_type = ogit/Automation/KnowledgeItem))(&(edge.ogit/_type = ogit/relates)(in.ogit/_type = ogit/Knowledge/AcquisitionSession)(out.ogit/_type = ogit/Automation/AutomationIssue)))`
  );

  assertEquals(d.result, true, d.output);
});

Deno.test("Jfilter #5", async () => {
  const filter = {
    "test-data": {
      "ogit/_organization": "test_org",
      "ogit/description": "test_desc",
      "ogit/Auth/vertexRule": [
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
              "ogit/Knowledge/AcquisitionSession",
            ],
          },
        },
      ],
      "ogit/Auth/edgeRule": [
        {
          action: "CONNECT",
          values: [
            {
              "edge.ogit/_type": ["ogit/generates"],
              "in.ogit/_type": ["ogit/Timeseries"],
              "out.ogit/_type": ["ogit/Automation/KnowledgeItem"],
            },
            {
              "edge.ogit/_type": ["ogit/relates"],
              "in.ogit/_type": ["ogit/Knowledge/AcquisitionSession"],
              "out.ogit/_type": ["ogit/Automation/AutomationIssue"],
            },
          ],
        },
      ],
    },
  };

  const res = parseNested(filter);

  const expected = {
    "test-data": {
      "ogit/_organization": "test_org",
      "ogit/description": "test_desc",
      "ogit/Auth/vertexRule": `|(&(action = GET)(|(vertex.ogit/_type = ogit/Automation/KnowledgeItem)(vertex.ogit/_type = ogit/Automation/AutomationIssue)(vertex.ogit/_type = ogit/Automation/KnowledgePool)))(&(|(action = GET)(action = UPDATE)(action = CREATE))(|(vertex.ogit/_type = ogit/Timeseries)(vertex.ogit/_type = ogit/Knowledge/AcquisitionSession)))`,
      "ogit/Auth/edgeRule": `&(action = CONNECT)(|(&(edge.ogit/_type = ogit/generates)(in.ogit/_type = ogit/Timeseries)(out.ogit/_type = ogit/Automation/KnowledgeItem))(&(edge.ogit/_type = ogit/relates)(in.ogit/_type = ogit/Knowledge/AcquisitionSession)(out.ogit/_type = ogit/Automation/AutomationIssue)))`,
    },
  };

  const vertexDiff = diff(
    res["test-data"]["ogit/Auth/vertexRule"],
    expected["test-data"]["ogit/Auth/vertexRule"]
  );

  assertEquals(vertexDiff.result, true, vertexDiff.output);

  const edgeDiff = diff(
    res["test-data"]["ogit/Auth/edgeRule"],
    expected["test-data"]["ogit/Auth/edgeRule"]
  );

  assertEquals(edgeDiff.result, true, edgeDiff.output);

  assertEquals(res, expected);
});

Deno.test("Jfilter #6 - No action", async () => {
  const tests: [FilterData[], string][] = [
    [
      [
        {
          values: {
            "vertex.ogit/_id": ["test"],
          },
        },
      ],
      "vertex.ogit/_id = test",
    ],
  ];

  tests.forEach((t) => {
    assertEquals(parse(t[0]), t[1]);
  });
});
