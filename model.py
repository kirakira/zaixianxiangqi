from google.appengine.ext import ndb

class User(ndb.Model):
  name = ndb.StringProperty()

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

