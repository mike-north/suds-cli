import { matches } from "@suds-cli/key";
import { type Cmd, type Msg, KeyMsg, WindowSizeMsg } from "@suds-cli/tea";
import type { DirectoryItem } from "./types.js";
import { defaultKeyMap, type FiletreeKeyMap } from "./keymap.js";
import { defaultStyles, mergeStyles, type FiletreeStyles } from "./styles.js";
import { getDirectoryListingCmd } from "./fs.js";
import { GetDirectoryListingMsg, ErrorMsg } from "./messages.js";

/**
 * Options for creating a new FiletreeModel.
 * @public
 */
export interface FiletreeOptions {
  /** Initial directory to display */
  currentDir?: string;
  /** Whether to show hidden files */
  showHidden?: boolean;
  /** Custom key bindings */
  keyMap?: FiletreeKeyMap;
  /** Custom styles */
  styles?: Partial<FiletreeStyles>;
  /** Initial width */
  width?: number;
  /** Initial height */
  height?: number;
}

/**
 * Model for the filetree component.
 * @public
 */
export class FiletreeModel {
  /** Current cursor position */
  readonly cursor: number;
  
  /** Array of directory items */
  readonly files: DirectoryItem[];
  
  /** Whether component is active and receives input */
  readonly active: boolean;
  
  /** Key bindings */
  readonly keyMap: FiletreeKeyMap;
  
  /** Minimum viewport scroll position */
  readonly min: number;
  
  /** Maximum viewport scroll position */
  readonly max: number;
  
  /** Component height */
  readonly height: number;
  
  /** Component width */
  readonly width: number;
  
  /** Styles */
  readonly styles: FiletreeStyles;
  
  /** Current directory */
  readonly currentDir: string;
  
  /** Whether to show hidden files */
  readonly showHidden: boolean;
  
  /** Last error, if any */
  readonly error: Error | null;

  private constructor(
    cursor: number,
    files: DirectoryItem[],
    active: boolean,
    keyMap: FiletreeKeyMap,
    min: number,
    max: number,
    height: number,
    width: number,
    styles: FiletreeStyles,
    currentDir: string,
    showHidden: boolean,
    error: Error | null,
  ) {
    this.cursor = cursor;
    this.files = files;
    this.active = active;
    this.keyMap = keyMap;
    this.min = min;
    this.max = max;
    this.height = height;
    this.width = width;
    this.styles = styles;
    this.currentDir = currentDir;
    this.showHidden = showHidden;
    this.error = error;
  }

  /**
   * Creates a new filetree model.
   * @param options - Configuration options
   * @returns A new FiletreeModel instance
   * @public
   */
  static new(options: FiletreeOptions = {}): FiletreeModel {
    const currentDir = options.currentDir ?? process.cwd();
    const showHidden = options.showHidden ?? false;
    const keyMap = options.keyMap ?? defaultKeyMap;
    const styles = mergeStyles(options.styles);
    const width = options.width ?? 80;
    const height = options.height ?? 24;

    return new FiletreeModel(
      0, // cursor
      [], // files
      true, // active
      keyMap,
      0, // min
      height - 1, // max
      height,
      width,
      styles,
      currentDir,
      showHidden,
      null, // error
    );
  }

  /**
   * Initializes the model and returns a command to load the directory.
   * @returns Command to load directory listing
   * @public
   */
  init(): Cmd<GetDirectoryListingMsg | ErrorMsg> {
    return getDirectoryListingCmd(this.currentDir, this.showHidden);
  }

  /**
   * Sets whether the component is active and receives input.
   * @param active - Whether component should be active
   * @returns Updated model
   * @public
   */
  setIsActive(active: boolean): FiletreeModel {
    if (this.active === active) {
      return this;
    }

    return new FiletreeModel(
      this.cursor,
      this.files,
      active,
      this.keyMap,
      this.min,
      this.max,
      this.height,
      this.width,
      this.styles,
      this.currentDir,
      this.showHidden,
      this.error,
    );
  }

