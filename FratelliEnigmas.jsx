import React, { useState, useEffect, useRef, useMemo } from 'react';

/**
 * Fratelli — Minimalist Trivia & Enigma Engine
 * Aesthetic: Swiss / Ultra-minimalist
 * Palette: Pure White, Stone 900 (Charcoal), Stone 500 (Muted), Violet 600 (Restrained Accent)
 */

const RIDDLES = [
  {
    groupNum: 1,
    defaultName: "Grupo 1",
    poem: "Aparece cuando el dinero se vuelve el rey supremo, y a los abuelos o a los frágiles los tratan como un freno. Los marginan como cosas sin valor ni remedio.",
    question: "¿Qué fenómeno social describe la encíclica?",
    answer: "DESCARTE",
    chapter: "Capítulo 1 · Las sombras de un mundo cerrado"
  },
  {
    groupNum: 2,
    defaultName: "Grupo 2",
    poem: "Iba apurado en su mula, pero al ver a un herido tirado en el camino, no miró para otro lado. Vendó sus heridas, pagó la posada y le regaló su tiempo.",
    question: "¿Quién es el modelo del prójimo compasivo?",
    answer: "SAMARITANO",
    chapter: "Capítulo 2 · Un extraño en el camino"
  },
  {
    groupNum: 3,
    defaultName: "Grupo 3",
    poem: "No se compra en el mercado ni se vende en un bazar; hace que a cualquier extraño como hermano puedas mirar. Si nos une en todo el mundo, la esperanza va a brillar.",
    question: "¿Qué virtud da nombre y sentido a la encíclica?",
    answer: "FRATERNIDAD",
    chapter: "Capítulo 3 · Pensar y gestar un mundo abierto"
  },
  {
    groupNum: 5,
    defaultName: "Grupo 5",
    poem: "No es la politiquería de promesas que se lleva el viento, ni buscar votos fáciles con engaño. Es el amor social más alto que crea puentes y trabajo para el bien común.",
    question: "¿Qué tipo de amor político transforma las estructuras?",
    answer: "CARIDAD",
    chapter: "Capítulo 5 · La mejor política"
  },
  {
    groupNum: 6,
    defaultName: "Grupo 6",
    poem: "No son dos personas gritando en la televisión o en redes, ni monólogos de sordos llenos de desdén. Es sentarse a escuchar, mirarse a los ojos y construir la paz.",
    question: "¿Qué herramienta edifica la cultura del encuentro?",
    answer: "DIALOGO",
    chapter: "Capítulo 6 · Diálogo y amistad social"
  },
  {
    groupNum: 7,
    defaultName: "Grupo 7",
    poem: "No es tapar las injusticias ni olvidar con cobardía; es sanar de raíz la herida para devolver la alegría. Desarma la venganza y rompe las cadenas del rencor.",
    question: "¿Qué acto moral frena la espiral del odio?",
    answer: "PERDON",
    chapter: "Capítulo 7 · Caminos de reencuentro"
  },
  {
    groupNum: 8,
    defaultName: "Grupo 8",
    poem: "No se logra con misiles ni con guerras de terror; brota cuando las religiones reconocen a un mismo Creador de amor para convivir como hermanos.",
    question: "¿Qué anhelo universal une a todos los pueblos?",
    answer: "PAZ",
    chapter: "Capítulo 8 · Las religiones al servicio de la fraternidad"
  }
];

