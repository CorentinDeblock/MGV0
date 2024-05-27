import { Injectable } from '@angular/core';
import { GreyCell, Pion, Player1, Player2 } from '../Models/pion';

type CellType = Player1 | Player2 | GreyCell;

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private maps : Array<[number, number, CellType][]> = [
    [
      [3, 3, new Player1()],
      [4, 4, new Player1()],
      [3, 4, new Player2()],
      [4, 3, new Player2()],
      [2, 3, new GreyCell()],
      [2, 4, new GreyCell()],
      [3, 2, new GreyCell()],
      [4, 2, new GreyCell()],
      [5, 3, new GreyCell()],
      [5, 4, new GreyCell()],
      [5, 3, new GreyCell()],
      [5, 4, new GreyCell()],
      [5, 3, new GreyCell()],
      [5, 4, new GreyCell()],
      [3, 5, new GreyCell()],
      [4, 5, new GreyCell()],
    ],
    [
      [1, 2, new Player1()],
      [6, 5, new Player2()],
      [1, 1, new GreyCell()],
      [2, 2, new GreyCell()],
      [2, 4, new GreyCell()],
      [1, 5, new GreyCell()],
      [3, 5, new GreyCell()],
      [4, 2, new GreyCell()],
      [5, 3, new GreyCell()],
      [6, 2, new GreyCell()],
      [5, 5, new GreyCell()],
      [6, 6, new GreyCell()],
    ],
    [
      [0, 0, new Player1()],
      [4, 4, new Player1()],
      [3, 3, new Player2()],
      [7, 7, new Player2()],
      [0, 1, new GreyCell()],
      [1, 1, new GreyCell()],
      [2, 1, new GreyCell()],
      [3, 1, new GreyCell()],
      [4, 1, new GreyCell()],
      [5, 1, new GreyCell()],
      [6, 2, new GreyCell()],
      [6, 3, new GreyCell()],
      [5, 4, new GreyCell()],
      [4, 3, new GreyCell()],
      [2, 3, new GreyCell()],
      [3, 4, new GreyCell()],
      [1, 4, new GreyCell()],
      [1, 5, new GreyCell()],
      [1, 5, new GreyCell()],
      [2, 6, new GreyCell()],
      [3, 6, new GreyCell()],
      [4, 6, new GreyCell()],
      [5, 6, new GreyCell()],
      [6, 6, new GreyCell()],
      [7, 6, new GreyCell()],
    ]
  ]

  generateEmptyBoard(size: number) {
    return Array.from({ length: size }, () => Array(size).fill(null).map(() => new Pion()));
  }

  generateBoard(index: number): Pion[][] {
    const selectedMap = this.maps[index];
    let board = this.generateEmptyBoard(8);

    for (let i = 0; i < selectedMap.length; i++) {
      const item = selectedMap[i];
      const row = item[0];
      const col = item[1];
      const cell = item[2];
      board[row][col] = cell;
    }

    return board 
  }

  generateRandomBoard() {
    let id = Math.floor(Math.random() * this.maps.length);
    return {
      id,
      board: this.generateBoard(id)
    }
  }
}
