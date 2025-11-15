export class UsersPage {
  constructor(page) {
    this.page = page;

    this.successAlert = "#flashbox";
    this.searchInput = "#users_filter input[type='search']";
    this.tableRows = "#users tbody tr";
    this.showSelect = "select[name='users_length']";
    this.nextButton = "#users_next";
    this.previousButton = "#users_previous";
    this.tableInfo = "#users_info";
    this.emptyRow = ".dataTables_empty";
    this.exportButton = 'a[href*="/users/export"]';
    // this.createUserButton = 'a[href*="/users/create"]';
    this.createUserButton = 'a[href*="/users/create"]';


    //modales
    this.deleteModal = "#frmConfirmDelete";
    this.resetPwdModal = "#frmResetPwd";
    this.deleteConfirmButton = `${this.deleteModal} .btn-primary`;

    this.usersTable = "#users";
    this.tableHeader = `${this.usersTable} thead`;

  }

  async sortBy(columnName) {
    const column = this.page.locator(`${this.tableHeader} th`, { hasText: columnName });

    await column.first().waitFor({ state: "visible" });

    await column.first().click();

    await this.page.waitForSelector(`${this.usersTable} tbody tr`, { state: "visible" });
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

  async clickCreateUser() {
    await this.createButton.click();
  }

  async searchUser(term) {
    await this.page.fill(this.searchInput, term);
    await this.page.waitForTimeout(1000); // pequeño delay para el refresco
  }

  async getRowCount() {
    const rows = await this.page.locator(this.tableRows);
    return await rows.count();
  }

  async changeEntriesTo(number) {
    await this.page.selectOption(this.showSelect, number.toString());
    await this.page.waitForTimeout(1000);
  }

  async goToNextPage() {
    await this.page.click(this.nextButton);
    await this.page.waitForTimeout(1000);
  }

  async goToPreviousPage() {
    await this.page.click(this.previousButton);
    await this.page.waitForTimeout(1000);
  }

  async getInfoText() {
    return (await this.page.textContent(this.tableInfo)).trim();
  }

  async getInfoTextSearch() {
    return (await this.page.textContent(this.emptyRow)).trim();
  }

  async getTableData() {
    const rows = await this.page.locator(this.tableRows);
    const data = [];
    for (let i = 0; i < await rows.count(); i++) {
      const cells = await rows.nth(i).locator("td").allTextContents();
      data.push(cells.map(cell => cell.trim()));
    }
    return data;
  }

  async hasSuccessMessage() {
    try {
      const alert = await this.page.waitForSelector(this.successAlert, { timeout: 5000 });
      const text = (await alert.innerText()).trim();
      return (
        text.includes("The user has been succesfully created") ||
        text.includes("El usuario se ha creado correctamente") ||
        text.includes("The leave request has been successfully created") ||
        text.includes("La solicitud de licencia se ha creado correctamente") ||
        text.includes("The password has been succesfully changed") ||
        text.includes("The user has been succesfully updated")
      );
    } catch {
      return false;
    }
  }

  async goToCreateUser() {
    const button = this.page
      .locator('a[href*="/users/create"]')
      .filter({ hasText: /create|crear/i })
      .filter({ has: this.page.locator(":visible") });
    await button.first().waitFor({ state: "visible", timeout: 10000 });
    await button.first().click();
    await this.page.waitForURL("**/users/create");
  }

  async clickExportList() {
    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      this.page.click(this.exportButton)
    ]);
    return download; 
  }

  async findUserRowByLogin(login) {
    return this.page.locator(`${this.tableRows}:has(td:has-text("${login}"))`);
  }

  async deleteUserByLogin(login) {
    const userRow = await this.findUserRowByLogin(login);
    if (await userRow.count() === 0) {
      throw new Error(`No se encontró el usuario con login: ${login}`);
    }

    const deleteButton = userRow.locator('a.confirm-delete');
    await deleteButton.click();

    await this.page.waitForSelector(this.deleteModal, { state: "visible" });
    await this.page.click(this.deleteConfirmButton);
    await this.page.waitForTimeout(1000);
  }

async resetPasswordByIndex(index = 1) {
  const userRows = this.page.locator('table tbody tr');
  const count = await userRows.count();

  if (count === 0) {
    throw new Error("No hay usuarios en la lista.");
  }

  if (index >= count) {
    throw new Error(`Solo hay ${count} usuarios, índice ${index} fuera de rango.`);
  }

  const userRow = userRows.nth(index);
  const resetButton = userRow.locator('a[title="reset password"]');
  await resetButton.click();

  await this.page.waitForSelector(this.resetPwdModal, { state: "visible" });
  await this.page.waitForTimeout(1000);
}

