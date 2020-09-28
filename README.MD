# deno-jfilter

## Install

- Install Deno
  `brew install deno`

- Install jfilter
  `deno install --allow-read -n jfilter https://cdn.jsdelivr.net/gh/Drache93/deno-jfilter@1.4.1/main.ts`

## Run

Expects a JSON with following format:

```json
[
  {
    "action": "GET",
    "values": {
      "vertex.ogit/_type": ["ogit/Mobile/Message"]
    }
  },
  {
    "action": "UPDATE",
    "values": {
      "vertex.ogit/_type": ["ogit/Mobile/Message"]
    }
  }
]
```

`jfilter my-filter.json`

Outputs:

```
|(&(action = GET)(|(vertex.ogit/_type = ogit/Mobile/Message)))(&(action = UPDATE)(|(vertex.ogit/_type = ogit/Mobile/Message)))
```

## Check output

A correct Jfilter value can be passed in to check the JSON output

`jfilter my-filter.json "|(&(action = GET)(|(vertex.ogit/_type = ogit/Mobile/Message)))(&(action = UPDATE)(|(vertex.ogit/_type = ogit/Mobile/Message)))"`

Any differences will be highlighted
