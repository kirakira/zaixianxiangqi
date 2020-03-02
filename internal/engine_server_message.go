package internal

type GameToPlay struct {
	Uid         *int64  `json:"uid"`
	Gid         *string `json:"gid"`
	Moves       *string `json:"moves"`
	CallbackUrl *string `json:"callback_url"`
}

type EngineServerRequest struct {
	Message struct {
		// Base64-encoded json of a GameToPlay message.
		Data string `json:"data"`
	} `json:"message"`
	Subscription string `json:"subscription"`
}
