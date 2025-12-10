import type { FileInfo } from "./types.js";

/** Directory listing finished (success or failure). @public */
export class DirReadMsg {
  readonly _tag = "filepicker-dir-read";

  constructor(
    public readonly path: string,
    public readonly files: FileInfo[],
    public readonly error?: Error,
  ) {}
}

/** A file or directory was selected. @public */
export class FileSelectedMsg {
  readonly _tag = "filepicker-file-selected";

  constructor(public readonly file: FileInfo) {}
}


