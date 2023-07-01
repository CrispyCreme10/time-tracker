import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { faCaretRight, faPause, faPlay, faRotate } from '@fortawesome/free-solid-svg-icons';

type DayOfWeek = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
type Tab = 'auto' | 'manual';

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
export class HomeComponent implements OnInit {

  @ViewChild('notes') notes!: ElementRef;

  timerStopped = true;
  interval!: ReturnType<typeof setTimeout>;
  startTime = Date.now(); // in ms since start date value
  timeElapsed = 0; // in ms
  timerFormatted: string = DEFAULT_TIME;
  activeTab: Tab = 'auto';

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

  // manual
  startControl = new FormControl([Validators.required]);
  endControl = new FormControl([Validators.required]);
  totalManual = '00:00:00';

  // icons
  faDropdownArrow = faCaretRight;
  faPlay = faPlay;
  faPause = faPause;
  faReset = faRotate;

  ngOnInit(): void {
    // DEBUG
    // this.increaseTimeElapsed(60_000 * 60 + 59_000 * 60 + 58_000);
  }

  startTimer() {
    if (!this.timerStopped) {
      this.pauseTimer();
    } else {
      this.timerStopped = false;
      this.interval = setInterval(() => {
        this.increaseTimeElapsed(1000);
      }, 1000);
    }
  }

  private increaseTimeElapsed(increaseAmount: number) {
    this.timeElapsed += increaseAmount;
    this.formatTime();
  }

  private pauseTimer() {
    this.timerStopped = true;
    clearInterval(this.interval);
  }

  resetTimerConfirm() {
    this.pauseTimer();
    if (confirm('Are you sure you wan to reset the timer?')) {
      this.resetTimer();
    }
  }

  resetTimer() {
    this.timeElapsed = 0;
    this.timerFormatted = DEFAULT_TIME;
  }

  formatTime() {
    const seconds = this.timeElapsed / 1000;
    const hours = seconds / 3600;
    const mins = seconds % 3600 / 60;
    const secs = seconds % 60;
    this.timerFormatted = `${(hours < 10 ? '0' : '') + Math.floor(hours)}:${(mins < 10 ? '0' : '') + Math.floor(mins)}:${(secs < 10 ? '0' : '') + Math.floor(secs)}`;
  }

  setTab(tab: Tab) {
    this.activeTab = tab;
  }

  submit() {
    // save start time, end time & notes to file
    const startDateTime = new Date(this.startTime);
    const endDateTime = new Date(this.startTime + this.timeElapsed);
  }

  submitManual() {

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
