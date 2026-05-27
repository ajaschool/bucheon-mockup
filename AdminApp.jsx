/* ── AdminApp.jsx v3 — Desktop B2B layout, sub-pages instead of modals ── */

function useTheme() {
  const [theme, setTheme] = React.useState(() => window.__theme || 'default');
  React.useEffect(() => {
    const onChange = (e) => setTheme(e.detail.theme);
    window.addEventListener('themechange', onChange);
    return () => window.removeEventListener('themechange', onChange);
  }, []);
  return theme;
}

const PHOTO_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
];
const photoGradient = (i) => PHOTO_GRADIENTS[i % PHOTO_GRADIENTS.length];
// Kept for backwards compat (unused now)
const stockPhoto = () => null;

const Lightbox = ({ photos, index, onClose }) => {
  const [i, setI] = React.useState(index || 0);
  const prev = (e) => { e && e.stopPropagation(); setI(p => (p - 1 + photos.length) % photos.length); };
  const next = (e) => { e && e.stopPropagation(); setI(p => (p + 1) % photos.length); };

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [photos.length]);

  const name = photos[i];
  return (
    <div style={adS.lbOverlay} onClick={onClose}>
      <button style={adS.lbClose} onClick={onClose}>✕</button>
      {photos.length > 1 && <button style={{ ...adS.lbNav, left: '24px' }} onClick={prev}>‹</button>}
      {photos.length > 1 && <button style={{ ...adS.lbNav, right: '24px' }} onClick={next}>›</button>}
      <div style={adS.lbInner} onClick={e => e.stopPropagation()}>
        <div style={{ ...adS.lbPlaceholder, background: photoGradient(i) }}>
          <span style={adS.lbPhotoLabel}>사진 {i + 1}</span>
        </div>
        <div style={adS.lbCaption}>
          {name}
          {photos.length > 1 && <span style={adS.lbCounter}>{i + 1} / {photos.length}</span>}
        </div>
      </div>
    </div>
  );
};

const DownloadModal = ({ filename, onClose }) => {
  const [done, setDone] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setDone(true), 1200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={adS.dlOverlay} onClick={onClose}>
      <div style={adS.dlModal} onClick={e => e.stopPropagation()}>
        <div style={adS.dlIcon}>{done ? '✓' : '↓'}</div>
        <div style={adS.dlTitle}>{done ? '다운로드 완료' : '다운로드 중...'}</div>
        <div style={adS.dlFile}>📄 {filename}</div>
        {!done && <div style={adS.dlBar}><div style={adS.dlBarFill}></div></div>}
        <button style={adS.dlBtn} onClick={onClose}>{done ? '확인' : '취소'}</button>
      </div>
    </div>
  );
};

const PhotoTile = ({ index, name, onClick }) => (
  <div style={{ ...adS.photoTile, background: photoGradient(index) }} onClick={onClick}>
    <span style={adS.photoTileNum}>사진 {index + 1}</span>
    <div style={adS.photoTileLabel}>{name}</div>
  </div>
);

