# encoding=utf8

from google.appengine.ext import ndb

import logging
import os

import jinja2
import webapp2
from webapp2_extras import routes

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

class Acme(ndb.Model):
  value = ndb.StringProperty()

logging.getLogger().setLevel(logging.DEBUG)

class StoreChallenge(webapp2.RequestHandler):
  def post(self):
    if 'key' not in self.request.POST or 'value' not in self.request.POST:
      self.error(400)
    else:
      key = self.request.POST['key']
      value = self.request.POST['value']
      Acme(id=key, value=value).put()
      self.redirect('/.well-known/acme-challenge/%s' % key)

  def get(self, key):
    template = JINJA_ENVIRONMENT.get_template('store-acme.html')
    self.response.write(template.render({
      'key': key
    }))

class ACMEHandler(webapp2.RequestHandler):
  def get(self, key):
    logging.info('Received challenge key %s' % key)
    entry = ndb.Key(Acme, key).get()
    if entry is not None:
      self.response.content_type = 'text/plain'
      self.response.write(entry.value)
    else:
      logging.info('Challenge %s is unknown' % key)
      self.redirect('/store-acme-challenge/%s' % key)

app = webapp2.WSGIApplication([
  (r'/store-acme-challenge/(.*)', StoreChallenge),
  (r'/store-acme-challenge', StoreChallenge),
  (r'/\.well-known/acme-challenge/(.*)', ACMEHandler),
])
