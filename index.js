var request = require('sync-request');

var res = request('GET', 'https://backend-challenge-winter-2017.herokuapp.com/customers.json')
var body = JSON.parse(res.getBody('utf8'));
if(body.pagination){
  var totalCustomers = body.pagination.total;
  var customerCount = 0;
  var page = 1;

  var invalidCustomers = {
    "invalid_customers":[]
  }

  while(customerCount < totalCustomers){
    var res = request('GET', 'https://backend-challenge-winter-2017.herokuapp.com/customers.json?page='+page)
    var body = JSON.parse(res.getBody('utf8'));

    var customers = body.customers;
    customerCount += customers.length

    var validations = body.validations;

    for(var x in customers){
      var customer = customers[x];
      var invalidCustomer = {
        "id": undefined,
        "invalid_fields": []
      }
      var invalid = false
      for(var y in validations){
        var constraints = validations[y] 
        for(var prop in constraints) {
          var constraintObj = constraints[prop]
          if(constraintObj.required == true){
            if(customer[prop] == undefined){
              invalidCustomer.invalid_fields.push(prop);
              invalid = true;
              break;
            }
          }	
          if(customer[prop]){
            if(constraintObj.type){
              if(typeof(customer[prop]) != constraintObj.type){
                invalidCustomer.invalid_fields.push(prop);
                invalid = true;
                break;
              }
            }
            if(constraintObj.length){
              var min = constraintObj.length.min;
              var max = constraintObj.length.max;
              if(min && customer[prop].length < min){
                invalidCustomer.invalid_fields.push(prop);
                invalid = true;
                break;
              }
              if(max && customer[prop].length > max){
                invalidCustomer.invalid_fields.push(prop);
                invalid = true;
                break;
              }
            }
          }
        }
      }
      if(invalid){
        invalidCustomer.id = customer.id;
        invalidCustomers.invalid_customers.push(invalidCustomer)
      }
    }
    page++
  }
  console.log(JSON.stringify(invalidCustomers, null, ' '))
}
