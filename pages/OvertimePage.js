import { expect } from "@playwright/test";

export class OvertimePage {
  constructor(page) {
    this.page = page;

    this.showSelect = "select[name='overtime_length']"

    this.overtimeTable = "#overtime";
    this.tableRows = `${this.overtimeTable} tbody tr`;
    this.tableHeader = `${this.overtimeTable} thead`;
    this.infoText = "#overtime_info";
    this.emptyRow = ".dataTables_empty";

    this.showSelect = "select[name='overtime_length']";

    this.searchInput = "#overtime_filter input[type='search']";

    this.nextButton = "#overtime_next:not(.disabled)";
    this.previousButton = "#overtime_previous:not(.disabled)";

    this.viewIcon = ".mdi-eye";
    this.viewLink = "a[title='view']";
    this.acceptLink = "a[title='accept']";
    this.rejectLink = "a[title='reject']";

    this.flashMessage = "#flashbox";
    this.flashCloseButton = "#flashbox button.close";

    this.exportButton = 'a[href*="/overtime/export/requested"]';
    this.allRequestsButton = 'a[href*="/overtime/all"]';
    this.pendingRequestsButton = 'a[href*="/overtime/requested"]';

    this.newRequestButton = "#create_overtime_request"; 
    this.newRequestModal = "#frmOvertimeRequest"; 
    this.newRequestFormSelector = this.newRequestModal; 

    this.deleteLinkSelector = "a[title='delete'], .btn-delete";

    this.tableCell = (rowIndex, colIndex) => `${this.overtimeTable} tbody tr:nth-child(${rowIndex + 1}) td:nth-child(${colIndex + 1})`;
  }

  async changeEntriesTo(number) {
    await this.page.selectOption(this.showSelect, number.toString());
    await this.page.waitForTimeout(800);
  }

  async hasSuccessMessage() {
    try {
      const alert = await this.page.waitForSelector(this.flashMessage, { timeout: 5000 });
      const text = (await alert.innerText()).trim();
      return (
        text.includes("The overtime request has been successfully accepted.") ||
        text.includes("The overtime request has been successfully rejected.") ||
        text.includes("successfully updated")
      );
    } catch {
      return false;
    }
  }

  async rejectFirstOvertime(commentText = "Rejected by automation") {
    await this.page.locator(this.rejectLink).first().click();
    const commentModal = this.page.locator(".bootbox.modal.fade.in, .modal.in, .modal.show");
    if (await commentModal.count() > 0) {
      const input = commentModal.locator("textarea, input[type='text'], input");
      if (await input.count() > 0) {
        await input.fill(commentText);
      }
      const primaryBtn = commentModal.locator(".btn.btn-primary, button[type='submit']");
      if (await primaryBtn.count() > 0) {
        await primaryBtn.first().click();
      } else {
        await this.page.keyboard.press("Enter");
      }
    }
    await this.page.waitForTimeout(600);
  }

  async acceptFirstOvertime() {
    await this.page.locator(this.acceptLink).first().click();
    await this.page.waitForTimeout(600);
  }

  async sortBy(columnName) {
    const header = this.page.locator(`${this.tableHeader} th`, { hasText: columnName });
    await header.first().waitFor({ state: "visible" });
    await header.first().click();
    await this.page.waitForTimeout(500);
  }

  async exportOvertimes() {
    await this.page.locator(this.exportButton).click();
  }

  async showAllOvertimes() {
    await this.page.locator(this.allRequestsButton).click();
  }

  async showPendingOvertimes() {
    await this.page.locator(this.pendingRequestsButton).click();
  }

  async countAllOvertimes() {
    let totalCount = 0;
    let currentPage = 1;
    let hasNext = true;

    while (hasNext) {
      const rows = this.page.locator(this.tableRows);
      const rowsOnPage = await rows.count();
      totalCount += rowsOnPage;

      const next = this.page.locator(this.nextButton);
      hasNext = await next.isVisible();
      if (hasNext) {
        await next.click();
        await this.page.waitForTimeout(800);
        currentPage++;
      }
    }

    const displayedTotal = await this.getDisplayedTotal();
    return { totalCount, displayedTotal };
  }

  async getInfoTextSearchOvertime() {
    // return await this.page.locator(this.infoText).innerText();
    return (await this.page.textContent(this.emptyRow)).trim();
  }

  async goto() {
    await this.page.goto("http://localhost/overtime");
    await this.page.waitForSelector(this.overtimeTable);
  }

  async isTableVisible() {
    return await this.page.locator(this.overtimeTable).isVisible();
  }

  async searchOvertime(term) {
    await this.page.fill(this.searchInput, term);
    await this.page.waitForTimeout(800);
  }

