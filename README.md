# deno-dart-sass

**A Deno wrapper for [dart-sass](https://github.com/sass/dart-sass).**

This module provides:

- A Deno module for downloading and using [dart-sass](https://github.com/sass/dart-sass)
- A TypeScript interface for the [`sass` CLI](https://sass-lang.com/documentation/cli/dart-sass)
- A number of [integration tests](test.ts)

## Quickstart

```typescript
import { useDartSass } from "https://raw.githubusercontent.com/MarkTiedemann/deno-dart-sass/master/mod.ts";

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
```

## API

`DartSass` exports four functions for compiling SCSS to CSS, which differ in their in- and outputs:

```typescript
function compileFromStringToString(inputString: string, options?: SassOptions)
function compileFromFileToString(inputFile: string, options?: SassOptions)
function compileFromFileToFile(inputFile: string, outputFile: string, options?: SassOptions)
function compileFromFilesToFiles(files: { inputFile: string, outputFile: string }[], options?: SassOptions)
```

The `SassOptions` interface mimics the [options of the `sass` CLI](https://sass-lang.com/documentation/cli/dart-sass).

## License

MIT
