export interface FileInfo {
	success: boolean;
	isDirectory: boolean;
	size: number;
	sizeHumanized: string;
	name: string;
	dirname: string;
	path: string;
	ext: string | null;
	created: number;
	modified: number;
}
