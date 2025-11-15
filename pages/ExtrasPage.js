import { expect } from "@playwright/test";

export class ExtrasPage {
  constructor(page) {
    this.page = page;

    this.extrasTable = "#extras";
    this.tableRows = `${this.extrasTable} tbody tr`;
    this.tableHeader = `${this.extrasTable} thead`;
    this.emptyRow = ".dataTables_empty";

    this.nextButton = "#extras_next";
    this.previousButton = "#extras_previous";
    this.infoText = "#extras_info";
    this.flashBox = "#flashbox";

    this.showSelect = "select[name='extras_length']";
    this.searchInput = "#extras_filter input[type='search']";
    this.exportButton = 'a[href*="/extra/export"]';
    this.newRequestButton = 'a[href*="/extra/create"]';

    this.deleteModal = "#frmDeleteExtraRequest";
    this.confirmDeleteButton = `${this.deleteModal} a.btn.btn-danger`;
    this.cancelDeleteButton = `${this.deleteModal} a.btn:not(.btn-danger)`;

    this.tableRows = page.locator("#extras tbody tr");
    this.modalDelete = page.locator("#frmDeleteExtraRequest");
    this.btnConfirmDelete = page.locator("#lnkDeleteUser");
    this.btnCancelDelete = page.locator("#frmDeleteExtraRequest a.btn:not(.btn-danger)");
  }

  async goToExtrasPage() {
    await this.page.goto("http://localhost/extra");
    await this.page.waitForSelector(this.tableRows, { state: "visible" });
  }

  async waitForTable() {
    await this.page.waitForSelector(this.extrasTable, { state: "visible", timeout: 10000 });
  }

  async sortBy(columnName) {
    const column = this.page.locator(`${this.tableHeader} th`, { hasText: columnName });
    await column.first().click();
    await this.page.waitForTimeout(500);
  }

  async searchExtra(term) {
    await this.page.fill(this.searchInput, term);
    await this.page.waitForTimeout(800);
  }

  async changeEntriesTo(number) {
    await this.page.selectOption(this.showSelect, number.toString());
    await this.page.waitForTimeout(800);
  }

  async hasSuccessMessage() {
    try {
      const alert = await this.page.waitForSelector(this.flashBox, { timeout: 4000 });
      const text = (await alert.innerText()).trim();
      return (
        text.includes("The overtime request has been succesfully created") ||
        text.includes("The overtime request has been succesfully deleted") ||
        text.includes("The overtime request has been succesfully updated") ||
        text.toLowerCase().includes("deleted") ||
        text.toLowerCase().includes("succesfully") ||
        text.toLowerCase().includes("creado") ||
        text.toLowerCase().includes("actualizado")
      );
    } catch {
      return false;
    }
  }

  async verifyMainButtonsVisible() {
    await expect(this.page.locator(this.exportButton)).toBeVisible();
    await expect(this.page.locator(this.newRequestButton)).toBeVisible();
  }

  // --- Paginación ---
  async goToNextPage() {
    const next = this.page.locator(this.nextButton);
    if (await next.isVisible() && !(await next.getAttribute("class") || "").includes("disabled")) {
      await next.click();
      await this.page.waitForTimeout(800);
    }
  }

  async goToPreviousPage() {
    const prev = this.page.locator(this.previousButton);
    if (await prev.isVisible() && !(await prev.getAttribute("class") || "").includes("disabled")) {
      await prev.click();
      await this.page.waitForTimeout(800);
    }
  }

  async countAllExtras() {
    let total = 0;
    let pageNum = 1;

    while (true) {
      const count = await this.page.locator(this.tableRows).count();
      total += count;

      const next = this.page.locator(this.nextButton);
      const disabled = (await next.getAttribute("class") || "").includes("disabled");
      if (!await next.isVisible() || disabled) break;

      await next.click();
      await this.page.waitForTimeout(800);
      pageNum++;
    }

    return total;
  }

  async getTableData() {
    await this.waitForTable();
    const rows = this.page.locator(this.tableRows);
    const count = await rows.count();
    const data = [];
    for (let i = 0; i < count; i++) {
      const cells = await rows.nth(i).locator("td").allInnerTexts();
      data.push(cells.map((c) => c.trim()));
    }
    return data;
  }

  async getInfoTextSearch() {
    if (await this.page.locator(this.emptyRow).isVisible()) {
      return (await this.page.textContent(this.emptyRow)).trim();
    }
    return "";
  }

  async getRowCount() {
    const rows = await this.page.locator(this.tableRows);
    return await rows.count();
  }

  async getRowStatus(rowIndex) {
    const status = await this.page
      .locator(this.tableRows)
      .nth(rowIndex)
      .locator("td:nth-child(5)")
      .innerText();
    return status.trim();
  }

  async getLatestExtraId() {
    await this.page.waitForSelector(this.tableRows);
    const firstRow = this.page.locator(this.tableRows).first();
    const id = await firstRow.locator("td:first-child").innerText();
    return id.trim();
  }

