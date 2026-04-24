import { useState, useEffect, useRef } from "react";

const CATEGORIES = [
  { id: "geo", name: "Géographie", icon: "🗺️", color: "#16A34A", desc: "Capitales, villes, fleuves, régions" },
  { id: "histoire", name: "Histoire", icon: "📜", color: "#DC2626", desc: "Colonisation, indépendance, grandes dates" },
  { id: "politique", name: "Politique", icon: "🏛️", color: "#2563EB", desc: "Présidents, institutions, élections" },
  { id: "culture", name: "Culture", icon: "🎭", color: "#7C3AED", desc: "Traditions, masques, danses, fêtes" },
  { id: "ethnies", name: "Ethnies & Peuples", icon: "👥", color: "#D97706", desc: "Akan, Krou, Mandé, langues" },
  { id: "musique", name: "Musique", icon: "🎵", color: "#0891B2", desc: "Coupé-décalé, Zouglou, artistes" },
  { id: "cinema", name: "Cinéma & TV", icon: "🎬", color: "#BE185D", desc: "Acteurs, réalisateurs, séries" },
  { id: "sport", name: "Sport", icon: "⚽", color: "#1D4ED8", desc: "Football, CAN, champions olympiques" },
  { id: "economie", name: "Économie", icon: "💰", color: "#15803D", desc: "Cacao, café, monnaie, exportations" },
  { id: "villes", name: "Villes & Monuments", icon: "🏙️", color: "#374151", desc: "Abidjan, Yamoussoukro, ponts" },
  { id: "gastro", name: "Gastronomie", icon: "🍽️", color: "#B45309", desc: "Attiéké, garba, kedjenou, alloco" },
  { id: "nature", name: "Nature & Animaux", icon: "🐘", color: "#065F46", desc: "Parcs, faune, forêts tropicales" },
  { id: "education", name: "Éducation & Sciences", icon: "🎓", color: "#1E3A8A", desc: "Universités, chercheurs, découvertes" },
  { id: "populaire", name: "Culture Populaire", icon: "😄", color: "#9D174D", desc: "Expressions, argot, humour ivoirien" },
  { id: "afrique", name: "Afrique Générale", icon: "🌍", color: "#78350F", desc: "Histoire et géographie africaine" },
];

const LEVELS = [
  { id: "debutant", name: "Débutant", icon: "⭐", color: "#22C55E", dark: "#15803D", questions: 8, time: 30, desc: "Questions simples et bien connues", xpMult: 1 },
  { id: "intermediaire", name: "Intermédiaire", icon: "⭐⭐", color: "#F59E0B", dark: "#B45309", questions: 10, time: 20, desc: "Culture générale moyenne", xpMult: 1.5 },
  { id: "avance", name: "Avancé", icon: "⭐⭐⭐", color: "#EF4444", dark: "#B91C1C", questions: 12, time: 15, desc: "Connaissances approfondies", xpMult: 2 },
  { id: "expert", name: "Expert", icon: "👑", color: "#A855F7", dark: "#7E22CE", questions: 10, time: 10, desc: "Pour les vrais champions", xpMult: 3 },
];

