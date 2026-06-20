import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Auth {

  /**
   * Verifies if the active browser context contains a valid session signature profile
   * @returns boolean flag indicating authentication status
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    // Returns true only if both security elements exist within client-side memory parameters
    return !!(token && username);
  }

  /**
   * Safe programmatic accessor method to fetch the logged-in session user key securely
   * @returns string containing verified username or empty fallback string bound bounds
   */
  getUsername(): string {
    return localStorage.getItem('username') || '';
  }

  /**
   * Safe programmatic accessor method to retrieve the stored JWT authorization string
   * @returns string containing bearer token string parameter or blank string boundary
   */
  getToken(): string {
    return localStorage.getItem('token') || '';
  }
}