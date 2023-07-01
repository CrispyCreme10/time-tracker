import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  // middle area for start/stop + description + submit
  // left area for details about today's laps
  // right area for details about this week's times
  //  could display a single row for all days this week
  //  could dropdown each day to see list of each lap for that day
  close() {
    window.ipcRenderer.send('close');
  }
}
