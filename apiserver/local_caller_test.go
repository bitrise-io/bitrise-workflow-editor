package apiserver

import (
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"github.com/gorilla/mux"
	"github.com/stretchr/testify/require"
)

const testToken = "launch-token"

func guardedRouter() *mux.Router {
	r := mux.NewRouter()
	r.Use(requireLocalCaller(testToken, 4000))
	r.HandleFunc("/api/secrets", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}).Methods("GET")
	return r
}

func TestRequireLocalCaller(t *testing.T) {
	for name, tc := range map[string]struct {
		host          string
		authorization string
		wantStatus    int
	}{
		"localhost with the token":       {host: "localhost:4000", authorization: "Bearer " + testToken, wantStatus: http.StatusOK},
		"127.0.0.1 with the token":       {host: "127.0.0.1:4000", authorization: "Bearer " + testToken, wantStatus: http.StatusOK},
		"no token":                       {host: "localhost:4000", wantStatus: http.StatusUnauthorized},
		"wrong token":                    {host: "localhost:4000", authorization: "Bearer other", wantStatus: http.StatusUnauthorized},
		"token without the scheme":       {host: "localhost:4000", authorization: testToken, wantStatus: http.StatusUnauthorized},
		"rebound hostname":               {host: "attacker.example:4000", authorization: "Bearer " + testToken, wantStatus: http.StatusForbidden},
		"another port":                   {host: "localhost:4001", authorization: "Bearer " + testToken, wantStatus: http.StatusForbidden},
		"network address of the machine": {host: "192.168.1.10:4000", authorization: "Bearer " + testToken, wantStatus: http.StatusForbidden},
	} {
		t.Run(name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/api/secrets", nil)
			req.Host = tc.host
			if tc.authorization != "" {
				req.Header.Set("Authorization", tc.authorization)
			}
			rr := httptest.NewRecorder()

			guardedRouter().ServeHTTP(rr, req)

			require.Equal(t, tc.wantStatus, rr.Code, rr.Body.String())
		})
	}
}

func TestSetupRoutes_everyAPIRouteNeedsTheToken(t *testing.T) {
	r, err := SetupRoutes(true, requireLocalCaller(testToken, 4000))
	require.NoError(t, err)

	routes := 0
	require.NoError(t, r.Walk(func(route *mux.Route, _ *mux.Router, _ []*mux.Route) error {
		path, err := route.GetPathTemplate()
		if err != nil {
			return err
		}
		methods, err := route.GetMethods()
		if err != nil {
			return err
		}
		for _, method := range methods {
			req := httptest.NewRequest(method, path, nil)
			req.Host = "localhost:4000"
			rr := httptest.NewRecorder()

			r.ServeHTTP(rr, req)

			require.Equal(t, http.StatusUnauthorized, rr.Code, "%s %s", method, path)
			routes++
		}
		return nil
	}))
	require.NotZero(t, routes)
}

func TestListen(t *testing.T) {
	t.Run("picks a free port", func(t *testing.T) {
		listener, port, err := listen("127.0.0.1", "")
		require.NoError(t, err)
		defer func() { require.NoError(t, listener.Close()) }()

		require.NotZero(t, port)
		require.Equal(t, "127.0.0.1:"+strconv.Itoa(port), listener.Addr().String())
	})

	t.Run("uses the given port", func(t *testing.T) {
		free, port, err := listen("127.0.0.1", "")
		require.NoError(t, err)
		require.NoError(t, free.Close())

		listener, got, err := listen("127.0.0.1", strconv.Itoa(port))
		require.NoError(t, err)
		defer func() { require.NoError(t, listener.Close()) }()

		require.Equal(t, port, got)
		require.Equal(t, "127.0.0.1:"+strconv.Itoa(port), listener.Addr().String())
	})
}
