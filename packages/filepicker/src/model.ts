import { Style } from "@suds-cli/chapstick";
import { matches } from "@suds-cli/key";
import { msg, type Cmd, type Msg, KeyMsg } from "@suds-cli/tea";
import { dirname } from "node:path";
import { readDirectory } from "./fs.js";
import { defaultKeyMap } from "./keymap.js";
import { DirReadMsg, FileSelectedMsg } from "./messages.js";
import type {
  FileInfo,
  FilepickerKeyMap,
  FilepickerOptions,
  FilepickerStyles,
} from "./types.js";

type FilepickerState = {
  currentDir: string;
  files: FileInfo[];
  cursor: number;
  selectedFile: FileInfo | null;
  showHidden: boolean;
  showPermissions: boolean;
  showSize: boolean;
  dirFirst: boolean;
  height: number;
  allowedTypes: string[];
  styles: FilepickerStyles;
  keyMap: FilepickerKeyMap;
};

function defaultStyles(): FilepickerStyles {
  return {
    directory: new Style().bold(true),
    file: new Style(),
    hidden: new Style().italic(true),
    selected: new Style().background("#303030").foreground("#ffffff"),
    cursor: new Style().bold(true),
    status: new Style().italic(true),
  };
}

function filterByType(files: FileInfo[], allowed: string[]): FileInfo[] {
  if (!allowed || allowed.length === 0) return files;
  return files.filter((f) => {
    if (f.isDir) return true;
    return allowed.some((ext) => f.name.endsWith(ext));
  });
}

/**
 * File system picker with navigation and selection.
 * @public
 */
export class FilepickerModel {
  readonly currentDir: string;
  readonly files: FileInfo[];
  readonly cursor: number;
  readonly selectedFile: FileInfo | null;
  readonly showHidden: boolean;
  readonly showPermissions: boolean;
  readonly showSize: boolean;
  readonly dirFirst: boolean;
  readonly height: number;
  readonly allowedTypes: string[];
  readonly styles: FilepickerStyles;
  readonly keyMap: FilepickerKeyMap;

  private constructor(state: FilepickerState) {
    this.currentDir = state.currentDir;
    this.files = state.files;
    this.cursor = state.cursor;
    this.selectedFile = state.selectedFile;
    this.showHidden = state.showHidden;
    this.showPermissions = state.showPermissions;
    this.showSize = state.showSize;
    this.dirFirst = state.dirFirst;
    this.height = state.height;
    this.allowedTypes = state.allowedTypes;
    this.styles = state.styles;
    this.keyMap = state.keyMap;
  }

  /** Create a new model and command to read the directory. */
  static new(
    options: FilepickerOptions = {},
  ): [FilepickerModel, Cmd<Msg>] {
    const styles = { ...defaultStyles(), ...(options.styles ?? {}) };
    const model = new FilepickerModel({
      currentDir: options.currentDir ?? process.cwd(),
      files: [],
      cursor: 0,
      selectedFile: null,
      showHidden: options.showHidden ?? false,
      showPermissions: options.showPermissions ?? false,
      showSize: options.showSize ?? false,
      dirFirst: options.dirFirst ?? true,
      height: options.height ?? 0,
      allowedTypes: options.allowedTypes ?? [],
      styles,
      keyMap: options.keyMap ?? defaultKeyMap,
    });
    return model.refresh();
  }

  /** Current selected file (if any). */
  selected(): FileInfo | undefined {
    return this.files[this.cursor];
  }

  /** Go to the parent directory. */
  back(): [FilepickerModel, Cmd<Msg>] {
    const parent = dirname(this.currentDir);
    const model = this.with({ currentDir: parent, cursor: 0 });
    return model.refresh();
  }

  /** Enter the highlighted directory, or select a file. */
  enter(): [FilepickerModel, Cmd<Msg>] {
    const file = this.selected();
    if (!file) return [this, null];
    if (file.isDir) {
      const model = this.with({
        currentDir: file.path,
        cursor: 0,
        selectedFile: null,
      });
      return model.refresh();
    }
    return this.select();
  }

  /** Refresh the current directory listing. */
  refresh(): [FilepickerModel, Cmd<Msg>] {
    const cmd: Cmd<Msg> = async () => {
      try {
        const files = await readDirectory(
          this.currentDir,
          this.showHidden,
          this.dirFirst,
        );
        const filtered = filterByType(files, this.allowedTypes);
        return new DirReadMsg(this.currentDir, filtered);
      } catch (error) {
        return new DirReadMsg(this.currentDir, [], error as Error);
      }
    };
    return [this, cmd];
  }