const AdminApp = ({ user, onLogout }) => {
  const theme = useTheme();
  const [tab, setTab] = React.useState('dashboard');
  const [db, setDb] = React.useState(window.DB.get());
  const [mentorDetailId, setMentorDetailId] = React.useState(null);
  const [reportView, setReportView] = React.useState(null); // { scheduleId, mentorId, menteeId }
  const refresh = () => setDb(window.DB.get());

  const openMentor = React.useCallback((id) => {
    setMentorDetailId(id);
    window.history.pushState({ kind: 'mentor', id }, '');
  }, []);
  const openReport = React.useCallback((v) => {
    setReportView(v);
    window.history.pushState({ kind: 'report' }, '');
  }, []);
  const goBack = React.useCallback(() => { window.history.back(); }, []);
  React.useEffect(() => {
    const onPop = () => { setMentorDetailId(null); setReportView(null); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navItems = [
    { id: 'dashboard', label: '대시보드' },
    { id: 'mentors', label: '멘토 관리' },
    { id: 'reports', label: '보고서 확인' },
  ];

  const goTab = (id) => { setMentorDetailId(null); setReportView(null); setTab(id); };

  return (
    <div style={adS.layout}>
      <aside style={adS.sidebar}>
        <div style={adS.sideTop}>
          <div style={adS.logo}>
            <div style={adS.logoDot}></div>
            <div style={adS.logoTextWrap}>
              <span style={adS.logoLine1}>2026 부천문화콘텐츠</span>
              <span style={adS.logoLine2}>성장지원플랫폼</span>
            </div>
          </div>
          <div style={adS.adminBadge}>관리자</div>
          <nav style={adS.nav}>
            {navItems.map(n => (
              <button key={n.id} onClick={() => goTab(n.id)}
                style={{ ...adS.navBtn, ...(tab === n.id ? adS.navBtnActive : {}) }}>
                {n.label}
              </button>
            ))}
          </nav>
        </div>
        <div style={adS.sideBottom}>
          <div style={adS.sideUser}>
            <div style={adS.avatar}>{user.name[0]}</div>
            <div><div style={adS.userName}>{user.name}</div><div style={adS.userSub}>{user.company}</div></div>
          </div>
          <button onClick={onLogout} style={adS.logoutBtn}>로그아웃</button>
        </div>
      </aside>
      <main style={adS.main}>
        {/* Page routing — sub-page beats tab */}
        {mentorDetailId && (
          <MentorDetailPage
            mentor={db.users.find(u => u.id === mentorDetailId)}
            db={db}
            onBack={goBack}
          />
        )}
        {!mentorDetailId && reportView && (
          <ReportDetailPage
            view={reportView}
            db={db}
            onBack={goBack}
          />
        )}
        {!mentorDetailId && !reportView && (
          <>
            {tab === 'dashboard' && <AdminDashboard db={db} refresh={refresh} onTab={goTab} onMentorClick={openMentor} />}
            {tab === 'mentors' && <MentorManagement db={db} refresh={refresh} />}
            {tab === 'reports' && <ReportsView db={db} onReportClick={openReport} />}
          </>
        )}
      </main>
    </div>
  );
};

/* ── Dashboard Tab ── */
const AdminDashboard = ({ db, refresh, onTab, onMentorClick }) => {
  const mentors = db.users.filter(u => u.role === 'mentor');
  const approved = mentors.filter(u => u.approved);
  const pending = mentors.filter(u => !u.approved);
  const completed = db.schedules.filter(s => s.status === 'completed');
  const rate = db.schedules.length ? Math.round(completed.length / db.schedules.length * 100) : 0;
  const noScheduleMentors = approved.filter(m => !db.schedules.some(s => s.mentorId === m.id));

  return (
    <div style={adS.content}>
      <div style={adS.pageHeader}>
        <h2 style={adS.pageTitle}>전체 현황</h2>
        <span style={adS.pageDate}>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>

      <div style={adS.statsGrid}>
        <StatCard label="승인된 멘토" value={`${approved.length}명`} sub={pending.length > 0 ? `대기 ${pending.length}명` : null} />
        <StatCard label="배정된 멘티" value={`${db.mentees.length}개`} />
        <StatCard label="전체 일정" value={`${db.schedules.length}건`} sub={`완료 ${completed.length}건 · 예정 ${db.schedules.length - completed.length}건`} />
        <StatCard
          label="전체 완료율"
          value={`${rate}%`}
          accent={rate >= 50 ? 'var(--color-semantic-success)' : 'var(--color-fin-orange)'}
          sub={`${completed.length} / ${db.schedules.length}건`}
        />
      </div>

      {(pending.length > 0 || noScheduleMentors.length > 0) && (
        <div style={adS.section}>
          <h3 style={adS.sectionTitle}>처리 필요 항목</h3>
          <div style={adS.alertList}>
            {pending.length > 0 && (
              <div style={{ ...adS.alertItem, cursor: 'pointer' }} onClick={() => onTab('mentors')}>
                <div style={adS.alertDot('#f59e0b')}></div>
                <div style={{ flex: 1 }}>
                  <div style={adS.alertMain}>승인 대기 중인 멘토 <strong>{pending.length}명</strong></div>
                  <div style={adS.alertSub}>{pending.map(p => p.name).join(', ')} · 멘토 관리에서 승인하세요</div>
                </div>
                <span style={adS.alertArrow}>→</span>
              </div>
            )}
            {noScheduleMentors.map(m => (
              <div key={m.id} style={adS.alertItem}>
                <div style={adS.alertDot('#e0341e')}></div>
                <div style={{ flex: 1 }}>
                  <div style={adS.alertMain}><strong>{m.name}</strong> — 스케쥴 미등록</div>
                  <div style={adS.alertSub}>{m.company} · 멘티 {db.mentees.filter(mt => mt.mentorId === m.id).length}개 업체 배정됨</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={adS.section}>
        <h3 style={adS.sectionTitle}>멘토별 진행 현황 <span style={adS.sectionHint}>행을 클릭하면 상세 페이지로 이동</span></h3>
        <div style={adS.progressList}>
          {approved.map(m => {
            const scheds = db.schedules.filter(s => s.mentorId === m.id);
            const done = scheds.filter(s => s.status === 'completed').length;
            const total = scheds.length;
            const pct = total ? Math.round(done / total * 100) : 0;
            const menteeCount = db.mentees.filter(mt => mt.mentorId === m.id).length;
            return (
              <div key={m.id} style={{ ...adS.progressItem, cursor: 'pointer' }}
                onClick={() => onMentorClick(m.id)}>
                <div style={adS.progressLeft}>
                  <div style={adS.progressAvatar}>{m.name[0]}</div>
                  <div>
                    <div style={adS.progressName}>{m.name}</div>
                    <div style={adS.progressMeta}>{m.company} · 멘티 {menteeCount}개</div>
                  </div>
                </div>
                <div style={adS.progressRight}>
                  <div style={adS.progressBarWrap}>
                    <div style={{ ...adS.progressBarFill, width: pct + '%', background: pct === 100 ? 'var(--color-semantic-success)' : 'var(--color-report-blue)' }}></div>
                  </div>
                  <div style={adS.progressLabel}>{done}/{total}건 <span style={{ color: 'var(--color-ink-subtle)' }}>({pct}%)</span></div>
                  <span style={adS.chevron}>›</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ── Stat Card ── */
const StatCard = ({ label, value, sub, accent }) => (
  <div style={adS.statCard}>
    <div style={adS.statLabel}>{label}</div>
    <div style={{ ...adS.statValue, ...(accent ? { color: accent } : {}) }}>{value}</div>
    {sub && <div style={adS.statSub}>{sub}</div>}
  </div>
);

/* ── Mentor Detail PAGE (not modal) ── */
const MentorDetailPage = ({ mentor, db, onBack }) => {
  const [downloadFile, setDownloadFile] = React.useState(null);
  const [lightbox, setLightbox] = React.useState(null);
  const mentees = db.mentees.filter(m => m.mentorId === mentor.id);
  const allScheds = db.schedules.filter(s => s.mentorId === mentor.id);
  const done = allScheds.filter(s => s.status === 'completed').length;
  const total = allScheds.length;
  const pct = total ? Math.round(done / total * 100) : 0;
  const pending = total - done;

  return (
    <div style={adS.content}>
      <button onClick={onBack} style={adS.backBtn}>← 대시보드로 돌아가기</button>

      <div style={adS.detailHero}>
        <div style={adS.detailHeroLeft}>
          <div style={adS.detailHeroAvatar}>{mentor.name[0]}</div>
          <div>
            <h2 style={adS.pageTitle}>{mentor.name} <span style={adS.detailHeroPos}>{mentor.position}</span></h2>
            <div style={adS.detailHeroMeta}>{mentor.company} · {mentor.phone}</div>
          </div>
        </div>
      </div>

      <div style={adS.statsGrid}>
        <StatCard label="배정 멘티" value={`${mentees.length}개`} />
        <StatCard label="전체 일정" value={`${total}건`} />
        <StatCard label="완료" value={`${done}건`} accent="var(--color-semantic-success)" />
        <StatCard label="진행률" value={`${pct}%`} sub={`${done} / ${total}건`} accent={pct === 100 ? 'var(--color-semantic-success)' : 'var(--color-report-blue)'} />
      </div>

      <div style={adS.section}>
        <h3 style={adS.sectionTitle}>전체 진행률</h3>
        <div style={adS.bigProgressWrap}>
          <div style={{ ...adS.bigProgressFill, width: pct + '%', background: pct === 100 ? 'var(--color-semantic-success)' : 'var(--color-report-blue)' }}></div>
        </div>
      </div>

      {downloadFile && <DownloadModal filename={downloadFile} onClose={() => setDownloadFile(null)} />}
      {lightbox && <Lightbox photos={lightbox.photos} index={lightbox.index} onClose={() => setLightbox(null)} />}

      <div style={adS.section}>
        <h3 style={adS.sectionTitle}>멘티별 진행 현황</h3>
        {mentees.length === 0 && <div style={adS.emptyState}>배정된 멘티가 없습니다.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mentees.map(mt => {
            const mtScheds = db.schedules.filter(s => s.menteeId === mt.id).sort((a, b) => a.date.localeCompare(b.date));
            const mtDone = mtScheds.filter(s => s.status === 'completed').length;
            return (
              <div key={mt.id} style={adS.detailMenteeCard}>
                <div style={adS.detailMenteeHeader}>
                  <div>
                    <div style={adS.detailMenteeName}>{mt.name}</div>
                    <div style={adS.detailMenteeContact}>
                      {mt.contactName && <span>담당: {mt.contactName}</span>}
                      {mt.contactPhone && <span> · {mt.contactPhone}</span>}
                    </div>
                  </div>
                  <div style={adS.detailMenteeBadge}>{mtDone}/{mtScheds.length}건</div>
                </div>
                {mtScheds.length === 0
                  ? <div style={adS.detailNoSched}>등록된 일정 없음</div>
                  : mtScheds.map(s => (
                    <div key={s.id} style={adS.detailSchedRow}>
                      <span style={adS.detailSchedDate}>{s.date.replace(/-/g, '. ')}</span>
                      <span style={adS.statusBadge(s.status === 'completed')}>{s.status === 'completed' ? '완료' : '예정'}</span>
                      {s.reportFilename && (
                        <button style={adS.detailFileBtn} onClick={() => setDownloadFile(s.reportFilename)}>
                          📄 {s.reportFilename}
                        </button>
                      )}
                      {s.photos && s.photos.length > 0 && (
                        <button style={adS.detailPhotoBtn} onClick={() => setLightbox({ photos: s.photos, index: 0 })}>
                          📸 {s.photos.length}장
                        </button>
                      )}
                    </div>
                  ))
                }
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ── Mentor Management Tab ── */
const MentorManagement = ({ db, refresh }) => {
  const [expanded, setExpanded] = React.useState(null);
  const [addingFor, setAddingFor] = React.useState(null);
  const [newForm, setNewForm] = React.useState({ name: '', contactName: '', contactPhone: '' });
  const [subTab, setSubTab] = React.useState('all');

  const mentors = db.users.filter(u => u.role === 'mentor');
  const pending = mentors.filter(u => !u.approved);
  const approved = mentors.filter(u => u.approved);
  const list = subTab === 'pending' ? pending : approved;

  const setF = k => e => setNewForm(p => ({ ...p, [k]: e.target.value }));

  const handleApprove = (id) => { window.DB.setApproved(id, true); refresh(); };
  const handleReject = (id) => { if (window.confirm('거부하시겠습니까?')) { window.DB.setApproved(id, false); refresh(); } };
  const handleAddMentee = (mentorId) => {
    if (!newForm.name.trim()) return;
    window.DB.addMentee(mentorId, newForm.name.trim(), newForm.contactName.trim(), newForm.contactPhone.trim());
    setNewForm({ name: '', contactName: '', contactPhone: '' });
    setAddingFor(null); refresh();
  };
  const handleRemoveMentee = (menteeId, name) => {
    if (window.confirm(`'${name}'을(를) 삭제하시겠습니까? 관련 스케쥴도 함께 삭제됩니다.`)) {
      window.DB.removeMentee(menteeId); refresh();
    }
  };

  return (
    <div style={adS.content}>
      <div style={adS.pageHeader}><h2 style={adS.pageTitle}>멘토 관리</h2></div>
      <div style={adS.subTabRow}>
        {[['all', `전체 멘토 (${approved.length})`], ['pending', `승인 대기 (${pending.length})`]].map(([id, label]) => (
          <button key={id} onClick={() => setSubTab(id)}
            style={{ ...adS.subTab, ...(subTab === id ? adS.subTabActive : {}) }}>{label}</button>
        ))}
      </div>
      <div style={adS.mentorList}>
        {list.length === 0 && <div style={adS.emptyState}>{subTab === 'pending' ? '승인 대기 중인 멘토가 없습니다.' : '등록된 멘토가 없습니다.'}</div>}
        {list.map(m => {
          const mentees = db.mentees.filter(mt => mt.mentorId === m.id);
          const scheds = db.schedules.filter(s => s.mentorId === m.id);
          const isOpen = expanded === m.id;
          return (
            <div key={m.id} style={adS.mentorCard}>
              <div style={adS.mentorHeader} onClick={() => m.approved && setExpanded(isOpen ? null : m.id)}>
                <div style={adS.mentorLeft}>
                  <div style={adS.progressAvatar}>{m.name[0]}</div>
                  <div>
                    <div style={adS.mentorName}>{m.name} <span style={adS.mentorPos}>{m.position}</span></div>
                    <div style={adS.mentorMeta}>{m.company} · {m.phone}</div>
                  </div>
                </div>
                <div style={adS.mentorRight}>
                  {m.approved
                    ? <><span style={adS.badge('green')}>승인됨</span>
                        <span style={adS.metaChip}>멘티 {mentees.length}개</span>
                        <span style={adS.metaChip}>일정 {scheds.length}건</span>
                        <span style={adS.chevron}>{isOpen ? '▲' : '▼'}</span></>
                    : <><span style={adS.badge('orange')}>대기중</span>
                        <button style={adS.approveBtn} onClick={e => { e.stopPropagation(); handleApprove(m.id); }}>승인</button>
                        <button style={adS.rejectBtn} onClick={e => { e.stopPropagation(); handleReject(m.id); }}>거부</button></>
                  }
                </div>
              </div>

              {isOpen && m.approved && (
                <div style={adS.menteeSection}>
                  <div style={adS.menteeSectionTitle}>배정된 멘티 ({mentees.length}/10)</div>
                  {mentees.length === 0 && <div style={adS.emptyMentee}>배정된 멘티가 없습니다.</div>}
                  {mentees.map(mt => {
                    const mScheds = db.schedules.filter(s => s.menteeId === mt.id);
                    const mDone = mScheds.filter(s => s.status === 'completed').length;
                    return (
                      <div key={mt.id} style={adS.menteeRow}>
                        <div style={{ flex: 1 }}>
                          <div style={adS.menteeName}>{mt.name}</div>
                          <div style={adS.menteeContact}>
                            {mt.contactName && <span>{mt.contactName}</span>}
                            {mt.contactPhone && <span> · {mt.contactPhone}</span>}
                          </div>
                        </div>
                        <span style={adS.menteeSchedInfo}>일정 {mScheds.length}건 · 완료 {mDone}건</span>
                        <button style={adS.removeBtn} onClick={() => handleRemoveMentee(mt.id, mt.name)}>삭제</button>
                      </div>
                    );
                  })}

                  {mentees.length < 10 && (
                    addingFor === m.id
                      ? <div style={adS.addMenteeForm}>
                          <div style={adS.addField}>
                            <label style={adS.addLabel}>업체명 *</label>
                            <input value={newForm.name} onChange={setF('name')} placeholder="(주)회사명" style={adS.addInput} autoFocus />
                          </div>
                          <div style={adS.addRow2}>
                            <div style={adS.addField}>
                              <label style={adS.addLabel}>담당자명</label>
                              <input value={newForm.contactName} onChange={setF('contactName')} placeholder="홍길동" style={adS.addInput} />
                            </div>
                            <div style={adS.addField}>
                              <label style={adS.addLabel}>전화번호</label>
                              <input value={newForm.contactPhone} onChange={setF('contactPhone')} placeholder="010-0000-0000" style={adS.addInput} />
                            </div>
                          </div>
                          <div style={adS.addBtnRow}>
                            <button style={adS.addConfirmBtn} onClick={() => handleAddMentee(m.id)}>추가</button>
                            <button style={adS.addCancelBtn} onClick={() => { setAddingFor(null); setNewForm({ name: '', contactName: '', contactPhone: '' }); }}>취소</button>
                          </div>
                        </div>
                      : <button style={adS.addMenteeBtn} onClick={() => setAddingFor(m.id)}>+ 멘티 추가</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Reports View ── */
const ReportsView = ({ db, onReportClick }) => {
  const [filterMentor, setFilterMentor] = React.useState('all');
  const [expanded, setExpanded] = React.useState({});

  const approvedMentors = db.users.filter(u => u.role === 'mentor' && u.approved);
  const displayMentors = filterMentor === 'all' ? approvedMentors : approvedMentors.filter(m => m.id === filterMentor);

  const toggleMentee = (key) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  const totalCompleted = db.schedules.filter(s => s.status === 'completed').length;

  return (
    <div style={adS.content}>
      <div style={adS.pageHeader}>
        <h2 style={adS.pageTitle}>보고서 확인</h2>
        <select value={filterMentor} onChange={e => setFilterMentor(e.target.value)} style={adS.filterSelect}>
          <option value="all">전체 멘토</option>
          {approvedMentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      <div style={adS.reportSummary}>완료된 멘토링 총 <strong>{totalCompleted}건</strong></div>

      {displayMentors.map(mentor => {
        const mentees = db.mentees.filter(mt => mt.mentorId === mentor.id);
        const mentorCompleted = db.schedules.filter(s => s.mentorId === mentor.id && s.status === 'completed');
        if (mentorCompleted.length === 0 && filterMentor !== mentor.id) return null;
        return (
          <div key={mentor.id} style={adS.reportMentorSection}>
            <div style={adS.reportMentorHeader}>
              <div style={adS.progressAvatar}>{mentor.name[0]}</div>
              <div style={{ flex: 1 }}>
                <span style={adS.reportMentorName}>{mentor.name}</span>
                <span style={adS.reportMentorCompany}> — {mentor.company}</span>
              </div>
              <span style={adS.reportMentorCount}>{mentorCompleted.length}건 완료</span>
            </div>

            {mentees.map(mt => {
              const mtCompleted = db.schedules
                .filter(s => s.menteeId === mt.id && s.status === 'completed')
                .sort((a, b) => b.date.localeCompare(a.date));
              if (mtCompleted.length === 0) return null;
              const key = mt.id;
              const isOpen = expanded[key] !== false;
              return (
                <div key={mt.id} style={adS.reportMenteeGroup}>
                  <div style={adS.reportMenteeHeader} onClick={() => toggleMentee(key)}>
                    <div>
                      <span style={adS.reportMenteeName}>{mt.name}</span>
                      {mt.contactName && <span style={adS.reportMenteeContact}> / {mt.contactName} {mt.contactPhone}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={adS.reportCount}>{mtCompleted.length}건</span>
                      <span style={adS.chevron}>{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {isOpen && mtCompleted.map(s => (
                    <div key={s.id} style={adS.reportRow}>
                      <span style={adS.reportDate}>{s.date.replace(/-/g, '. ')}</span>
                      <span style={adS.reportFile}>📄 {s.reportFilename}</span>
                      <span style={adS.reportPhotos}>📸 {s.photos.length}장</span>
                      <button style={adS.viewBtn} onClick={() => onReportClick({ scheduleId: s.id, mentorId: mentor.id, menteeId: mt.id })}>보기</button>
                    </div>
                  ))}
                </div>
              );
            })}

            {mentorCompleted.length === 0 && (
              <div style={adS.reportNoData}>완료된 멘토링이 없습니다.</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ── Report Detail PAGE (not modal) ── */
const ReportDetailPage = ({ view, db, onBack }) => {
  const [downloadFile, setDownloadFile] = React.useState(null);
  const [lightbox, setLightbox] = React.useState(null);

  const s = db.schedules.find(x => x.id === view.scheduleId);
  const mentor = db.users.find(u => u.id === view.mentorId);
  const mentee = db.mentees.find(m => m.id === view.menteeId);
  if (!s || !mentor || !mentee) return <div style={adS.content}><button onClick={onBack} style={adS.backBtn}>← 돌아가기</button></div>;

  return (
    <div style={adS.content}>
      <button onClick={onBack} style={adS.backBtn}>← 보고서 목록으로</button>
      <div style={adS.pageHeader}>
        <div>
          <h2 style={adS.pageTitle}>멘토링 보고서</h2>
          <div style={adS.detailHeroMeta}>{s.date.replace(/-/g, '. ')} · {mentor.name} → {mentee.name}</div>
        </div>
      </div>

      <div style={adS.reportDetailGrid}>
        <div style={adS.reportDetailCard}>
          <div style={adS.reportFieldLabel}>일자</div>
          <div style={adS.reportFieldValue}>{s.date.replace(/-/g, '. ')}</div>
        </div>
        <div style={adS.reportDetailCard}>
          <div style={adS.reportFieldLabel}>멘토</div>
          <div style={adS.reportFieldValue}>{mentor.name}</div>
          <div style={adS.reportFieldSub}>{mentor.company}</div>
        </div>
        <div style={adS.reportDetailCard}>
          <div style={adS.reportFieldLabel}>멘티</div>
          <div style={adS.reportFieldValue}>{mentee.name}</div>
          {mentee.contactName && <div style={adS.reportFieldSub}>{mentee.contactName} · {mentee.contactPhone}</div>}
        </div>
      </div>

      <div style={adS.section}>
        <h3 style={adS.sectionTitle}>제출 보고서</h3>
        <button style={adS.fileChipLg} onClick={() => setDownloadFile(s.reportFilename)}>
          <span style={{ fontSize: '18px' }}>📄</span>
          <span>{s.reportFilename}</span>
          <span style={adS.fileChipHint}>다운로드</span>
        </button>
      </div>

      <div style={adS.section}>
        <h3 style={adS.sectionTitle}>첨부 사진 <span style={adS.sectionHint}>{s.photos.length}장 · 클릭해서 크게 보기</span></h3>
        <div style={adS.photoGridLg}>
          {s.photos.map((p, i) => (
            <PhotoTile key={i} index={i} name={p}
              onClick={() => setLightbox({ photos: s.photos, index: i })} />
          ))}
        </div>
      </div>

      {downloadFile && <DownloadModal filename={downloadFile} onClose={() => setDownloadFile(null)} />}
      {lightbox && <Lightbox photos={lightbox.photos} index={lightbox.index} onClose={() => setLightbox(null)} />}
    </div>
  );
};

/* ── Styles ── */
const adS = {
  layout: { display: 'flex', minHeight: '100vh', background: 'var(--color-canvas)' },
  sidebar: { width: '260px', minHeight: '100vh', background: 'var(--t-topbar-bg)', color: 'var(--t-topbar-text)', borderRight: 'var(--t-topbar-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0, position: 'sticky', top: 0, alignSelf: 'flex-start', height: '100vh', boxShadow: 'var(--t-card-shadow)' },
  sideTop: { padding: '32px 24px 24px' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' },
  logoDot: { width: '32px', height: '32px', background: 'var(--t-topbar-text)', borderRadius: '8px', opacity: 0.95 },
  logoText: { fontSize: '16px', fontWeight: '500', color: 'var(--t-topbar-text)' },
  logoTextWrap: { display: 'flex', flexDirection: 'column', lineHeight: 1.2 },
  logoLine1: { fontSize: '11px', color: 'var(--t-topbar-text)', opacity: 0.7, fontWeight: '500', letterSpacing: '-0.2px' },
  logoLine2: { fontSize: '14px', color: 'var(--t-topbar-text)', fontWeight: '600', letterSpacing: '-0.3px' },
  adminBadge: { fontSize: '12px', color: 'var(--t-topbar-text)', opacity: 0.6, marginBottom: '32px', paddingLeft: '42px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px' },
  navBtn: { width: '100%', textAlign: 'left', padding: '12px 14px', background: 'transparent', border: 'none', borderRadius: 'var(--t-radius-button)', fontSize: '15px', color: 'var(--t-topbar-text)', opacity: 0.7, cursor: 'pointer', fontFamily: 'var(--font-sans)' },
  navBtnActive: { background: 'var(--t-nav-active-bg)', color: 'var(--t-topbar-text)', opacity: 1, fontWeight: '500' },
  sideBottom: { padding: '24px', borderTop: '1px solid var(--color-hairline-soft)' },
  sideUser: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' },
  avatar: { width: '38px', height: '38px', background: 'var(--color-ink)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '500', flexShrink: 0 },
  userName: { fontSize: '14px', fontWeight: '500', color: 'var(--color-ink)' },
  userSub: { fontSize: '12px', color: 'var(--color-ink-subtle)' },
  logoutBtn: { width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--color-hairline)', borderRadius: '8px', fontSize: '14px', color: 'var(--color-ink-muted)', cursor: 'pointer', fontFamily: 'var(--font-sans)' },
  main: { flex: 1, overflow: 'auto' },
  content: { padding: '48px 56px', maxWidth: '1360px', margin: '0 auto' },
  backBtn: { background: 'transparent', border: 'none', color: 'var(--color-ink-muted)', fontSize: '14px', cursor: 'pointer', padding: '0 0 24px', fontFamily: 'var(--font-sans)' },
  pageHeader: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px', gap: '24px' },
  pageTitle: { fontSize: '32px', fontWeight: 'var(--t-display-weight)', color: 'var(--color-ink)', margin: '0', letterSpacing: 'var(--t-display-tracking)' },
  pageDate: { fontSize: '14px', color: 'var(--color-ink-subtle)' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' },
  statCard: { background: 'var(--color-surface-1)', border: 'var(--t-card-border)', borderRadius: 'var(--t-radius-card)', padding: '24px 28px', boxShadow: 'var(--t-card-shadow)' },
  statLabel: { fontSize: '14px', color: 'var(--color-ink-subtle)', marginBottom: '12px' },
  statValue: { fontSize: '36px', fontWeight: 'var(--t-display-weight)', letterSpacing: 'var(--t-display-tracking)', color: 'var(--color-ink)', lineHeight: '1.1' },
  statSub: { fontSize: '13px', color: 'var(--color-ink-subtle)', marginTop: '8px' },

  section: { marginBottom: '40px' },
  sectionTitle: { fontSize: '18px', fontWeight: '500', color: 'var(--color-ink)', margin: '0 0 16px' },
  sectionHint: { fontSize: '13px', fontWeight: '400', color: 'var(--color-ink-subtle)', marginLeft: '8px' },

  alertList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  alertItem: { display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 22px', background: 'var(--color-surface-1)', border: 'var(--t-card-border)', borderRadius: 'var(--t-radius-card)', boxShadow: 'var(--t-card-shadow)' },
  alertDot: color => ({ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }),
  alertMain: { fontSize: '15px', color: 'var(--color-ink)', marginBottom: '4px' },
  alertSub: { fontSize: '13px', color: 'var(--color-ink-subtle)' },
  alertArrow: { color: 'var(--color-ink-muted)', fontSize: '16px' },

  progressList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  progressItem: { display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 24px', background: 'var(--color-surface-1)', border: 'var(--t-card-border)', borderRadius: 'var(--t-radius-card)', transition: 'border-color 0.15s', boxShadow: 'var(--t-card-shadow)' },
  progressLeft: { display: 'flex', alignItems: 'center', gap: '14px', minWidth: '260px' },
  progressAvatar: { width: '40px', height: '40px', background: 'var(--color-surface-2)', color: 'var(--color-ink)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '500', flexShrink: 0, border: '1px solid var(--color-hairline)' },
  progressName: { fontSize: '16px', fontWeight: '500', color: 'var(--color-ink)', marginBottom: '2px' },
  progressMeta: { fontSize: '13px', color: 'var(--color-ink-subtle)' },
  progressRight: { flex: 1, display: 'flex', alignItems: 'center', gap: '16px' },
  progressBarWrap: { flex: 1, height: '8px', background: 'var(--color-surface-2)', borderRadius: '999px', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: '999px', transition: 'width 0.4s', minWidth: '2px' },
  progressLabel: { fontSize: '14px', color: 'var(--color-ink)', minWidth: '110px', textAlign: 'right' },
  chevron: { fontSize: '16px', color: 'var(--color-ink-muted)' },

  bigProgressWrap: { height: '14px', background: 'var(--color-surface-2)', borderRadius: '999px', overflow: 'hidden' },
  bigProgressFill: { height: '100%', borderRadius: '999px', transition: 'width 0.4s' },

  subTabRow: { display: 'flex', gap: '8px', marginBottom: '24px' },
  subTab: { padding: '9px 18px', border: '1px solid var(--color-hairline)', borderRadius: '999px', background: 'transparent', fontSize: '14px', color: 'var(--color-ink-muted)', cursor: 'pointer', fontFamily: 'var(--font-sans)' },
  subTabActive: { background: 'var(--t-button-bg)', color: 'var(--t-button-text)', border: '1px solid var(--t-button-bg)' },

  mentorList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  mentorCard: { background: 'var(--color-surface-1)', border: 'var(--t-card-border)', borderRadius: 'var(--t-radius-card)', overflow: 'hidden', boxShadow: 'var(--t-card-shadow)' },
  mentorHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', cursor: 'pointer' },
  mentorLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  mentorName: { fontSize: '16px', fontWeight: '500', color: 'var(--color-ink)', marginBottom: '3px' },
  mentorPos: { fontSize: '13px', fontWeight: '400', color: 'var(--color-ink-muted)' },
  mentorMeta: { fontSize: '13px', color: 'var(--color-ink-subtle)' },
  mentorRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  badge: color => ({ fontSize: '12px', fontWeight: '500', padding: '4px 10px', borderRadius: '999px', background: color === 'green' ? '#dcfce7' : '#fef3c7', color: color === 'green' ? 'var(--color-semantic-success)' : '#92400e' }),
  metaChip: { fontSize: '13px', color: 'var(--color-ink-subtle)', background: 'var(--color-canvas)', padding: '4px 10px', borderRadius: '999px' },
  approveBtn: { padding: '7px 16px', background: 'var(--t-button-bg)', color: 'var(--t-button-text)', border: 'none', borderRadius: 'var(--t-radius-button)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-sans)' },
  rejectBtn: { padding: '7px 16px', background: 'transparent', color: 'var(--color-semantic-error)', border: '1px solid var(--color-semantic-error)', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-sans)' },

  menteeSection: { borderTop: '1px solid var(--color-hairline-soft)', padding: '20px 24px', background: 'var(--color-canvas)' },
  menteeSectionTitle: { fontSize: '12px', fontWeight: '500', color: 'var(--color-ink-subtle)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  emptyMentee: { fontSize: '14px', color: 'var(--color-ink-subtle)', padding: '6px 0 12px' },
  menteeRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--color-hairline-soft)' },
  menteeName: { fontSize: '14px', fontWeight: '500', color: 'var(--color-ink)' },
  menteeContact: { fontSize: '12px', color: 'var(--color-ink-subtle)', marginTop: '3px' },
  menteeSchedInfo: { fontSize: '13px', color: 'var(--color-ink-subtle)', whiteSpace: 'nowrap' },
  removeBtn: { fontSize: '13px', color: 'var(--color-semantic-error)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', padding: '4px 6px', whiteSpace: 'nowrap' },

  addMenteeForm: { marginTop: '16px', padding: '18px', background: 'var(--color-surface-1)', border: '1px solid var(--color-hairline)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px' },
  addField: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  addLabel: { fontSize: '12px', fontWeight: '500', color: 'var(--color-ink-muted)' },
  addRow2: { display: 'flex', gap: '12px' },
  addInput: { padding: '9px 12px', border: '1px solid var(--color-hairline)', borderRadius: '8px', fontSize: '14px', fontFamily: 'var(--font-sans)', outline: 'none', width: '100%', boxSizing: 'border-box' },
  addBtnRow: { display: 'flex', gap: '8px' },
  addConfirmBtn: { padding: '9px 18px', background: 'var(--t-button-bg)', color: 'var(--t-button-text)', border: 'none', borderRadius: 'var(--t-radius-button)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-sans)' },
  addCancelBtn: { padding: '9px 14px', background: 'transparent', color: 'var(--color-ink-muted)', border: '1px solid var(--color-hairline)', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--font-sans)' },
  addMenteeBtn: { marginTop: '14px', padding: '9px 18px', background: 'transparent', color: 'var(--color-ink)', border: '1px dashed var(--color-hairline)', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--font-sans)' },

  emptyState: { padding: '56px', textAlign: 'center', color: 'var(--color-ink-subtle)', fontSize: '15px' },
  filterSelect: { padding: '10px 14px', border: '1px solid var(--color-hairline)', borderRadius: '8px', fontSize: '14px', fontFamily: 'var(--font-sans)', background: '#fff', color: 'var(--color-ink)', cursor: 'pointer', outline: 'none' },
  reportSummary: { fontSize: '14px', color: 'var(--color-ink-muted)', marginBottom: '24px' },

  reportMentorSection: { background: 'var(--color-surface-1)', border: 'var(--t-card-border)', borderRadius: 'var(--t-radius-card)', marginBottom: '16px', overflow: 'hidden', boxShadow: 'var(--t-card-shadow)' },
  reportMentorHeader: { display: 'flex', alignItems: 'center', gap: '14px', padding: '20px 24px', borderBottom: '1px solid var(--color-hairline-soft)' },
  reportMentorName: { fontSize: '17px', fontWeight: '500', color: 'var(--color-ink)' },
  reportMentorCompany: { fontSize: '14px', color: 'var(--color-ink-muted)' },
  reportMentorCount: { fontSize: '14px', color: 'var(--color-ink-subtle)', marginLeft: 'auto' },
  reportMenteeGroup: { borderBottom: '1px solid var(--color-hairline-soft)' },
  reportMenteeHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', cursor: 'pointer', background: 'var(--color-canvas)' },
  reportMenteeName: { fontSize: '14px', fontWeight: '500', color: 'var(--color-ink)' },
  reportMenteeContact: { fontSize: '13px', color: 'var(--color-ink-subtle)' },
  reportCount: { fontSize: '13px', color: 'var(--color-ink-subtle)', background: 'var(--color-surface-2)', padding: '3px 10px', borderRadius: '999px' },
  reportRow: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 24px 14px 40px', borderTop: '1px solid var(--color-hairline-soft)' },
  reportDate: { fontSize: '14px', color: 'var(--color-ink)', minWidth: '110px' },
  reportFile: { fontSize: '13px', color: 'var(--color-ink-muted)', flex: 1 },
  reportPhotos: { fontSize: '13px', color: 'var(--color-ink-subtle)' },
  reportNoData: { padding: '20px 24px', fontSize: '14px', color: 'var(--color-ink-subtle)' },
  viewBtn: { padding: '7px 16px', background: 'transparent', border: '1px solid var(--color-hairline)', borderRadius: '8px', fontSize: '13px', color: 'var(--color-ink)', cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' },

  /* Detail page hero */
  detailHero: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' },
  detailHeroLeft: { display: 'flex', alignItems: 'center', gap: '20px' },
  detailHeroAvatar: { width: '64px', height: '64px', background: 'var(--color-ink)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '500' },
  detailHeroPos: { fontSize: '18px', fontWeight: '400', color: 'var(--color-ink-muted)', marginLeft: '8px' },
  detailHeroMeta: { fontSize: '14px', color: 'var(--color-ink-subtle)', marginTop: '6px' },

  detailMenteeCard: { border: '1px solid var(--color-hairline)', borderRadius: '12px', overflow: 'hidden', background: 'var(--color-surface-1)' },
  detailMenteeHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--color-canvas)', borderBottom: '1px solid var(--color-hairline-soft)' },
  detailMenteeName: { fontSize: '16px', fontWeight: '500', color: 'var(--color-ink)', marginBottom: '4px' },
  detailMenteeContact: { fontSize: '13px', color: 'var(--color-ink-subtle)' },
  detailMenteeBadge: { fontSize: '14px', fontWeight: '500', color: 'var(--color-ink)', background: 'var(--color-surface-1)', padding: '5px 12px', borderRadius: '999px', border: '1px solid var(--color-hairline)', whiteSpace: 'nowrap' },
  detailNoSched: { padding: '14px 20px', fontSize: '13px', color: 'var(--color-ink-subtle)' },
  detailSchedRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderTop: '1px solid var(--color-hairline-soft)' },
  detailSchedDate: { fontSize: '14px', color: 'var(--color-ink)', minWidth: '100px' },
  statusBadge: done => ({ fontSize: '12px', fontWeight: '500', padding: '3px 10px', borderRadius: '999px', background: done ? '#dcfce7' : '#dbeafe', color: done ? 'var(--color-semantic-success)' : 'var(--color-report-blue)', whiteSpace: 'nowrap' }),
  detailFile: { fontSize: '13px', color: 'var(--color-ink-muted)', flex: 1 },
  detailPhoto: { fontSize: '13px', color: 'var(--color-ink-subtle)' },

  reportDetailGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' },
  reportDetailCard: { background: 'var(--color-surface-1)', border: '1px solid var(--color-hairline)', borderRadius: '12px', padding: '20px 24px' },
  reportFieldLabel: { fontSize: '13px', color: 'var(--color-ink-subtle)', marginBottom: '8px' },
  reportFieldValue: { fontSize: '18px', fontWeight: '500', color: 'var(--color-ink)' },
  reportFieldSub: { fontSize: '13px', color: 'var(--color-ink-subtle)', marginTop: '4px' },
  fileChipLg: { display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: 'var(--color-report-blue)', background: '#eff6ff', padding: '14px 22px', borderRadius: '10px', border: '1px solid #c7d2fe', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: '500' },
  fileChipHint: { fontSize: '12px', color: 'var(--color-ink-muted)', marginLeft: '6px', fontWeight: '400' },

  photoGridLg: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' },
  photoTile: { position: 'relative', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', aspectRatio: '4 / 3', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.15s' },
  photoTileNum: { fontSize: '22px', fontWeight: '600', color: '#fff', letterSpacing: '-0.4px', textShadow: '0 1px 3px rgba(0,0,0,0.2)' },
  photoTileLabel: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: '8px 12px', fontSize: '11px', color: '#fff', background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', wordBreak: 'break-all' },

  detailFileBtn: { background: '#eff6ff', border: '1px solid #c7d2fe', color: 'var(--color-report-blue)', fontSize: '13px', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-sans)', flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  detailPhotoBtn: { background: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)', color: 'var(--color-ink)', fontSize: '13px', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-sans)' },

  /* Lightbox */
  lbOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '40px' },
  lbClose: { position: 'absolute', top: '24px', right: '32px', background: 'transparent', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer', padding: '8px', lineHeight: 1, fontFamily: 'var(--font-sans)' },
  lbInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '90vw', maxHeight: '90vh' },
  lbPlaceholder: { width: 'min(900px, 80vw)', aspectRatio: '4 / 3', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' },
  lbPhotoLabel: { fontSize: '80px', fontWeight: '600', color: '#fff', letterSpacing: '-2px', textShadow: '0 2px 12px rgba(0,0,0,0.3)' },
  lbImg: { maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' },
  lbCaption: { color: '#fff', fontSize: '14px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '16px' },
  lbCounter: { background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '999px', fontSize: '13px', opacity: 1 },
  lbNav: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', width: '52px', height: '52px', borderRadius: '50%', fontSize: '32px', cursor: 'pointer', fontFamily: 'var(--font-sans)', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },

  /* Download modal */
  dlOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  dlModal: { background: '#fff', borderRadius: '16px', padding: '32px 36px', minWidth: '360px', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center' },
  dlIcon: { width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px', color: 'var(--color-report-blue)' },
  dlTitle: { fontSize: '18px', fontWeight: '500', color: 'var(--color-ink)', marginBottom: '8px' },
  dlFile: { fontSize: '13px', color: 'var(--color-ink-muted)', marginBottom: '20px', wordBreak: 'break-all' },
  dlBar: { height: '6px', background: 'var(--color-surface-2)', borderRadius: '999px', overflow: 'hidden', marginBottom: '20px' },
  dlBarFill: { height: '100%', width: '70%', background: 'var(--color-report-blue)', borderRadius: '999px', animation: 'none' },
  dlBtn: { padding: '10px 24px', background: 'var(--t-button-bg)', color: 'var(--t-button-text)', border: 'none', borderRadius: 'var(--t-radius-button)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-sans)' },
};

Object.assign(window, { AdminApp, stockPhoto, Lightbox, DownloadModal, PhotoTile });
