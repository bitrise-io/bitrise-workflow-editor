package httputil

import (
	"fmt"
	"net/http"
)

// GetSingleValueFromHeader ...
func GetSingleValueFromHeader(key string, header http.Header) (string, error) {
	vals := header[key]
	if len(vals) == 0 {
		return "", fmt.Errorf("No value found in HEADER for the key: %s", key)
	}
	if len(vals) > 1 {
		return "", fmt.Errorf("Multiple values found in HEADER for the key: %s", key)
	}
	return vals[0], nil
}
