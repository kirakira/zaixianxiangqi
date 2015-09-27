from model import *
from google.appengine.ext import ndb

import webapp2

class JanitorPage(webapp2.RequestHandler):
  def get(self):
    self.response.write('haha')

app = webapp2.WSGIApplication([
    (r'/janitor', JanitorPage),
], debug=True)
