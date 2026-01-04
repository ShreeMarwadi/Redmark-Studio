 // ============================================
        // WebChess Pro - Complete Chess Game Engine
        // ============================================

        // Game State
        const GameState = {
            board: [],
            currentTurn: 'white',
            selectedSquare: null,
            validMoves: [],
            gameMode: null,
            aiDifficulty: null,
            playerColor: null,
            castlingRights: { whiteKingSide: true, whiteQueenSide: true, blackKingSide: true, blackQueenSide: true },
            enPassantTarget: null,
            halfMoveClock: 0,
            fullMoveNumber: 1,
            gameOver: false,
            soundEnabled: true,
            lastMove: null,
            moveHistory: [],
            promotionPending: null
        };

        // Piece Unicode Characters
        const PIECES = {
            white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
            black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
        };

        // Piece Values for AI
        const PIECE_VALUES = {
            pawn: 100,
            knight: 320,
            bishop: 330,
            rook: 500,
            queen: 900,
            king: 20000
        };

        // Piece-Square Tables for Position Evaluation
        const PST = {
            pawn: [
                [0,  0,  0,  0,  0,  0,  0,  0],
                [50, 50, 50, 50, 50, 50, 50, 50],
                [10, 10, 20, 30, 30, 20, 10, 10],
                [5,  5, 10, 25, 25, 10,  5,  5],
                [0,  0,  0, 20, 20,  0,  0,  0],
                [5, -5,-10,  0,  0,-10, -5,  5],
                [5, 10, 10,-20,-20, 10, 10,  5],
                [0,  0,  0,  0,  0,  0,  0,  0]
            ],
            knight: [
                [-50,-40,-30,-30,-30,-30,-40,-50],
                [-40,-20,  0,  0,  0,  0,-20,-40],
                [-30,  0, 10, 15, 15, 10,  0,-30],
                [-30,  5, 15, 20, 20, 15,  5,-30],
                [-30,  0, 15, 20, 20, 15,  0,-30],
                [-30,  5, 10, 15, 15, 10,  5,-30],
                [-40,-20,  0,  5,  5,  0,-20,-40],
                [-50,-40,-30,-30,-30,-30,-40,-50]
            ],
            bishop: [
                [-20,-10,-10,-10,-10,-10,-10,-20],
                [-10,  0,  0,  0,  0,  0,  0,-10],
                [-10,  0,  5, 10, 10,  5,  0,-10],
                [-10,  5,  5, 10, 10,  5,  5,-10],
                [-10,  0, 10, 10, 10, 10,  0,-10],
                [-10, 10, 10, 10, 10, 10, 10,-10],
                [-10,  5,  0,  0,  0,  0,  5,-10],
                [-20,-10,-10,-10,-10,-10,-10,-20]
            ],
            rook: [
                [0,  0,  0,  0,  0,  0,  0,  0],
                [5, 10, 10, 10, 10, 10, 10,  5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [0,  0,  0,  5,  5,  0,  0,  0]
            ],
            queen: [
                [-20,-10,-10, -5, -5,-10,-10,-20],
                [-10,  0,  0,  0,  0,  0,  0,-10],
                [-10,  0,  5,  5,  5,  5,  0,-10],
                [-5,  0,  5,  5,  5,  5,  0, -5],
                [0,  0,  5,  5,  5,  5,  0, -5],
                [-10,  5,  5,  5,  5,  5,  0,-10],
                [-10,  0,  5,  0,  0,  0,  0,-10],
                [-20,-10,-10, -5, -5,-10,-10,-20]
            ],
            king: [
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-20,-30,-30,-40,-40,-30,-30,-20],
                [-10,-20,-20,-20,-20,-20,-20,-10],
                [20, 20,  0,  0,  0,  0, 20, 20],
                [20, 30, 10,  0,  0, 10, 30, 20]
            ]
        };

        // Sound Effects
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        let audioCtx = null;

        function initAudio() {
            if (!audioCtx) {
                audioCtx = new AudioContext();
            }
        }

        function playSound(type) {
            if (!GameState.soundEnabled) return;
            initAudio();
            
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            const now = audioCtx.currentTime;
            
            switch(type) {
                case 'move':
                    oscillator.frequency.setValueAtTime(400, now);
                    oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.1);
                    gainNode.gain.setValueAtTime(0.3, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    oscillator.start(now);
                    oscillator.stop(now + 0.1);
                    break;
                case 'capture':
                    oscillator.frequency.setValueAtTime(600, now);
                    oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.15);
                    gainNode.gain.setValueAtTime(0.4, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                    oscillator.start(now);
                    oscillator.stop(now + 0.15);
                    break;
                case 'check':
                    oscillator.frequency.setValueAtTime(800, now);
                    oscillator.type = 'square';
                    gainNode.gain.setValueAtTime(0.2, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                    oscillator.start(now);
                    oscillator.stop(now + 0.2);
                    break;
                case 'gameover':
                    oscillator.frequency.setValueAtTime(500, now);
                    oscillator.frequency.setValueAtTime(400, now + 0.2);
                    oscillator.frequency.setValueAtTime(300, now + 0.4);
                    gainNode.gain.setValueAtTime(0.3, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                    oscillator.start(now);
                    oscillator.stop(now + 0.6);
                    break;
            }
        }

        function toggleSound() {
            GameState.soundEnabled = !GameState.soundEnabled;
            document.getElementById('sound-btn').textContent = GameState.soundEnabled ? '🔊' : '🔇';
        }

        // ============================================
        // Screen Management
        // ============================================

        function showScreen(screenId) {
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            document.getElementById(screenId).classList.add('active');
        }

        function hideModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }

        // ============================================
        // Board Initialization
        // ============================================

        function initializeBoard() {
            // Reset game state
            GameState.board = [];
            GameState.currentTurn = 'white';
            GameState.selectedSquare = null;
            GameState.validMoves = [];
            GameState.gameOver = false;
            GameState.castlingRights = { whiteKingSide: true, whiteQueenSide: true, blackKingSide: true, blackQueenSide: true };
            GameState.enPassantTarget = null;
            GameState.halfMoveClock = 0;
            GameState.fullMoveNumber = 1;
            GameState.lastMove = null;
            GameState.moveHistory = [];
            GameState.promotionPending = null;

            // Initialize empty board
            for (let row = 0; row < 8; row++) {
                GameState.board[row] = [];
                for (let col = 0; col < 8; col++) {
                    GameState.board[row][col] = null;
                }
            }

            // Place black pieces
            GameState.board[0][0] = { color: 'black', type: 'rook' };
            GameState.board[0][1] = { color: 'black', type: 'knight' };
            GameState.board[0][2] = { color: 'black', type: 'bishop' };
            GameState.board[0][3] = { color: 'black', type: 'queen' };
            GameState.board[0][4] = { color: 'black', type: 'king' };
            GameState.board[0][5] = { color: 'black', type: 'bishop' };
            GameState.board[0][6] = { color: 'black', type: 'knight' };
            GameState.board[0][7] = { color: 'black', type: 'rook' };

            for (let col = 0; col < 8; col++) {
                GameState.board[1][col] = { color: 'black', type: 'pawn' };
            }

            // Place white pieces
            for (let col = 0; col < 8; col++) {
                GameState.board[6][col] = { color: 'white', type: 'pawn' };
            }

            GameState.board[7][0] = { color: 'white', type: 'rook' };
            GameState.board[7][1] = { color: 'white', type: 'knight' };
            GameState.board[7][2] = { color: 'white', type: 'bishop' };
            GameState.board[7][3] = { color: 'white', type: 'queen' };
            GameState.board[7][4] = { color: 'white', type: 'king' };
            GameState.board[7][5] = { color: 'white', type: 'bishop' };
            GameState.board[7][6] = { color: 'white', type: 'knight' };
            GameState.board[7][7] = { color: 'white', type: 'rook' };
        }

        function renderBoard() {
            const board = document.getElementById('chessboard');
            board.innerHTML = '';

            // Determine board orientation
            const isFlipped = GameState.gameMode === 'ai' && GameState.playerColor === 'black';

            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const square = document.createElement('div');
                    const displayRow = isFlipped ? 7 - row : row;
                    const displayCol = isFlipped ? 7 - col : col;
                    
                    square.className = `square ${(displayRow + displayCol) % 2 === 0 ? 'light' : 'dark'}`;
                    square.dataset.row = displayRow;
                    square.dataset.col = displayCol;

                    // Highlight last move
                    if (GameState.lastMove) {
                        const isFromSquare = GameState.lastMove.fromRow === displayRow && GameState.lastMove.fromCol === displayCol;
                        const isToSquare = GameState.lastMove.toRow === displayRow && GameState.lastMove.toCol === displayCol;
                        if (isFromSquare || isToSquare) {
                            square.classList.add('highlighted');
                        }
                    }

                    // Highlight selected piece
                    if (GameState.selectedSquare && GameState.selectedSquare.row === displayRow && GameState.selectedSquare.col === displayCol) {
                        square.classList.add('selected');
                    }

                    // Highlight valid moves
                    if (GameState.validMoves.some(m => m.row === displayRow && m.col === displayCol)) {
                        square.classList.add('valid-move');
                    }

                    // Highlight king in check
                    const piece = GameState.board[displayRow][displayCol];
                    if (piece && piece.type === 'king') {
                        if (isInCheck(piece.color)) {
                            square.classList.add('check');
                        }
                    }

                    // Add piece if present
                    if (piece) {
                        const pieceElement = document.createElement('div');
                        pieceElement.className = `piece ${piece.color}`;
                        pieceElement.innerHTML = PIECES[piece.color][piece.type];
                        pieceElement.draggable = true;
                        pieceElement.dataset.row = displayRow;
                        pieceElement.dataset.col = displayCol;
                        
                        // Event listeners
                        pieceElement.addEventListener('click', (e) => handleSquareClick(displayRow, displayCol));
                        pieceElement.addEventListener('dragstart', handleDragStart);
                        pieceElement.addEventListener('dragend', handleDragEnd);
                        
                        square.appendChild(pieceElement);
                    }

                    // Click listener for empty squares
                    square.addEventListener('click', (e) => {
                        if (e.target === square) {
                            handleSquareClick(displayRow, displayCol);
                        }
                    });

                    board.appendChild(square);
                }
            }
        }

        // ============================================
        // Piece Movement & Validation
        // ============================================

        function getPiece(row, col) {
            if (row < 0 || row > 7 || col < 0 || col > 7) return null;
            return GameState.board[row][col];
        }

        function isValidSquare(row, col) {
            return row >= 0 && row < 8 && col >= 0 && col < 8;
        }

        function getLegalMoves(row, col, checkKingSafety = true) {
            const piece = getPiece(row, col);
            if (!piece) return [];

            const moves = [];
            const color = piece.color;
            const type = piece.type;

            switch (type) {
                case 'pawn':
                    moves.push(...getPawnMoves(row, col, color));
                    break;
                case 'rook':
                    moves.push(...getSlidingMoves(row, col, color, [[0, 1], [0, -1], [1, 0], [-1, 0]]));
                    break;
                case 'knight':
                    moves.push(...getKnightMoves(row, col, color));
                    break;
                case 'bishop':
                    moves.push(...getSlidingMoves(row, col, color, [[1, 1], [1, -1], [-1, 1], [-1, -1]]));
                    break;
                case 'queen':
                    moves.push(...getSlidingMoves(row, col, color, [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]));
                    break;
                case 'king':
                    moves.push(...getKingMoves(row, col, color));
                    break;
            }

            // Filter out moves that would leave king in check
            if (checkKingSafety) {
                return moves.filter(move => !wouldBeInCheck(row, col, move.row, move.col, color));
            }

            return moves;
        }

        function getPawnMoves(row, col, color) {
            const moves = [];
            const direction = color === 'white' ? -1 : 1;
            const startRow = color === 'white' ? 6 : 1;

            // Forward move
            if (!getPiece(row + direction, col)) {
                moves.push({ row: row + direction, col: col });

                // Double move from starting position
                if (row === startRow && !getPiece(row + 2 * direction, col)) {
                    moves.push({ row: row + 2 * direction, col: col });
                }
            }

            // Captures
            [-1, 1].forEach(dc => {
                const targetRow = row + direction;
                const targetCol = col + dc;
                const target = getPiece(targetRow, targetCol);
                
                if (target && target.color !== color) {
                    moves.push({ row: targetRow, col: targetCol });
                }

                // En passant
                if (GameState.enPassantTarget && 
                    GameState.enPassantTarget.row === targetRow && 
                    GameState.enPassantTarget.col === targetCol) {
                    moves.push({ row: targetRow, col: targetCol, enPassant: true });
                }
            });

            return moves;
        }

        function getSlidingMoves(row, col, color, directions) {
            const moves = [];

            directions.forEach(([dr, dc]) => {
                let newRow = row + dr;
                let newCol = col + dc;

                while (isValidSquare(newRow, newCol)) {
                    const target = getPiece(newRow, newCol);
                    
                    if (!target) {
                        moves.push({ row: newRow, col: newCol });
                    } else {
                        if (target.color !== color) {
                            moves.push({ row: newRow, col: newCol });
                        }
                        break;
                    }

                    newRow += dr;
                    newCol += dc;
                }
            });

            return moves;
        }

        function getKnightMoves(row, col, color) {
            const moves = [];
            const offsets = [
                [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                [1, -2], [1, 2], [2, -1], [2, 1]
            ];

            offsets.forEach(([dr, dc]) => {
                const newRow = row + dr;
                const newCol = col + dc;
                const target = getPiece(newRow, newCol);

                if (isValidSquare(newRow, newCol)) {
                    if (!target || target.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            });

            return moves;
        }

        function getKingMoves(row, col, color) {
            const moves = [];
            const offsets = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1],           [0, 1],
                [1, -1],  [1, 0],  [1, 1]
            ];

            offsets.forEach(([dr, dc]) => {
                const newRow = row + dr;
                const newCol = col + dc;
                const target = getPiece(newRow, newCol);

                if (isValidSquare(newRow, newCol)) {
                    if (!target || target.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            });

            // Castling - validated by canCastle which checks attacked squares
            if (color === 'white') {
                if (GameState.castlingRights.whiteKingSide && canCastle(row, col, 7, 0, color)) {
                    moves.push({ row: 7, col: 6, castling: 'kingSide' });
                }
                if (GameState.castlingRights.whiteQueenSide && canCastle(row, col, 0, 0, color)) {
                    moves.push({ row: 7, col: 2, castling: 'queenSide' });
                }
            } else {
                if (GameState.castlingRights.blackKingSide && canCastle(row, col, 7, 7, color)) {
                    moves.push({ row: 0, col: 6, castling: 'kingSide' });
                }
                if (GameState.castlingRights.blackQueenSide && canCastle(row, col, 0, 7, color)) {
                    moves.push({ row: 0, col: 2, castling: 'queenSide' });
                }
            }

            return moves;
        }

        function canCastle(kingRow, kingCol, rookRow, rookCol, color) {
            // Check if rook is in correct position
            const rook = getPiece(rookRow, rookCol);
            if (!rook || rook.type !== 'rook' || rook.color !== color) return false;

            // Check if path is clear
            const colStart = Math.min(kingCol, rookCol) + 1;
            const colEnd = Math.max(kingCol, rookCol);

            for (let col = colStart; col < colEnd; col++) {
                if (getPiece(kingRow, col)) return false;
            }

            // Check if king passes through or ends up in check
            // The king cannot castle if currently in check (will be filtered by wouldBeInCheck)
            const direction = rookCol > kingCol ? 1 : -1;
            for (let col = kingCol; col !== kingCol + 3 * direction; col += direction) {
                if (isSquareAttacked(kingRow, col, color)) return false;
            }

            return true;
        }

        function isSquareAttacked(row, col, defendingColor) {
            const attackingColor = defendingColor === 'white' ? 'black' : 'white';

            // Check all enemy pieces
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const piece = getPiece(r, c);
                    if (piece && piece.color === attackingColor) {
                        const moves = getLegalMoves(r, c, false);
                        if (moves.some(m => m.row === row && m.col === col)) {
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        function isInCheck(color) {
            // Find king position
            let kingPos = null;
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const piece = getPiece(r, c);
                    if (piece && piece.type === 'king' && piece.color === color) {
                        kingPos = { row: r, col: c };
                        break;
                    }
                }
                if (kingPos) break;
            }

            if (!kingPos) return false;
            return isSquareAttacked(kingPos.row, kingPos.col, color);
        }

        function wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
            // Make temporary move
            const originalPiece = GameState.board[toRow][toCol];
            const movingPiece = GameState.board[fromRow][fromCol];
            
            GameState.board[toRow][toCol] = movingPiece;
            GameState.board[fromRow][fromCol] = null;

            // Check if king is in check
            const inCheck = isInCheck(color);

            // Restore position
            GameState.board[fromRow][fromCol] = movingPiece;
            GameState.board[toRow][toCol] = originalPiece;

            return inCheck;
        }

        function hasAnyLegalMoves(color) {
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const piece = getPiece(r, c);
                    if (piece && piece.color === color) {
                        const moves = getLegalMoves(r, c);
                        if (moves.length > 0) return true;
                    }
                }
            }
            return false;
        }

        function isInsufficientMaterial() {
            const pieces = [];
            
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const piece = getPiece(r, c);
                    if (piece) {
                        pieces.push(piece);
                    }
                }
            }

            // King vs King
            if (pieces.length === 2) return true;

            // King + Minor piece vs King
            if (pieces.length === 3) {
                const nonKings = pieces.filter(p => p.type !== 'king');
                if (nonKings.length === 1) {
                    const type = nonKings[0].type;
                    if (type === 'bishop' || type === 'knight') return true;
                }
            }

            // King + Bishop vs King + Bishop (same color bishops)
            if (pieces.length === 4) {
                const bishops = pieces.filter(p => p.type === 'bishop');
                if (bishops.length === 2) {
                    // Check if bishops are on same color squares
                    const bishop1Pos = pieces.find(p => p.type === 'bishop' && p === bishops[0]);
                    const bishop2Pos = pieces.find(p => p.type === 'bishop' && p === bishops[1]);
                    
                    // Simplified check - actual implementation would check board positions
                    return true;
                }
            }

            return false;
        }

        function isThreefoldRepetition() {
            // Check last 3 positions for repetition
            if (GameState.moveHistory.length < 6) return false;
            
            const lastMoves = GameState.moveHistory.slice(-6);
            const positions = lastMoves.map(m => m.fen);
            
            for (let i = 0; i < positions.length - 2; i++) {
                if (positions[i] === positions[i + 2] && positions[i] === positions[i + 4]) {
                    return true;
                }
            }
            
            return false;
        }

        function getBoardFEN() {
            let fen = '';
            for (let r = 0; r < 8; r++) {
                let emptyCount = 0;
                for (let c = 0; c < 8; c++) {
                    const piece = GameState.board[r][c];
                    if (!piece) {
                        emptyCount++;
                    } else {
                        if (emptyCount > 0) {
                            fen += emptyCount;
                            emptyCount = 0;
                        }
                        const pieceChar = piece.type[0].toUpperCase();
                        fen += piece.color === 'white' ? pieceChar : pieceChar.toLowerCase();
                    }
                }
                if (emptyCount > 0) fen += emptyCount;
                if (r < 7) fen += '/';
            }
            return fen;
        }

        // ============================================
        // Move Execution
        // ============================================

        function handleSquareClick(row, col) {
            if (GameState.gameOver) return;
            if (GameState.gameMode === 'ai' && GameState.currentTurn !== GameState.playerColor) return;

            const piece = getPiece(row, col);

            // If clicking on own piece, select it
            if (piece && piece.color === GameState.currentTurn) {
                GameState.selectedSquare = { row, col };
                GameState.validMoves = getLegalMoves(row, col);
                renderBoard();
                return;
            }

            // If a piece is selected and clicking on a valid move
            if (GameState.selectedSquare) {
                const isValid = GameState.validMoves.some(m => m.row === row && m.col === col);
                
                if (isValid) {
                    const move = GameState.validMoves.find(m => m.row === row && m.col === col);
                    
                    // Check for pawn promotion
                    const piece = getPiece(GameState.selectedSquare.row, GameState.selectedSquare.col);
                    if (piece.type === 'pawn' && (row === 0 || row === 7)) {
                        GameState.promotionPending = {
                            fromRow: GameState.selectedSquare.row,
                            fromCol: GameState.selectedSquare.col,
                            toRow: row,
                            toCol: col,
                            enPassant: move.enPassant,
                            castling: move.castling
                        };
                        showPromotionModal(piece.color);
                        return;
                    }

                    executeMove(GameState.selectedSquare.row, GameState.selectedSquare.col, row, col, move);
                } else {
                    // Deselect
                    GameState.selectedSquare = null;
                    GameState.validMoves = [];
                    renderBoard();
                }
            }
        }

        function executeMove(fromRow, fromCol, toRow, toCol, moveInfo = {}) {
            const piece = getPiece(fromRow, fromCol);
            const captured = getPiece(toRow, toCol);

            // Store last move for highlighting
            GameState.lastMove = { fromRow, fromCol, toRow, toCol };

            // Handle en passant capture
            if (moveInfo.enPassant) {
                const captureRow = fromRow;
                GameState.board[captureRow][toCol] = null;
            }

            // Move piece
            GameState.board[toRow][toCol] = piece;
            GameState.board[fromRow][fromCol] = null;

            // Handle castling
            if (moveInfo.castling) {
                if (moveInfo.castling === 'kingSide') {
                    const rook = getPiece(toRow, 7);
                    GameState.board[toRow][5] = rook;
                    GameState.board[toRow][7] = null;
                } else {
                    const rook = getPiece(toRow, 0);
                    GameState.board[toRow][3] = rook;
                    GameState.board[toRow][0] = null;
                }
            }

            // Update castling rights
            if (piece.type === 'king') {
                if (piece.color === 'white') {
                    GameState.castlingRights.whiteKingSide = false;
                    GameState.castlingRights.whiteQueenSide = false;
                } else {
                    GameState.castlingRights.blackKingSide = false;
                    GameState.castlingRights.blackQueenSide = false;
                }
            }
            if (piece.type === 'rook') {
                if (piece.color === 'white') {
                    if (fromCol === 0) GameState.castlingRights.whiteQueenSide = false;
                    if (fromCol === 7) GameState.castlingRights.whiteKingSide = false;
                } else {
                    if (fromCol === 0) GameState.castlingRights.blackQueenSide = false;
                    if (fromCol === 7) GameState.castlingRights.blackKingSide = false;
                }
            }

            // Update en passant target
            if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
                GameState.enPassantTarget = { 
                    row: (fromRow + toRow) / 2, 
                    col: fromCol 
                };
            } else {
                GameState.enPassantTarget = null;
            }

            // Update move counters
            if (piece.type === 'pawn' || captured) {
                GameState.halfMoveClock = 0;
            } else {
                GameState.halfMoveClock++;
            }

            // Store position for repetition detection
            GameState.moveHistory.push({
                fen: getBoardFEN(),
                moveNumber: GameState.fullMoveNumber
            });

            // Switch turn
            GameState.currentTurn = GameState.currentTurn === 'white' ? 'black' : 'white';
            if (GameState.currentTurn === 'white') {
                GameState.fullMoveNumber++;
            }

            // Play sound
            if (captured) {
                playSound('capture');
                addCapturedPiece(piece.color === 'white' ? 'black' : 'white', captured.type);
            } else {
                playSound('move');
            }

            // Clear selection
            GameState.selectedSquare = null;
            GameState.validMoves = [];

            // Update UI
            updateTurnIndicator();
            renderBoard();

            // Check game state
            checkGameState();

            // AI move if applicable
            if (GameState.gameMode === 'ai' && !GameState.gameOver && GameState.currentTurn === getAIColor()) {
                setTimeout(makeAIMove, 500);
            }
        }

        function executePromotion(fromRow, fromCol, toRow, toCol, promotionPiece, moveInfo = {}) {
            const piece = getPiece(fromRow, fromCol);
            const captured = getPiece(toRow, toCol);

            GameState.lastMove = { fromRow, fromCol, toRow, toCol };

            // Handle en passant capture
            if (moveInfo.enPassant) {
                const captureRow = fromRow;
                GameState.board[captureRow][toCol] = null;
            }

            // Move and promote piece
            GameState.board[toRow][toCol] = { color: piece.color, type: promotionPiece };
            GameState.board[fromRow][fromCol] = null;

            // Update en passant target
            GameState.enPassantTarget = null;

            // Update counters
            if (piece.type === 'pawn' || captured) {
                GameState.halfMoveClock = 0;
            } else {
                GameState.halfMoveClock++;
            }

            GameState.moveHistory.push({
                fen: getBoardFEN(),
                moveNumber: GameState.fullMoveNumber
            });

            // Switch turn
            GameState.currentTurn = GameState.currentTurn === 'white' ? 'black' : 'white';
            if (GameState.currentTurn === 'white') {
                GameState.fullMoveNumber++;
            }

            // Play sound
            if (captured) {
                playSound('capture');
                addCapturedPiece(piece.color === 'white' ? 'black' : 'white', captured.type);
            } else {
                playSound('move');
            }

            // Clear selection
            GameState.selectedSquare = null;
            GameState.validMoves = [];
            GameState.promotionPending = null;

            // Update UI
            updateTurnIndicator();
            renderBoard();
            hideModal('promotion-modal');

            // Check game state
            checkGameState();

            // AI move if applicable
            if (GameState.gameMode === 'ai' && !GameState.gameOver && GameState.currentTurn === getAIColor()) {
                setTimeout(makeAIMove, 500);
            }
        }

        function showPromotionModal(color) {
            const modal = document.getElementById('promotion-modal');
            const container = document.getElementById('promotion-pieces');
            container.innerHTML = '';

            ['queen', 'rook', 'bishop', 'knight'].forEach(type => {
                const pieceBtn = document.createElement('div');
                pieceBtn.className = 'promotion-piece';
                pieceBtn.innerHTML = PIECES[color][type];
                pieceBtn.onclick = () => {
                    const p = GameState.promotionPending;
                    executePromotion(p.fromRow, p.fromCol, p.toRow, p.toCol, type, p);
                };
                container.appendChild(pieceBtn);
            });

            modal.classList.add('active');
        }

        function addCapturedPiece(capturedBy, type) {
            const container = document.getElementById(`captured-${capturedBy}`);
            const piece = document.createElement('span');
            piece.className = 'captured-piece';
            piece.textContent = PIECES[capturedBy][type];
            container.appendChild(piece);
        }

        function checkGameState() {
            const inCheck = isInCheck(GameState.currentTurn);
            const hasMoves = hasAnyLegalMoves(GameState.currentTurn);

            if (!hasMoves) {
                GameState.gameOver = true;
                
                if (inCheck) {
                    const winner = GameState.currentTurn === 'white' ? 'Black' : 'White';
                    showGameOver('Checkmate!', `${winner} wins the game`);
                } else {
                    showGameOver('Stalemate!', 'The game is a draw');
                }
                
                playSound('gameover');
                return;
            }

            // Check for draws
            if (GameState.halfMoveClock >= 100) {
                GameState.gameOver = true;
                showGameOver('Draw!', 'Fifty-move rule');
                playSound('gameover');
                return;
            }

            if (isInsufficientMaterial()) {
                GameState.gameOver = true;
                showGameOver('Draw!', 'Insufficient material');
                playSound('gameover');
                return;
            }

            if (isThreefoldRepetition()) {
                GameState.gameOver = true;
                showGameOver('Draw!', 'Threefold repetition');
                playSound('gameover');
                return;
            }

            // Play check sound
            if (inCheck) {
                playSound('check');
            }
        }

        function showGameOver(title, message) {
            document.getElementById('game-over-title').textContent = title;
            document.getElementById('game-over-message').textContent = message;
            document.getElementById('game-over-modal').classList.add('active');
        }

        function updateTurnIndicator() {
            const indicator = document.getElementById('turn-indicator');
            if (GameState.currentTurn === 'white') {
                indicator.textContent = 'White to move';
                indicator.className = 'turn-indicator white-turn';
            } else {
                indicator.textContent = 'Black to move';
                indicator.className = 'turn-indicator black-turn';
            }
        }

        // ============================================
        // Drag and Drop
        // ============================================

        function handleDragStart(e) {
            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);
            
            if (GameState.gameMode === 'ai' && GameState.currentTurn !== GameState.playerColor) {
                e.preventDefault();
                return;
            }

            const piece = getPiece(row, col);
            if (!piece || piece.color !== GameState.currentTurn) {
                e.preventDefault();
                return;
            }

            e.target.classList.add('dragging');
            GameState.selectedSquare = { row, col };
            GameState.validMoves = getLegalMoves(row, col);
            renderBoard();
        }

        function handleDragEnd(e) {
            e.target.classList.remove('dragging');
        }

        // ============================================
        // AI Implementation
        // ============================================

        function getAIColor() {
            return GameState.playerColor === 'white' ? 'black' : 'white';
        }

        function selectDifficulty(difficulty) {
            GameState.aiDifficulty = difficulty;
            
            // Update selection UI
            document.querySelectorAll('#difficulty-screen .selection-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('selected');
            
            // Go to color selection
            setTimeout(() => showScreen('color-screen'), 300);
        }

        function startAIMode(color) {
            GameState.gameMode = 'ai';
            GameState.playerColor = color;
            startGame();
        }

        function start2PlayerMode() {
            GameState.gameMode = '2player';
            startGame();
        }

        function startGame() {
            initializeBoard();
            renderBoard();
            updateTurnIndicator();
            clearCapturedPieces();
            showScreen('game-screen');

            // AI moves first if player chose black
            if (GameState.gameMode === 'ai' && GameState.playerColor === 'black') {
                setTimeout(makeAIMove, 500);
            }
        }

        function clearCapturedPieces() {
            document.getElementById('captured-white').innerHTML = '';
            document.getElementById('captured-black').innerHTML = '';
        }

        function restartGame() {
            startGame();
        }

        function backToMenu() {
            showScreen('home-menu');
        }

        function quitToHomepage() {
    if (window.parent !== window) {
        // We are inside iframe / embedded game
        window.parent.location.href = 'https://shreemarwadi.github.io/Redmark-Studio/';
    } else {
        // Normal fallback
        window.location.href = 'https://shreemarwadi.github.io/Redmark-Studio/';
    }
}


        function makeAIMove() {
            if (GameState.gameOver) return;

            const depth = GameState.aiDifficulty === 'easy' ? 1 : 
                         GameState.aiDifficulty === 'medium' ? 2 : 3;
            
            // Add some randomness for easy mode
            let moves = getAllLegalMoves(getAIColor());
            
            if (GameState.aiDifficulty === 'easy') {
                // Filter out obvious blunders occasionally
                if (Math.random() < 0.3) {
                    moves = filterOutBlunders(moves, 1);
                }
            }

            if (moves.length === 0) return;

            let bestMove;
            
            if (GameState.aiDifficulty === 'easy') {
                // Simple random selection with basic evaluation
                bestMove = getBestMoveSimple(moves);
            } else {
                // Minimax with alpha-beta pruning
                bestMove = minimax(depth, getAIColor(), -Infinity, Infinity).move;
            }

            if (bestMove) {
                executeMove(bestMove.fromRow, bestMove.fromCol, bestMove.toRow, bestMove.toCol);
            }
        }

        function getAllLegalMoves(color) {
            const moves = [];
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const piece = getPiece(r, c);
                    if (piece && piece.color === color) {
                        const pieceMoves = getLegalMoves(r, c);
                        pieceMoves.forEach(move => {
                            moves.push({ fromRow: r, fromCol: c, toRow: move.row, toCol: move.col });
                        });
                    }
                }
            }
            return moves;
        }

        function filterOutBlunders(moves, threshold) {
            if (moves.length <= threshold) return moves;
            
            const evaluated = moves.map(move => {
                const tempBoard = cloneBoard();
                applyMove(tempBoard, move);
                return { move, score: -evaluateBoard(tempBoard, getAIColor()) };
            });
            
            evaluated.sort((a, b) => b.score - a.score);
            return evaluated.slice(0, Math.max(1, moves.length - threshold)).map(e => e.move);
        }

        function getBestMoveSimple(moves) {
            // Prioritize captures and checks
            let bestMoves = [];
            let bestScore = -Infinity;

            moves.forEach(move => {
                const tempBoard = cloneBoard();
                applyMove(tempBoard, move);
                const score = evaluateBoard(tempBoard, getAIColor());
                
                // Bonus for captures
                const captured = getPiece(move.toRow, move.toCol);
                if (captured) {
                    score += PIECE_VALUES[captured.type] * 0.5;
                }

                if (score > bestScore) {
                    bestScore = score;
                    bestMoves = [move];
                } else if (score === bestScore) {
                    bestMoves.push(move);
                }
            });

            return bestMoves[Math.floor(Math.random() * bestMoves.length)];
        }

        function cloneBoard() {
            return GameState.board.map(row => row.map(piece => piece ? { ...piece } : null));
        }

        function applyMove(board, move) {
            const piece = board[move.fromRow][move.fromCol];
            board[move.toRow][move.toCol] = piece;
            board[move.fromRow][move.fromCol] = null;
        }

        function minimax(depth, color, alpha, beta) {
            if (depth === 0) {
                return { score: evaluateBoard(cloneBoard(), color) };
            }

            const moves = getAllLegalMoves(color);
            
            if (color === getAIColor()) {
                let bestScore = -Infinity;
                let bestMove = null;

                for (const move of moves) {
                    const tempBoard = cloneBoard();
                    applyMove(tempBoard, move);
                    
                    const result = minimax(depth - 1, color === 'white' ? 'black' : 'white', alpha, beta);
                    
                    if (result.score > bestScore) {
                        bestScore = result.score;
                        bestMove = move;
                    }
                    
                    alpha = Math.max(alpha, result.score);
                    if (beta <= alpha) break;
                }

                return { score: bestScore, move: bestMove };
            } else {
                let bestScore = Infinity;
                let bestMove = null;

                for (const move of moves) {
                    const tempBoard = cloneBoard();
                    applyMove(tempBoard, move);
                    
                    const result = minimax(depth - 1, color === 'white' ? 'black' : 'white', alpha, beta);
                    
                    if (result.score < bestScore) {
                        bestScore = result.score;
                        bestMove = move;
                    }
                    
                    beta = Math.min(beta, result.score);
                    if (beta <= alpha) break;
                }

                return { score: bestScore, move: bestMove };
            }
        }

        function evaluateBoard(board, forColor) {
            let score = 0;
            
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const piece = board[r][c];
                    if (!piece) continue;

                    let pieceValue = PIECE_VALUES[piece.type];
                    
                    // Position value
                    const pst = PST[piece.type];
                    if (pst) {
                        const posRow = piece.color === 'white' ? r : 7 - r;
                        pieceValue += pst[posRow][c];
                    }

                    if (piece.color === forColor) {
                        score += pieceValue;
                    } else {
                        score -= pieceValue;
                    }
                }
            }

            return score;
        }

        // ============================================
        // Initialization
        // ============================================

        document.addEventListener('DOMContentLoaded', () => {
            // Drag and drop event listeners
            const board = document.getElementById('chessboard');
            
            board.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            board.addEventListener('drop', (e) => {
                e.preventDefault();
                const square = e.target.closest('.square');
                if (!square) return;

                const toRow = parseInt(square.dataset.row);
                const toCol = parseInt(square.dataset.col);

                if (GameState.selectedSquare) {
                    const isValid = GameState.validMoves.some(m => m.row === toRow && m.col === toCol);
                    if (isValid) {
                        const move = GameState.validMoves.find(m => m.row === toRow && m.col === toCol);
                        executeMove(GameState.selectedSquare.row, GameState.selectedSquare.col, toRow, toCol, move);
                    }
                }
            });

            // Prevent scrolling on mobile
            document.addEventListener('touchmove', (e) => {
                if (e.target.closest('#chessboard')) {
                    e.preventDefault();
                }
            }, { passive: false });

            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    hideModal('promotion-modal');
                    hideModal('game-over-modal');
                }
                if (e.key === 'r' && e.ctrlKey) {
                    e.preventDefault();
                    restartGame();
                }
            });
        });