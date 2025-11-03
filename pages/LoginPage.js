export class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = "#login";
    this.passwordInput = "#password";
    this.loginButton = "#send";
    this.errorMessage = "#flashbox, .alert, .alert-danger";
  }

  async goto(baseUrl) {
    await this.page.goto(baseUrl);
  }

  async login(username, password) {
    await this.page.fill(this.usernameInput, username);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
  }

  async getErrorMessage() {
    try {
      const locator = await this.page.waitForSelector(this.errorMessage, { timeout: 5000 });
      return await locator.innerText();
    } catch {
      return "";
    }
  }
}
