package apiserver

import (
	"crypto/subtle"
	"fmt"
	"net/http"
	"strings"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/service"
	"github.com/bitrise-io/go-utils/log"
	"github.com/gorilla/mux"
)

func refuse(w http.ResponseWriter, r *http.Request, status int, format string, v ...interface{}) {
	log.Warnf(" => %s: %s - refused with %d", r.Method, r.RequestURI, status)
	service.RespondWithJSON(w, status, service.NewErrorResponse(format, v...))
}

// requireLocalCaller lets an API request through only if it is addressed to this server by a
// loopback name (so a DNS-rebound hostname is refused) and carries the token of this launch, which
// only the browser tab the server opened has.
func requireLocalCaller(token string, port int) mux.MiddlewareFunc {
	allowedHosts := map[string]bool{
		fmt.Sprintf("localhost:%d", port): true,
		fmt.Sprintf("127.0.0.1:%d", port): true,
	}
	want := []byte(token)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if !allowedHosts[r.Host] {
				refuse(w, r, http.StatusForbidden, "Refusing a request for host %s", r.Host)
				return
			}

			got, isBearer := strings.CutPrefix(r.Header.Get("Authorization"), "Bearer ")
			if !isBearer || subtle.ConstantTimeCompare([]byte(got), want) != 1 {
				refuse(w, r, http.StatusUnauthorized, "Missing or invalid API token. Open the Workflow Editor with the link the bitrise CLI printed, or restart it.")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
