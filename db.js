const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// MongoDB'ye bağlan
const cs = "mongodb+srv://fyagci9:1234@demo.auxl805.mongodb.net/";

mongoose.connect(cs)
  .then(() => {
    console.log("MongoDB veritabanına başarıyla bağlandı");

    // Kullanıcılar koleksiyonu için bir Mongoose şeması tanımla
    const userSchema = new Schema({
      name: String,
      age: Number
    });

    // Kullanıcılar koleksiyonu için bir Mongoose modeli oluştur
    const User = mongoose.model('User', userSchema);

    // Yeni bir kullanıcı oluştur ve kaydet
    const user = new User({ name: 'FIRAT', age: 22 });
    user.save()
      .then(() => {
        console.log('Yeni kullanıcı başarıyla kaydedildi.');
      })
      .catch((err) => {
        console.error('Yeni kullanıcı kaydı sırasında bir hata oluştu:', err);
      });
  })
  .catch((err) => {
    console.error("MongoDB veritabanına bağlanırken bir hata oluştu:", err);
  });
