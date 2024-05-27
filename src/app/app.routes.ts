import { Routes } from '@angular/router';
import { GamePageComponent } from './Component/game-page/game-page.component';
import { WinPageComponent } from './Component/win-page/win-page.component';
import { GameMultiplayerComponent } from './Component/game-multiplayer/game-multiplayer.component';

export const routes: Routes = [
  { path: '', component: GamePageComponent, title: 'Game' },
  { path: 'multiplayer', component: GameMultiplayerComponent, title: 'Game multiplayer' },
  { path: 'win-page', component: WinPageComponent, title: 'Win Page' },
];
