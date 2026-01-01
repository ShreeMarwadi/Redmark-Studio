


(function () {
    const authorizedDomains = [
        'localhost',
        '127.0.0.1',
        'github.io' // ✅ allow GitHub Pages
    ];

    const currentHost = window.location.hostname.toLowerCase();

    const isAuthorized = authorizedDomains.some(domain =>
        currentHost === domain || currentHost.endsWith('.' + domain)
    );

    if (!isAuthorized) {
        document.body.innerHTML = '<h1>🔒 Unauthorized Domain</h1>';
        return;
    }
})();


class ChessGame {
            constructor() {
                this.board = this.initialBoard();
                this.currentPlayer = 'white';
                this.selectedSquare = null;
                this.validMoves = [];
                this.gameOver = false;
                this.gameMode = null;
                this.playerColor = 'white';
                this.aiColor = 'black';
                this.moveHistory = [];
                this.capturedPieces = { white: [], black: [] };
                this.castlingRights = {
                    whiteKingside: true,
                    whiteQueenside: true,
                    blackKingside: true,
                    blackQueenside: true
                };
                this.enPassantTarget = null;
                this.fiftyMoveCounter = 0;
                this.repetitionPositions = [];
                
                this.pieceSymbols = {
                    white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
                    black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
                };
                
                this.pieceValues = {
                    pawn: 100,
                    knight: 320,
                    bishop: 330,
                    rook: 500,
                    queen: 900,
                    king: 20000
                };
            }

            initialBoard() {
                const board = Array(8).fill(null).map(() => Array(8).fill(null));
                
                // Pawns
                for (let i = 0; i < 8; i++) {
                    board[1][i] = { color: 'black', type: 'pawn' };
                    board[6][i] = { color: 'white', type: 'pawn' };
                }
                
                // Other pieces
                const backRow = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
                for (let i = 0; i < 8; i++) {
                    board[0][i] = { color: 'black', type: backRow[i] };
                    board[7][i] = { color: 'white', type: backRow[i] };
                }
                
                return board;
            }

            clone() {
                const clone = new ChessGame();
                clone.board = this.board.map(row => row.map(square => square ? { ...square } : null));
                clone.currentPlayer = this.currentPlayer;
                clone.selectedSquare = this.selectedSquare;
                clone.validMoves = this.validMoves;
                clone.gameOver = this.gameOver;
                clone.gameMode = this.gameMode;
                clone.playerColor = this.playerColor;
                clone.aiColor = this.aiColor;
                clone.moveHistory = [...this.moveHistory];
                clone.capturedPieces = {
                    white: [...this.capturedPieces.white],
                    black: [...this.capturedPieces.black]
                };
                clone.castlingRights = { ...this.castlingRights };
                clone.enPassantTarget = this.enPassantTarget;
                clone.fiftyMoveCounter = this.fiftyMoveCounter;
                clone.repetitionPositions = [...this.repetitionPositions];
                return clone;
            }

            getPieceAt(row, col) {
                if (row < 0 || row > 7 || col < 0 || col > 7) return null;
                return this.board[row][col];
            }

            isOpponentPiece(color, piece) {
                return piece && piece.color !== color;
            }

            isEmpty(piece) {
                return piece === null;
            }

            getValidMoves(row, col, checkKingSafety = true) {
                const piece = this.getPieceAt(row, col);
                if (!piece) return [];

                const moves = [];
                const color = piece.color;
                
                switch (piece.type) {
                    case 'pawn':
                        moves.push(...this.getPawnMoves(row, col, color));
                        break;
                    case 'rook':
                        moves.push(...this.getSlidingMoves(row, col, color, [[0,1], [0,-1], [1,0], [-1,0]]));
                        break;
                    case 'knight':
                        moves.push(...this.getKnightMoves(row, col, color));
                        break;
                    case 'bishop':
                        moves.push(...this.getSlidingMoves(row, col, color, [[1,1], [1,-1], [-1,1], [-1,-1]]));
                        break;
                    case 'queen':
                        moves.push(...this.getSlidingMoves(row, col, color, [[0,1], [0,-1], [1,0], [-1,0], [1,1], [1,-1], [-1,1], [-1,-1]]));
                        break;
                    case 'king':
                        moves.push(...this.getKingMoves(row, col, color, checkKingSafety));
                        break;
                }

                if (checkKingSafety) {
                    return moves.filter(move => {
                        const tempBoard = this.clone();
                        tempBoard.makeMoveWithoutValidation(row, col, move.row, move.col);
                        return !tempBoard.isInCheck(color);
                    });
                }

                return moves;
            }

