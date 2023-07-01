import { Component, ElementRef, ViewChild } from '@angular/core';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons';

type DayOfWeek = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

interface DaySession {
  day: DayOfWeek;
  sessions: Session[]
}

interface Session {
  start: Date,
  end: Date,
  notes: string
}

const DEFAULT_TIME = '00:00:00';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  @ViewChild('notes') notes!: ElementRef;

  timerStopped = true;
  interval!: ReturnType<typeof setTimeout>;
  startTime = 0; // in ms since start date value
  timeElapsed = 0; // in ms
  timerFormatted: string = DEFAULT_TIME;

  todaysSessions: Session[] = [];
  weeksSessions: DaySession[] = [];

  todayExpanded = false;
  weeksExpanded = false;
  weekDaysExpandedMap = {
    ['Sun']: false,
    ['Mon']: false,
    ['Tue']: false,
    ['Wed']: false,
    ['Thu']: false,
    ['Fri']: false,
    ['Sat']: false,
  };

  faCaretRight = faCaretRight;

  // middle area for start/stop + description + submit
  // left area for details about today's laps
  // right area for details about this week's times
  //  could display a single row for all days this week
  //  could dropdown each day to see list of each lap for that day

  startTimer() {
    if (this.timeElapsed === 0) {
      this.timerStopped = false;
      this.startTime = Date.now();
    }

    if (!this.timerStopped && this.timeElapsed > 0) {
      this.pauseTimer();
    } else {
      this.interval = setInterval(() => {
        this.timeElapsed = Date.now() - this.startTime;
        this.formatTime();
      }, 1000);
    }
  }

  private pauseTimer() {
    this.timerStopped = true;
    clearInterval(this.interval);
  }

  resetTimer() {
    this.timeElapsed = 0;
    this.timerFormatted = DEFAULT_TIME;
    this.pauseTimer();
  }

  formatTime() {
    const seconds = this.timeElapsed / 1000;
    const hours = seconds / 3600;
    const mins = seconds / 60;
    const secs = seconds % 60;
    this.timerFormatted = `${(hours < 10 ? '0' : '') + Math.floor(hours)}:${(mins < 10 ? '0' : '') + Math.floor(mins)}:${(secs < 10 ? '0' : '') + Math.floor(secs)}`;
  }

  submit() {
    // save start time, end time & notes to file
    const startDateTime = new Date(this.startTime);
    const endDateTime = new Date(this.startTime + this.timeElapsed);

    console.log('start time: ', startDateTime);
    console.log('time elapsed: ', this.timerFormatted);
    console.log('end time: ', endDateTime);
  }

  expandToday() {
    this.todayExpanded = !this.todayExpanded;
  }

  expandWeek() {
    this.weeksExpanded = !this.weeksExpanded;
  }

  expandDayOfWeek(day: DayOfWeek) {
    this.weekDaysExpandedMap[day] = !this.weekDaysExpandedMap[day];
  }

  close() {
    window.ipcRenderer.send('close');
  }
}
