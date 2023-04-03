A tetris game created with `React`.

## Features

- Basic keyboard controls, including `swapping`
- Wallkick SRS implementation, also T-spin
- Multiplayer battle

## Todo

### Frontend

- [ ] UI on combo
- [ ] Multiplayer UI Layout
- [ ] Custom username for multiplayer
- [ ] Keep track of line clear per sec, max combo, total line clear
- [ ] T-spin/perfect clear as bonus combo

### Server

- [ ] End game when all others have left.
- [ ] Set timers to manually end the game on server.

### Completed

- [x] Tetromino shapes
- [x] Level (? increase speed according to time passed since game start)
- [x] Tetromino rotation logic (SRS)
- [x] WS server/client (For multiple-player)
- [x] Scoring/Combo calculation
- [x] UI on garbage gauge
- [x] Multiplayer statring countdown display
- [x] Snapshot on start
