import {MutableRefObject, RefObject, useEffect, useRef, useState} from "react";
import {GameSnapshot} from "../types";
import {xCount} from "./config";
import {
  checkCollision,
  generateSeeds,
  generateTetromino,
  getShadow,
  makeNewMap,
  minMax,
  moveTetromino,
  solidate,
} from "./utils";

export interface EngineConnectorType {
  appendGarbageLines: (count: number) => void;
}

export interface TetrisEngineProps {
  gameMode?: "default" | "multi";
  engineConnector?: React.MutableRefObject<EngineConnectorType | undefined>;
  gameStartTimestamp?: number;
  isPaused?: boolean;
  isGameOver?: boolean;
  onLineClear?: (combo: number) => void;
  onGameOver?: (timestamp: number) => void;
  onSnapshot?: (snapshot: GameSnapshot) => void;
}

const generateGarbageLine = () => {
  const r = Math.floor(Math.random() * xCount);
  return Array.from(new Array(10), (_, i) => (i !== r ? -2 : 0));
};

export const useTetrisEngine = ({
  gameMode,
  engineConnector,
  gameStartTimestamp,
  isGameOver,
  isPaused,
  onGameOver,
  onSnapshot,
  onLineClear,
}: TetrisEngineProps) => {
  const garbageLineCount = useRef(0);
  const intervalRef = useRef<NodeJS.Timer>();
  const lastY = useRef<number>();
  const timestampRef = useRef<number>(0);
  const [seeds, setSeeds] = useState<number[]>(generateSeeds(2));
  const [map, setMap] = useState<number[][]>(() => makeNewMap());
  const [swap, setSwap] = useState<number | null>(null);
  const [tetromino, setTetromino] = useState(() => generateTetromino(seeds[0]));
  //const [shadow, setShadow] = useState(tetromino);
  const [combo, setCombo] = useState(-1);

  const speed = 0.1 || (Date.now() - (gameStartTimestamp || 0)) / 30_000;

  const shadow = getShadow(tetromino, map);

  const restart = () => {
    const newSeeds = generateSeeds(2);
    setSeeds(newSeeds);
    setMap(makeNewMap());
    setSwap(null);
    setTetromino(generateTetromino(newSeeds[0]));
  };

  const nextTetromino = () => {
    if (isGameOver) {
      return;
    }
    setSeeds((s) => {
      const [_, ...k] = s;
      if (k.length <= 8) {
        return [...k, ...generateSeeds()];
      }
      return k;
    });
    const nextTetromino = generateTetromino(seeds[1]);
    if (checkCollision(map, nextTetromino)) {
      onGameOver?.(Date.now());
    } else {
      setTetromino(nextTetromino);
    }
  };

  const appendGarbageLines = (count: number) => {
    garbageLineCount.current += count;
  };

  const gameOverReset = () => {};

  // Ref: https://strategywiki.org/wiki/Tetris/Controls
  function keyboardControl(e: KeyboardEvent) {
    if (isPaused || isGameOver) {
      return;
    }
    switch (e.key) {
      case "ArrowRight": {
        e.preventDefault();
        const [newTetromino] = moveTetromino(tetromino, "right", map);
        setTetromino(newTetromino);
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        const [newTetromino] = moveTetromino(tetromino, "left", map);
        setTetromino(newTetromino);
        break;
      }
      case "x":
      case "X":
      case "ArrowUp": {
        e.preventDefault();
        const [newTetromino] = moveTetromino(tetromino, "rotateCw", map);
        setTetromino(newTetromino);
        break;
      }
      case "z":
      case "Z":
      case "Meta":
      case "Control": {
        e.preventDefault();
        const [newTetromino] = moveTetromino(tetromino, "rotateCcw", map);
        setTetromino(newTetromino);
        break;
      }
      case "ArrowDown": {
        e.preventDefault();
        const [newTetromino, toSolidate] = moveTetromino(
          tetromino,
          "drop",
          map
        );
        if (toSolidate) {
          const [newMap, lineClearCount] = solidate(newTetromino, map);
          if (garbageLineCount.current) {
            setMap([
              ...newMap.slice(garbageLineCount.current),
              ...Array.from(new Array(garbageLineCount.current), (_) =>
                generateGarbageLine()
              ),
            ]);
            garbageLineCount.current = 0;
          } else {
            setMap(newMap);
          }
          if (lineClearCount) {
            onLineClear?.(combo);
            setCombo((c) => c + 1);
          } else {
            setCombo(-1);
          }
          nextTetromino();
        } else {
          setTetromino(newTetromino);
        }

        break;
      }
      case " ": {
        e.preventDefault();
        const [newTetromino, toSolidate] = moveTetromino(
          tetromino,
          "hardDrop",
          map
        );
        if (toSolidate) {
          const [newMap, lineClearCount] = solidate(newTetromino, map);
          if (garbageLineCount.current) {
            setMap([
              ...newMap.slice(garbageLineCount.current),
              ...Array.from(new Array(garbageLineCount.current), (_) =>
                generateGarbageLine()
              ),
            ]);
            garbageLineCount.current = 0;
          } else {
            setMap(newMap);
          }
          if (lineClearCount) {
            onLineClear?.(combo);
            setCombo((c) => c + 1);
          } else {
            setCombo(-1);
          }
          nextTetromino();
        } else {
          setTetromino(newTetromino);
        }
        break;
      }
      case "c":
      case "C":
      case "Shift": {
        e.preventDefault();
        if (swap === null) {
          setSwap(seeds[0]);
          nextTetromino();
        } else {
          console.log(`${seeds[0]} in ${swap} out`);
          setSwap(seeds[0]);
          setSeeds((s) => {
            const [_, ...k] = s;
            return [swap, ...k];
          });
          setTetromino(generateTetromino(swap));
        }
      }

      default:
        break;
    }
  }

  if (engineConnector) {
    engineConnector.current = {appendGarbageLines};
  }

  //useEffect(() => {
  //  setShadow(getShadow(tetromino, map));
  //}, [tetromino, map]);

  useEffect(() => {
    if (isPaused) {
      clearInterval(intervalRef.current);
      return;
    }
    if (isGameOver) {
      clearInterval(intervalRef.current);
      return;
    }
    const now = Date.now();
    if (tetromino.y !== lastY.current) {
      timestampRef.current = now;
    }
    lastY.current = tetromino.y;
    intervalRef.current = setInterval(() => {
      //console.log("interval running");

      const [newTetromino, toSolidate] = moveTetromino(tetromino, "drop", map);
      if (toSolidate) {
        const [newMap, lineClearCount] = solidate(newTetromino, map);
        if (garbageLineCount.current) {
          setMap([
            ...newMap.slice(garbageLineCount.current),
            ...Array.from(new Array(garbageLineCount.current), (_) =>
              generateGarbageLine()
            ),
          ]);
          garbageLineCount.current = 0;
        } else {
          setMap(newMap);
        }
        if (lineClearCount) {
          onLineClear?.(combo);
          setCombo((c) => c + 1);
        } else {
          setCombo(-1);
        }
        nextTetromino();
      } else {
        setTetromino(newTetromino);
      }
    }, minMax(1000 / speed, 150, 1000) - now + timestampRef.current);
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [tetromino, isGameOver, isPaused]);

  useEffect(() => {
    onSnapshot?.({
      map,
      tetromino,
      shadow,
      swap,
      pendingGarbageLineCount: garbageLineCount.current,
      seeds,
    });
  }, [tetromino, isPaused]);

  //useEffect(() => {
  //  if (isGameOver) {
  //    alert("GAMEOVER RESET");
  //    const newSeeds = generateSeeds(2);
  //    setSeeds(newSeeds);
  //    setTetromino(generateTetromino(newSeeds[0]));
  //    setMap(makeNewMap());
  //    setCombo(-1);
  //    clearInterval(intervalRef.current);
  //    return;
  //  }
  //}, [isGameOver]);

  useEffect(() => {
    window.addEventListener("keydown", keyboardControl);
    return () => {
      window.removeEventListener("keydown", keyboardControl);
    };
  }, [keyboardControl]);

  return {
    gameMode: gameMode || "default",
    map,
    keyboardControl,
    tetromino,
    shadow,
    seeds,
    swap,
    combo,
    garbageLineCount,
  };
};
