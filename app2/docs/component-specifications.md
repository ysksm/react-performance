# コンポーネント仕様書

## 概要

本システムのReactコンポーネントの詳細仕様と実装方針について説明します。

## コンポーネント階層構造

```
AppNew (メインアプリケーション)
├── NavigationBreadcrumb (ナビゲーション)
├── DataCenterOverview (データセンター一覧)
├── RackListView (ラック一覧)
├── ServerGridView (サーバーグリッド)
├── ContainerManageView (コンテナ管理)
├── ConnectionIndicator (接続状態表示)
├── ConfirmationDialog (確認ダイアログ)
└── NotificationToast (通知トースト)
```

## 主要コンポーネント仕様

### 1. AppNew (メインアプリケーション)

**ファイル**: `src/AppNew.tsx`

**責務**:
- アプリケーション全体の状態管理
- ビューモードの制御
- データ取得とリアルタイム更新の統制

**状態管理**:
```typescript
interface AppState {
  viewMode: ViewMode;           // 'overview' | 'racks' | 'servers' | 'containers'
  selectedDataCenter: DataCenter | null;
  selectedRack: Rack | null;
  selectedServer: Server | null;
  toastMessages: ToastMessage[];
  confirmationDialog: ConfirmationDialogState;
}
```

**主要機能**:
- 階層ナビゲーション (DataCenter → Rack → Server → Container)
- リアルタイムデータ取得 (1秒間隔)
- ユーザーアクションの統合管理
- エラーハンドリングと通知表示

### 2. DataCenterOverview (データセンター一覧)

**ファイル**: `src/components/DataCenterOverview.tsx`

**責務**:
- データセンター一覧表示
- 統計情報の計算と表示
- React.memo最適化

**表示項目**:
- データセンター名と場所
- ラック数、サーバー数、コンテナ数
- 平均CPU使用率
- エラー・警告数
- ステータスインジケーター

**最適化**:
```typescript
const areEqual = (prevProps: DataCenterOverviewProps, nextProps: DataCenterOverviewProps) => {
  // 構造的プロパティのみを比較
  // CPU、メモリ等の動的値は比較対象外
  // → データ更新時の再描画を保証しつつ、無駄な再描画を防止
}
```

### 3. RackListView (ラック一覧)

**ファイル**: `src/components/RackListView.tsx`

**責務**:
- 選択されたデータセンター内のラック一覧表示
- ラック単位の統計情報表示
- ラック選択処理

**表示項目**:
- ラック名とポジション
- サーバー数とコンテナ数
- ラック内の問題サーバー数
- 使用率統計

### 4. ServerGridView (サーバーグリッド)

**ファイル**: `src/components/ServerGridView.tsx`

**責務**:
- 選択されたラック内のサーバー一覧表示
- サーバー操作 (start/stop/restart)
- リアルタイムメトリクス表示

**表示項目**:
- サーバー名とポジション
- CPU、メモリ、ディスク、ネットワーク使用率
- 温度情報
- ステータス (running/warning/error/maintenance)
- コンテナ数
- エラー情報

**操作機能**:
- サーバー起動 (確認ダイアログ付き)
- サーバー停止 (確認ダイアログ付き)
- サーバー再起動 (確認ダイアログ付き)

### 5. ContainerManageView (コンテナ管理)

**ファイル**: `src/components/ContainerManageView.tsx`

**責務**:
- 選択されたサーバー内のコンテナ一覧表示
- コンテナ操作 (start/stop/pause/remove)
- 新規コンテナ作成

**表示項目**:
- コンテナ名とイメージ
- CPU、メモリ使用率
- ステータス (running/stopped/paused/error)
- ポート情報
- 作成日時

**操作機能**:
- コンテナ起動/停止/一時停止
- コンテナ削除 (確認ダイアログ付き)
- 新規コンテナ作成

## 共通コンポーネント

### NavigationBreadcrumb (ナビゲーション)

**責務**: 現在位置の表示と階層ナビゲーション

**構造**:
```
Overview > Tokyo DC > Rack 1 > Server 3 > Containers
```

### ConnectionIndicator (接続状態表示)

**責務**: API接続状態とリアルタイム更新状況の表示

**状態**:
- `online`: 正常接続 (緑)
- `offline`: 接続エラー (赤)
- `reconnecting`: 再接続中 (黄)

### ConfirmationDialog (確認ダイアログ)

