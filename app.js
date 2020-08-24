function Income(id, description, value, currency) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.currency = currency;
}
function Expense(id, description, value, currency, percentage) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.currency = currency;
    this.percentage = percentage;
}

class Budget {
    constructor() {

        this.codes = {
            usd: 'USD',
            chf: 'CHF',
            eur: 'EUR',
            gbp: 'GBP',
            pln: 'PLN'
        }
        this.ratesCurrency = {
            usd: 1,
            chf: 1,
            eur: 1,
            gbp: 1
        }
        this.API = 'http://api.nbp.pl/api/exchangerates/tables/A/';
        this.ratesTab = {};
        this.allRates = {};

        this.UISelectors = {
            inputType: '.add__type',
            inputDescription: '.add__description',
            inputValue: '.add__value',
            inputCurrency: '.add__currency',
            inputBtn: '.add__btn',
            incomeContainer: '.income__list',
            expenseContainer: '.expenses__list',
            budgetLabel: '.budget__value',
            incomeLabel: '.budget__income--value',
            expensesLabel: '.budget__expenses--value',
            percentageLabel: '.budget__expenses--percentage',
            container: '.container',
            expensesPercLabel: '.item__percentage',
            dataLabel: '.budget__title--month',
            exchangeTitle: '.exchange__rates--title',
            deleteBtn: '.item__delete--btn',
            frank: 'frank',
            dolar: 'dolar',
            euro: 'euro',
            funt: 'funt',

        }
        this.data = {
            AllItems: {
                exp: [],
                inc: []
            },
            totals: {
                exp: 0,
                inc: 0
            }
        }
        this.budget = 0;
        this.IDIncome = 0;
        this.IDExpense = 0;
        this.totalPercentage = 0;

        this.getInput();
        this.updateDate();

    }
    async pullRates() {
        this.ratesTab = await this.fetchData(this.API);
        this.allRates = this.ratesTab[0].rates;
        return this.allRates;
    }
    async fetchData(url) {
        const response = await fetch(url);
        const parsedResponse = await response.json();

        return parsedResponse;
    }
    async findRates() {
        const rates = await this.pullRates();
        rates.forEach(element => {
            switch (element.code) {
                case this.codes.usd:
                    this.ratesCurrency.usd = element.mid;
                    break;
                case this.codes.chf:
                    this.ratesCurrency.chf = element.mid;
                    break;
                case this.codes.eur:
                    this.ratesCurrency.eur = element.mid;
                    break;
                case this.codes.gbp:
                    this.ratesCurrency.gbp = element.mid;
                    break;
            }
        });
        return this.ratesCurrency;


    }
    async addRatesUI() {
        const rates = await this.findRates();

        this.frank.innerHTML = rates.chf;
        this.funt.innerHTML = rates.gbp;
        this.dolar.innerHTML = rates.usd;
        this.euro.innerHTML = rates.eur;
    }

    updateDate() {
        const months = ['STYCZEŃ', 'LUTY', 'MARZEC', 'KWIECIEŃ', 'MAJ', 'CZERWIEC', 'LIPIEC', 'SIERPIEN', 'WRZESIEN', ' PAŹDZIERNIK', 'LISTOPAD', 'GRUDZIEŃ'];
        let now = new Date();
        let month = now.getMonth();
        let year = now.getFullYear();
        let day = now.getDate();
        this.dataLabel.innerHTML = `${months[month].toLowerCase()} rok: ${year}`;
        this.exchangeTitle.innerHTML = `Kursy walut na dzień: ${day} ${months[month]} ${year} (PLN)`
    }

