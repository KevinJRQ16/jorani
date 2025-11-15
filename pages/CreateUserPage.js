export class CreateUserPage {
  constructor(page) {
    this.page = page;

    // campos obligatorios
    // this.firstname = "#firstname";
    // this.lastname = "#lastname";
    // this.login = "#login";
    // this.email = "#email";
    // this.password = "#password";
    this.selfManagerButton = "#cmdSelfManager";
    this.selectManagerButton = "#cmdSelectManager";
    this.managerField = "#txtManager";

    // campos obligatorios (compatibles para "crear" y "editar")
    this.firstname = page.locator('input[name="firstname"], #firstname');
    this.lastname = page.locator('input[name="lastname"], #lastname');
    this.login = page.locator('input[name="login"], #login');
    this.email = page.locator('input[name="email"], #email');
    this.password = page.locator('input[name="password"], #password');
    this.confirmPassword = page.locator('input[name="confirmPassword"], #confirmPassword');

    // campo role
    this.roleSelect = 'select[name="role[]"]';

    // otros campos opcionales
    this.contractSelect = "#contract";
    this.entitySelectButton = "#cmdSelectEntity";
    this.entityText = "#txtEntity";
    this.positionSelectButton = "#cmdSelectPosition";
    this.positionText = "#txtPosition";
    this.dateHired = "#viz_datehired";
    this.identifier = 'input[name="identifier"]';
    this.languageSelect = 'select[name="language"]';
    this.timezoneSelect = "#timezone";

    //botones principales
    this.createButton = "#send";
    this.cancelButton = 'a.btn.btn-danger';

    //modal general de mensajes (bootbox)
    this.modalBody = ".bootbox.modal.in .modal-body";
    this.modalOkButton = ".bootbox.modal.in .btn-primary";

    //modal de selección de manager
    this.managerModal = "#frmSelectManager";
    this.managerRows = "#employees tbody tr";
    this.managerConfirmButton = `${this.managerModal} .modal-footer .btn:first-child`;

    //entity
    this.entitySelectButton = "#cmdSelectEntity";
    this.entityModal = "#frmSelectEntity";
    this.entityOkButton = '#frmSelectEntity .modal-footer a:has-text("OK")';
    this.entityCancelButton = '#frmSelectEntity .modal-footer a:has-text("Cancel")';
    this.entityText = "#txtEntity";
  }

  async selectEntity(){
    await this.page.click(this.entitySelectButton);
  }

  async closeEntityModalWithCancel() {
    await this.page.click(this.entityCancelButton);
  }

  async cancelButtonEdit() {
    await this.page.click(this.cancelButton);
  }

  async fillForm({
    firstname,
    lastname,
    login,
    email,
    password,
    role = "user",
    selfManager = true,
    contract,
    identifier,
    language,
    timezone,
  }) {
    // await this.page.fill(this.firstname, firstname);
    // await this.page.fill(this.lastname, lastname);
    // await this.page.fill(this.login, login);
    // await this.page.fill(this.email, email);
    await this.firstname.fill(firstname);
    await this.lastname.fill(lastname);
    await this.login.fill(login);
    await this.email.fill(email);

    if (selfManager) {
      await this.page.click(this.selfManagerButton);
    } else {
      await this.selectManagerByIndex(0); // selecciona el primero del modal
    }

    // await this.page.fill(this.password, password);
    await this.password.fill(password);


    // cambiar role si se envía uno distinto a "user"
    if (role && role !== "user") {
      await this.page.selectOption(this.roleSelect, { label: role });
    }

    if (contract) await this.page.selectOption(this.contractSelect, contract);
    if (identifier) await this.page.fill(this.identifier, identifier);
    if (language) await this.page.selectOption(this.languageSelect, language);
    if (timezone) await this.page.selectOption(this.timezoneSelect, timezone);

    await this.page.click(this.createButton);

    // cambie esto - daba error se lo puse a esto
    await this.page.waitForURL("**/users");

    // // por esto si da problemas en list users spec
    // await Promise.race([
    //   this.page.waitForURL("**/users", { timeout: 5000 }),
    //   this.page.waitForSelector(".bootbox.modal.fade.in", { timeout: 5000 }).catch(() => null)
    // ]);
  }

  async selectManagerByIndex(index = 0) {
    await this.page.click(this.selectManagerButton);
    await this.page.waitForSelector(this.managerModal);
    const rows = await this.page.locator(this.managerRows).all();
    if (rows.length > 0) {
      await rows[index].click();
    }
    await this.page.click(this.managerConfirmButton);
    await this.page.waitForSelector(this.managerModal, { state: "hidden" });
  }

  async mandatoryPasswordField() {
    await this.page.click(this.createButton);
    return await this.handleModalMessage();
  }

  async mandatoryEmailField(password) {
    // await this.page.fill(this.password, password);
    await this.password.fill(password);

    await this.page.click(this.selfManagerButton);
    await this.page.click(this.createButton);
    return await this.handleModalMessage();
  }

  async mandatoryLoginField(password, email) {
    // await this.page.fill(this.password, password);
    await this.password.fill(password);

    await this.page.click(this.selfManagerButton);
    // await this.page.fill(this.email, email);
    await this.email.fill(email);

    await this.page.click(this.createButton);
    return await this.handleModalMessage();
  }

  async mandatoryLastnameField(password, email, login) {
    // await this.page.fill(this.password, password);
    await this.password.fill(password);

    await this.page.click(this.selfManagerButton);
    // await this.page.fill(this.email, email);
    await this.email.fill(email);

    // await this.page.fill(this.login, login);
    await this.login.fill(login);

    await this.page.click(this.createButton);
    return await this.handleModalMessage();
  }

  async mandatoryFirstnameField(password, email, login, lastname) {
    // await this.page.fill(this.password, password);
    await this.password.fill(password);

    await this.page.click(this.selfManagerButton);
    // await this.page.fill(this.email, email);
    await this.email.fill(email);

    // await this.page.fill(this.login, login);
    await this.login.fill(login);

    // await this.page.fill(this.lastname, lastname);
    await this.lastname.fill(lastname);

    await this.page.click(this.createButton);
    return await this.handleModalMessage();
  }

  async handleModalMessage() {
    await this.page.waitForSelector(this.modalBody);
    const message = await this.page.textContent(this.modalBody);
    await this.page.click(this.modalOkButton);
    return message.trim();
  }

  async openManagerModal() {
    await this.page.click(this.selectManagerButton);
    await this.page.waitForSelector(this.managerModal);
  }

  async closeManagerModalWithX() {
    await this.openManagerModal();
    await this.page.click(`${this.managerModal} .modal-header .close`);
    // await this.page.waitForSelector(this.managerModal, { state: "hidden" });
    await this.page.waitForTimeout(1000); // espera breve para animación
    await this.page.waitForSelector(this.managerModal, { state: "hidden", timeout: 10000 });
  }

  async closeManagerModalWithCancel() {
    await this.openManagerModal();
    await this.page.click(`${this.managerModal} .modal-footer .btn:last-child`);
    // await this.page.waitForSelector(this.managerModal, { state: "hidden" });
    await this.page.waitForTimeout(1000); // espera breve para animación
    await this.page.waitForSelector(this.managerModal, { state: "hidden", timeout: 10000 });
  }

  async searchManager(term) {
    await this.openManagerModal();
    await this.page.fill(`${this.managerModal} input[type="search"]`, term);
    await this.page.waitForTimeout(500); // para dejar que filtre
    const rows = await this.page.locator(this.managerRows).allTextContents();
    return rows;
  }

  // async selectEntityByIndex(index = 0) {
  //   await this.page.click(this.entitySelectButton);
  //   await this.page.waitForSelector("#frmSelectEntity", { state: "visible" });

  //   const entities = await this.page.locator("#organization li a").all();
  //   if (entities.length === 0) {
  //     throw new Error("No hay entidades disponibles para seleccionar");
  //   }

  //   await entities[index].click(); // selecciona la entidad
  //   await this.page.click('#frmSelectEntity .modal-footer a:has-text("OK")');
  //   await this.page.waitForSelector("#frmSelectEntity", { state: "hidden" });
  // }

  async selectEntityByIndex(index = 0) {
    await this.page.click(this.entitySelectButton);
    await this.page.waitForSelector(this.entityModal, { state: "visible" });

    // Esperar que el árbol cargue al menos un nodo (hasta 5s)
    await this.page.waitForSelector("#organization li a", { timeout: 5000 });

    const entities = await this.page.locator("#organization li a").all();
    if (entities.length === 0) {
      throw new Error("No hay entidades disponibles para seleccionar (revisa datos o carga del árbol)");
    }

    await entities[index].click(); // selecciona la entidad
    await this.page.click(this.entityOkButton);
    await this.page.waitForSelector(this.entityModal, { state: "hidden" });
  }


  async fillFirstname(value) {
    await this.firstname.fill(value);
  }

  async fillLastname(value) {
    await this.lastname.fill(value);
  }

  async fillLogin(value) {
    await this.login.fill(value);
  }

  async fillPassword(value) {
    await this.password.fill(value);
  }

  async fillConfirmPassword(value) {
    await this.confirmPassword.fill(value);
  }

  async clickCreateUser() {
    await this.page.locator(this.createButton).click();
  }

  async clickSendOrUpdate() {
    const hasSend = await this.page.locator("#send").count();

    if (hasSend > 0) {
      await this.page.click("#send"); //pagina de crear
    } else {
      await this.page.click('button.btn.btn-primary[type="submit"]'); //pagina de editar
    }
  }

  async getErrorMessages() {
    return await this.page.$$eval("div.span12 p", els =>
      els.map(el => el.textContent.trim()).filter(text => text.length > 0)
    );
  }

}