async changePasswordByIndex(index = 1, nuevaPassword = "Nueva123!") {
  const userRows = this.page.locator("table tbody tr");
  const count = await userRows.count();

  if (count === 0) {
    throw new Error("No hay usuarios en la lista.");
  }

  if (index >= count) {
    throw new Error(`Solo hay ${count} usuarios, índice ${index} fuera de rango.`);
  }

  const userRow = userRows.nth(index);
  const resetButton = userRow.locator('a[title="reset password"]');
  await resetButton.click();

  await this.page.waitForSelector(this.resetPwdModal, { state: "visible" });

  await this.page.fill('input[name="password"]', nuevaPassword);
  // await this.page.fill('input[name="confirmPassword"]', nuevaPassword);

  // await this.page.click('button[type="submit"]');
  await this.page.click(`${this.resetPwdModal} #send`);
}

  async deleteUserByLogin(login) {
  if (login.toLowerCase() === "admin") {
    throw new Error("No se puede eliminar al usuario administrador.");
  }

  let previousTable = "";
  let pageIndex = 1;

  while (true) {
    const currentTable = await this.page.locator("table").innerHTML();

    // Buscar el usuario en la página actual
    const userRow = await this.findUserRowByLogin(login);
    if (await userRow.count() > 0) {
      const deleteButton = userRow.locator("a.confirm-delete");
      await deleteButton.click();

      await this.page.waitForSelector(this.deleteModal, { state: "visible" });
      await this.page.click(`${this.deleteModal} #action-delete`);
      await this.page.waitForSelector(this.deleteModal, { state: "hidden" });
      await this.page.waitForTimeout(500);
      console.log(`usuario "${login}" eliminado en la página ${pageIndex}`);
      return;
    }

    const nextButton = this.page.locator("a.next");
    if ((await nextButton.count()) === 0) break;

    await nextButton.click();
    await this.page.waitForTimeout(800); // darle tiempo a recargar

    const newTable = await this.page.locator("table").innerHTML();
    if (newTable === currentTable || newTable === previousTable) {
      console.log("ultima página alcanzada.");
      break;
    }

    previousTable = currentTable;
    pageIndex++;
  }

  throw new Error(`No se encontró el usuario con login: ${login}`);
}

async userExists(login) {
  let previousTable = "";

  while (true) {
    const userRow = await this.findUserRowByLogin(login);
    if (await userRow.count() > 0) return true;

    const nextButton = this.page.locator("a.next");
    if ((await nextButton.count()) === 0) break;

    await nextButton.click();
    await this.page.waitForTimeout(800);

    const newTable = await this.page.locator("table").innerHTML();
    if (newTable === previousTable) break;
    previousTable = newTable;
  }

  return false;
}

  async goToEditUserByIndex(index = 1) { // índice 1 = segundo usuario
  const userRows = this.page.locator("table tbody tr");
  const count = await userRows.count();

  if (count === 0) throw new Error("No hay usuarios en la lista.");
  if (index >= count) throw new Error(`Solo hay ${count} usuarios, índice ${index} fuera de rango.`);

  const userRow = userRows.nth(index);

  const editButton = userRow.locator('a[title="edit user details"]');
  await editButton.waitFor({ state: "visible", timeout: 5000 });
  await editButton.click();

  await this.page.waitForURL("**/users/edit/**", { timeout: 10000 });
  await this.page.waitForTimeout(500);
}

async toggleActiveByIndex(index = 1) {
  const userRows = this.page.locator("table tbody tr");
  const count = await userRows.count();

  if (count === 0) {
    throw new Error("No hay usuarios en la lista.");
  }

  if (index >= count) {
    throw new Error(`Solo hay ${count} usuarios, índice ${index} fuera de rango.`);
  }

  const userRow = userRows.nth(index);

  const activeButton = userRow.locator('a[title="Active"]');
  const inactiveButton = userRow.locator('a[title="Inactive"]');

  if (await activeButton.count()) {
    console.log("Usuario actualmente activo → se desactivará");
    await activeButton.click();
  } else if (await inactiveButton.count()) {
    console.log("usuario actualmente inactivo → se activara");
    await inactiveButton.click();
  } else {
    throw new Error("no se encontro el boton Active/Inactive en la fila");
  }
  await this.page.waitForTimeout(1000);
}


async eliminarUltimoUsuario() {
  console.log("Buscando el último usuario...");

  for (let i = 0; i < 40; i++) { 
    const nextButton = this.page.locator("a.next");
    if (!(await nextButton.isVisible())) break;
    const disabled = await nextButton.getAttribute("class");
    if (disabled && disabled.includes("disabled")) break; 
    await nextButton.click();
    await this.page.waitForTimeout(800);
  }

  const rows = this.page.locator("table tbody tr");
  const count = await rows.count();

  if (count === 0) {
    console.log("no hay usuarios para eliminar.");
    return false;
  }

  const lastRow = rows.nth(count - 1);
  const login = await lastRow.locator("td:nth-child(3)").innerText();
  console.log(`eliminando último usuario con login: ${login}`);

  const deleteButton = lastRow.locator("a.confirm-delete");
  await deleteButton.click();

  await this.page.waitForSelector(this.deleteModal, { state: "visible", timeout: 10000 });
  await this.page.click(`${this.deleteModal} #action-delete`);
  await this.page.waitForSelector(this.deleteModal, { state: "hidden", timeout: 10000 });

  console.log("usuario eliminado correctamente.");
  return true;
}



}
