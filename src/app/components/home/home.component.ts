import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { faCaretRight, faPause, faPlay, faRotate } from '@fortawesome/free-solid-svg-icons';
import { Session, DaySession, DayOfWeek } from 'src/models/session';

type Tab = 'auto' | 'manual';

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

  allSessions: Session[] = [];
  todaysSessions: Session[] = [];
  weeksSessions: DaySession[] = [];

  todayTotal = DEFAULT_TIME;

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
    this.getSessions();
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
    this.timerFormatted = this.formatTime(this.timeElapsed);
  }

  private pauseTimer() {
    this.timerStopped = true;
    clearInterval(this.interval);
  }

  resetTimerConfirm() {
    this.pauseTimer();
    if (confirm('Are you sure you want to reset the timer?')) {
      this.resetTimer();
    }
  }

  resetTimer() {
    this.timeElapsed = 0;
    this.timerFormatted = DEFAULT_TIME;
  }

  formatTime(timeElapsed: number): string {
    const seconds = timeElapsed / 1000;
    const hours = seconds / 3600;
    const mins = seconds % 3600 / 60;
    const secs = seconds % 60;
    return `${(hours < 10 ? '0' : '') + Math.floor(hours)}:${(mins < 10 ? '0' : '') + Math.floor(mins)}:${(secs < 10 ? '0' : '') + Math.floor(secs)}`;
  }

  setTab(tab: Tab) {
    this.activeTab = tab;
  }

  submit() {
    this.pauseTimer();

    const startTime = this.startTime;
    const endTime = this.startTime + this.timeElapsed;
    const notes = this.notes.nativeElement.value;
    
    let approved = true;
    if (!notes) {
      approved = confirm('Are you sure you want to submit this session with no notes?');
    }

    console.log(startTime, endTime, notes);

    if (approved) {
      window.ipcRenderer.send('insertSession', {
        startTime: startTime,
        endTime: endTime,
        notes: notes
      });
  
      this.resetTimer();
      this.notes.nativeElement.value = '';

      // this.getSessions();
    }
  }

  private getSessions() {
    window.ipcRenderer.send('getSessions');
    window.ipcRenderer.on('getSessions-reply', (event: any, args: any[]) => {
      this.setSessionData(args);
    })
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

  private setSessionData(args: any) {
    this.allSessions = args.map((session: any) => ({
      start: new Date(session.start_time),
      end: new Date(session.end_time),
      total: this.formatTime(session.end_time - session.start_time),
      notes: session.notes
    }));

    this.todaysSessions = this.allSessions.filter(session => {
      const todayMin = new Date().setHours(0, 0, 0);
      const msInADay = 86_400_000;
      const startTime = session.start.getTime();
      return todayMin < startTime && startTime < todayMin + msInADay;
    });

    const total = this.todaysSessions.reduce((total, session) => total + (session.end.getTime() - session.start.getTime()), 0);
    this.todayTotal = this.formatTime(total);

    console.log('TEST');
  }
}
