/*
 * Filename: /Users/alex/Developer/5610-p2/champListBack/db.js
 * Path: /Users/alex/Developer/5610-p2/champListBack
 * Created Date: Monday, October 20th 2022, 8:30:19 pm
 * Author: Tianchang WANG
 * 
 */

const { query } = require("express");
const { MongoClient, ObjectId } = require("mongodb");


function db() {
  const mydb = {};
  const mongoString = "mongodb://127.0.0.1:27017";

  const url = process.env.MONGO_URL || mongoString;
  console.log(url)
  const DB_NAME = "champlist";

  mydb.createUser = async (user) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      console.log("Connecting to the db");
      await client.connect();
      console.log("Connected!");
      const db = client.db(DB_NAME);
      const userCol = db.collection("user");
      let record = {};
      record.email = user.email
      record.password = user.password
      // check email duplication
      const existance = await userCol.find({ email: `${record.email}` }).toArray()
      console.log(existance)
      if (existance.length > 0) {
        throw "Already registered"
      }

      console.log("Collection ready, insert ", record);
      const res = await userCol.insertOne(record);
      console.log("Inserted", res);
      return res;

    } finally {
      console.log("Closing the connection");
      client.close();
    }
  }

  mydb.userLogin = async (user) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      console.log("Connecting to the db");
      await client.connect();
      console.log("Connected!");
      const db = client.db(DB_NAME);
      const userCol = db.collection("user");
      // to validate username and password
      const existance = await userCol.findOne({ email: `${user.email}` })
      if (existance == undefined) {
        throw "no such user"
      }
      if (existance.password != user.password) {
        throw "wrong password"
      }
      res = {}
      return res;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  }

  mydb.createItem = async (record) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      console.log("Connecting to the db");
      await client.connect();
      console.log("Connected!");
      const db = client.db(DB_NAME);
      const itemCol = db.collection("item");
      console.log(record);
      console.log("Collection ready, insert ", record);
      const res = await itemCol.insertOne(record);
      console.log("Inserted", res);
      return res;

    } finally {
      console.log("Closing the connection");
      client.close();
    }
  }

  mydb.getItemList = async (userEmail) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      console.log("Connecting to the db");
      await client.connect();
      console.log("Connected!");
      const db = client.db(DB_NAME);
      const itemCol = db.collection("item");
      console.log(userEmail)
      const items = await itemCol.find({ email: `${userEmail}` }).toArray();
      console.log("Got files", items);
      return items;

    } catch {
      console.log("Failed, Closing the connection");
      client.close();
    }
  };

  mydb.updateItemCompletion = async (query) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      await client.connect();
      const db = client.db(DB_NAME);
      const itemCol = db.collection("item");
      let items = await itemCol.findOneAndUpdate({ _id: ObjectId(`${query.id}`) }, { $set: { completed: `${query.completed}` } })
      return items;

    } catch {
      console.log("Failed, Closing the connection");
      client.close();
    }
  };


  // Logical delete
  mydb.deleteItem = async (id) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      await client.connect();
      const db = client.db(DB_NAME);
      const itemCol = db.collection("item");
      const items = await itemCol.findOneAndUpdate({ _id: ObjectId(`${id}`) }, { $set: { deleted: true } })
      console.log("res", items);
      return items;

    } catch {
      console.log("DB Failed, Closing the connection");
      client.close();
    }
  };

  return mydb;
}

module.exports = db();
