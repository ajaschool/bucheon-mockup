(function () {
  var KEY = 'bucheon_mentoring_v2'; /* v2: mentees have contactName + contactPhone */

  var SEED = {
    users: [
      { id: 'admin1', email: 'admin@bucheon.kr', password: 'admin123', name: '관리자', company: '부천시청', phone: '032-111-1111', position: '담당관', role: 'admin', approved: true },
      { id: 'm1', email: 'mentor1@test.com', password: 'mentor123', name: '홍길동', company: '(주)테크솔루션', phone: '010-1111-2222', position: '팀장', role: 'mentor', approved: true },
      { id: 'm2', email: 'mentor2@test.com', password: 'mentor123', name: '김영수', company: '(주)혁신파트너스', phone: '010-2222-3333', position: '과장', role: 'mentor', approved: true },
      { id: 'm3', email: 'mentor3@test.com', password: 'mentor123', name: '박미진', company: '(주)성장컨설팅', phone: '010-3333-4444', position: '대리', role: 'mentor', approved: true },
      { id: 'm4', email: 'mentor4@test.com', password: 'mentor123', name: '최지현', company: '(주)스마트솔루션', phone: '010-4444-5555', position: '사원', role: 'mentor', approved: false },
    ],
    mentees: [
      { id: 'te1', name: '(주)알파테크', contactName: '이민준', contactPhone: '010-5111-1001', mentorId: 'm1' },
      { id: 'te2', name: '(주)베타이노베이션', contactName: '박서연', contactPhone: '010-5222-2002', mentorId: 'm1' },
      { id: 'te3', name: '(주)감마스타트업', contactName: '김도현', contactPhone: '010-5333-3003', mentorId: 'm1' },
      { id: 'te4', name: '(주)델타컴퍼니', contactName: '최유진', contactPhone: '010-5444-4004', mentorId: 'm2' },
      { id: 'te5', name: '(주)엡실론벤처', contactName: '정하늘', contactPhone: '010-5555-5005', mentorId: 'm2' },
      { id: 'te6', name: '(주)제타기업', contactName: '윤지호', contactPhone: '010-5666-6006', mentorId: 'm3' },
      { id: 'te7', name: '(주)에타산업', contactName: '강수아', contactPhone: '010-5777-7007', mentorId: 'm3' },
    ],
    schedules: [
      { id: 's1', mentorId: 'm1', menteeId: 'te1', date: '2026-04-10', status: 'completed', reportFilename: '멘토링보고서_4월_알파테크.pdf', photos: ['현장사진1.jpg', '현장사진2.jpg'] },
      { id: 's2', mentorId: 'm1', menteeId: 'te1', date: '2026-05-15', status: 'completed', reportFilename: '멘토링보고서_5월_알파테크.pdf', photos: ['현장사진1.jpg'] },
      { id: 's3', mentorId: 'm1', menteeId: 'te1', date: '2026-06-20', status: 'pending', reportFilename: null, photos: [] },
      { id: 's4', mentorId: 'm1', menteeId: 'te2', date: '2026-05-08', status: 'completed', reportFilename: '멘토링보고서_5월_베타이노베이션.pdf', photos: ['현장사진1.jpg', '현장사진2.jpg', '현장사진3.jpg'] },
      { id: 's5', mentorId: 'm1', menteeId: 'te2', date: '2026-06-12', status: 'pending', reportFilename: null, photos: [] },
      { id: 's6', mentorId: 'm1', menteeId: 'te3', date: '2026-06-05', status: 'pending', reportFilename: null, photos: [] },
      { id: 's7', mentorId: 'm2', menteeId: 'te4', date: '2026-05-12', status: 'completed', reportFilename: '멘토링보고서_5월_델타컴퍼니.pdf', photos: ['현장사진1.jpg'] },
      { id: 's8', mentorId: 'm2', menteeId: 'te4', date: '2026-06-18', status: 'pending', reportFilename: null, photos: [] },
      { id: 's9', mentorId: 'm2', menteeId: 'te5', date: '2026-06-25', status: 'pending', reportFilename: null, photos: [] },
    ]
  };

  window.DB = {
    init: function () {
      if (!localStorage.getItem(KEY)) localStorage.setItem(KEY, JSON.stringify(SEED));
    },
    reset: function () {
      localStorage.setItem(KEY, JSON.stringify(SEED));
    },
    get: function () {
      return JSON.parse(localStorage.getItem(KEY));
    },
    save: function (d) {
      localStorage.setItem(KEY, JSON.stringify(d));
    },

    /* ── Users ── */
    findUser: function (email, password) {
      return this.get().users.find(function (u) { return u.email === email && u.password === password; }) || null;
    },
    createUser: function (data) {
      var db = this.get();
      var existing = db.users.find(function (u) { return u.email === data.email; });
      if (existing) return null;
      var user = Object.assign({ id: 'u_' + Date.now(), role: 'mentor', approved: false }, data);
      db.users.push(user);
      this.save(db);
      return user;
    },
    setApproved: function (userId, val) {
      var db = this.get();
      var u = db.users.find(function (u) { return u.id === userId; });
      if (u) u.approved = val;
      this.save(db);
    },

    /* ── Mentees ── */
    getMentees: function (mentorId) {
      var db = this.get();
      return mentorId ? db.mentees.filter(function (m) { return m.mentorId === mentorId; }) : db.mentees;
    },
    addMentee: function (mentorId, name, contactName, contactPhone) {
      var db = this.get();
      if (db.mentees.filter(function (m) { return m.mentorId === mentorId; }).length >= 10) return null;
      var m = { id: 'te_' + Date.now(), name: name, contactName: contactName || '', contactPhone: contactPhone || '', mentorId: mentorId };
      db.mentees.push(m);
      this.save(db);
      return m;
    },
    removeMentee: function (menteeId) {
      var db = this.get();
      db.mentees = db.mentees.filter(function (m) { return m.id !== menteeId; });
      db.schedules = db.schedules.filter(function (s) { return s.menteeId !== menteeId; });
      this.save(db);
    },

    /* ── Schedules ── */
    getSchedules: function (filter) {
      var db = this.get();
      var s = db.schedules.slice();
      if (filter) {
        if (filter.mentorId) s = s.filter(function (x) { return x.mentorId === filter.mentorId; });
        if (filter.menteeId) s = s.filter(function (x) { return x.menteeId === filter.menteeId; });
        if (filter.status) s = s.filter(function (x) { return x.status === filter.status; });
      }
      return s.sort(function (a, b) { return a.date.localeCompare(b.date); });
    },
    addSchedule: function (mentorId, menteeId, date) {
      var db = this.get();
      var count = db.schedules.filter(function (s) { return s.mentorId === mentorId && s.menteeId === menteeId; }).length;
      if (count >= 10) return null;
      var s = { id: 'sch_' + Date.now(), mentorId: mentorId, menteeId: menteeId, date: date, status: 'pending', reportFilename: null, photos: [] };
      db.schedules.push(s);
      this.save(db);
      return s;
    },
    completeSchedule: function (schedId, reportFilename, photos) {
      var db = this.get();
      var s = db.schedules.find(function (s) { return s.id === schedId; });
      if (s) { s.status = 'completed'; s.reportFilename = reportFilename; s.photos = photos; }
      this.save(db);
    },
    deleteSchedule: function (schedId) {
      var db = this.get();
      db.schedules = db.schedules.filter(function (s) { return s.id !== schedId; });
      this.save(db);
    }
  };

  window.DB.init();
})();
