import {useState} from "react";
import Gameboard from "../components/gameboard";
import {useTetrisEngine} from "../lib/engine";

export default function Play() {
  const [isGameOver, setIsGameOver] = useState(false);
  const gameBoardData = useTetrisEngine({
    onGameOver() {
      setIsGameOver(true);
    },
    isGameOver: isGameOver,
  });
  return (
    <div>
      <Gameboard data={gameBoardData} />
    </div>
  );
}
