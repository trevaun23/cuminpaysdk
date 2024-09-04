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
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
            this.renderButtons(container, fundingSources);
        }
        else {
            console.error(`Container with ID ${containerId} not found.`);
        }
    }
    renderButtons(container, fundingSources) {
        return __awaiter(this, void 0, void 0, function* () {
            fundingSources.forEach(fundingSource => {
                const button = document.createElement('button');
                button.className = 'payment-button';
                button.style.backgroundColor = fundingSource === 'CUMIN' ? '#ffc439' : fundingSource === 'MOBILE_MONEY' ? '#4caf50' : '#333';
                button.style.color = '#fff';
                button.style.width = '100%';
                button.style.padding = '15px';
                button.style.margin = '10px 0';
                button.style.border = 'none';
                button.style.cursor = 'pointer';
                button.style.fontSize = '18px';
                button.style.borderRadius = '5px';
                button.textContent = fundingSource === 'CUMIN' ? 'Pay with Cumin' : fundingSource === 'MOBILE_MONEY' ? 'Pay with Mobile Money' : 'Pay with Debit or Credit Card';
                button.addEventListener('click', () => {
                    if (fundingSource === 'CUMIN') {
                        this.showOverlay();
                        this.displayLoginPopup();
                    }
                    else if (fundingSource === 'MOBILE_MONEY') {
                        this.showOverlay();
                        this.displayMobileMoneyPopup();
                    }
                    else {
                        this.displayCardFields(container);
                    }
                });
                container.appendChild(button);
            });
            const cancelButton = document.createElement('button');
            cancelButton.className = 'payment-button';
            cancelButton.style.backgroundColor = '#ccc';
            cancelButton.style.color = '#333';
            cancelButton.textContent = 'Cancel';
            cancelButton.addEventListener('click', () => {
                var _a;
                this.hideOverlay();
                (_a = this.popupWindow) === null || _a === void 0 ? void 0 : _a.close();
                this.popupWindow = null;
            });
            container.appendChild(cancelButton);
        });
    }
    displayCardFields(container) {
        let cardFields = document.getElementById('card-fields');
        if (!cardFields) {
            cardFields = document.createElement('div');
            cardFields.id = 'card-fields';
            cardFields.innerHTML = `
              <input type="text" placeholder="Card number" class="cumin-input">
              <input type="text" placeholder="Expires" class="cumin-input">
              <input type="text" placeholder="CSC" class="cumin-input">
              <input type="text" placeholder="First name" class="cumin-input">
              <input type="text" placeholder="Last name" class="cumin-input">
              <input type="text" placeholder="Street address" class="cumin-input">
              <input type="text" placeholder="Apt., ste., bldg." class="cumin-input">
              <button id="pay-now" class="payment-button" style="background-color: #4caf50; color: white;">Pay Now</button>
          `;
            container.appendChild(cardFields);
            const payNowButton = cardFields.querySelector('#pay-now');
            payNowButton.addEventListener('click', () => {
                this.processPayment('CARD');
            });
        }
        else {
            cardFields.style.display = cardFields.style.display === 'block' ? 'none' : 'block';
        }
    }
    displayLoginPopup() {
        this.popupWindow = window.open('', 'LoginPopup', 'width=400,height=600');
        if (this.popupWindow) {
            this.popupWindow.document.write(`
              <html>
              <head><title>Login</title></head>
              <body>
                  <div class="payment-container">
                      <h3>Login to CuminPay</h3>
                      <input type="email" id="cumin-email" placeholder="Email" class="cumin-input" value="${this.options.email || ''}">
                      <input type="password" id="cumin-password" placeholder="Password" class="cumin-input">
                      <button id="cumin-login" class="payment-button">Log In</button>
                      <div id="cumin-error-message" class="cumin-message"></div>
                      <button id="cumin-forgot-password" class="cumin-link">Forgot Password?</button>
                      <button id="cumin-create-account" class="cumin-link">Create an Account</button>
                  </div>
              </body>
              </html>
          `);
            this.injectStylesIntoPopup(this.popupWindow.document);
            const loginButton = this.popupWindow.document.getElementById('cumin-login');
            loginButton.addEventListener('click', () => {
                this.authenticateUser();
            });
            const forgotPasswordButton = this.popupWindow.document.getElementById('cumin-forgot-password');
            forgotPasswordButton.addEventListener('click', () => {
                this.displayForgotPassword();
            });
            const createAccountButton = this.popupWindow.document.getElementById('cumin-create-account');
            createAccountButton.addEventListener('click', () => {
                this.displayCreateAccountForm();
            });
            this.popupWindow.onbeforeunload = () => {
                this.hideOverlay(); // Ensure the overlay is hidden when the window is closed
                this.popupWindow = null;
            };
        }
    }
    authenticateUser() {
        var _a, _b, _c;
        const email = (_a = this.popupWindow) === null || _a === void 0 ? void 0 : _a.document.getElementById('cumin-email');
        const password = (_b = this.popupWindow) === null || _b === void 0 ? void 0 : _b.document.getElementById('cumin-password');
        // Simulate Firebase authentication for example
        if (email.value === 'test@example.com' && password.value === 'password') {
            this.displayWalletSelectionPopup();
        }
        else {
            const errorMessage = (_c = this.popupWindow) === null || _c === void 0 ? void 0 : _c.document.getElementById('cumin-error-message');
            errorMessage.textContent = 'Incorrect email or password.';
        }
    }
    displayForgotPassword() {
        var _a;
        if (this.popupWindow && this.popupWindow.document.body) {
            this.popupWindow.document.body.innerHTML = `
              <div class="payment-container">
                  <h3>Forgot Password?</h3>
                  <p>Please go to your CuminPay App or the website to reset your password.</p>
                  <button id="cumin-back-to-login" class="payment-button">Back to Login</button>
              </div>
          `;
        }
        const backToLoginButton = (_a = this.popupWindow) === null || _a === void 0 ? void 0 : _a.document.getElementById('cumin-back-to-login');
        backToLoginButton.addEventListener('click', () => {
            this.displayLoginPopup();
        });
    }
    displayCreateAccountForm() {
        var _a, _b;
        if (this.popupWindow && this.popupWindow.document.body) {
            this.popupWindow.document.body.innerHTML = `
              <div class="payment-container">
                  <h3>Create an Account</h3>
                  <input type="email" id="create-email" placeholder="Email" class="cumin-input" value="${this.options.email || ''}">
                  <input type="text" id="create-first-name" placeholder="First Name" class="cumin-input">
                  <input type="text" id="create-last-name" placeholder="Last Name" class="cumin-input">
                  <input type="password" id="create-password" placeholder="Password" class="cumin-input">
                  <input type="password" id="create-confirm-password" placeholder="Confirm Password" class="cumin-input">
                  <button id="create-account" class="payment-button">Create Account</button>
                  <div id="cumin-error-message" class="cumin-message"></div>
                  <button id="cumin-back-to-login" class="cumin-link">Back to Login</button>
              </div>
          `;
        }
        const createAccountButton = (_a = this.popupWindow) === null || _a === void 0 ? void 0 : _a.document.getElementById('create-account');
        createAccountButton.addEventListener('click', () => {
            this.createAccount();
        });
        const backToLoginButton = (_b = this.popupWindow) === null || _b === void 0 ? void 0 : _b.document.getElementById('cumin-back-to-login');
        backToLoginButton.addEventListener('click', () => {
            this.displayLoginPopup();
        });
    }
    createAccount() {
        var _a, _b, _c, _d, _e, _f, _g;
        const email = (_a = this.popupWindow) === null || _a === void 0 ? void 0 : _a.document.getElementById('create-email');
        const firstName = (_b = this.popupWindow) === null || _b === void 0 ? void 0 : _b.document.getElementById('create-first-name');
        const lastName = (_c = this.popupWindow) === null || _c === void 0 ? void 0 : _c.document.getElementById('create-last-name');
        const password = (_d = this.popupWindow) === null || _d === void 0 ? void 0 : _d.document.getElementById('create-password');
        const confirmPassword = (_e = this.popupWindow) === null || _e === void 0 ? void 0 : _e.document.getElementById('create-confirm-password');
        if (password.value !== confirmPassword.value) {
            const errorMessage = (_f = this.popupWindow) === null || _f === void 0 ? void 0 : _f.document.getElementById('cumin-error-message');
            errorMessage.textContent = 'Passwords do not match.';
            return;
        }
        // Simulate account creation
        if (this.popupWindow && this.popupWindow.document.body) {
            this.popupWindow.document.body.innerHTML = `
              <div class="payment-container">
                  <h3>Account Created</h3>
                  <p>A verification email has been sent to ${email.value}. Please verify your email to continue.</p>
                  <button id="cumin-back-to-login" class="payment-button">Back to Login</button>
              </div>
          `;
        }
        const backToLoginButton = (_g = this.popupWindow) === null || _g === void 0 ? void 0 : _g.document.getElementById('cumin-back-to-login');
        backToLoginButton.addEventListener('click', () => {
            this.displayLoginPopup();
        });
    }
    displayWalletSelectionPopup() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (this.popupWindow && this.popupWindow.document.body) {
                this.popupWindow.document.body.innerHTML = `
              <div class="payment-container">
                  <h3>Payment for Enrollment</h3>
                  <p>Select a Wallet to Pay From</p>
                  <label class="wallet-option"><input type="radio" name="wallet" value="USD"> 200 USD Available <br><span class="exchange-rate">90 x 1.00 = 90.00 USD</span></label><br>
                  <label class="wallet-option"><input type="radio" name="wallet" value="EUR"> 300 EUR Available <br><span class="exchange-rate">90 x 0.90 = 80.64 EUR</span></label><br>
                  <button id="confirm-payment" class="payment-button">Pay ${this.options.price} ${this.options.currency}</button>
                  <button id="cancel-payment" class="payment-button" style="background-color: #ccc; color: #333;">Cancel</button>
              </div>
          `;
            }
            const confirmPaymentButton = (_a = this.popupWindow) === null || _a === void 0 ? void 0 : _a.document.getElementById('confirm-payment');
            confirmPaymentButton.addEventListener('click', () => {
                this.processPayment('CUMIN');
            });
            const cancelPaymentButton = (_b = this.popupWindow) === null || _b === void 0 ? void 0 : _b.document.getElementById('cancel-payment');
            cancelPaymentButton.addEventListener('click', () => {
                var _a;
                (_a = this.popupWindow) === null || _a === void 0 ? void 0 : _a.close();
                this.popupWindow = null;
            });
        });
    }
    displayMobileMoneyPopup() {
        this.popupWindow = window.open('', 'MobileMoneyPopup', 'width=400,height=600');
        if (this.popupWindow) {
            this.popupWindow.document.write(`
              <html>
              <head><title>Mobile Money</title></head>
              <body>
                  <div class="payment-container">
                      <h3>Pay with Mobile Money</h3>
                      <input type="text" id="mobile-number" placeholder="Phone Number" class="cumin-input">
                      <select id="mobile-provider" class="cumin-input">
                          <option value="MTN">MTN</option>
                          <option value="Vodafone">Vodafone</option>
                          <option value="AirtelTigo">AirtelTigo</option>
                      </select>
                      <button id="confirm-mobile-payment" class="payment-button">Confirm</button>
                      <button id="cancel-mobile-payment" class="payment-button" style="background-color: #ccc; color: #333;">Cancel</button>
                  </div>
              </body>
              </html>
          `);
            this.injectStylesIntoPopup(this.popupWindow.document);
            const confirmMobilePaymentButton = this.popupWindow.document.getElementById('confirm-mobile-payment');
            confirmMobilePaymentButton.addEventListener('click', () => {
                this.displayMobileMoneyProcessing();
            });
            const cancelMobilePaymentButton = this.popupWindow.document.getElementById('cancel-mobile-payment');
            cancelMobilePaymentButton.addEventListener('click', () => {
                var _a;
                (_a = this.popupWindow) === null || _a === void 0 ? void 0 : _a.close();
                this.popupWindow = null;
            });
            this.popupWindow.onbeforeunload = () => {
                this.hideOverlay(); // Ensure the overlay is hidden when the window is closed
                this.popupWindow = null;
            };
        }
    }
    displayMobileMoneyProcessing() {
        var _a, _b;
        if (this.popupWindow && this.popupWindow.document.body) {
            this.popupWindow.document.body.innerHTML = `
              <div class="payment-container">
                  <h3>Payment in Progress</h3>
                  <p>Please wait while we authorize this transaction.</p>
                  <button id="complete-mobile-payment" class="payment-button">I've completed the payment</button>
                  <button id="cancel-mobile-payment" class="payment-button" style="background-color: #ccc; color: #333;">Cancel</button>
              </div>
          `;
        }
        const completeMobilePaymentButton = (_a = this.popupWindow) === null || _a === void 0 ? void 0 : _a.document.getElementById('complete-mobile-payment');
        completeMobilePaymentButton.addEventListener('click', () => {
            this.processPayment('MOBILE_MONEY');
        });
        const cancelMobilePaymentButton = (_b = this.popupWindow) === null || _b === void 0 ? void 0 : _b.document.getElementById('cancel-mobile-payment');
        cancelMobilePaymentButton.addEventListener('click', () => {
            var _a;
            (_a = this.popupWindow) === null || _a === void 0 ? void 0 : _a.close();
            this.popupWindow = null;
        });
    }
    processPayment(fundingSource) {
        return __awaiter(this, void 0, void 0, function* () {
            this.showLoadingOverlay();
            // Simulate processing payment delay
            setTimeout(() => {
                var _a;
                this.hideLoadingOverlay();
                this.showSuccessMessage('Payment successful!');
                if (fundingSource === 'CARD') {
                    this.clearAndHideCardFields();
                }
                (_a = this.popupWindow) === null || _a === void 0 ? void 0 : _a.close();
                this.popupWindow = null;
                this.options.onSuccess({ fundingSource });
            }, 3000);
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
        loadingOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        loadingOverlay.style.zIndex = '1000';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.justifyContent = 'center';
        loadingOverlay.style.alignItems = 'center';
        loadingOverlay.innerHTML = `
          <div id="loading-spinner"></div>
      `;
        document.body.appendChild(loadingOverlay);
    }
    hideLoadingOverlay() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }
    showSuccessMessage(message) {
        const confirmationOverlay = document.createElement('div');
        confirmationOverlay.id = 'confirmation-overlay';
        confirmationOverlay.style.position = 'fixed';
        confirmationOverlay.style.top = '0';
        confirmationOverlay.style.left = '0';
        confirmationOverlay.style.width = '100%';
        confirmationOverlay.style.height = '100%';
        confirmationOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        confirmationOverlay.style.zIndex = '1000';
        confirmationOverlay.style.display = 'flex';
        confirmationOverlay.style.justifyContent = 'center';
        confirmationOverlay.style.alignItems = 'center';
        confirmationOverlay.innerHTML = `
          <div class="cumin-message" style="color: #4caf50;">${message}</div>
      `;
        document.body.appendChild(confirmationOverlay);
        this.hideOverlay();
        setTimeout(() => {
            confirmationOverlay.remove();
        }, 1500);
    }
    clearAndHideCardFields() {
        const cardFields = document.getElementById('card-fields');
        if (cardFields) {
            cardFields.querySelectorAll('input').forEach((input) => {
                input.value = '';
            });
            cardFields.style.display = 'none';
        }
    }
    injectStylesIntoPopup(doc) {
        const link = doc.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cuminpay-59a4b.web.app/cumin-pay.css';
        doc.head.appendChild(link);
    }
    showOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'cumin-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '999';
        overlay.innerHTML = `
          <div style="color: #fff; font-size: 18px;">Please continue the payment in the Secure Cumin Browser Window.</div>
          <br>
          <button style="padding: 10px 20px; font-size: 16px;" id="continue-button">Click to Continue</button>
      `;
        document.body.appendChild(overlay);
        const continueButton = document.getElementById('continue-button');
        continueButton.addEventListener('click', () => {
            if (this.popupWindow) {
                this.popupWindow.focus();
            }
        });
    }
    hideOverlay() {
        const overlay = document.getElementById('cumin-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
}
// Attach CuminPay to the global window object
window.CuminPay = CuminPay;
