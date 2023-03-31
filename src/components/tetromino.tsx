import {cellSize} from "../lib/config";
import {generateTetromino} from "../lib/utils";

export default function Tetromino({
  index,
  size,
}: {
  index: number;
  size?: number;
}) {
  const tetromino = generateTetromino(index);
  size = size || cellSize;
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: `${size * 4}px`,
        height: `${size * 4}px`,
      }}
    >
      <div
        className="grid items-center justify-center gap-px"
        style={{
          gridTemplateColumns: `repeat(${tetromino.shape.length}, ${size}px)`,
        }}
      >
        {tetromino.shape.map((m) =>
          m.map((n, i) => (
            <div
              key={i}
              style={{
                backgroundColor: n ? tetromino.color : "",
                width: `${size}px`,
                height: `${size}px`,
              }}
            ></div>
          ))
        )}
      </div>
    </div>
  );
}
