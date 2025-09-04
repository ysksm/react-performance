import { Request, Response } from 'express';
import { ServiceLocator } from '../../infrastructure/ServiceLocator.js';
import { GridId } from '../../domain/valueObjects/GridId.js';
import { Position } from '../../domain/valueObjects/Position.js';
import { CellState } from '../../domain/valueObjects/CellState.js';

/**
 * グリッド操作のRESTコントローラー
 */
export class GridController {
  private readonly _gridUseCase = ServiceLocator.getInstance().gridUseCase;

  /**
   * 新しいグリッドを作成
   * POST /api/grids
   */
  async createGrid(req: Request, res: Response): Promise<void> {
    try {
      const grid = await this._gridUseCase.createGrid();
      res.status(201).json({
        success: true,
        data: grid.toJSON()
      });
    } catch (error) {
      console.error('Error creating grid:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create grid'
      });
    }
  }

  /**
   * グリッドを取得
   * GET /api/grids/:id
   */
  async getGrid(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Grid ID is required'
        });
        return;
      }
      
      const gridId = GridId.fromString(id);
      const grid = await this._gridUseCase.getGrid(gridId);
      
      if (!grid) {
        res.status(404).json({
          success: false,
          error: 'Grid not found'
        });
        return;
      }

      res.json({
        success: true,
        data: grid.toJSON()
      });
    } catch (error) {
      console.error('Error getting grid:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get grid'
      });
    }
  }

  /**
   * 全グリッドを取得
   * GET /api/grids
   */
  async getAllGrids(req: Request, res: Response): Promise<void> {
    try {
      const grids = await this._gridUseCase.getAllGrids();
      res.json({
        success: true,
        data: grids.map(grid => grid.toJSON())
      });
    } catch (error) {
      console.error('Error getting all grids:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get grids'
      });
    }
  }

  /**
   * 単一セルの状態を更新
   * PUT /api/grids/:id/cells
   */
  async updateCellState(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Grid ID is required'
        });
        return;
      }
      
      const gridId = GridId.fromString(id);
      const { row, column, state } = req.body;

      if (typeof row !== 'number' || typeof column !== 'number' || typeof state !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid request body. Required: row (number), column (number), state (string)'
        });
        return;
      }

      const position = new Position(row, column);
      const cellState = CellState.fromString(state);
      
      const grid = await this._gridUseCase.updateCellState(gridId, position, cellState);
      
      if (!grid) {
        res.status(404).json({
          success: false,
          error: 'Grid not found'
        });
        return;
      }

      res.json({
        success: true,
        data: grid.toJSON()
      });
    } catch (error) {
      console.error('Error updating cell state:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update cell state'
      });
    }
  }

  /**
   * 行の全セル状態を一括更新
   * PUT /api/grids/:id/rows/:row
   */
  async updateRowState(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const rowParam = req.params.row;
      if (!id || !rowParam) {
        res.status(400).json({
          success: false,
          error: 'Grid ID and row are required'
        });
        return;
      }
      
      const gridId = GridId.fromString(id);
      const row = parseInt(rowParam, 10);
      const { state } = req.body;

      if (isNaN(row) || typeof state !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid parameters. Required: row (number), state (string)'
        });
        return;
      }

      const cellState = CellState.fromString(state);
      const grid = await this._gridUseCase.updateRowState(gridId, row, cellState);
      
      if (!grid) {
        res.status(404).json({
          success: false,
          error: 'Grid not found'
        });
        return;
      }

      res.json({
        success: true,
        data: grid.toJSON()
      });
    } catch (error) {
      console.error('Error updating row state:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update row state'
      });
    }
  }

  /**
   * 列の全セル状態を一括更新
   * PUT /api/grids/:id/columns/:column
   */
  async updateColumnState(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const columnParam = req.params.column;
      if (!id || !columnParam) {
        res.status(400).json({
          success: false,
          error: 'Grid ID and column are required'
        });
        return;
      }
      
      const gridId = GridId.fromString(id);
      const column = parseInt(columnParam, 10);
      const { state } = req.body;

      if (isNaN(column) || typeof state !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid parameters. Required: column (number), state (string)'
        });
        return;
      }

      const cellState = CellState.fromString(state);
      const grid = await this._gridUseCase.updateColumnState(gridId, column, cellState);
      
      if (!grid) {
        res.status(404).json({
          success: false,
          error: 'Grid not found'
        });
        return;
      }

      res.json({
        success: true,
        data: grid.toJSON()
      });
    } catch (error) {
      console.error('Error updating column state:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update column state'
      });
    }
  }

  /**
   * 全セル状態を一括更新
   * PUT /api/grids/:id/all
   */
  async updateAllCellsState(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Grid ID is required'
        });
        return;
      }
      
      const gridId = GridId.fromString(id);
      const { state } = req.body;

      if (typeof state !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid request body. Required: state (string)'
        });
        return;
      }

      const cellState = CellState.fromString(state);
      const grid = await this._gridUseCase.updateAllCellsState(gridId, cellState);
      
      if (!grid) {
        res.status(404).json({
          success: false,
          error: 'Grid not found'
        });
        return;
      }

      res.json({
        success: true,
        data: grid.toJSON()
      });
    } catch (error) {
      console.error('Error updating all cells state:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update all cells state'
      });
    }
  }

  /**
   * グリッドをリセット
   * POST /api/grids/:id/reset
   */
  async resetGrid(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Grid ID is required'
        });
        return;
      }
      
      const gridId = GridId.fromString(id);
      const grid = await this._gridUseCase.resetGrid(gridId);
      
      if (!grid) {
        res.status(404).json({
          success: false,
          error: 'Grid not found'
        });
        return;
      }

      res.json({
        success: true,
        data: grid.toJSON()
      });
    } catch (error) {
      console.error('Error resetting grid:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reset grid'
      });
    }
  }

  /**
   * グリッドを削除
   * DELETE /api/grids/:id
   */
  async deleteGrid(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Grid ID is required'
        });
        return;
      }
      
      const gridId = GridId.fromString(id);
      const deleted = await this._gridUseCase.deleteGrid(gridId);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Grid not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Grid deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting grid:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete grid'
      });
    }
  }
}
