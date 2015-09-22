# encoding=utf8

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
  names = ['养一狗', '猥男', '清晰知足', '周杰伦', 'SlaveMunde', 'zhaoweijie13', '啊啊啊', '大了', '巨大了', '求蠢', '求不蠢', '司马', '麻皮大意', '小地雷', '长考一秒', '將五进一', '缩了', '慌了', '窝心傌', 'Excited!', '闷声发大财']
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

def createGame(uid):
  gid = ''
  while True:
    gid = generateRandomString(6)
    game = Game(id=generateRandomString(6), description=u'%s 创建的棋局' % getUserName(uid), moves='')
    if random.randrange(0, 2) == 0:
      game.red = uid
      game.redActivity = datetime.datetime.utcnow()
    else:
      game.black = uid
      game.blackActivity = datetime.datetime.utcnow()
    game.put() # TODO: try catch error
    break
  return gid

def getGame(gid):
  return Game.get_by_id(gid)

def formatDateTime(t):
  return t.strftime('%Y-%m-%d %H:%M:%S.%f')

def convertToGameJson(game):
  d = {'id': game.key.id(), 'creation': formatDateTime(game.creation),
      'description': game.description, 'moves': game.moves}
  if game.red is not None:
    d['red'] = {'id': game.red, 'name': getUserName(game.red)}
  if game.black is not None:
    d['black'] = {'id': game.black, 'name': getUserName(game.black)}
  return json.dumps(d)

def getGameInfoJs(gid):
  if gid is None or len(gid) == 0:
    return 'bad game id'
  game = getGame(gid)
  if game is None:
    return 'bad game id'
  else:
    return convertToGameJson(game)

def setNoCache(response):
  response.headers.add_header('Cache-Control', 'no-cache, no-store, must-revalidate')
  response.headers.add_header('Pragma', 'no-cache')
  response.headers.add_header('Expires', '0')

def escapeJS(raw):
  return raw.replace('</', '<\\/')

class MainPage(webapp2.RequestHandler):
  def get(self):
    [uid, sid] = getOrCreateUser(self.request.cookies.get('sid'))
    setNoCache(self.response)
    self.response.headers.add_header('Set-Cookie', str('sid=%d;' % sid))

    recentGames = getRecentGames(uid, 1)
    if len(recentGames) == 0:
      gid = None
    else:
      gid = recentGames[0].key.id()
    if gid is None:
      gid = createGame(uid)
    self.redirect('/game/' + gid)

class GamePage(webapp2.RequestHandler):
  def get(self, gid):
    print('GID is ' + gid)
    [uid, sid] = getOrCreateUser(self.request.cookies.get('sid'))
    setNoCache(self.response)
    self.response.headers.add_header('Set-Cookie', str('sid=%d;' % sid))

    template = JINJA_ENVIRONMENT.get_template('game.html')
    self.response.write(template.render({
      'playerName': getUserName(uid),
      'jsCode': escapeJS(u'var currentGameId = "%s", gameInfo = "%s";' % (gid, getGameInfoJs(gid)))
    }))

class GameInfoApi(webapp2.RequestHandler):
  def get(self):
    gid = self.request.get('gid')
    self.response.write(getGameInfoJs(gid))

  def post(self):
    pass

class UserInfoApi(webapp2.RequestHandler):
  def get(self):
    pass
  def post(self):
    pass

app = webapp2.WSGIApplication([
    (r'/', MainPage),
    (r'/game/([^/]+)', GamePage),
    (r'/gameinfo', GameInfoApi),
    (r'/userinfo', UserInfoApi),
], debug=True)
