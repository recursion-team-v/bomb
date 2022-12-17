# bomb-backend

## directory layout

```
.
├── cmd
│  └── bbb
│     └── main.go ... メインファイル
├── internal
│  ├── adapter
│  │  ├── controller ... 外部からの通信を受け付ける handler など
│  │  └── gateway ... 外部接続用
│  │     └── firebase
│  ├── application
│  │  ├── repository ... DBを透過的に扱うリポジトリ
│  │  └── usecase ... ユースケース、アプリケーションサービスなど
│  └── domain ... モデル、エンティティ など
```
