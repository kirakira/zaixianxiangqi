# encoding=utf8

from model import *
from board import board
import datetime
import json
import logging
import os
import random
import urllib

from google.appengine.ext import ndb

import jinja2
import webapp2
from webapp2_extras import routes

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

logging.getLogger().setLevel(logging.DEBUG)

def getUid(sid):
  if sid is None or len(sid) == 0:
    return None
  session = Session.get_by_id(long(sid))
  if session is None:
    return None
  else:
    return long(session.uid)

def getMostRecentSid(uid):
  return Session.query(Session.uid == uid).order(-Session.creation).fetch(1)[0].key.id()

def pickRandomName():
  names = ['养一狗', '猥男', '清晰知足', '周杰伦', 'SlaveMunde', 'zhaoweijie13', '啊啊啊', '大了', '巨大了', '求蠢', '求不蠢', '司马', '麻皮大意', '小地雷', '长考一秒', '將五进一', '缩了', '慌了', '窝心傌', 'Excited!', '闷声发大财', '王猛日', 'Kebe', '死妈达', '单小娟']
  return names[random.randrange(0, len(names))]

def generateRandomString(length):
  alphabet = 'abcdefghijkmnpqrstuvwxyz'
  ret = ''
  for i in range(0, length):
    ret += alphabet[random.randrange(0, len(alphabet))]
  return ret

def createUser():
  user = User(name=pickRandomName())
  user.put()
  sid = createSessionForUser(user.key.id())
  return [user.key.id(), sid]

def createSessionForUser(uid):
  session = Session(uid=uid)
  return session.put().id()

def getOrCreateUser(sid):
  uid = getUid(sid)
  if uid is None:
    [uid, sid] = createUser()
  else:
    sid = getMostRecentSid(uid)
  return [uid, sid]

def getRecentGames(uid, count):
  return Game.query(ndb.OR(Game.red == uid, Game.black == uid)).order(-Game.creation).fetch(count)

def getUserName(uid):
  return User.get_by_id(uid).name

def updateActivityTime(uid, game):
  if game.red == uid:
    game.redActivity = datetime.datetime.utcnow()
  if game.black == uid:
    game.blackActivity = datetime.datetime.utcnow()

@ndb.transactional
def insertGameIfNotExists(game):
  if Game.get_by_id(game.key.id()) is None:
    game.put()
    return True
  else:
    return False

def createGame(uid):
  gid = ''
  while True:
    gid = generateRandomString(6)
    logging.info('generated random gid: ' + gid)
    game = Game(id=gid, description=u'%s创建的棋局' % getUserName(uid), moves='')
    if random.randrange(0, 2) == 0:
      game.red = uid
    else:
      game.black = uid
    updateActivityTime(uid, game)
    if insertGameIfNotExists(game):
      logging.info('game.key: ' + game.key.id())
      break
    else:
      logging.warning('createGame race condition detected: trying to insert gid %s' % gid)
  return gid

def forkGame(uid, parentGid, forkedMoveCount, moves, useRed):
  gid = ''
  while True:
    gid = generateRandomString(6)
    logging.info('generated random gid: ' + gid)
    game = Game(id=gid, description=u'从%s创建的分支棋局' % parentGid,
        moves=moves, forkedFrom=parentGid, forkedMoveCount=forkedMoveCount)
    if useRed:
      game.red = uid
    else:
      game.black = uid
    updateActivityTime(uid, game)
    if insertGameIfNotExists(game):
      logging.info('game.key: ' + game.key.id())
      break
    else:
      logging.warning('createGame race condition detected: trying to insert gid %s' % gid)
  return gid

def getGame(gid):
  if gid is None or len(gid) == 0:
    return None
  return Game.get_by_id(gid)

def formatDateTime(t):
  return t.strftime('%Y-%m-%d %H:%M:%S.%f')

def convertToGameInfo(game):
  d = {'id': game.key.id(), 'creation': formatDateTime(game.creation),
      'description': game.description, 'moves': game.moves}
  if game.red is not None:
    d['red'] = {'id': str(game.red), 'name': getUserName(game.red)}
  if game.black is not None:
    d['black'] = {'id': str(game.black), 'name': getUserName(game.black)}
  return d

