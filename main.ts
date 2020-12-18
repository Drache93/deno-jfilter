import { Command } from "https://deno.land/x/cliffy@v0.14.1/command/mod.ts";
import { parse, parseNested, diff } from "./jfilter.ts";

const { options } = await new Command()
  .name("deno-jfilter")
  .version("1.4.1")
  .description("Create jfilters for edge and vertex rules")
  .option(
    "-f --file <file>",
    "File containing JFilter in JSON format to parse (default expects array)"
  )
  .option(
    "-n --nested",
    "Handle nested file input with JFilter values in JSON object"
  )
  .option(
    "-t --test [test]",
    "String to compare results against. Not usable with '--nested' option"
  )
  .parse(Deno.args);

let data = await Deno.readTextFile(options.file).then((f) => JSON.parse(f));

if (options.nested) {
  const res = parseNested(data);
  console.log(JSON.stringify(res, undefined, 4));
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
