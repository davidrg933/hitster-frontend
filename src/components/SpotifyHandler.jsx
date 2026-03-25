import React, { useEffect, useState } from "react";
import SpotifyPlayer from "react-spotify-web-playback";

const SpotifyHandler = ({ token, uri, isPlaying }) => {
  if (!token) return null;

  return (
    <div className="spotify-player-container">
      <SpotifyPlayer
        token={token}
        uris={uri ? [uri] : []}
        play={isPlaying}
        autoPlay={true} // Intentamos que arranque solo
        persistDeviceSelection={true} // Clave para móviles
        showSaveTrack={true}
        syncExternalDevice={true} // Esto es lo que hace que conecte con tu App
        magnifySliderOnHover={true}
        // Este callback es el que nos dirá qué pasa
        callback={(state) => {
          console.log("Estado de Spotify:", state);
          if (
            state.status === "ERROR" &&
            state.type === "authentication_error"
          ) {
            console.error("Error de token, refrescando...");
          }
        }}
        styles={{
          activeColor: "#1db954",
          bgColor: "#181818",
          color: "#fff",
          loaderColor: "#1db954",
          sliderColor: "#1db954",
          trackArtistColor: "#ccc",
          trackNameColor: "#fff",
          height: 80,
        }}
      />

      {/* TRUCO PARA MÓVIL: Un aviso si no suena */}
      <p
        style={{
          fontSize: "10px",
          color: "#666",
          marginTop: "5px",
          textAlign: "center",
        }}
      >
        Si no escuchas nada, pulsa el play en el reproductor de arriba.
      </p>
    </div>
  );
};

export default SpotifyHandler;
