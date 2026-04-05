import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {

        const url = req.url || '';
        const status = err.status ?? 500;

        // ✅ Do NOT redirect for auth flows (keep inline UI messages on login/register/otp)
        const isAuthCall =
          url.includes('/api/user/login') ||
          url.includes('/api/user/register') ||
          url.includes('/api/auth/');

        if (isAuthCall) {
          return throwError(() => err);
        }

        // ✅ Only handle API calls
        const isApiCall = url.includes('/api/');
        if (!isApiCall) {
          return throwError(() => err);
        }

        // ✅ Prevent redirect loop
        if (this.router.url.startsWith('/error')) {
          return throwError(() => err);
        }

        // ✅ Prefer backend structured error message if available
        // Your backend GlobalExceptionHandler returns { message, path, ... }
        const api = err.error || {};
        const apiMessage =
          (typeof api === 'string' ? api : api.message) ||
          api.error ||
          api.title;

        // ✅ Clean user-facing title + message (never show Angular "Http failure response..." string)
        const { title, message } = this.mapToFriendlyError(status, apiMessage);

        // ✅ Decide redirect behavior per status
        // 0: network error / CORS / server down
        // 500/503: backend down or error
        // 404: missing API endpoint
        if (status === 0 || status === 500 || status === 503 || status === 404) {
          this.router.navigate(['/error'], {
            state: {
              status,
              title,
              message,
              // keep path minimal: use backend path if provided, else just the API route
              path: api.path || this.safePath(url)
            }
          });
          return throwError(() => err);
        }

        // ✅ 401: session expired or token missing → go login (better UX than /error)
        if (status === 401) {
          this.router.navigate(['/login']);
          return throwError(() => err);
        }

        // ✅ 403: wrong role / forbidden
        // Option A (recommended): show error page with friendly message
        // Option B: send user back to dashboard (uncomment if you prefer)
        if (status === 403) {
          this.router.navigate(['/error'], {
            state: {
              status,
              title,
              message,
              path: api.path || this.safePath(url)
            }
          });

          // Option B:
          // this.router.navigate(['/dashboard'], { state: { toast: message } });

          return throwError(() => err);
        }

        // ✅ Other errors: let components handle (400 etc.)
        return throwError(() => err);
      })
    );
  }

  private mapToFriendlyError(status: number, backendMessage?: string): { title: string; message: string } {
    switch (status) {
      case 0:
        return {
          title: 'Network Error',
          message: 'Unable to connect to the server. Please check your internet connection and try again.'
        };
      case 401:
        return {
          title: 'Unauthorized',
          message: 'Your session has expired. Please login again.'
        };
      case 403:
        return {
          title: 'Forbidden',
          message: 'You do not have permission to access this feature with your current role.'
        };
      case 404:
        return {
          title: 'Not Found',
          message: backendMessage || 'The requested resource could not be found.'
        };
      case 503:
        return {
          title: 'Service Unavailable',
          message: backendMessage || 'Service is temporarily unavailable. Please try again shortly.'
        };
      case 500:
      default:
        return {
          title: 'Server Error',
          message: backendMessage || 'Something went wrong on our side. Please try again.'
        };
    }
  }

  // Remove proxy host noise; show only the API path
  private safePath(fullUrl: string): string {
    try {
      // If absolute URL, parse and return pathname+search
      if (fullUrl.startsWith('http')) {
        const u = new URL(fullUrl);
        return u.pathname + (u.search || '');
      }
      return fullUrl;
    } catch {
      return fullUrl;
    }
  }
}
