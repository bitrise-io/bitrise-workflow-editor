package service

import (
	"net/http"
	"os"
)

// DeleteCloseHandler ...
func DeleteCloseHandler(w http.ResponseWriter, r *http.Request) {
	os.Exit(0)
}
