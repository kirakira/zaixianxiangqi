# encoding=utf8

def parsePosition(name):
  return (int(name[0]), int(name[1]))

def parseMove(move):
  return parsePosition(move[:2]) + parsePosition(move[2:])

def isRedPiece(piece):
  return piece.isupper()

def isKing(piece):
  return piece == 'k' or piece == 'K'

class board:
  def __init__(self):
    self.board = []
    for i in range(0, 10):
      self.board.append([])
      for j in range(0, 9):
        self.board[i].append("")
    self.redToGo = True
    self.moveHistory = []
    self.setBoard("rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR", true);

  def setBoard(self, fen, redToGo):
    rows = fen.split("/")
    for i in range(0, 10):
      j = 0
      for c in rows[i]:
        if c.isdigit():
          j += int(c)
        else:
          self.board[i][j] = c
    self.redToGo = redToGo

  def move(self, i1, j1, i2, j2):
    self.moveHistory.append((i1, j1, i2, j2, board[i2][j2]))
    self.board[i2][j2] = self.board[i1][j1]
    self.board[i1][j1] = ''
    self.redToGo = not self.redToGo

  def unmove(self):
    last = self.moveHistory.pop()
    self.board[last[0]][last[1]] = self.board[last[2]][last[3]]
    self.board[last[2]][last[3]] = last[4]
    self.redToGo = not self.redToGo

  def checkedMove(self, i1, j1, i2, j2):
    if self.board[i1][j1] == '' or isRedPiece(self.board[i1][j1]) != self.redToGo:
      return False
    moves = self.generatePieceMoves(self.board[i1][j1], i1, j1)
    if (i1, j1, i2, j2) not in moves:
      return False

    self.move(i1, j1, i2, j2)
    if self.hasWinningMove():
      self.unmove()
      return False
    return True

  def hasWinningMove(self):
    for move in self.generateAllMoves():
      if isKing(self.board[move[2]][move[3]]):
        return True
    return False

  def generateAllMoves(self):
    moves = []
    for i in range(0, 10):
      for j in range(0, 9):
        if self.board[i][j] != '' and isRedPiece(self.board[i][j]) == self.redToGo:
          moves += self.generatePieceMoves(self.board[i][j], i, j)
    return moves

  def isLosing(self):
    for move in self.generateAllMoves():
      if isKing(self.board[move[2]][move[3]]):
        return False
      self.move(move[0], move[1], move[2], move[3])
      notLosing = False
      if !self.hasWinningMove():
        notLosing = True
      self.unmove()
      if notLosing:
        return False
    return True

  def generatePieceMoves(piece, i, j):
    if piece.lower() == 'k':
      moves = self.generateKMoves(i, j)
    elif piece.lower() == 'a':
      moves = self.generateAMoves(i, j)
    elif piece.lower() == 'e':
      moves = self.generateEMoves(i, j)
    elif piece.lower() == 'h':
      moves = self.generateHMoves(i, j)
    elif piece.lower() == 'r':
      moves = self.generateRMoves(i, j)
    elif piece.lower() == 'c':
      moves = self.generateCMoves(i, j)
    elif piece.lower() == 'p':
      moves = self.generatePMoves(i, j)

    filteredMoves = []
    for move in moves:
      target = self.board[move[2]][move[3]]
      if target == '' || isRedPiece(target) != self.redToGo:
        filteredMoves += move
    return filteredMoves
