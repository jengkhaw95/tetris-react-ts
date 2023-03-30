import { useEffect, useRef, useState } from "react";
import { checkCollision, generateSeeds, generateTetromino, getShadow, makeNewMap, minMax, moveTetromino, solidate } from "./utils";

export
    const useTetrisEngine = () => {
        const gameStartTimestamp = useRef<number>(Date.now());
        const intervalRef = useRef<NodeJS.Timer>();
        const lastY = useRef<number>();
        const timestampRef = useRef<number>(0);
        const [seeds, setSeeds] = useState<number[]>(generateSeeds(2));
        const [isGameOver, setIsGameOver] = useState(false);
        const [map, setMap] = useState<number[][]>(() => makeNewMap());
        const [swap, setSwap] = useState<number | null>(null);
        const [tetromino, setTetromino] = useState(() => generateTetromino(seeds[0]));
        const [shadow, setShadow] = useState(tetromino);

        const speed = 0.1 || (Date.now() - gameStartTimestamp.current) / 30_000;

        const resetMap = () => {
            setIsGameOver(false);
            setMap(makeNewMap());
            gameStartTimestamp.current = Date.now();
        };
        const regenerateTetromino = () => {
            setIsGameOver(false);
            setSeeds(generateSeeds(2));
            setSwap(null);
        };
        const nextTetromino = () => {
            setIsGameOver(false);
            setSeeds((s) => {
                const [_, ...k] = s;
                if (k.length <= 8) {
                    return [...k, ...generateSeeds()];
                }
                return k;
            });
            const nextTetromino = generateTetromino(seeds[0]);
            if (checkCollision(map, nextTetromino)) {
                setIsGameOver(true);
                resetMap();
                regenerateTetromino();
            } else {
                setTetromino(nextTetromino);
            }
        };

        // Ref: https://strategywiki.org/wiki/Tetris/Controls
        function keyboardControl(e: KeyboardEvent) {
            switch (e.key) {
                case "ArrowRight": {
                    const [newTetromino] = moveTetromino(tetromino, "right", map);
                    setTetromino(newTetromino);
                    break;
                }
                case "ArrowLeft": {
                    const [newTetromino] = moveTetromino(tetromino, "left", map);
                    setTetromino(newTetromino);
                    break;
                }
                case "x":
                case "X":
                case "ArrowUp": {
                    const [newTetromino] = moveTetromino(tetromino, "rotateCw", map);
                    setTetromino(newTetromino);
                    break;
                }
                case "z":
                case "Z":
                case "Meta":
                case "Control": {
                    const [newTetromino] = moveTetromino(tetromino, "rotateCcw", map);
                    setTetromino(newTetromino);
                    break;
                }
                case "ArrowDown": {
                    const [newTetromino, toSolidate] = moveTetromino(
                        tetromino,
                        "drop",
                        map
                    );
                    if (toSolidate) {
                        setMap(solidate(newTetromino, map));
                        nextTetromino();
                    } else {
                        setTetromino(newTetromino);
                    }

                    break;
                }
                case " ": {
                    const [newTetromino, toSolidate] = moveTetromino(
                        tetromino,
                        "hardDrop",
                        map
                    );
                    if (toSolidate) {
                        setMap(solidate(newTetromino, map));
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
                        setSwap(seeds[0]);
                        setSeeds((s) => {
                            const [_, ...k] = s;
                            return [swap, ...k];
                        });
                    }
                }

                default:
                    break;
            }
        }

        useEffect(() => {
            setTetromino(generateTetromino(seeds[0]));
        }, [seeds]);

        useEffect(() => {
            setShadow(getShadow(tetromino, map));
        }, [tetromino, map]);

        useEffect(() => {
            if (isGameOver) {
                return;
            }
            const now = Date.now();
            if (tetromino.y !== lastY.current) {
                timestampRef.current = now;
            }
            lastY.current = tetromino.y;
            intervalRef.current = setInterval(() => {
                const [newTetromino, toSolidate] = moveTetromino(tetromino, "drop", map);
                if (toSolidate) {
                    setMap(solidate(newTetromino, map));
                    nextTetromino();
                } else {
                    setTetromino(newTetromino);
                }
            }, minMax(1000 / speed, 150, 1000) - now + timestampRef.current);
            return () => {
                clearInterval(intervalRef.current);
            };
        }, [tetromino, isGameOver]);

        useEffect(() => {
            window.addEventListener("keydown", keyboardControl);
            return () => {
                window.removeEventListener("keydown", keyboardControl);
            };
        }, [keyboardControl]);

        return {
            map,
            keyboardControl,
            resetMap,
            regenerateTetromino,
            tetromino,
            shadow,
            seeds,
            swap,
        };
    };