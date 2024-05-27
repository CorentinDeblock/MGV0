import { Component, Input, OnInit, input } from '@angular/core';
import { BoardService } from '../../Services/board.service';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { GameChannel, SupabaseService } from '../../Services/supabase.service';
import { GamePageComponent } from '../game-page/game-page.component';
import { CommonModule } from '@angular/common';
import { Player1 } from '../../Models/pion';

@Component({
  selector: 'app-game-multiplayer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './game-multiplayer.component.html',
  styleUrl: './game-multiplayer.component.css',
})
export class GameMultiplayerComponent extends GamePageComponent {
  @Input() gameId: string = '';
  gameChannel?: GameChannel;

  constructor(
    protected override router: Router,
    protected override boardService: BoardService,
    protected override formBuilder: FormBuilder,
    private supabaseService: SupabaseService
  ) {
    super(boardService, router, formBuilder);
  }

  private initGameChannel() {
    this.onCellClick((row, col, newRow, newCol, newPion) => {
      console.log('Sending move pawn');
      this.gameChannel?.send('move-pawn', col, row, newRow, newCol, newPion);
    });

    this.gameChannel?.on('move-pawn', (row, col, newRow, newCol, newPion) => {
      console.log('Updating pawn', {
        row,
        col,
        newRow,
        newCol,
        newPion,
      });

      this.updateBoard(row, col, newRow, newCol, newPion);
    });
  }

  onGameConnect() {
    if (this.connectGameForm.value.gameId) {
      this.gameChannel = this.supabaseService.Game.joinGame(
        this.connectGameForm.value.gameId
      );
      this.connectGameForm.reset();

      this.gameChannel.onSync(() => {
        console.log('Connected');
        this.gameChannel!.send('request-map');
      });

      this.gameChannel.on('respond-map', (data) => {
        this.board = this.boardService.generateBoard(data.boardIndex);
        this.updatePionCounts();
      });

      this.initGameChannel();
    }
  }

  onGameCreate() {
    this.gameChannel = this.supabaseService.Game.createGame();
    this.gameId = this.gameChannel.id;

    this.gameChannel.on('request-map', () => {
      this.gameChannel?.send('respond-map', { boardIndex: this.boardId });
    });

    let board = this.boardService.generateRandomBoard();
    this.board = board.board;
    this.boardId = board.id;
    this.updatePionCounts();
    this.initGameChannel();
  }
}
