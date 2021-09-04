const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/store')
.then(() => {
  console.log('DB Connected.');
})
.catch((e) => {
  console.log(e);
})

// const initialize = async () => {
//   try {
//     await mongoose.connect('mongodb://localhost/store')
//     console.log('DB connected!');
//   } catch (e) {
//     console.log(e)
//   }
// }
// module.exports = {initialize }