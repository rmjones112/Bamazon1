//setting initial var requires + installed them in terminal
var mysql = require("mysql");
var inquirer = require("inquirer");

//kept from GB
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "password",
  database: "bamazon_db"
});

//used from greatbay
connection.connect(function(err) {
  if (err) throw err;
  console.log("Current Products")
 

  var query = "SELECT * FROM bamazon_db.products;";
  connection.query(query, function(err, res) {
    if (err) throw err;
    console.table(res)
    userInquiry();
    
  
   
  });

});



function userInquiry(){
  inquirer.prompt({
    name: "options",
    type:"list",
    message:"Welcome, How can we help you today?",
    choices:["Make a Purchase","check availability", "exit site"]
  }).then(function(answer){
   

    if(answer.options==="Make A Purchase"){

        console.log("Make a Purchase");
        makeAPurchase();
        

      
    }else if(answer.options=="Check availabilty") {
      var query = "SELECT * FROM bamazon_db.products;";
      connection.query(query, function(err, res) {
        if (err) throw err;
        console.log("Current stock")
        console.table(res)
        userInquiry()
        
      });


    } else {
        connection.end()
    }
  })
}

function makeAPurchase(){

      connection.query("SELECT * FROM products", function(err, res){
        if (err) throw err;
        
        var productType = [];
        for(let i =0; i < res.length; i++){

            productType.push(res[i].product_name)
        }
      
        inquirer.prompt([{
            name:"item",
            type:"rawlist",
            choices:productType,
            message:"which product?"

        },{
            name:"quantity",
            message:"How many would of this product would you like to purchase?"
        }

    ]).then(function(Anwsers){
            orderProcess(Anwsers.item, Anwsers.quantity);
        });
})

}





function orderProcess(item, quantity){

    var query = "SELECT * FROM bamazon_db.products WHERE product_name = ?"

    connection.query(query, [item], function(err, res) {
        if (err) throw err;
        console.table(res);


        if(res[0].stock_quantity === 0){
          console.log("xxxx")
            console.log("Unfortunately, due to high demand, we are out of this product");
            console.log("xxx")
            updateInventory(item, 100);
            userInquiry()

        }else if(res[0].stock_quantity < quantity) {
          console.log("xxxxx")
            console.log("Sorry we do not have enough of this in our inventory for your order");
            console.log("xxxxx")
            userInquiry()

        }else {
            console.log("xxx");
            console.log("Grear choice!, Your total is $" + (res[0].price * quantity))
            var newQuantity = res[0].stock_quantity - quantity;
            updateInventory(item, newQuantity)
            
        }
        

       
      });
}

function updateInventory(item, quantity){
    var query = "UPDATE bamazon_db.products SET stock_quantity = ? WHERE product_name = ?"
    
    connection.query(query, [quantity, item], function(err, res) {
        if (err) throw err;
        // connection.end();
    })
    userInquiry();
}
