import { Component, Input, OnInit, input } from '@angular/core';
import { BoardService } from '../../Services/board.service';
import { CommonModule } from '@angular/common';
import { GreyCell, Pion, Player1, Player2 } from '../../Models/pion';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SupabaseService } from '../../Services/supabase.service';
import { createClient } from '@supabase/supabase-js';

type OnCellClickCallback = (
  row: number,
  col: number,
  newRow: number,
  newCol: number,
  pawn: Pion
) => void;

@Component({
  selector: 'app-game-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.css'],
})
export class GamePageComponent {
  board: Pion[][] = [];
  highlightedPositions: { row: number; col: number }[] = [];
  highlightedJump: { row: number; col: number }[] = [];
  selectedPion: { row: number; col: number } | null = null;
  player1PionCount: number = 1;
  player2PionCount: number = 1;
  winner: string | undefined;
  selectedPionColor: string | null = null;

  connectGameForm = this.formBuilder.group({ gameId: '' });
  createGameForm = this.formBuilder.group({});

  protected boardId: number;
  private onBoardClick = new Array<OnCellClickCallback>();

  constructor(
    protected boardService: BoardService,
    protected router: Router,
    protected formBuilder: FormBuilder
  ) {
    let board = this.boardService.generateRandomBoard();
    this.board = board.board;
    this.boardId = board.id;
    this.updatePionCounts();
  }

  protected onCellClick(callback: OnCellClickCallback) {
    this.onBoardClick.push(callback);
  }

  handleCellClick(row: number, col: number) {
    const clickedPion = this.board[row][col];
    if (clickedPion.player === 1 || clickedPion.player === 2) {
      this.selectedPionColor = clickedPion.color;
      if (this.selectedPionColor == 'red') {
        this.selectedPionColor = 'coral ';
      } else {
        this.selectedPionColor = 'steelblue ';
      }
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
        if (
          pos.newRow >= 0 &&
          pos.newRow < this.board.length &&
          pos.newCol >= 0 &&
          pos.newCol < this.board[row].length &&
          !this.board[pos.newRow][pos.newCol].hasPion
        ) {
          this.highlightedPositions.push({ row: pos.newRow, col: pos.newCol });
        }
      }

      for (const pos of jumpPositions) {
        if (
          pos.newRow >= 0 &&
          pos.newRow < this.board.length &&
          pos.newCol >= 0 &&
          pos.newCol < this.board[row].length &&
          !this.board[pos.newRow][pos.newCol].hasPion
        ) {
          this.highlightedJump.push({ row: pos.newRow, col: pos.newCol });
        }
      }

      this.selectedPion = { row, col };
      this.updatePionCounts();
      this.tcheckIfIsLoose();
    } else {
      this.movePion(row, col);
    }
  }

  movePion(newRow: number, newCol: number) {
    if (this.selectedPion) {
      const { row, col } = this.selectedPion;
      const clickedPion = this.board[row][col];

      if (
        this.highlightedPositions.some(
          (pos) => pos.row === newRow && pos.col === newCol
        ) ||
        this.highlightedJump.some(
          (pos) => pos.row === newRow && pos.col === newCol
        )
      ) {
        this.updatePawn(row, col, newRow, newCol, clickedPion);

        for (let callback of this.onBoardClick) {
          callback(row, col, newRow, newCol, this.board[newRow][newCol]);
        }
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
      { newRow: row + 1, newCol: col + 1 },
    ];

    for (const pos of adjacentPositions) {
      if (
        pos.newRow >= 0 &&
        pos.newRow < this.board.length &&
        pos.newCol >= 0 &&
        pos.newCol < this.board[row].length
      ) {
        const adjacentPion = this.board[pos.newRow][pos.newCol];
        if (
          (pion instanceof Player1 && adjacentPion instanceof Player2) ||
          (pion instanceof Player2 && adjacentPion instanceof Player1)
        ) {
          this.setPawn(
            pos.newRow,
            pos.newCol,
            pion instanceof Player1 ? new Player1() : new Player2()
          );
        }
      }
    }
  }

  protected updatePawn(
    row: number,
    col: number,
    newRow: number,
    newCol: number,
    clickedPion: Pion
  ) {
    const isAdjacentMove =
      Math.abs(newRow - row) <= 1 && Math.abs(newCol - col) <= 1;

    if (clickedPion instanceof Player1 || clickedPion instanceof Player2) {
      const newPion =
        clickedPion instanceof Player1 ? new Player1() : new Player2();
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

  protected setPawn(row: number, col: number, pawn: Pion) {
    this.board[row][col] = pawn;
  }

  isHighlighted(row: number, col: number): boolean {
    return this.highlightedPositions.some(
      (pos) => pos.row === row && pos.col === col
    );
  }

  isHighlightedJump(row: number, col: number): boolean {
    return this.highlightedJump.some(
      (pos) => pos.row === row && pos.col === col
    );
  }

  updatePionCounts() {
    this.player1PionCount = this.countPions(Player1);
    this.player2PionCount = this.countPions(Player2);
  }

  tcheckIfIsLoose() {
    if (this.player1PionCount === 0) {
      console.log('Player 2 wins');
      this.winner = 'Player 2';
      this.router.navigate(['/win-page']);
    }
    if (this.player2PionCount === 0) {
      console.log('Player 1 wins');
      this.winner = 'Player 1';
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
