# encoding=utf8

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

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

logging.getLogger().setLevel(logging.DEBUG)

class User(ndb.Model):
  name = ndb.StringProperty()
  migrationKey = ndb.StringProperty()

class Session(ndb.Model):
  uid = ndb.IntegerProperty()
  creation = ndb.DateTimeProperty(auto_now_add=True)

class Game(ndb.Model):
  creation = ndb.DateTimeProperty(auto_now_add=True)
  description = ndb.TextProperty()
  red = ndb.IntegerProperty()
  black = ndb.IntegerProperty()
  moves = ndb.TextProperty()
  redActivity = ndb.DateTimeProperty()
  blackActivity = ndb.DateTimeProperty()

class Message(ndb.Model):
  gid = ndb.StringProperty()
  uid = ndb.IntegerProperty()
  creation = ndb.DateTimeProperty(auto_now_add=True)
  content = ndb.TextProperty()

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
  # TODO: change this to a transaction
  migrationKey = ''
  while True:
    migrationKey = generateRandomString(6)
    if len(User.query(User.migrationKey == migrationKey).fetch()) == 0:
      break
  user = User(name=pickRandomName(), migrationKey=migrationKey)
  userKey = user.put()
  sid = createSessionForUser(userKey.id())
  return [userKey.id(), sid]

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

def createGame(uid):
  gid = ''
  while True:
    gid = generateRandomString(6)
    logging.debug('generated random gid: ' + gid)
    game = Game(id=gid, description=u'%s创建的棋局' % getUserName(uid), moves='')
    if random.randrange(0, 2) == 0:
      game.red = uid
    else:
      game.black = uid
    updateActivityTime(uid, game)
    game.put() # TODO: try catch error
    logging.debug('game.key: ' + game.key.id())
    break
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

def escapeJS(raw):
  return raw.replace('</', '<\\/')

def userInGame(uid, game):
  return game.red == uid or game.black == uid

def sit(uid, game, side):
  if side == 'red':
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

def makeMove(game, red, newMovesString):
  oldMoves = game.moves.split('/')
  newMoves = newMovesString.split('/')
  if len(newMoves) != len(oldMoves) + 1:
    raise ValueError('new moves is not based on old moves')
  for i in range(0, len(oldMoves)):
    if newMoves[i] != oldMoves[i]:
      raise ValueError('new moves diverged from old moves')

  b = board()
  for move in oldMoves:
    if move == '':
      continue
    if isRegularMove(move):
      b.move(int(move[0]), int(move[1]), int(move[2]), int(move[3]))
    else:
      logging.error('unknown move: ' + move)

  newMove = newMoves[-1]
  if isRegularMove(newMove):
    if red != b.redToGo:
      raise ValueError('player is not in move')

    if not b.checkedMove(int(newMove[0]), int(newMove[1]), int(newMove[2]), int(newMove[3])):
      raise ValueError('invalid move: ' + newMove)

    if b.hasWinningMove():
      newMovesString += '/R' if b.redToGo else '/B'
    elif b.isLosing():
      newMovesString += '/B' if b.redToGo else '/R'
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
      logging.debug('no recent game')
      gid = None
    else:
      gid = recentGames[0].key.id()
      logging.debug('recent game: ' + gid)
  if gid is None:
    gid = createGame(uid)
    logging.debug('created game: ' + gid)
  return gid

class MainPage(webapp2.RequestHandler):
  def get(self):
    [uid, sid] = getOrCreateUser(self.request.cookies.get('sid'))
    setNoCache(self.response)
    self.response.set_cookie('sid', str(sid))
    gid = createOrGetRecentGame(uid, False)
    self.redirect('/game/' + gid)

class NewPage(webapp2.RequestHandler):
  def get(self):
    [uid, sid] = getOrCreateUser(self.request.cookies.get('sid'))
    setNoCache(self.response)
    self.response.set_cookie('sid', str(sid))
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
    self.response.set_cookie('sid', str(sid))

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
      logging.info('setgameinfo failed on %s: %s' % (self.request.body, str(error)))

class UserInfoApi(webapp2.RequestHandler):
  def get(self):
    pass
  def post(self):
    pass

app = webapp2.WSGIApplication([
    (r'/', MainPage),
    (r'/new', NewPage),
    (r'/game/([^/]+)', GamePage),
    (r'/gameinfo', GameInfoApi),
    (r'/userinfo', UserInfoApi),
], debug=True)
