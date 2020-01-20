from model import *
from google.appengine.ext import ndb

import logging
import datetime
import webapp2

@ndb.transactional
def removeGame(gid):
  game = Game.get_by_id(gid)
  if game is not None and (game.red is None or game.black is None):
    game.key.delete()
    return True
  return False

class JanitorPage(webapp2.RequestHandler):
  def get(self):
    now = datetime.datetime.utcnow()
    logging.info('janitor starting')
    for game in Game.query(
        ndb.AND(ndb.AND(Game.creation >= (now - datetime.timedelta(days=4)),
          Game.creation <= (now - datetime.timedelta(days=2))),
          ndb.OR(Game.red == None, Game.black == None))).fetch():
      gameId = game.key.id()
      try:
        if removeGame(gameId):
          logging.info('garbage collected game %s' % gameId)
        else:
          raise ValueError('game is not empty when trying to delete')
      except error:
        logging.warning('error while garbage collecting %s: %s' % (gameId, str(error)))

app = webapp2.WSGIApplication([
    (r'/janitor', JanitorPage),
], debug=True)
