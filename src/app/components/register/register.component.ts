import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  formData = {
    username: '',
    password: '',
    fullName: '',
    gender: 'Male',
    age: 18,
    occupation: '',
    city: '',
    interests: '',
    phone: ''
  };

  photoFile: File | null = null;
  bioPdfFile: File | null = null;
  isLoading: boolean = false;

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  onPhotoChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.photoFile = event.target.files[0];
    }
  }

  onBioPdfChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.bioPdfFile = event.target.files[0];
    }
  }

  onRegister(): void {
    this.isLoading = true;

    // Constructing FormData container to align with Spring `@RequestParam` parameters
    const data = new FormData();
    data.append('username', this.formData.username.trim());
    data.append('password', this.formData.password.trim());
    data.append('fullName', this.formData.fullName.trim());
    data.append('gender', this.formData.gender);
    data.append('age', this.formData.age.toString());
    data.append('occupation', this.formData.occupation.trim());
    data.append('city', this.formData.city.trim());
    data.append('interests', this.formData.interests.trim());
    data.append('phone', this.formData.phone.trim());

    if (this.photoFile) {
      data.append('photo', this.photoFile);
    }
    if (this.bioPdfFile) {
      data.append('bioPdf', this.bioPdfFile);
    }

    // Routed through the public proxy path defined on your API Gateway (Port 9090)
    this.http.post(
      'http://localhost:9090/user-service/api/users/register',
      data,
      { responseType: 'text' }
    ).subscribe({
      next: (response: string) => {
        this.isLoading = false;
        alert('Success! Your profile has been created successfully. Please login.');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.isLoading = false;
        let descriptiveErrorMessage = 'Please try again.';
        
        if (err?.error) {
          descriptiveErrorMessage = typeof err.error === 'string' ? err.error : (err.error.message || descriptiveErrorMessage);
        }
        
        alert('Registration failed: ' + descriptiveErrorMessage);
      }
    });
  }
}