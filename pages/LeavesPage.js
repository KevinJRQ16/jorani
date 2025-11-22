// pages/LeavesPage.js
import { expect } from "@playwright/test";
import test from "node:test";

export class LeavesPage {
  constructor(page) {
    this.page = page;
    this.flashBox = "#flashbox";
    this.tableRows = "#leaves tbody tr";
    this.nextButton = "#leaves_next:not(.disabled)";
    this.infoText = "#leaves_info";

    //filtros
    this.leaveTypeDropdown = "#cboLeaveType";
    this.statusCheckboxes = {
      planned: "#chkPlanned",
      accepted: "#chkAccepted",
      requested: "#chkRequested",
      rejected: "#chkRejected",
      cancellation: "#chkCancellation",
      canceled: "#chkCanceled",
    };

    

    //show
    this.showSelect = "select[name='leaves_length']";

    //botones
    
    this.exportButton = 'a[href*="/leaves/export"]';
    // this.exportButton = this.page.locator('a.btn.btn-primary:has-text("Export this list")');

    // this.newRequestButton = 'a[href*="/leaves/create"]';
    this.newRequestButton = this.page.locator('a.btn.btn-primary:has-text("New request")');

    //search
    this.searchInput = "#leaves_filter input[type='search']";

    this.emptyRow = ".dataTables_empty";

    this.deleteIcon = "a.confirm-delete";               
    this.deleteModal = "#frmDeleteLeaveRequest";        
    this.deleteConfirmButton = "#lnkDeleteUser";  
  }

  async deleteFirstLeave() {
    await this.page.waitForSelector(this.tableRows);

    await this.page.locator(this.deleteIcon).first().click();

    // 3. Esperar modal visible
    const modal = this.page.locator(this.deleteModal);
    await expect(modal).toBeVisible();

    // 4. Clic en botón YES (confirmar eliminación)
    await this.page.locator(this.deleteConfirmButton).click();

    // // 5. Esperar a que aparezca mensaje de éxito
    // await this.page.waitForSelector(this.flashBox, { timeout: 5000 });

    // const flashMessage = (await this.page.locator(this.flashBox).innerText()).trim();

    // // 6. Validar que se eliminó correctamente
    // expect(flashMessage).toMatch(/successfully deleted|successfully cancelled/i);

    // return flashMessage;
  }

  async hasSuccessMessage() {
    try {
      const alert = await this.page.waitForSelector(this.flashBox, { timeout: 5000 });
      const text = (await alert.innerText()).trim();
      return (
        text.includes("The leave request has been successfully cancelled") ||
        text.includes("The reminder email was sent to the manager") ||
        text.includes("The leave request has been successfully updated") ||
        text.includes("This leave type already exists.") ||
        text.includes("The leave request has been successfully created")
      );
    } catch {
      return false;
    }
  }

  async searchLeave(term) {
    await this.page.fill(this.searchInput, term);
    await this.page.waitForSelector("#leaves tbody tr", { state: "visible" });
  }

  async getTableData() {
    const rows = await this.page.locator(`${this.tableRows}`);
    const data = [];
    for (let i = 0; i < await rows.count(); i++) {
      const rowText = await rows.nth(i).allTextContents();
      data.push(rowText);
    }
    return data;
  }

  async goToLeavesPage() {
    await this.page.goto("http://localhost/leaves");
    await this.page.waitForSelector(this.tableRows);
  }

  async getDisplayedTotal() {
    const infoText = await this.page.locator(this.infoText).innerText();
    const match = infoText.match(/of\s+(\d+)\s+entries/i);
    return match ? parseInt(match[1], 10) : 0;
  }

  async countAllLeaves() {
    let totalCount = 0;
    let currentPage = 1;
    let hasNext = true;

    while (hasNext) {
      const rows = this.page.locator(this.tableRows);
      const rowCount = await rows.count();
      console.log(`pagina ${currentPage}: ${rowCount} filas`);
      totalCount += rowCount;

      const next = this.page.locator(this.nextButton);
      hasNext = await next.isVisible();

      if (hasNext) {
        await next.click();
        await this.page.waitForTimeout(1000);
        currentPage++;
      }
    }

    return totalCount;
  }

  async logAllLeavesDetails() {
    let currentPage = 1;
    let hasNext = true;
    let count = 1;

    while (hasNext) {
      const rows = this.page.locator(this.tableRows);
      const rowCount = await rows.count();

      console.log(`Página ${currentPage} (${rowCount} filas):`);
      for (let i = 0; i < rowCount; i++) {
        const cells = await rows.nth(i).locator("td").allInnerTexts();
        console.log(`Solicitud ${count}: ${cells.join(" | ")}`);
        count++;
      }

      const next = this.page.locator(this.nextButton);
      hasNext = await next.isVisible();

      if (hasNext) {
        await next.click();
        await this.page.waitForTimeout(1000);
        currentPage++;
      }
    }
  }

  async filterByType(typeValue) {
    await this.page.selectOption(this.leaveTypeDropdown, { label: typeValue });
    await this.page.waitForTimeout(500);
  }

  async toggleStatus(status, enable = true) {
    //desactivar todos los filtros 1ro
    for (const key of Object.keys(this.statusCheckboxes)) {
      const locator = this.page.locator(this.statusCheckboxes[key]);
      const isChecked = await locator.isChecked();
      if (isChecked) await locator.uncheck();
    }

    //activar solo el filtro deseado
    const target = this.statusCheckboxes[status.toLowerCase()];
    if (!target) {
      throw new Error(`Filtro '${status}' no encontrado en statusCheckboxes`);
    }

    const targetLocator = this.page.locator(target);
    const isChecked = await targetLocator.isChecked();
    if (enable && !isChecked) await targetLocator.check();
    if (!enable && isChecked) await targetLocator.uncheck();

    await this.page.waitForTimeout(1500);
  }

  async verifyValidStatuses() {
    const validStatuses = ["accepted", "rejected", "requested", "planned", "cancellation", "canceled"];
    const rows = this.page.locator(this.tableRows);
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const status = await rows.nth(i).locator("span").innerText();
      console.log(`Estado fila ${i + 1}: ${status}`);
      expect(validStatuses).toContain(status.toLowerCase());
    }
  }

  async verifyMainButtonsVisible() {
    await expect(this.page.locator(this.exportButton)).toBeVisible();
    // await expect(this.page.locator(this.newRequestButton)).toBeVisible();
    await expect(this.newRequestButton).toBeVisible();
  }

  async changeEntriesTo(number) {
    await this.page.selectOption(this.showSelect, number.toString());
    await this.page.waitForTimeout(1000); 
  }

  async getRequestRowsCount() {
    return await this.page.locator(this.tableRows).count();
  }

  async getInfoTextSearch() {
    return await this.page.textContent(this.emptyRow);
  }
}
