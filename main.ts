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

export type Action = "CREATE" | "GET" | "UPDATE" | "DELETE";

export interface FilterData {
  action: Action | Action[];
  values: Record<string, string[]>;
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
    const values = Object.keys(value.values).map((k) =>
      getValues(k, value.values[k])
    );

    const actions = getActions(value.action);

    return new JFilter().and(actions, ...values);
  });

  return new JFilter().or(...output).toString();
};

if (Deno.args[0]) {
  const filename = Deno.args[0];
  const data = await Deno.readTextFile(filename).then((f) => JSON.parse(f));

  const res = parse(data);

  console.log(res);
}
