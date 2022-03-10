# deno-wrapper-dart-sass

**A Deno wrapper for [dart-sass](https://github.com/sass/dart-sass).**

This module provides:

- [Scripts](./scripts) for downloading a [dart-sass release](https://github.com/sass/dart-sass/releases/latest)
- [A Deno module](mod.ts) with a TypeScript interface for the [`sass` CLI](https://sass-lang.com/documentation/cli/dart-sass)
- A number of [integration tests](test.ts)

## Preparation

This module requires both a `dart` executable file and the `sass.snapshot` file. You can download these files via the provided build scripts:

- On Windows, use [`download-dart-sass.cmd`](./scripts/download-dart-sass.cmd)
- On MacOS or Linux, use [`download-dart-sass.sh`](./scripts/download-dart-sass.sh)

## Example

```typescript
import * as sass from "https://raw.githubusercontent.com/MarkTiedemann/deno-wrapper-dart-sass/master/mod.ts";

const scss = `
$zero: 0;
body {
  margin: $zero;
}
`;

const css = await sass.compileFromStringToString(".\\dart.exe", "sass.snapshot", scss);

console.log(css); /* Should log:
body {
  margin: 0;
}
*/
```

## API

This module exports four functions for compiling SCSS to CSS, which differ in their in- and outputs:

```typescript
function compileFromStringToString(dartExecutable: string, sassSnapshot: string, inputString: string, options?: SassOptions)
function compileFromFileToString(dartExecutable: string, sassSnapshot: string, inputFile: string, options?: SassOptions)
function compileFromFileToFile(dartExecutable: string, sassSnapshot: string, { inputFile, outputFile }: { inputFile: string, outputFile: string }, options?: SassOptions)
function compileFromFilesToFiles(dartExecutable: string, sassSnapshot: string, mode: { inputFile: string, outputFile: string }[], options?: SassOptions)
```

The `SassOptions` interface mimics the [options of the `sass` CLI](https://sass-lang.com/documentation/cli/dart-sass).

## License

MIT
