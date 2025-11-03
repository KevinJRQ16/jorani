// pages/LeaveTypesPage.js
export class LeaveTypesPage {
  constructor(page) {
    this.page = page;
    this.flashBox = "#flashbox";
    this.rows = "table tbody tr";

    //botones generales
    this.exportBtn = "a[href$='/leavetypes/export']";
    this.createBtn = "a[data-target='#frmAddLeaveType']";

    //modales
    this.addModal = "#frmAddLeaveType";
    this.editModal = "#frmEditLeaveType";
    this.deleteModal = "#frmDeleteLeaveType";

    //formularios
    this.createForm = "#formCreateLeaveType";
    this.editForm = "#formEditLeaveType";

    //campos comunes
    this.nameInput = "#name";
    this.acronymInput = "#acronym";
    this.deductCheckbox = "#deduct_days_off";
    this.createSubmit = "#cmdCreateLeaveType";
    this.updateSubmit = "#cmdEditLeaveType";

    //confirmar eliminación
    this.deleteConfirm = "#lnkDeleteLeaveType";
  }

  async waitForTable() {
    await this.page.waitForSelector(this.rows, { timeout: 10000 });
  }

  async hasSuccessMessage() {
    try {
      const alert = await this.page.waitForSelector(this.flashBox, { timeout: 5000 });
      const text = (await alert.innerText()).trim();
      return (
        text.includes("The leave type has been succesfully created.") ||
        text.includes("The leave type has been succesfully updated.") ||
        text.includes("The leave type has been succesfully deleted.") ||
        text.includes("This leave type already exists.")
      );
    } catch {
      return false;
    }
  }

  async createLeaveType(name, acronym, deduct = false) {
    await this.page.click(this.createBtn);
    await this.page.waitForSelector(this.addModal, { state: "visible" });

    await this.page.fill(`${this.addModal} ${this.nameInput}`, name);
    await this.page.fill(`${this.addModal} ${this.acronymInput}`, acronym);

    const checkbox = this.page.locator(`${this.addModal} ${this.deductCheckbox}`);
    if (deduct) {
      if (!(await checkbox.isChecked())) await checkbox.check();
    } else {
      if (await checkbox.isChecked()) await checkbox.uncheck();
    }

    await this.page.click(`${this.addModal} ${this.createSubmit}`);
    // await this.page.waitForSelector(this.addModal, { state: "hidden" });

    await this.hasSuccessMessage();
  }

  async cancelCreateModal() {
    await this.page.click(this.createBtn);
    await this.page.waitForSelector(this.addModal, { state: "visible" });

    const cancelBtn = this.page.locator(`${this.addModal} a.btn.btn-danger`, { hasText: "Cancel" });
    await cancelBtn.click();

    await this.page.waitForSelector(this.addModal, { state: "hidden" });
  }


  async editByIndex(index = 0, newName, newAcronym) {
    const row = this.page.locator(this.rows).nth(index);
    await row.locator("a[title='edit']").click();

    await this.page.waitForSelector(this.editModal, { state: "visible" });
    await this.page.fill(`${this.editModal} ${this.nameInput}`, newName);
    await this.page.fill(`${this.editModal} ${this.acronymInput}`, newAcronym);
    await this.page.click(`${this.editModal} ${this.updateSubmit}`);

    // await this.page.waitForSelector(this.editModal, { state: "hidden" });
    await this.hasSuccessMessage();
  }

  async deleteByIndex(index = 0) {
    const row = this.page.locator(this.rows).nth(index);
    await row.locator("a.confirm-delete").click();

    await this.page.waitForSelector(this.deleteModal, { state: "visible" });
    await this.page.click(this.deleteConfirm);
    await this.page.waitForSelector(this.deleteModal, { state: "hidden" });

    await this.hasSuccessMessage();
  }

  async deleteByName(name) {
    await this.waitForTable();
    const rows = this.page.locator(this.rows);
    const count = await rows.count();
    let found = false;

    for (let i = 0; i < count; i++) {
        const row = rows.nth(i);
        const nameCell = row.locator("td:nth-child(3)"); 
        const cellText = (await nameCell.innerText()).trim();

        if (cellText.toLowerCase().includes(name.toLowerCase())) {
        found = true;
        await row.locator("a.confirm-delete").click();
        await this.page.waitForSelector(this.deleteModal, { state: "visible" });
        await this.page.click(this.deleteConfirm);
        await this.page.waitForSelector(this.deleteModal, { state: "hidden" });
        break;
        }
    }

    // expect(found).toBeTruthy();
    
  }

  async hasDuplicateModal() {
    try {
      const modal = this.page.locator(".bootbox.modal.fade.in");
      await modal.waitFor({ state: "visible", timeout: 5000 });
      const text = (await modal.locator(".modal-body").innerText()).trim();

      // cerrar modal si aparece (deja la UI limpia)
      const okButton = modal.locator(".btn.btn-primary");
      await okButton.click();
      await modal.waitFor({ state: "hidden" });

      return text.includes("This leave type already exists.");
    } catch {
      return false;
    }
  }

  async exportList() {
    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      this.page.click(this.exportBtn),
    ]);
    const path = await download.path();
    console.log(`Archivo exportado: ${path}`);
    return path;
  }

  async getRowTexts() {
    return this.page.$$eval(this.rows, rows =>
      rows.map(r => r.innerText.trim())
    );
  }

  
}