            getPawnMoves(row, col, color) {
                const moves = [];
                const direction = color === 'white' ? -1 : 1;
                const startRow = color === 'white' ? 6 : 1;
                
                const newRow = row + direction;
                if (newRow >= 0 && newRow < 8 && this.isEmpty(this.getPieceAt(newRow, col))) {
                    moves.push({ row: newRow, col: col, isPromotion: newRow === 0 || newRow === 7 });
                    
                    const doubleRow = row + 2 * direction;
                    if (row === startRow && this.isEmpty(this.getPieceAt(doubleRow, col))) {
                        moves.push({ row: doubleRow, col: col });
                    }
                }
                
                for (const dc of [-1, 1]) {
                    const newCol = col + dc;
                    if (newCol >= 0 && newCol < 8) {
                        const targetPiece = this.getPieceAt(newRow, newCol);
                        if (targetPiece && this.isOpponentPiece(color, targetPiece)) {
                            moves.push({ row: newRow, col: newCol, isCapture: true, isPromotion: newRow === 0 || newRow === 7 });
                        }
                        
                        if (this.enPassantTarget && this.enPassantTarget.row === newRow && this.enPassantTarget.col === newCol) {
                            moves.push({ row: newRow, col: newCol, isEnPassant: true });
                        }
                    }
                }
                
                return moves;
            }

