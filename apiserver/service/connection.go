package service

import (
	"net/http"
	"os"
	"time"
)

var terminateTimer *time.Timer
var terminateWaitTime = 5 * time.Second

func startTerminateTimer() {
	terminateTimer = time.AfterFunc(terminateWaitTime, func() {
		os.Exit(0)
	})
}

func stopTerminateTimer() {
	if terminateTimer != nil {
		terminateTimer.Stop()
		terminateTimer = nil
	}
}

// DeleteConnectionHandler ...
func DeleteConnectionHandler(w http.ResponseWriter, r *http.Request) {
	startTerminateTimer()
}

// PostConnectionHandler ...
func PostConnectionHandler(w http.ResponseWriter, r *http.Request) {
	stopTerminateTimer()
}
