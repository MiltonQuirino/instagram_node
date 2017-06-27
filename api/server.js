var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var objectId = require('mongodb').ObjectId;
var multiparty = require('connect-multiparty')
var fs = require('fs');
var app = express();

app.use(bodyParser.urlencoded({ extend: true }));
app.use(bodyParser.json());
app.use(multiparty());

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

  res.setHeader("Access-Control-Allow-Origin", "*");

  var date = new Date();
  time_stamp = date.getTime();

  var url_imagem = time_stamp+'_'+ req.files.arquivo.originalFilename;

  var path_origem = req.files.arquivo.path;
  var path_destino = './uploads/' + url_imagem;
  

  fs.rename(path_origem, path_destino, function (err) {
    if (err) {
      res.json(err);
      return;
    }

    var dados = {
      url_imagem: url_imagem,
      titulo: req.body.titulo
    };

    db.open(function (erro, mongoClient) {
      mongoClient.collection('postagens', function (err, collection) {
        collection.insert(dados, function (erro, records) {

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
});

app.get('/api', function (req, res) {
  
  res.setHeader("Access-Control-Allow-Origin", "*");
  
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
          res.status(200).json(results);
        }
        mongoClient.close();
      });
    });
  });

});

app.get('/imagens/:imagem', function (req, res) {
 console.log('imagesss');
  var img = req.params.imagem;

  fs.readFile('./uploads/'+img, function(err, conteudo){
    if(err){
      res.status(400).json(err);
      return;
    }
    res.writeHead(200, {
      'content-type':'image/jpg'
    });
    res.end(conteudo);

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
      collection.remove({ _id: objectId(req.params.id) }, function (erro, records) {
        if (err) {

          res.json(erro);
        } else {
          res.json(records);
        }
        mongoClient.close();
      });

    });
  });
});