**責務**: 危険な操作の確認

**バリアント**:
- `default`: 通常確認 (青)
- `warning`: 警告 (黄)
- `danger`: 危険 (赤)

### NotificationToast (通知トースト)

**責務**: 操作結果の通知表示

**タイプ**:
- `success`: 成功 (緑)
- `error`: エラー (赤)
- `warning`: 警告 (黄)
- `info`: 情報 (青)

## パフォーマンス最適化戦略

### 1. React.memo使用指針

**適用対象**:
- データ表示コンポーネント (DataCenterOverview, RackListView等)
- 計算量の多いコンポーネント
- 頻繁に親から再描画される子コンポーネント

**比較関数の設計**:
```typescript
// 良い例: 構造的プロパティのみを比較
const areEqual = (prev, next) => {
  return prev.id === next.id &&
         prev.name === next.name &&
         prev.items.length === next.items.length;
}

// 悪い例: 動的値まで比較 (更新ブロック)
const areEqual = (prev, next) => {
  return deepEqual(prev, next); // CPU値の変更でも再描画されない
}
```

### 2. useCallback使用指針

**適用対象**:
- 子コンポーネントに渡すイベントハンドラー
- useEffectの依存配列に含まれる関数
- カスタムフックが返す関数

### 3. useMemo使用指針

**適用対象**:
- 重い計算処理 (統計情報の算出等)
- オブジェクトや配列の生成
- 子コンポーネントのプロパティオブジェクト

## 状態管理パターン

### 1. ローカル状態 (useState)

**使用箇所**:
- UI状態 (モーダル開閉、フォーム入力等)
- 一時的なローカル状態

### 2. カスタムフック状態

**使用箇所**:
- データ取得とキャッシュ
- 複雑なビジネスロジック
- 複数コンポーネント間の状態共有

### 3. プロパティドリリング

**使用箇所**:
- 親から子への一方向データフロー
- イベントハンドラーの伝播

## エラー境界とエラーハンドリング

### 1. エラー境界

```typescript
// 各メインビューにエラー境界を設置
<ErrorBoundary fallback={<ErrorFallback />}>
  <DataCenterOverview />
</ErrorBoundary>
```

### 2. 非同期エラーハンドリング

```typescript
// カスタムフック内でのエラーハンドリング
try {
  const result = await apiCall();
  setData(result);
  setError(null);
} catch (error) {
  setError(error);
  addToast({ type: 'error', message: error.message });
}
```

## テスト戦略

### 1. 単体テスト

**対象**:
- 計算ロジック (統計算出等)
- カスタムフック
- ユーティリティ関数

### 2. 統合テスト

**対象**:
- コンポーネント間の連携
- データフローの検証
- ユーザーシナリオの実行

### 3. E2Eテスト

**対象**:
- 主要ユーザーフロー
- エラーシナリオ
- リアルタイム更新の検証

## デザインシステム

### 1. カラーパレット

```css
:root {
  --color-primary: #3b82f6;      /* Blue */
  --color-success: #10b981;      /* Green */
  --color-warning: #f59e0b;      /* Yellow */
  --color-danger: #ef4444;       /* Red */
  --color-gray-50: #f9fafb;
  --color-gray-900: #111827;
}
```

### 2. タイポグラフィ

```css
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
```

### 3. スペーシング

```css
.space-1 { margin: 0.25rem; }
.space-2 { margin: 0.5rem; }
.space-4 { margin: 1rem; }
.space-8 { margin: 2rem; }
```

## ライフサイクル管理

### 1. マウント時

1. データ取得の開始
2. ポーリングタイマーの開始
3. イベントリスナーの登録

### 2. 更新時

1. プロパティ変更の検知
2. 必要に応じた再描画
3. 副作用の実行

### 3. アンマウント時

1. ポーリングタイマーの停止
2. イベントリスナーの削除
3. 非同期処理のキャンセル

## 結論

このコンポーネント設計により以下を実現：

1. **高性能**: React.memo最適化による効率的な再描画
2. **保守性**: 単一責任原則に基づく明確な役割分担
3. **再利用性**: プロパティベースの疎結合設計
4. **テスタビリティ**: 依存性注入による単体テスト容易性
5. **スケーラビリティ**: モジュール化によるコンポーネント追加容易性

これらの原則に従うことで、長期的に保守可能で高性能なUIを維持できます。