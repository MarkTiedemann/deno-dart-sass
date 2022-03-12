# deno-dart-sass

**A Deno wrapper for [dart-sass](https://github.com/sass/dart-sass).**

This module provides:

- A Deno module for downloading and using [dart-sass](https://github.com/sass/dart-sass)
- A TypeScript interface for the [`sass` CLI](https://sass-lang.com/documentation/cli/dart-sass)
- Fully documented types, specifically [`DartSassOptions`](./mod.ts#L1-L21), [`DartSass`](./mod.ts#L23-L37), and [`SassOptions`](./mod.ts#L39-L93)
- A number of [integration tests](./test.ts)

## Quickstart

```typescript
import { useDartSass } from "https://raw.githubusercontent.com/MarkTiedemann/deno-dart-sass/0.1.0/mod.ts";

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

## License

MIT
