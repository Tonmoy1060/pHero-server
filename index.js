const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();
const app = express();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.vmt7jo7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const BillCollection = client.db("Phero-data").collection("bill-data");
    const UserCollection = client.db("Phero-data").collection("User-data");

    app.post("/registration", async (req, res) => {
      // bcrypt secure password as hash
      const hashPassword = await bcrypt.hash(req.body.password, 10);
      // get user register data
      const newUser = {
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
      };
// check email already exist or not
      const checkEmail = await UserCollection.findOne({
        email: req.body.email,
      });
      if (checkEmail) {
        return res.send({ message: "This email already registered"});
      } else {
        const result = await UserCollection.insertOne(newUser);
        return res.send({ message: "Registered Successfully", result });
      }
    });

    app.post("/login", async (req, res) => {
      const email = req.body.email;
      const user = await UserCollection.findOne({ email: email });
      if(user){
         const isValid = await bcrypt.compare(req.body.password, user.password);
         if(isValid){
            return res.send({message:'Login Success'})
         }else{
            return res.send({message:'Wrong Password'});
         }
      }else{
         return res.send({message: 'this user is not registered'})
      }
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Phero");
});

app.listen(port, () => {
  console.log("listening to port", port);
});
