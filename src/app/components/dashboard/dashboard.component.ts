import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  private readonly GATEWAY = 'http://localhost:9090';

  currentUsername: string = '';
  token: string = '';
  userFullName: string = 'User Profile';
  userHeaderPic: string = 'https://ui-avatars.com/api/?name=User&background=ffd700&color=000';
  isPremium: boolean = false;
  memberBadgeText: string = 'BASIC MEMBER';

  matches: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private readonly http: HttpClient, 
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUsername = localStorage.getItem('username') || '';
    this.token = localStorage.getItem('token') || '';

    console.log('Dashboard Initializing Cycle Active. Username Context:', this.currentUsername);

    if (!this.currentUsername || !this.token) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.userFullName = this.currentUsername.split('@')[0];

    this.fetchUserProfile();
  }

  private createHeaders(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  private fetchUserProfile(): void {
    const profileUrl = `${this.GATEWAY}/user-service/api/users/profile/${encodeURIComponent(this.currentUsername)}`;
    
    this.http.get<any>(profileUrl, this.createHeaders()).subscribe({
      next: (userProfile: any) => {
        if (userProfile) {
          this.userFullName = userProfile.fullName || this.currentUsername.split('@')[0];
          
          if (userProfile.photo) {
            this.userHeaderPic = `${this.GATEWAY}/user-service/uploads/${userProfile.photo}`;
          } else {
            this.userHeaderPic = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.userFullName)}&background=ffd700&color=000`;
          }
        }
        
        this.checkSubscriptionStatus(userProfile);
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        console.error('Error fetching user profile:', err);
        this.errorMessage = '⚠️ Problem connecting to the User Service gateway channel.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private checkSubscriptionStatus(userProfile: any): void {
    const statusUrl = `${this.GATEWAY}/payment-service/api/payments/status/${encodeURIComponent(this.currentUsername)}`;

    this.http.get<boolean>(statusUrl, this.createHeaders()).subscribe({
      next: (premiumStatus: boolean) => {
        console.log('Premium subscription confirmation flag fetched:', premiumStatus);
        
        this.isPremium = premiumStatus;
        this.memberBadgeText = premiumStatus ? 'PREMIUM MEMBER' : 'BASIC MEMBER';
        
        this.loadMatchPool(userProfile);
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        console.warn('Payment-Service status mapping timed out. Reverting to base parameters.', err);
        this.isPremium = false;
        this.memberBadgeText = 'BASIC MEMBER';
        this.loadMatchPool(userProfile);
        this.cdr.detectChanges();
      }
    });
  }

  private loadMatchPool(userProfile: any): void {
    const interests  = userProfile?.interests || 'None';
    const occupation = userProfile?.occupation || 'Other';
    const age        = userProfile?.age || 25;

    const matchUrl = `${this.GATEWAY}/match-service/api/matches/find`
      + `?username=${encodeURIComponent(this.currentUsername)}`
      + `&interest=${encodeURIComponent(interests)}`
      + `&occupation=${encodeURIComponent(occupation)}`
      + `&age=${age}`;

    console.log('Match Pool Engine Query Fired. Target URL:', matchUrl);

    this.http.get<any[]>(matchUrl, this.createHeaders()).subscribe({
      next: (data: any[]) => {
        console.log('Match array compiled successfully. Size:', data ? data.length : 0);
        this.matches = data || [];
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        console.error('Match engine pipeline handshake error:', err);
        this.errorMessage = '⚠️ Could not load computed matching profiles grid container frame.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

getPhotoUrl(match: any): string {
    if (match?.photo) {
      return `${this.GATEWAY}/user-service/uploads/${match.photo.trim()}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(match?.fullName || 'User')}&background=ffd700&color=000`;
  }

  // FIXED: Added a global fallback handler. If ANY image fails to load, this drops in a clean UI avatar.
  setDefaultAvatar(event: Event, fullName: string): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=ffd700&color=000`;
  }
  getInterestTags(interests: string): string[] {
    return interests ? interests.split(',').map((t: string) => t.trim()) : [];
  }

  goToPayment(): void {
    this.router.navigate(['/payment']);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}