  /** Select the current file. */
  select(): [FilepickerModel, Cmd<Msg>] {
    const file = this.selected();
    if (!file) return [this, null];
    const model = this.with({ selectedFile: file });
    return [model, msg(new FileSelectedMsg(file))];
  }

  /** Move cursor up. */
  cursorUp(): FilepickerModel {
    if (this.files.length === 0) return this;
    const next = Math.max(0, this.cursor - 1);
    return this.with({ cursor: next });
  }

  /** Move cursor down. */
  cursorDown(): FilepickerModel {
    if (this.files.length === 0) return this;
    const next = Math.min(this.files.length - 1, this.cursor + 1);
    return this.with({ cursor: next });
  }

  /** Jump to first entry. */
  gotoTop(): FilepickerModel {
    if (this.files.length === 0) return this;
    return this.with({ cursor: 0 });
  }

  /** Jump to last entry. */
  gotoBottom(): FilepickerModel {
    if (this.files.length === 0) return this;
    return this.with({ cursor: this.files.length - 1 });
  }

  /** Toggle hidden file visibility. */
  toggleHidden(): [FilepickerModel, Cmd<Msg>] {
    const model = this.with({ showHidden: !this.showHidden, cursor: 0 });
    return model.refresh();
  }

  /** Tea init hook; triggers directory read. */
  init(): Cmd<Msg> {
    const [, cmd] = this.refresh();
    return cmd;
  }

  /** Tea update handler. */
  update(msgObj: Msg): [FilepickerModel, Cmd<Msg>] {
    if (msgObj instanceof DirReadMsg) {
      if (msgObj.error) {
        // Keep state but surface the error via status text
        return [
          this.with({
            files: [],
            cursor: 0,
            selectedFile: null,
          }),
          null,
        ];
      }
      const files = msgObj.files;
      const cursor = Math.min(this.cursor, Math.max(0, files.length - 1));
      return [
        this.with({
          currentDir: msgObj.path,
          files,
          cursor,
          selectedFile: files[cursor] ?? null,
        }),
        null,
      ];
    }

    if (msgObj instanceof KeyMsg) {
      if (matches(msgObj, this.keyMap.up)) return [this.cursorUp(), null];
      if (matches(msgObj, this.keyMap.down)) return [this.cursorDown(), null];
      if (matches(msgObj, this.keyMap.gotoTop)) return [this.gotoTop(), null];
      if (matches(msgObj, this.keyMap.gotoBottom))
        return [this.gotoBottom(), null];
      if (matches(msgObj, this.keyMap.toggleHidden))
        return this.toggleHidden();
      if (matches(msgObj, this.keyMap.back)) return this.back();
      if (matches(msgObj, this.keyMap.open)) return this.enter();
      if (matches(msgObj, this.keyMap.select)) return this.select();
    }

    return [this, null];
  }

  /** Render the file list. */
  view(): string {
    const lines: string[] = [];
    const header = this.styles.status.render(this.currentDir);
    lines.push(header);

    if (this.files.length === 0) {
      lines.push(this.styles.status.render("(empty)"));
      return lines.join("\n");
    }

    for (const [index, file] of this.files.entries()) {
      const isSelected = index === this.cursor;
      const style = file.isDir ? this.styles.directory : this.styles.file;
      const base = file.isHidden ? this.styles.hidden : style;
      const name = base.render(file.name);
      const cursor = isSelected ? this.styles.cursor.render("➤ ") : "  ";
      const line = isSelected
        ? this.styles.selected.render(cursor + name)
        : cursor + name;
      lines.push(line);
    }

    return lines.join("\n");
  }

  private with(patch: Partial<FilepickerState>): FilepickerModel {
    return new FilepickerModel({
      currentDir: this.currentDir,
      files: this.files,
      cursor: this.cursor,
      selectedFile: this.selectedFile,
      showHidden: this.showHidden,
      showPermissions: this.showPermissions,
      showSize: this.showSize,
      dirFirst: this.dirFirst,
      height: this.height,
      allowedTypes: this.allowedTypes,
      styles: this.styles,
      keyMap: this.keyMap,
      ...patch,
    });
  }
}


