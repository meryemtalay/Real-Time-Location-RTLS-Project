const express = require('express');
const http = require('http');
const fileUpload = require('express-fileupload');
const app = express();
const port = 3000;
const ejs = require('ejs');
const fs = require('fs');
const server = http.createServer(app); // HTTP sunucusu oluşturuluyor

const mqtt = require("mqtt");
const io = require("socket.io")(server); // Socket.io sunucusu oluştur

const mqttClient = mqtt.connect("mqtt://192.168.1.121:1883");

mqttClient.on("connect", () => {
    console.log("MQTT Broker ile bağlantı sağlandı");
    mqttClient.subscribe("silabs/aoa/position/multilocator-test_room/ble-pd-1C34F16110FF");
});

mqttClient.on("message", (topic, message) => {
    const data = JSON.parse(message.toString());
    console.log("Cihaz konumu:", data);
    io.emit("mqtt_message", data); // MQTT verisini istemcilere iletmek için sokete gönder
});


app.use(express.static((__dirname, 'public')));
// app.use(express.static((__dirname, 'dashboard/canvas')));
app.use(fileUpload());

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const users = [
  { username: "mer", password: "mer" }
];

const data = [
  {
    "name": "ble-pd-1C34F1633706",
    "xCoordinate": 4.849423,
    "yCoordinate": 1.292485,
    "zCoordinate": -2.094846,
    "active": true,
    "time": 1708953951
  },
  {
    "name": "ble-pd-1C34F16110FF",
    "xCoordinate": 4.8493,
    "yCoordinate": 1.291213,
    "zCoordinate": -2.095265,
    "active": false,
    "time": 1708953951
  }
];

// Ana sayfayı işle
app.get('/', (req, res) => {
  res.render('login/index');
});
// Toolbox sayfasını işle
app.get('/canvas/toolbox', (req, res) => {
  res.render('canvas/toolbox');
});
// Giriş işlemini yönet
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    // Kullanıcı doğruysa, dashboard sayfasına yönlendir
    res.redirect('/dashboard');
  } else {
    res.send('Hatalı kullanıcı adı veya şifre!');
  }
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard/home');
});
app.get('/', (req, res) => {
  res.render('/'); // veya isteğinize uygun bir işlem yapın
});

// Dashboard sayfasını işle
app.get('/dashboard/taglist', (req, res) => {
  // EJS şablonunu yükleyip verileri yerine yerleştiriyoruz
  res.render('dashboard/taglist', { jsonData: data }, (err, str) => {
    if (err) {
      console.error('hata oluştu:', err);
      res.send(' hata oluştu');
      return;
    }
    res.send(str);
  });
});

app.get('/dashboard/persregi', (req, res) => {
  res.render('dashboard/persregi');
});

// Dosya yükleme endpoint'i
app.post('/upload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('Hiçbir dosya yüklenmedi.');
  }

  let sampleFile = req.files.sampleFile;

  sampleFile.mv('C:\Users\meryem\OneDrive\Masaüstü\rtls-ui-f\Rtls_ui\public\assets\toolboxsrc' + sampleFile.name, (err) => {
      if (err) {
          return res.status(500).send(err);
      }

      res.send('Dosya yüklendi!');
  });
});

app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});
