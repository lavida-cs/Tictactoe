class TicTacToe {
   constructor() {
      this.board = Array(9).fill(null);
      this.currentPlayer = "X"
      this.cpuMarker = "O"
      this.playerMarker = "X"
      this.state = this.loadGameState() || {
         mode: null,
         running: false,
         scores: { X: 0, O: 0, tie: 0 }
      }
      this.sounds = {
         clickSound: new Audio("/assets/sounds/clicked.wav"),
         playerWinSound: new Audio("/assets/sounds/player-win.wav"),
         cpuWinSound: new Audio("/assets/sounds/cpu-win.wav"),
         tieSound: new Audio("/assets/sounds/tie-sound.wav")
      }
      this.initDomElements();
      this.renderGame()
      this.bindEvents();
   }
   
   initDomElements() {
      this.screenSetup = document.querySelector(".screen--setup");
      this.toggleBtn = document.querySelector(".toggle-input");
      this.cpuBtn = document.querySelector(".btn--cpu");
      this.playerBtn = document.querySelector(".btn--player");
      this.screenGame = document.querySelector(".screen--game");
      this.cells = document.querySelectorAll(".box");
      this.xScore = document.querySelector(".score--x");
      this.tieScore = document.querySelector(".score--tie");
      this.oScore = document.querySelector(".score--o");
      this.popupModal = document.querySelector(".popup-modal");
      this.restartBtn = document.querySelector(".btn--restart");
      this.quitBtn = document.querySelector(".btn--quit");
      this.nextRoundBtn = document.querySelector(".btn--next-round");
      this.modalOverlay = document.querySelector(".overlay");
      this.winMarkar = document.querySelector(".win-mark");
   }
   
   bindEvents() {
      this.addListener(this.toggleBtn, "change", () => this.setCurrentPlayer())
      this.addListener(this.cpuBtn, "click", () => this.setMode("cpuMode"))
      this.addListener(this.playerBtn, "click", () => this.setMode("playerMode"))
      this.cells.forEach(cell => {
         this.addListener(cell, 'click', () => this.clickedCell(cell))
      })
      this.addListener(this.quitBtn, "click", () => this.quitGame())
      this.addListener(this.nextRoundBtn, "click", () => this.startNextRound())
      this.addListener(this.restartBtn, "click", () => this.restartGame())
   }
   
   // add event listeners to elements 
   addListener(ele, type, func) {
      ele.addEventListener(type, func);
   }
   // set current player
   setCurrentPlayer() {
      this.sounds.clickSound.play()
      this.cpuMarker = this.toggleBtn.checked ? "X" : "O"
      this.playerMarker = this.toggleBtn.checked ? "O" : "X"
   }
   // toggle current player
   toggleCurrentPlayer() {
      this.currentPlayer = this.currentPlayer === "X" ? "O" : "X"
   }
   // set choosen mode start the game
   setMode(mode) {
      this.state.running = true
      this.setCurrentPlayer()
      this.state.mode = mode;
      this.screenGame.classList.remove("hide")
      this.screenSetup.classList.add("hide")
      // if in cpu mode, and cpu is X, cpu goes first
      if (this.state.running && this.state.mode === "cpuMode" && this.cpuMarker === "X") {
         setTimeout(() => { this.makeCpuMove() }, 300)
      }
      this.saveGameState()
   }
   // get empty cells
   getEmptyCells() {
      let emptys = []
      this.board.forEach((c, i) => {
         if (c === null) {
            emptys.push(i)
         }
      })
      return emptys
   }
   
   // winning combination 
   getWinningCombinations() {
      return [
         [0, 1, 2],
         [3, 4, 5],
         [6, 7, 8],
         [0, 3, 6],
         [1, 4, 7],
         [2, 5, 8],
         [0, 4, 8],
         [2, 4, 6]
      ]
   }
   
   getCpuMove() {
      let combinations = this.getWinningCombinations();
      let winIndex = null;
      let blockIndex = null;
      
      // Check for win move (CPU)
      for (const combo of combinations) {
         let winCount = 0;
         let emptyIndex = null;
         for (const index of combo) {
            if (this.board[index] === this.cpuMarker) {
               winCount++;
            } else if (this.board[index] === null) {
               emptyIndex = index;
            }
         }
         if (winCount === 2 && emptyIndex !== null) {
            return emptyIndex;
         }
      }
      // Check for blocking move (Player)
      for (const combo of combinations) {
         let blockCount = 0;
         let emptyIndex = null;
         for (const index of combo) {
            if (this.board[index] === this.playerMarker) {
               blockCount++;
            } else if (this.board[index] === null) {
               emptyIndex = index;
            }
         }
         if (blockCount === 2 && emptyIndex !== null) {
            return emptyIndex;
         }
      }
      // If no win or block move, return random move
      let emptys = this.getEmptyCells();
      return emptys[Math.floor(Math.random() * emptys.length)];
   }
   
   // check tie
   checkTie() {
      return this.board.every(cell => cell !== null)
   }
   
   // check win
   checkWin() {
      const winCombo = this.getWinningCombinations();
      for (const [a, b, c] of winCombo) {
         if (this.board[a] !== null &&
            this.board[a] === this.board[b] &&
            this.board[a] === this.board[c]) {
            return this.board[a];
         }
      }
      return false;
   }
   
   // make cpu move
   makeCpuMove() {
      if (!this.state.running) return;
      let emptyCells = this.getEmptyCells()
      if (emptyCells.length === 0) return;
      let moveIndex = this.getCpuMove()
      this.sounds.clickSound.play()
      this.board[moveIndex] = this.cpuMarker
      this.cells[moveIndex].textContent = this.cpuMarker
      this.cells[moveIndex].classList.add(`marker--${this.cpuMarker.toLowerCase()}-clr`)
      let isWinMove = this.checkWin()
      if (isWinMove) {
         this.sounds.cpuWinSound.play()
         this.showPopup(isWinMove)
         this.updateScores(this.cpuMarker)
         return
      }
      if (this.checkTie()) {
         this.sounds.tieSound.play()
         this.showPopup("TIE")
         this.updateScores("tie")
         return
      }
   }
   
   // clicked cell
   clickedCell(cell) {
      if (!this.state.running) return;
      let i = cell.dataset.index
      if (this.board[i] !== null) return
      let marker = this.state.mode === "playerMode" ? this.currentPlayer : this.playerMarker
      this.sounds.clickSound.play()
      this.board[i] = marker
      cell.textContent = marker
      cell.classList.add(`marker--${marker.toLowerCase()}-clr`)
      let isWinMove = this.checkWin()
      if (isWinMove) {
         this.sounds.playerWinSound.play()
         this.showPopup(isWinMove)
         this.updateScores(marker)
         return
      }
      if (this.checkTie()) {
         this.sounds.tieSound.play()
         this.showPopup("TIE")
         this.updateScores("tie")
         return
      }
      if (this.state.mode === "playerMode") this.toggleCurrentPlayer()
      // if in cpu mode, cpu plays next
      if (this.state.running && this.state.mode === "cpuMode") {
         setTimeout(() => { this.makeCpuMove() }, 300)
      }
      
   }
   
   //update scores
   updateScores(marker) {
      this.state.scores[marker]++
      this.xScore.textContent = this.state.scores["X"]
      this.oScore.textContent = this.state.scores["O"]
      this.tieScore.textContent = this.state.scores['tie']
      this.saveGameState()
   }
   
   // show popup
   showPopup(marker) {
      this.popupModal.classList.toggle('hide')
      this.modalOverlay.classList.toggle("hide")
      this.winMarkar.textContent = marker
   }
   
   // cleanBoard
   clearBoard() {
      this.board = Array(9).fill(null)
      this.cells.forEach(cell => {
         cell.className = "box"
         cell.textContent = ""
      })
   }
   
   // restart Game
   restartGame() {
      this.sounds.clickSound.play()
      this.state.running = true;
      this.currentPlayer = "X"
      this.state.scores = { X: 0, O: 0, tie: 0 }
      this.clearBoard()
      if (this.state.running && this.state.mode === "cpuMode" && this.cpuMarker === "X") {
         setTimeout(() => { this.makeCpuMove() }, 300)
      }
      this.xScore.textContent = this.state.scores["X"]
      this.oScore.textContent = this.state.scores["O"]
      this.tieScore.textContent = this.state.scores['tie']
      this.saveGameState()
   }
   
   // next round
   startNextRound() {
      this.sounds.clickSound.play()
      this.state.running = true;
      this.saveGameState()
      this.currentPlayer = "X"
      this.clearBoard()
      this.popupModal.classList.toggle('hide')
      this.modalOverlay.classList.toggle("hide")
      if (this.state.running && this.state.mode === "cpuMode" && this.cpuMarker === "X") {
         setTimeout(() => { this.makeCpuMove() }, 300)
      }
   }
   
   // quit game
   quitGame() {
      this.sounds.clickSound.play()
      this.state.running = false;
      this.saveGameState()
      this.currentPlayer = "X"
      this.clearBoard()
      this.popupModal.classList.toggle('hide')
      this.modalOverlay.classList.toggle("hide")
      this.screenSetup.classList.toggle("hide")
      this.screenGame.classList.toggle("hide")
   }
   
   // render Game
   renderGame() {
      this.xScore.textContent = this.state.scores["X"]
      this.oScore.textContent = this.state.scores["O"]
      this.tieScore.textContent = this.state.scores['tie']
      if (this.state.running) {
         this.screenSetup.classList.toggle("hide")
         this.screenGame.classList.toggle("hide")
      }
   }
   
   // save to local storage 
   saveGameState() {
      let jsonGameState = JSON.stringify(this.state)
      localStorage.setItem("state", jsonGameState)
   }
   
   // load state
   loadGameState() {
      let gameState;
      if (localStorage.getItem("state")) {
         gameState = JSON.parse(localStorage.getItem("state"))
         return gameState
      }
      return false
   }
   
}

new TicTacToe();