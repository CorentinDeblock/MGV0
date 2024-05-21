import { Component, OnInit } from '@angular/core';
import { BoardService } from '../../Services/board.service';
import { CommonModule } from '@angular/common';
import { Pion, Player1, Player2 } from '../../Models/pion';

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
  player1PionCount: number = 0;
  player2PionCount: number = 0;

  constructor(private boardService: BoardService) {}

  ngOnInit() {
    this.board = this.boardService.generateBoard(8);
    // Placer des pions initiaux pour le joueur 1 et le joueur 2 pour test
    this.board[0][0] = new Player1();
    this.board[7][7] = new Player2();
    this.updatePionCounts();
  }

  highlightMoves(row: number, col: number) {
    const clickedPion = this.board[row][col];
    if (clickedPion.player === 1 || clickedPion.player === 2) {
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
        { newRow: row, newCol: col + 1 }
      ];
  
      const jumpPositions = [
        { newRow: row + 2, newCol: col }, 
        { newRow: row, newCol: col - 2 }, 
        { newRow: row, newCol: col + 2 }, 
        { newRow: row - 2, newCol: col }
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
    }
  }
  movePion(newRow: number, newCol: number) {
    if (this.selectedPion) {
      const { row, col } = this.selectedPion;
      const clickedPion = this.board[row][col];
      if (this.highlightedPositions.some(pos => pos.row === newRow && pos.col === newCol)) {
        const isAdjacentMove = Math.abs(newRow - row) <= 1 && Math.abs(newCol - col) <= 1;

        if (clickedPion instanceof Player1 || clickedPion instanceof Player2) {
          const newPion = clickedPion instanceof Player1 ? new Player1() : new Player2();
          this.board[newRow][newCol] = newPion;

          if (!isAdjacentMove) {
            this.board[row][col] = new Pion();
          }
          this.checkAndTransformAdjacentPions(newRow, newCol, newPion);
        }
        this.highlightedPositions = [];
        this.selectedPion = null;
      }
    }
    this.updatePionCounts();
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
          // Transformer le pion adjacent
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
