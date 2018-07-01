const sel = evt => document.querySelector(evt);

const getFromCurrencyName = () => {
    return sel("#startCurrency").value;
};
const getToCurrencyName = () => {
    return sel("#toCurrency").value;
};
const getFromCurrencyId = () => {
    return sel("#startCurrency").value;
};
const getToCurrencyId = () => {
    return sel("#toCurrency").value;
};
const getFromCurrencyValue = () => {
    return sel("#startCurrencyValue").value;
};


idSymbolFrom = 'Lek';
idSymbolTo = 'Lek';



convertCurrency = (event) => {

    let startValue = document.querySelector('#startCurrencyValue').value;
    let startCurr = document.querySelector('#startCurrency').value;
    let toCurr = document.querySelector('#toCurrency').value;

    const query = `${startCurr}_${toCurr}`;
    const requestUrl = `https://free.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra`;

    fetch(requestUrl)
        .then(response => response.json())
        .then(resResult => {

            let unitValue = resResult[`${startCurr}_${toCurr}`];

            let currencyConverted = startValue * unitValue;


            console.log(requestUrl);

            document.getElementById("viewResult").innerHTML = `${idSymbolTo} ${Math.round(currencyConverted)}.00`;

            document.getElementById("unitConversion").innerHTML = `${idSymbolFrom} 1 = ${idSymbolTo}  ${Math.round(unitValue)} `;
        });

}




// Service Worker registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('./sw.js', {
            scope: './'
        })
        .then(registration => {
            console.log("Service Worker Registered", registration);
        })
        .catch(err => {
            console.log("Service Worker failed to Register", err);
        })
}

// API Call function

fetch('https://free.currencyconverterapi.com/api/v5/countries')
    .then(response => response.json())
    .then(myJson => {

        let html = '';
        for (let country of Object.values(myJson.results)) {
            console.log(country);
            html += `<option id="${country.currencySymbol}" value="${country.currencyId}">${country.currencyName}</option>`;
        }
        sel("#startCurrency").insertAdjacentHTML('afterbegin', html);
        sel("#toCurrency").insertAdjacentHTML('afterbegin', html);
    });




showFrom = (s) => {
    idSymbolFrom = s[s.selectedIndex].id;
    getUserConnectionStatus()
}


showFrom2 = (s) => {
    idSymbolTo = s[s.selectedIndex].id;
    getUserConnectionStatus()
}

// Toastr Diplay
getUserConnectionStatus = () => {
    if (navigator.onLine) {

    } else {
        toastr.warning(`Sorry Conversion can't be made offline`);
        toastr.options = {
            "positionClass": "toast-bottom-center"
        }
    }
}


//initialization of indexDB

const dbPromise = idb.open('currencyConverter', 3, (upgradeDb) => {
    switch (upgradeDb.oldVersion) {
        case 0:
            upgradeDb.createObjectStore('countries', {
                keyPath: 'currencyId'
            });
        case 1:
            let countriesStore = upgradeDb.transaction.objectStore('countries');
            countriesStore.createIndex('country', 'currencyName');
            countriesStore.createIndex('country-code', 'currencyId');
        case 2:
            upgradeDb.createObjectStore('conversionRates', {
                keyPath: 'query'
            });
            let ratesStore = upgradeDb.transaction.objectStore('conversionRates');
            ratesStore.createIndex('rates', 'query');
    }
});


document.addEventListener('DOMContentLoaded', () => {
    
     // Fetch Countries 
    fetch('https://free.currencyconverterapi.com/api/v5/countries')
        .then(res => res.json())
        .then(res => {
            Object.values(res.results).forEach(country => {
                dbPromise.then(db => {
                    const countries = db.transaction('countries', 'readwrite').objectStore('countries');
                    countries.put(country);
                })
            });
            dbPromise.then(db => {
                const countries = db.transaction('countries', 'readwrite').objectStore('countries');
                const countriesIndex = countries.index('country');
                countriesIndex.getAll().then(currencies => {
                    // fetchCountries(currencies);
                })
            })
        }).catch(() => {
            dbPromise.then(db => {
                const countries = db.transaction('countries').objectStore('countries');
                const countriesIndex = countries.index('country');
                countriesIndex.getAll().then(currencies => {
                    // fetchCountries(currencies);
                })

            });
        });
});