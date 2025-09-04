/**
 * セルの状態を表す値オブジェクト
 */
export class CellState {
  private static readonly VALID_STATES = ['empty', 'selected', 'disabled', 'active'] as const;
  
  public static readonly EMPTY = new CellState('empty');
  public static readonly SELECTED = new CellState('selected');
  public static readonly DISABLED = new CellState('disabled');
  public static readonly ACTIVE = new CellState('active');

  private constructor(private readonly _value: typeof CellState.VALID_STATES[number]) {
    if (!CellState.VALID_STATES.includes(_value)) {
      throw new Error(`Invalid cell state: ${_value}`);
    }
  }

  public static fromString(value: string): CellState {
    switch (value) {
      case 'empty':
        return CellState.EMPTY;
      case 'selected':
        return CellState.SELECTED;
      case 'disabled':
        return CellState.DISABLED;
      case 'active':
        return CellState.ACTIVE;
      default:
        throw new Error(`Invalid cell state: ${value}`);
    }
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: CellState): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }

  /**
   * 状態の循環的変更（UI操作用）
   */
  public getNext(): CellState {
    const currentIndex = CellState.VALID_STATES.indexOf(this._value);
    const nextIndex = (currentIndex + 1) % CellState.VALID_STATES.length;
    const nextState = CellState.VALID_STATES[nextIndex];
    if (nextState === undefined) {
      throw new Error('Invalid state transition');
    }
    return CellState.fromString(nextState);
  }

  public toJSON(): string {
    return this._value;
  }
}

export type CellStateValue = 'empty' | 'selected' | 'disabled' | 'active';
