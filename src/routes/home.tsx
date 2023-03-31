import Gameboard from "../components/gameboard";
import {useTetrisEngine} from "../lib/engine";

export default function Home() {
  const gameBoardData = useTetrisEngine({
    isPaused: true,
  });
  return <Gameboard data={gameBoardData} />;
}
