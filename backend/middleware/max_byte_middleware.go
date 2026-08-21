package middleware

import (
	"net/http"

	"github.com/gorilla/mux"
)

func MaxBytesMiddleware(maxBytes int64) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.ContentLength > maxBytes {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusRequestEntityTooLarge)
				w.Write([]byte(`{"error":"Request body too large. Max 5 MB allowed."}`))
				return
			}

			rw := &maxBytesResponseWriter{ResponseWriter: w}
			r.Body = http.MaxBytesReader(rw, r.Body, maxBytes)

			next.ServeHTTP(rw, r)
		})
	}
}

type maxBytesResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (w *maxBytesResponseWriter) WriteHeader(code int) {
	if code == http.StatusRequestEntityTooLarge {
		w.statusCode = code
	} else if w.statusCode == 0 {
		w.statusCode = code
	}
}

func (w *maxBytesResponseWriter) Write(b []byte) (int, error) {
	if w.statusCode == 0 {
		w.statusCode = http.StatusOK
	}
	w.ResponseWriter.WriteHeader(w.statusCode)
	return w.ResponseWriter.Write(b)
}
