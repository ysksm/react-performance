import { Cell } from './Cell.js';
import { Position } from '../valueObjects/Position.js';
import { CellState } from '../valueObjects/CellState.js';

/**
 * ラインエンティティ（20個のセルを管理）
 */
export class Line {
  private readonly _cells: Cell[] = [];

  constructor(
    private readonly _lineNumber: number // 0-19
  ) {
    if (_lineNumber < 0 || _lineNumber > 19) {
      throw new Error(`Invalid line number: ${_lineNumber}. Must be between 0 and 19`);
    }

    // 20個のセルを初期化
    for (let column = 0; column < 20; column++) {
      const position = new Position(_lineNumber, column);
      const cell = new Cell(position, CellState.EMPTY);
      this._cells.push(cell);
    }
  }

  public get lineNumber(): number {
    return this._lineNumber;
  }

  public get cells(): readonly Cell[] {
    return this._cells;
  }

  /**
   * 指定した列のセルを取得
   */
  public getCell(column: number): Cell {
    if (column < 0 || column > 19) {
      throw new Error(`Invalid column: ${column}. Must be between 0 and 19`);
    }
    const cell = this._cells[column];
    if (!cell) {
      throw new Error(`Cell not found at column ${column}`);
    }
    return cell;
  }

  /**
   * 指定した列のセルの状態を設定
   */
  public setCellState(column: number, state: CellState): void {
    this.getCell(column).setState(state);
  }

  /**
   * ライン全体の状態を一括変更
   */
  public setAllCellsState(state: CellState): void {
    this._cells.forEach(cell => cell.setState(state));
  }

  /**
   * ライン全体をリセット
   */
  public reset(): void {
    this._cells.forEach(cell => cell.reset());
  }

  /**
   * ライン内の全セルを次の状態に変更
   */
  public toggleAllCellsToNextState(): void {
    this._cells.forEach(cell => cell.toggleToNextState());
  }

  public toJSON(): object {
    return {
      id: `line-${this._lineNumber}`,
      cells: this._cells.map(cell => cell.toJSON())
    };
  }

  public toString(): string {
    return `Line${this._lineNumber + 1}: [${this._cells.map(cell => cell.state.toString()).join(', ')}]`;
  }
}
