document.addEventListener('DOMContentLoaded', () => {
    const rows = document.querySelectorAll('.row');
    const grandTotalEl = document.getElementById('grand-total');

    // Inputs (using getElementById where appropriate or querySelector)
    const coinsTotalInput = document.getElementById('coins-total-input');
    const dfoInput = document.getElementById('dfo-input');
    const resetBtn = document.getElementById('reset-btn');

    // Formatter
    const formatCurrency = (amount) => {
        return amount.toLocaleString('bg-BG', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        });
    };

    // Helper: Parse float from string with comma support
    const parseAmount = (str) => {
        if (!str) return 0;
        return parseFloat(str.replace(',', '.')) || 0;
    };

    // Helper: Format raw number for input value (e.g. 123.45)
    const formatInputValue = (num) => {
        return num.toFixed(2);
    };

    // Calculate details for a single row
    const getRowDetails = (row) => {
        const value = parseFloat(row.dataset.value);
        const input = row.querySelector('.count-input');
        const totalEl = row.querySelector('.row-total');

        let count = parseInt(input.value);
        if (isNaN(count) || count < 0) {
            count = 0;
        }

        const rowTotal = count * value;
        totalEl.textContent = formatCurrency(rowTotal);

        return {
            total: rowTotal,
            value: value,
            isCoin: value < 1 // Only < 1 EUR are in the "Coins Total" group
        };
    };

    // Main Update Function
    // source: 'row' (calculated from rows) or 'manual' (user typed in coins total)
    const updateCalculations = (source = 'row') => {
        let banknotesSum = 0;
        let coinsRowSum = 0;

        // 1. Calculate sums from rows
        rows.forEach(row => {
            const details = getRowDetails(row);
            if (details.isCoin) {
                coinsRowSum += details.total;
            } else {
                banknotesSum += details.total;
            }
        });

        // 2. Determine Coins Total value
        let currentCoinsTotal = 0;

        if (source === 'row') {
            // If the update comes from a row change, we overwrite the manual input
            currentCoinsTotal = coinsRowSum;
            if (coinsTotalInput) {
                coinsTotalInput.value = formatInputValue(coinsRowSum);
            }
        } else {
            // If update comes from manual editing of the total field
            if (coinsTotalInput) {
                currentCoinsTotal = parseAmount(coinsTotalInput.value);
            }
        }

        // 3. Calculate Grand Total
        const grandTotal = banknotesSum + currentCoinsTotal;
        grandTotalEl.textContent = formatCurrency(grandTotal);

        // 4. Update DFO Difference
        updateDifference(grandTotal);
    };

    const updateDifference = (grandTotal) => {
        const diffContainer = document.getElementById('difference-container');
        const diffAmountEl = document.getElementById('difference-amount');

        if (dfoInput && dfoInput.value !== '') {
            const dfoValue = parseAmount(dfoInput.value);
            const difference = grandTotal - dfoValue;

            diffContainer.classList.remove('hidden');
            diffAmountEl.textContent = (difference > 0 ? '+' : '') + formatCurrency(difference);

            diffContainer.className = 'difference-container'; // reset classes
            if (difference > 0.001) {
                diffContainer.classList.add('diff-positive');
            } else if (difference < -0.001) {
                diffContainer.classList.add('diff-negative');
            } else {
                diffContainer.classList.add('diff-neutral');
            }
        } else {
            diffContainer.classList.add('hidden');
        }
    };

    // --- Event Listeners ---

    // 1. Row Inputs
    rows.forEach(row => {
        const input = row.querySelector('.count-input');

        input.addEventListener('input', () => {
            // When a row changes, we recalculate purely from rows (overwriting manual coins total)
            updateCalculations('row');
        });

        input.addEventListener('focus', () => input.select());
    });

    // 2. Manual Coins Total Input
    if (coinsTotalInput) {
        coinsTotalInput.addEventListener('input', () => {
            // When user types in total, we update grand total BUT keep their manual value
            updateCalculations('manual');
        });
        coinsTotalInput.addEventListener('focus', () => coinsTotalInput.select());
    }

    // 3. DFO Input
    if (dfoInput) {
        dfoInput.addEventListener('input', () => {
            // Just re-run calc to update difference, source doesn't matter for DFO but 'manual' preserves current coin input
            updateCalculations('manual');
        });
        dfoInput.addEventListener('focus', () => dfoInput.select());
    }

    // 4. Reset Button
    resetBtn.addEventListener('click', () => {
        rows.forEach(row => {
            row.querySelector('.count-input').value = '';
        });
        if (coinsTotalInput) coinsTotalInput.value = '';
        if (dfoInput) dfoInput.value = '';

        updateCalculations('row');
    });

    // Initial Run
    updateCalculations('row');
});
