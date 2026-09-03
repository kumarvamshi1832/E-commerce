import "./BalloonEffect.css";

function BalloonEffect() {
  const balloons = Array.from({ length: 40 }, (_, index) => index);

  return (
    <div className="balloon-container">
      {balloons.map((balloon) => (
        <div
          key={balloon}
          className="balloon"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 1.5}s`,
            backgroundColor: [
              "#ff4d6d",
              "#ffbe0b",
              "#3a86ff",
              "#8338ec",
              "#06d6a0",
              "#fb5607",
            ][balloon % 6],
          }}
        >
          <div className="balloon-string"></div>
        </div>
      ))}
    </div>
  );
}

export default BalloonEffect;