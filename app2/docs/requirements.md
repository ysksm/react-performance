# 概要
Reactの状態管理ライブラリを使わず、propsリレーのみでデータ更新と操作を実装し、どの程度の規模まで実用的かを検証する。
複数データセンターの監視ダッシュボードを模した、階層構造（データセンター → ラック → サーバー）を持つ、1秒ごとにポーリングして頻繁にデータが更新されるアプリケーションを作成する。

# 目的
propsリレーのみでの実装における以下の項目を検証：
- パフォーマンスの限界点
- 実装の複雑度と可読性
- 保守性とテスタビリティ
- 型安全性の確保
- デバッグの容易さ
- 開発効率とチーム開発への影響
- 実プロジェクトへの適用可能性

# スコープ
- 中規模アプリケーション（20〜80コンポーネント）
- 3データセンター × 5ラック × 8サーバー（計120個のサーバー）での検証
- 階層構造による複雑なpropsリレーの検証

# 技術スタック
- Frontend: React, TypeScript, Vite
- Backend: Express (Node.js)
- Testing: Vitest, Testing Library
- Linting: ESLint, Prettier

# アプリケーション仕様

## サーバー側
- Express APIサーバー
- 階層構造のモニタリングデータを生成
- データ構造：
  ```typescript
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
  ```
- 1秒ごとに全データを更新して返すエンドポイント

## クライアント側
- 4層階層ナビゲーション（データセンター → ラック → サーバー → コンテナ）
- 表示モード：
  1. データセンター全体表示（3データセンターの概要）
  2. ラック一覧表示（選択データセンター内の5ラック）
  3. サーバーグリッド表示（選択ラック内の8サーバー）
  4. コンテナ管理ビュー（選択サーバー内のコンテナ一覧）
- 1秒ごとにサーバーからデータをポーリング
- 操作機能：
  - サーバー操作（開始・停止・再起動）
  - コンテナ操作（追加・削除・開始・停止・一時停止）
- サーバー・コンテナをクリックで詳細情報モーダル表示
- 全てのデータ更新と操作をpropsリレーで実装（最大6層の深さ）

# 検証項目
1. **パフォーマンス**: 120サーバーの1秒ごとの更新でのレンダリング性能
2. **実装複雑度**: 階層構造による深いpropsリレー（最大6層）の管理難易度
3. **保守性**: コンポーネント追加・変更時の影響範囲（階層構造での）
4. **型安全性**: 複雑なネストしたTypeScript型定義の管理
5. **デバッグ**: 階層データフローの追跡しやすさ
6. **スケーラビリティ**: データセンター・ラック・サーバー数増加時の限界点
7. **ナビゲーション**: 階層間の状態管理とUI操作の複雑さ