var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var objectId = require('mongodb').ObjectId;
var app = express();

app.use(bodyParser.urlencoded({ extend: true }));
app.use(bodyParser.json());

var port = 8686;

app.listen(port);

var db = new mongodb.Db(
  'instagram',
  new mongodb.Server('localhost', 27017, {}),
  {}
);

console.log('Servidor HTTP online porta ' + port);

app.get('/', function (req, res) {
  res.send({ msg: 'ola' })
});

app.post('/api', function (req, res) {

  var dados = req.body;

  db.open(function (erro, mongoClient) {
    mongoClient.collection('postagens', function (err, collection) {
      collection.insert(dados, function (erro, records) {
        console.log('open..');
        if (erro) {
          res.json(erro);

        } else {
          console.log(records);
          res.json(records);
        }
        mongoClient.close();
      });
    });
  });

});

app.get('/api', function (req, res) {

  db.open(function (erro, mongoClient) {
    mongoClient.collection('postagens', function (err, collection) {
      collection.find().toArray(function (err, results) {
        if (err) {
          res.json(err);
        } else {
          res.json(results);
        }

        mongoClient.close();
      });
    });
  });

})

//Get by ID
app.get('/api/:id', function (req, res) {
  console.log(objectId(req.params.id));
  db.open(function (erro, mongoClient) {
    mongoClient.collection('postagens', function (err, collection) {
      collection.find(objectId(req.params.id)).toArray(function (err, results) {
        if (err) {
          res.json(err);
        } else {
          res.json(results);
        }
        mongoClient.close();
      });
    });
  });

});

app.put('/api/:id', function (req, res) {

  db.open(function (erro, mongoClient) {
    mongoClient.collection('postagens', function (err, collection) {
      collection.update(
        { _id: objectId(req.params.id) },
        { $set: { titulo: req.body.titulo } },
        {},
        function (erro, records) {
          if (erro) {
            res.json(erro);
          } else {
            res.json(records);
          }
          mongoClient.close();
        }
      );

    });
  });
});

app.delete('/api/:id', function (req, res) {

  db.open(function (erro, mongoClient) {
    mongoClient.collection('postagens', function (err, collection) {
      collection.remove({_id:objectId(req.params.id)}, function(erro, records){
          if(err){
            res.json(erro);
          }else{
            res.json(records);
          }
          mongoClient.close();
      });

    });
  });
});
