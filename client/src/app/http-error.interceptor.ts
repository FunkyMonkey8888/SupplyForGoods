import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse
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

        // ✅ Do NOT redirect for auth-related calls (show inline message on login/register)
        const isAuthCall =
          req.url.includes('/api/user/login') ||
          req.url.includes('/api/user/register') ||
          req.url.includes('/api/auth/');

        if (isAuthCall) {
          return throwError(() => err);
        }

        // ✅ Only redirect for API calls (so normal asset loads etc. don't trigger)
        const isApiCall = req.url.includes('/api/');
        if (!isApiCall) {
          return throwError(() => err);
        }


        const status = err.status ?? 500;

        const shouldRedirect =
          status === 0 || status === 500 || status === 503 || status === 404 || status === 401 || status === 403;

        if (!shouldRedirect) {
          return throwError(() => err);
        }

        // ✅ Extract backend error message if it follows your ApiError JSON
        const api = err.error || {};
        const message =
          api.message ||
          err.message ||
          'Unexpected error occurred';

        const title =
          status === 0 ? 'Network Error' :
          status === 401 ? 'Unauthorized' :
          status === 403 ? 'Forbidden' :
          status === 404 ? 'Not Found' :
          status === 503 ? 'Service Unavailable' :
          'Server Error';

        // ✅ Prevent redirect loops if already on /error
        if (this.router.url.startsWith('/error')) {
          return throwError(() => err);
        }

        this.router.navigate(['/error'], {
          state: {
            status,
            title,
            message,
            path: api.path || req.url
          }
        });

        return throwError(() => err);
      })
    );
  }
}