            getSlidingMoves(row, col, color, directions) {
                const moves = [];
                for (const [dr, dc] of directions) {
                    let r = row + dr;
                    let c = col + dc;
                    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                        const piece = this.getPieceAt(r, c);
                        if (this.isEmpty(piece)) {
                            moves.push({ row: r, col: c });
                        } else if (this.isOpponentPiece(color, piece)) {
                            moves.push({ row: r, col: c, isCapture: true });
                            break;
                        } else {
                            break;
                        }
                        r += dr;
                        c += dc;
                    }
                }
                return moves;
            }

            getKnightMoves(row, col, color) {
                const moves = [];
                const offsets = [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]];
                
                for (const [dr, dc] of offsets) {
                    const r = row + dr;
                    const c = col + dc;
                    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                        const piece = this.getPieceAt(r, c);
                        if (this.isEmpty(piece) || this.isOpponentPiece(color, piece)) {
                            moves.push({ row: r, col: c, isCapture: !!piece });
                        }
                    }
                }
                return moves;
            }

            getKingMoves(row, col, color, checkCastling = true) {
                const moves = [];
                const offsets = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]];
                
                for (const [dr, dc] of offsets) {
                    const r = row + dr;
                    const c = col + dc;
                    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                        const piece = this.getPieceAt(r, c);
                        if (this.isEmpty(piece) || this.isOpponentPiece(color, piece)) {
                            moves.push({ row: r, col: c, isCapture: !!piece });
                        }
                    }
                }
                
                if (checkCastling && !this.isInCheck(color)) {
                    const kingRow = color === 'white' ? 7 : 0;
                    if (row === kingRow && col === 4) {
                        if (color === 'white') {
                            if (this.castlingRights.whiteKingside && this.canCastle(7, 4, 7, 7)) {
                                moves.push({ row: 7, col: 6, isCastling: true });
                            }
                            if (this.castlingRights.whiteQueenside && this.canCastle(7, 4, 7, 0)) {
                                moves.push({ row: 7, col: 2, isCastling: true });
                            }
                        } else {
                            if (this.castlingRights.blackKingside && this.canCastle(0, 4, 0, 7)) {
                                moves.push({ row: 0, col: 6, isCastling: true });
                            }
                            if (this.castlingRights.blackQueenside && this.canCastle(0, 4, 0, 0)) {
                                moves.push({ row: 0, col: 2, isCastling: true });
                            }
                        }
                    }
                }
                
                return moves;
            }

            canCastle(kingRow, kingCol, rookRow, rookCol) {
                const start = Math.min(kingCol, rookCol) + 1;
                const end = Math.max(kingCol, rookCol);
                for (let c = start; c < end; c++) {
                    if (!this.isEmpty(this.getPieceAt(kingRow, c))) return false;
                }
                
                const direction = rookCol > kingCol ? 1 : -1;
                for (let c = kingCol; c !== kingCol + 3 * direction; c += direction) {
                    const tempGame = this.clone();
                    tempGame.board[kingRow][kingCol] = null;
                    tempGame.board[kingRow][c] = { color: this.board[kingRow][kingCol].color, type: 'king' };
                    if (tempGame.isInCheck(this.board[kingRow][kingCol].color)) return false;
                }
                
                return true;
            }

            findKing(color) {
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        const piece = this.getPieceAt(r, c);
                        if (piece && piece.color === color && piece.type === 'king') {
                            return { row: r, col: c };
                        }
                    }
                }
                return null;
            }

            isInCheck(color) {
                const kingPos = this.findKing(color);
                if (!kingPos) return false;
                
                const opponentColor = color === 'white' ? 'black' : 'white';
                
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        const piece = this.getPieceAt(r, c);
                        if (piece && piece.color === opponentColor) {
                            const moves = this.getValidMoves(r, c, false);
                            if (moves.some(m => m.row === kingPos.row && m.col === kingPos.col)) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            }

            isCheckmate(color) {
                return this.isInCheck(color) && !this.hasAnyValidMove(color);
            }

            isStalemate(color) {
                return !this.isInCheck(color) && !this.hasAnyValidMove(color);
            }

            hasAnyValidMove(color) {
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        const piece = this.getPieceAt(r, c);
                        if (piece && piece.color === color) {
                            const moves = this.getValidMoves(r, c, true);
                            if (moves.length > 0) return true;
                        }
                    }
                }
                return false;
            }

            makeMove(fromRow, fromCol, toRow, toCol) {
                const piece = this.getPieceAt(fromRow, fromCol);
                const color = piece.color;
                const target = this.getPieceAt(toRow, toCol);
                
                const moveNotation = this.getMoveNotation(fromRow, fromCol, toRow, toCol, piece, target);
                const isCapture = !!target;
                
                if (target) {
                    this.capturedPieces[target.color].push(target.type);
                    this.fiftyMoveCounter = 0;
                } else if (piece.type === 'pawn') {
                    this.fiftyMoveCounter = 0;
                } else {
                    this.fiftyMoveCounter++;
                }
                
                let enPassantCapture = false;
                if (piece.type === 'pawn' && this.enPassantTarget && 
                    toRow === this.enPassantTarget.row && toCol === this.enPassantTarget.col) {
                    const captureRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
                    this.board[captureRow][toCol] = null;
                    this.capturedPieces[piece.color === 'white' ? 'black' : 'white'].push('pawn');
                    enPassantCapture = true;
                }
                
                this.board[toRow][toCol] = piece;
                this.board[fromRow][fromCol] = null;
                
                if (piece.type === 'king' && Math.abs(fromCol - toCol) > 1) {
                    const rookFromCol = toCol > fromCol ? 7 : 0;
                    const rookToCol = toCol > fromCol ? toCol - 1 : toCol + 1;
                    const rook = this.board[fromRow][rookFromCol];
                    this.board[fromRow][rookToCol] = rook;
                    this.board[fromRow][rookFromCol] = null;
                }
                
                if (piece.type === 'king') {
                    if (piece.color === 'white') {
                        this.castlingRights.whiteKingside = false;
                        this.castlingRights.whiteQueenside = false;
                    } else {
                        this.castlingRights.blackKingside = false;
                        this.castlingRights.blackQueenside = false;
                    }
                }
                if (piece.type === 'rook') {
                    if (piece.color === 'white') {
                        if (fromCol === 0) this.castlingRights.whiteQueenside = false;
                        if (fromCol === 7) this.castlingRights.whiteKingside = false;
                    } else {
                        if (fromCol === 0) this.castlingRights.blackQueenside = false;
                        if (fromCol === 7) this.castlingRights.blackKingside = false;
                    }
                }
                
                if (piece.type === 'pawn' && Math.abs(fromRow - toRow) === 2) {
                    this.enPassantTarget = { 
                        row: (fromRow + toRow) / 2, 
                        col: fromCol 
                    };
                } else {
                    this.enPassantTarget = null;
                }
                
                this.moveHistory.push({
                    from: { row: fromRow, col: fromCol },
                    to: { row: toRow, col: toCol },
                    piece: { ...piece },
                    captured: target ? { ...target } : null,
                    notation: moveNotation,
                    enPassant: enPassantCapture,
                    isCapture: isCapture
                });
                
                this.repetitionPositions.push(this.getBoardHash());
                
                this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
            }

            makeMoveWithoutValidation(fromRow, fromCol, toRow, toCol) {
                const piece = this.getPieceAt(fromRow, fromCol);
                this.board[toRow][toCol] = piece;
                this.board[fromRow][fromCol] = null;
            }

            getMoveNotation(fromRow, fromCol, toRow, toCol, piece, target) {
                const files = 'abcdefgh';
                const ranks = '87654321';
                
                let notation = '';
                
                if (piece.type === 'king' && Math.abs(fromCol - toCol) > 1) {
                    return toCol > fromCol ? 'O-O' : 'O-O-O';
                }
                
                if (piece.type !== 'pawn') {
                    notation += piece.type.toUpperCase();
                }
                
                if (target || piece.type === 'pawn') {
                    if (piece.type === 'pawn' && (target || this.enPassantTarget)) {
                        notation += files[fromCol];
                    }
                    notation += 'x';
                }
                
                notation += files[toCol] + ranks[toRow];
                
                return notation;
            }

            getBoardHash() {
                return this.board.map(row => 
                    row.map(square => square ? `${square.color[0]}${square.type[0]}` : '..').join('')
                ).join('/');
            }

            undoMove() {
                if (this.moveHistory.length === 0) return false;
                
                const move = this.moveHistory.pop();
                const { from, to, piece, captured, enPassant } = move;
                
                this.board[from.row][from.col] = piece;
                this.board[to.row][to.col] = captured;
                
                if (enPassant) {
                    const captureRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
                    this.board[captureRow][to.col] = { color: piece.color === 'white' ? 'black' : 'white', type: 'pawn' };
                    this.capturedPieces[piece.color === 'white' ? 'black' : 'white'].pop();
                }
                
                if (piece.type === 'king' && Math.abs(from.col - to.col) > 1) {
                    const rookFromCol = to.col > from.col ? 7 : 0;
                    const rookToCol = to.col > from.col ? to.col - 1 : to.col + 1;
                    this.board[from.row][rookFromCol] = this.board[from.row][rookToCol];
                    this.board[from.row][rookToCol] = null;
                }
                
                this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
                
                if (captured) {
                    this.capturedPieces[captured.color].pop();
                }
                
                this.enPassantTarget = this.moveHistory.length > 0 ? 
                    this.moveHistory[this.moveHistory.length - 1].to : null;
                
                this.repetitionPositions.pop();
                
                return true;
            }

            evaluate() {
                let score = 0;
                
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        const piece = this.getPieceAt(r, c);
                        if (piece) {
                            let value = this.pieceValues[piece.type];
                            value += this.getPositionBonus(piece, r, c);
                            
                            if (piece.color === 'black') {
                                score += value;
                            } else {
                                score -= value;
                            }
                        }
                    }
                }
                
                return score;
            }

            getPositionBonus(piece, row, col) {
                const pawnTable = [
                    0,  0,  0,  0,  0,  0,  0,  0,
                    50, 50, 50, 50, 50, 50, 50, 50,
                    10, 10, 20, 30, 30, 20, 10, 10,
                    5,  5, 10, 25, 25, 10,  5,  5,
                    0,  0,  0, 20, 20,  0,  0,  0,
                    5, -5,-10,  0,  0,-10, -5,  5,
                    5, 10, 10,-20,-20, 10, 10,  5,
                    0,  0,  0,  0,  0,  0,  0,  0
                ];
                
                const knightTable = [
                    -50,-40,-30,-30,-30,-30,-40,-50,
                    -40,-20,  0,  0,  0,  0,-20,-40,
                    -30,  0, 10, 15, 15, 10,  0,-30,
                    -30,  5, 15, 20, 20, 15,  5,-30,
                    -30,  0, 15, 20, 20, 15,  0,-30,
                    -30,  5, 10, 15, 15, 10,  5,-30,
                    -40,-20,  0,  5,  5,  0,-20,-40,
                    -50,-40,-30,-30,-30,-30,-40,-50
                ];
                
                const bishopTable = [
                    -20,-10,-10,-10,-10,-10,-10,-20,
                    -10,  0,  0,  0,  0,  0,  0,-10,
                    -10,  0,  5, 10, 10,  5,  0,-10,
                    -10,  5,  5, 10, 10,  5,  5,-10,
                    -10,  0, 10, 10, 10, 10,  0,-10,
                    -10, 10, 10, 10, 10, 10, 10,-10,
                    -10,  5,  0,  0,  0,  0,  5,-10,
                    -20,-10,-10,-10,-10,-10,-10,-20
                ];
                
                const rookTable = [
                    0,  0,  0,  0,  0,  0,  0,  0,
                    5, 10, 10, 10, 10, 10, 10,  5,
                    -5,  0,  0,  0,  0,  0,  0, -5,
                    -5,  0,  0,  0,  0,  0,  0, -5,
                    -5,  0,  0,  0,  0,  0,  0, -5,
                    -5,  0,  0,  0,  0,  0,  0, -5,
                    -5,  0,  0,  0,  0,  0,  0, -5,
                    0,  0,  0,  5,  5,  0,  0,  0
                ];
                
                const queenTable = [
                    -20,-10,-10, -5, -5,-10,-10,-20,
                    -10,  0,  0,  0,  0,  0,  0,-10,
                    -10,  0,  5,  5,  5,  5,  0,-10,
                    -5,  0,  5,  5,  5,  5,  0, -5,
                    0,  0,  5,  5,  5,  5,  0, -5,
                    -10,  5,  5,  5,  5,  5,  0,-10,
                    -10,  0,  5,  0,  0,  0,  0,-10,
                    -20,-10,-10, -5, -5,-10,-10,-20
                ];
                
                const kingTable = [
                    -30,-40,-40,-50,-50,-40,-40,-30,
                    -30,-40,-40,-50,-50,-40,-40,-30,
                    -30,-40,-40,-50,-50,-40,-40,-30,
                    -30,-40,-40,-50,-50,-40,-40,-30,
                    -20,-30,-30,-40,-40,-30,-30,-20,
                    -10,-20,-20,-20,-20,-20,-20,-10,
                    20, 20,  0,  0,  0,  0, 20, 20,
                    20, 30, 10,  0,  0, 10, 30, 20
                ];
                
                let idx = piece.color === 'white' ? (7 - row) * 8 + col : row * 8 + col;
                
                switch (piece.type) {
                    case 'pawn': return pawnTable[idx];
                    case 'knight': return knightTable[idx];
                    case 'bishop': return bishopTable[idx];
                    case 'rook': return rookTable[idx];
                    case 'queen': return queenTable[idx];
                    case 'king': return kingTable[idx];
                }
                return 0;
            }
        }

        // UI Controller with Animations
        class ChessUI {
            constructor() {
                this.game = new ChessGame();
                this.selectedSquare = null;
                this.validMoves = [];
                this.dragStartSquare = null;
                this.isAnimating = false;
                
                this.homePage = document.getElementById('homePage');
                this.colorSelection = document.getElementById('colorSelection');
                this.chessGame = document.getElementById('chessGame');
                this.gameStatus = document.getElementById('gameStatus');
                this.promotionModal = document.getElementById('promotionModal');
                
                this.setupEventListeners();
            }

            setupEventListeners() {
                document.getElementById('playVsAI').addEventListener('click', () => this.showColorSelection());
                document.getElementById('playPvP').addEventListener('click', () => this.startPvP());
               document.getElementById('quitGame').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmQuit = confirm('Are you sure you want to quit the game?');
    if (!confirmQuit) return;

    // Force redirect to main website
    window.location.assign('https://shreemarwadi.github.io/Redmark-Studio/');
});


                
                document.getElementById('chooseWhite').addEventListener('click', () => this.startAI('white'));
                document.getElementById('chooseBlack').addEventListener('click', () => this.startAI('black'));
                
                document.getElementById('newGame').addEventListener('click', () => this.newGame());
                document.getElementById('undoMove').addEventListener('click', () => this.undoMove());
                document.getElementById('goHome').addEventListener('click', () => this.goHome());
                
                document.getElementById('playAgain').addEventListener('click', () => this.newGame());
                document.getElementById('statusGoHome').addEventListener('click', () => this.goHome());
            }

            showPage(page) {
                this.homePage.style.display = 'none';
                this.colorSelection.style.display = 'none';
                this.chessGame.style.display = 'none';
                page.style.display = 'block';
            }

            showColorSelection() {
                this.colorSelection.style.display = 'block';
                this.colorSelection.classList.add('fadeIn');
                this.showPage(this.colorSelection);
            }

            startAI(playerColor) {
                this.game = new ChessGame();
                this.game.gameMode = 'ai';
                this.game.playerColor = playerColor;
                this.game.aiColor = playerColor === 'white' ? 'black' : 'white';
                
                this.showPage(this.chessGame);
                this.renderBoard();
                this.updateGameInfo();
                
                if (this.game.aiColor === 'white') {
                    setTimeout(() => this.makeAIMove(), 500);
                }
            }

            startPvP() {
                this.game = new ChessGame();
                this.game.gameMode = 'pvp';
                
                this.showPage(this.chessGame);
                this.renderBoard();
                this.updateGameInfo();
            }

            newGame() {
                this.gameStatus.style.display = 'none';
                this.game = new ChessGame();
                
                if (this.game.gameMode === 'ai') {
                    this.showPage(this.chessGame);
                    this.renderBoard();
                    this.updateGameInfo();
                    
                    if (this.game.aiColor === 'white') {
                        setTimeout(() => this.makeAIMove(), 500);
                    }
                } else {
                    this.showPage(this.chessGame);
                    this.renderBoard();
                    this.updateGameInfo();
                }
            }

            goHome() {
                this.gameStatus.style.display = 'none';
                this.promotionModal.style.display = 'none';
                this.showPage(this.homePage);
            }

            renderBoard(animatePiece = null, isCapture = false) {
                const boardEl = document.getElementById('chessBoard');
                boardEl.innerHTML = '';
                
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        const square = document.createElement('div');
                        square.className = `boardSquare ${(row + col) % 2 === 0 ? 'square-light' : 'square-dark'}`;
                        square.dataset.row = row;
                        square.dataset.col = col;
                        
                        const isValidMove = this.validMoves.some(m => m.row === row && m.col === col);
                        if (isValidMove) {
                            square.classList.add('square-valid-move');
                        }
                        
                        if (this.selectedSquare && this.selectedSquare.row === row && this.selectedSquare.col === col) {
                            square.classList.add('square-selected');
                        }
                        
                        // Highlight last move with green destination indicator
                        if (this.game.moveHistory.length > 0) {
                            const lastMove = this.game.moveHistory[this.game.moveHistory.length - 1];
                            
                            // Yellow highlight on source square
                            if (lastMove.from.row === row && lastMove.from.col === col) {
                                square.classList.add('square-last-move');
                            }
                            
                            // Green shadow on destination square to show where piece was placed
                            if (lastMove.to.row === row && lastMove.to.col === col) {
                                square.classList.add('square-last-move');
                                square.classList.add('square-destination');
                            }
                        }
                        
                        const piece = this.game.getPieceAt(row, col);
                        if (piece && piece.type === 'king' && this.game.isInCheck(piece.color)) {
                            square.classList.add('square-check');
                        }
                        
                        if (piece) {
                            const pieceEl = document.createElement('span');
                            pieceEl.className = `chessPiece piece-${piece.color}`;
                            
                            // Add placement animation to the destination piece
                            if (animatePiece && animatePiece.row === row && animatePiece.col === col) {
                                pieceEl.classList.add('just-placed');
                                // Add capture animation if this move captured a piece
                                if (isCapture) {
                                    pieceEl.classList.add('captured');
                                }
                            }
                            
                            pieceEl.textContent = this.game.pieceSymbols[piece.color][piece.type];
                            pieceEl.draggable = true;
                            
                            if (this.game.gameMode === 'pvp' || 
                                (this.game.gameMode === 'ai' && piece.color === this.game.playerColor)) {
                                pieceEl.addEventListener('dragstart', (e) => this.handleDragStart(e, row, col));
                                pieceEl.addEventListener('dragend', () => this.handleDragEnd());
                            }
                            
                            square.appendChild(pieceEl);
                        }
                        
                        square.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.handleSquareClick(row, col);
                        });
                        
                        square.addEventListener('dragover', (e) => {
                            e.preventDefault();
                        });
                        
                        square.addEventListener('drop', (e) => {
                            e.preventDefault();
                            this.handleDrop(e, row, col);
                        });
                        
                        boardEl.appendChild(square);
                    }
                }
                
                this.updateCapturedPieces();
                this.updateMoveHistory();
                this.updateTurnIndicator();
            }

            handleSquareClick(row, col) {
                if (this.game.gameOver || this.isAnimating) return;
                
                if (this.game.gameMode === 'ai' && this.game.currentPlayer !== this.game.playerColor) return;
                
                const piece = this.game.getPieceAt(row, col);
                
                if (this.selectedSquare) {
                    const isValidMove = this.validMoves.some(m => m.row === row && m.col === col);
                    
                    if (isValidMove) {
                        this.executeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
                    } else if (piece && piece.color === this.game.currentPlayer) {
                        this.selectedSquare = { row, col };
                        this.validMoves = this.game.getValidMoves(row, col);
                        this.renderBoard();
                    } else {
                        this.selectedSquare = null;
                        this.validMoves = [];
                        this.renderBoard();
                    }
                } else if (piece && piece.color === this.game.currentPlayer) {
                    this.selectedSquare = { row, col };
                    this.validMoves = this.game.getValidMoves(row, col);
                    this.renderBoard();
                }
            }

            handleDragStart(e, row, col) {
                if (this.game.gameOver || this.isAnimating || 
                    (this.game.gameMode === 'ai' && this.game.currentPlayer !== this.game.playerColor)) {
                    e.preventDefault();
                    return;
                }
                
                this.dragStartSquare = { row, col };
                this.selectedSquare = { row, col };
                this.validMoves = this.game.getValidMoves(row, col);
                
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                
                this.renderBoard();
            }

            handleDragEnd() {
                this.dragStartSquare = null;
                document.querySelectorAll('.chessPiece').forEach(p => p.classList.remove('dragging'));
            }

            handleDrop(e, toRow, toCol) {
                if (!this.dragStartSquare) return;
                
                const isValidMove = this.validMoves.some(m => m.row === toRow && m.col === toCol);
                if (isValidMove) {
                    this.executeMove(this.dragStartSquare.row, this.dragStartSquare.col, toRow, toCol);
                }
                
                this.dragStartSquare = null;
                this.selectedSquare = null;
                this.validMoves = [];
                this.renderBoard();
            }

            executeMove(fromRow, fromCol, toRow, toCol) {
                const move = this.game.getValidMoves(fromRow, fromCol).find(m => m.row === toRow && m.col === toCol);
                const isCapture = !!this.game.getPieceAt(toRow, toCol);
                
                if (move && move.isPromotion) {
                    this.showPromotionModal(fromRow, fromCol, toRow, toCol);
                    return;
                }
                
                // Make the move
                this.game.makeMove(fromRow, fromCol, toRow, toCol);
                
                // Render with animation
                this.isAnimating = true;
                this.renderBoard({ row: toRow, col: toCol }, isCapture);
                
                // Clear animation state after animation completes
                setTimeout(() => {
                    this.isAnimating = false;
                    this.selectedSquare = null;
                    this.validMoves = [];
                    this.dragStartSquare = null;
                    this.renderBoard();
                }, 500);
                
                this.checkGameEnd();
                
                if (this.game.gameMode === 'ai' && !this.game.gameOver) {
                    document.getElementById('aiThinking').style.display = 'block';
                    setTimeout(() => this.makeAIMove(), 600);
                }
            }

            showPromotionModal(fromRow, fromCol, toRow, toCol) {
                const modal = this.promotionModal;
                const piecesContainer = document.getElementById('promotionPieces');
                piecesContainer.innerHTML = '';
                
                const color = this.game.getPieceAt(fromRow, fromCol).color;
                const pieces = ['queen', 'rook', 'bishop', 'knight'];
                
                pieces.forEach(pieceType => {
                    const pieceEl = document.createElement('span');
                    pieceEl.className = `promotionPiece piece-${color}`;
                    pieceEl.textContent = this.game.pieceSymbols[color][pieceType];
                    pieceEl.addEventListener('click', () => {
                        this.game.makeMove(fromRow, fromCol, toRow, toCol);
                        this.game.board[toRow][toCol].type = pieceType;
                        modal.style.display = 'none';
                        
                        this.isAnimating = true;
                        this.renderBoard({ row: toRow, col: toCol });
                        
                        setTimeout(() => {
                            this.isAnimating = false;
                            this.selectedSquare = null;
                            this.validMoves = [];
                            this.dragStartSquare = null;
                            this.renderBoard();
                        }, 500);
                        
                        this.checkGameEnd();
                        
                        if (this.game.gameMode === 'ai' && !this.game.gameOver) {
                            document.getElementById('aiThinking').style.display = 'block';
                            setTimeout(() => this.makeAIMove(), 600);
                        }
                    });
                    piecesContainer.appendChild(pieceEl);
                });
                
                modal.style.display = 'block';
            }

            async makeAIMove() {
                if (this.game.gameOver || this.game.currentPlayer !== this.game.aiColor) return;
                
                const move = await this.getBestMove(3);
                
                if (move) {
                    const isCapture = !!this.game.getPieceAt(move.toRow, move.toCol);
                    
                    if (move.isPromotion) {
                        this.showPromotionModal(move.fromRow, move.fromCol, move.toRow, move.toCol);
                        return;
                    }
                    
                    this.game.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
                    
                    this.isAnimating = true;
                    this.renderBoard({ row: move.toRow, col: move.toCol }, isCapture);
                    
                    setTimeout(() => {
                        this.isAnimating = false;
                        this.renderBoard();
                    }, 500);
                    
                    this.checkGameEnd();
                }
                
                document.getElementById('aiThinking').style.display = 'none';
            }

            async getBestMove(depth) {
                return new Promise(resolve => {
                    setTimeout(() => {
                        const moves = this.getAllMoves(this.game.aiColor);
                        let bestMove = null;
                        let bestValue = -Infinity;
                        
                        for (const move of moves) {
                            const gameCopy = this.game.clone();
                            gameCopy.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
                            
                            const value = this.minimax(gameCopy, depth - 1, -Infinity, Infinity, false);
                            
                            if (value > bestValue) {
                                bestValue = value;
                                bestMove = move;
                            }
                        }
                        
                        resolve(bestMove);
                    }, 50);
                });
            }

            getAllMoves(color) {
                const moves = [];
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        const piece = this.game.getPieceAt(r, c);
                        if (piece && piece.color === color) {
                            const validMoves = this.game.getValidMoves(r, c);
                            for (const move of validMoves) {
                                moves.push({ fromRow: r, fromCol: c, toRow: move.row, toCol: move.col });
                            }
                        }
                    }
                }
                return moves;
            }

            minimax(game, depth, alpha, beta, isMaximizing) {
                if (depth === 0) {
                    return game.evaluate();
                }
                
                const color = isMaximizing ? game.aiColor : game.playerColor;
                const moves = this.getAllMovesForGame(game, color);
                
                if (moves.length === 0) {
                    if (game.isInCheck(color)) {
                        return isMaximizing ? -100000 : 100000;
                    }
                    return 0;
                }
                
                if (isMaximizing) {
                    let maxValue = -Infinity;
                    for (const move of moves) {
                        const gameCopy = game.clone();
                        gameCopy.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
                        
                        const value = this.minimax(gameCopy, depth - 1, alpha, beta, false);
                        maxValue = Math.max(maxValue, value);
                        alpha = Math.max(alpha, value);
                        if (beta <= alpha) break;
                    }
                    return maxValue;
                } else {
                    let minValue = Infinity;
                    for (const move of moves) {
                        const gameCopy = game.clone();
                        gameCopy.makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
                        
                        const value = this.minimax(gameCopy, depth - 1, alpha, beta, true);
                        minValue = Math.min(minValue, value);
                        beta = Math.min(beta, value);
                        if (beta <= alpha) break;
                    }
                    return minValue;
                }
            }

            getAllMovesForGame(game, color) {
                const moves = [];
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        const piece = game.getPieceAt(r, c);
                        if (piece && piece.color === color) {
                            const validMoves = game.getValidMoves(r, c);
                            for (const move of validMoves) {
                                moves.push({ fromRow: r, fromCol: c, toRow: move.row, toCol: move.col });
                            }
                        }
                    }
                }
                return moves;
            }

            undoMove() {
                if (this.game.gameMode === 'ai') {
                    this.game.undoMove();
                }
                this.game.undoMove();
                this.selectedSquare = null;
                this.validMoves = [];
                this.dragStartSquare = null;
                this.renderBoard();
                
                if (this.game.gameMode === 'ai' && this.game.currentPlayer === this.game.aiColor) {
                    document.getElementById('aiThinking').style.display = 'block';
                    setTimeout(() => this.makeAIMove(), 500);
                }
            }

            checkGameEnd() {
                const color = this.game.currentPlayer;
                
                if (this.game.isCheckmate(color)) {
                    this.showGameEnd('Checkmate!', `${color === 'white' ? 'White' : 'Black'} wins!`);
                } else if (this.game.isStalemate(color)) {
                    this.showGameEnd('Stalemate!', 'The game is a draw.');
                } else if (this.game.fiftyMoveCounter >= 100) {
                    this.showGameEnd('Draw!', 'Fifty-move rule.');
                } else {
                    const positions = this.game.repetitionPositions;
                    const lastPos = positions[positions.length - 1];
                    const repetitions = positions.filter(p => p === lastPos).length;
                    if (repetitions >= 3) {
                        this.showGameEnd('Draw!', 'Threefold repetition.');
                    }
                }
            }

            showGameEnd(title, message) {
                this.game.gameOver = true;
                document.getElementById('statusTitle').textContent = title;
                document.getElementById('statusMessage').textContent = message;
                this.gameStatus.style.display = 'flex';
            }

            updateTurnIndicator() {
                const turnIndicator = document.getElementById('turnIndicator');
                const color = this.game.currentPlayer;
                turnIndicator.textContent = `${color === 'white' ? 'White' : 'Black'}'s Turn`;
                
                if (this.game.isInCheck(color)) {
                    turnIndicator.textContent += ' - CHECK!';
                    turnIndicator.style.color = '#ff4444';
                } else {
                    turnIndicator.style.color = '#FFD700';
                }
            }

            updateCapturedPieces() {
                const whiteCapturedEl = document.getElementById('whiteCaptured');
                const blackCapturedEl = document.getElementById('blackCaptured');
                
                whiteCapturedEl.innerHTML = this.game.capturedPieces.black.map(p => 
                    `<span class="piece-white">${this.game.pieceSymbols.white[p]}</span>`
                ).join(' ');
                
                blackCapturedEl.innerHTML = this.game.capturedPieces.white.map(p => 
                    `<span class="piece-black">${this.game.pieceSymbols.black[p]}</span>`
                ).join(' ');
            }

            updateMoveHistory() {
                const historyEl = document.getElementById('moveHistory');
                let html = '';
                
                for (let i = 0; i < this.game.moveHistory.length; i += 2) {
                    const moveNum = Math.floor(i / 2) + 1;
                    html += `<span class="moveNumber">${moveNum}.</span>`;
                    html += `<span class="whiteMove">${this.game.moveHistory[i].notation}</span>`;
                    if (i + 1 < this.game.moveHistory.length) {
                        html += `<span class="blackMove">${this.game.moveHistory[i + 1].notation}</span>`;
                    }
                    html += '<br>';
                }
                
                historyEl.innerHTML = html;
                historyEl.scrollTop = historyEl.scrollHeight;
            }

            updateGameInfo() {
                const gameInfo = document.getElementById('gameInfo');
                if (this.game.gameMode === 'ai') {
                    gameInfo.textContent = `You: ${this.game.playerColor === 'white' ? 'White' : 'Black'} | AI: ${this.game.aiColor === 'white' ? 'White' : 'Black'}`;
                } else {
                    gameInfo.textContent = 'Player vs Player';
                }
            }
        }

        // Initialize game

        const chessUI = new ChessUI();