  async toggleFilter(selector, value = true) {
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: "attached" });
    const isChecked = await locator.isChecked();
    if (isChecked !== value) {
      await locator.click();
      await this.page.waitForTimeout(600);
    }
  }

  async getRowCount() {
    const rows = await this.page.locator(this.tableRows).count();
    return rows;
  }

  async getFirstRowText() {
    const first = this.page.locator(`${this.tableRows}`).first();
    return (await first.textContent())?.trim() ?? "";
  }

  async getTableData() {
    const rows = this.page.locator(this.tableRows);
    const count = await rows.count();
    const data = [];
    for (let i = 0; i < count; i++) {
      const cells = await rows.nth(i).locator("td").allInnerTexts();
      data.push(cells.map(c => c.trim()));
    }
    return data;
  }

  async getRowDataByIndex(index) {
    const row = this.page.locator(this.tableRows).nth(index);
    const cells = await row.locator("td").allInnerTexts();
    return cells.map(c => c.trim());
  }

  async getFirstRowId() {
    const firstRow = this.page.locator(`${this.tableRows}`).first();
    const idText = await firstRow.locator("td").first().locator("a").first().innerText();
    return idText.trim();
  }

  async openFirstOvertimeDetails() {
    await this.page.locator(this.viewLink).first().click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async deleteFirstPlannedRequest() {
    const rowsCount = await this.page.locator(this.tableRows).count();
    for (let i = 0; i < rowsCount; i++) {
      const status = (await this.page.locator(`${this.tableRows} >> nth=${i}`).locator("td").nth(4).innerText()).trim();
      if (status.toLowerCase() === "planned") {
        const deleteBtn = this.page.locator(`${this.tableRows} >> nth=${i} a[title='delete'], ${this.tableRows} >> nth=${i} .btn-delete`);
        if (await deleteBtn.count() > 0) {
          await deleteBtn.first().click();
          const confirmBtn = this.page.locator(".modal-footer a.btn.btn-danger, .confirm-delete, button.confirm");
          if (await confirmBtn.count() > 0) {
            await confirmBtn.first().click();
          }
          await this.page.waitForTimeout(600);
          return true;
        }
      }
    }
    return false;
  }

  async goToNextPage() {
    const next = this.page.locator(this.nextButton);
    if (await next.isVisible()) {
      await next.click();
      await this.page.waitForTimeout(700);
      return true;
    }
    return false;
  }

  async goToPreviousPage() {
    const prev = this.page.locator(this.previousButton);
    if (await prev.isVisible()) {
      await prev.click();
      await this.page.waitForTimeout(700);
      return true;
    }
    return false;
  }

  async getDisplayedTotal() {
    const text = await this.page.locator(this.infoText).innerText().catch(() => "");
    const match = text.match(/of\s+(\d+)\s+entries/i);
    return match ? parseInt(match[1], 10) : 0;
  }

  async logAllOvertimesDetails() {
    let pageIndex = 1;
    let hasNext = true;
    while (hasNext) {
      const rows = this.page.locator(this.tableRows);
      const count = await rows.count();
      console.log(`Pagina ${pageIndex} -> ${count} filas`);
      for (let i = 0; i < count; i++) {
        const cells = await rows.nth(i).locator("td").allInnerTexts();
        console.log(`fila ${i + 1}: ${cells.join(" | ")}`);
      }
      const next = this.page.locator(this.nextButton);
      hasNext = await next.isVisible();
      if (hasNext) {
        await next.click();
        await this.page.waitForTimeout(700);
        pageIndex++;
      }
    }
  }

  async expectFlashMessageContains(text) {
    await expect(this.page.locator(this.flashMessage)).toContainText(text);
  }

  async getFlashMessage() {
    return (await this.page.locator(this.flashMessage).innerText()).trim();
  }

  async closeFlashMessageIfVisible() {
    const flash = this.page.locator(this.flashMessage);
    if (await flash.isVisible()) {
      const closeBtn = flash.locator("button.close");
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
        await this.page.waitForTimeout(300);
      }
    }
  }

  async isFlashMessageVisible() {
    return await this.page.locator(this.flashMessage).isVisible();
  }

  async getInfoText() {
    return await this.page.locator(this.infoText).innerText().catch(() => "");
  }

  async getEmptyMessage() {
    return await this.page.locator(this.emptyRow).textContent().then(t => (t ? t.trim() : ""));
  }

  async getAllVisibleOvertimes() {
    await this.page.waitForSelector(this.overtimeTable);
    const rows = this.page.locator(this.tableRows);
    const rowCount = await rows.count();
    const all = [];
    for (let i = 0; i < rowCount; i++) {
      const cells = await rows.nth(i).locator("td").allInnerTexts();
      all.push(cells.map(c => c.trim()));
    }
    return all;
  }
}
