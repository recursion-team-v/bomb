package config

const (
	address       = "0.0.0.0"
	port          = 8080
	webSocketPath = "/game"
)

type Config struct {
	// 起動時のアドレス
	Address string

	// 起動時の Port 番号
	Port int

	// WebSocket の path
	WebSocketPath string

	IsDebug bool
}

func NewConfig(isDebug bool) *Config {
	return &Config{
		Address:       address,
		Port:          port,
		WebSocketPath: webSocketPath,
		IsDebug:       isDebug,
	}
}
