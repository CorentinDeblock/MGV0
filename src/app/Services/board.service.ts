import { Injectable } from '@angular/core';
import { Pion } from '../Models/pion';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  generateBoard(size: number): Pion[][] {
    return Array.from({ length: size }, () => Array(size).fill(null).map(() => new Pion()));
  }
}
