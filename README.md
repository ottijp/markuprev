# MarkuPrev

MarkdownやAsciidocなどの軽量マークアップ言語のプレビューアです．
ファイルを監視して，自動ビルドしてくれるので，好きなエディタを使ってファイルを編集できます．

![](demo.gif)

## 対応

* プラットフォーム
    * macOS
    * Windows
* ファイルタイプ
    * .adoc
    * .md

## インストール

[Releaseページ](https://github.com/ottijp/markuprev/releases)から，各プラットフォーム向けのアプリをダウンロードしてください．

## 使い方

* アプリを起動し，プレビューするファイルをドロップもしくはダイアログで開きます
* アプリがファイルの変更を検知し，自動でビルドされ，プレビューが更新されます

## Dev

### Project setup

```
yarn install
```

### Compiles and hot-reloads for development

```
yarn electron:serve
```

### Compiles and minifies for production

```
yarn electron:build:mac
yarn electron:build:win
```

### Lints and fixes files

```
yarn lint
```
