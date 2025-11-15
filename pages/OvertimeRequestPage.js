export class OvertimeRequestPage {
  constructor(page) {
    this.page = page;
    //campos principales
    this.dateInput = '#viz_date';
    this.hiddenDateInput = '#date';
    this.durationInput = '#duration';
    this.reasonTextarea = '#cause';
    this.statusSelect = 'select[name="status"]';
    this.requestButton = '#cmdCreateExtra';
    this.cancelButton = 'a.btn.btn-danger';
    this.csrfToken = 'input[name="csrf_test_jorani"]';

    //modal de validaciones
    this.modalBody = '.bootbox.modal.in .modal-body';
    this.modalOkButton = '.bootbox.modal.in .btn-primary';

    this.extrasTable = "#extras";
    this.tableRows = `${this.extrasTable} tbody tr`;
    this.tableHeader = `${this.extrasTable} thead`;
  }

  async selectDate(daysAhead = 1) {
    const today = new Date();
    today.setDate(today.getDate() + daysAhead);
    const day = today.getDate().toString();
    const month = today.getMonth().toString();
    const year = today.getFullYear().toString();

    await this.page.click(this.dateInput);
    await this.page.waitForSelector('#ui-datepicker-div', { state: 'visible' });
    await this.page.selectOption('.ui-datepicker-year', year);
    await this.page.selectOption('.ui-datepicker-month', month);

    const dayLocator = this.page.locator(`#ui-datepicker-div td a`, { hasText: day });
    await dayLocator.first().click();
  }

  async setDate(dateValue) {
    await this.page.fill(this.dateInput, dateValue);
  }


  async setDuration(durationValue) {
    await this.page.fill(this.durationInput, durationValue);
  }

  async setReason(reasonText) {
    await this.page.fill(this.reasonTextarea, reasonText);
  }

  async selectStatus(statusText) {
    await this.page.selectOption(this.statusSelect, { label: statusText });
  }

  async submitRequest() {
    await this.page.click(this.requestButton);
  }

  async submitRequestDbl() {
    await this.page.dblclick(this.requestButton);
  }

  async cancel() {
    await this.page.click(this.cancelButton);
  }

  async getMandatoryFieldAlert() {
    await this.page.waitForSelector(this.modalBody, { timeout: 10000 });
    const message = await this.page.textContent(this.modalBody);
    await this.page.click(this.modalOkButton);
    return message.trim();
  }

  async mandatoryAllFields() {
    await this.page.click(this.requestButton);
    await this.page.waitForSelector(this.modalBody);
    const message = await this.page.textContent(this.modalBody);
    await this.page.click(this.modalOkButton);
    return message.trim();
  }

  async clearDuration() {
    const input = this.page.locator(this.durationInput);
    await input.click({ clickCount: 3 });
    await this.page.keyboard.press('Backspace');
    await this.page.waitForTimeout(200);
    await input.blur();
  }

  async createOvertimeRequest({ dateOffset = 1, duration, reason, status }) {
    await this.selectDate(dateOffset);
    await this.setDuration(duration);
    await this.setReason(reason);
    await this.selectStatus(status);
    await this.submitRequest();
  }

  async sortBy(columnName) {
    const header = this.page.locator(`${this.tableHeader} th`, { hasText: columnName });
    await header.first().waitFor({ state: "visible" });
    await header.first().dblclick();
    await this.page.waitForTimeout(500);
  }
}
