##########################################################
#### ビルドステージ
FROM node:18.12-alpine3.17 as builder
WORKDIR /work

# ビルド用の依存パッケージをインストール
COPY package*.json ./
RUN npm ci

# TypeScript コードをコピーしてビルド
COPY tsconfig.json ./
COPY src ./
RUN npm run build

##########################################################
#### 実行用イメージの作成
FROM node:18.12-alpine3.17 as runner
WORKDIR /work

ENV NODE_ENV production
ENV PORT 2567
EXPOSE 2567

# 本番環境用のパッケージをインストール
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# builder からビルド結果だけコピー
COPY --from=builder /work/dist ./dist

# Node.js アプリを起動
CMD ["node", "./dist/work/index.js"]
