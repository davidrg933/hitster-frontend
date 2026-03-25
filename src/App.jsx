import { useState } from "react";
import SpotifyHandler from "./components/SpotifyHandler";
import GameCard from "./components/GameCard";
import Timeline from "./components/Timeline";
import "./index.css";

function App() {
  const WIN_CONDITION = 10;

  // --- ESTADOS ---
  const [gameStarted, setGameStarted] = useState(false);
  const [audioReady, setAudioReady] = useState(false); // NUEVO: Para habilitar audio en móvil
  const [winner, setWinner] = useState(null);
  const [deck, setDeck] = useState([]);
  const [players, setPlayers] = useState([
    { id: 0, name: "Jugador 1", timeline: [] },
    { id: 1, name: "Jugador 2", timeline: [] },
  ]);

  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [currentSong, setCurrentSong] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState("¡Prepara el mazo!");
  const [isLoading, setIsLoading] = useState(false);

  // --- UTILIDADES ---
  const shuffleDeck = (array) => {
    let currentIndex = array.length;
    while (currentIndex !== 0) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  };

  // --- CONFIGURACIÓN ---
  const handleNumPlayers = (num) => {
    const newConfig = Array.from({ length: num }, (_, i) => ({
      id: i,
      name: `Jugador ${i + 1}`,
      timeline: [],
    }));
    setPlayers(newConfig);
  };

  const updateName = (id, name) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  // --- LÓGICA DE INICIO (MAZO COMPLETO) ---
  const startGame = async () => {
    setIsLoading(true);
    setMessage("Descargando playlist completa de Spotify...");
    try {
      const res = await fetch(
        "https://hitster-backend-production.up.railway.app/api/all-songs",
      );
      const allSongs = await res.json();
      const shuffled = shuffleDeck([...allSongs]);

      const updatedPlayers = [...players];
      for (let i = 0; i < updatedPlayers.length; i++) {
        updatedPlayers[i].timeline = [shuffled.pop()];
      }

      setDeck(shuffled);
      setPlayers(updatedPlayers);
      setGameStarted(true);
      setIsLoading(false);
      setMessage("¡Mazo listo! Activa el audio para empezar.");
    } catch (e) {
      setMessage("Error al conectar con el servidor.");
      setIsLoading(false);
    }
  };

  // --- ACTIVAR AUDIO Y EMPEZAR ---
  const enableAudioAndStart = () => {
    setAudioReady(true);
    // Sacamos la primera para jugar justo después del clic del usuario
    drawNextSong(deck, 0);
  };

  // --- ROBAR CARTA + REFRESCO DE TOKEN ---
  const drawNextSong = async (currentDeck, playerIdx) => {
    if (currentDeck.length === 0) {
      setMessage("¡No quedan más cartas en el mazo!");
      return;
    }

    try {
      const tokenRes = await fetch(
        "https://hitster-backend-production.up.railway.app/api/refresh-token",
      );
      const tokenData = await tokenRes.json();

      const nextDeck = [...currentDeck];
      const nextSong = nextDeck.pop();
      const songWithToken = { ...nextSong, token: tokenData.token };

      setDeck(nextDeck);
      setCurrentPlayerIdx(playerIdx);
      setCurrentSong(songWithToken);
      setShowDetails(false);
      setIsWrong(false);
      setIsPlaying(true);
      setMessage(`Turno de: ${players[playerIdx].name}`);
    } catch (e) {
      console.error("Fallo al refrescar token", e);
    }
  };

  // --- VALIDACIÓN ---
  const checkPosition = (slotIndex) => {
    if (!currentSong || showDetails) return;
    const currentYear = parseInt(currentSong.year);
    const timeline = players[currentPlayerIdx].timeline;

    const yearBefore =
      slotIndex > 0 ? parseInt(timeline[slotIndex - 1].year) : -Infinity;
    const yearAfter =
      slotIndex < timeline.length
        ? parseInt(timeline[slotIndex].year)
        : Infinity;

    setShowDetails(true);

    if (currentYear >= yearBefore && currentYear <= yearAfter) {
      setIsWrong(false);
      setMessage(`¡Correcto ${players[currentPlayerIdx].name}! ✨`);

      const nextPlayers = [...players];
      nextPlayers[currentPlayerIdx].timeline.splice(slotIndex, 0, currentSong);
      setPlayers(nextPlayers);

      if (nextPlayers[currentPlayerIdx].timeline.length >= WIN_CONDITION) {
        setTimeout(() => setWinner(nextPlayers[currentPlayerIdx]), 1000);
      }
    } else {
      setIsWrong(true);
      setIsPlaying(false);
      setMessage(`¡Error! Era de ${currentYear}.`);
    }
  };

  const handleNextTurn = () => {
    const nextIdx = (currentPlayerIdx + 1) % players.length;
    drawNextSong(deck, nextIdx);
  };

  // --- RENDERS ---
  if (winner) {
    return (
      <div className="lobby-container">
        <h1 className="win-title">🏆 {winner.name.toUpperCase()} GANA</h1>
        <button className="start-btn" onClick={() => window.location.reload()}>
          REINICIAR
        </button>
      </div>
    );
  }

  // PANTALLA INICIAL (LOBBY)
  if (!gameStarted) {
    return (
      <div className="lobby-container">
        <h1>Hitster K-Pop 🎤</h1>
        <div className="setup-box">
          <h3>Jugadores:</h3>
          <div className="num-selector">
            {[2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => handleNumPlayers(num)}
                className={players.length === num ? "active" : ""}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="name-inputs">
            {players.map((p) => (
              <input
                key={p.id}
                value={p.name}
                onChange={(e) => updateName(p.id, e.target.value)}
                placeholder={`Jugador ${p.id + 1}`}
              />
            ))}
          </div>
          <button
            className="start-btn"
            onClick={startGame}
            disabled={isLoading}
          >
            {isLoading ? "CARGANDO..." : "EMPEZAR"}
          </button>
        </div>
      </div>
    );
  }

  // PANTALLA INTERMEDIA PARA ACTIVAR AUDIO (CRUCIAL PARA MÓVIL)
  if (gameStarted && !audioReady) {
    return (
      <div className="lobby-container">
        <h1>¡Todo listo! 🎶</h1>
        <div className="setup-box">
          <p>
            Para escuchar la música en el móvil, necesitamos que actives el
            reproductor.
          </p>
          <button className="start-btn" onClick={enableAudioAndStart}>
            ACTIVAR AUDIO Y JUGAR
          </button>
        </div>
      </div>
    );
  }

  // JUEGO PRINCIPAL
  return (
    <div className="app-container-grid">
      <main className="timelines-area">
        {players.map((player, idx) => (
          <div
            key={player.id}
            className={`timeline-section ${idx === currentPlayerIdx ? "is-turn" : "not-turn"}`}
          >
            <h4 className="player-name-label">
              {player.name} {idx === currentPlayerIdx ? "⬅️" : ""}
            </h4>
            <Timeline
              songs={player.timeline}
              onSelectSlot={checkPosition}
              disabled={showDetails || idx !== currentPlayerIdx}
            />
          </div>
        ))}
      </main>

      <aside className="game-sidebar">
        <div className="status-panel">
          <div className="player-scores">
            {players.map((p, idx) => (
              <div
                key={p.id}
                className={`p-badge ${idx === currentPlayerIdx ? "active" : ""}`}
              >
                {p.name}: {p.timeline.length}
              </div>
            ))}
          </div>
          <p className="message-display">{message}</p>
          <small style={{ color: "#666" }}>Mazo: {deck.length} cartas</small>
        </div>

        <GameCard
          song={currentSong}
          showDetails={showDetails}
          isWrong={isWrong}
        />

        <div className="controls-panel">
          {/* Renderizamos el handler siempre que el token exista, no dependamos de la canción entera */}
          {currentSong?.token && (
            <SpotifyHandler
              token={currentSong.token}
              uri={currentSong.uri}
              isPlaying={isPlaying}
            />
          )}

          {showDetails && (
            <button
              className={`next-turn-btn ${isWrong ? "btn-error" : "btn-success"}`}
              onClick={handleNextTurn}
            >
              {isWrong ? "SIGUIENTE JUGADOR" : "CONTINUAR"}
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

export default App;
