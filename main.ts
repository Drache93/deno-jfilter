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

interface FilterData {
  action: "CREATE" | "GET" | "UPDATE" | "DELETE";
  values: Record<string, string[]>;
}

const parse = (data: FilterData[]) => {
  let output = data.map((value) => {
    const values = Object.keys(value.values)
      .map((k) => value.values[k].map((v) => `${k} = ${v}`))
      .map((f) => new JFilter().or(...f));

    return new JFilter().and(`action = ${value.action}`, ...values);
  });

  return new JFilter().or(...output).toString();
};

const filename = Deno.args[0];
const data = await Deno.readTextFile(filename).then((f) => JSON.parse(f));

const res = parse(data);

console.log(res);
