//
// Declare an IIFE an the Model
//
var budgetController = (function () {
  'use strict'
  //
  // function constructor for each data item in the model
  //
  let Expense = function (id, description, value) {
    this.id = id
    this.description = description
    this.value = value
  }

  let Income = function (id, description, value) {
    this.id = id
    this.description = description
    this.value = value
  }
  //
  // data model for all expenses & income
  //
  let dataModel = {
    expense: [], // array of Expense
    income: [], // array of Income
    totals: {
      expense: 0,
      income: 0
    }
  }

  return {
    addItem: function (type, desc, val) {
      let ID, newItem
      switch (type) {
        case 'inc' :
          if (dataModel.income.length === 0) {
            ID = 1 // initialise first entry as 1
          } else {
            ID = dataModel.income[dataModel.income.length - 1].id + 1
          }
          newItem = new Income(ID, desc, val)
          dataModel.income.push(newItem)
          break
        case 'exp' :
          if (dataModel.expense.length === 0) {
            ID = 1 // initialise first entry as 1
          } else {
            ID = dataModel.expense[dataModel.income.length - 1].id + 1
          }
          newItem = new Expense(ID, desc, val)
          dataModel.expense.push(newItem)
          break
      }

      return newItem
    },
    delItem: function (type, id) {
      let itemDeleted;
      switch (type) {
        case 'inc' :
          itemDeleted = dataModel.income[id - 1]
          dataModel.income.splice(id - 1,1)        // remove one item from the array
          dataModel.totals.income -= itemDeleted.value * 100
          break;
        case 'exp' :
          itemDeleted = dataModel.expense[id - 1]
          dataModel.expense.splice[id - 1,1]       // remove one item from the array
          dataModel.totals.expense -= itemDeleted.value * 100
          break
      }
      return {
        income: dataModel.totals.income,
        expense: dataModel.totals.expense,
        balance: Math.round(dataModel.totals.income - dataModel.totals.expense),
        expensePercentage: dataModel.totals.income > 0 ? (dataModel.totals.expense / dataModel.totals.income * 100).toFixed(0) : 0
      }
      
    },
    showModel: function () {
      console.log(dataModel)
    },
    updateBudget: function (objToAdd) {
      switch (objToAdd.type) {
        //
        // need to parseFloat to stop leading zero appearing on addition which then causes ensuing numbers to be concatentated as a string
        // e.g. start with '12' entered gets stored in dataModel as '012'. Then add '12' and it produces '01212' unless the parseFloat is present
        //
        case 'inc' :
          dataModel.totals.income += parseFloat(objToAdd.amount) * 100 // work in pence
          break
        case 'exp' :
          dataModel.totals.expense += parseFloat(objToAdd.amount) * 100 // work in pence
          break
      }
      return {
        income: dataModel.totals.income,
        expense: dataModel.totals.expense,
        balance: Math.round(dataModel.totals.income - dataModel.totals.expense),
        expensePercentage: dataModel.totals.income > 0 ? (dataModel.totals.expense / dataModel.totals.income * 100).toFixed(0) : 0
      }
    },
  }
}())
//
// Declare an IIFE as the UI Controller
//
var UIController = (function () {
  'use strict'
  //
  // Private fields
  //
  let DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputAmount: '.add__value',
    inputButton: '.add__btn',
    container: '.container', // contains all the expenses and income items
    incomeList: '.income__list',
    expenseList: '.expenses__list',
    budgetValue: '.budget__value',
    budgetIncomeValueID: 'budget_income_value',
    budgetExpenseValueID: 'budget_expense_value',
    budgetMonthValueID: 'budget_month_value',
    budgetValueID : 'budget_value',
    budgetExpensesPercentageValueID : 'budget_expenses_percentage_value',
    errorMessage: '.error__message',

    //
    // The following HTML snippets were copied from the raw HTML file as a model and placeholders '%%' created where data was to be inserted
    //
    incomeItem: '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%amount%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>',
    expenseItem: '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%amount%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
  }
  //
  // Public API
  //
  return {
    addListItem: function (objToAdd, type) {
      let htmlString, editedHTML, selector
      //
      // Create HTML string with placeholder text
      //
      switch (type) {
        case 'inc' :
          htmlString = DOMStrings.incomeItem
          break
        case 'exp' :
          htmlString = DOMStrings.expenseItem
          break
      }
      //
      // Replace the placeholder text with some of the data to add
      //
      editedHTML = htmlString.replace('%id%', objToAdd.id)
      editedHTML = editedHTML.replace('%description%', objToAdd.description)
      editedHTML = editedHTML.replace('%amount%', objToAdd.value)
      //
      // Insert the HTML into the DOM
      //
      selector = (type === 'inc' ? DOMStrings.incomeList : DOMStrings.expenseList)
      document.querySelector(selector).insertAdjacentHTML('beforeend', editedHTML)
    },
    delListItem: function (type,tots,id){
      let element = document.getElementById(id)
      //
      // to remove a node, use the removeChild method ON the parent node but you also need to re-select the child note!
      //
      element.parentNode.removeChild(element)
      //
      // update the budget header fields
      //
      this.displayTotals(type,tots)
    },
    clearInputFields: function (){
    /*
      querySelectorALL correctly returns all 3 DOM elements for inputDescription, inputAmount & errorMessage when all 3 are passed in the templated string.
      However, the attribute that contains the value that needs to be cleared is 'value' in the 1st 2 cases but 'textcontent' in the last case. 
      This is why the error message is cleared by the second method below
    */
      document.querySelectorAll(
        `${DOMStrings.inputDescription},
        ${DOMStrings.inputAmount}`).forEach(element => element.value = '')
      //
      document.querySelector(DOMStrings.errorMessage).textContent = ''
    }, 
    clearFields: function () {
      //
      // clear the 2 input fields and the expense, income and the total fields
      //
      function setDisplayMonth () {
        //
        // Work out display month and year
        //
        let now, months, month, year
        //
        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        now = new Date()            // get the current date
        month = now.getMonth()      // Obtain the month index
        year = now.getFullYear()    // Obtain the integer year number
        document.getElementById(DOMStrings.budgetMonthValueID).textContent = months[month] + ' ' + year;
      }
      document.getElementById(DOMStrings.budgetIncomeValueID).textContent = 0
      document.getElementById(DOMStrings.budgetExpenseValueID).textContent = 0
      document.getElementById(DOMStrings.budgetValueID).textContent = 0
      document.getElementById(DOMStrings.budgetExpensesPercentageValueID).textContent = 0
      document.getElementById(DOMStrings.budgetValueID).textContent = 0
      UIController.clearInputFields()
      setDisplayMonth()
      //
      // set focus on the description field - this causes a second DOM select so might not be best.
      //
      document.querySelector(DOMStrings.inputDescription).focus()
    },
    getDOMStrings: function () {
      return DOMStrings
    },
    getInput: function () {
      //
      // Get the type of expenditure, the textural description and the amount (number)
      //
      return {
        type: document.querySelector(DOMStrings.inputType).value, // HTML returns 'inc' or 'exp'
        description: document.querySelector(DOMStrings.inputDescription).value,
        amount: document.querySelector(DOMStrings.inputAmount).value
      }
    },
    displayTotals: function (type,tots) {
      //
      // Update the UI to the model for the header fields (budget totals)
      //
      switch (type) {
        case 'inc' :
          document.getElementById(DOMStrings.budgetIncomeValueID).textContent = tots.income / 100 
          break
        case 'exp' :
          document.getElementById(DOMStrings.budgetExpenseValueID).textContent = tots.expense / 100
          break
      }
      document.querySelector(DOMStrings.budgetValue).textContent = tots.balance / 100
      document.getElementById(DOMStrings.budgetExpensesPercentageValueID).textContent = tots.expensePercentage
    },
    setErrorMessage: function (text) {
      document.querySelector(DOMStrings.errorMessage).textContent = text
    }
  }
}())
//
// Declare an IIFE as the app Controller 
//
var controller = (function (budgetCtrl, UICtrl) {
  'use strict'
  let inputValueValid = function (input) {
    return (input  - (Math.floor(input * 100) / 100) == 0)
  } 
  let ctrlAddItem = function () {
    let newItem = UICtrl.getInput()
    if (newItem.amount != '' && newItem.description != '') {
      if (inputValueValid(newItem.amount)) {
        let itemAdded = budgetCtrl.addItem(newItem.type, newItem.description, newItem.amount)
        UICtrl.addListItem(itemAdded, newItem.type)
        let budgetTotals = budgetCtrl.updateBudget(newItem)
        UICtrl.clearInputFields()
        UICtrl.displayTotals(newItem.type,budgetTotals)
      }
      else {
        UICtrl.setErrorMessage('Only pounds and pence can be entered')
      }
    }
  }
  let ctrlDelItem = function(event) {
    //
    // NOTE that the passed single parameter is NOT explictely stated on the caller (LOL)
    //
    // traverse the DOM up 4 levels to ensure that the 4th Parent is either an Income or and Expense container
    // This EXPLICIT dependency of exactly 4 levels is 'as bad' as hard-coding the HTML structure in incomeItem/expenseItem in UIController
    //
    let selectedID = event.target.parentNode.parentNode.parentNode.parentNode.id
    let typeArray = selectedID.split('-')
    let type = typeArray[0]
    if (type === 'income' || type === 'expense') {
      //
      // We have pressed on a child element where the 4th parent is either an income or an expense container. And
      // selectedID is the DOM ID of the element that needs to be removed.
      //
      let ID = typeArray[1]
      //
      // Delete the selected item from the model
      //
      let budgetTotals =  budgetCtrl.delItem(type == 'income' ? 'inc' : 'exp',ID)
      //
      // update the UI 
      //
      UICtrl.delListItem(type == 'income' ? 'inc' : 'exp',budgetTotals,selectedID)
      UICtrl.clearInputFields()
    }
  }

  let setUpEventListeners = function () {
    //
    // Listen for the add budget item button press
    //
    document.querySelector(UICtrl.getDOMStrings().inputButton).addEventListener('click', ctrlAddItem)
    //
    // Listen for the return key
    //
    document.addEventListener('keydown', function (e) {
      if (e.keyCode === 13) { // ascii decimal 13 = carriage return
        ctrlAddItem()
      }
    })
    //
    // Use Event delegation to catch any clicks on the delete item button because:
    // 1) There are lots of items in the DOM to delete (many events to set up...and catch) and
    // 2) The items to delete have YET (from this point in the code) to be inserted into the DOM
    //
    document.querySelector(UICtrl.getDOMStrings().container).addEventListener('click',ctrlDelItem)
  }

  return {
    init: function () {
      UICtrl.clearFields()
      setUpEventListeners()
    }
  }
}(budgetController, UIController)) // seperation of concerns for controller names

controller.init()
