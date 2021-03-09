# simple-video-capture
PC上のアプリケーション、モニターなどの操作を録画できるツールです。録画した動画はwebm形式でダウンロードできます。

サイト→https://www.ajizablg.com/simple-video-capture/index.html

## ビルド方法
### 前提
- [Node.js](https://nodejs.org/ja/)をインストールしてください

### 手順
別リポジトリ[vncho-lib](https://github.com/st-user/vncho-lib)の共通ライブラリに依存しているので、その共通ライブラリを先にクローンしてから、ビルドします。

```
git clone https://github.com/st-user/vncho-lib.git
cd vncho-lib
npm install
npm run build-css
cd ../

git clone https://github.com/st-user/simple-video-capture.git
cd simple-video-capture
npm install
npm run clean
npm run build-css
npm run start
```

gitをインストールしていない場合、zipをダウンロードし、同様に上記コマンドを実行してください。

以上により、`http://localhost:8080/simple-video-capture/index.html`にアクセスできるようになります。
プロダクション版（ウェブサーバーのドキュメントルートなどに配置する版）をビルドする場合は
```
npm run clean
npm run build
npm run license-gen
```
を実行してください。

### ライセンス
ソースコードのライセンスは[LICENSE](https://github.com/st-user/simple-video-capture/blob/main/LICENSE)記載の通りMITですが、[assets](https://github.com/st-user/simple-video-capture/tree/main/assets)に配置するicon,logoについては、許可なく利用することを禁止します。