const normalize = (str) =>
  str
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export default function FratelliEnigmas() {
  const [view, setView] = useState('setup'); // 'setup' | 'quiz' | 'round_success' | 'podium'
  const [teamNames, setTeamNames] = useState(
    RIDDLES.reduce((acc, r) => ({ ...acc, [r.groupNum]: r.defaultName }), {})
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [revealedChars, setRevealedChars] = useState(new Set());
  const [cluesCount, setCluesCount] = useState(0);
  const [isErrorShake, setIsErrorShake] = useState(false);
  const [results, setResults] = useState([]); // [{ groupNum, name, timeMs, timeFormatted }]
  
  // Cronómetro
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  const currentRiddle = RIDDLES[currentIndex];
  const targetNormalized = useMemo(() => normalize(currentRiddle?.answer || ''), [currentRiddle]);
  const maxClues = targetNormalized.length <= 6 ? 2 : 3;

  // Formato de tiempo mm:ss.d
  const formatTime = (ms) => {
    const totalSecs = ms / 1000;
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.floor(totalSecs % 60);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths}`;
  };

  const startTimer = () => {
    stopTimer();
    startTimeRef.current = Date.now();
    setElapsedMs(0);
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 50);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStartTournament = () => {
    setResults([]);
    setCurrentIndex(0);
    loadQuestion(0);
    setView('quiz');
  };

  const loadQuestion = (index) => {
    setInputValue('');
    setRevealedChars(new Set());
    setCluesCount(0);
    startTimer();
  };

  const handleClue = () => {
    if (cluesCount >= maxClues) return;
    const unrevealed = [...targetNormalized].filter((c) => !revealedChars.has(c));
    if (unrevealed.length > 0) {
      const pick = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      setRevealedChars((prev) => new Set([...prev, pick]));
      setCluesCount((prev) => prev + 1);
      // Penalización +2 segundos
      startTimeRef.current -= 2000;
      setElapsedMs(Date.now() - startTimeRef.current);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (normalize(inputValue) === targetNormalized) {
      stopTimer();
      const finalMs = elapsedMs;
      const roundResult = {
        groupNum: currentRiddle.groupNum,
        name: teamNames[currentRiddle.groupNum] || currentRiddle.defaultName,
        timeMs: finalMs,
        timeFormatted: formatTime(finalMs)
      };

      setResults((prev) => [...prev, roundResult]);
      setView('round_success');
    } else {
      setIsErrorShake(true);
      setTimeout(() => setIsErrorShake(false), 500);
    }
  };

  const handleNextStep = () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx < RIDDLES.length) {
      setCurrentIndex(nextIdx);
      loadQuestion(nextIdx);
      setView('quiz');
    } else {
      setView('podium');
    }
  };

  const sortedLeaderboard = useMemo(() => {
    return [...results].sort((a, b) => a.timeMs - b.timeMs);
  }, [results]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased selection:bg-stone-200">
      <main className="max-w-xl mx-auto px-6 py-12 md:py-20">
        
        {/* Minimal Global Header */}
        <header className="flex items-center justify-between border-b border-stone-200 pb-5 mb-10">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-violet-600" aria-hidden="true" />
            <span className="text-xs uppercase tracking-widest font-semibold text-stone-900">
              Fratelli Tutti
            </span>
          </div>
          <span className="text-xs font-mono text-stone-400">
            {view === 'quiz' ? `${currentIndex + 1} / ${RIDDLES.length}` : 'Encíclica Social'}
          </span>
        </header>

        {/* VIEW 1: REGISTRATION / SETUP */}
        {view === 'setup' && (
          <div className="space-y-10">
            <section className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
                Desafío Contrarreloj
              </h1>
              <p className="text-sm text-stone-500 leading-relaxed">
                7 enigmas de una sola palabra extraídos de Fratelli Tutti. El criterio ganador es el menor tiempo de resolución.
              </p>
            </section>

            <section className="space-y-3">
              <span className="text-xs font-mono uppercase text-stone-400 block tracking-wider">
                Participantes (Grupos 1 al 8, sin G4)
              </span>
              <div className="divide-y divide-stone-200 border-y border-stone-200">
                {RIDDLES.map((r) => (
                  <div key={r.groupNum} className="flex items-center py-2.5 gap-4">
                    <span className="text-xs font-mono text-stone-400 w-12">
                      G{r.groupNum}
                    </span>
                    <input
                      type="text"
                      value={teamNames[r.groupNum] || ''}
                      onChange={(e) =>
                        setTeamNames({ ...teamNames, [r.groupNum]: e.target.value })
                      }
                      className="w-full bg-transparent text-sm text-stone-800 placeholder-stone-300 focus:outline-none"
                      placeholder={r.defaultName}
                    />
                  </div>
                ))}
              </div>
            </section>

            <button
              onClick={handleStartTournament}
              className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-stone-50 text-sm font-medium tracking-wide transition-colors"
            >
              Comenzar Desafío
            </button>
          </div>
        )}

        {/* VIEW 2: ACTIVE QUESTION */}
        {view === 'quiz' && currentRiddle && (
          <div className="space-y-8">
            {/* Meta Ribbon */}
            <div className="flex items-baseline justify-between text-xs font-mono text-stone-400">
              <span className="text-stone-900 font-medium">
                {teamNames[currentRiddle.groupNum] || currentRiddle.defaultName}
              </span>
              <span className="text-stone-900 text-sm tracking-tight">
                {formatTime(elapsedMs)}
              </span>
            </div>

            {/* Riddle Text */}
            <section className="space-y-4">
              <p className="text-lg md:text-xl font-normal text-stone-800 leading-relaxed">
                "{currentRiddle.poem}"
              </p>
              <h2 className="text-xs font-mono uppercase tracking-widest text-violet-700">
                {currentRiddle.question}
              </h2>
            </section>

            {/* Character Clue Slots */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap gap-1.5 justify-center py-4 bg-white border border-stone-200">
                {[...targetNormalized].map((char, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-10 flex items-center justify-center font-mono text-base border-b-2 border-stone-300 text-stone-900"
                  >
                    {revealedChars.has(char) ? char : ''}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs text-stone-400">
                <span>{targetNormalized.length} letras</span>
                <button
                  type="button"
                  onClick={handleClue}
                  disabled={cluesCount >= maxClues}
                  className="font-mono text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  +2s Pista ({cluesCount}/{maxClues})
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className={`relative ${isErrorShake ? 'animate-shake' : ''}`}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escribe la palabra exacta..."
                  autoFocus
                  className="w-full bg-white border border-stone-300 px-4 py-3.5 text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-stone-50 text-sm font-medium tracking-wide transition-colors"
              >
                Comprobar
              </button>
            </form>
          </div>
        )}

        {/* VIEW 3: ROUND SUCCESS / FEEDBACK */}
        {view === 'round_success' && currentRiddle && (
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-stone-400 tracking-wider">
                {teamNames[currentRiddle.groupNum] || currentRiddle.defaultName} · Acierto
              </span>
              <div className="flex items-baseline justify-between border-b border-stone-200 pb-4">
                <h2 className="text-3xl font-semibold tracking-tight text-stone-900 font-mono">
                  {currentRiddle.answer}
                </h2>
                <span className="text-sm font-mono text-stone-900">
                  {formatTime(results[results.length - 1]?.timeMs || 0)}
                </span>
              </div>
            </div>

            <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">
              {currentRiddle.chapter}
            </p>

            <button
              onClick={handleNextStep}
              className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-stone-50 text-sm font-medium tracking-wide transition-colors"
            >
              {currentIndex + 1 < RIDDLES.length ? 'Siguiente Grupo' : 'Ver Podio'}
            </button>
          </div>
        )}

        {/* VIEW 4: PODIUM / LEADERBOARD */}
        {view === 'podium' && (
          <div className="space-y-10 animate-fadeIn">
            <section className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-violet-700">
                Resultados Finales
              </span>
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
                Podio de Ganadores
              </h1>
              <p className="text-xs text-stone-400">
                Clasificación por menor tiempo de respuesta
              </p>
            </section>

            {/* TOP 3 PODIUM */}
            <div className="grid grid-cols-3 gap-3 border-y border-stone-200 py-6">
              {/* 2do Puesto */}
              <div className="flex flex-col justify-end text-center p-3 bg-white border border-stone-200">
                <span className="text-xs font-mono text-stone-400 mb-1">2°</span>
                <span className="text-xs font-semibold text-stone-900 truncate">
                  {sortedLeaderboard[1]?.name || '—'}
                </span>
                <span className="text-[11px] font-mono text-stone-500 mt-1">
                  {sortedLeaderboard[1]?.timeFormatted || '—'}
                </span>
              </div>

              {/* 1er Puesto */}
              <div className="flex flex-col justify-end text-center p-3 bg-white border-2 border-stone-900 relative -top-2">
                <span className="text-xs font-mono text-violet-700 font-bold mb-1">1° Oro</span>
                <span className="text-sm font-bold text-stone-900 truncate">
                  {sortedLeaderboard[0]?.name || '—'}
                </span>
                <span className="text-xs font-mono text-stone-900 mt-1 font-semibold">
                  {sortedLeaderboard[0]?.timeFormatted || '—'}
                </span>
              </div>

              {/* 3er Puesto */}
              <div className="flex flex-col justify-end text-center p-3 bg-white border border-stone-200">
                <span className="text-xs font-mono text-stone-400 mb-1">3°</span>
                <span className="text-xs font-semibold text-stone-900 truncate">
                  {sortedLeaderboard[2]?.name || '—'}
                </span>
                <span className="text-[11px] font-mono text-stone-500 mt-1">
                  {sortedLeaderboard[2]?.timeFormatted || '—'}
                </span>
              </div>
            </div>

            {/* Full Table */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-stone-400 uppercase tracking-wider block">
                Clasificación General
              </span>
              <div className="divide-y divide-stone-200 border-t border-stone-200">
                {sortedLeaderboard.map((item, idx) => (
                  <div key={item.groupNum} className="flex items-center justify-between py-2.5 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-stone-400 w-6">#{idx + 1}</span>
                      <span className="font-medium text-stone-900">{item.name}</span>
                    </div>
                    <span className="font-mono text-stone-500">{item.timeFormatted}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setView('setup')}
              className="w-full py-3.5 border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-stone-50 text-sm font-medium tracking-wide transition-colors"
            >
              Reiniciar Torneo
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
