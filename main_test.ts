import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { parse, FilterData } from "./main.ts";

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
