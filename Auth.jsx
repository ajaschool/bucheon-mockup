/* ── Auth.jsx — Login / Signup / Pending screens ── */

const LoginPage = ({ onLogin, onSignup }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const user = window.DB.findUser(email.trim(), password);
    if (!user) { setError('이메일 또는 비밀번호가 올바르지 않습니다.'); return; }
    onLogin(user);
  };

  return (
    <div style={authS.page}>
      <div style={authS.card}>
        <div style={authS.brandRow}>
          <div style={authS.brandDot}></div>
          <span style={authS.brandName}>2026 부천문화콘텐츠 성장지원플랫폼</span>
        </div>
        <h1 style={authS.title}>로그인</h1>
        <p style={authS.sub}>멘토링 관리 시스템에 오신 것을 환영합니다</p>
        <form onSubmit={handleSubmit} style={authS.form}>
          <div style={authS.field}>
            <label style={authS.label}>이메일</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="이메일 주소" required style={authS.input} />
          </div>
          <div style={authS.field}>
            <label style={authS.label}>비밀번호</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="비밀번호" required style={authS.input} />
          </div>
          {error && <p style={authS.errorMsg}>{error}</p>}
          <button type="submit" style={authS.btnPrimary}>로그인</button>
        </form>
        <div style={authS.divider}></div>
        <div style={authS.footerRow}>
          <span style={authS.footerText}>멘토로 참여하시나요?</span>
          <button onClick={onSignup} style={authS.linkBtn}>회원가입 신청</button>
        </div>
        <div style={authS.hint}>
          <p style={authS.hintTitle}>테스트 계정</p>
          <p style={authS.hintRow}>관리자: admin@bucheon.kr / admin123</p>
          <p style={authS.hintRow}>멘토: mentor1@test.com / mentor123</p>
          <p style={authS.hintRow}>대기: mentor4@test.com / mentor123</p>
        </div>
      </div>
    </div>
  );
};

const SignupPage = ({ onBack }) => {
  const [form, setForm] = React.useState({ company: '', name: '', phone: '', position: '', email: '', password: '', confirm: '' });
  const [error, setError] = React.useState('');
  const [done, setDone] = React.useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (form.password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return; }
    const result = window.DB.createUser({ company: form.company, name: form.name, phone: form.phone, position: form.position, email: form.email.trim(), password: form.password });
    if (!result) { setError('이미 사용 중인 이메일입니다.'); return; }
    setDone(true);
  };

  if (done) return (
    <div style={authS.page}>
      <div style={{ ...authS.card, textAlign: 'center' }}>
        <div style={authS.successCircle}>✓</div>
        <h1 style={{ ...authS.title, textAlign: 'center' }}>신청 완료</h1>
        <p style={{ ...authS.sub, textAlign: 'center' }}>
          멘토 등록 신청이 접수되었습니다.<br />관리자 승인 후 로그인하실 수 있습니다.
        </p>
        <button onClick={onBack} style={authS.btnPrimary}>로그인 화면으로</button>
      </div>
    </div>
  );

  return (
    <div style={authS.page}>
      <div style={{ ...authS.card, maxWidth: '500px' }}>
        <button onClick={onBack} style={authS.backBtn}>← 뒤로</button>
        <h1 style={authS.title}>멘토 회원가입</h1>
        <p style={authS.sub}>아래 정보를 입력해 멘토 등록을 신청하세요</p>
        <form onSubmit={handleSubmit} style={authS.form}>
          <div style={authS.row2}>
            <div style={authS.field}>
              <label style={authS.label}>업체명</label>
              <input value={form.company} onChange={set('company')} placeholder="(주)회사명" required style={authS.input} />
            </div>
            <div style={authS.field}>
              <label style={authS.label}>담당자명</label>
              <input value={form.name} onChange={set('name')} placeholder="홍길동" required style={authS.input} />
            </div>
          </div>
          <div style={authS.row2}>
            <div style={authS.field}>
              <label style={authS.label}>전화번호</label>
              <input value={form.phone} onChange={set('phone')} placeholder="010-0000-0000" required style={authS.input} />
            </div>
            <div style={authS.field}>
              <label style={authS.label}>직급</label>
              <input value={form.position} onChange={set('position')} placeholder="팀장" required style={authS.input} />
            </div>
          </div>
          <div style={authS.field}>
            <label style={authS.label}>이메일</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="example@company.com" required style={authS.input} />
          </div>
          <div style={authS.row2}>
            <div style={authS.field}>
              <label style={authS.label}>비밀번호</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="6자 이상" required style={authS.input} />
            </div>
            <div style={authS.field}>
              <label style={authS.label}>비밀번호 확인</label>
              <input type="password" value={form.confirm} onChange={set('confirm')} required style={authS.input} />
            </div>
          </div>
          {error && <p style={authS.errorMsg}>{error}</p>}
          <button type="submit" style={authS.btnPrimary}>회원가입 신청</button>
        </form>
      </div>
    </div>
  );
};

