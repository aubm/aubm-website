package api

import (
	"encoding/json"
	"log"
)

func toJson(input interface{}) []byte {
	b, err := json.Marshal(input)
	if err != nil {
		log.Fatal(err)
	}

	return b
}
