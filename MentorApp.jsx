/* ── MentorApp.jsx v4 — Hero + dense grid, no empty space ── */

const Icon = window.Icon;
const stockPhoto = window.stockPhoto;
const Lightbox = window.Lightbox;
const DownloadModal = window.DownloadModal;
const PhotoTile = window.PhotoTile;
const ConfirmModal = window.ConfirmModal;
const BusinessOverview = window.BusinessOverview;

const useTheme = window.useTheme || function () {
  const [theme, setTheme] = React.useState(() => window.__theme || 'default');
  React.useEffect(() => {
    const onChange = (e) => setTheme(e.detail.theme);
    window.addEventListener('themechange', onChange);
    return () => window.removeEventListener('themechange', onChange);
  }, []);
  return theme;
};

/* ── Calendar ── */
const MentoringCalendar = ({ schedules, year, month, onPrev, onNext, onDayClick, selectedDate }) => {
  const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const isToday = d => d && today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  const toDateStr = d => d ? `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` : null;

  const schedByDate = {};
  schedules.forEach(s => {
    const [y, m, day] = s.date.split('-').map(Number);
    if (y === year && m - 1 === month) {
      if (!schedByDate[day]) schedByDate[day] = [];
      schedByDate[day].push(s);
    }
  });

  return (
    <div style={mtS.calWrap}>
      <div style={mtS.calHeader}>
        <button onClick={onPrev} style={mtS.calNavBtn} aria-label="이전 달"><Icon name="chevron-left" size={18} color="var(--color-ink-muted)" /></button>
        <span style={mtS.calTitle}>{year}년 {month + 1}월</span>
        <button onClick={onNext} style={mtS.calNavBtn} aria-label="다음 달"><Icon name="chevron-right" size={18} color="var(--color-ink-muted)" /></button>
      </div>
      <div style={mtS.calGrid}>
        {DAYS.map(d => <div key={d} style={mtS.calDayLabel}>{d}</div>)}
        {cells.map((d, i) => {
          const dateStr = toDateStr(d);
          const daySched = d ? schedByDate[d] : null;
          const hasSched = !!(daySched && daySched.length > 0);
          const isT = isToday(d);
          const isSelected = dateStr && dateStr === selectedDate;
          const hasDone = hasSched && daySched.some(s => s.status === 'completed');
          const hasPending = hasSched && daySched.some(s => s.status === 'pending');
          return (
            <div key={i}
              onClick={() => hasSched && onDayClick(dateStr)}
              style={{
                ...mtS.calCell,
                ...(isT ? mtS.calCellToday : {}),
                ...(isSelected ? mtS.calCellSelected : {}),
                ...(!d ? { opacity: 0, pointerEvents: 'none' } : {}),
                ...(hasSched ? { cursor: 'pointer' } : {}),
              }}>
              {d && <span style={{ ...mtS.calNum, ...(isT ? { color: 'var(--color-ink)', fontWeight: '700' } : {}), ...(isSelected ? { color: 'var(--color-ink)', fontWeight: '600' } : {}) }}>{d}</span>}
              <div style={mtS.calDots}>
                {hasPending && <span style={{ ...mtS.calDot, background: 'var(--color-report-blue)' }}></span>}
                {hasDone && <span style={{ ...mtS.calDot, background: 'var(--color-semantic-success)' }}></span>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={mtS.calLegend}>
        <span style={mtS.legendItem}><span style={{ ...mtS.legendDot, background: 'var(--color-report-blue)' }}></span>예정</span>
        <span style={mtS.legendItem}><span style={{ ...mtS.legendDot, background: 'var(--color-semantic-success)' }}></span>완료</span>
        <span style={mtS.legendHint}>점이 있는 날을 클릭하면 우측 카드가 하이라이트됩니다</span>
      </div>
    </div>
  );
};

/* ── Session PAGE (not modal) ── */
const SessionPage = ({ session, mentee, onBack, refresh }) => {
  const [reportFile, setReportFile] = React.useState(null);
  const [photos, setPhotos] = React.useState([]);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [downloadFile, setDownloadFile] = React.useState(null);
  const [lightbox, setLightbox] = React.useState(null);
  const isCompleted = session.status === 'completed';

  const handleSubmit = () => {
    if (!reportFile) { setError('보고서 파일을 첨부해 주세요.'); return; }
    if (photos.length === 0) { setError('현장 사진을 최소 1장 첨부해 주세요.'); return; }
    setSaving(true);
    setTimeout(() => {
      window.DB.completeSchedule(session.id, reportFile.name, photos.map(p => p.name));
      refresh(); onBack();
    }, 600);
  };

  return (
    <div style={mtS.pageWrap}>
      <button onClick={onBack} style={mtS.backBtn}>
        <Icon name="arrow-left" size={14} style={{ marginRight: '6px' }} />돌아가기
      </button>

      <div style={mtS.sessionPageHeader}>
        <div>
          <div style={mtS.sessionPageEyebrow}>{mentee?.name}</div>
          <h2 style={mtS.sessionPageTitle}>{session.date.replace(/-/g, '. ')} 멘토링</h2>
          {mentee?.contactName && <div style={mtS.sessionPageMeta}>담당: {mentee.contactName}{mentee.contactPosition ? ` ${mentee.contactPosition}` : ''} · {mentee.contactPhone}</div>}
        </div>
        <span style={mtS.statusBadge(isCompleted)}>
          {isCompleted && <Icon name="check" size={13} color="var(--color-status-done)" strokeWidth={2.5} style={{ marginRight: '4px' }} />}
          {isCompleted ? '완료됨' : '진행 예정'}
        </span>
      </div>

      {isCompleted ? (
        <>
          <div style={mtS.section}>
            <h3 style={mtS.sectionTitle}>제출 보고서</h3>
            <button style={mtS.fileChipLg} onClick={() => setDownloadFile(session.reportFilename)}>
              <Icon name="file-text" size={18} color="var(--color-ink)" />
              <span>{session.reportFilename}</span>
              <span style={mtS.fileChipHint}>
                <Icon name="download" size={14} color="var(--color-ink-muted)" style={{ marginRight: '4px' }} />다운로드
              </span>
            </button>
          </div>
          <div style={mtS.section}>
            <h3 style={mtS.sectionTitle}>첨부 사진 <span style={mtS.sectionHint}>{session.photos.length}장 · 클릭해서 크게 보기</span></h3>
            <div style={mtS.photoGridLg}>
              {session.photos.map((p, i) => (
                <PhotoTile key={i} index={i} name={p}
                  onClick={() => setLightbox({ photos: session.photos, index: i })} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={mtS.templateRow}>
            <div>
              <div style={mtS.uploadLabel}>보고서 양식</div>
              <div style={mtS.uploadSub}>작성 후 아래에 첨부해 주세요</div>
            </div>
            <button style={mtS.downloadBtn} onClick={() => setDownloadFile('멘토링보고서_양식.docx')}>
              <Icon name="download" size={14} color="var(--color-ink)" style={{ marginRight: '6px' }} />양식 다운로드
            </button>
          </div>

          <div style={mtS.section}>
            <div style={mtS.uploadLabel}>보고서 첨부 <span style={{ color: 'var(--color-semantic-error)' }}>*</span></div>
            <label style={mtS.fileLabel}>
              <input type="file" accept=".pdf,.doc,.docx" onChange={e => setReportFile(e.target.files[0])} style={{ display: 'none' }} />
              <div style={mtS.fileBtn}>
                {reportFile
                  ? <span style={{ color: 'var(--color-ink)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Icon name="file-text" size={14} />{reportFile.name}</span>
                  : <span style={{ color: 'var(--color-ink-subtle)' }}>파일 선택 (PDF, Word)</span>}
              </div>
            </label>
          </div>

          <div style={mtS.section}>
            <div style={mtS.uploadLabel}>현장 사진 <span style={{ color: 'var(--color-semantic-error)' }}>*</span> <span style={mtS.uploadSub}>최소 1장 · 최대 4장</span></div>
            <label style={mtS.fileLabel}>
              <input type="file" accept="image/*" multiple onChange={e => setPhotos(Array.from(e.target.files).slice(0, 4))} style={{ display: 'none' }} />
              <div style={mtS.fileBtn}>
                {photos.length > 0
                  ? <span style={{ color: 'var(--color-ink)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Icon name="camera" size={14} />{photos.length}장 선택됨</span>
                  : <span style={{ color: 'var(--color-ink-subtle)' }}>사진 선택 (최대 4장)</span>}
              </div>
            </label>
          </div>

          {error && <p style={{ fontSize: '14px', color: 'var(--color-semantic-error)', margin: '8px 0 0' }}>{error}</p>}
          <button onClick={handleSubmit} disabled={saving} style={mtS.submitBtn}>{saving ? '처리 중...' : '완료 처리'}</button>
        </>
      )}

      {downloadFile && <DownloadModal filename={downloadFile} onClose={() => setDownloadFile(null)} />}
      {lightbox && <Lightbox photos={lightbox.photos} index={lightbox.index} onClose={() => setLightbox(null)} />}
    </div>
  );
};

/* ── 내 멘티 Tab ── */
const MenteeTab = ({ db, user, onSessionClick, refresh }) => {
  const [addingFor, setAddingFor] = React.useState(null);
  const [newDate, setNewDate] = React.useState('');
  const [deletingSched, setDeletingSched] = React.useState(null); // {id, date, menteeName}
  const mentees = db.mentees.filter(m => m.mentorId === user.id);

  if (mentees.length === 0) return <div style={mtS.emptyState}>배정된 참여기업이 없습니다.<br />관리자에게 문의하세요.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {mentees.map(mt => {
        const mtScheds = db.schedules.filter(s => s.menteeId === mt.id).sort((a, b) => a.date.localeCompare(b.date));
        const mtDone = mtScheds.filter(s => s.status === 'completed').length;
        const isAdding = addingFor === mt.id;
        return (
          <div key={mt.id} style={mtS.menteeCard}>
            <div style={mtS.menteeCardTop}>
              <div style={{ flex: 1 }}>
                <div style={mtS.menteeCardName}>{mt.name}</div>
                <div style={mtS.menteeCardContact}>
                  {mt.contactName && <span>담당: {mt.contactName}{mt.contactPosition ? ` ${mt.contactPosition}` : ''}</span>}
                  {mt.contactPhone && <span> · {mt.contactPhone}</span>}
                </div>
              </div>
              <div style={mtS.menteeCardRight}>
                <span style={mtS.menteeProg}>{mtDone}/{mtScheds.length}건 완료</span>
                {mtScheds.length < 10 && (
                  <button style={mtS.addSchedBtn} onClick={() => setAddingFor(isAdding ? null : mt.id)}>
                    {isAdding ? '취소' : '+ 날짜'}
                  </button>
                )}
              </div>
            </div>
            {isAdding && (
              <div style={mtS.addDateRow}>
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={mtS.dateInput} min="2026-01-01" max="2026-12-31" />
                <button style={mtS.addConfirmBtn} onClick={() => {
                  if (!newDate) return;
                  window.DB.addSchedule(user.id, mt.id, newDate);
                  setNewDate(''); setAddingFor(null); refresh();
                }}>추가</button>
              </div>
            )}
            {mtScheds.length === 0
              ? <div style={mtS.noSchedMsg}>등록된 일정이 없습니다. 날짜를 추가해주세요.</div>
              : (
                <div style={mtS.schedList}>
                  {mtScheds.map(s => (
                    <div key={s.id} style={mtS.schedRow}>
                      <span style={mtS.schedDate}>{s.date.replace(/-/g, '. ')}</span>
                      <span style={mtS.schedStatusBadge(s.status)}>{s.status === 'completed' ? '완료' : '예정'}</span>
                      <div style={mtS.schedActions}>
                        <button style={mtS.schedViewBtn} onClick={() => onSessionClick(s)}>
                          {s.status === 'completed' ? '보기' : '보고서 업로드'}
                        </button>
                        {s.status === 'pending' && (
                          <button style={mtS.schedDelBtn} onClick={() => {
                            const mt = mentees.find(x => x.id === s.menteeId);
                            setDeletingSched({ id: s.id, date: s.date, menteeName: mt?.name || '' });
                          }}>삭제</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        );
      })}

      {deletingSched && (
        <ConfirmModal
          title="일정 삭제"
          message={<><strong>{deletingSched.menteeName}</strong> · {deletingSched.date.replace(/-/g, '. ')} 일정을 삭제합니다.<br />되돌릴 수 없습니다.</>}
          confirmText="삭제"
          destructive
          onConfirm={() => { window.DB.deleteSchedule(deletingSched.id); refresh(); }}
          onClose={() => setDeletingSched(null)}
        />
      )}
    </div>
  );
};

/* ── Monthly Schedule Block ── */
const MonthlyScheduleBlock = ({ schedules, year, month, getMentee, selectedDate, onSelect, onSessionClick }) => {
  const monthScheds = schedules.filter(s => {
    const [y, m] = s.date.split('-').map(Number);
    return y === year && m - 1 === month;
  }).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div style={mtS.monthCard}>
      <div style={mtS.monthCardHeader}>
        <span style={mtS.monthCardTitle}>{month + 1}월 스케줄</span>
        <span style={mtS.monthCardCount}>{monthScheds.length}건</span>
      </div>
      {monthScheds.length === 0 ? (
        <div style={mtS.monthCardEmpty}>이번 달 스케줄이 없습니다.</div>
      ) : (
        <div style={mtS.monthList}>
          {monthScheds.map(s => {
            const mt = getMentee(s.menteeId);
            const isHi = s.date === selectedDate;
            return (
              <div key={s.id}
                style={{ ...mtS.monthRow, ...(isHi ? mtS.monthRowHi : {}) }}
                onClick={() => { onSelect(s.date); onSessionClick(s); }}>
                <div style={mtS.monthRowLeft}>
                  <div style={mtS.monthRowDate}>{s.date.split('-').slice(1).join('. ')}</div>
                  <div style={mtS.monthRowMentee}>{mt?.name}</div>
                </div>
                <span style={mtS.schedStatusBadge(s.status)}>{s.status === 'completed' ? '완료' : '예정'}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ── Next Up Highlighted Card ── */
const NextUpCard = ({ session, mentee, onClick }) => {
  if (!session) return null;
  const diffDays = Math.ceil((new Date(session.date) - new Date()) / 86400000);
  const dDayText = diffDays < 0 ? `${Math.abs(diffDays)}일 지남` : diffDays === 0 ? '오늘' : `D-${diffDays}`;
  const accent = diffDays < 0 ? 'var(--color-semantic-error)' : diffDays === 0 ? 'var(--color-accent)' : 'var(--color-ink)';
  return (
    <div style={mtS.nextUpCard} onClick={onClick}>
      <div style={mtS.nextUpLeft}>
        <div style={mtS.nextUpEyebrow}>다음 예정 멘토링</div>
        <div style={mtS.nextUpMentee}>{mentee?.name}</div>
        <div style={mtS.nextUpDate}>{session.date.replace(/-/g, '. ')}</div>
        {mentee?.contactName && <div style={mtS.nextUpMeta}>담당: {mentee.contactName}{mentee.contactPosition ? ` ${mentee.contactPosition}` : ''} · {mentee.contactPhone}</div>}
      </div>
      <div style={mtS.nextUpRight}>
        <div style={{ ...mtS.nextUpDday, color: accent }}>{dDayText}</div>
        <button style={mtS.nextUpBtn} onClick={(e) => { e.stopPropagation(); onClick(); }}>
          보고서 업로드<Icon name="arrow-right" size={14} color="#fff" style={{ marginLeft: '6px' }} />
        </button>
      </div>
    </div>
  );
};

/* ── Main Mentor App ── */
const MentorApp = ({ user, onLogout }) => {
  const theme = useTheme();
  const [db, setDb] = React.useState(window.DB.get());
  const refresh = () => setDb(window.DB.get());

  const now = new Date();
  const [calYear, setCalYear] = React.useState(now.getFullYear());
  const [calMonth, setCalMonth] = React.useState(now.getMonth());
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('upcoming');
  const [selectedSession, setSelectedSession] = React.useState(null);
  const [view, setView] = React.useState('home'); // 'home' | 'overview'

  const openSession = React.useCallback((s) => {
    setSelectedSession(s);
    window.history.pushState({ kind: 'session', id: s.id }, '');
  }, []);
  const closeSession = React.useCallback(() => {
    window.history.back();
  }, []);
  React.useEffect(() => {
    const onPop = () => setSelectedSession(null);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const mentees = db.mentees.filter(m => m.mentorId === user.id);
  const allSchedules = db.schedules.filter(s => s.mentorId === user.id);
  const upcoming = allSchedules.filter(s => s.status === 'pending').sort((a, b) => a.date.localeCompare(b.date));
  const completed = allSchedules.filter(s => s.status === 'completed').sort((a, b) => b.date.localeCompare(a.date));

  const getMentee = id => db.mentees.find(m => m.id === id);
  const nextUp = upcoming[0];

  const handlePrevMonth = () => {
    setSelectedDate(null);
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1);
  };
  const handleNextMonth = () => {
    setSelectedDate(null);
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1);
  };

  const handleDayClick = (dateStr) => {
    setSelectedDate(prev => prev === dateStr ? null : dateStr);
  };

  const tabs = [
    { id: 'upcoming', label: `예정 (${upcoming.length})` },
    { id: 'completed', label: `완료 (${completed.length})` },
    { id: 'mentees', label: `내 참여기업 (${mentees.length})` },
  ];

  const Topbar = () => (
    <header style={mtS.topbar}>
      <div style={mtS.topLeft}>
        <div style={mtS.logoDot}></div>
        <div style={mtS.logoTextWrap}>
          <span style={mtS.logoLine1}>2026 부천문화콘텐츠</span>
          <span style={mtS.logoLine2}>성장지원플랫폼</span>
        </div>
        <nav style={mtS.topNav}>
          <button onClick={() => setView('home')}
            style={{ ...mtS.topNavBtn, ...(view === 'home' ? mtS.topNavBtnActive : {}) }}>홈</button>
          <button onClick={() => setView('overview')}
            style={{ ...mtS.topNavBtn, ...(view === 'overview' ? mtS.topNavBtnActive : {}) }}>사업개요</button>
        </nav>
      </div>
      <div style={mtS.topRight}>
        <div style={mtS.topUserInfo}>
          <span style={mtS.topUserName}>{user.name}</span>
          <span style={mtS.topUserCompany}>{user.company}</span>
        </div>
        <button onClick={onLogout} style={mtS.topLogout}>로그아웃</button>
      </div>
    </header>
  );

  if (selectedSession) {
    return (
      <div style={mtS.layout}>
        <Topbar />
        <div style={mtS.body}>
          <SessionPage
            session={selectedSession}
            mentee={getMentee(selectedSession.menteeId)}
            onBack={closeSession}
            refresh={refresh}
          />
        </div>
      </div>
    );
  }

  if (view === 'overview') {
    return (
      <div style={mtS.layout}>
        <Topbar />
        <div style={mtS.body}>
          <BusinessOverview />
        </div>
      </div>
    );
  }

  return (
    <div style={mtS.layout}>
      <Topbar />

      <div style={mtS.body}>
        <div style={mtS.bannerWrap}>
          <img src="bucheon_banner.png" alt="2026 부천 문화콘텐츠 성장지원 플랫폼" style={mtS.bannerImg} />
        </div>
        {/* ── Hero ── */}
        <div style={mtS.hero}>
          <div style={mtS.heroLeft}>
            <div style={mtS.heroGreeting}>안녕하세요, <strong>{user.name}</strong> 전문가님</div>
            <div style={mtS.heroSub}>{user.company} · {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</div>
          </div>
          <div style={mtS.heroStats}>
            {[
              { num: mentees.length, label: '배정 참여기업', color: 'var(--color-ink)' },
              { num: allSchedules.length, label: '전체 멘토링', color: 'var(--color-ink)' },
              { num: upcoming.length, label: '예정', color: 'var(--color-report-blue)' },
              { num: completed.length, label: '완료', color: 'var(--color-semantic-success)' },
            ].map((s, i) => (
              <div key={i} style={mtS.heroStatItem}>
                <div style={{ ...mtS.heroStatNum, color: s.color }}>{s.num}</div>
                <div style={mtS.heroStatLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Next Up ── */}
        {nextUp && (
          <NextUpCard
            session={nextUp}
            mentee={getMentee(nextUp.menteeId)}
            onClick={() => openSession(nextUp)}
          />
        )}

        {/* ── Main Grid ── */}
        <div style={mtS.mainGrid}>
          <div style={mtS.leftCol}>
            <MentoringCalendar
              schedules={allSchedules}
              year={calYear} month={calMonth}
              onPrev={handlePrevMonth} onNext={handleNextMonth}
              onDayClick={handleDayClick}
              selectedDate={selectedDate}
            />
            <MonthlyScheduleBlock
              schedules={allSchedules}
              year={calYear} month={calMonth}
              getMentee={getMentee}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
              onSessionClick={openSession}
            />
          </div>

          <div style={mtS.rightCol}>
            <div style={mtS.tabBar}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  style={{ ...mtS.tabBtn, ...(activeTab === t.id ? mtS.tabBtnActive : {}) }}>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={mtS.tabContent}>
              {activeTab === 'upcoming' && (
                upcoming.length === 0
                  ? <div style={mtS.emptyState}>{'예정된 멘토링이 없습니다.\n내 참여기업 탭에서 날짜를 추가하세요.'}</div>
                  : <div style={mtS.cardGrid}>
                    {upcoming.map(s => {
                      const mt = getMentee(s.menteeId);
                      const diffDays = Math.ceil((new Date(s.date) - new Date()) / 86400000);
                      const isHi = s.date === selectedDate;
                      return (
                        <div key={s.id}
                          style={{ ...mtS.gridCard, borderLeft: `3px solid ${diffDays < 0 ? 'var(--color-semantic-error)' : diffDays === 0 ? 'var(--color-accent)' : 'var(--color-status-progress)'}`, ...(isHi ? mtS.gridCardHi : {}) }}
                          onClick={() => openSession(s)}>
                          <div style={mtS.gridCardTop}>
                            <span style={mtS.gridCardDate}>{s.date.replace(/-/g, '. ')}</span>
                            <span style={mtS.dday(diffDays)}>
                              {diffDays < 0 ? `${Math.abs(diffDays)}일 지남` : diffDays === 0 ? '오늘' : `D-${diffDays}`}
                            </span>
                          </div>
                          <div style={mtS.gridCardMentee}>{mt?.name}</div>
                          {mt?.contactName && <div style={mtS.gridCardContact}>담당 {mt.contactName}{mt.contactPosition ? ` ${mt.contactPosition}` : ''} · {mt.contactPhone}</div>}
                          <button style={mtS.gridCardBtn} onClick={(e) => { e.stopPropagation(); openSession(s); }}>보고서 업로드</button>
                        </div>
                      );
                    })}
                  </div>
              )}

              {activeTab === 'completed' && (
                completed.length === 0
                  ? <div style={mtS.emptyState}>완료된 멘토링이 없습니다.</div>
                  : <div style={mtS.cardGrid}>
                    {completed.map(s => {
                      const mt = getMentee(s.menteeId);
                      const isHi = s.date === selectedDate;
                      return (
                        <div key={s.id}
                          style={{ ...mtS.gridCard, borderLeft: '3px solid var(--color-status-done)', ...(isHi ? mtS.gridCardHi : {}) }}
                          onClick={() => openSession(s)}>
                          <div style={mtS.gridCardTop}>
                            <span style={mtS.gridCardDate}>{s.date.replace(/-/g, '. ')}</span>
                            <span style={mtS.schedStatusBadge('completed')}>완료</span>
                          </div>
                          <div style={mtS.gridCardMentee}>{mt?.name}</div>
                          {mt?.contactName && <div style={mtS.gridCardContact}>담당 {mt.contactName}{mt.contactPosition ? ` ${mt.contactPosition}` : ''} · {mt.contactPhone}</div>}
                          <div style={mtS.gridCardFile}>
                            <Icon name="file-text" size={13} color="var(--color-ink-muted)" />
                            <span>{s.reportFilename}</span>
                            <span style={{ color: 'var(--color-ink-tertiary)' }}>·</span>
                            <Icon name="camera" size={13} color="var(--color-ink-muted)" />
                            <span>사진 {s.photos.length}장</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
              )}

              {activeTab === 'mentees' && (
                <MenteeTab db={db} user={user} onSessionClick={openSession} refresh={refresh} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Styles ── */
const mtS = {
  layout: { minHeight: '100vh', background: 'var(--color-canvas)', display: 'flex', flexDirection: 'column' },
  topbar: { background: 'var(--t-topbar-bg)', borderBottom: 'var(--t-topbar-border)', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, boxShadow: 'var(--t-card-shadow)' },
  topLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  topNav: { display: 'flex', gap: '4px', marginLeft: '24px' },
  topNavBtn: { padding: '8px 16px', background: 'transparent', border: 'none', borderRadius: 'var(--t-radius-button)', fontSize: '14px', color: 'var(--t-topbar-text)', opacity: 0.65, cursor: 'pointer', fontFamily: 'var(--font-sans)' },
  topNavBtnActive: { background: 'var(--t-nav-active-bg, rgba(255,255,255,0.12))', opacity: 1, fontWeight: '500' },
  logoDot: { width: '32px', height: '32px', background: 'var(--t-topbar-text)', borderRadius: '7px', opacity: 0.95 },
  logoText: { fontSize: '16px', fontWeight: '500', color: 'var(--t-topbar-text)' },
  logoTextWrap: { display: 'flex', flexDirection: 'column', lineHeight: 1.15 },
  logoLine1: { fontSize: '11px', color: 'var(--t-topbar-text)', opacity: 0.7, fontWeight: '500', letterSpacing: '-0.2px' },
  logoLine2: { fontSize: '14px', color: 'var(--t-topbar-text)', fontWeight: '600', letterSpacing: '-0.3px' },
  topRight: { display: 'flex', alignItems: 'center', gap: '20px' },
  topUserInfo: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  topUserName: { fontSize: '14px', fontWeight: '500', color: 'var(--t-topbar-text)' },
  topUserCompany: { fontSize: '12px', color: 'var(--t-topbar-text)', opacity: 0.7 },
  topLogout: { padding: '8px 16px', background: 'transparent', border: '1px solid currentColor', borderRadius: 'var(--t-radius-button)', fontSize: '13px', color: 'var(--t-topbar-text)', opacity: 0.85, cursor: 'pointer', fontFamily: 'var(--font-sans)' },

  body: { display: 'flex', flexDirection: 'column', gap: '24px', padding: '36px 48px', flex: 1, maxWidth: '1320px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
  bannerWrap: { width: '100%' },
  bannerImg: { display: 'block', width: '100%', height: 'auto', borderRadius: '16px', boxShadow: 'var(--t-card-shadow)' },

  /* Hero */
  hero: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px', padding: '28px 32px', background: 'var(--color-surface-1)', border: 'var(--t-card-border)', borderRadius: 'var(--t-radius-card-lg)', boxShadow: 'var(--t-card-shadow)' },
  heroLeft: { flex: '1 1 auto' },
  heroGreeting: { fontSize: '24px', fontWeight: 'var(--t-display-weight)', color: 'var(--color-ink)', letterSpacing: 'var(--t-display-tracking)' },
  heroSub: { fontSize: '14px', color: 'var(--color-ink-subtle)', marginTop: '6px' },
  heroStats: { display: 'flex', alignItems: 'center', gap: '36px' },
  heroStatItem: { textAlign: 'right', minWidth: '60px' },
  heroStatNum: { fontSize: '36px', fontWeight: 'var(--t-display-weight)', letterSpacing: 'var(--t-display-tracking)', lineHeight: 1 },
  heroStatLabel: { fontSize: '12px', color: 'var(--color-ink-subtle)', marginTop: '6px' },

  /* Next Up Card — white surface, subtle hierarchy through typography */
  nextUpCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', padding: '28px 32px', background: 'var(--color-surface-1)', border: 'var(--t-card-border)', borderRadius: 'var(--t-radius-card-lg)', cursor: 'pointer', boxShadow: 'var(--t-card-shadow)' },
  nextUpLeft: { flex: 1 },
  nextUpEyebrow: { fontSize: '12px', letterSpacing: '0.5px', color: 'var(--color-ink-subtle)', marginBottom: '10px', fontWeight: '500', textTransform: 'uppercase' },
  nextUpMentee: { fontSize: '28px', fontWeight: 'var(--t-display-weight)', letterSpacing: 'var(--t-display-tracking)', marginBottom: '6px', color: 'var(--color-ink)' },
  nextUpDate: { fontSize: '14px', color: 'var(--color-ink-muted)' },
  nextUpMeta: { fontSize: '13px', color: 'var(--color-ink-subtle)', marginTop: '8px' },
  nextUpRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '14px' },
  nextUpDday: { fontSize: '36px', fontWeight: 'var(--t-display-weight)', letterSpacing: 'var(--t-display-tracking)', color: 'var(--color-ink)', lineHeight: 1 },
  nextUpBtn: { padding: '10px 20px', background: 'var(--t-button-bg)', border: 'none', borderRadius: 'var(--t-radius-button)', color: 'var(--t-button-text)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: '600' },

  /* Main grid */
  mainGrid: { display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'flex-start' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
  rightCol: { background: 'var(--color-surface-1)', border: 'var(--t-card-border)', borderRadius: 'var(--t-radius-card)', overflow: 'hidden', boxShadow: 'var(--t-card-shadow)' },

  /* Calendar */
  calWrap: { background: 'var(--color-surface-1)', border: 'var(--t-card-border)', borderRadius: 'var(--t-radius-card)', padding: '22px', boxShadow: 'var(--t-card-shadow)' },
  calHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  calTitle: { fontSize: '16px', fontWeight: '500', color: 'var(--color-ink)' },
  calNavBtn: { background: 'none', border: 'none', fontSize: '24px', color: 'var(--color-ink-muted)', cursor: 'pointer', padding: '0 6px', lineHeight: 1, fontFamily: 'var(--font-sans)' },
  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' },
  calDayLabel: { textAlign: 'center', fontSize: '12px', color: 'var(--color-ink-subtle)', padding: '6px 0', fontWeight: '500' },
  calCell: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 2px', borderRadius: '8px', minHeight: '46px', justifyContent: 'center', transition: 'background 0.1s' },
  /* 오늘 셀: 검정 채움 → 외곽선만 (점 가시성 보존) */
  calCellToday: { boxShadow: 'inset 0 0 0 1.5px var(--color-ink)', borderRadius: '8px' },
  calCellSelected: { background: 'var(--color-surface-2)', borderRadius: '8px', boxShadow: 'inset 0 0 0 2px var(--color-ink)' },
  calNum: { fontSize: '14px', color: 'var(--color-ink)', lineHeight: 1 },
  calDots: { display: 'flex', gap: '3px', marginTop: '5px', minHeight: '7px' },
  calDot: { width: '6px', height: '6px', borderRadius: '50%' },
  calLegend: { display: 'flex', gap: '14px', marginTop: '14px', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-ink-muted)' },
  legendDot: { width: '8px', height: '8px', borderRadius: '50%' },
  legendHint: { fontSize: '11px', color: 'var(--color-ink-tertiary)', flex: '1 1 100%', textAlign: 'right', marginTop: '4px' },

  /* Monthly schedule */
  monthCard: { background: 'var(--color-surface-1)', border: 'var(--t-card-border)', borderRadius: 'var(--t-radius-card)', overflow: 'hidden', boxShadow: 'var(--t-card-shadow)' },
  monthCardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--color-hairline-soft)' },
  monthCardTitle: { fontSize: '14px', fontWeight: '500', color: 'var(--color-ink)' },
  monthCardCount: { fontSize: '12px', color: 'var(--color-ink-subtle)', background: 'var(--color-canvas)', padding: '3px 10px', borderRadius: '999px' },
  monthCardEmpty: { padding: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--color-ink-subtle)' },
  monthList: { maxHeight: '420px', overflow: 'auto' },
  monthRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', cursor: 'pointer', borderTop: '1px solid var(--color-hairline-soft)', transition: 'background 0.1s' },
  monthRowHi: { background: 'var(--color-surface-2)', boxShadow: 'inset 3px 0 0 var(--color-ink)' },
  monthRowLeft: { display: 'flex', flexDirection: 'column', gap: '2px' },
  monthRowDate: { fontSize: '12px', color: 'var(--color-ink-subtle)' },
  monthRowMentee: { fontSize: '14px', fontWeight: '500', color: 'var(--color-ink)' },

  /* Tabs */
  tabBar: { display: 'flex', borderBottom: '1px solid var(--color-hairline-soft)', padding: '0 24px' },
  tabBtn: { padding: '18px 18px', border: 'none', borderBottom: '2px solid transparent', background: 'transparent', fontSize: '14px', color: 'var(--color-ink-muted)', cursor: 'pointer', fontFamily: 'var(--font-sans)', marginBottom: '-1px', whiteSpace: 'nowrap' },
  tabBtnActive: { color: 'var(--color-ink)', borderBottomColor: 'var(--color-ink)', fontWeight: '500' },
  tabContent: { padding: '24px' },

  emptyState: { padding: '64px 32px', textAlign: 'center', color: 'var(--color-ink-subtle)', fontSize: '15px', lineHeight: '1.7', whiteSpace: 'pre-line' },

  /* Card grid for sessions */
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' },
  gridCard: { display: 'flex', flexDirection: 'column', gap: '6px', padding: '18px 20px', background: 'var(--color-surface-1)', border: 'var(--t-card-border)', borderRadius: 'var(--t-radius-card)', cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.1s', boxShadow: 'var(--t-card-shadow)' },
  gridCardHi: { background: 'var(--color-surface-2)', boxShadow: 'inset 3px 0 0 var(--color-ink)' },
  gridCardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' },
  gridCardDate: { fontSize: '12px', color: 'var(--color-ink-subtle)' },
  gridCardMentee: { fontSize: '17px', fontWeight: '500', color: 'var(--color-ink)', marginBottom: '2px', letterSpacing: '-0.2px' },
  gridCardContact: { fontSize: '12px', color: 'var(--color-ink-subtle)' },
  gridCardFile: { fontSize: '12px', color: 'var(--color-ink-subtle)', marginTop: '8px', paddingTop: '10px', borderTop: '1px solid var(--color-hairline-soft)' },
  gridCardBtn: { marginTop: '12px', padding: '9px 14px', background: 'var(--t-button-bg)', color: 'var(--t-button-text)', border: 'none', borderRadius: 'var(--t-radius-button)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-sans)' },
  dday: diffDays => ({
    fontSize: '12px', fontWeight: '600',
    color: diffDays < 0 ? 'var(--color-ink-subtle)' : diffDays === 0 ? 'var(--color-accent)' : 'var(--color-ink)',
    background: diffDays < 0 ? 'var(--color-surface-2)' : diffDays === 0 ? 'var(--color-accent-soft)' : 'var(--color-surface-2)',
    padding: '3px 10px', borderRadius: '999px',
    fontVariantNumeric: 'tabular-nums',
  }),
  schedStatusBadge: status => ({ fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '999px', background: status === 'completed' ? 'var(--color-status-done-bg)' : 'var(--color-status-progress-bg)', color: status === 'completed' ? 'var(--color-semantic-success)' : 'var(--color-report-blue)', whiteSpace: 'nowrap' }),

  /* Mentee tab */
  menteeCard: { background: 'var(--color-canvas)', border: '1px solid var(--color-hairline-soft)', borderRadius: '12px', overflow: 'hidden' },
  menteeCardTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '18px 22px', background: 'var(--color-surface-1)', borderBottom: '1px solid var(--color-hairline-soft)' },
  menteeCardName: { fontSize: '17px', fontWeight: '500', color: 'var(--color-ink)', marginBottom: '4px' },
  menteeCardContact: { fontSize: '13px', color: 'var(--color-ink-subtle)' },
  menteeCardRight: { display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '14px' },
  menteeProg: { fontSize: '13px', color: 'var(--color-ink-subtle)', whiteSpace: 'nowrap' },
  addSchedBtn: { fontSize: '13px', padding: '7px 14px', background: 'transparent', border: '1px solid var(--color-hairline)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'var(--color-ink)', whiteSpace: 'nowrap' },
  addDateRow: { display: 'flex', gap: '10px', padding: '14px 22px', background: 'var(--color-status-progress-bg)', borderBottom: '1px solid var(--color-hairline-soft)' },
  dateInput: { flex: 1, padding: '9px 12px', border: '1px solid var(--color-hairline)', borderRadius: '8px', fontSize: '14px', fontFamily: 'var(--font-sans)', outline: 'none' },
  addConfirmBtn: { padding: '9px 16px', background: 'var(--t-button-bg)', color: 'var(--t-button-text)', border: 'none', borderRadius: 'var(--t-radius-button)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' },
  noSchedMsg: { padding: '16px 22px', fontSize: '14px', color: 'var(--color-ink-subtle)', fontStyle: 'italic' },
  schedList: { padding: '4px 0' },
  schedRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 22px', borderTop: '1px solid var(--color-hairline-soft)' },
  schedDate: { fontSize: '14px', color: 'var(--color-ink)', minWidth: '100px' },
  schedActions: { marginLeft: 'auto', display: 'flex', gap: '6px' },
  schedViewBtn: { fontSize: '13px', padding: '6px 14px', background: 'transparent', border: '1px solid var(--color-hairline)', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'var(--color-ink)', whiteSpace: 'nowrap' },
  schedDelBtn: { fontSize: '13px', padding: '6px 8px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'var(--color-ink-subtle)' },

  /* Session detail page */
  pageWrap: { flex: 1, padding: '12px 8px', maxWidth: '960px', margin: '0 auto', width: '100%' },
  backBtn: { background: 'transparent', border: 'none', color: 'var(--color-ink-muted)', fontSize: '14px', cursor: 'pointer', padding: '0 0 20px', fontFamily: 'var(--font-sans)' },
  sessionPageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '36px', gap: '20px' },
  sessionPageEyebrow: { fontSize: '14px', color: 'var(--color-ink-subtle)', marginBottom: '6px' },
  sessionPageTitle: { fontSize: '32px', fontWeight: 'var(--t-display-weight)', color: 'var(--color-ink)', margin: '0', letterSpacing: 'var(--t-display-tracking)' },
  sessionPageMeta: { fontSize: '14px', color: 'var(--color-ink-subtle)', marginTop: '8px' },
  statusBadge: done => ({ display: 'inline-flex', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '500', background: done ? 'var(--color-status-done-bg)' : 'var(--color-status-progress-bg)', color: done ? 'var(--color-semantic-success)' : 'var(--color-report-blue)', whiteSpace: 'nowrap' }),
  section: { marginBottom: '32px' },
  sectionTitle: { fontSize: '18px', fontWeight: '500', color: 'var(--color-ink)', margin: '0 0 14px' },
  sectionHint: { fontSize: '13px', fontWeight: '400', color: 'var(--color-ink-subtle)', marginLeft: '8px' },
  uploadLabel: { fontSize: '14px', fontWeight: '500', color: 'var(--color-ink)', marginBottom: '8px', display: 'block' },
  uploadSub: { fontSize: '13px', color: 'var(--color-ink-subtle)', marginTop: '2px', fontWeight: '400' },
  templateRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'var(--color-surface-1)', border: '1px solid var(--color-hairline)', borderRadius: '12px', marginBottom: '28px' },
  downloadBtn: { padding: '10px 18px', background: '#fff', border: '1px solid var(--color-hairline)', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'var(--color-ink)', whiteSpace: 'nowrap' },
  fileLabel: { display: 'block', cursor: 'pointer', marginBottom: '4px' },
  fileBtn: { padding: '18px 22px', border: '1px dashed var(--color-hairline)', borderRadius: '10px', background: 'var(--color-surface-1)', fontSize: '14px', cursor: 'pointer' },
  fileChipLg: { display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: 'var(--color-report-blue)', background: 'var(--color-status-progress-bg)', padding: '14px 22px', borderRadius: '10px', border: '1px solid var(--color-status-progress-border)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: '500' },
  fileChipHint: { fontSize: '12px', color: 'var(--color-ink-muted)', marginLeft: '6px', fontWeight: '400' },
  photoGridLg: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' },
  submitBtn: { width: '100%', padding: '14px', background: 'var(--t-button-bg)', color: 'var(--t-button-text)', border: 'none', borderRadius: 'var(--t-radius-button)', fontSize: '16px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-sans)', marginTop: '20px' },
};

Object.assign(window, { MentorApp });
