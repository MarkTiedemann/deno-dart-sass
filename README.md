# deno-dart-sass

**A Deno wrapper for [dart-sass](https://github.com/sass/dart-sass).**

This module provides:

- A Deno module for downloading and using [dart-sass](https://github.com/sass/dart-sass)
- A TypeScript interface for the [`sass` CLI](https://sass-lang.com/documentation/cli/dart-sass)
- Fully documented types, specifically [`DartSassOptions`](./mod.ts#L1-L24), [`DartSass`](./mod.ts#L26-L40), and [`SassOptions`](./mod.ts#L42-L96)
- A number of [integration tests](./test.ts)
- No dependencies

## Quickstart

```typescript
import { useDartSass } from "https://raw.githubusercontent.com/MarkTiedemann/deno-dart-sass/0.3.0/mod.ts";

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

## Changelog

- `0.1.0`: Initial release (Mar 12, 2022)
- `0.2.0`: Support ARM64 on MacOS (Apr 30, 2022)
- `0.3.0`: Support sass executable on Linux (May 20, 2022)

## License

MIT
