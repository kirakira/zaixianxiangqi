# encoding=utf8

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
  red = ndb.StringProperty()
  black = ndb.StringProperty()
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
    return session.uid

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
  return [uid, sid]

def getRecentGame(uid):
  # TODO
  return None

def getUserName(uid):
  return User.get_by_id(uid).name

def createGame(uid):
  gid = ''
  while True:
    gid = generateRandomString(6)
    game = Game(id=generateRandomString(6), description=u'%s 创建的棋局' % getUserName(uid))
    game.put() # TODO: try catch error
    break
  return gid

def setNoCache(response):
  response.headers.add_header('Cache-Control', 'no-cache, no-store, must-revalidate')
  response.headers.add_header('Pragma', 'no-cache')
  response.headers.add_header('Expires', '0')

class MainPage(webapp2.RequestHandler):
  def get(self):
    [uid, sid] = getOrCreateUser(self.request.get('sid'))
    gid = getRecentGame(uid)
    if gid is None:
      gid = createGame(uid)
    self.response.headers.add_header('Set-Cookie', 'sid=%s;' % sid)
    setNoCache(self.response)
    self.redirect('/game/' + gid)

class GamePage(webapp2.RequestHandler):
  def get(self, gid):
    [uid, sid] = getOrCreateUser(self.request.get('sid'))
    self.response.headers.add_header('Set-Cookie', 'sid=%s;' % sid)
    setNoCache(self.response)
    template = JINJA_ENVIRONMENT.get_template('game.html')
    self.response.write(template.render({'jsCode': 'var currentGameId = "%s", gameInfo = "%s";' % (gid, '')}))

class GameInfoApi(webapp2.RequestHandler):
  def get(self):
    pass
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
