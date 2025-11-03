import { expect } from "@playwright/test";

export class RequestsPage {
  constructor(page) {
    this.page = page;

    //filtros
    this.leaveTypeSelect = "#cboLeaveType";
    this.chkPlanned = "#chkPlanned";
    this.chkAccepted = "#chkAccepted";
    this.chkRequested = "#chkRequested";
    this.chkRejected = "#chkRejected";
    this.chkCancellation = "#chkCancellation";
    this.chkCanceled = "#chkCanceled";

    //tabla
    this.requestsTable = "#leaves";
    this.requestRows = `${this.requestsTable} tbody tr`;
    this.acceptLink = ".lnkAccept";
    this.rejectLink = ".lnkReject";
    this.viewLink = ".mdi-eye";
    this.historyLink = ".show-history";

    //elementos dinamicos
    this.flashMessage = "#flashbox";
    this.commentModal = ".bootbox.modal.fade.in";
    this.commentInput = `${this.commentModal} input`;
    this.commentRejectButton = `${this.commentModal} .btn.btn-primary`;
    this.commentCancelButton = `${this.commentModal} .btn.null`;

    //botones inferiores
    this.exportButton = 'a[href*="/requests/export"]';
    this.allRequestsButton = 'a[href*="/requests/all"]';
    this.pendingRequestsButton = 'a[href*="/requests/requested"]';

    //botones
    this.nextButton = ".paginate_button.next:not(.disabled)";

    this.infoText = "#leaves_info";


    //historial 
    this.historyLink = ".show-history";
    this.historyModal = "#frmShowHistory";
    this.historyModalBody = "#frmShowHistoryBody";
    this.historyTable = "#leaveshistory tbody tr";
    this.historyOkButton = `${this.historyModal} .btn`;

    // show
    this.showSelect = "select[name='leaves_length']";

    //search
    this.searchInput = "#leaves_filter input[type='search']";



  }

  async goto() {
    await this.page.goto("http://localhost/requests");
    await this.page.waitForSelector(this.requestsTable);
  }

  // //filtros
  // async filterByType(typeText) {
  //   await this.page.selectOption(this.leaveTypeSelect, { label: typeText });
  // }
  async filterByType(typeText) {
    const select = this.page.locator(this.leaveTypeSelect);
    await select.waitFor({ state: "visible" });
    await select.selectOption({ label: typeText });

    //dispara manualmente el evento "change" jorani lo usa para recargar la tabla
    await this.page.evaluate((selector) => {
      const el = document.querySelector(selector);
      el && el.dispatchEvent(new Event("change", { bubbles: true }));
    }, this.leaveTypeSelect);

    await this.page.waitForTimeout(1500);
  }

  async toggleFilter(filterId, value = true) {
    const locator = this.page.locator(filterId);
    const isChecked = await locator.isChecked();
    if (isChecked !== value) {
      await locator.click();
    }
  }

  async getRequestRowsCount() {
    return await this.page.locator(this.requestRows).count();
  }

  async desactiveFilterCancelation() {
    await this.toggleFilter(this.chkCancellation, false);
  }

  async getFirstRequestId() {
    // // return await this.page.locator(`${this.requestRows} td a`).first().innerText();
    // const id = await this.page.locator(`${this.requestRows} td:first-child`).first().innerText();
    // return id.trim();
    // Espera a que al menos una fila esté visible
    await this.page.waitForSelector(`${this.requestsTable} tbody tr`, { state: "visible" });

    //toma el texto de la primera celda (columna ID) de la primera fila de la tabla
    const firstRow = this.page.locator(`${this.requestsTable} tbody tr`).first();
    const firstIdCell = firstRow.locator("td").first();
    const id = await firstIdCell.innerText();

    console.log("ID detectado de la primera fila visible:", id);
    return id.trim();
  }

  async acceptFirstRequest() {
    await this.page.locator(this.acceptLink).first().click();
    await this.page.waitForSelector(this.flashMessage);
    const message = await this.page.locator(this.flashMessage).innerText();
    return message;
  }