def getGameInfoJs(game):
  if game is None:
    return 'bad game id'
  else:
    return json.dumps(convertToGameInfo(game))

def setNoCache(response):
  response.headers.add_header('Cache-Control', 'no-cache, no-store, must-revalidate')
  response.headers.add_header('Pragma', 'no-cache')
  response.headers.add_header('Expires', '0')

def setSidInCookie(response, sid):
  response.set_cookie('sid', str(sid), path='/', expires=datetime.datetime.now() + datetime.timedelta(weeks=52*100))

def escapeJS(raw):
  return raw.replace('</', '<\\/')

def userInGame(uid, game):
  return game.red == uid or game.black == uid

def sit(uid, game, side):
  if game.moves.endswith('R') or game.moves.endswith('B'):
    raise ValueError('cannot sit on a finished game')
  elif side == 'red':
    if game.red is None:
      game.red = uid
      if game.black == uid:
        game.black = None
        game.blackActivity = None
    else:
      raise ValueError('red has been taken')
  elif side == 'black':
    if game.black is None:
      game.black = uid
      if game.red == uid:
        game.red = None
        game.redActivity = None
    else:
      raise ValueError('black has been taken')
  else:
    raise ValueError('unknown side to sit')

def isRegularMove(move):
  return len(move) == 4 and move.isdigit()

def buildBoardFromMoves(moves):
  b = board()
  for move in moves:
    if move == '':
      continue
    if isRegularMove(move):
      b.move(int(move[0]), int(move[1]), int(move[2]), int(move[3]))
    else:
      logging.error('unknown move: ' + move)
  return b

# return '/R' if red won, '/B' if black won, or '' if neither.
def declareGameResult(board):
  if board.hasWinningMove():
    return '/R' if board.redToGo else '/B'
  elif board.isLosing():
    return '/B' if board.redToGo else '/R'
  else:
    return ''

def makeMove(game, red, newMovesString):
  oldMoves = game.moves.split('/')
  newMoves = newMovesString.split('/')
  if len(newMoves) != len(oldMoves) + 1:
    raise ValueError('new moves is not based on old moves')
  for i in range(0, len(oldMoves)):
    if newMoves[i] != oldMoves[i]:
      raise ValueError('new moves diverged from old moves')

  b = buildBoardFromMoves(oldMoves)
  newMove = newMoves[-1]
  if isRegularMove(newMove):
    if red != b.redToGo:
      raise ValueError('player is not in move')

    if not b.checkedMove(int(newMove[0]), int(newMove[1]), int(newMove[2]), int(newMove[3])):
      raise ValueError('invalid move: ' + newMove)

    newMovesString += declareGameResult(b)
  elif newMove == "B" or newMove == "R":
    raise ValueError('user cannot declare result')
  else:
    raise ValueError('unknown move: ' + newMove)

  game.moves = newMovesString

def createOrGetRecentGame(uid, create):
  gid = None
  if not create:
    recentGames = getRecentGames(uid, 1)
    if len(recentGames) == 0:
      logging.info('no recent game')
      gid = None
    else:
      gid = recentGames[0].key.id()
      logging.info('recent game: ' + gid)
  if gid is None:
    gid = createGame(uid)
    logging.info('created game: ' + gid)
  return gid

class MainPage(webapp2.RequestHandler):
  def get(self):
    [uid, sid] = getOrCreateUser(self.request.cookies.get('sid'))
    setNoCache(self.response)
    setSidInCookie(self.response, sid)
    gid = createOrGetRecentGame(uid, False)
    self.redirect('/game/' + gid)

class NewPage(webapp2.RequestHandler):
  def get(self):
    [uid, sid] = getOrCreateUser(self.request.cookies.get('sid'))
    setNoCache(self.response)
    setSidInCookie(self.response, sid)
    gid = createOrGetRecentGame(uid, True)
    self.redirect('/game/' + gid)

