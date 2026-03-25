import SpotifyPlayer from "react-spotify-web-playback";
import "./SpotifyHandler.css";

const SpotifyHandler = ({ token, uri, isPlaying }) => {
  if (!token || !uri) return null;

  return (
    <div className="spotify-player-wrapper">
      <div className="spotify-player-mask">
        <SpotifyPlayer
          token={token}
          uris={[uri]}
          play={isPlaying}
          autoPlay={true}
          styles={{
            activeColor: "#1cb954",
            bgColor: "#181818",
            color: "#fff",
            loaderColor: "#fff",
            sliderColor: "#1cb954",
            trackArtistColor: "#ccc",
            trackNameColor: "#fff",
            height: 80,
          }}
        />
      </div>
    </div>
  );
};

export default SpotifyHandler;
