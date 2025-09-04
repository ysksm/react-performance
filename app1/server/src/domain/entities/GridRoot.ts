import { Line } from './Line.js';
import { Cell } from './Cell.js';
import { GridId } from '../valueObjects/GridId.js';
import { CellState } from '../valueObjects/CellState.js';
import { Position } from '../valueObjects/Position.js';

/**
 * GridRoot（LineRoot）エンティティ
 * 要求仕様に従って、Line1, Line2...Line20の個別変数を持つ構造を実現
 */
export class GridRoot {
  // 要求仕様：個別のLine変数
  public readonly Line1: Line;
  public readonly Line2: Line;
  public readonly Line3: Line;
  public readonly Line4: Line;
  public readonly Line5: Line;
  public readonly Line6: Line;
  public readonly Line7: Line;
  public readonly Line8: Line;
  public readonly Line9: Line;
  public readonly Line10: Line;
  public readonly Line11: Line;
  public readonly Line12: Line;
  public readonly Line13: Line;
  public readonly Line14: Line;
  public readonly Line15: Line;
  public readonly Line16: Line;
  public readonly Line17: Line;
  public readonly Line18: Line;
  public readonly Line19: Line;
  public readonly Line20: Line;

  private readonly _lines: Line[];

  constructor(private readonly _id: GridId) {
    // 20個のラインを初期化
    this.Line1 = new Line(0);
    this.Line2 = new Line(1);
    this.Line3 = new Line(2);
    this.Line4 = new Line(3);
    this.Line5 = new Line(4);
    this.Line6 = new Line(5);
    this.Line7 = new Line(6);
    this.Line8 = new Line(7);
    this.Line9 = new Line(8);
    this.Line10 = new Line(9);
    this.Line11 = new Line(10);
    this.Line12 = new Line(11);
    this.Line13 = new Line(12);
    this.Line14 = new Line(13);
    this.Line15 = new Line(14);
    this.Line16 = new Line(15);
    this.Line17 = new Line(16);
    this.Line18 = new Line(17);
    this.Line19 = new Line(18);
    this.Line20 = new Line(19);

    // 配列としても管理（操作の利便性のため）
    this._lines = [
      this.Line1, this.Line2, this.Line3, this.Line4, this.Line5,
      this.Line6, this.Line7, this.Line8, this.Line9, this.Line10,
      this.Line11, this.Line12, this.Line13, this.Line14, this.Line15,
      this.Line16, this.Line17, this.Line18, this.Line19, this.Line20
    ];
  }

  public static create(): GridRoot {
    return new GridRoot(GridId.generate());
  }

  public get id(): GridId {
    return this._id;
  }

  public get lines(): readonly Line[] {
    return this._lines;
  }

  /**
   * 指定した位置のセルを取得
   */
  public getCell(position: Position): Cell {
    return this.getLine(position.row).getCell(position.column);
  }

  /**
   * 指定した行のラインを取得
   */
  public getLine(row: number): Line {
    if (row < 0 || row > 19) {
      throw new Error(`Invalid row: ${row}. Must be between 0 and 19`);
    }
    const line = this._lines[row];
    if (!line) {
      throw new Error(`Line not found at row ${row}`);
    }
    return line;
  }

  /**
   * 指定した位置のセルの状態を変更
   */
  public setCellState(position: Position, state: CellState): void {
    this.getCell(position).setState(state);
  }

  /**
   * 指定した行のすべてのセルの状態を一括変更
   */
  public setRowState(row: number, state: CellState): void {
    this.getLine(row).setAllCellsState(state);
  }

  /**
   * 指定した列のすべてのセルの状態を一括変更
   */
  public setColumnState(column: number, state: CellState): void {
    if (column < 0 || column > 19) {
      throw new Error(`Invalid column: ${column}. Must be between 0 and 19`);
    }
    
    this._lines.forEach(line => {
      line.setCellState(column, state);
    });
  }

  /**
   * 全セルの状態を一括変更
   */
  public setAllCellsState(state: CellState): void {
    this._lines.forEach(line => {
      line.setAllCellsState(state);
    });
  }

  /**
   * 全セルをリセット
   */
  public reset(): void {
    this._lines.forEach(line => line.reset());
  }

  /**
   * 指定した列の全セルを取得
   */
  public getColumnCells(column: number): Cell[] {
    if (column < 0 || column > 19) {
      throw new Error(`Invalid column: ${column}. Must be between 0 and 19`);
    }
    
    return this._lines.map(line => line.getCell(column));
  }

  /**
   * 指定した行の全セルを取得
   */
  public getRowCells(row: number): Cell[] {
    return Array.from(this.getLine(row).cells);
  }

  /**
   * 全セルを取得
   */
  public getAllCells(): Cell[] {
    const cells: Cell[] = [];
    this._lines.forEach(line => {
      cells.push(...line.cells);
    });
    return cells;
  }

  public toJSON(): object {
    return {
      id: this._id.toJSON(),
      Line1: this.Line1.toJSON(),
      Line2: this.Line2.toJSON(),
      Line3: this.Line3.toJSON(),
      Line4: this.Line4.toJSON(),
      Line5: this.Line5.toJSON(),
      Line6: this.Line6.toJSON(),
      Line7: this.Line7.toJSON(),
      Line8: this.Line8.toJSON(),
      Line9: this.Line9.toJSON(),
      Line10: this.Line10.toJSON(),
      Line11: this.Line11.toJSON(),
      Line12: this.Line12.toJSON(),
      Line13: this.Line13.toJSON(),
      Line14: this.Line14.toJSON(),
      Line15: this.Line15.toJSON(),
      Line16: this.Line16.toJSON(),
      Line17: this.Line17.toJSON(),
      Line18: this.Line18.toJSON(),
      Line19: this.Line19.toJSON(),
      Line20: this.Line20.toJSON()
    };
  }

  public toString(): string {
    const linesString = this._lines.map(line => line.toString()).join('\n');
    return `GridRoot(${this._id.toString()}):\n${linesString}`;
  }
}
