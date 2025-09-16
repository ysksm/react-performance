# 技術開発計画 - Props リレー検証アプリケーション

## ユーザーストーリーマッピング

### エピック
**複数データセンターの階層構造で120個のサーバーの状態をリアルタイムに監視したい**

### ペルソナ
- **システム管理者**: データセンター → ラック → サーバーの階層で構造化された監視情報を確認し、問題のあるサーバーを素早く特定したい
- **データセンター運用者**: 地理的に分散したデータセンター間の状態比較をしたい

## MVP フェーズ定義

### Phase 0: 基盤構築 (Day 1)
**Goal**: 開発環境とプロジェクト構造の整備

#### User Stories
- 開発者として、TypeScriptとReactの開発環境を整備したい
- 開発者として、サーバーとクライアントの基本構造を作成したい

#### Technical Tasks
```
1. サーバー側 (/server)
   - Express + TypeScriptセットアップ
   - nodemon設定
   - 基本的なルーティング構造

2. クライアント側 (/)
   - 既存Vite環境の確認
   - 必要なパッケージインストール
   - 基本的なフォルダ構造作成
```

📝 **詳細なTODOリストは [TODO.md](./TODO.md) を参照**

### Phase 1: 階層データ構造と基本ナビゲーション (Day 2)
**Goal**: データセンター選択と基本的な階層表示

#### User Stories
- ユーザーとして、3つのデータセンターから選択したい
- ユーザーとして、選択したデータセンター内のラック一覧を確認したい
- ユーザーとして、ラック内のサーバー配置を把握したい

#### Technical Tasks
```
1. 階層データ型定義
   interface DataCenter {
     id: string;
     name: string;
     location: string;
     racks: Rack[];
   }

   interface Rack {
     id: string;
     name: string;
     position: number;
     servers: Server[];
   }

   interface Server {
     id: string;
     name: string;
     position: number;
     cpu: number;
     memory: number;
     disk: number;
     network: number;
     temperature: number;
     errors: string[];
     status: 'running' | 'warning' | 'error' | 'maintenance';
     containers: Container[];
   }

   interface Container {
     id: string;
     name: string;
     image: string;
     status: 'running' | 'stopped' | 'paused' | 'error';
     cpu: number;
     memory: number;
     ports: string[];
     createdAt: string;
   }

2. コンポーネント階層（4表示モード対応）
   App (viewMode, selectedDataCenter, selectedRack, selectedServer)
   └── NavigationBreadcrumb (viewMode, dataCenter, rack, server)
   └── DataCenterOverview (dataCenters, onDataCenterSelect) [モード1]
   └── RackListView (dataCenter, onRackSelect, onBack) [モード2]
   └── ServerGridView (rack, onServerSelect, onServerAction, onBack) [モード3]
       └── ServerCell (server, onServerAction, onClick)
   └── ContainerManageView (server, onContainerAction, onBack) [モード4]
       └── ContainerList (containers, onContainerAction)
           └── ContainerCard (container, onAction)
       └── ContainerActionPanel (onAddContainer)
   └── ServerModal (server, dataCenter, rack, onClose, onServerAction)
   └── ContainerModal (container, server, onClose, onContainerAction)

3. Props設計とGUI機能
   - データの流れ: 最大6層のpropsリレー
   - 階層選択状態の管理（viewMode: 'overview' | 'racks' | 'servers' | 'containers'）
   - サーバー操作（start/stop/restart）のprops伝達
   - コンテナ操作（add/remove/start/stop/pause）のprops伝達
   - ナビゲーション機能（戻るボタン、パンくずリスト）
   - 複雑な操作フローの状態管理
```

### Phase 2: APIポーリング実装 (Day 3)
**Goal**: 1秒ごとのデータ更新

#### User Stories
- ユーザーとして、全データセンターのサーバー状態をリアルタイムで確認したい
- システムとして、1秒ごとに階層構造データを取得したい
- ユーザーとして、選択中のデータセンター/ラックの変更が即座に反映されることを確認したい

#### Technical Tasks
```
1. サーバー側
   - GET /api/datacenters エンドポイント
   - 階層構造データの生成関数
   - 3データセンター × 5ラック × 8サーバーの構造
   - レスポンス形式の統一

2. クライアント側
   - 階層データの取得とparsingを適応
   - setIntervalでの1秒ポーリング
   - 選択状態の保持（データ更新後も）
   - エラーハンドリングと階層表示
   - メモリリーク対策（cleanup）
```

