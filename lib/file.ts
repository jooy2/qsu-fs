import { exec } from 'child_process';
import { join, resolve as pathResolve, extname, basename, dirname, win32, posix } from 'path';
import { constants, createReadStream } from 'fs';
import { stat, mkdir, rename, readdir, utimes, rm, open, readFile, access } from 'fs/promises';
import { createHash } from 'crypto';
import { Stats } from 'node:fs';
import type { FileInfo } from './types.js';

export function isHiddenFile(filePath: string, isWindows = false): Promise<boolean> {
	return new Promise<boolean>((resolve) => {
		if (isWindows) {
			exec(`attrib "${filePath}"`, (error, stdout, stderr) => {
				if (error || stderr || !stdout) {
					resolve(false);
					return;
				}
				resolve(stdout.replace(filePath, '').includes('H'));
			});
		} else {
			resolve(/(^|\/)\.[^/.]/.test(filePath.split('/')?.pop() || '/'));
		}
	});
}

export function humanizeFileSize(bytes: number, decimals = 2): string {
	const sizeUnits = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	if (bytes < 1) {
		return `0 ${sizeUnits[0]}`;
	}

	const byteCalc = Math.floor(Math.log(bytes) / Math.log(1024));

	return `${parseFloat((bytes / 1024 ** byteCalc).toFixed(decimals < 0 ? 0 : decimals))} ${
		sizeUnits[byteCalc]
	}`;
}

export function toValidFilePath(filePath: string, isWindows?: boolean): string {
	if (isWindows) {
		let windowsPath = filePath;

		if (windowsPath.length > 2 && !/^[a-zA-Z]:/.test(windowsPath)) {
			windowsPath = `\\${windowsPath}`;
		}

		if ((windowsPath.match(/\\/g) || []).length > 1 && /\\$/.test(windowsPath)) {
			windowsPath = windowsPath.replace(/\\$/, '');
		}

		if (/^[a-zA-Z]:$/.test(windowsPath)) {
			windowsPath = `${windowsPath}\\`;
		}

		return windowsPath.replace(/\\{2,}/g, '\\');
	}

	let unixPath: string = filePath;

	if (!/^\//.test(unixPath)) {
		unixPath = `/${unixPath}`;
	}

	unixPath = unixPath.replace(/\/{2,}/g, '/');

	if (unixPath.length > 1) {
		unixPath = unixPath.replace(/\/$/, '');
	}

	return unixPath;
}

export function joinFilePath(isWindows: boolean, ...paths: string[]): string {
	if (isWindows) {
		return toValidFilePath(win32.join(...paths), true);
	}

	return toValidFilePath(posix.join(...paths), false);
}

export function toPosixFilePath(filePath: string): string {
	return filePath
		.replace(/^\\\\\?\\/, '')
		.replace(/\\/g, '/')
		.replace(/\/\/+/g, '/');
}

export function getFilePathLevel(filePath: string): number {
	if (!filePath) {
		return -1;
	}

	if (filePath === '/') {
		return 1;
	}

	return toPosixFilePath(filePath.replace(/\\+$/, '')).split(posix.sep).length;
}

export function getParentFilePath(filePath: string, isWindows?: boolean): string {
	const listPathItem = filePath.split(isWindows ? '\\' : '/');
	let currentPath;

	listPathItem.pop();

	if (listPathItem.length === 1) {
		if (isWindows) {
			currentPath = 'C:\\';
		} else {
			currentPath = '/';
		}
	} else {
		currentPath = listPathItem.join(isWindows ? '\\' : '/');
	}

	return toValidFilePath(currentPath, isWindows);
}

export function getFileName(filePath: string, withExtension?: boolean): string {
	if (!filePath) {
		return '';
	}

	if (filePath.indexOf('/') === -1 && filePath.indexOf('\\') !== -1) {
		// Windows path
		if (withExtension) {
			return win32.basename(filePath);
		}

		return win32.basename(filePath, extname(filePath));
	}

	if (withExtension) {
		return basename(filePath);
	}
	return basename(filePath, extname(filePath));
}

