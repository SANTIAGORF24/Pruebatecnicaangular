import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User, LoginRequest, LoginResponse } from '../models/user.model';
import { Observable, catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private userSignal = signal<User | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private rememberMeSignal = signal<boolean>(false);

  readonly user = this.userSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.userSignal());

  constructor() {
    this.loadUserFromStorage();

    effect(() => {
      const currentUser = this.userSignal();
      const rememberMe = this.rememberMeSignal();

      if (currentUser && rememberMe) {
        localStorage.setItem('user', JSON.stringify(currentUser));
      } else if (currentUser) {
        sessionStorage.setItem('user', JSON.stringify(currentUser));
      }
    });
  }

  login(
    credentials: LoginRequest,
    rememberMe: boolean = false
  ): Observable<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.rememberMeSignal.set(rememberMe);

    // Using the mock data instead of a real API
    return this.http.get<any>('assets/mock-data/users.json').pipe(
      map((data) => {
        const user = data.users.find(
          (u: any) =>
            u.username === credentials.username &&
            u.password === credentials.password
        );

        if (!user) {
          throw new Error('Usuario o contraseña inválidos');
        }

        const { password, ...userWithoutPassword } = user;
        const authUser: User = userWithoutPassword;

        this.userSignal.set(authUser);
        this.loadingSignal.set(false);
        return true;
      }),
      catchError((error) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.message || 'Error al iniciar sesión');
        return of(false);
      })
    );
  }

  logout(): void {
    this.userSignal.set(null);
    this.errorSignal.set(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    this.router.navigate(['/']);
  }

  private loadUserFromStorage(): void {
    let storedUser = localStorage.getItem('user');
    let source = 'localStorage';

    if (!storedUser) {
      storedUser = sessionStorage.getItem('user');
      source = 'sessionStorage';
      this.rememberMeSignal.set(false);
    } else {
      this.rememberMeSignal.set(true);
    }

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.userSignal.set(user);
      } catch (error) {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
      }
    }
  }
}
