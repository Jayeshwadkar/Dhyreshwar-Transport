dbConfig = require("./database/db");
mongoose = require("mongoose");
const User = require("./models/User.js");

mongoose
  .connect(dbConfig.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    () => {
      console.log("Database sucessfully connected");
    },
    (error) => {
      console.log("Database could not connected: " + error);
    }
  );

const register = (username, password, callback) => {
  const user = new User({
    type: "Superadmin",
    username: username,
    password: password,
    createdBy: "system",
  });
  User.create(user, (createError, data) => {
    if (createError) {
      console.error(createError);
    } else {
      console.log(data);
    }
    if (callback) {
      callback();
    }
  });
};

register("superadmin1", "0000000000");
register("superadmin2", "0000000000", () => {
  process.exit();
});
