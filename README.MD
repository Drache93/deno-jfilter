# deno-jfilter

## Install

* Install Deno
  `brew install deno`

* Install jfilter
  `deno install --allow-read -n jfilter https://cdn.jsdelivr.net/gh/Drache93/deno-jfilter@1.0/main.ts`

## Run

Expects a JSON with following format:

```json
[
  {
    "action": "GET",
    "values": {
      "vertex.ogit/_type": [
        "ogit/Mobile/Message",
      ]
    }
  },
  {
    "action": "UPDATE",
    "values": {
      "vertex.ogit/_type": [
        "ogit/Mobile/Message",
      ]
    }
  }
]

```

`jfilter my-filter.json`

Outputs:

```
|(&(action = GET)(|(vertex.ogit/_type = ogit/Mobile/Message)))(&(action = UPDATE)(|(vertex.ogit/_type = ogit/Mobile/Message)))
```