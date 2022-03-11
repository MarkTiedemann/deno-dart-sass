// TODO(Mark): Test useDartSass function

import { assertEquals } from "https://deno.land/std@0.129.0/testing/asserts.ts";
import { useDartSass } from "./mod.ts";

const dartSass = await useDartSass();

Deno.test("compileFromStringToString", async () => {
	const css = await dartSass.compileFromStringToString(`$zero: 0;
body {
	margin: $zero;
}
`);
	assertEquals(css, `body {
  margin: 0;
}
`);
});

Deno.test("compileFromFileToString", async () => {
	const css = await dartSass.compileFromFileToString("test.scss");
	assertEquals(css, `body {
  margin: 0;
}
`);
});

Deno.test("compileFromFileToString style:compressed", async () => {
	const css = await dartSass.compileFromFileToString("test.scss", { style: "compressed" });
	assertEquals(css, `body{margin:0}
`);
});

Deno.test("compileFromFileToFile", async () => {
	await dartSass.compileFromFileToFile("test.scss", "test.css");
	try {
		const css = await Deno.readTextFile("test.css");
		assertEquals(css, `body {
  margin: 0;
}

/*# sourceMappingURL=test.css.map */
`);
		const stat = await Deno.stat("test.css.map");
		assertEquals(stat.isFile, true);
	} finally {
		await Deno.remove("test.css");
		await Deno.remove("test.css.map");
	}
});

Deno.test("compileFromFileToFile noSourceMap:true", async () => {
	await dartSass.compileFromFileToFile("test.scss", "test.css", { noSourceMap: true });
	try {
		const css = await Deno.readTextFile("test.css");
		assertEquals(css, `body {
  margin: 0;
}
`);
	} finally {
		await Deno.remove("test.css");
	}
});

Deno.test("compileFromFilesToFiles", async () => {
	await dartSass.compileFromFilesToFiles([{ inputFile: "test.scss", outputFile: "test.css" }]);
	try {
		const css = await Deno.readTextFile("test.css");
		assertEquals(css, `body {
  margin: 0;
}

/*# sourceMappingURL=test.css.map */
`);
		const stat = await Deno.stat("test.css.map");
		assertEquals(stat.isFile, true);
	} finally {
		await Deno.remove("test.css");
		await Deno.remove("test.css.map");
	}
});