export function isValidFileName(filePath: string, unixType?: boolean): boolean {
	let fileNameRegex;
	const fileName = getFileName(filePath);

	if (unixType) {
		fileNameRegex = /(^\s+$)|(^\.+$)|([:/]+)/;
	} else {
		// Windows
		fileNameRegex = /(^\s+$)|(^\.+$)|([<>:"/\\|?*]+)/;
	}

	return !fileNameRegex.test(fileName) && fileName.length <= 255;
}

// NFD - macOS
// NFC - Windows
export function normalizeFile(
	filePath: string,
	normalizationForm?: 'NFD' | 'NFC' | 'NFKC' | 'NFKD' | undefined
): string {
	if (!filePath || filePath.length < 1) {
		return '';
	}

	return filePath.normalize(normalizationForm);
}

export function getFileExtension(filePath: string, isWindows?: boolean): string | null {
	let strPath: string | undefined = filePath.split(isWindows ? '\\' : '/').pop();

	if (!strPath) {
		return null;
	}

	strPath = extname(strPath) || strPath;

	if (strPath.indexOf('.') === -1) {
		return null;
	}

	return strPath.split('.')?.pop()?.toLowerCase() || null;
}

export async function getFileInfo(filePath: string): Promise<FileInfo> {
	const dateToUnixTime = (date: Date): number => Math.floor(new Date(date).getTime() / 1000);

	try {
		const fileItem: Stats = await stat(filePath);

		return {
			success: true,
			isDirectory: fileItem.isDirectory(),
			ext: getFileExtension(filePath),
			size: fileItem.size,
			sizeHumanized: humanizeFileSize(fileItem.size),
			name: getFileName(filePath),
			dirname: dirname(filePath),
			path: pathResolve(filePath),
			created: dateToUnixTime(fileItem.ctime),
			modified: dateToUnixTime(fileItem.mtime)
		};
	} catch (err) {
		if (err instanceof Error) {
			throw new Error(err.message);
		}
	}

	return {
		success: false,
		isDirectory: false,
		ext: null,
		size: 0,
		sizeHumanized: '0 Bytes',
		name: 'unknown',
		dirname: dirname(filePath),
		path: filePath,
		created: -1,
		modified: -1
	};
}

export async function headFile(filePath: string, length = 1): Promise<string | null> {
	try {
		const content = await readFile(filePath, 'utf-8');
		const contentByLine = content.split('\n');
		let result = '';

		for (let i = 0, len = length; i < len; i += 1) {
			result += `${contentByLine[i]}${length < 2 || i === len - 1 ? '' : '\n'}`;
		}

		return result.length < 1 ? null : result;
	} catch (err) {
		if (err instanceof Error) {
			throw new Error(err.message);
		}
	}
	return null;
}

export async function tailFile(filePath: string, length = 1): Promise<string | null> {
	try {
		const content = await readFile(filePath, 'utf-8');
		const contentByLine = content.split('\n');
		let result = '';

		if (contentByLine[contentByLine.length - 1].length < 1) {
			contentByLine.pop();
		}

		for (let i = contentByLine.length, len = contentByLine.length - length; i > len; i -= 1) {
			result = `${contentByLine[i - 1]}${result.length < 1 || i - 1 === len ? '' : '\n'}${result}`;
		}

		return result.length < 1 ? null : result;
	} catch (err) {
		if (err instanceof Error) {
			throw new Error(err.message);
		}
	}
	return null;
}

export async function isFileExists(filePath: string): Promise<boolean> {
	try {
		await access(filePath, constants.F_OK);
		return true;
	} catch (error) {
		return false;
	}
}

export async function createFolder(filePath: string, recursive = true): Promise<void> {
	try {
		if (!(await isFileExists(filePath))) {
			await mkdir(filePath, {
				recursive
			});
		}
	} catch (err) {
		if (err instanceof Error) {
			throw new Error(err.message);
		}
	}
}

export async function touchFile(filePath: string): Promise<void> {
	if (!filePath) {
		return;
	}

	const date: Date = new Date();

	try {
		await utimes(filePath, date, date);
	} catch (err) {
		const data = await open(filePath, 'a');

		await data.close();
	}
}

export async function touchFileWithDummy(filePath: string, size: number): Promise<boolean> {
	if (!size || size < 0) {
		throw new Error('Size is required');
	}

	try {
		if (size === 0) {
			await touchFile(filePath);
			return true;
		}

		const data = await open(filePath, 'w');

		await data.write(Buffer.alloc(1), 0, 1, size - 1);
		await data.close();

		return true;
	} catch (err) {
		return false;
	}
}

export async function deleteFile(filePath: string): Promise<void> {
	if (!filePath) {
		return;
	}

	try {
		await rm(filePath, {
			recursive: true,
			force: true
		});
	} catch {
		// Do Nothing
	}
}

export async function moveFile(filePath: string, targetFilePath: string): Promise<void> {
	if (!filePath || !targetFilePath) {
		return;
	}

	await rename(filePath, targetFilePath);
}

export async function deleteAllFileFromDirectory(directoryPath: string): Promise<void> {
	let fileItems: Array<string> = [];

	try {
		fileItems = await readdir(directoryPath);
	} catch {
		// Do nothing
	}

	const fileItemLength: number = fileItems.length;

	for (let i = 0; i < fileItemLength; i += 1) {
		// eslint-disable-next-line no-await-in-loop
		await deleteFile(join(directoryPath, fileItems[i]));
	}
}

export async function hashFile(
	filePath: string,
	algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512' = 'md5'
): Promise<string> {
	return new Promise((resolve, reject) => {
		if (!filePath) {
			reject(new Error('Invalid path'));
			return;
		}

		const hashHandler = createHash(algorithm);
		const stream = createReadStream(filePath);

		stream.on('error', (err: Error) => {
			reject(err);
		});

		stream.on('data', (chunk: Buffer | string) => {
			hashHandler.update(chunk);
		});

		stream.on('end', () => {
			resolve(hashHandler.digest('hex'));
		});
	});
}