const BADGES = [
  { id: "first_game", name: "Premier Pas", icon: "🥉", desc: "Première partie jouée", check: (s) => s.gamesPlayed >= 1 },
  { id: "score_100", name: "Centenaire", icon: "💯", desc: "100 XP accumulés", check: (s) => s.totalXP >= 100 },
  { id: "score_500", name: "Demi-millier", icon: "🌟", desc: "500 XP accumulés", check: (s) => s.totalXP >= 500 },
  { id: "streak_3", name: "En Feu", icon: "🔥", desc: "3 bonnes réponses d'affilée", check: (s) => s.bestStreak >= 3 },
  { id: "streak_5", name: "Inarrêtable", icon: "⚡", desc: "5 bonnes réponses d'affilée", check: (s) => s.bestStreak >= 5 },
  { id: "streak_10", name: "Légendaire", icon: "🌪️", desc: "10 bonnes réponses d'affilée", check: (s) => s.bestStreak >= 10 },
  { id: "perfect", name: "Parfait", icon: "💎", desc: "Score parfait sur une partie", check: (s) => s.perfectGames >= 1 },
  { id: "expert_win", name: "Expert Suprême", icon: "👑", desc: "Terminer une partie Expert", check: (s) => s.expertGames >= 1 },
  { id: "games_5", name: "Régulier", icon: "🎮", desc: "5 parties jouées", check: (s) => s.gamesPlayed >= 5 },
  { id: "games_10", name: "Habitué", icon: "🕹️", desc: "10 parties jouées", check: (s) => s.gamesPlayed >= 10 },
  { id: "explorer", name: "Explorateur", icon: "🗺️", desc: "5 catégories différentes", check: (s) => (s.cats || []).length >= 5 },
  { id: "encyclopedist", name: "Encyclopédiste", icon: "📚", desc: "Toutes les catégories jouées", check: (s) => (s.cats || []).length >= 15 },
];

function getLevelInfo(xp) {
  const tiers = [
    { min: 0, max: 99, level: 1, title: "Novice", color: "#6B7280" },
    { min: 100, max: 299, level: 2, title: "Apprenti", color: "#22C55E" },
    { min: 300, max: 599, level: 3, title: "Initié", color: "#F59E0B" },
    { min: 600, max: 999, level: 4, title: "Érudit", color: "#EF4444" },
    { min: 1000, max: 1999, level: 5, title: "Sage", color: "#A855F7" },
    { min: 2000, max: 3999, level: 6, title: "Expert", color: "#EC4899" },
    { min: 4000, max: Infinity, level: 7, title: "Maître Ivoirien", color: "#F76B1C" },
  ];
  return tiers.find((t) => xp >= t.min && xp <= t.max) || tiers[0];
}

const DEFAULT_STATS = { totalXP: 0, gamesPlayed: 0, bestStreak: 0, perfectGames: 0, expertGames: 0, cats: [], badges: [] };

const S = {
  wrap: { minHeight: "100vh", background: "linear-gradient(160deg,#0D1A0D 0%,#1A0A02 60%,#0A1020 100%)", fontFamily: "Georgia, 'Times New Roman', serif", color: "#FFF5E0", position: "relative", overflow: "hidden" },
  flag: { height: 5, background: "linear-gradient(90deg,#F76B1C 33.3%,#fff 33.3% 66.6%,#1E7C4A 66.6%)", position: "fixed", top: 0, left: 0, right: 0, zIndex: 200 },
  page: { maxWidth: 480, margin: "0 auto", padding: "20px 16px 40px", paddingTop: 25 },
  card: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: "20px", backdropFilter: "blur(12px)" },
  btn: { fontFamily: "Georgia, serif", cursor: "pointer", border: "none", borderRadius: 14, fontWeight: "bold", transition: "transform 0.15s, opacity 0.15s" },
  back: { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#FFF5E0", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 15 },
};

