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

## エディタとの連携

実行時にファイルを指定して起動できるので，編集中のファイルをエディタから連携起動できるようにしておくと便利です．

### vim

```vim
" for mac
function! OpenWithMarkuPrev()
  echo system('open /Applications/MarkuPrev.app' . ' -n --args ' . shellescape(expand('%:p')))
endfunction
command! MarkuPrev call OpenWithMarkuPrev()

" for windows
function! OpenWithMarkuPrev()
  echo system('path/to/MarkuPrev.exe' . ' ' . shellescape(expand('%:p')))
endfunction
command! MarkuPrev call OpenWithMarkuPrev()
```

### emacs

（emacsは使っていないので設定方法がわかりません．わかる方書いてくれると助かります．）

### サクラエディタ

「ファイル名を指定して実行」機能で，次のように起動します．

```
path\to\MarkuPrev.exe $F
```

![](sakuraeditor.png)

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
