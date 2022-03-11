
/** Options for using dart-sass. */
export interface DartSassOptions {

	/** The dart-sass version to be used, e.g. "1.49.9". */
	version: string;

	/** The "$OS-$ARCH" tuple to be used. Defaults to the current OS and architecture. */
	target?: "linux-x64" | "macos-x64" | "windows-x64";

	/** The directory that the dart executable and the sass snapshot are located in. Defaults to the current working directory. */
	fromDirectory?: string;

	/** The name of the dart executable. to Defaults to "dart.exe" on Windows, "dart" on MacOS and Linux. */
	dartExecutableName?: string;

	/** The name of the sass snapshot. Defaults to "sass.snapshot". */
	sassSnapshotName?: string;

	/** Fail if either the dart executable or the sass snapshot are missing, instead of attempting to download the missing files from GitHub. */
	failIfMissing?: true;
}

// TODO(Mark): Document options
export type SassOptions = {
	loadPath?: string | string[];
	style?: "expanded" | "compressed";
	charset?: boolean;
	errorCss?: boolean;
	update?: true;
	stopOnError?: true;
	color?: boolean;
	unicode?: boolean;
	quiet?: true;
	quietDeps?: true;
} & ({
	noSourceMap: true;
	sourceMapUrls?: undefined;
	embedSources?: undefined;
	embedSourceMap?: undefined;
} | {
	noSourceMap?: undefined;
	sourceMapUrls?: "relative" | "absolute";
	embedSources?: true;
	embedSourceMap?: true;
});

/**
 * Use the specified dart-sass executable. If if does not exist, download it from GitHub.
 * 
 * ```typescript
 * const dartSass = await useDartSass({ version: "1.49.9" });
 * 
 * const scss = `
 * $zero: 0;
 * body {
 *   margin: $zero;
 * }
 * `;
 * 
 * const css = await dartSass.compileFromStringToString(scss);
 * 
 * console.log(css); /* Should log:
 * body {
 *   margin: 0;
 * }
 * *‍/
 * ```
 */
export async function useDartSass(options: DartSassOptions) {
	const textEncoder = new TextEncoder();
	const textDecoder = new TextDecoder();
	const { os, arch } = Deno.build;
	const pathSeparator =  os === "windows" ? "\\" : "/";

	// TODO(Mark): Implement actual download behavior
	const dartExecutable = ".\\dart.exe";
	const sassSnapshot = "sass.snapshot";

	function compileFromStringToString(inputString: string, options?: SassOptions) {
		const command = createCommand(options);
		command.push("--stdin");
		return processStdin(command, inputString);
	}

	function compileFromFileToString(inputFile: string, options?: SassOptions) {
		const command = createCommand(options);
		command.push(inputFile);
		return processStdout(command);
	}

	function compileFromFileToFile(inputFile: string, outputFile: string, options?: SassOptions) {
		const command = createCommand(options);
		command.push(`${inputFile}:${outputFile}`);
		return processStderr(command);
	}

	function compileFromFilesToFiles(files: { inputFile: string, outputFile: string }[], options?: SassOptions) {
		const command = createCommand(options);
		for (const { inputFile, outputFile } of files) {
			command.push(`${inputFile}:${outputFile}`);
		}
		return processStderr(command);
	}
	
	function createCommand(options?: SassOptions) {
		const command = [dartExecutable, sassSnapshot];
		if (options === undefined) {
			return command;
		}
		const { loadPath, style, charset, errorCss, update, noSourceMap, sourceMapUrls, embedSources, embedSourceMap, stopOnError, color, unicode, quiet, quietDeps } = options;
		if (loadPath !== undefined) {
				if (Array.isArray(loadPath)) {
					for (const p of loadPath) {
						command.push(`--load-path=${p}`);
					}
				} else {
					command.push(`--load-path=${loadPath}`);
				}
		}
		if (style !== undefined) {
			command.push(`--style=${style}`);
		}
		if (charset !== undefined) {
			if (charset) {
				command.push("--charset");
			} else {
				command.push("--no-charset");
			}
		}
		if (errorCss !== undefined) {
			if (errorCss) {
				command.push("--error-css");
			} else {
				command.push("--no-error-css");
			}
		}
		if (update) {
			command.push("--update");
		}
		if (noSourceMap) {
			command.push("--no-source-map");
		} else {
			if (sourceMapUrls !== undefined) {
				command.push(`--source-map-urls=${sourceMapUrls}`);
			}
			if (embedSources) {
				command.push("--embed-sources");
			}
			if (embedSourceMap) {
				command.push("--embed-source-map");
			}
		}
		if (stopOnError) {
			command.push("--stop-on-error");
		}
		if (color !== undefined) {
			if (color) {
				command.push("--color");
			} else {
				command.push("--no-color");
			}
		}
		if (unicode !== undefined) {
			if (unicode) {
				command.push("--unicode");
			} else {
				command.push("--no-unicode");
			}
		}
		if (quiet) {
			command.push("--quiet");
		}
		if (quietDeps) {
			command.push("--quiet-deps");
		}
		return command;
	}

	async function processStdin(cmd: string[], stdin: string) {
		const process = Deno.run({ cmd, stdin: "piped", stdout: "piped", stderr: "piped" });
		try {
			const stdinBuf = textEncoder.encode(stdin);
			async function writeToStdin() {
				try {
					const written = await process.stdin.write(stdinBuf);
					if (written !== stdinBuf.byteLength) {
						throw new Error(`failed to write to stdin: wrote ${written} of ${stdinBuf.byteLength} bytes`);
					}
				} finally {
					process.stdin.close();
				}
			}
			const [status, stdout, stderr] = await Promise.all([
				process.status(),
				process.output(),
				process.stderrOutput(),
				writeToStdin()
			]);
			if (status.success) {
				return textDecoder.decode(stdout);
			} else {
				throw new Error(textDecoder.decode(stderr))
			}
		} finally {
			process.close();
		}
	}

	async function processStdout(cmd: string[]) {
		const process = Deno.run({ cmd, stdout: "piped", stderr: "piped" });
		try {
			const [status, stdout, stderr] = await Promise.all([
				process.status(),
				process.output(),
				process.stderrOutput()
			]);
			if (status.success) {
				return textDecoder.decode(stdout);
			} else {
				throw new Error(textDecoder.decode(stderr))
			}
		} finally {
			process.close();
		}
	}

	async function processStderr(cmd: string[]) {
		const process = Deno.run({ cmd, stderr: "piped" });
		try {
			const [status, stderr] = await Promise.all([
				process.status(),
				process.stderrOutput()
			]);
			if (!status.success) {
				throw new Error(textDecoder.decode(stderr))
			}
		} finally {
			process.close();
		}
	}

	return {
		compileFromStringToString,
		compileFromFileToString,
		compileFromFileToFile,
		compileFromFilesToFiles
	}
}
