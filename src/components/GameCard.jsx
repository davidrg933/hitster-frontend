import "./GameCard.css";

const GameCard = ({ song, showDetails, isWrong }) => {
  if (!song) return null;

  return (
    <div className="card-scene">
      <div
        className={`card ${showDetails ? "is-flipped" : ""} ${isWrong ? "is-wrong" : ""}`}
      >
        {/* CARA FRONTAL */}
        <div className="card-face card-face-front">
          <div className="mystery-mark">?</div>
          <p>Escucha y adivina el año</p>
        </div>

        {/* CARA TRASERA */}
        <div className="card-face card-face-back">
          <div className="song-info">
            <img src={song.image} alt="Album cover" className="album-cover" />
            <h2 className="song-title">{song.title}</h2>
            <h3 className="song-artist">{song.artist}</h3>
            <div className="year-badge">{song.year}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
