import { useMemo } from "react";
import "./BalloonEffect.css";

function BalloonEffect() {

  const balloons = useMemo(() => {
    const colors = [
      "#7d123f",
      "#a52d5d",
      "#557a32",
      "#7d123f",
      "#c58a25",
      "#6f963e",
    ];

    return Array.from({ length: 40 }, (_, index) => ({
      id: index,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 1.5}s`,
      backgroundColor: colors[index % colors.length],
    }));
  }, []);

  return (
    <div className="balloon-container">

      {balloons.map((balloon) => (

        <div
          key={balloon.id}
          className="balloon"
          style={{
            left: balloon.left,
            animationDelay: balloon.animationDelay,
            backgroundColor: balloon.backgroundColor,
          }}
        >
          <div className="balloon-string"></div>
        </div>

      ))}

    </div>
  );
}

export default BalloonEffect;