const PendingPage = ({ user, onLogout }) => (
  <div style={authS.page}>
    <div style={{ ...authS.card, textAlign: 'center' }}>
      <div style={authS.pendingIcon}>⏳</div>
      <h1 style={{ ...authS.title, textAlign: 'center' }}>승인 대기 중</h1>
      <p style={{ ...authS.sub, textAlign: 'center' }}>
        <strong>{user.company}</strong>의 <strong>{user.name}</strong>님,<br />
        관리자 승인 후 서비스를 이용하실 수 있습니다.<br />
        승인까지 영업일 기준 1~2일 소요됩니다.
      </p>
      <button onClick={onLogout} style={authS.btnSecondary}>로그아웃</button>
    </div>
  </div>
);

const authS = {
  page: { minHeight: '100vh', background: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
  card: { background: 'var(--color-surface-1)', border: 'var(--t-card-border)', borderRadius: 'var(--t-radius-card-lg)', padding: '48px', width: '100%', maxWidth: '420px', boxShadow: 'var(--t-card-shadow-lifted)' },
  brandRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' },
  brandDot: { width: '30px', height: '30px', background: 'var(--t-button-bg)', borderRadius: 'var(--t-radius-button)' },
  brandName: { fontSize: '15px', fontWeight: '500', color: 'var(--color-ink)' },
  title: { fontSize: '24px', fontWeight: '500', color: 'var(--color-ink)', margin: '0 0 8px', letterSpacing: '-0.4px' },
  sub: { fontSize: '14px', color: 'var(--color-ink-muted)', margin: '0 0 28px', lineHeight: '1.6' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  row2: { display: 'flex', gap: '12px' },
  label: { fontSize: '13px', fontWeight: '500', color: 'var(--color-ink)' },
  input: { padding: '10px 12px', border: '1px solid var(--color-hairline)', borderRadius: '8px', fontSize: '14px', color: 'var(--color-ink)', background: '#fff', outline: 'none', fontFamily: 'var(--font-sans)', width: '100%', boxSizing: 'border-box' },
  btnPrimary: { padding: '12px', background: 'var(--t-button-bg)', color: 'var(--t-button-text)', border: 'none', borderRadius: 'var(--t-radius-button)', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-sans)', marginTop: '4px' },
  btnSecondary: { padding: '12px 24px', background: 'transparent', color: 'var(--color-ink)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--t-radius-button)', fontSize: '15px', fontWeight: '500', cursor: 'pointer', fontFamily: 'var(--font-sans)' },
  errorMsg: { fontSize: '13px', color: 'var(--color-semantic-error)', margin: '0' },
  divider: { height: '1px', background: 'var(--color-hairline-soft)', margin: '24px 0' },
  footerRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  footerText: { fontSize: '14px', color: 'var(--color-ink-muted)' },
  linkBtn: { background: 'none', border: 'none', fontSize: '14px', fontWeight: '500', color: 'var(--color-ink)', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--font-sans)', padding: '0' },
  backBtn: { background: 'none', border: 'none', fontSize: '14px', color: 'var(--color-ink-muted)', cursor: 'pointer', padding: '0', marginBottom: '24px', fontFamily: 'var(--font-sans)' },
  hint: { marginTop: '24px', padding: '14px 16px', background: 'var(--color-canvas)', borderRadius: '8px' },
  hintTitle: { fontSize: '11px', fontWeight: '500', color: 'var(--color-ink-subtle)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  hintRow: { fontSize: '12px', color: 'var(--color-ink-muted)', margin: '3px 0' },
  successCircle: { width: '56px', height: '56px', background: 'var(--color-semantic-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#fff', margin: '0 auto 24px' },
  pendingIcon: { fontSize: '44px', marginBottom: '20px' },
};

Object.assign(window, { LoginPage, SignupPage, PendingPage });
