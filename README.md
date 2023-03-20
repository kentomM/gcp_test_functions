# 郵便番号API

日本郵便が発行する郵便番号データのCSVを元に、郵便番号から該当する住所を返すシステム

# 開発環境

1. Firebase CLIを使えるようにする
    - 参考: https://firebase.google.com/docs/cli?hl=ja#mac-linux-npm

```sh
$ node --version  # v14.18.0以降であることを確認
$ npm install -g firebase-tools
```

2. ログインする
    1. 一時的であれば以下を実行する

    ```sh
    $ firebase login
    ```

    2. 継続的に使用するならサービスアカウントを使用する
        - gcpのコンソールからサービスアカウントを作成し、json形式の鍵をローカルに保存
        - 環境変数を設定する

        ```sh
        $ echo 'export GOOGLE_APPLICATION_CREDENTIALS="ここにjsonのpathを記載する"' >> ~/.zshrc
        $ source ~/.zshrc
        ```

3. gitのリポジトリをcloneする

```sh
$ git clone hogehoge
```

4. ローカルで動かす

```sh
# ファイルを修正した時に実行
$ cd <REPO_ROOT>/functions && npm run buiud
# デバッグが必要なければオプションは削除
$ cd <REPO_ROOT> && firebase emulators:start --inspect-functions
```

# デプロイ

```sh
$ firebase deploy
```

# author
- @kentomM
    - [作業ログ](https://will-technologies.docbase.io/posts/2791671)