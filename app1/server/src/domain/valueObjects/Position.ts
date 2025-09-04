/**
 * グリッド内の位置を表す値オブジェクト
 */
export class Position {
  private static readonly MIN_INDEX = 0;
  private static readonly MAX_INDEX = 19; // 20x20グリッドなので0-19

  constructor(
    private readonly _row: number,
    private readonly _column: number
  ) {
    if (!Position.isValid(_row, _column)) {
      throw new Error(`Invalid position: row=${_row}, column=${_column}. Must be between ${Position.MIN_INDEX} and ${Position.MAX_INDEX}`);
    }
  }

  public static isValid(row: number, column: number): boolean {
    return (
      Number.isInteger(row) &&
      Number.isInteger(column) &&
      row >= Position.MIN_INDEX &&
      row <= Position.MAX_INDEX &&
      column >= Position.MIN_INDEX &&
      column <= Position.MAX_INDEX
    );
  }

  public get row(): number {
    return this._row;
  }

  public get column(): number {
    return this._column;
  }

  public equals(other: Position): boolean {
    return this._row === other._row && this._column === other._column;
  }

  public toString(): string {
    return `(${this._row}, ${this._column})`;
  }

  public toJSON(): object {
    return {
      row: this._row,
      column: this._column
    };
  }

  /**
   * 同じ行の全ての位置を取得
   */
  public static getRowPositions(row: number): Position[] {
    if (!Number.isInteger(row) || row < Position.MIN_INDEX || row > Position.MAX_INDEX) {
      throw new Error(`Invalid row: ${row}`);
    }

    const positions: Position[] = [];
    for (let column = Position.MIN_INDEX; column <= Position.MAX_INDEX; column++) {
      positions.push(new Position(row, column));
    }
    return positions;
  }

  /**
   * 同じ列の全ての位置を取得
   */
  public static getColumnPositions(column: number): Position[] {
    if (!Number.isInteger(column) || column < Position.MIN_INDEX || column > Position.MAX_INDEX) {
      throw new Error(`Invalid column: ${column}`);
    }

    const positions: Position[] = [];
    for (let row = Position.MIN_INDEX; row <= Position.MAX_INDEX; row++) {
      positions.push(new Position(row, column));
    }
    return positions;
  }

  /**
   * 全ての位置を取得
   */
  public static getAllPositions(): Position[] {
    const positions: Position[] = [];
    for (let row = Position.MIN_INDEX; row <= Position.MAX_INDEX; row++) {
      for (let column = Position.MIN_INDEX; column <= Position.MAX_INDEX; column++) {
        positions.push(new Position(row, column));
      }
    }
    return positions;
  }
}
