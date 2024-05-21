export class Pion {
    hasPion: boolean;
    player: number;
    color: string;
  
    constructor() {
      this.hasPion = false;
      this.player = 0;
      this.color = "white";
    }
  
    transform() {
      this.hasPion = !this.hasPion;
    }
  }
  
  export class Player1 extends Pion {
    constructor() {
      super();
      this.player = 1;
      this.color = "red";
      this.hasPion = true;
    }
  }
  
  export class Player2 extends Pion {
    constructor() {
      super();
      this.player = 2;
      this.color = "blue";
      this.hasPion = true;
    }
  }