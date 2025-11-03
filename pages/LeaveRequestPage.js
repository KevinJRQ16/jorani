export class LeaveRequestPage {
  constructor(page) {
    this.page = page;
    this.leaveTypeSelect = '#type';
    this.startDateInput = '#viz_startdate';
    this.startDateTypeSelect = '#startdatetype';
    this.endDateInput = '#viz_enddate';
    this.endDateTypeSelect = '#enddatetype';
    this.durationInput = '#duration';
    this.causeTextarea = 'textarea[name="cause"]';
    this.plannedButton = 'button[name="status"][value="1"]';
    this.requestedButton = 'button[name="status"][value="2"]';
    this.cancelButton = 'a.btn.btn-danger';
    this.alertExceed = '#lblCreditAlert';
    this.alertOverlap = '#lbl0verlappingAlert';
    this.alertDayOff = '#lbl0verlappingDayOffAlert';
    this.csrfToken = 'input[name="csrf_test_jorani"]';
    this.modalBody = ".bootbox.modal.in .modal-body";
    this.modalOkButton = ".bootbox.modal.in .btn-primary";
  }

  async selectLeaveType(typeText) {
    await this.page.selectOption(this.leaveTypeSelect, { label: typeText });
  }

  async selectStartDate() {
    const today = new Date();
    today.setDate(today.getDate() + 1); 
    const day = today.getDate().toString();
    const month = today.getMonth().toString(); 
    const year = today.getFullYear().toString();

    await this.page.click(this.startDateInput);
    await this.page.waitForSelector("#ui-datepicker-div", { state: "visible" });

    await this.page.selectOption(".ui-datepicker-year", year);
    await this.page.selectOption(".ui-datepicker-month", month);

    const dayLocator = this.page.locator(`#ui-datepicker-div td a`, { hasText: day });
    await dayLocator.first().click();
  }

  async selectEndDatePassed() {
    const today = new Date();
    today.setDate(today.getDate() - 10); 
    const day = today.getDate().toString();
    const month = today.getMonth().toString(); 
    const year = today.getFullYear().toString();

    await this.page.click(this.startDateInput);
    await this.page.waitForSelector("#ui-datepicker-div", { state: "visible" });

    await this.page.selectOption(".ui-datepicker-year", year);
    await this.page.selectOption(".ui-datepicker-month", month);

    const dayLocator = this.page.locator(`#ui-datepicker-div td a`, { hasText: day });
    await dayLocator.first().click();
  }

  async selectEndDate() {
    const today = new Date();
    today.setDate(today.getDate() + 6); 
    const day = today.getDate().toString();
    const month = today.getMonth().toString();
    const year = today.getFullYear().toString();

    await this.page.click(this.endDateInput);
    await this.page.waitForSelector("#ui-datepicker-div", { state: "visible" });

    await this.page.selectOption(".ui-datepicker-year", year);
    await this.page.selectOption(".ui-datepicker-month", month);

    const dayLocator = this.page.locator(`#ui-datepicker-div td a`, { hasText: day });
    await dayLocator.first().click();
  }

  async setStartDate(date, partOfDay = "Morning") {
    await this.page.fill(this.startDateInput, date);
    await this.page.selectOption(this.startDateTypeSelect, partOfDay);
  }

  async setEndDate(date, partOfDay = "Afternoon") {
    await this.page.fill(this.endDateInput, date);
    await this.page.selectOption(this.endDateTypeSelect, partOfDay);
  }

  async setCause(text) {
    await this.page.fill(this.causeTextarea, text);
  }

  async getDuration() {
    return await this.page.inputValue(this.durationInput);
  }

  async submitPlanned() {
    await this.page.dblclick(this.plannedButton);
  }

  async submitRequested() {
    await this.page.dblclick(this.requestedButton);
  }

  async cancel() {
    await this.page.click(this.cancelButton);
  }

  async isAlertVisible(selector) {
    return await this.page.locator(selector).isVisible();
  }

  async mandatoryDurationField() {
    await this.page.click(this.requestedButton);
    //esperar que aparezca el modal
    await this.page.waitForSelector(this.modalBody, { timeout: 10000 });
    //esperar un poco extra por animación o renderizado interno
    await this.page.waitForTimeout(500);
    //obtener el texto   
    const message = await this.page.textContent(this.modalBody);
    await this.page.click(this.modalOkButton);
    return message.trim();
  }

  async fieldEndDate() {
    // await this.page.click('#lblOverlappingAlert .close');
    await this.page.click(this.requestedButton);
    await this.page.dblclick(this.requestedButton);
  }

  async fieldEndDateEscape() {
    await this.page.click(this.requestedButton);
    // await this.page.click('#lblOverlappingAlert .close');
    await this.page.dblclick(this.requestedButton);
  }

  async mandatoryStartDateField(durationInput, endDateInput) {
    await this.page.fill(this.durationInput, durationInput);
    await this.page.fill(this.endDateInput, endDateInput);
    await this.page.keyboard.press('Enter');
    await this.page.click(this.requestedButton);
    await this.page.waitForSelector(this.modalBody);
    const message = await this.page.textContent(this.modalBody);
    await this.page.click(this.modalOkButton);
    return message.trim();

  }

  async mandatoryEndDateField(durationInput, startDateInput) { 
    await this.page.fill(this.durationInput, durationInput);
    await this.page.fill(this.startDateInput, startDateInput);
    await this.page.keyboard.press('Enter');
    await this.page.click(this.requestedButton);
    await this.page.waitForSelector(this.modalBody);
    const message = await this.page.textContent(this.modalBody);
    await this.page.click(this.modalOkButton);
    return message.trim();
  }

  async deleteDurationField() {
    // await this.page.fill(this.durationInput, "");
    const input = this.page.locator(this.durationInput);
    await input.click({ clickCount: 3 });       // selecciona todo
    await this.page.keyboard.press('Backspace'); // borra
    await this.page.waitForTimeout(200);         // da tiempo a que se procese
    await input.blur(); 
  }

  async modifyDurationField(duration) {
    await this.page.fill(this.durationInput, duration);
    await this.page.click(this.requestedButton);
  }
    
}
