var MongoClient = require('mongodb').MongoClient;

module.exports = function(ctx, done){

  console.log(ctx.data.DATABASE_URL);

  var creds = {}
  creds.phone = ctx.data.phone;
  creds.token = ctx.data.token;
  creds.device = ctx.data.device;

  MongoClient.connect(ctx.data.DATABASE_URL, function (err, db) {
    if(err) return done(err);

    save_creds(creds, db, function (err) {
      if(err) done(err);

      db.close();
      done(null, 'Success');
    });
  })

  function save_creds(creds, db, cb){
    db.collection('credentials').find({phone: creds.phone}).limit(1).next(function(err, cred){
      if(cred) {
        return db.collection('credentials').findOneAndUpdate({phone: creds.phone}, {$set: {token: creds.token}, cb});
      } else {
        return db.collection('credentials').insert(creds, cb);
      }
    })
  }
}
