# セットアップと実行方法

## 必要な環境
- Node.js (v18以上推奨)
- npm

## プロジェクト構造
```
app2/
├── api-server/     # Express APIサーバー
├── src/           # React フロントエンド
└── docs/          # ドキュメント
```

## セットアップ手順

### 1. APIサーバーのセットアップ

新しいターミナルを開いて、APIサーバーディレクトリに移動：

```bash
cd api-server
npm install  # 依存関係のインストール（初回のみ）
npm run dev  # 開発サーバーの起動
```

APIサーバーは http://localhost:3001 で起動します。

### 2. フロントエンドのセットアップ

別の新しいターミナルを開いて、プロジェクトルートで：

```bash
npm install  # 依存関係のインストール（初回のみ）
npm run dev  # Vite開発サーバーの起動
```

フロントエンドは http://localhost:5173 で起動します。

## 動作確認

1. 両方のサーバーが起動していることを確認
2. ブラウザで http://localhost:5173 を開く
3. 10×10のサーバーグリッドが表示され、1秒ごとにデータが更新されることを確認
4. 各セルをクリックすると、画面左下に選択したサーバーIDが表示される

## トラブルシューティング

### ポートが既に使用されている場合

APIサーバーのポートを変更する場合：
1. `api-server/src/index.ts` の `PORT` を変更
2. `src/App.tsx` の fetch URLも同じポートに変更

### CORSエラーが発生する場合

APIサーバーが正しく起動していることを確認してください。

### ビルドエラーが発生する場合

```bash
# node_modulesをクリーンアップして再インストール
rm -rf node_modules package-lock.json
npm install

# api-serverも同様に
cd api-server
rm -rf node_modules package-lock.json
npm install
```

## 開発中のフェーズ

- ✅ Phase 0: 基盤構築
- ✅ Phase 1: 静的グリッド表示
- ✅ Phase 2: APIポーリング実装
- ⏸️ Phase 3: 詳細表示モーダル
- ⏸️ Phase 4: パフォーマンス最適化
- ⏸️ Phase 5: スタイリング
- ⏸️ Phase 6: 検証とドキュメント化