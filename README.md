# AEM Boilerplate + LLM Apps

AEM Edge Delivery Services (EDS) のボイラープレートに、[Adobe LLM Apps SDK](https://experienceleague.adobe.com/ja/docs/llm-apps/using/guides/widgets) を組み込んだプロジェクトです。EDSのブロックを ChatGPT などの LLM ホスト上で動くインタラクティブなウィジェットとして描画します。

## Environments
- Preview: https://main--aem-boilerplate-llm--manji6.aem.page/
- Live: https://main--aem-boilerplate-llm--manji6.aem.live/

## LLM Apps ウィジェット

このリポジトリの `blocks/` には、通常のEDSブロックに加えて LLM Apps 用のウィジェットブロックが含まれています。

| ブロック | 内容 |
|---|---|
| `list-highlights` | AEM Boilerplateのハイライト項目をカルーセル表示 |
| `search-content` | サイトコンテンツの検索結果表示 |
| `list-articles` | `/article/` 配下の最新記事一覧をカルーセル表示 |

各ウィジェットに対応するActionのバックエンド実装（MCPツールのハンドラーコード）は、別リポジトリ [`llm-apps-boilerplate`](https://github.com/manji6/llm-apps-boilerplate) の `actions/` 配下で管理しています。ウィジェットのUI（このリポジトリ）とAction実装（別リポジトリ）は別々にデプロイされる点に注意してください。

ウィジェットは `tools/widget-preview.html?block=<name>` でサンプルデータを使った単体プレビューができます（例: http://localhost:3000/tools/widget-preview.html?block=list-articles ）。

## Documentation

Before using the aem-boilerplate, we recommend you to go through the documentation on https://www.aem.live/docs/ and more specifically:
1. [Developer Tutorial](https://www.aem.live/developer/tutorial)
2. [The Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
3. [Web Performance](https://www.aem.live/developer/keeping-it-100)
4. [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)

LLM Apps SDKについては [Adobe LLM Apps - Widgets](https://experienceleague.adobe.com/ja/docs/llm-apps/using/guides/widgets) を参照してください。

## Installation

```sh
npm i
```

`npm i` 実行時、`@adobe/llmapps-sdk` の postinstall フックが `scripts/aem-embed.js` と `scripts/llmapps-sdk.js` を自動生成します。

## Linting

```sh
npm run lint
```

## Local development

1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository (未設定の場合)
2. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
3. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
4. Open this directory in your favorite IDE and start coding :)
