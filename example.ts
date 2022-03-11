import { useDartSass } from "./mod.ts";

const dartSass = await useDartSass();

const scss = `
$zero: 0;
body {
  margin: $zero;
}
`;

const css = await dartSass.compileFromStringToString(scss);

console.log(css); /* Should log:
body {
  margin: 0;
}
*/
