# Change Log

## 1.2.2 (2025-02-16)

- `getFileExtension`: Return `null` instead of empty string when no extension detected

## 1.2.1 (2024-12-07)

- Fix import of type declaration files
- Fix critical import issue

## 1.2.0 (2024-12-06)

NOTE: This version is broken. Please use `1.2.1` or later.

- **BREAKING CHANGES**: The `fsman` module is now part of the `qsu` utility family. It can now be installed as `qsu-fs`. Modules with old names will be deleted.
- **BREAKING CHANGES**: The package no longer uses classes, so if you want to import the entire module at once, you must use something like `import * as _ from 'qsu-fs'`. (`_` -> `* as _`)

## 1.12.1 (2024-05-14)

- `deleteFile`: Remove unnecessary file existence checks
- `joinFilePath`: Responding to parent dir paths
- cleanup: Remove redundant codes

## 1.12.0 (2024-04-12)

- BREAKING CHANGE: Most methods have been renamed to avoid conflicts with the fs module in named imports. Please refer to `README.md`.
- BREAKING CHANGE: Most methods now behave async, returning a **Promise**. Please change your existing code to use `await/then` to ensure correct behavior.
- `toValidFilePath`: `resolvePath` method renamed to `toValidFilePath`
- `toValidFilePath`: Fix incorrect path retuning on Windows
- `getParentFilePath`: Add getParentFilePath method

## 1.11.0 (2024-03-11)

- BREAKING CHANGE: `normalize` now requires the `normalizationForm` value to be entered directly instead of the `os` argument value. If specified as `undefined`, it defaults to `NFC` (e.g. `NFC`, `NFD`...)
- `isHidden`: Reduce the load by using a faster, simpler algorithm.

## 1.10.0 (2023-08-17)

- `toPosixPath`: Add toPosixPath method
- `getPathLevel`: Add getPathLevel method

## 1.9.0 (2023-05-19)

- `isHidden`: Fix not working correctly

## 1.8.4 (2023-05-17)

- Remove unnecessary files

## 1.8.3 (2023-05-17)

- `ext`: Fix getting wrong extension when using windows
- Remove dependent module

## 1.8.2 (2023-05-15)

- `ext`: Fix getting wrong extension if the folder path contains a dot

## 1.8.1 (2023-01-28)

- `ext`: String always return lower case

## 1.8.0 (2022-12-26)

- `touchDummy`: Add touchDummy method
- Fix README.md
- Upgrade package dependencies

## 1.7.0 (2022-11-29)

- `normalize`: Add normalize method
- `head`: Add head method
- `tail`: Add tail method

## 1.6.1 (2022-10-31)

- Fix README.md

## 1.6.0 (2022-10-29)

- Support named import
- Upgrade package dependencies
- Change test script to TypeScript
- Add prettier and reformat all codes

## 1.5.1 (2022-10-08)

- Upgrade package dependencies

## 1.5.0 (2022-09-03)

- Reduced bundle size due to minify executable code

## 1.4.0 (2022-08-20)

- Add GitHub workflows
- `fileName`: Add fileName method

## 1.3.0 (2022-07-24)

- `ext`: Add ext method
- `stat`: Add stat method
- Upgrade package dependencies

## 1.2.0 (2022-06-07)

- `empty`: Add empty method
- `rm`: use `rmSync` instead of `unlinkSync`

## 1.1.0 (2022-05-30)

- `touch`: Add touch method
- `rm`: Add rm method

## 1.0.0 (2022-05-15)

- First version release

## 0.0.1 ~ 0.0.6 (2022-01-24 ~ 2022-02-17)

- This is for the Alpha release and is not recommended for use