  async rejectFirstRequest(commentText = "Reason for rejection") {
    await this.page.locator(this.rejectLink).first().click();
    await this.page.waitForSelector(this.commentModal);
    await this.page.fill(this.commentInput, commentText);
    await this.page.click(this.commentRejectButton);
    await this.page.waitForSelector(this.flashMessage);
    const message = await this.page.locator(this.flashMessage).innerText();
    return message;
  }

  async cancelRejection() {
    await this.page.locator(this.rejectLink).first().click();
    await this.page.waitForSelector(this.commentModal);
    await this.page.click(this.commentCancelButton);
    await this.page.waitForSelector(this.commentModal, { state: "hidden" });
  }

  async openFirstRequestDetails() {
    await this.page.locator(this.viewLink).first().click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  // --- Validaciones ---
  async expectFlashMessageContains(text) {
    await expect(this.page.locator(this.flashMessage)).toContainText(text);
  }

  // --- Acciones adicionales ---
  async exportRequests() {
    await this.page.locator(this.exportButton).click();
  }

  async showAllRequests() {
    await this.page.locator(this.allRequestsButton).click();
  }

  async showPendingRequests() {
    await this.page.locator(this.pendingRequestsButton).click();
  }

  async getFirstRequestId() {
    const id = await this.page.locator(this.acceptLink).first().getAttribute("data-id");
    return id;
  }

  async countAllRequests() {
    let totalCount = 0;
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const rows = this.page.locator(this.requestRows);
      const rowCount = await rows.count();

      console.log(`página ${currentPage}: ${rowCount} filas`);

      totalCount += rowCount;

      const nextButton = this.page.locator(this.nextButton);
      hasNextPage = await nextButton.isVisible();

      if (hasNextPage) {
        await nextButton.click();
        await this.page.waitForTimeout(1000);
        currentPage++;
      }
    }

    const displayedTotal = await this.getDisplayedTotal();
    return { totalCount, displayedTotal };
  }

  async getDisplayedTotal() {
    const infoText = await this.page.locator(this.infoText).innerText();
    const match = infoText.match(/of\s+(\d+)\s+entries/i);
    return match ? parseInt(match[1], 10) : 0;
  }

  async logAllRequestsDetails() {
    let currentPage = 1;
    let hasNextPage = true;
    let count = 1;

    while (hasNextPage) {
      const rows = this.page.locator(this.requestRows);
      const rowCount = await rows.count();

      console.log(`pagina ${currentPage} - ${rowCount} solicitudes:`);

      for (let i = 0; i < rowCount; i++) {
        const cells = await rows.nth(i).locator("td").allInnerTexts();
        console.log(`solicitud #${count}: ${cells.join(" | ")}`);
        count++;
      }

      const nextButton = this.page.locator(this.nextButton);
      hasNextPage = await nextButton.isVisible();

      if (hasNextPage) {
        await nextButton.click();
        await this.page.waitForTimeout(1000);
        currentPage++;
      }
    }
  }

  async closeFlashMessageIfVisible() {
    const flash = this.page.locator(this.flashMessage);
    if (await flash.isVisible()) {
      await flash.locator("button.close").click();
      await expect(flash).toBeHidden();
    }
  }

  async isFlashMessageVisible() {
    const flash = this.page.locator(this.flashMessage);
    return await flash.isVisible();
  }

  async openFirstHistory() {
    await this.page.locator(this.historyLink).first().click();
    await this.page.waitForSelector(this.historyModal);
  }

  async isHistoryVisible() {
    return await this.page.locator(this.historyModal).isVisible();
  }

  async waitForHistoryContent() {
    await this.page.waitForSelector(this.historyTable);
  }

  async closeHistoryModal() {
    await this.page.locator(this.historyOkButton, { hasText: "OK" }).click();
    await this.page.waitForSelector(this.historyModal, { state: "hidden" });
  }

  async changeEntriesTo(number) {
    await this.page.selectOption(this.showSelect, number.toString());
    await this.page.waitForTimeout(1000); 
  }

  async searchLeave(term) {
    await this.page.fill(this.searchInput, term);
    // await this.page.waitForTimeout(5000); // esperar el refresco de la tabla
    await this.page.waitForSelector("#leaves tbody tr", { state: "visible" });
  }

  async getFirstRowText() {
    const firstRow = await this.page.locator("#leaves tbody tr:first-child");
    return firstRow.textContent();
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

}
