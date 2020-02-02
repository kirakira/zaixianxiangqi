from google.appengine.ext import ndb

class User(ndb.Model):
  name = ndb.StringProperty()
  ai = ndb.BooleanProperty()

# This is child table of User.
class Session(ndb.Model):
  creation = ndb.DateTimeProperty(auto_now_add=True)

class Game(ndb.Model):
  creation = ndb.DateTimeProperty(auto_now_add=True) # if game is forked, this is the time when it is forked
  description = ndb.TextProperty()
  red = ndb.IntegerProperty()
  black = ndb.IntegerProperty()
  moves = ndb.TextProperty()
  redActivity = ndb.DateTimeProperty()
  blackActivity = ndb.DateTimeProperty()
  forkedFrom = ndb.StringProperty() # gid of its parent game, or empty
  forkedMoveCount = ndb.IntegerProperty() # how many moves from its parent game are forked
  nextToMove = ndb.IntegerProperty() # gid of the player to move next, or empty for new or ended games

class Message(ndb.Model):
  gid = ndb.StringProperty()
  uid = ndb.IntegerProperty()
  creation = ndb.DateTimeProperty(auto_now_add=True)
  content = ndb.TextProperty()
