.PHONY: install
install: ## 必要なツールをインストールします
	@asdf install local

.PHONY: run
run: tidy ## bbb を起動します
	@go run cmd/bbb/main.go

.PHONY: test
test: ## 全てのテストを実行します
	@go test -v ./...

tidy: go.mod go.sum ## 必要なパッケージをダウンロードします
	@go mod tidy

.PHONY: help
help: ## Makefileで定義されているヘルプを表示します
	@grep --no-filename -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
