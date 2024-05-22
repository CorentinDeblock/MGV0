import { Component, OnInit } from '@angular/core';
import { BoardService } from '../../Services/board.service';
import { CommonModule } from '@angular/common';
import { GreyCell, Pion, Player1, Player2 } from '../../Models/pion';
import { Router } from '@angular/router';

type CellType = Player1 | Player2 | GreyCell;

@Component({
  selector: 'app-game-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.css']
})

export class GamePageComponent implements OnInit {
  board: Pion[][] = [];
  highlightedPositions: { row: number, col: number }[] = [];
  highlightedJump: { row: number, col: number }[] = [];
  selectedPion: { row: number, col: number } | null = null;
  player1PionCount: number = 1;
  player2PionCount: number = 1;
  winner: string | undefined;
  selectedPionColor: string | null = null;

  constructor(
    private boardService: BoardService,
    private router: Router
  ) {}

  ngOnInit() {
    this.board = this.boardService.generateBoard(8);
    this.generateRandomBoard();
    this.updatePionCounts();
  }



  generateRandomBoard(): void {
    const map1: [number, number, CellType][] = [
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
  ];
  
  const map2: [number, number, CellType][] = [
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
  ];
  
  const map3: [number, number, CellType][] = [
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
  ];
  
    const maps = [map1, map2, map3];
    const randomIndex = Math.floor(Math.random() * maps.length);
    const selectedMap = maps[randomIndex];

    for (let i = 0; i < selectedMap.length; i++) {
        const item = selectedMap[i];
        const row = item[0];
        const col = item[1];
        const cell = item[2];
        this.board[row][col] = cell;
    }

  }

  handleCellClick(row: number, col: number) {
    const clickedPion = this.board[row][col];
    if (clickedPion.player === 1 || clickedPion.player === 2) {
      this.selectedPionColor = clickedPion.color;
      this.highlightedPositions = [];
      this.highlightedJump = [];
      const adjacentPositions = [
        { newRow: row - 1, newCol: col },
        { newRow: row - 1, newCol: col + 1 }, 
        { newRow: row + 1, newCol: col + 1 },
        { newRow: row - 1, newCol: col - 1 },
        { newRow: row + 1, newCol: col - 1 },
        { newRow: row + 1, newCol: col },
        { newRow: row, newCol: col - 1 },
        { newRow: row, newCol: col + 1 },
      ];
      const jumpPositions = [
        { newRow: row + 2, newCol: col },
        { newRow: row, newCol: col - 2 },
        { newRow: row, newCol: col + 2 },
        { newRow: row - 2, newCol: col },
      ];

      for (const pos of adjacentPositions) {
        if (pos.newRow >= 0 && pos.newRow < this.board.length &&
            pos.newCol >= 0 && pos.newCol < this.board[row].length &&
            !this.board[pos.newRow][pos.newCol].hasPion) {
          this.highlightedPositions.push({ row: pos.newRow, col: pos.newCol });
        }
      }

      for (const pos of jumpPositions) {
        if (pos.newRow >= 0 && pos.newRow < this.board.length &&
            pos.newCol >= 0 && pos.newCol < this.board[row].length &&
            !this.board[pos.newRow][pos.newCol].hasPion) {
          this.highlightedJump.push({ row: pos.newRow, col: pos.newCol });
        }
      }

      this.selectedPion = { row, col };
      this.updatePionCounts();
      this.tcheckIfIsLoose();
    } else {
      if (this.selectedPion) {
        this.movePion(row, col);
      }
    }
  }

  movePion(newRow: number, newCol: number) {
    if (this.selectedPion) {
      const { row, col } = this.selectedPion;
      const clickedPion = this.board[row][col];
      const isAdjacentMove = Math.abs(newRow - row) <= 1 && Math.abs(newCol - col) <= 1;
      
      if (this.highlightedPositions.some(pos => pos.row === newRow && pos.col === newCol) ||
          this.highlightedJump.some(pos => pos.row === newRow && pos.col === newCol)) {
          if (clickedPion instanceof Player1 || clickedPion instanceof Player2) {
              const newPion = clickedPion instanceof Player1 ? new Player1() : new Player2();
              this.board[newRow][newCol] = newPion;
              if (!isAdjacentMove) {
                  this.board[row][col] = new Pion();
              }
              this.checkAndTransformAdjacentPions(newRow, newCol, newPion);
              this.updatePionCounts();
              this.tcheckIfIsLoose();
          }
          this.highlightedPositions = [];
          this.highlightedJump = [];
          this.selectedPion = null;
      }
    }
  }

  checkAndTransformAdjacentPions(row: number, col: number, pion: Pion) {
      const adjacentPositions = [
        { newRow: row - 1, newCol: col },
        { newRow: row + 1, newCol: col },
        { newRow: row, newCol: col - 1 },
        { newRow: row, newCol: col + 1 },
        { newRow: row - 1, newCol: col - 1 },
        { newRow: row - 1, newCol: col + 1 },
        { newRow: row + 1, newCol: col - 1 },
        { newRow: row + 1, newCol: col + 1 }
      ];
    for (const pos of adjacentPositions) {
      if (pos.newRow >= 0 && pos.newRow < this.board.length &&
          pos.newCol >= 0 && pos.newCol < this.board[row].length) {
        const adjacentPion = this.board[pos.newRow][pos.newCol];
        if ((pion instanceof Player1 && adjacentPion instanceof Player2) ||
           
        (pion instanceof Player2 && adjacentPion instanceof Player1)) {
          this.board[pos.newRow][pos.newCol] = pion instanceof Player1 ? new Player1() : new Player2();
        }
      }
    }
  }

  isHighlighted(row: number, col: number): boolean {
    return this.highlightedPositions.some(pos => pos.row === row && pos.col === col);
  }

  isHighlightedJump(row: number, col: number): boolean {
    return this.highlightedJump.some(pos => pos.row === row && pos.col === col);
  }

  updatePionCounts() {
    this.player1PionCount = this.countPions(Player1);
    this.player2PionCount = this.countPions(Player2);
  }

  tcheckIfIsLoose() {
    if (this.player1PionCount === 0) {
      console.log('Player 2 wins');
      this.winner = "Player 2";
      this.router.navigate(['/win-page']);
    }
    if (this.player2PionCount === 0) {
      console.log('Player 1 wins');
      this.winner = "Player 1";
      this.router.navigate(['/win-page']);
    }
  }

  countPions(pionType: any): number {
    let count = 0;
    for (let row of this.board) {
      for (let pion of row) {
        if (pion instanceof pionType) {
          count++;
        }
      }
    }
    return count;
  }
}
