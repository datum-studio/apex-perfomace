// ============================================================
// APEX Performance System — Firebase Config
// Projeto: apex-bsb
// Datum Studio
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyDFk2uBHxsjThFPNFp5CPtbYqbZB_arX98",
  authDomain: "apex-bsb.firebaseapp.com",
  projectId: "apex-bsb",
  storageBucket: "apex-bsb.firebasestorage.app",
  messagingSenderId: "1000929897504",
  appId: "1:1000929897504:web:2cfc686f3c8b9f9cd6e045"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ============================================================
// UTILITÁRIOS GLOBAIS
// ============================================================
function formatCurrency(cents) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

function formatDate(date) {
  if (!date) return '-';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('pt-BR');
}

function getMonthName(month) {
  const names = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                 'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  return names[month - 1] || '-';
}

function getCurrentYearMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function getCycleId(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function getOrCreateCurrentCycle() {
  const { year, month } = getCurrentYearMonth();
  const cycleId = getCycleId(year, month);
  const ref = db.collection('cycles').doc(cycleId);
  return ref.get().then(doc => {
    if (!doc.exists) {
      const data = {
        id: cycleId, year, month,
        status: 'active',
        totalRevenue: 0,
        flagLevel: 0,
        flagPercentage: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      return ref.set(data).then(() => data);
    }
    return { id: doc.id, ...doc.data() };
  });
}

function requireAuth(callback) {
  auth.onAuthStateChanged(user => {
    if (!user) { window.location.href = 'index.html'; return; }
    db.collection('users').doc(user.uid).get().then(doc => {
      if (!doc.exists) {
        auth.signOut().then(() => window.location.href = 'index.html');
        return;
      }
      callback({ uid: user.uid, email: user.email, ...doc.data() });
    });
  });
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast toast-${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function getScoreColor(score) {
  if (score === null || score === undefined) return '#8891a8';
  if (score >= 85) return '#10b981';
  if (score >= 70) return '#4f6ef7';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function getScoreLabel(score, lateCount) {
  if (score === null || score === undefined) return { label: 'Pendente', color: '#8891a8' };
  if (lateCount >= 3) return { label: 'Bloqueado', color: '#ef4444' };
  if (score >= 85) return { label: 'Excelente', color: '#10b981' };
  if (score >= 70) return { label: 'Elegível', color: '#4f6ef7' };
  if (score >= 50) return { label: 'Atenção', color: '#f59e0b' };
  return { label: 'Berlinda', color: '#ef4444' };
}
