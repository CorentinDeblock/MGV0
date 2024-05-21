import { bootstrapApplication } from '@angular/platform-browser';
import { GamePageComponent } from './app/Component/game-page/game-page.component'; // Assurez-vous que le chemin est correct

bootstrapApplication(GamePageComponent)
  .catch(err => console.error(err));
