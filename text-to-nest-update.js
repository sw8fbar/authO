var MongoClient = require('mongodb').MongoClient;
var request = require('request');

module.exports = function (ctx, done) {
  console.log(ctx.data);
  var from = ctx.data.From;
  console.log("From ", from);
  var nest_url = 'https://developer-api.nest.com/devices/thermostats/';

  MongoClient.connect(ctx.data.DATABASE_URL, function (err, db) {
    if (err) {
      console.log(err);
      done(err);
    }

    db.collection('credentials').find({phone: from}).limit(1).next(function (err, cred) {
      if (err) {
        console.log(err);
        done(err);
      }

      db.close();

      if (cred) {
        console.log("Found creds ", cred);
        var temp = 0;
        try {
          temp = parseInt(ctx.data.Body)

        } catch (err) {
          console.log(err);
          done(err);
        }

        request({
          method: 'PUT',
          uri: nest_url + cred.device,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+cred.token
          },
          body: {"target_temperature_f": temp},
          followAllRedirects: true,
          json: true
        }, function (err, response) {
          if (err) {
            console.log(err);
            done(err);
          }
          console.log(response.status);
          done(response);
        })

      } else {
        console.log('User not found');
        done(new Error('User not found'))
      }
    });
  })

}
