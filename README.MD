# deno-jfilter

## Install

* Install Deno
  `brew install deno`

* Install jfilter
  `deno install -f --allow-read -n jfilter main.ts`

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