### Phase 3: 詳細表示モーダル (Day 4)
**Goal**: セルクリックでの詳細情報表示

#### User Stories
- ユーザーとして、特定のサーバーの詳細情報（所属ラック、データセンター情報含む）を確認したい
- ユーザーとして、詳細情報を閉じて階層表示に戻りたい
- ユーザーとして、モーダル内でサーバーの完全なパス（データセンター/ラック/サーバー）を確認したい

#### Technical Tasks
```
1. 複雑なProps伝達の実装
   App (selectedServer, setSelectedServer, currentDataCenter, currentRack)
   └── DataCenterView (onServerSelect)
       └── RackGrid (onServerSelect)
           └── ServerGrid (onCellClick)
               └── ServerCell (onClick)
   └── ServerModal (server, dataCenter, rack, onClose)

2. 階層イベントハンドリング
   - ServerCell → ServerGrid → RackGrid → DataCenterView → App への5層伝達
   - 階層コンテキスト情報の保持
   - 選択状態の管理（データセンター、ラック、サーバー）
   - ESCキーでの閉じる処理
```

### Phase 4: パフォーマンス最適化 (Day 5)
**Goal**: React.memoとuseMemoでの最適化

#### User Stories
- 開発者として、不要な再レンダリングを防ぎたい
- ユーザーとして、スムーズな操作感を維持したい


#### Technical Tasks
```
1. 最適化実装
   - Cell コンポーネントのmemo化
   - イベントハンドラのuseCallback化
   - 配列処理の最適化

2. 計測
   - React DevToolsでのProfiler使用
   - レンダリング回数の記録
   - FPSの測定
```

### Phase 5: スタイリングと仕上げ (Day 6)
**Goal**: 本格的なモニタリングダッシュボードの見た目

#### User Stories
- ユーザーとして、CPU使用率が高いサーバーを色で識別したい
- ユーザーとして、エラーがあるサーバーをすぐに見つけたい


#### Technical Tasks
```
1. 視覚的フィードバック
   - CPU > 80%: 赤色表示
   - CPU > 60%: 黄色表示
   - エラーあり: 赤枠表示

2. UX改善
   - スケルトンローディング
   - エラー時のリトライボタン
   - 接続状態の表示
```

### Phase 6: 検証とドキュメント化 (Day 7)
**Goal**: パフォーマンス検証と結果まとめ

#### User Stories
- 開発者として、propsリレーの限界を数値で把握したい
- 開発者として、実装の知見をドキュメント化したい


#### Technical Tasks
```
1. 検証項目
   - 100セルでのFPS
   - メモリ使用量の推移
   - props伝達の深さ
   - コード行数とファイル数

2. ストレステスト
   - 200セル、500セルでの動作
   - 更新間隔を0.5秒に変更
   - 同時に複数モーダルを開く
```

## 成功指標

### 定量的指標
- 100セルで60FPS維持
- 初期表示3秒以内
- メモリ使用量100MB以下
- props伝達の深さ最大3階層

### 定性的指標
- コードの可読性（他の開発者が理解できる）
- デバッグの容易さ（データフローが追跡可能）
- 拡張性（新機能追加が容易）

## リスクと対策

| リスク | 影響度 | 対策 |
|--------|--------|------|
| 100セルの同時更新でパフォーマンス劣化 | 高 | React.memoとuseCallbackで最適化 |
| props伝達が深くなりすぎる | 中 | コンポーネント設計の見直し |
| 型定義が複雑になる | 中 | 共通型定義ファイルの作成 |
| ポーリングでのメモリリーク | 高 | cleanup処理の徹底 |

## 開発タイムライン

```
Week 1:
月: Phase 0 - 基盤構築
火: Phase 1 - 静的グリッド
水: Phase 2 - APIポーリング
木: Phase 3 - 詳細モーダル
金: Phase 4 - パフォーマンス最適化

Week 2:
月: Phase 5 - スタイリング
火: Phase 6 - 検証とドキュメント化
```

## 次のステップ

1. Phase 0の実装開始
2. 各フェーズ完了時にコードレビュー
3. 動作確認とフィードバック収集
4. 次フェーズへの反映

---

**Note**: 各フェーズは独立して動作確認可能なMVPとして設計されています。フェーズごとに動くアプリケーションを確認しながら進めることで、早期のフィードバックと改善が可能です。