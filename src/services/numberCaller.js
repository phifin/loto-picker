// Manage random loto number calling (1..90) with no duplicates.
// Keeps both a Set for membership checks and an Array for ordered history.

const MIN_NUMBER = 1;
const MAX_NUMBER = 90;

export class NumberCaller {
  constructor({ initialIntervalSeconds = 4, onNumberCalled } = {}) {
    this.intervalSeconds = initialIntervalSeconds;
    this.onNumberCalled = onNumberCalled || (() => {});

    this.calledSet = new Set();
    this.calledList = [];

    this.timerId = null;
    this.isRunning = false;
  }

  getCalledNumbers() {
    return [...this.calledList];
  }

  hasNumber(n) {
    return this.calledSet.has(Number(n));
  }

  setIntervalSeconds(seconds) {
    const s = Math.max(1, Math.min(30, Number(seconds) || 4));
    this.intervalSeconds = s;

    // If already running, restart timer with new interval
    if (this.isRunning) {
      this._stopTimer();
      this._startTimer();
    }
  }

  start() {
    if (this.isRunning) return;

    // Immediately call a number on first start
    const first = this._drawUniqueNumber();
    if (first == null) {
      // All numbers exhausted – do not start timer
      return;
    }

    this._emit(first);

    this.isRunning = true;
    this._startTimer();
  }

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    this._stopTimer();
  }

  reset() {
    this.pause();
    this.calledSet.clear();
    this.calledList = [];
  }

  _startTimer() {
    if (this.timerId != null) return;
    this.timerId = window.setInterval(() => {
      const next = this._drawUniqueNumber();
      if (next == null) {
        // Stop when all numbers are called
        this.pause();
        return;
      }
      this._emit(next);
    }, this.intervalSeconds * 1000);
  }

  _stopTimer() {
    if (this.timerId != null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  _drawUniqueNumber() {
    if (this.calledSet.size >= MAX_NUMBER - MIN_NUMBER + 1) {
      return null;
    }

    // Simple retry loop – cheap for 1..90
    let attempt = 0;
    while (attempt < 200) {
      const n =
        MIN_NUMBER +
        Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1));
      if (!this.calledSet.has(n)) {
        this.calledSet.add(n);
        this.calledList.push(n);
        return n;
      }
      attempt += 1;
    }
    return null;
  }

  _emit(number) {
    try {
      this.onNumberCalled?.(number, this.getCalledNumbers());
    } catch {
      // Avoid crashing game if callback throws
    }
  }
}

