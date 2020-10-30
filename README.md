
# deno-jfilter
[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/Drache93/deno-jfilter)

## Install

- Install Deno
  `brew install deno`

- Install jfilter
  `deno install --allow-read -n jfilter https://cdn.jsdelivr.net/gh/Drache93/deno-jfilter@1.4.2/main.ts`

## Run

### JFilter Array
Expects a JSON object with `ogit/Auth/vertexRule` or `ogit/Auth/edgeRule` keys (will traverse until found):

```json
{
    "test-data": {
        "ogit/_organization": "test_org",
        "ogit/description": "test_desc",
        "ogit/Auth/vertexRule": [
            {
                "action": "GET",
                "values": {
                    "vertex.ogit/_type": [
                        "ogit/Mobile/Message"
                    ]
                }
            },
            {
                "action": "UPDATE",
                "values": {
                    "vertex.ogit/_type": [
                        "ogit/Mobile/Message"
                    ]
                }
            }
        ]
    }
}
```

`jfilter -n -f my-filter.json`

Outputs:

```json
{
    "test-data": {
        "ogit/_organization": "test_org",
        "ogit/description": "test_desc",
        "ogit/Auth/vertexRule": "|(&(action = GET)(vertex.ogit/_type = ogit/Mobile/Message))(&(action = UPDATE)(vertex.ogit/_type = ogit/Mobile/Message))"
    }
}
```

### Nested Data

Nested data is also supported, this is a JSON object with specific keys expected to contain a JFilter object.
Nested data is outputted with the same structure, however the JFilter object is replaced with a JFilter string.



## Check output

A correct Jfilter value can be passed in to check the JSON output

`jfilter my-filter.json "|(&(action = GET)(|(vertex.ogit/_type = ogit/Mobile/Message)))(&(action = UPDATE)(|(vertex.ogit/_type = ogit/Mobile/Message)))"`

Any differences will be highlighted
