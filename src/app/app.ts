import { Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  // Toast notifications
  notifications = computed(() => this.notificationService.notifications());

  constructor(
    private notificationService: NotificationService
  ) {}

  dismissToast(id: number): void {
    this.notificationService.dismiss(id);
  }
}