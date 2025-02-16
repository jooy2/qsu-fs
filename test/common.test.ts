import assert from 'assert';
import { describe, it } from 'node:test';
import {
	isHiddenFile,
	humanizeFileSize,
	toValidFilePath,
	joinFilePath,
	getFilePathLevel,
	getParentFilePath,
	toPosixFilePath,
	isValidFileName,
	getFileName,
	normalizeFile,
	getFileExtension,
	getFileInfo,
	headFile,
	tailFile,
	touchFile,
	touchFileWithDummy,
	deleteFile,
	deleteAllFileFromDirectory,
	moveFile,
	hashFile
} from '../dist';

const IS_WINDOWS_OS = process.platform === 'win32';
const LONG_PATH =
	'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\115.0.1901.203\\Trust Protection Lists';

describe('qsu-fs', () => {
	it('isHiddenFile', async () => {
		assert.strictEqual(await isHiddenFile('/home/user/Desktop/hello.txt'), false);
		assert.strictEqual(await isHiddenFile('~/.bash_profile'), true);
		assert.strictEqual(await isHiddenFile('.zshrc'), true);
		assert.strictEqual(await isHiddenFile('/home/user/Desktop/.hidden'), true);
		assert.strictEqual(await isHiddenFile('/home/user/Desktop/.conf/config'), false);
		assert.strictEqual(await isHiddenFile('/home/user/Desktop/.conf/.secret'), true);
		if (IS_WINDOWS_OS) {
			assert.strictEqual(await isHiddenFile('C:\\ProgramData', true), true);
			assert.strictEqual(await isHiddenFile('C:\\Users', true), false);
		}
	});

	it('humanizeFileSize', () => {
		assert.strictEqual(humanizeFileSize(0), '0 Bytes');
		assert.strictEqual(humanizeFileSize(1000000), '976.56 KB');
		assert.strictEqual(humanizeFileSize(100000000, 3), '95.367 MB');
	});

	it('toValidFilePath', () => {
		assert.strictEqual(toValidFilePath('home'), '/home');
		assert.strictEqual(toValidFilePath('/home//test/'), '/home/test');
		assert.strictEqual(toValidFilePath('home/test/.conf'), '/home/test/.conf');
		assert.strictEqual(toValidFilePath('/'), '/');
		assert.strictEqual(toValidFilePath('C:\\\\Users\\test\\', true), 'C:\\Users\\test');
		assert.strictEqual(
			toValidFilePath('C:\\Users\\test\\.config', true),
			'C:\\Users\\test\\.config'
		);
		assert.strictEqual(toValidFilePath('\\Users\\test\\.config', true), '\\Users\\test\\.config');
		assert.strictEqual(toValidFilePath('Users\\test\\.config', true), '\\Users\\test\\.config');
		assert.strictEqual(toValidFilePath('C:', true), 'C:\\');
		assert.strictEqual(toValidFilePath('C:\\\\', true), 'C:\\');
		assert.strictEqual(toValidFilePath('C:\\Users\\', true), 'C:\\Users');
	});

	it('joinFilePath', () => {
		assert.strictEqual(joinFilePath(true, 'C:\\', 'Windows', 'System32'), 'C:\\Windows\\System32');
		assert.strictEqual(
			joinFilePath(true, 'C:\\', 'Windows', '..', 'System32', 'Test.txt'),
			'C:\\System32\\Test.txt'
		);
		assert.strictEqual(joinFilePath(true, 'Users', 'test'), '\\Users\\test');
		assert.strictEqual(joinFilePath(true, 'C:\\Users\\test'), 'C:\\Users\\test');
		assert.strictEqual(joinFilePath(false, '/home', 'user', 'Desktop'), '/home/user/Desktop');
		assert.strictEqual(joinFilePath(false, 'home', '/user', '.bashrc'), '/home/user/.bashrc');
		assert.strictEqual(joinFilePath(false, 'home', '/user', '..', '.bashrc'), '/home/.bashrc');
	});

	it('getFilePathLevel', () => {
		assert.strictEqual(getFilePathLevel('C:'), 1);
		assert.strictEqual(getFilePathLevel('C:\\'), 1);
		assert.strictEqual(getFilePathLevel('C:\\Windows\\System32'), 3);
		assert.strictEqual(getFilePathLevel(LONG_PATH), 7);
		assert.strictEqual(getFilePathLevel('/'), 1);
		assert.strictEqual(getFilePathLevel('/home/user'), 3);
		assert.strictEqual(getFilePathLevel('/home/user/.ssh/test file.txt'), 5);
	});

	it('getParentFilePath', () => {
		assert.strictEqual(getParentFilePath('/home/user/test.txt'), '/home/user');
		assert.strictEqual(getParentFilePath('/home'), '/');
		assert.strictEqual(getParentFilePath('/'), '/');
		assert.strictEqual(getParentFilePath('C:\\', true), 'C:\\');
		assert.strictEqual(getParentFilePath('C:\\Users', true), 'C:\\');
		assert.strictEqual(getParentFilePath('C:\\Users\\my', true), 'C:\\Users');
	});

	it('toPosixFilePath', () => {
		assert.strictEqual(toPosixFilePath('\\\\Shared'), '/Shared');
		assert.strictEqual(toPosixFilePath('C:\\'), 'C:/');
		assert.strictEqual(toPosixFilePath('C:\\Windows\\System32'), 'C:/Windows/System32');
		assert.strictEqual(toPosixFilePath('Windows\\System32'), 'Windows/System32');
		assert.strictEqual(
			toPosixFilePath(LONG_PATH),
			'C:/Program Files (x86)/Microsoft/Edge/Application/115.0.1901.203/Trust Protection Lists'
		);
		assert.strictEqual(toPosixFilePath('/home/user/Test file.txt'), '/home/user/Test file.txt');
	});

	it('isValidFileName', () => {
		assert.strictEqual(isValidFileName('System32'), true);
		assert.strictEqual(isValidFileName('.example', true), true);
		assert.strictEqual(isValidFileName('hello.:txt', true), true);
		assert.strictEqual(isValidFileName('C:\\Windows\\System32'), true);
		assert.strictEqual(isValidFileName('C:\\Users\\test\\Desktop\\hello.txt'), true);
		assert.strictEqual(isValidFileName('C:\\Users\\test\\Desktop\\hello*'), false);
		assert.strictEqual(isValidFileName('C:\\Users\\test\\Desktop\\hello!@#$%^&*()_+-:='), false);
		assert.strictEqual(isValidFileName('hello!@#$%^&*()_+-:=', true), false);
		assert.strictEqual(isValidFileName('/home/test/Desktop/test/.example', true), true);
		assert.strictEqual(isValidFileName('/home/test/Desktop/test/text.txt', true), true);
		assert.strictEqual(isValidFileName('/home/test/Desktop/test/hi!@#$%^&*()_+-=', true), true);
		assert.strictEqual(isValidFileName('/home/test/Desktop/test/*hi', true), true);
		assert.strictEqual(
			isValidFileName(
				'/home/test/Desktop/test/0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345'
			),
			false
		); // 256
		assert.strictEqual(
			isValidFileName(
				'/home/test/Desktop/test/012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234',
				true
			),
			true
		); // 255
	});

	it('hashFile', async () => {
		const hashTable = IS_WINDOWS_OS
			? {
					md5: '239884dde2b4354613a228001b22d9b9',
					sha1: '38851813f75627d581c593f3ccfb7061dd013fbd',
					sha256: 'db42a58ad98348dc8647ef27054ffcab994a2359fe9e0daeeffe8cbfe2409583',
					sha512:
						'c0be4b1ff1aba7be9b02d619dd10e0bdfa4149cf0f241320fe237336aea286ff68c3f42fae4d707a1a59dc6a269e730d3bc4b9891347647bb5acb82b5792a503'
				}
			: {
					md5: '192ef428bd3e3413262df05679cee825',
					sha1: '2accd3e31a50c5ed9c6786ef34669bbda55d7156',
					sha256: '568770a759ef55df5c2a5d3cbfc5c62e2ade6a353c391037d91a97212dec9e88',
					sha512:
						'b03187c2962c947de2d5d3cdaa2f25e5e1df31c5190cccf42d03759d042dd5f5a2773ca9903e122b6faaf4a53b45c419d605464abb83cbe578ed249cb558844a'
				};

		assert.strictEqual(await hashFile('test/targets/STATIC_FILE.txt'), hashTable.md5);
		assert.strictEqual(await hashFile('test/targets/STATIC_FILE.txt', 'sha1'), hashTable.sha1);
		assert.strictEqual(await hashFile('test/targets/STATIC_FILE.txt', 'sha256'), hashTable.sha256);
		assert.strictEqual(await hashFile('test/targets/STATIC_FILE.txt', 'sha512'), hashTable.sha512);
	});

	it('getFileExtension', () => {
		assert.strictEqual(getFileExtension('test.123/sample.txt'), 'txt');
		assert.strictEqual(getFileExtension('test.123/sample'), null);
		assert.strictEqual(getFileExtension('test/sample.txt'), 'txt');
		assert.strictEqual(getFileExtension('test/hello.1/sample.txt'), 'txt');
		assert.strictEqual(getFileExtension('test/sample'), null);
		assert.strictEqual(getFileExtension('test.txt.sample'), 'sample');
		assert.strictEqual(getFileExtension('test'), null);
		assert.strictEqual(getFileExtension('TEST.FILE.TXT'), 'txt');
		assert.strictEqual(getFileExtension('test..txt..png'), 'png');
		assert.strictEqual(getFileExtension('txt', true), null);
		assert.strictEqual(getFileExtension('txt.png', true), 'png');
		assert.strictEqual(getFileExtension('/home/txt.txt'), 'txt');
		assert.strictEqual(getFileExtension('/home/txt.abc.png'), 'png');
		assert.strictEqual(getFileExtension('C:\\test\\txt.png', true), 'png');
		assert.strictEqual(getFileExtension('C:\\test.hello.sample\\txt', true), null);
		assert.strictEqual(getFileExtension('C:\\test.hello.sample\\txt.txt', true), 'txt');
	});

	it('getFileName', () => {
		assert.strictEqual(getFileName('test/sample.txt'), 'sample');
		assert.strictEqual(getFileName('test/sample.txt.sample'), 'sample.txt');
		assert.strictEqual(getFileName('test/sample.txt', true), 'sample.txt');
		assert.strictEqual(getFileName('C:\\Users\\user\\Desktop\\hello.txt'), 'hello');
		assert.strictEqual(getFileName('C:\\Users\\user\\Desktop\\hello.txt', true), 'hello.txt');
		assert.strictEqual(getFileName('test'), 'test');
	});

	it('normalizeFile', async () => {
		const NFD = '안녕하세요_12345-ABCDE'.normalize('NFD'); // macOS
		const NFC = '안녕하세요_12345-ABCDE'.normalize('NFC'); // Windows

		assert.strictEqual(await normalizeFile(NFD, 'NFC'), NFC);
		assert.strictEqual(await normalizeFile(NFC, 'NFD'), NFD);
	});

	it('getFileInfo', async () => {
		assert(await getFileInfo('test/targets/STATIC_FILE.txt'));
		assert(await getFileInfo('test'));
	});

	it('headFile', async () => {
		assert.strictEqual(await headFile('test/targets/hello.md'), '# Hello, World!');
		assert.strictEqual(await headFile('test/targets/hello.md', 1), '# Hello, World!');
		assert.strictEqual(
			await headFile('test/targets/hello.md', 4),
			'# Hello, World!\n\nThis is Hello File.\n'
		);
	});

	it('tailFile', async () => {
		assert.strictEqual(await tailFile('test/targets/hello.md'), '--- Hello End ---');
		assert.strictEqual(await tailFile('test/targets/hello.md', 1), '--- Hello End ---');
		assert.strictEqual(
			await tailFile('test/targets/hello.md', 4),
			'Do not modify this file.\n\n--- Hello End ---'
		);
	});

	it('touchFile', async () => {
		await touchFile('test/targets/__TEST__TOUCH_FILE.txt');
	});

	it('deleteFile', async () => {
		await deleteFile('test/targets/__TEST__TOUCH_FILE.txt');
	});

	it('touchFileWithDummy', async () => {
		const dummyFilePath = 'test/targets/__TEST__TOUCH_FILE.txt';

		await touchFileWithDummy(dummyFilePath, 100);

		const dummyFileStat = await getFileInfo(dummyFilePath);

		await deleteFile(dummyFilePath);

		if (dummyFileStat.size !== 100) {
			assert.fail('Test Failed. Dummy file not created correctly.');
		}
	});

	it('moveFile', async () => {
		await moveFile('test/targets/MV_TEST.txt', 'test/targets/MV_TEST_1.txt');
		await moveFile('test/targets/MV_TEST_1.txt', 'test/targets/MV_TEST.txt');
	});

	it('deleteAllFileFromDirectory', async () => {
		await deleteAllFileFromDirectory('test/targets/EMPTY');
	});
});
