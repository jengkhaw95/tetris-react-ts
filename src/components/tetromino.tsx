import { cellSize } from "../lib/config";
import { generateTetromino } from "../lib/utils";

export default function Tetromino({ index }: { index: number }) {
    const tetromino = generateTetromino(index);
    return (
        <div
            className="flex items-center justify-center"
            style={{
                width: `${cellSize * 4}px`,
                height: `${cellSize * 4}px`,
            }}
        >
            <div
                className="grid items-center justify-center"
                style={{
                    gridTemplateColumns: `repeat(${tetromino.shape.length}, ${cellSize}px)`,
                }}
            >
                {tetromino.shape.map((m) =>
                    m.map((n, i) => (
                        <div
                            key={i}
                            style={{
                                backgroundColor: n ? tetromino.color : "",
                                width: `${cellSize}px`,
                                height: `${cellSize}px`,
                            }}
                        ></div>
                    ))
                )}
            </div>
        </div>
    );
}