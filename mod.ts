// TODO(Mark): Document SassOptions and returned functions

/** Options for using dart-sass. */
export interface DartSassOptions {

	/** The dart-sass version to be used, e.g. "1.49.9". Defaults to "latest". */
	version?: "latest" | string;

	/** The "<‍operating-system>-<‍architecture>" tuple to be used. Defaults to the current operating system and architecture. */
	target?: "linux-x64" | "macos-x64" | "windows-x64";

	/** The directory that the dart executable and the sass snapshot are located in. Defaults to the current working directory. */
	fromDirectory?: string;

	/** The name of the dart executable. Defaults to "dart.exe" on Windows, "dart" on MacOS and Linux. */
	dartExecutableName?: string;

	/** The name of the sass snapshot. Defaults to "sass.snapshot". */
	sassSnapshotName?: string;

	/** Fail if either the dart executable or the sass snapshot are missing, instead of attempting to download the missing files from GitHub. */
	failIfMissing?: true;
}

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
 * const dartSass = await useDartSass();
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
export async function useDartSass(options?: DartSassOptions) {
	const textEncoder = new TextEncoder();
	const textDecoder = new TextDecoder();
	const { os, arch } = Deno.build;
	const pathSeparator =  os === "windows" ? "\\" : "/";

	let { version, target, fromDirectory, dartExecutableName, sassSnapshotName, failIfMissing } = applyDefaultOptions(options);

	const dartExecutable = fromDirectory + pathSeparator + dartExecutableName;
	const sassSnapshot = fromDirectory + pathSeparator + sassSnapshotName;
	const zipFile = fromDirectory + pathSeparator + "dart-sass.zip";

	try {
		await Promise.all([
			Deno.stat(dartExecutable),
			Deno.stat(sassSnapshot)
		]);
	} catch {
		if (failIfMissing) {
			throw new Error(`missing '${dartExecutableName}' (${dartExecutable}) and '${sassSnapshotName}' (${sassSnapshot})`);
		}
		await Deno.mkdir(fromDirectory, { recursive: true });
		await fetchZipFile();
		await unzipFiles();
		await renameFiles();
		await cleanUpFiles();
	}

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

	function applyDefaultOptions(options: DartSassOptions = {}) {
		let { version, target, fromDirectory, dartExecutableName, sassSnapshotName, failIfMissing } = options;
		if (version === undefined) {
			version = "latest";
		}
		if (target === undefined) {
			if (arch == "x86_64") {
				switch (os) {
					case "windows": target = "windows-x64"; break;
					case "darwin": target = "macos-x64"; break;
					case "linux": target = "linux-x64"; break;
					default: throw new Error(`unsupported operating system: '${os}'`);
				}
			} else {
				throw new Error(`unsupported architecture: '${arch}'`);
			}
		}
		if (fromDirectory === undefined) {
			fromDirectory = ".";
		}
		if (dartExecutableName === undefined) {
			if (os === "windows") {
				dartExecutableName = "dart.exe";
			} else {
				dartExecutableName = "dart";
			}
		}
		if (sassSnapshotName === undefined) {
			sassSnapshotName = "sass.snapshot";
		}
		return { version, target, fromDirectory, dartExecutableName, sassSnapshotName, failIfMissing };
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

	async function unzipFiles() {
		const tar = os === "windows" ? "tar.exe" : "tar";
		await processStderr([tar, "xf", zipFile, "-C", fromDirectory!]);
	}

	async function renameFiles() {
		if (os === "windows") {
			await Promise.all([
				Deno.rename(fromDirectory + "\\dart-sass\\src\\dart.exe", dartExecutable),
				Deno.rename(fromDirectory + "\\dart-sass\\src\\sass.snapshot", sassSnapshot)
			]);
		} else {
			await Promise.all([
				Deno.rename(fromDirectory + "/dart-sass/src/dart", dartExecutable),
				Deno.rename(fromDirectory + "/dart-sass/src/sass.snapshot", sassSnapshot)
			]);
		}
	}

	async function cleanUpFiles() {
		await Promise.all([
			Deno.remove(zipFile),
			Deno.remove(fromDirectory + pathSeparator + "dart-sass", { recursive: true })
		]);
	}

	async function fetchZipFile() {
		if (version === "latest") {
			const res = await fetch("https://github.com/sass/dart-sass/releases/latest", { redirect: "manual" });
			const location = res.headers.get("location")!;
			version = location.match(/^.*\/(.*)$/)![1];
		}
		const url = `https://github.com/sass/dart-sass/releases/download/${version}/dart-sass-${version}-${target}.zip`;
		const res = await fetch(url);
		if (!res.ok) {
			throw new Error(res.statusText);
		}
		const data = new Uint8Array(await res.arrayBuffer());
		await Deno.writeFile(zipFile, data);
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
