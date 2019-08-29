var inquirer = require('inquirer');
var pass = require('./pw');
var mysql = require('mysql');

var data;
var itemChoices = [];

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: pass,
  database: "great_bayDB"
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  readProducts();

  takeCommand();
});

function takeCommand() {
  inquirer
    .prompt([{
      name: 'choice',
      type: 'list',
      choices: ['Bid on an Item', 'Post an Item', 'Exit']
    }])
    .then(answers => {
      itemChoices = createArray(data);
      console.log(answers)
      switch (answers.choice) {
        case ('Bid on an Item'):
          bidOnAnItem();
        break;
        case ('Post an Item'):
          postItem();
        break;
        case ('Exit'):
        break;
      }
    });
}


function productBid(bid, bidderName, itemName) {
  console.log("Inserting a new product...\n");
  var query = connection.query(
    "UPDATE products SET ? WHERE ?", [{
      current_highest_bid: bid,
      highest_bidder: bidderName
    }, {item: itemName},
  ],
    function (err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " bid accepted\n");
      // Call updateProduct AFTER the INSERT completes
      console.log(res);
    }
  );

  // logs the actual query being run
  console.log(query.sql);
}

function readProducts() {
  console.log("Selecting all products...\n");
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    data = res;
  });
}

function createArray(data) {
  let array = [];
  for (let i = 0; i < data.length; i++) {
    array.push(data[i].item);
  }
  return array;
}

function bidOnAnItem() {
  inquirer
    .prompt([{
        name: 'name',
        type: 'input',
      },
      {
        name: 'product',
        type: 'list',
        choices: itemChoices
      },
      {
        name: 'bidPrice',
        type: 'input',
      },
    ])
    .then(answers => {
      console.log(data);
      productBid(answers.bidPrice, answers.name, answers.product);
      connection.end();
    });
}

function postItem() {
  console.log("let's write some post questions!");
  inquirer
    .prompt([
      {
        name: "item",
        type: "input",
        message: "What do you want to sell?"
      },
      { name: "category", type: "input", message: "What is the category?" },
      { name: "minBid", type: "input", message: "What is your minimum price?" }
    ])
    .then(function(answers) {
      console.log(answers);
      createRow(answers);
    });
}

function createRow(answers) {
  var sql = "INSERT INTO products SET ?";
  var query = connection.query(
    sql,
    [
      {
        item: answers.item,
        category: answers.category,
        min_Bid: answers.minBid
      }
    ],
    function(err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " product inserted\n");
      connection.end();
    }
  );
}