export default function QuizIvoirien() {
  const [screen, setScreen] = useState("home");
  const [cat, setCat] = useState(null);
  const [lvl, setLvl] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answered, setAnswered] = useState(null);
  const [selAns, setSelAns] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [lb, setLb] = useState([]);
  const [gameResult, setGameResult] = useState(null);
  const [newBadges, setNewBadges] = useState([]);
  const timerRef = useRef(null);
  const pendingRef = useRef(false);
  const gameVars = useRef({ score: 0, streak: 0, maxStreak: 0, correct: 0, timeLeft: 30 });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const s = await window.storage.get("iq_stats");
      if (s) setStats(JSON.parse(s.value));
      const l = await window.storage.get("iq_lb");
      if (l) setLb(JSON.parse(l.value));
    } catch (_) {}
  }

  async function saveStats(ns) { try { await window.storage.set("iq_stats", JSON.stringify(ns)); } catch (_) {} }
  async function saveLb(nl) { try { await window.storage.set("iq_lb", JSON.stringify(nl)); } catch (_) {} }

  useEffect(() => {
    if (screen !== "quiz" || !questions.length) return;
    pendingRef.current = false;
    const tl = lvl?.time || 30;
    setTimeLeft(tl);
    gameVars.current.timeLeft = tl;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      gameVars.current.timeLeft = Math.max(0, gameVars.current.timeLeft - 1);
      setTimeLeft(gameVars.current.timeLeft);
      if (gameVars.current.timeLeft <= 0) {
        clearInterval(timerRef.current);
        if (!pendingRef.current) {
          pendingRef.current = true;
          setAnswered("timeout");
          gameVars.current.streak = 0;
          setStreak(0);
          setTimeout(() => doMoveNext(), 2200);
        }
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [qIdx, screen]);

  function handleAnswer(idx) {
    if (answered !== null || pendingRef.current) return;
    clearInterval(timerRef.current);
    pendingRef.current = true;
    const q = questions[qIdx];
    const isOk = idx === q.correct;
    setSelAns(idx);
    setAnswered(isOk ? "correct" : "wrong");
    if (isOk) {
      const tBonus = Math.floor(gameVars.current.timeLeft * 0.6);
      const sBonus = gameVars.current.streak * 4;
      const pts = Math.round((10 + tBonus + sBonus) * (lvl?.xpMult || 1));
      gameVars.current.score += pts;
      gameVars.current.streak += 1;
      gameVars.current.correct += 1;
      gameVars.current.maxStreak = Math.max(gameVars.current.maxStreak, gameVars.current.streak);
      setScore(gameVars.current.score);
      setStreak(gameVars.current.streak);
      setCorrect(gameVars.current.correct);
      setMaxStreak(gameVars.current.maxStreak);
    } else {
      gameVars.current.streak = 0;
      setStreak(0);
    }
    setTimeout(() => doMoveNext(), 2400);
  }

  function doMoveNext() {
    setAnswered(null);
    setSelAns(null);
    pendingRef.current = false;
    const next = qIdx + 1;
    if (next >= questions.length) {
      doFinish();
    } else {
      setQIdx(next);
    }
  }

  async function doFinish() {
    const { score: sc, correct: cr, maxStreak: ms } = gameVars.current;
    const total = questions.length;
    const isPerfect = cr === total;
    const isExpert = lvl?.id === "expert";
    const newStats = {
      ...stats,
      totalXP: (stats.totalXP || 0) + sc,
      gamesPlayed: (stats.gamesPlayed || 0) + 1,
      bestStreak: Math.max(stats.bestStreak || 0, ms),
      perfectGames: isPerfect ? (stats.perfectGames || 0) + 1 : (stats.perfectGames || 0),
      expertGames: isExpert ? (stats.expertGames || 0) + 1 : (stats.expertGames || 0),
      cats: [...new Set([...(stats.cats || []), cat?.id])],
    };
    const earned = BADGES.filter((b) => !(stats.badges || []).includes(b.id) && b.check(newStats)).map((b) => b.id);
    newStats.badges = [...(stats.badges || []), ...earned];
    setStats(newStats);
    setNewBadges(earned.map((id) => BADGES.find((b) => b.id === id)).filter(Boolean));
    await saveStats(newStats);
    const entry = { score: sc, correct: cr, total, cat: cat?.name, lvl: lvl?.name, date: new Date().toLocaleDateString("fr-FR") };
    const newLb = [entry, ...lb].sort((a, b) => b.score - a.score).slice(0, 10);
    setLb(newLb);
    await saveLb(newLb);
    setGameResult({ score: sc, correct: cr, total, isPerfect });
    setScreen("results");
  }

  async function startQuiz(selectedCat, selectedLvl) {
    setLoading(true);
    setError("");
    const prompt = `Tu es un expert du quiz ivoirien. Génère exactement ${selectedLvl.questions} questions sur "${selectedCat.name}" pour la Côte d'Ivoire, niveau "${selectedLvl.name}".

RETOURNE UNIQUEMENT CE JSON EXACT (aucun texte avant ou après, aucun markdown):
{"questions":[{"question":"texte de la question?","type":"mcq","options":["Option A","Option B","Option C","Option D"],"correct":0,"explanation":"Explication courte."},{"question":"Vrai ou faux: affirmation.","type":"true_false","options":["Vrai","Faux"],"correct":0,"explanation":"Explication."}]}

Règles STRICTES:
- ${selectedLvl.id==="debutant"?"Questions très simples et connues de tous":selectedLvl.id==="intermediaire"?"Questions de culture générale moyenne":selectedLvl.id==="avance"?"Questions difficiles nécessitant des connaissances solides":"Questions très pointues réservées aux experts absolus"}
- "correct" = index de la bonne réponse (0-3 pour mcq, 0=Vrai ou 1=Faux pour true_false)
- Minimum 65% MCQ, 35% vrai/faux
- TOUTES les questions doivent être 100% factuellement exactes
- Questions diversifiées et intéressantes sur "${selectedCat.name}"
- Explications claires et instructives`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 3000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const raw = data.content[0].text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(raw);
      setCat(selectedCat);
      setLvl(selectedLvl);
      setQuestions(parsed.questions);
      setQIdx(0);
      setScore(0); setStreak(0); setMaxStreak(0); setCorrect(0);
      setAnswered(null); setSelAns(null);
      gameVars.current = { score: 0, streak: 0, maxStreak: 0, correct: 0, timeLeft: selectedLvl.time };
      setLoading(false);
      setScreen("quiz");
    } catch (e) {
      setError("Erreur de connexion. Vérifiez votre réseau et réessayez.");
      setLoading(false);
    }
  }

  function goHome() {
    setScreen("home"); setCat(null); setLvl(null); setQuestions([]);
    setQIdx(0); setScore(0); setStreak(0); setMaxStreak(0); setCorrect(0);
    setAnswered(null); setSelAns(null); setNewBadges([]); setGameResult(null); setError("");
    clearInterval(timerRef.current);
  }

  return (
    <div style={S.wrap}>
      <div style={S.flag} />
      <BgPattern />
      {screen === "home" && <HomeScreen stats={stats} onStart={() => setScreen("cats")} onLb={() => setScreen("lb")} onBadges={() => setScreen("badges")} />}
      {screen === "cats" && <CatsScreen categories={CATEGORIES} onSelect={(c) => { setCat(c); setScreen("levels"); }} onBack={goHome} />}
      {screen === "levels" && <LevelsScreen cat={cat} levels={LEVELS} onStart={(l) => startQuiz(cat, l)} loading={loading} error={error} onBack={() => setScreen("cats")} />}
      {screen === "quiz" && questions.length > 0 && <QuizScreen question={questions[qIdx]} qIdx={qIdx} total={questions.length} score={score} streak={streak} timeLeft={timeLeft} lvl={lvl} cat={cat} answered={answered} selAns={selAns} onAnswer={handleAnswer} />}
      {screen === "results" && <ResultsScreen result={gameResult} newBadges={newBadges} stats={stats} cat={cat} lvl={lvl} onHome={goHome} onRetry={() => setScreen("cats")} />}
      {screen === "lb" && <LbScreen lb={lb} onBack={goHome} />}
      {screen === "badges" && <BadgesScreen badges={BADGES} earned={stats.badges || []} onBack={goHome} />}
    </div>
  );
}

