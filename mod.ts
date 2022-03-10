// For details, see: https://sass-lang.com/documentation/cli/dart-sass

export type SourceMapOptions =
	| {
		noSourceMap: true;
		sourceMapUrls?: undefined;
		embedSources?: undefined;
		embedSourceMap?: undefined;
	}
	| {
		noSourceMap?: undefined;
		sourceMapUrls?: "relative" | "absolute";
		embedSources?: true;
		embedSourceMap?: true;
	};

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
} & SourceMapOptions;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function compileFromStringToString(dartExecutable: string, sassSnapshot: string, inputString: string, options?: SassOptions) {
	const command = createCommand(dartExecutable, sassSnapshot, options);
	command.push("--stdin");
	return processStdin(command, inputString);
}

export function compileFromFileToString(dartExecutable: string, sassSnapshot: string, inputFile: string, options?: SassOptions) {
	const command = createCommand(dartExecutable, sassSnapshot, options);
	command.push(inputFile);
	return processStdout(command);
}

export function compileFromFileToFile(dartExecutable: string, sassSnapshot: string, { inputFile, outputFile }: { inputFile: string, outputFile: string }, options?: SassOptions) {
	const command = createCommand(dartExecutable, sassSnapshot, options);
	command.push(`${inputFile}:${outputFile}`);
	return processStderr(command);
}

export function compileFromFilesToFiles(dartExecutable: string, sassSnapshot: string, mode: { inputFile: string, outputFile: string }[], options?: SassOptions) {
	const command = createCommand(dartExecutable, sassSnapshot, options);
	for (const { inputFile, outputFile } of mode) {
		command.push(`${inputFile}:${outputFile}`);
	}
	return processStderr(command);
}

function createCommand(dartExecutable: string, sassSnapshot: string, options?: SassOptions) {
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
		async function writeStdin() {
			try {
				if (stdinBuf.byteLength !== await process.stdin.write(stdinBuf)) {
					throw new Error();
				}
			} finally {
				process.stdin.close();
			}
		}
		const [status, stdout, stderr] = await Promise.all([
			process.status(),
			process.output(),
			process.stderrOutput(),
			writeStdin()
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
