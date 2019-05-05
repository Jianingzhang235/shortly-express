const parseCookies = (req, res, next) => {
//turn cookie string into usable key-val pairs
  let cookieString = req.get('Cookie');
  //take array of strings to return into objwith key-value pairs
  cookieString.split('; ').reduce((cookies, cookie) => {
    if(cookie){
      let parts = cookie.split('=');
      cookies[parts[0]] = parts[1];
    }
    
    return cookies;
  }, {})

  console.log(parsedCookies);
  req.cookies = parsedCookies;
  next();
};

module.exports = parseCookies;