    async getInput() {

        this.inputType = document.querySelector(this.UISelectors.inputType);
        this.inputDescription = document.querySelector(this.UISelectors.inputDescription);
        this.inputValue = document.querySelector(this.UISelectors.inputValue);
        this.incomeContainer = document.querySelector(this.UISelectors.incomeContainer);
        this.expenseContainer = document.querySelector(this.UISelectors.expenseContainer);
        this.budgetLabel = document.querySelector(this.UISelectors.budgetLabel)
        this.incomeLabel = document.querySelector(this.UISelectors.incomeLabel)
        this.expensesLabel = document.querySelector(this.UISelectors.expensesLabel)
        this.percentageLabel = document.querySelector(this.UISelectors.percentageLabel)
        this.container = document.querySelector(this.UISelectors.container)
        this.dataLabel = document.querySelector(this.UISelectors.dataLabel)
        this.inputCurrency = document.querySelector(this.UISelectors.inputCurrency)
        this.exchangeTitle = document.querySelector(this.UISelectors.exchangeTitle);
        this.frank = document.getElementById(this.UISelectors.frank);
        this.euro = document.getElementById(this.UISelectors.euro);
        this.dolar = document.getElementById(this.UISelectors.dolar);
        this.funt = document.getElementById(this.UISelectors.funt);

        this.pullRates();
        this.findRates();
        this.addRatesUI()
    }
    addEventListeners() {
        this.inputBtn = document.querySelector(this.UISelectors.inputBtn);
        this.inputBtn.addEventListener('click', () => this.addItem());
        this.container.addEventListener('click', () => this.deleteItem(event))
    }

    validateData() {

        if (this.inputDescription.value == "" || this.inputValue.value == "") {
            return false;
        } else if ((this.inputType.value == "inc" && this.inputValue.value <= 0) || (this.inputType.value == "exp" && this.inputValue.value <= 0)) return false;
        else return true;
    }

    calculateBudget() {
        let sumUSD = 0, sumCHF = 0, sumEUR = 0, sumPLN = 0, sumGBP = 0;
        let expUSD = 0, expCHF = 0, expEUR = 0, expPLN = 0, expGBP = 0;

        this.data.AllItems.inc.forEach((el) => {
            switch (el.currency) {
                case this.codes.pln:
                    sumPLN += parseInt(el.value);
                    break;
                case this.codes.usd:
                    sumUSD += parseInt(el.value);
                    break;
                case this.codes.eur:
                    sumEUR += parseInt(el.value);
                    break;
                case this.codes.chf:
                    sumCHF += parseInt(el.value);
                    break;
                case this.codes.gbp:
                    sumGBP += parseInt(el.value);
                    break;

            }

        })
        this.data.totals.inc = (sumPLN + sumUSD * this.ratesCurrency.usd + sumCHF * this.ratesCurrency.chf + sumEUR * this.ratesCurrency.eur + sumGBP * this.ratesCurrency.gbp).toFixed(2);
        this.data.AllItems.exp.forEach((el) => {
            switch (el.currency) {
                case this.codes.pln:
                    expPLN += parseInt(el.value);
                    break;
                case this.codes.usd:
                    expUSD += parseInt(el.value);
                    break;
                case this.codes.eur:
                    expEUR += parseInt(el.value);
                    break;
                case this.codes.chf:
                    expCHF += parseInt(el.value);
                    break;
                case this.codes.gbp:
                    expGBP += parseInt(el.value);
                    break;

            }

        });
        this.data.totals.exp = (expPLN + expUSD * this.ratesCurrency.usd + expCHF * this.ratesCurrency.chf + expEUR * this.ratesCurrency.eur + expGBP * this.ratesCurrency.gbp).toFixed(2);
        this.budget = (this.data.totals.inc - this.data.totals.exp).toFixed(2);

        if (this.data.totals.inc > 0) {
            this.totalPercentage = ((this.data.totals.exp / this.data.totals.inc) * 100).toFixed(2);
        }

        this.budgetLabel.innerHTML = `${this.budget} PLN`;
        this.incomeLabel.innerHTML = this.data.totals.inc;
        this.expensesLabel.innerHTML = this.data.totals.exp;

        if (this.totalPercentage) {
            this.percentageLabel.innerHTML = `${this.totalPercentage}%`
        } else this.percentageLabel.innerHTML = `0%`

    }
    calculatePercentagesItems() {
        this.data.AllItems.exp.forEach((el) => {
            if (this.data.totals.inc > 0) {
                switch (el.currency) {
                    case this.codes.usd:
                        el.percentage = (((el.value * this.ratesCurrency.usd) / this.data.totals.inc) * 100).toFixed(2)
                        break;
                    case this.codes.eur:
                        el.percentage = (((el.value * this.ratesCurrency.eur) / this.data.totals.inc) * 100).toFixed(2)
                        break;
                    case this.codes.chf:
                        el.percentage = (((el.value * this.ratesCurrency.chf) / this.data.totals.inc) * 100).toFixed(2)
                        break;
                    case this.codes.gbp:
                        el.percentage = (((el.value * this.ratesCurrency.gbp) / this.data.totals.inc) * 100).toFixed(2)
                        break;
                    case this.codes.pln:
                        el.percentage = ((el.value / this.data.totals.inc) * 100).toFixed(2)
                        break;
                }
            }

        })
    }
    updatePercentageItemsUI() {
        const allItemsPercentages = document.querySelectorAll(this.UISelectors.expensesPercLabel);
        let idInArray = 0;
        allItemsPercentages.forEach((el) => {
            if (el.id == this.data.AllItems.exp[idInArray].id) {
                if (this.data.AllItems.exp[idInArray].percentage) {
                    el.innerHTML = `${this.data.AllItems.exp[idInArray].percentage}%`;
                } else el.innerHTML = `0%`;
                idInArray++;
            }
        }
        )
    }
    deleteItem(e) {
        let itemID, splitID, type, ID, idInArray = 0;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
        }
        switch (type) {
            case 'exp':
                this.data.AllItems.exp.forEach((el) => {
                    if (ID == el.id) {
                        this.data.AllItems.exp.splice(idInArray, 1);
                    }
                    idInArray++;
                })


            case 'inc':
                this.data.AllItems.inc.forEach((el) => {
                    if (ID == el.id) {
                        this.data.AllItems.inc.splice(idInArray, 1);
                    }
                    idInArray++;
                })

        }
        const element = document.getElementById(itemID);
        element.parentNode.removeChild(element);