  /**
   * Updates the model in response to a message.
   * @param msg - The message to handle
   * @returns Tuple of updated model and command
   * @public
   */
  update(msg: Msg): [FiletreeModel, Cmd<Msg> | null] {
    // Handle directory listing message
    if (msg instanceof GetDirectoryListingMsg) {
      const newMax = Math.min(this.height - 1, msg.items.length - 1);
      return [
        new FiletreeModel(
          0, // reset cursor to top
          msg.items,
          this.active,
          this.keyMap,
          0,
          newMax,
          this.height,
          this.width,
          this.styles,
          this.currentDir,
          this.showHidden,
          null, // clear error
        ),
        null,
      ];
    }

    // Handle error message
    if (msg instanceof ErrorMsg) {
      return [
        new FiletreeModel(
          this.cursor,
          this.files,
          this.active,
          this.keyMap,
          this.min,
          this.max,
          this.height,
          this.width,
          this.styles,
          this.currentDir,
          this.showHidden,
          msg.error,
        ),
        null,
      ];
    }

    // Handle window size message
    if (msg instanceof WindowSizeMsg) {
      const newHeight = msg.height;
      const newWidth = msg.width;
      const newMax = Math.min(newHeight - 1, this.files.length - 1);

      return [
        new FiletreeModel(
          this.cursor,
          this.files,
          this.active,
          this.keyMap,
          this.min,
          newMax,
          newHeight,
          newWidth,
          this.styles,
          this.currentDir,
          this.showHidden,
          this.error,
        ),
        null,
      ];
    }

    // Only handle keyboard input if active
    if (!this.active) {
      return [this, null];
    }

    // Handle keyboard input
    if (msg instanceof KeyMsg) {
      // Move down
      if (matches(msg, this.keyMap.down)) {
        const nextCursor = Math.min(this.cursor + 1, this.files.length - 1);
        
        // Adjust viewport if needed
        let nextMin = this.min;
        let nextMax = this.max;
        
        if (nextCursor > this.max) {
          nextMin = this.min + 1;
          nextMax = this.max + 1;
        }

        return [
          new FiletreeModel(
            nextCursor,
            this.files,
            this.active,
            this.keyMap,
            nextMin,
            nextMax,
            this.height,
            this.width,
            this.styles,
            this.currentDir,
            this.showHidden,
            this.error,
          ),
          null,
        ];
      }

      // Move up
      if (matches(msg, this.keyMap.up)) {
        const nextCursor = Math.max(this.cursor - 1, 0);
        
        // Adjust viewport if needed
        let nextMin = this.min;
        let nextMax = this.max;
        
        if (nextCursor < this.min && this.min > 0) {
          nextMin = this.min - 1;
          nextMax = this.max - 1;
        }

        return [
          new FiletreeModel(
            nextCursor,
            this.files,
            this.active,
            this.keyMap,
            nextMin,
            nextMax,
            this.height,
            this.width,
            this.styles,
            this.currentDir,
            this.showHidden,
            this.error,
          ),
          null,
        ];
      }
    }

    return [this, null];
  }

  /**
   * Renders the file tree view.
   * @returns Rendered string
   * @public
   */
  view(): string {
    if (this.error) {
      return `Error: ${this.error.message}`;
    }

    if (this.files.length === 0) {
      return "(empty directory)";
    }

    const lines: string[] = [];
    
    // Render visible items in viewport
    for (let i = this.min; i <= this.max && i < this.files.length; i++) {
      const item = this.files[i];
      if (!item) continue;

      const isSelected = i === this.cursor;
      const style = isSelected ? this.styles.selectedItem : this.styles.normalItem;
      
      // Format: "name  details"
      const line = `${item.name}  ${item.details}`;
      lines.push(style.render(line));
    }

    // Fill remaining height with empty lines
    const remainingLines = this.height - lines.length;
    for (let i = 0; i < remainingLines; i++) {
      lines.push("");
    }

    return lines.join("\n");
  }

  /**
   * Gets the currently selected file, if any.
   * @returns The selected DirectoryItem or null
   * @public
   */
  get selectedFile(): DirectoryItem | null {
    return this.files[this.cursor] ?? null;
  }
}
