const express = require('express');
const http = require('http');
const fileUpload = require('express-fileupload');
const session=require('express-session');
const app = express();
const port = 3000;
const server = http.createServer(app); // HTTP sunucusu oluşturuluyor
const mqtt = require("mqtt");
const io = require("socket.io")(server); // Socket.io sunucusu oluştur
const mqttClient = mqtt.connect("mqtt://192.168.1.121:1883");
const collection=require("./userdb");
app.use(session({
  secret : 'secret',
  cookie : { maxAge:3000},
  saveUninitialized: false
}));
mqttClient.on("connect", () => {
    console.log("MQTT Broker ile bağlantı sağlandı");
    mqttClient.subscribe("silabs/aoa/position/multilocator-test_room/ble-pd-1C34F16110FF");
});

mqttClient.on("message", (topic, message) => {
    const data = JSON.parse(message.toString());
    console.log("Cihaz konumu:", data);
    io.emit("mqtt_message", data); // MQTT verisini istemcilere iletmek için sokete gönder
});

app.use(express.json());
app.use(express.static('public'));
app.use(express.static((__dirname, 'public')));
// app.use(express.static((__dirname, 'dashboard/canvas')));
app.use(fileUpload());

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));



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
app.get('/login/index', (req, res) => {
  res.render('login/index');
});

// Toolbox sayfasını işle
app.get('/canvas/toolbox', (req, res) => {
  res.render('canvas/toolbox');
});
// Giriş işlemini yönet
app.post('/login/signup', async (req, res) => {
  const userdata= {
    username: req.body.username,
    password: req.body.password
  }

  try {

    const existingUser = await collection.findOne({ username: userdata.username });

    // Eğer kullanıcı zaten varsa hata mesajı göster ve işlemi durdur
    if (existingUser) {
      console.error('This user already registered!');
      return res.redirect('/error');
    }
    const usersdata = await collection.insertMany(userdata);
    console.log(usersdata);
    // Kullanıcı başarıyla oluşturulduktan sonra login sayfasına yönlendir
    res.redirect('/login/index');
  } catch (error) {
    console.error(error);
    // Hata oluştuğunda veya kayıt başarısız olduğunda bir hata sayfasına yönlendirme 
    res.redirect('/error');
  }
});

// Giriş işlemini yönet
app.post('/login/index', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Kullanıcıyı veritabanından kontrol edin
    const user = await collection.findOne({ username, password });
    if (user) {
      // Kullanıcı veritabanında bulunuyorsa, dashboard'a yönlendirin
      res.redirect('/dashboard');
    } else {
      // Kullanıcı veritabanında bulunmuyorsa, login sayfasında kalsın
      res.redirect('/login/index');
    }
  } catch (error) {
    console.error(error);
    // Hata oluştuğunda veya kayıt başarısız olduğunda bir hata sayfasına yönlendirme 
    res.redirect('/error');
  }
});


app.get('/dashboard', (req, res) => {
  res.render('dashboard/home');
});

app.get('/login/signup',(req,res)=> {
  res.render('login/signup');
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


app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port}/login/index adresinde çalışıyor`);
});