  async performActionByStatus(rowIndex, action) {
    const status = await this.getRowStatus(rowIndex);
    const actions = this.page.locator(this.tableRows).nth(rowIndex).locator(".pull-right a");

    switch (status) {
      case "Requested":
      case "Accepted":
        if (action === "view") {
          await actions.nth(0).click();
        } else {
          throw new Error(`No se puede ${action} una solicitud con estado ${status}`);
        }
        break;

      case "Planned":
        if (action === "view") await actions.nth(0).click();
        else if (action === "edit") await actions.nth(1).click();
        else if (action === "delete") await actions.nth(2).click();
        else throw new Error(`Acción desconocida: ${action}`);
        break;

      default:
        throw new Error(`Estado desconocido o no soportado: ${status}`);
    }
  }

  async confirmDelete() {
    await this.page.waitForSelector(this.deleteModal, { state: "visible" });
    await this.page.click(this.confirmDeleteButton);
    await this.page.waitForTimeout(1000);
  }

  async cancelDelete() {
    await this.page.waitForSelector(this.deleteModal, { state: "visible" });
    await this.page.click(this.cancelDeleteButton);
    await this.page.waitForTimeout(500);
  }

  async deleteIfPlannedById(id) {
    const row = this.page.locator(`${this.tableRows}:has(a[href*="/extra/extra/${id}"])`);
    if (await row.count() === 0) return false;
    const statusCell = row.locator("td").nth(4);
    const status = (await statusCell.textContent()).trim();
    if (status.toLowerCase() !== "planned") {
      throw new Error(`No es posible eliminar la solicitud ${id} porque su estado es "${status}"`);
    }

    const deleteButton = row.locator(`a.confirm-delete[data-id="${id}"]`);
    if (await deleteButton.count() === 0) throw new Error("No se encontró el botón de eliminar.");
    await deleteButton.first().click();

    await this.page.waitForSelector(this.deleteModal, { state: "visible" });
    await this.page.click(this.confirmDeleteButton);
    await this.page.waitForSelector(this.deleteModal, { state: "hidden" });
    await this.page.waitForTimeout(800);
    return true;
  }

  async getOvertimeIdByStatus(status) {
    const rows = this.tableRows;
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const cellStatus = await row.locator("td").nth(4).innerText();
      if (cellStatus.trim() === status) {
        return await row.locator("td").first().locator("a").first().innerText();
      }
    }
    return null;
  }

  async deleteOvertimeById(id) {
    await this.page.locator(`a.confirm-delete[data-id="${id}"]`).click();
    await this.modalDelete.waitFor({ state: "visible" });
    await this.btnConfirmDelete.click();
    await this.modalDelete.waitFor({ state: "hidden" });
  }

  async clickDeleteButton(id) {
    await this.page.locator(`a.confirm-delete[data-id="${id}"]`).click();
  }

  async isDeleteModalVisible() {
    // return await this.modalDelete.isVisible();
    try {
      await this.modalDelete.waitFor({ state: "visible", timeout: 4000 });
      return true;
    } catch {
      return false;
    }
  }

  async cancelDeleteModal() {
    await this.btnCancelDelete.click();
  }

  async isOvertimeVisible(id) {
    return await this.page.locator(`#extras a:has-text("${id}")`).count() > 0;
  }

  async canDeleteOvertime(id) {
    return await this.page.locator(`a.confirm-delete[data-id="${id}"]`).count() > 0;
  }

  async clickExportList() {
    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      this.page.click(this.exportButton)
    ]);
    return download; 
  }

  // async goToNewRequest() {
  //   const button = this.page.locator(this.newRequestButton).first();
  //   await button.waitFor({ state: "visible", timeout: 10000 });
  //   await button.click();
  //   await th
  //   is.page.waitForURL("**/extra/create");
  // }

  async goToNewRequest() {
    const newRequestButton = this.page.locator('a:has-text("New Request")');

    await newRequestButton.first().waitFor({ state: "visible", timeout: 15000 });
    await newRequestButton.first().scrollIntoViewIfNeeded();
    await newRequestButton.first().click({ force: true });

    await this.page.waitForURL("**/extras/create", { timeout: 10000 });
  }


  async goToCreateExtra() {
    const button = this.page.locator('a[href*="/extra/create"]');

    // Esperar que exista aunque esté oculto
    await button.first().waitFor({ state: "attached", timeout: 10000 });

    // Forzar scroll y visibilidad si está oculto
    await button.first().scrollIntoViewIfNeeded();

    // Si sigue oculto, usar click por JavaScript
    if (!(await button.first().isVisible())) {
      await this.page.evaluate((btn) => btn.click(), await button.first().elementHandle());
    } else {
      console.log(await button.first().evaluate((el) => el.outerHTML));
      await button.first().click();
    }

    // Confirmar redirección
    await this.page.waitForURL("**/extra/create");
  }


}