        this.calculateBudget();
        this.calculatePercentagesItems();
        if (type == 'inc') this.updatePercentageItemsUI();
    }
    clearFields() {
        this.inputValue.value = "";
        this.inputDescription.value = "";
    }
    addItem() {
        let type = this.inputType.value;
        let html, element;

        if (this.validateData()) {
            switch (type) {
                case 'inc':
                    element = this.UISelectors.incomeContainer;
                    let income = new Income(this.IDIncome, this.inputDescription.value, this.inputValue.value, this.inputCurrency.value);
                    this.data.AllItems.inc.push(income);
                    html = `<div class="item clearfix" id="inc-${this.IDIncome}">
                    <div class="item__description">${this.inputDescription.value}</div>
                    <div class="right clearfix"><div class="item__value">${this.inputValue.value}</div>
                    <div class="item__currency">${this.inputCurrency.value}</div><div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;

                    document.querySelector(element).insertAdjacentHTML('beforeend', html);
                    this.IDIncome++;
                    break;

                case 'exp':
                    element = this.UISelectors.expenseContainer;
                    let expense = new Expense(this.IDExpense, this.inputDescription.value, this.inputValue.value, this.inputCurrency.value, 0);
                    this.data.AllItems.exp.push(expense);
                    html = `<div class="item clearfix" id="exp-${this.IDExpense}">
                    <div class="item__description">${this.inputDescription.value}</div>
                    <div class="right clearfix"><div class="item__value">${this.inputValue.value}</div>
                    <div class="item__currency">${this.inputCurrency.value}</div>
                    <div class="item__percentage" id="${this.IDExpense}"></div><div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`
                    document.querySelector(element).insertAdjacentHTML('beforeend', html);
                    this.IDExpense++;
                    break;
            }
        }

        this.calculateBudget();
        this.calculatePercentagesItems();
        this.updatePercentageItemsUI();
        this.clearFields();
    }
}

const budget = new Budget();
budget.addEventListeners();