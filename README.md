# 💾 qsu-fs

A file system utility that can be used with **[Node.js](https://nodejs.org)** fs module.

> [![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/jooy2/fsman/blob/master/LICENSE) ![Programming Language Usage](https://img.shields.io/github/languages/top/jooy2/fsman) [![npm latest package](https://img.shields.io/npm/v/fsman/latest.svg)](https://www.npmjs.com/package/fsman) [![npm downloads](https://img.shields.io/npm/dm/fsman.svg)](https://www.npmjs.com/package/fsman) ![github repo size](https://img.shields.io/github/repo-size/jooy2/fsman) [![Followers](https://img.shields.io/github/followers/jooy2?style=social)](https://github.com/jooy2) ![Stars](https://img.shields.io/github/stars/jooy2/fsman?style=social) ![Commit Count](https://img.shields.io/github/commit-activity/y/jooy2/fsman) ![Line Count](https://img.shields.io/tokei/lines/github/jooy2/fsman)

## Installation

qsu-fs requires `Node.js 18.x` or higher, and the repository is serviced through **[NPM](https://npmjs.com)**.

After configuring the node environment, you can simply run the following command.

```shell
# via npm
$ npm install qsu-fs

# via yarn
$ yarn add qsu-fs

# via pnpm
$ pnpm install qsu-fs
```

## How to use

### Using named import (Multiple utilities in a single require) - Recommend

```javascript
import { isHiddenFile, humanizeFileSize } from 'fsman';

async function main() {
  console.log(await isHiddenFile('.hiddenFile')); // true
  console.log(humanizeFileSize(1000000)); // '976.56 KB'
}
```

### Using whole class (multiple utilities simultaneously with one object)

```javascript
import fsman from 'fsman';

async function main() {
  console.log(await fsman.isHiddenFile('.hiddenFile')); // true
  console.log(fsman.humanizeFileSize(1000000)); // '976.56 KB'
}
```

## Methods

### `isHiddenFile (Promise<Boolean>)`

Checks whether a file or folder in the specified path is a hidden file. Determines system hidden files for Windows and the presence or absence of a `.`(dot) for Linux and macOS or other operating systems.

If Windows fails to get the file properties, it assumes the file is not hidden.

- `filePath <String>`: File or directory path
- `isWindows <Boolean>`: Whether the target operating system to be checked is Windows

```javascript
console.log(await fsman.isHiddenFile('text.txt')); // false
console.log(await fsman.isHiddenFile('.hiddenFile')); // true
console.log(await fsman.isHiddenFile('.hiddenFile', true)); // false (Files with no hidden attribute applied in Windows)
```

### `isFileExists (Promise<Boolean>)`

Returns `true` if the file at the given path exists.

- `filePath <String>`: File or directory path

```javascript
console.log(await fsman.isFileExists('text.txt')); // true
console.log(await fsman.isFileExists('not-exist.txt')); // false
```

### `humanizeFileSize (<String>)`

Returns the given byte argument as a human-friendly string.

- `bytes <Number>`: Converts it to a human-friendly string via the bytes provided here.
- `decimals <Number> (Default: 2)`: Specifies the number of decimal places to represent.

```javascript
console.log(await fsman.humanizeFileSize(1000000)); // '976.56 KB'
console.log(await fsman.humanizeFileSize(100000000, 3)); // '95.367 MB'
```

### `toValidFilePath (<String>)`

Remove invalid or unnecessary characters in the path.

- `filePath <String>`: File or directory path
- `isWindows <Boolean>`: Whether the target operating system to be checked is Windows

```javascript
console.log(fsman.toValidFilePath('C:\\Windows\\System32\\'), true); // 'C:\Windows\System32'
console.log(fsman.toValidFilePath('home/user/.bashrc')); // '/home/user/.bashrc'
```

### `getFilePathLevel (<Number>)`

Determine how many steps the current path is. The root path (`/` or `C:\`) begins with step 1.

- `filePath <String>`: File or directory path

```javascript
// Include 'C:\' root path
console.log(fsman.getFilePathLevel('C:\\Windows\\System32')); // 3
// Include '/' root path
console.log(fsman.getFilePathLevel('/home/user')); // 3
```

### `getParentFilePath (<String>)`

Returns the parent path one level above the given path.

- `filePath <String>`: File or directory path

```javascript
console.log(fsman.getParentFilePath('C:\\Windows\\System32', true)); // 'C:\Windows'
console.log(fsman.getParentFilePath('/home/user/text.txt')); // '/home/user'
```

### `toPosixFilePath (<String>)`

Returns the given path as a path in POSIX format (usually used by Linux). For example, a Windows path will be converted to `/` instead of `\\`.

- `filePath <String>`: File or directory path

```javascript
console.log(fsman.toPosixFilePath('C:\\Windows\\System32')); // 'C:/Windows/System32'
```

### `joinFilePath (<String>)`

Combines paths for each operating system according to the given parameter values.

- `isWindows <Boolean>`: Whether the target operating system to be checked is Windows
- `paths <String[]>`: A path value consisting of one or more strings. Omit the path separator and put it in the parameter.

```javascript
console.log(fsman.joinFilePath(true, 'C:\\', 'Windows', 'System32')); // 'C:\Windows\System32'
console.log(fsman.joinFilePath(false, 'home', '/user', '.bashrc')); // '/home/user/.bashrc'
```

### `isValidFileName (<Boolean>)`

Determines whether the passed path or filename is using a system-accepted string (Also check the valid file length). Returns false if the name is not available.

- `filePath <String>`: File or directory path
- `unixType <Boolean?>`: Passes true if the file type is unix type.

```javascript
console.log(fsman.isValidFileName('C:\\Windows\\System32*')); // false
console.log(fsman.isValidFileName('/home/user/.bashrc', true)); // true
```

### `createFolder (<Void>)`

Creates a directory with the specified path. Ignores the operation if the directory already exists.

- `filePath <String>`: File or directory path
- `recursive <Boolean?|true>`: Recursively creates all directories in the given path.

```javascript
fsman.createFolder('/home/user/a/b/c');
```

### `getFileName (<String>)`

Returns the file name within the path.

- `filePath <String>`: File or directory path
- `withExtension <Boolean?|false>`: Returns the name with extension.

```javascript
console.log(fsman.getFileName('/home/user/test.txt')); // 'test'
console.log(fsman.getFileName('/home/user/test.txt', true)); // 'test.txt'
```

### `normalizeFile (<String>)`

Changes a string (usually file names) according to the Unicode normalization form method used by each operating system.

- `filePath <String>`: File or directory path
- `normalizationForm <'NFC'|'NFD'|'NFKC'|'NFKD'|undefined>`: Normalization method (If value is `undefined`, `NFC` is used.)

```javascript
console.log(fsman.normalizeFile('안녕하세요Hello.txt', 'NFC')); // '안녕하세요Hello.txt'
console.log(fsman.normalizeFile('안녕하세요Hello.txt', 'NFD')); // '안녕하세요Hello.txt'
```

### `getFileExtension (<String>)`

Returns the file extension from the given file path. An empty string value is returned for files without extension.

- `filePath <String>`: File or directory path
- `isWindows <Boolean?|false>`: If the given file path is a Windows system path

```javascript
console.log(fsman.getFileExtension('/home/user/test.txt')); // 'txt'
console.log(fsman.getFileExtension('/home/user/test.txt.sample')); // 'sample'
```

### `getFileInfo (<FileStat>)`

Returns file or directory information as an easy-to-understand object.

- `filePath <String>`: File or directory path

```javascript
console.log(fsman.getFileInfo('/home/user/test.txt'));
```

Examples of returned values:

```json5
{
  success: true, // Whether the file stat import was successful
  isDirectory: false,
  ext: 'txt',
  size: 33,
  sizeHumanized: '33 Bytes',
  name: 'test.txt',
  dirname: 'user',
  path: '/home/user/test.txt',
  created: 1652581984, // Unix timestamp
  modified: 1652581984 // Unix timestamp
}
```

### `headFile (<String|Null>)`

Returns the first line of the specified text file path. The `length` argument is the total number of lines to print. Default is `1`.

- `filePath <String>`: File or directory path
- `length <number>`: Number of lines of text to return

```javascript
console.log(fsman.headFile('/test/targets/hello.md')); // '# Hello, World!'
```

### `tailFile (<String|Null>)`

Returns the last line of the specified text file path. The `length` argument is the total number of lines to print. Default is `1`. The last line of newline characters is ignored.

- `filePath <String>`: File or directory path
- `length <number>`: Number of lines of text to return

```javascript
console.log(fsman.tailFile('/test/targets/hello.md')); // '--- Hello End ---'
```

### `touchFile (<Void>)`

Create a file of empty data. If the same file already exists, it is ignored.

- `filePath <String>`: File or directory path

```javascript
fsman.touchFile('/home/user/test.txt');
```

### `touchFileWithDummy (<Void>)`

Creates a file with the specified size in bytes.

- `filePath <String>`: File or directory path
- `size <number>`: Size of the file to be created (Dummy data is filled as much as the given size)

```javascript
fsman.touchFileWithDummy('/home/user/test.txt', 100000);
```

### `deleteFile (<Void>)`

Delete files or directory in the specified path. If the file does not exist in the path, it is ignored.

This method also supports deleting directory paths. If files exist within the directory, they are included and removed.

- `filePath <String>`: File or directory path

```javascript
fsman.deleteFile('/home/user/text.txt');
```

### `moveFile (<Void>)`

Moves a file in the specified file path to another path.

- `filePath <String>`: File or directory path
- `targetFilePath <String>`: Path of file to move

```javascript
fsman.moveFile('/home/user/text.txt', '/home/user/text2.txt');
```

### `deleteAllFileFromDirectory (<Void>)`

Deletes all files in the specified directory path. However, the directory is preserved.

- `directoryPath <String>`: Directory path

```javascript
fsman.deleteAllFileFromDirectory('/home/user/Downloads');
```

### `hashFile (Promise<String>)`

Returns the file in the specified path as a value hashed by a specific algorithm. The default algorithm is `md5`. This method uses a `Promise` to return a valid hash value.

- `filePath <String>`: File or directory path
- `algorithm <'md5'|'sha1'|'sha256'|'sha512'>`: OpenSSL algorithm to be used for file hashing

```javascript
console.log(await fsman.hashFile('/home/user/text.txt', 'sha1')); // '38851813f75627d581c593f3ccfb7061dd013fbd'
```

## Contribute

You can report issues on [GitHub Issue Tracker](https://github.com/jooy2/fsman/issues). You can also request a pull to fix bugs and add frequently used features.

## License

Copyright © 2022-2024 [Jooy2](https://jooy2.com) <[jooy2.contact@gmail.com](mailto:jooy2.contact@gmail.com)> Released under the MIT license.