function BgPattern() {
  return (
    <svg style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.04, pointerEvents: "none", zIndex: 0 }} viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
      {[0,1,2,3].map(r => [0,1,2,3].map(c => (
        <g key={`${r}-${c}`} transform={`translate(${c*100},${r*100})`}>
          <rect x="10" y="10" width="80" height="80" fill="none" stroke="#F76B1C" strokeWidth="1"/>
          <rect x="20" y="20" width="60" height="60" fill="none" stroke="#1E7C4A" strokeWidth="0.5"/>
          <line x1="10" y1="50" x2="90" y2="50" stroke="#F5C518" strokeWidth="0.5"/>
          <line x1="50" y1="10" x2="50" y2="90" stroke="#F5C518" strokeWidth="0.5"/>
        </g>
      )))}
    </svg>
  );
}

function HomeScreen({ stats, onStart, onLb, onBadges }) {
  const pl = getLevelInfo(stats.totalXP || 0);
  const nextTier = getLevelInfo((stats.totalXP || 0) + 1);
  const cur = stats.totalXP || 0;
  const max = pl.level === 7 ? cur : nextTier.min === pl.min ? pl.max : nextTier.min;
  const pct = pl.level === 7 ? 100 : Math.min(100, ((cur - pl.min) / (max - pl.min)) * 100);

  return (
    <div style={{ ...S.page, position: "relative", zIndex: 1 }}>
      <div style={{ textAlign: "center", padding: "28px 0 24px" }}>
        <div style={{ fontSize: 70, lineHeight: 1, marginBottom: 10 }}>🇨🇮</div>
        <h1 style={{ fontSize: 32, fontWeight: "bold", color: "#F76B1C", margin: "0 0 4px", letterSpacing: "-0.5px" }}>Quiz Ivoirien</h1>
        <p style={{ fontSize: 14, color: "rgba(255,245,224,0.55)", margin: 0 }}>Testez vos connaissances sur la Côte d'Ivoire</p>
      </div>

      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,245,224,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Niveau {pl.level}</div>
            <div style={{ fontSize: 20, fontWeight: "bold", color: pl.color }}>{pl.title}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "rgba(255,245,224,0.4)" }}>XP Total</div>
            <div style={{ fontSize: 20, fontWeight: "bold" }}>{stats.totalXP || 0}</div>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 100, height: 6, marginBottom: 18, overflow: "hidden" }}>
          <div style={{ background: `linear-gradient(90deg,${pl.color},#F5C518)`, height: 6, width: `${pct}%`, borderRadius: 100, transition: "width 1s ease" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[["🎮", stats.gamesPlayed || 0, "Parties"], ["🔥", stats.bestStreak || 0, "Meilleur streak"], ["🎖️", (stats.badges || []).length, "Badges"]].map(([ic, v, l]) => (
            <div key={l} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "10px 6px", textAlign: "center", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: 16, marginBottom: 2 }}>{ic}</div>
              <div style={{ fontSize: 20, fontWeight: "bold", color: "#F76B1C" }}>{v}</div>
              <div style={{ fontSize: 10, color: "rgba(255,245,224,0.4)" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onStart} style={{ ...S.btn, width: "100%", padding: "18px", background: "linear-gradient(135deg,#F76B1C,#E85A0F)", color: "white", fontSize: 17, marginBottom: 12, boxShadow: "0 8px 30px rgba(247,107,28,0.35)" }}>
        🎯 Commencer le Quiz
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[["🏆 Classement", onLb], ["🎖️ Badges", onBadges]].map(([t, fn]) => (
          <button key={t} onClick={fn} style={{ ...S.btn, padding: "14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "#FFF5E0", fontSize: 14 }}>{t}</button>
        ))}
      </div>
    </div>
  );
}

function CatsScreen({ categories, onSelect, onBack }) {
  return (
    <div style={{ ...S.page, position: "relative", zIndex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingTop: 8 }}>
        <button onClick={onBack} style={S.back}>← Retour</button>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, color: "#F76B1C" }}>Catégories</h2>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,245,224,0.45)" }}>15 thèmes disponibles</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {categories.map((c) => (
          <button key={c.id} onClick={() => onSelect(c)} style={{ ...S.btn, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#FFF5E0", padding: "16px 14px", textAlign: "left", borderRadius: 14, fontSize: 14 }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 10px 30px ${c.color}35`; e.currentTarget.style.borderColor = `${c.color}60`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{c.icon}</div>
            <div style={{ fontWeight: "bold", marginBottom: 4, fontSize: 13 }}>{c.name}</div>
            <div style={{ fontSize: 10, color: "rgba(255,245,224,0.45)", lineHeight: 1.3 }}>{c.desc}</div>
            <div style={{ width: 28, height: 3, background: c.color, borderRadius: 2, marginTop: 8 }} />
          </button>
        ))}
      </div>
    </div>
  );
}

