# encoding=utf8

di = [0, 1, 0, -1]
dj = [1, 0, -1, 0]
ddi = [1, 1, -1, -1]
ddj = [1, -1, -1, 1]

def parsePosition(name):
  return (int(name[0]), int(name[1]))

def parseMove(move):
  return parsePosition(move[:2]) + parsePosition(move[2:])

def isRedPiece(piece):
  return piece.isupper()

def isKing(piece):
  return piece == 'k' or piece == 'K'

def inBoard(i, j):
  return i >= 0 and i < 10 and j >= 0 and j < 9

def inPalace(i, j):
  return ((i >= 0 and i <= 2) or (i >= 7 and i <= 9)) and j >= 3 and j <= 5

def inRedBase(i, j):
  return inBoard(i, j) and i >= 5

def inBlackBase(i, j):
  return inBoard(i, j) and i < 5

class board:
  def __init__(self):
    self.board = []
    for i in range(0, 10):
      self.board.append([])
      for j in range(0, 9):
        self.board[i].append("")
    self.redToGo = True
    self.moveHistory = []
    self.setBoard("rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR", True);

  def setBoard(self, fen, redToGo):
    rows = fen.split("/")
    for i in range(0, 10):
      j = 0
      for c in rows[i]:
        if c.isdigit():
          j += int(c)
        else:
          self.board[i][j] = c
          j += 1
    self.redToGo = redToGo

  def move(self, i1, j1, i2, j2):
    self.moveHistory.append((i1, j1, i2, j2, self.board[i2][j2]))
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
      if not self.hasWinningMove():
        notLosing = True
      self.unmove()
      if notLosing:
        return False
    return True

  def generatePieceMoves(self, piece, i, j):
    if piece.lower() == 'k':
      moves = self.generateKMoves(i, j)
    elif piece.lower() == 'a':
      moves = self.generateAMoves(i, j)
    elif piece.lower() == 'e':
      if isRedPiece(piece):
        moves = self.generateREMoves(i, j)
      else:
        moves = self.generateBEMoves(i, j)
    elif piece.lower() == 'h':
      moves = self.generateHMoves(i, j)
    elif piece.lower() == 'r':
      moves = self.generateRMoves(i, j)
    elif piece.lower() == 'c':
      moves = self.generateCMoves(i, j)
    elif piece.lower() == 'p':
      if isRedPiece(piece):
        moves = self.generateRPMoves(i, j)
      else:
        moves = self.generateBPMoves(i, j)

    filteredMoves = []
    for move in moves:
      target = self.board[move[2]][move[3]]
      if target == '' or isRedPiece(target) != self.redToGo:
        filteredMoves.append(move)
    return filteredMoves

  def generateKMoves(self, i, j):
    moves = []
    for r in range(0, 4):
      if inPalace(i + di[r], j + dj[r]):
        moves.append((i, j, i + di[r], j + dj[r]))
    for delta in [-1, 1]:
      ii = i
      while inBoard(ii + delta, j):
        ii += delta
        if isKing(self.board[ii][j]):
          moves.append((i, j, ii, j))
        elif self.board[ii][j] != '':
          break
    return moves

  def generateAMoves(self, i, j):
    moves = []
    for r in range(0, 4):
      if inPalace(i + ddi[r], j + ddj[r]):
        moves.append((i, j, i + ddi[r], j + ddj[r]))
    return moves

  def generateREMoves(self, i, j):
    moves = []
    for r in range(0, 4):
      if inRedBase(i + 2 * ddi[r], j + 2 * ddj[r]) and self.board[i + ddi[r]][j + ddj[r]] == '':
        moves.append((i, j, i + 2 * ddi[r], j + 2 * ddj[r]))
    return moves

  def generateBEMoves(self, i, j):
    moves = []
    for r in range(0, 4):
      if inBlackBase(i + 2 * ddi[r], j + 2 * ddj[r]) and self.board[i + ddi[r]][j + ddj[r]] == '':
        moves.append((i, j, i + 2 * ddi[r], j + 2 * ddj[r]))
    return moves

  def generateHMoves(self, i, j):
    table = [(1, 2, 0, 1), (1, -2, 0, -1), (-1, 2, 0, 1), (-1, -2, 0, -1),
             (2, 1, 1, 0), (2, -1, 1, 0), (-2, 1, -1, 0), (-2, -1, -1, 0)]
    moves = []
    for move in table:
      if inBoard(i + move[0], j + move[1]) and self.board[i + move[2]][j + move[3]] == '':
        moves.append((i, j, i + move[0], j + move[1]))
    return moves

  def generateRMoves(self, i, j):
    moves = []
    for r in range(0, 4):
      ni = i
      nj = j
      while inBoard(ni + di[r], nj + dj[r]):
        ni += di[r]
        nj += dj[r]
        moves.append((i, j, ni, nj))
        if self.board[ni][nj] != '':
          break
    return moves

  def generateCMoves(self, i, j):
    moves = []
    for r in range(0, 4):
      ni = i
      nj = j
      met = False
      while inBoard(ni + di[r], nj + dj[r]):
        ni += di[r]
        nj += dj[r]
        if self.board[ni][nj] != '':
          if met:
            moves.append((i, j, ni, nj))
            break
          else:
            met = True
        elif not met:
          moves.append((i, j, ni, nj))
    return moves

  def generateRPMoves(self, i, j):
    moves = []
    if inRedBase(i, j):
      moves.append((i, j, i - 1, j))
    else:
      if inBoard(i - 1, j):
        moves.append((i, j, i - 1, j))
      if inBoard(i, j - 1):
        moves.append((i, j, i, j - 1))
      if inBoard(i, j + 1):
        moves.append((i, j, i, j + 1))
    return moves

  def generateBPMoves(self, i, j):
    moves = []
    if inBlackBase(i, j):
      moves.append((i, j, i + 1, j))
    else:
      if inBoard(i + 1, j):
        moves.append((i, j, i + 1, j))
      if inBoard(i, j - 1):
        moves.append((i, j, i, j - 1))
      if inBoard(i, j + 1):
        moves.append((i, j, i, j + 1))
    return moves

  def output(self):
    for i in range(0, 10):
      print(self.board[i])

  def printMoves(self):
    moves = self.generateAllMoves()
    for move in moves:
      print('%d %d %d %d' % (move[0], move[1], move[2], move[3]))
