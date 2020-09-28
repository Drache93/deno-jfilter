import * as jsdiff from "https://cdn.skypack.dev/diff@^4.0.2";
import { red, green } from "https://deno.land/std/fmt/colors.ts";
import { Command } from "https://deno.land/x/cliffy@v0.14.1/command/mod.ts";

export class JFilter {
  private value = "";

  constructor(value?: string) {
    if (value) {
      this.value = value;
    }
  }

  private reduce(text: (string | JFilter)[]) {
    return text.reduce((acc, t) => acc + `(${t.toString()})`, "");
  }

  or(...text: (string | JFilter)[]) {
    const v = this.reduce(text);

    this.value += `|${v}`;

    return this;
  }

  and(...text: (string | JFilter)[]) {
    const v = this.reduce(text);

    this.value += `&${v}`;

    return this;
  }

  toString() {
    return `${this.value}`;
  }
}

export const diff = (actual: string, expected: string) => {
  const diff = jsdiff.diffChars(actual, expected, undefined) as any[];

  let match = true;

  const output = diff.reduce((acc: string, part: any) => {
    if (!part.value) {
      return;
    }

    if (part.added) {
      match = false;
      acc += green(part.value);
    } else if (part.removed) {
      match = false;
      acc += red(part.value);
    } else {
      acc += part.value;
    }

    return acc;
  }, "");

  return {
    result: match,
    output,
  };
};

export type Action = "CREATE" | "GET" | "UPDATE" | "DELETE" | "CONNECT";

export type FilterDataValue = Record<string, string[]>;

export interface FilterData {
  action: Action | Action[];
  values: FilterDataValue | FilterDataValue[];
}

const getValues = (key: string, values: string[]) => {
  const res: any[] = values.map((v) => `${key} = ${v}`);

  if (res.length === 1) {
    return new JFilter(res[0]);
  }

  return new JFilter().or(...res);
};

const getActions = (actions: Action | Action[]) => {
  let res: any[] = Array.isArray(actions) ? actions : [actions];

  res = res.map((r) => `action = ${r}`);

  if (res.length === 1) {
    return new JFilter(res[0]);
  }

  return new JFilter().or(...res);
};

export const parse = (data: FilterData[]) => {
  let output = data.map((value) => {
    const v = value.values;

    let values: JFilter[] = [];
    if (Array.isArray(v)) {
      const temp = v.map((w) =>
        new JFilter().and(...Object.keys(w).map((k) => getValues(k, w[k])))
      );

      values = [new JFilter().or(...temp)];
    } else {
      values = Object.keys(v).map((k) => getValues(k, v[k]));
    }

    const actions = getActions(value.action);

    return new JFilter().and(actions, ...values);
  });

  if (output.length === 1) {
    return output[0].toString();
  }

  return new JFilter().or(...output).toString();
};

const SUPPORTED_KEYS = ["ogit/Auth/vertexRule", "ogit/Auth/edgeRule"];

export const parseNested = (data: any): any => {
  if (Array.isArray(data)) {
    return parse(data);
  }

  for (const key in data) {
    if (typeof data[key] !== "object") {
      continue;
    }

    if (!Array.isArray(data[key])) {
      data[key] = parseNested(data[key]);
    }

    if (SUPPORTED_KEYS.includes(key)) {
      data[key] = parse(data[key]);
    }
  }

  return data;
};

if (Deno.args[0]) {
  const { options } = await new Command()
    .name("deno-jfilter")
    .version("1.4")
    .description("Create jfilters for edge and vertex rules")
    .option(
      "-f --file <file>",
      "File containing JFilter in JSON format to parse"
    )
    .option("-n --nested", "Handle nested file input")
    .option(
      "-t --test [test]",
      "String to compare results against. Not usable with '--nested' option"
    )
    .parse(Deno.args);

  let data = await Deno.readTextFile(options.file).then((f) => JSON.parse(f));

  if (options.nested) {
    const res = parseNested(data);
    console.log(JSON.stringify(res, undefined, 2));
    Deno.exit(0);
  }

  const filter = parse(data);

  if (options.test) {
    const res = diff(filter, options.test);

    if (!res.result) {
      console.log("Result did not match");
      console.log(res.output);
      Deno.exit(1);
    }
  }

  console.log(filter);
}