function LevelsScreen({ cat, levels, onStart, loading, error, onBack }) {
  return (
    <div style={{ ...S.page, position: "relative", zIndex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingTop: 8 }}>
        <button onClick={onBack} style={S.back}>← Retour</button>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, color: "#F76B1C" }}>{cat?.icon} {cat?.name}</h2>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,245,224,0.45)" }}>Choisissez votre niveau de difficulté</p>
        </div>
      </div>
      {error && <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 12, padding: "12px 14px", marginBottom: 14, color: "#FCA5A5", fontSize: 13 }}>⚠️ {error}</div>}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 52, marginBottom: 14, display: "inline-block", animation: "spin 2s linear infinite" }}>🎲</div>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: "rgba(255,245,224,0.7)", fontSize: 15, margin: "0 0 6px" }}>Génération des questions…</p>
          <p style={{ color: "rgba(255,245,224,0.35)", fontSize: 12, margin: 0 }}>Claude AI prépare votre quiz</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {levels.map((l) => (
            <button key={l.id} onClick={() => onStart(l)} style={{ ...S.btn, background: "rgba(255,255,255,0.06)", border: `1px solid ${l.color}40`, color: "#FFF5E0", padding: "18px", textAlign: "left", borderRadius: 16 }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 25px ${l.color}30`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: "bold", color: l.color, marginBottom: 4 }}>{l.icon} {l.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,245,224,0.5)" }}>{l.desc}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,245,224,0.45)", marginBottom: 2 }}>{l.questions} questions</div>
                  <div style={{ fontSize: 13, fontWeight: "bold", color: l.color }}>⏱ {l.time}s</div>
                  <div style={{ fontSize: 10, color: "rgba(255,245,224,0.35)" }}>×{l.xpMult} XP</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function QuizScreen({ question, qIdx, total, score, streak, timeLeft, lvl, cat, answered, selAns, onAnswer }) {
  if (!question) return null;
  const tMax = lvl?.time || 30;
  const tPct = (timeLeft / tMax) * 100;
  const isUrgent = timeLeft <= 5;
  const qPct = (qIdx / total) * 100;

  const optStyle = (idx) => {
    const base = { width: "100%", textAlign: "left", padding: "13px 15px", borderRadius: 13, cursor: answered ? "default" : "pointer", fontSize: 14, color: "#FFF5E0", marginBottom: 8, display: "block", fontFamily: "Georgia, serif", fontWeight: "bold", transition: "all 0.25s", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)" };
    if (!answered) return base;
    if (idx === question.correct) return { ...base, background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.5)", color: "#86EFAC" };
    if (idx === selAns) return { ...base, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.5)", color: "#FCA5A5" };
    return { ...base, opacity: 0.38 };
  };

  return (
    <div style={{ ...S.page, position: "relative", zIndex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingTop: 8 }}>
        <div style={{ fontSize: 13, color: "rgba(255,245,224,0.5)" }}>{cat?.icon} {cat?.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {streak >= 2 && <span style={{ background: "rgba(247,107,28,0.2)", border: "1px solid rgba(247,107,28,0.35)", borderRadius: 20, padding: "3px 10px", fontSize: 12, color: "#F76B1C", fontWeight: "bold" }}>🔥 ×{streak}</span>}
          <span style={{ fontSize: 16, fontWeight: "bold", color: "#F5C518" }}>⭐ {score}</span>
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 100, height: 3, marginBottom: 4, overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(90deg,#F76B1C,#F5C518)", height: 3, width: `${qPct}%`, borderRadius: 100 }} />
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,245,224,0.35)", textAlign: "right", marginBottom: 14 }}>Q{qIdx + 1} / {total}</div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 22, fontWeight: "bold", minWidth: 40, color: isUrgent ? "#EF4444" : "#FFF5E0", ...(isUrgent ? { animation: "blink 0.6s ease infinite" } : {}) }}>
          {timeLeft}s
        </span>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: 100, height: 7, overflow: "hidden" }}>
          <div style={{ background: isUrgent ? "#EF4444" : "linear-gradient(90deg,#1E7C4A,#22C55E)", height: 7, width: `${tPct}%`, borderRadius: 100, transition: "width 1s linear", boxShadow: isUrgent ? "0 0 8px rgba(239,68,68,0.6)" : "none" }} />
        </div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "rgba(255,245,224,0.35)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{question.type === "true_false" ? "✔ Vrai ou Faux" : "❓ Choix Multiple"}</div>
        <p style={{ fontSize: 16, fontWeight: "bold", lineHeight: 1.55, margin: 0, color: "#FFF5E0" }}>{question.question}</p>
      </div>

      <div>
        {question.options.map((opt, idx) => (
          <button key={idx} style={optStyle(idx)} onClick={() => onAnswer(idx)}>
            <span style={{ color: answered ? (idx === question.correct ? "#86EFAC" : idx === selAns ? "#FCA5A5" : "rgba(255,245,224,0.3)") : "#F76B1C", marginRight: 10 }}>
              {answered ? (idx === question.correct ? "✓" : idx === selAns ? "✗" : String.fromCharCode(65 + idx)) : String.fromCharCode(65 + idx)}
            </span>
            {opt}
          </button>
        ))}
      </div>

      {answered && answered !== "timeout" && question.explanation && (
        <div style={{ background: answered === "correct" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${answered === "correct" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 13, padding: "13px 14px", marginTop: 4 }}>
          <div style={{ fontSize: 13, fontWeight: "bold", color: answered === "correct" ? "#86EFAC" : "#FCA5A5", marginBottom: 4 }}>{answered === "correct" ? "✅ Excellent !" : "❌ Pas tout à fait…"}</div>
          <div style={{ fontSize: 12, color: "rgba(255,245,224,0.65)", lineHeight: 1.55 }}>{question.explanation}</div>
        </div>
      )}
      {answered === "timeout" && (
        <div style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 13, padding: "13px 14px", marginTop: 4 }}>
          <div style={{ fontSize: 13, fontWeight: "bold", color: "#FCD34D", marginBottom: 4 }}>⏱ Temps écoulé !</div>
          <div style={{ fontSize: 12, color: "rgba(255,245,224,0.65)" }}>Bonne réponse : <strong>{question.options[question.correct]}</strong></div>
        </div>
      )}
    </div>
  );
}

function ResultsScreen({ result, newBadges, stats, cat, lvl, onHome, onRetry }) {
  if (!result) return null;
  const pct = Math.round((result.correct / result.total) * 100);
  const emoji = result.isPerfect ? "🏆" : pct >= 80 ? "🎖️" : pct >= 60 ? "🎯" : pct >= 40 ? "📚" : "💪";
  const msg = result.isPerfect ? "Score parfait ! Vous êtes un expert !" : pct >= 80 ? "Excellent travail !" : pct >= 60 ? "Bien joué !" : pct >= 40 ? "Pas mal, continuez !" : "À retravailler — vous progresserez !";
  const pl = getLevelInfo(stats.totalXP || 0);

  return (
    <div style={{ ...S.page, position: "relative", zIndex: 1, paddingTop: 20 }}>
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ fontSize: 60, lineHeight: 1, marginBottom: 10 }}>{emoji}</div>
        <h2 style={{ fontSize: 26, color: "#F76B1C", margin: "0 0 4px" }}>Partie Terminée !</h2>
        <p style={{ color: "rgba(255,245,224,0.6)", margin: 0, fontSize: 14 }}>{msg}</p>
      </div>

      <div style={{ background: "linear-gradient(135deg,rgba(247,107,28,0.12),rgba(245,197,24,0.08))", border: "1px solid rgba(247,107,28,0.25)", borderRadius: 18, padding: "22px", marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 54, fontWeight: "bold", color: "#F5C518", lineHeight: 1 }}>{result.score}</div>
        <div style={{ fontSize: 13, color: "rgba(255,245,224,0.45)", marginBottom: 18 }}>points XP gagnés</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[[`${result.correct}/${result.total}`, "Bonnes réponses", "#22C55E"], [`${pct}%`, "Taux de succès", "#F59E0B"], [pl.title, `Niveau ${pl.level}`, pl.color]].map(([v, l, c]) => (
            <div key={l} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "10px 6px" }}>
              <div style={{ fontSize: 16, fontWeight: "bold", color: c }}>{v}</div>
              <div style={{ fontSize: 10, color: "rgba(255,245,224,0.4)" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {newBadges.length > 0 && (
        <div style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.25)", borderRadius: 16, padding: "16px", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: "bold", color: "#F5C518", marginBottom: 10 }}>🎊 Badges débloqués !</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {newBadges.map((b) => (
              <div key={b.id} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 22 }}>{b.icon}</div>
                <div style={{ fontSize: 10, fontWeight: "bold", marginTop: 2, color: "#F5C518" }}>{b.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={onRetry} style={{ ...S.btn, width: "100%", padding: "16px", background: "linear-gradient(135deg,#F76B1C,#E85A0F)", color: "white", fontSize: 16, marginBottom: 10 }}>🔄 Rejouer</button>
      <button onClick={onHome} style={{ ...S.btn, width: "100%", padding: "14px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", color: "#FFF5E0", fontSize: 15 }}>🏠 Accueil</button>
    </div>
  );
}

function LbScreen({ lb, onBack }) {
  return (
    <div style={{ ...S.page, position: "relative", zIndex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, paddingTop: 8 }}>
        <button onClick={onBack} style={S.back}>← Retour</button>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, color: "#F5C518" }}>🏆 Classement</h2>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,245,224,0.45)" }}>Vos meilleures performances</p>
        </div>
      </div>
      {lb.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,245,224,0.35)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎮</div>
          <p>Aucune partie jouée encore. Lancez votre première partie !</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lb.map((e, i) => (
            <div key={i} style={{ background: i === 0 ? "rgba(245,197,24,0.09)" : "rgba(255,255,255,0.05)", border: `1px solid ${i === 0 ? "rgba(245,197,24,0.28)" : "rgba(255,255,255,0.09)"}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 22, minWidth: 30 }}>{["🥇", "🥈", "🥉"][i] || `#${i + 1}`}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", color: i === 0 ? "#F5C518" : "#FFF5E0", fontSize: 14 }}>{e.cat}</div>
                <div style={{ fontSize: 11, color: "rgba(255,245,224,0.4)" }}>{e.lvl} • {e.correct}/{e.total} bonnes • {e.date}</div>
              </div>
              <div style={{ fontWeight: "bold", fontSize: 20, color: "#F76B1C" }}>{e.score}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BadgesScreen({ badges, earned, onBack }) {
  return (
    <div style={{ ...S.page, position: "relative", zIndex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, paddingTop: 8 }}>
        <button onClick={onBack} style={S.back}>← Retour</button>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, color: "#F76B1C" }}>🎖️ Badges</h2>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,245,224,0.45)" }}>{earned.length} / {badges.length} débloqués</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {badges.map((b) => {
          const ok = earned.includes(b.id);
          return (
            <div key={b.id} style={{ background: ok ? "rgba(247,107,28,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${ok ? "rgba(247,107,28,0.28)" : "rgba(255,255,255,0.07)"}`, borderRadius: 16, padding: "18px 14px", textAlign: "center", filter: ok ? "none" : "grayscale(0.7)", opacity: ok ? 1 : 0.55 }}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>{b.icon}</div>
              <div style={{ fontSize: 13, fontWeight: "bold", color: ok ? "#F76B1C" : "rgba(255,245,224,0.4)", marginBottom: 4 }}>{b.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,245,224,0.38)", lineHeight: 1.4 }}>{b.desc}</div>
              {ok && <div style={{ fontSize: 10, color: "#22C55E", marginTop: 6, fontWeight: "bold" }}>✓ Obtenu</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}