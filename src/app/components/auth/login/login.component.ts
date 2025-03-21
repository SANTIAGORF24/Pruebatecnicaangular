import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loginForm: FormGroup;
  hidePassword = true;

  private specialCharPattern = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          this.specialCharValidator(),
        ],
      ],
      rememberMe: [false],
    });

    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  specialCharValidator() {
    return (control: any) => {
      const value = control.value;
      if (!value) {
        return null;
      }
      return this.specialCharPattern.test(value)
        ? null
        : { noSpecialChar: true };
    };
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    const { username, password, rememberMe } = this.loginForm.value;

    this.authService
      .login({ username, password }, rememberMe)
      .subscribe((success) => {
        if (success) {
          this.router.navigate(['/dashboard']);
        }
      });
  }

  get isLoading() {
    return this.authService.isLoading();
  }

  get error() {
    return this.authService.error();
  }
}