class GamePage(webapp2.RequestHandler):
  def get(self, gid):
    setNoCache(self.response)

    game = getGame(gid)
    if game is None:
      self.response.write('bad game id')
      return

    [uid, sid] = getOrCreateUser(self.request.cookies.get('sid'))
    setSidInCookie(self.response, sid)

    template = JINJA_ENVIRONMENT.get_template('game.html')
    self.response.write(template.render({
      'playerName': getUserName(uid),
      'jsCode': escapeJS(u"var currentGameId = '%s', myUid = '%s', gameInfo = JSON.parse('%s');" % (gid, uid, getGameInfoJs(game))),
      'gameTitle': game.description,
      'gameId': gid,
    }))

@ndb.transactional
def updateGameInfo(gid, uid, payload):
  game = getGame(gid)
  if game is None:
    raise ValueError('game not found: ' + gid)

  operated = False
  if 'sit' in payload:
    operated = True
    side = payload['sit']
    sit(uid, game, side)
  if 'description' in payload:
    if not userInGame(uid, game):
      raise ValueError('user not in game')
    operated = True
    game.description = payload['description']
  if 'moves' in payload:
    if not userInGame(uid, game):
      raise ValueError('user not in game')
    if game.red is None or game.black is None:
      raise ValueError('not enough players')
    operated = True
    makeMove(game, True if uid == game.red else False, payload['moves'])

  if not operated:
    raise ValueError('no operation specified')
  else:
    updateActivityTime(uid, game)
    game.put()

  return game

class GameInfoApi(webapp2.RequestHandler):
  def get(self):
    gid = self.request.get('gid')
    self.response.content_type = 'text/plain'
    setNoCache(self.response)
    self.response.write(getGameInfoJs(getGame(gid)))

  def post(self):
    self.response.content_type = 'text/plain'
    setNoCache(self.response)
    try:
      game = None

      if 'gid' not in self.request.POST:
        raise ValueError('gid not specified')
      gid = self.request.POST['gid']

      if 'sid' not in self.request.POST:
        raise ValueError('sid not specified')
      uid = getUid(self.request.POST['sid'])
      if uid is None:
        raise ValueError('bad sid ' + self.request.POST['sid'])

      game = updateGameInfo(gid, uid, self.request.POST)
      self.response.write(json.dumps(
        {'status': 'success', 'gameinfo': convertToGameInfo(game)}
        ))

    except ValueError as error:
      if game is None:
        self.response.write("fail");
      else:
        self.response.write(json.dumps(
          {'status': 'fail', 'gameinfo': convertToGameInfo(game)}
          ))
      logging.warning('setgameinfo failed on %s: %s' % (self.request.body, str(error)))

class UserInfoApi(webapp2.RequestHandler):
  def get(self):
    pass
  def post(self):
    pass

class ForkPage(webapp2.RequestHandler):
  def get(self, gid, moveCount):
    [uid, sid] = getOrCreateUser(self.request.cookies.get('sid'))
    setNoCache(self.response)
    setSidInCookie(self.response, sid)
    self.response.content_type = 'text/plain'

    game = getGame(gid)
    if game is None:
      self.response.write('bad game id')
      return

    moves = [move for move in game.moves.split('/') if isRegularMove(move)]

    moveCount = long(moveCount)
    if moveCount < 0 or moveCount > len(moves):
      self.response.write('bad move count')
      return

    moves = moves[0:moveCount]
    board = buildBoardFromMoves(moves)
    newMoves = ''
    for move in moves:
      newMoves += '/' + move
    newMoves += declareGameResult(board)

    useRed = random.randrange(0, 2) == 0
    if game.red == uid:
      useRed = True
    elif game.black == uid:
      useRed = False

    newGid = forkGame(uid, gid, moveCount, newMoves, useRed)
    self.redirect('/game/' + newGid)

app = webapp2.WSGIApplication([
  routes.DomainRoute('zaixianxiangqi.appspot.com', [
    routes.RedirectRoute(r'/', redirect_to='//zaixianxiangqi.com/'),
  ]),
  (r'/', MainPage),
  (r'/new', NewPage),
  (r'/game/([^/]+)', GamePage),
  (r'/gameinfo', GameInfoApi),
  (r'/userinfo', UserInfoApi),
  (r'/fork/([^/]+)/(\d+)', ForkPage),
])
