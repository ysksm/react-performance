import { Router } from 'express';
import { GridController } from '../controllers/GridController.js';

const router = Router();
const gridController = new GridController();

/**
 * グリッドAPI のルーティング設定
 */

// 新しいグリッドを作成
router.post('/', (req, res) => gridController.createGrid(req, res));

// 全グリッドを取得
router.get('/', (req, res) => gridController.getAllGrids(req, res));

// グリッドを取得
router.get('/:id', (req, res) => gridController.getGrid(req, res));

// 単一セルの状態を更新
router.put('/:id/cells', (req, res) => gridController.updateCellState(req, res));

// 行の全セル状態を一括更新
router.put('/:id/rows/:row', (req, res) => gridController.updateRowState(req, res));

// 列の全セル状態を一括更新
router.put('/:id/columns/:column', (req, res) => gridController.updateColumnState(req, res));

// 全セル状態を一括更新
router.put('/:id/all', (req, res) => gridController.updateAllCellsState(req, res));

// グリッドをリセット
router.post('/:id/reset', (req, res) => gridController.resetGrid(req, res));

// グリッドを削除
router.delete('/:id', (req, res) => gridController.deleteGrid(req, res));

export default router;
