import Gameboard from "../components/gameboard";
import {useTetrisEngine} from "../lib/engine";

export default function Play() {
  const gameBoardData = useTetrisEngine({});
  return (
    <div>
      <Gameboard data={gameBoardData} />
    </div>
  );
}
