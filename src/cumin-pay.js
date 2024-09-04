"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class CuminPay {
    constructor(clientId, options) {
        this.popupWindow = null;
        this.clientId = clientId;
        this.options = options;
    }
    init(containerId, fundingSources) {
        this.renderButtons(containerId, fundingSources);
    }
    fetchExchangeRate(fromCurrency, toCurrency) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
            const data = yield response.json();
            return data.rates[toCurrency];
        });
    }
    renderButtons(containerId, fundingSources) {
        return __awaiter(this, void 0, void 0, function* () {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = ''; // Clear existing content in the container
                for (const fundingSource of fundingSources) {
                    let buttonHTML = '';
                    if (fundingSource === 'CUMIN') {
                        buttonHTML = `<button class="payment-button" data-funding-source="CUMIN" style="background-color: #ffc439; color: #111; width: 100%; padding: 15px; margin: 10px 0; border: none; cursor: pointer; font-size: 18px;">Pay with Cumin</button>`;
                    }
                    else if (fundingSource === 'DEBIT_CREDIT_CARD') {
                        buttonHTML = `<button class="payment-button" data-funding-source="DEBIT_CREDIT_CARD" style="background-color: #333; color: #fff; width: 100%; padding: 15px; margin: 10px 0; border: none; cursor: pointer; font-size: 18px;">Debit or Credit Card</button>`;
                    }
                    else if (fundingSource === 'MOBILE_MONEY') {
                        buttonHTML = `<button class="payment-button" data-funding-source="MOBILE_MONEY" style="background-color: #4caf50; color: #fff; width: 100%; padding: 15px; margin: 10px 0; border: none; cursor: pointer; font-size: 18px;">Pay with Mobile Money</button>`;
                    }
                    container.insertAdjacentHTML('beforeend', buttonHTML);
                }
                this.setupButtonEvents(container, fundingSources);
            }
            else {
                this.showErrorMessage(`Container with ID ${containerId} not found.`);
            }
        });
    }
    setupButtonEvents(container, fundingSources) {
        fundingSources.forEach((fundingSource) => {
            const button = container.querySelector(`.payment-button[data-funding-source="${fundingSource}"]`);
            if (button) {
                button.addEventListener('click', () => {
                    if (fundingSource === 'CUMIN') {
                        this.displayCuminLogin(container);
                    }
                    else if (fundingSource === 'DEBIT_CREDIT_CARD') {
                        this.showCardFields(container);
                    }
                    else if (fundingSource === 'MOBILE_MONEY') {
                        this.displayMobileMoneyPopup();
                    }
                });
            }
        });
    }
    showCardFields(container) {
        const existingFields = container.querySelector('#card-fields');
        if (!existingFields) {
            const cardFields = document.createElement('div');
            cardFields.id = 'card-fields';
            cardFields.style.marginTop = '20px';
            cardFields.innerHTML = `
        <input type="text" placeholder="Card number" class="cumin-input">
        <input type="text" placeholder="Card Expiry (MM/YY)" class="cumin-input">
        <input type="text" placeholder="CVV" class="cumin-input">
        <button id="pay-now" class="payment-button" style="background-color: #007bff; color: #fff; width: 100%; padding: 15px; margin: 10px 0; border: none; cursor: pointer; font-size: 18px;">Pay ${this.options.price} ${this.options.currency}</button>
      `;
            container.appendChild(cardFields);
            const payNowButton = cardFields.querySelector('#pay-now');
            if (payNowButton) {
                payNowButton.addEventListener('click', () => {
                    this.processPayment('DEBIT_CREDIT_CARD');
                });
            }
        }
    }
    processPayment(fundingSource) {
        this.showLoadingOverlay();
        setTimeout(() => {
            this.hideLoadingOverlay();
            this.showConfirmationOverlay();
            setTimeout(() => {
                const paymentData = {
                    status: 'success',
                    amount: this.options.price,
                    currency: this.options.currency,
                    description: this.options.description,
                    softDescriptor: this.options.softDescriptor,
                    fundingSource: fundingSource,
                };
                this.showSuccessMessage('Payment successful!');
                this.options.onSuccess(paymentData);
            }, 2000);
        }, 2000);
    }
    displayCuminLogin(container) {
        this.popupWindow = window.open('', 'CuminPaymentWindow', 'width=400,height=600');
        if (this.popupWindow) {
            this.popupWindow.document.write(`
        <html>
        <head><title>Log In to CuminPay</title></head>
        <body style="display:flex;justify-content:center;align-items:center;height:100vh;">
          <div style="text-align:center;">
            <h3>Log In to CuminPay</h3>
            <input type="email" placeholder="Email" class="cumin-input" value="${this.options.email}">
            <input type="password" placeholder="Password" class="cumin-input">
            <button id="cumin-login" class="payment-button" style="background-color: #007bff; color: #fff; width: 100%; padding: 15px; margin: 10px 0; border: none; cursor: pointer; font-size: 18px;">Log In</button>
            <div id="cumin-error-message" class="cumin-message"></div>
          </div>
        </body>
        </html>
      `);
            this.popupWindow.focus();
            const loginButton = this.popupWindow.document.getElementById('cumin-login');
            loginButton.addEventListener('click', () => {
                this.authenticateUser();
            });
            const forgotPasswordLink = this.popupWindow.document.getElementById('forgot-password');
            forgotPasswordLink.addEventListener('click', () => {
                this.showInfoMessage('Please go to the CuminPay App or website to change your password.');
            });
            const createAccountLink = this.popupWindow.document.getElementById('create-account');
            createAccountLink.addEventListener('click', () => {
                this.displayCreateAccountForm(container);
            });
        }
    }
    // Newly Added Methods
    authenticateUser() {
        var _a;
        // Placeholder for Firebase authentication logic
        const isAuthenticated = true; // Replace this with actual authentication logic
        if (isAuthenticated) {
            this.showSuccessMessage('Authentication successful!');
            (_a = this.popupWindow) === null || _a === void 0 ? void 0 : _a.close();
            this.displayWalletSelection();
        }
        else {
            this.showErrorMessage('Authentication failed. Please check your credentials.');
        }
    }
    displayCreateAccountForm(container) {
        const accountForm = `
      <div id="cumin-create-account-form" class="cumin-create-account-form">
        <h3>Create a CuminPay Account</h3>
        <input type="email" placeholder="Email" class="cumin-input" value="${this.options.email}">
        <input type="text" placeholder="First Name" class="cumin-input">
        <input type="text" placeholder="Last Name" class="cumin-input">
        <input type="password" placeholder="Password" class="cumin-input">
        <input type="password" placeholder="Confirm Password" class="cumin-input">
        <button id="cumin-create-account" class="payment-button" style="background-color: #007bff; color: #fff; width: 100%; padding: 15px; margin: 10px 0; border: none; cursor: pointer; font-size: 18px;">Create Account</button>
        <div id="cumin-error-message" class="cumin-message"></div>
      </div>
    `;
        container.innerHTML = accountForm;
        const createAccountButton = container.querySelector('#cumin-create-account');
        createAccountButton.addEventListener('click', () => {
            this.processAccountCreation();
        });
    }
    processAccountCreation() {
        // Placeholder for Firebase account creation and verification email sending
        this.showInfoMessage('A verification email has been sent to your email address.');
    }
    displayMobileMoneyPopup() {
        var _a;
        this.popupWindow = window.open('', 'MobileMoneyPaymentWindow', 'width=400,height=600');
        if (this.popupWindow) {
            this.popupWindow.document.write(`
        <html>
        <head><title>Mobile Money Payment</title></head>
        <body style="display:flex;justify-content:center;align-items:center;height:100vh;">
          <div style="text-align:center;">
            <h3>Enter Mobile Money Details</h3>
            <input type="text" placeholder="Mobile Number" class="cumin-input">
            <select class="cumin-input">
              <option value="MTN">MTN</option>
              <option value="Vodafone">Vodafone</option>
            </select>
            <button id="confirm-mobile-money" class="payment-button" style="background-color: #4caf50; color: #fff; width: 100%; padding: 15px; margin: 10px 0; border: none; cursor: pointer; font-size: 18px;">Pay ${this.options.price} ${this.options.currency}</button>
            <div id="cumin-error-message" class="cumin-message"></div>
          </div>
        </body>
        </html>
      `);
            this.popupWindow.focus();
            (_a = this.popupWindow.document.getElementById('confirm-mobile-money')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
                this.processMobileMoneyPayment();
            });
            this.popupWindow.onbeforeunload = () => {
                this.popupWindow = null;
            };
        }
    }
    processMobileMoneyPayment() {
        // Placeholder for Mobile Money HTTP Post Request
        if (this.popupWindow) {
            this.popupWindow.document.write(`
        <html>
        <head><title>Processing Payment</title></head>
        <body style="display:flex;justify-content:center;align-items:center;height:100vh;">
          <div style="text-align:center;">
            <p>Processing your Mobile Money payment...</p>
          </div>
        </body>
        </html>
      `);
            setTimeout(() => {
                var _a;
                (_a = this.popupWindow) === null || _a === void 0 ? void 0 : _a.close();
                this.showSuccessMessage('Mobile Money payment successful!');
                this.options.onSuccess({ status: 'success', amount: this.options.price, currency: this.options.currency, fundingSource: 'MOBILE_MONEY' });
            }, 2000);
        }
    }
    displayWalletSelection() {
        return __awaiter(this, void 0, void 0, function* () {
            const wallets = [
                { balance: 200, currency: 'USD' },
                { balance: 300, currency: 'EUR' },
            ];
            const container = document.getElementById('cumin-pay-container');
            if (container) {
                let walletHTML = '<h3>Select a Wallet to Pay From</h3>';
                for (const wallet of wallets) {
                    const exchangeRate = yield this.fetchExchangeRate(wallet.currency, this.options.currency);
                    const amountInCurrency = (wallet.balance * exchangeRate).toFixed(2);
                    walletHTML += `
          <div class="wallet-option">
            <input type="radio" name="wallet" value="${wallet.currency}">
            <label>${wallet.balance} ${wallet.currency} Available</label>
            <p class="exchange-rate">${wallet.balance} x ${exchangeRate} = ${amountInCurrency} ${this.options.currency}</p>
          </div>
        `;
                }
                walletHTML += `
        <button id="confirm-payment" class="payment-button" style="background-color: #4caf50; color: #fff; width: 100%; padding: 15px; margin: 10px 0; border: none; cursor: pointer; font-size: 18px;">Pay ${this.options.price} ${this.options.currency}</button>
        <div id="cumin-error-message" class="cumin-message"></div>
      `;
                container.innerHTML = walletHTML;
                const confirmPaymentButton = container.querySelector('#confirm-payment');
                confirmPaymentButton.addEventListener('click', () => {
                    this.processPayment('CUMIN');
                });
            }
        });
    }
    showLoadingOverlay() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.style.position = 'fixed';
        loadingOverlay.style.top = '0';
        loadingOverlay.style.left = '0';
        loadingOverlay.style.width = '100%';
        loadingOverlay.style.height = '100%';
        loadingOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.justifyContent = 'center';
        loadingOverlay.style.alignItems = 'center';
        loadingOverlay.innerHTML = `
      <div style="width: 50px; height: 50px; border: 5px solid #ccc; border-top-color: #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
    `;
        document.body.appendChild(loadingOverlay);
    }
    hideLoadingOverlay() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            document.body.removeChild(loadingOverlay);
        }
    }
    showConfirmationOverlay() {
        const confirmationOverlay = document.createElement('div');
        confirmationOverlay.id = 'confirmation-overlay';
        confirmationOverlay.style.position = 'fixed';
        confirmationOverlay.style.top = '0';
        confirmationOverlay.style.left = '0';
        confirmationOverlay.style.width = '100%';
        confirmationOverlay.style.height = '100%';
        confirmationOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        confirmationOverlay.style.display = 'flex';
        confirmationOverlay.style.justifyContent = 'center';
        confirmationOverlay.style.alignItems = 'center';
        confirmationOverlay.innerHTML = `
      <div style="text-align: center;">
        <img src="https://your-domain.com/path/to/checkmark.png" alt="Success" style="width: 100px;">
        <p style="margin-top: 10px;">Payment Successful!</p>
      </div>
    `;
        document.body.appendChild(confirmationOverlay);
        setTimeout(() => {
            document.body.removeChild(confirmationOverlay);
        }, 2000);
    }
    showErrorOverlay() {
        const errorOverlay = document.createElement('div');
        errorOverlay.id = 'error-overlay';
        errorOverlay.style.position = 'fixed';
        errorOverlay.style.top = '0';
        errorOverlay.style.left = '0';
        errorOverlay.style.width = '100%';
        errorOverlay.style.height = '100%';
        errorOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
        errorOverlay.style.display = 'flex';
        errorOverlay.style.justifyContent = 'center';
        errorOverlay.style.alignItems = 'center';
        errorOverlay.innerHTML = `
      <div style="text-align: center; color: white;">
        <p>Payment Failed. Please try again.</p>
      </div>
    `;
        document.body.appendChild(errorOverlay);
        setTimeout(() => {
            document.body.removeChild(errorOverlay);
        }, 2000);
    }
    showInfoMessage(message) {
        const messageContainer = document.getElementById('cumin-error-message');
        if (messageContainer) {
            messageContainer.innerHTML = `<p style="color: blue;">${message}</p>`;
        }
    }
    showErrorMessage(message) {
        const messageContainer = document.getElementById('cumin-error-message');
        if (messageContainer) {
            messageContainer.innerHTML = `<p style="color: red;">${message}</p>`;
        }
    }
    showSuccessMessage(message) {
        const messageContainer = document.getElementById('cumin-error-message');
        if (messageContainer) {
            messageContainer.innerHTML = `<p style="color: green;">${message}</p>`;
        }
    }
}
// Attach CuminPay to the global window object
window.CuminPay = CuminPay;
