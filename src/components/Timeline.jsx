import "./Timeline.css";

const Timeline = ({ songs, onSelectSlot, disabled }) => {
  return (
    <div className="timeline-container">
      <h3>Tu Línea Temporal</h3>
      <div className="timeline-display">
        {/* Generamos un hueco al principio, entre cartas y al final */}
        {[...Array(songs.length + 1)].map((_, index) => (
          <div key={`slot-group-${index}`} className="timeline-item">
            {/* SLOT DE INSERCIÓN */}
            <button
              className={`insert-btn ${disabled ? "disabled" : ""}`}
              onClick={() => !disabled && onSelectSlot(index)}
              disabled={disabled}
            >
              +
            </button>

            {/* CARTA EXISTENTE (si no es el último slot) */}
            {index < songs.length && (
              <div className="timeline-card-small">
                <img src={songs[index].image} alt="cover" />
                <div className="year-label">{songs[index].year}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
