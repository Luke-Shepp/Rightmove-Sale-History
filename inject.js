let lastUrl = null;
let interval = null;

const isDebug = true;

startInterval();

function debug(...values) {
    if (! isDebug) {
        return;
    }

    console.log(...values);
}

function startInterval() {
    debug('Starting interval');

    interval = setInterval(updateSaleHistory, 500);
}

function shouldRun() {
    return window.location.pathname.includes('property-for-sale')
        && document.location.href !== lastUrl;
}

function removeDivs() {
    document.querySelectorAll('.rm-sale-history').forEach(div => div.remove());
}

function updateSaleHistory() {    
    if (! shouldRun()) {
        return;
    }

    populate();
}

async function populate() {
    const results = document.querySelectorAll('.l-searchResult:not(.l-searchResult-loading)');
    const apiUrl = 'https://www.rightmove.co.uk/properties/api/soldProperty/transactionHistory/';
    
    if (results.length === 0) {
        debug('No results, skipping this time');
        return;
    }

    lastUrl = document.location.href;
    removeDivs();

    debug(`Adding content to ${results.length} search results`);
    
    debug('Interval stopping');
    clearInterval(interval);

    results.forEach(async result => {
        const propId = result.id.replace('property-', '')
        const url = apiUrl + propId;
        const target = result.querySelector('.propertyCard-price');

        const div = document.createElement('div');
        div.className = "rm-sale-history";

        const response = await fetch(url);
        const data = await response.json();
        let html = '';

        debug(`Found ${data.soldPropertyTransactionHistories.length} transactions for propId ${propId}`);

        if (data.soldPropertyTransactionHistories.length === 0) {
            html = "No sale history";
        } else {
            html = "<u><b>Sale History</b></u>";
            html += "<table>";
            
            data.soldPropertyTransactionHistories.forEach(transaction => {
                html += `
                    <tr>
                        <td>${transaction.year}</td>
                        <td>${transaction.soldPrice}</td>
                        <td>${transaction.percentageDifference}</td>
                    </tr>
                `;
            });

            html += "</table>";
        }

        div.innerHTML = html;
        target.append(div);
    });

    startInterval();
}