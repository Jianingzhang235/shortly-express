const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.get('/', 
(req, res) => {
  res.render('index');
});

app.get('/create', 
(req, res) => {
  res.render('index');
});

app.get('/links', 
(req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/links', 
(req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.post('/signup', (req, res, next) => {
  //we need username, password -> put in object to store each user data
    //access Users info --> models.Users.get({username})
    //var username = req.body.username
    //var password = req.body.password
    //body is father of entire element
  //if username data exists,
    //res.redirect(go '/signup')!
  //if username doesn't exist, we can sign up user
    //create username and password
      //{username: username, password: password}
    //res.redirect('/')

  var username = req.body.username;
  var password = req.body.password;
  return models.Users.get({username: username})
    .then(userData => {
      if (userData) {
      res.redirect('/signup');
    } else {
      models.Users.create({username: username, password: password});
      res.redirect('/');
      console.log('user created')
    }
  })
});

//if username does not exist -> go back to /login
//if username exists --> .get({username: username})
//AND password exists/correct
  //comparing user's submitted password to the hashedpw in db
  //compareHash = (attempted, stored, salt) => {
  
//if incorrect -> go back to /login
//if correct,  '/'

//check username: compare username 
app.post('/login', (req, res, next) => {
  var username = req.body.username;
  var password = req.body.password;

  //if username doesn't exist, res.redirect('/login')
return models.Users.get({username: username})
  .then(storedData => {
    if (storedData) {
      // res.redirect('/');
      var matchingPass = models.Users.compare(password, storedData.password, storedData.salt);
      console.log('password match? ' + matchingPass)

      if (matchingPass) {
        res.redirect('/');
      } else {
      res.redirect('/login');
      }
    
    } else {
      res.redirect('/login');
    }
      // if (models.Users.compare(password, storedData.password, salt)) {
      //   res.redirect('/');
      //   console.log('HELLO')
      // } else {
      //   res.redirect('/login');
      // } 


    // } else {
    //   res.redirect('/login');
    // }
  });
});      
  //if username exists
    //compare password
      //if pass word is correct
        //go next '/'
  //storedData exists and models.Users.compare(aptPassword, storedData.password, storedData.salt)
  
/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
