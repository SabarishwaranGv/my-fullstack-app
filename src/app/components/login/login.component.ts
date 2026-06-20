import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  onLogin(): void {
    const rawEmail = this.email ? this.email.trim() : '';
    const rawPassword = this.password ? this.password.trim() : '';

    if (!rawEmail || !rawPassword) {
      alert('Please fill in all credentials.');
      return;
    }

    this.isLoading = true;
    
    // Mapped precisely to your backend's Map<String, String> credentials keys
    const body = { 
      username: rawEmail, 
      password: rawPassword 
    };

    // Routed strictly through the allowed API Gateway endpoint on Port 9090
    this.http.post<any>(
      'http://localhost:9090/auth-service/api/auth/login',
      body
    ).subscribe({
      next: (data: any) => {
        this.isLoading = false;
        
        // Exact mapping extraction selectors based on your backend response contract
        const jwtToken = data?.token;
        const confirmedUser = data?.username || rawEmail;

        if (jwtToken) {
          localStorage.setItem('token', jwtToken);
          localStorage.setItem('username', confirmedUser);
          
          console.log('Secure session established for user:', confirmedUser);
          this.router.navigate(['/dashboard']);
        } else {
          alert('Login Failed: Gateway response was missing a valid token payload property.');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        let errMsg = 'Invalid Credentials';

        if (err?.error) {
          if (typeof err.error === 'string') {
            try {
              const parsedError = JSON.parse(err.error);
              errMsg = parsedError.message ?? parsedError.error ?? errMsg;
            } catch (jsonException) {
              // FIXED S2486: Explicit handling to satisfy strict code quality gates completely
              console.error('Non-JSON error payload intercepted from backend stream:', jsonException);
              errMsg = err.error; 
            }
          } else {
            errMsg = err.error?.message ?? errMsg;
          }
        }
        alert('Login Failed: ' + errMsg);
      }
    });
  }
}