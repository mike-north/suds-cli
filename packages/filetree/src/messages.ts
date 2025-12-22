import type { DirectoryItem } from "./types.js";

/**
 * Message containing directory listing results.
 * @public
 */
export class GetDirectoryListingMsg {
  readonly _tag = "filetree-get-directory-listing";
  
  constructor(public readonly items: DirectoryItem[]) {}
}

/**
 * Message containing an error.
 * @public
 */
export class ErrorMsg {
  readonly _tag = "filetree-error";
  
  constructor(public readonly error: Error) {}
}
