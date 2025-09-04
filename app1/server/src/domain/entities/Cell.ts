import { Position } from '../valueObjects/Position.js';
import { CellState } from '../valueObjects/CellState.js';

/**
 * セルエンティティ
 */
export class Cell {
  constructor(
    private readonly _position: Position,
    private _state: CellState
  ) {}

  public get position(): Position {
    return this._position;
  }

  public get state(): CellState {
    return this._state;
  }

  public setState(state: CellState): void {
    this._state = state;
  }

  /**
   * セル状態を次の状態に変更（UI操作用）
   */
  public toggleToNextState(): void {
    this._state = this._state.getNext();
  }

  /**
   * セルをリセット（空の状態に戻す）
   */
  public reset(): void {
    this._state = CellState.EMPTY;
  }

  public equals(other: Cell): boolean {
    return this._position.equals(other._position);
  }

  public toJSON(): object {
    return {
      id: `cell-${this._position.row}-${this._position.column}`,
      state: this._state.toJSON(),
      row: this._position.row,
      column: this._position.column
    };
  }

  public toString(): string {
    return `Cell${this._position.toString()}: ${this._state.toString()}`;
  }
}
