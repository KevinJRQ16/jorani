export class HomePage {
  constructor(page) {
    this.page = page;
    this.adminMenu = 'a.dropdown-toggle:has-text("Admin")';
    this.crearUsuarioLink = 'a:has-text("Create user")';
    this.usersLink = 'a:has-text("List of users")';
    this.listOfTypesLink = 'a:has-text("List of types")';
    this.requestsMenu = 'a.dropdown-toggle:has-text("Requests")';
    this.listOfLeaveRequests = 'a:has-text("List of leave requests")';
    this.requestsALeaveLink = 'a:has-text("Request a Leave")';
    this.submitAnOTRequestLink = 'a:has-text("Submit an OT Request")';
    this.listOfOTWorked = 'a:has-text("List of OT Worked")';

  

    this.approvalMenu = 'a.dropdown-toggle:has-text("Approval")';
    this.delegations = 'a:has-text("Delegations")';
    // this.leavesLink = 'a[href*="/requests"]';
    this.leavesLink = 'a[href="http://localhost/requests"]';
    this.overtimeLink = 'a:has-text("Overtime")';
  }

  async goToOvertime() {
    await this.page.waitForSelector(this.approvalMenu, { timeout: 10000 });
    await this.page.hover(this.approvalMenu);
    await this.page.click(this.approvalMenu);
    await this.page.waitForSelector(this.overtimeLink, { timeout: 10000 });
    await this.page.click(this.overtimeLink);
    await this.page.waitForURL("**/overtime");
  }

  async goToDelegations() {
    await this.page.waitForSelector(this.approvalMenu, { timeout: 10000 });
    await this.page.hover(this.approvalMenu);
    await this.page.click(this.approvalMenu);
    await this.page.waitForSelector(this.delegations, { timeout: 10000 });
    await this.page.click(this.delegations);
    await this.page.waitForURL("**/requests/delegations");
  }

  async goToListOfLeaveRequests() {
    await this.page.waitForSelector(this.requestsMenu, { timeout: 10000 });
    await this.page.hover(this.requestsMenu);
    await this.page.click(this.requestsMenu);
    await this.page.waitForSelector(this.listOfLeaveRequests, { timeout: 10000 });
    await this.page.click(this.listOfLeaveRequests);
    await this.page.waitForURL("**/leaves");
  }

  async goToCrearUsuario() {
    await this.page.waitForSelector(this.adminMenu, { timeout: 10000 });
    await this.page.hover(this.adminMenu);
    await this.page.click(this.adminMenu);
    await this.page.waitForSelector(this.crearUsuarioLink, { timeout: 10000 });
    await this.page.click(this.crearUsuarioLink);
    await this.page.waitForURL("**/users/create");
  }

  async goToListUsers() {
    await this.page.waitForSelector(this.adminMenu, { timeout: 10000 });
    await this.page.hover(this.adminMenu);
    await this.page.click(this.adminMenu);
    await this.page.waitForSelector(this.usersLink, { timeout: 10000 });
    await this.page.click(this.usersLink);
    await this.page.waitForURL("**/users");
  }

  async goToLeaveTypes() {
    await this.page.waitForSelector(this.adminMenu, { timeout: 10000 });
    await this.page.hover(this.adminMenu);
    await this.page.click(this.adminMenu);
    await this.page.waitForSelector(this.listOfTypesLink, { timeout: 10000 });
    await this.page.click(this.listOfTypesLink);
    await this.page.waitForURL("**/leavetypes");
  }

  async goToCreateLeave() {
    await this.page.waitForSelector(this.requestsMenu, { timeout: 10000 });
    await this.page.hover(this.requestsMenu);
    await this.page.click(this.requestsMenu);
    await this.page.waitForSelector(this.requestsALeaveLink, { timeout: 10000 });
    await this.page.click(this.requestsALeaveLink);
    await this.page.waitForURL("**/leaves/create");
  }

  async goToCreateOvertime() {
    await this.page.waitForSelector(this.requestsMenu, { timeout: 10000 });
    await this.page.hover(this.requestsMenu);
    await this.page.click(this.requestsMenu);
    await this.page.waitForSelector(this.submitAnOTRequestLink, { timeout: 10000 });
    await this.page.click(this.submitAnOTRequestLink);
    await this.page.waitForURL("**/extra/create");
  }

  //approval
  async goToRequests() {
    await this.page.waitForSelector(this.approvalMenu, { timeout: 10000 });
    await this.page.hover(this.approvalMenu); 
    await this.page.click(this.approvalMenu); 
    await this.page.waitForSelector(this.leavesLink, { timeout: 10000 });
    await this.page.click(this.leavesLink);
    await this.page.waitForURL("**/requests");
  }  

  async goToListExtras(){
    await this.page.waitForSelector(this.approvalMenu, { timeout: 10000 });
    await this.page.hover(this.requestsMenu); 
    await this.page.click(this.requestsMenu); 
    await this.page.waitForSelector(this.listOfOTWorked, { timeout: 10000 });
    await this.page.click(this.listOfOTWorked);
    await this.page.waitForURL("**/extra");
  }
}
