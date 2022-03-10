import { assertEquals } from "https://deno.land/std@0.129.0/testing/asserts.ts";
import * as sass from "./mod.ts";

Deno.test("compileFromStringToString", async () => {
	const css = await sass.compileFromStringToString(".\\dart.exe", "sass.snapshot", `$zero: 0;
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
	const css = await sass.compileFromFileToString(".\\dart.exe", "sass.snapshot", "test.scss");
	assertEquals(css, `body {
  margin: 0;
}
`);
});

Deno.test("compileFromFileToString style:compressed", async () => {
	const css = await sass.compileFromFileToString(".\\dart.exe", "sass.snapshot", "test.scss", { style: "compressed" });
	assertEquals(css, `body{margin:0}
`);
});

Deno.test("compileFromFileToFile", async () => {
	await sass.compileFromFileToFile(".\\dart.exe", "sass.snapshot", { inputFile: "test.scss", outputFile: "test.css" });
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
	await sass.compileFromFileToFile(".\\dart.exe", "sass.snapshot", { inputFile: "test.scss", outputFile: "test.css" }, { noSourceMap: true });
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
	await sass.compileFromFilesToFiles(".\\dart.exe", "sass.snapshot", [{ inputFile: "test.scss", outputFile: "test.css" }]);
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
