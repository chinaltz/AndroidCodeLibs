const nav = require('../../utils/nav');
const checkin = require('../../utils/checkin-service');

function pad(value) { return String(value).padStart(2, '0'); }
function keyOf(year, month, day) { return `${year}-${pad(month)}-${pad(day)}`; }

function buildMonth(year, month, records, selectedDate) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const total = new Date(year, month, 0).getDate();
  const previousTotal = new Date(year, month - 1, 0).getDate();
  const cells = [];
  for (let index = 0; index < 42; index += 1) {
    const offset = index - firstDay + 1;
    let cellYear = year;
    let cellMonth = month;
    let day = offset;
    let currentMonth = true;
    if (offset <= 0) {
      currentMonth = false;
      day = previousTotal + offset;
      cellMonth -= 1;
      if (cellMonth < 1) { cellMonth = 12; cellYear -= 1; }
    } else if (offset > total) {
      currentMonth = false;
      day = offset - total;
      cellMonth += 1;
      if (cellMonth > 12) { cellMonth = 1; cellYear += 1; }
    }
    const date = keyOf(cellYear, cellMonth, day);
    const record = records[date] || {};
    cells.push({ date, day, currentMonth, completed: !!record.completed, hasLog: !!record.note, selected: date === selectedDate, today: date === checkin.dateKey() });
  }
  return cells;
}

Page({
  data: { theme: {}, year: 0, month: 0, monthTitle: '', cells: [], selectedDate: '', selectedCompleted: false, note: '', stats: {} },
  onLoad() {
    const now = new Date();
    this._year = now.getFullYear();
    this._month = now.getMonth() + 1;
    this._selectedDate = checkin.dateKey();
  },
  onShow() { this.refresh(); },
  onBack() { nav.navigateBack(); },
  refresh() {
    const records = checkin.getDays();
    const selected = checkin.getDay(this._selectedDate);
    this.setData({
      theme: getApp().globalData.theme,
      year: this._year,
      month: this._month,
      monthTitle: `${this._year} 年 ${this._month} 月`,
      cells: buildMonth(this._year, this._month, records, this._selectedDate),
      selectedDate: this._selectedDate,
      selectedCompleted: selected.completed,
      note: selected.note || '',
      stats: checkin.getStats(),
    });
  },
  changeMonth(e) {
    this._month += Number(e.currentTarget.dataset.delta);
    if (this._month < 1) { this._month = 12; this._year -= 1; }
    if (this._month > 12) { this._month = 1; this._year += 1; }
    this._selectedDate = keyOf(this._year, this._month, 1);
    this.refresh();
  },
  selectDay(e) { this._selectedDate = e.currentTarget.dataset.date; this.refresh(); },
  onNoteInput(e) { this.setData({ note: e.detail.value }); },
  saveNote() {
    checkin.saveLog(this._selectedDate, this.data.note);
    wx.showToast({ title: '假期日志已保存', icon: 'success' });
    this.refresh();
  },
});
