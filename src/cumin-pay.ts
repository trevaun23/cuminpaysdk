class CuminPay {
  private clientId: string;
  private options: any;
  private popupWindow: Window | null = null;

  constructor(clientId: string, options: any) {
      this.clientId = clientId;
      this.options = options;
  }

  public init(containerId: string, fundingSources: string[]) {
      const container = document.getElementById(containerId);
      if (container) {
          container.innerHTML = '';
          this.renderButtons(container, fundingSources);
      } else {
          console.error(`Container with ID ${containerId} not found.`);
      }
  }

  private async renderButtons(container: HTMLElement, fundingSources: string[]) {
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
              } else if (fundingSource === 'MOBILE_MONEY') {
                this.showOverlay();
                  this.displayMobileMoneyPopup();
              } else {
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
          this.hideOverlay();
          this.popupWindow?.close();
          this.popupWindow = null;
      });

      container.appendChild(cancelButton);
  }

  private displayCardFields(container: HTMLElement) {
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

          const payNowButton = cardFields.querySelector('#pay-now') as HTMLButtonElement;
          payNowButton.addEventListener('click', () => {
              this.processPayment('CARD');
          });
      } else {
          cardFields.style.display = cardFields.style.display === 'block' ? 'none' : 'block';
      }
  }

  private displayLoginPopup() {
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

          const loginButton = this.popupWindow.document.getElementById('cumin-login') as HTMLButtonElement;
          loginButton.addEventListener('click', () => {
              this.authenticateUser();
          });

          const forgotPasswordButton = this.popupWindow.document.getElementById('cumin-forgot-password') as HTMLButtonElement;
          forgotPasswordButton.addEventListener('click', () => {
              this.displayForgotPassword();
          });

          const createAccountButton = this.popupWindow.document.getElementById('cumin-create-account') as HTMLButtonElement;
          createAccountButton.addEventListener('click', () => {
              this.displayCreateAccountForm();
          });

          this.popupWindow.onbeforeunload = () => {
              this.hideOverlay();  // Ensure the overlay is hidden when the window is closed
              this.popupWindow = null;
          };
      }
  }

  private authenticateUser() {
      const email = this.popupWindow?.document.getElementById('cumin-email') as HTMLInputElement;
      const password = this.popupWindow?.document.getElementById('cumin-password') as HTMLInputElement;

      // Simulate Firebase authentication for example
      if (email.value === 'test@example.com' && password.value === 'password') {
          this.displayWalletSelectionPopup();
      } else {
          const errorMessage = this.popupWindow?.document.getElementById('cumin-error-message') as HTMLElement;
          errorMessage.textContent = 'Incorrect email or password.';
      }
  }

  private displayForgotPassword() {
      if (this.popupWindow && this.popupWindow.document.body) {
          this.popupWindow.document.body.innerHTML =  `
              <div class="payment-container">
                  <h3>Forgot Password?</h3>
                  <p>Please go to your CuminPay App or the website to reset your password.</p>
                  <button id="cumin-back-to-login" class="payment-button">Back to Login</button>
              </div>
          `;
      }

      const backToLoginButton = this.popupWindow?.document.getElementById('cumin-back-to-login') as HTMLButtonElement;
      backToLoginButton.addEventListener('click', () => {
          this.displayLoginPopup();
      });
  }

  private displayCreateAccountForm() {
      if (this.popupWindow && this.popupWindow.document.body) {
          this.popupWindow.document.body.innerHTML =  `
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

      const createAccountButton = this.popupWindow?.document.getElementById('create-account') as HTMLButtonElement;
      createAccountButton.addEventListener('click', () => {
          this.createAccount();
      });

      const backToLoginButton = this.popupWindow?.document.getElementById('cumin-back-to-login') as HTMLButtonElement;
      backToLoginButton.addEventListener('click', () => {
          this.displayLoginPopup();
      });
  }

  private createAccount() {
      const email = this.popupWindow?.document.getElementById('create-email') as HTMLInputElement;
      const firstName = this.popupWindow?.document.getElementById('create-first-name') as HTMLInputElement;
      const lastName = this.popupWindow?.document.getElementById('create-last-name') as HTMLInputElement;
      const password = this.popupWindow?.document.getElementById('create-password') as HTMLInputElement;
      const confirmPassword = this.popupWindow?.document.getElementById('create-confirm-password') as HTMLInputElement;

      if (password.value !== confirmPassword.value) {
          const errorMessage = this.popupWindow?.document.getElementById('cumin-error-message') as HTMLElement;
          errorMessage.textContent = 'Passwords do not match.';
          return;
      }

      // Simulate account creation
      if (this.popupWindow && this.popupWindow.document.body) {
          this.popupWindow.document.body.innerHTML =  `
              <div class="payment-container">
                  <h3>Account Created</h3>
                  <p>A verification email has been sent to ${email.value}. Please verify your email to continue.</p>
                  <button id="cumin-back-to-login" class="payment-button">Back to Login</button>
              </div>
          `;
      }
      const backToLoginButton = this.popupWindow?.document.getElementById('cumin-back-to-login') as HTMLButtonElement;
      backToLoginButton.addEventListener('click', () => {
          this.displayLoginPopup();
      });
  }

  private async displayWalletSelectionPopup() {
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

      const confirmPaymentButton = this.popupWindow?.document.getElementById('confirm-payment') as HTMLButtonElement;
      confirmPaymentButton.addEventListener('click', () => {
          this.processPayment('CUMIN');
      });

      const cancelPaymentButton = this.popupWindow?.document.getElementById('cancel-payment') as HTMLButtonElement;
      cancelPaymentButton.addEventListener('click', () => {
          this.popupWindow?.close();
          this.popupWindow = null;
      });
  }

  private displayMobileMoneyPopup() {
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

          const confirmMobilePaymentButton = this.popupWindow.document.getElementById('confirm-mobile-payment') as HTMLButtonElement;
          confirmMobilePaymentButton.addEventListener('click', () => {
              this.displayMobileMoneyProcessing();
          });

          const cancelMobilePaymentButton = this.popupWindow.document.getElementById('cancel-mobile-payment') as HTMLButtonElement;
          cancelMobilePaymentButton.addEventListener('click', () => {
              this.popupWindow?.close();
              this.popupWindow = null;
          });

          
          this.popupWindow.onbeforeunload = () => {
            this.hideOverlay();  // Ensure the overlay is hidden when the window is closed
            this.popupWindow = null;
        };
      }
  }

  private displayMobileMoneyProcessing() {
      if (this.popupWindow && this.popupWindow.document.body) {
          this.popupWindow.document.body.innerHTML =  `
              <div class="payment-container">
                  <h3>Payment in Progress</h3>
                  <p>Please wait while we authorize this transaction.</p>
                  <button id="complete-mobile-payment" class="payment-button">I've completed the payment</button>
                  <button id="cancel-mobile-payment" class="payment-button" style="background-color: #ccc; color: #333;">Cancel</button>
              </div>
          `;
      }

      const completeMobilePaymentButton = this.popupWindow?.document.getElementById('complete-mobile-payment') as HTMLButtonElement;
      completeMobilePaymentButton.addEventListener('click', () => {
          this.processPayment('MOBILE_MONEY');
      });

      const cancelMobilePaymentButton = this.popupWindow?.document.getElementById('cancel-mobile-payment') as HTMLButtonElement;
      cancelMobilePaymentButton.addEventListener('click', () => {
          this.popupWindow?.close();
          this.popupWindow = null;
      });
  }

  private async processPayment(fundingSource: string) {
    
      this.showLoadingOverlay();
      // Simulate processing payment delay
      setTimeout(() => {
          this.hideLoadingOverlay();
          this.showSuccessMessage('Payment successful!');
          if (fundingSource === 'CARD') {
              this.clearAndHideCardFields();
          }
          this.popupWindow?.close();
          this.popupWindow = null;
          this.options.onSuccess({ fundingSource });
      }, 3000);
  }

  private showLoadingOverlay() {
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

  private hideLoadingOverlay() {
      const loadingOverlay = document.getElementById('loading-overlay');
      if (loadingOverlay) {
          loadingOverlay.remove();
      }
  }

  private showSuccessMessage(message: string) {
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
      this.hideOverlay()
      setTimeout(() => {
          confirmationOverlay.remove();
      }, 1500);
  }

  private clearAndHideCardFields() {
      const cardFields = document.getElementById('card-fields');
      if (cardFields) {
          cardFields.querySelectorAll('input').forEach((input) => {
              (input as HTMLInputElement).value = '';
          });
          cardFields.style.display = 'none';
      }
  }

  private injectStylesIntoPopup(doc: Document) {
      const link = doc.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cuminpay-59a4b.web.app/cumin-pay.css';
      doc.head.appendChild(link);
  }

  private showOverlay() {
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

      const continueButton = document.getElementById('continue-button') as HTMLButtonElement;
      continueButton.addEventListener('click', () => {
          if (this.popupWindow) {
              this.popupWindow.focus();
          }
      });
  }

  private hideOverlay() {
      const overlay = document.getElementById('cumin-overlay');
      if (overlay) {
          overlay.remove();
      }
  }

}

// Attach CuminPay to the global window object
(window as any).CuminPay = CuminPay;
