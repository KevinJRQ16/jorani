import { expect } from "@playwright/test";
import { test } from "../fixtures/fixtures.js";
import { LeaveRequestPage } from "../pages/LeaveRequestPage.js";
import { HomePage } from "../pages/HomePage.js";
import leaveRequests from "../data/leaveRequests.json" assert { type: "json" };
import { LeavesPage } from "../pages/LeavesPage.js";
import { Logger, screenshotPath } from "../utils/helpers.js";

test("@exploratory @positive verificar creación exitosa de solicitud", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);
  const leaveRequest = new LeavesPage(loggedInPage);

  try {
    Logger.info("creando nueva solicitud");
    await home.goToCreateLeave();
    const data = leaveRequests.validLeave;
    await leave.selectLeaveType(data.type);
    await leave.selectStartDate();
    await leave.selectEndDate();
    await leave.setCause(data.cause);
    await leave.submitRequested();

    const hasMessage = await leaveRequest.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();
    Logger.info("solicitud creada exitosamente");
  } catch (error) {
    Logger.error(`error al crear solicitud: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_crear_solicitud") });
    throw error;
  }
});

test("@exploratory @positive verificar creación exitosa de solicitud planificada", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);
  const leaveRequest = new LeavesPage(loggedInPage);

  try {
    Logger.info("creando nueva solicitud planificada");
    await home.goToCreateLeave();
    const data = leaveRequests.validLeave;
    await leave.selectLeaveType(data.type);
    await leave.selectStartDate();
    await leave.selectEndDate();
    await leave.setCause(data.cause);
    await leave.submitPlanned();

    const hasMessage = await leaveRequest.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();
    Logger.info("solicitud planificada creada exitosamente");
  } catch (error) {
    Logger.error(`error al crear solicitud planificada: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_crear_solicitud_planificada") });
    throw error;
  }
});

test("@exploratory @negative verificar que en campo 'End Date' no se permita seleccionar una fecha anterior a 'start date'", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);

  try {
    Logger.info("verificando validación de fechas");
    await home.goToCreateLeave();
    const data = leaveRequests.invalidDate;
    await leave.selectLeaveType(data.type);
    await leave.selectStartDate();
    await leave.selectEndDatePassed();
    const message = await leave.mandatoryDurationField();
    expect(message).toContain("The field Duration is mandatory.");
    Logger.info("validación de fechas correcta");
  } catch (error) {
    Logger.error(`error al validar fecha anterior: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_fecha_anterior") });
    throw error;
  }
});

test("@exploratory @positive verificar que los campos obligatorios estén visibles", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);

  try {
    Logger.info("verificando visibilidad de campos obligatorios");
    await home.goToCreateLeave();
    await expect(leave.page.locator(leave.startDateInput)).toBeVisible();
    await expect(leave.page.locator(leave.endDateInput)).toBeVisible();
    await expect(leave.page.locator(leave.durationInput)).toBeVisible();
    Logger.info("campos obligatorios visibles correctamente");
  } catch (error) {
    Logger.error(`error al verificar campos obligatorios: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_campos_obligatorios") });
    throw error;
  }
});

test("@exploratory @positive verificar que al ingresar una fecha pasada en 'End Date' se actualiza al 'Start Date' y se guarda", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);
  const leaveRequest = new LeavesPage(loggedInPage);

  try {
    Logger.info("verificando actualización de fecha fin a inicio");
    await home.goToCreateLeave();
    const data = leaveRequests.invalidDate;
    await leave.selectLeaveType(data.type);
    await leave.selectStartDate();
    await leave.setEndDate(data.endDate);
    await loggedInPage.keyboard.press('Enter');
    await leave.fieldEndDate();
    const hasMessage = await leaveRequest.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();
    Logger.info("actualización de fecha fin verificada correctamente");
  } catch (error) {
    Logger.error(`error al actualizar fecha fin: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_actualizar_fecha_fin") });
    throw error;
  }
});

test("@exploratory @negative verificar que el campo 'Duration' sea obligatorio", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);

  try {
    Logger.info("verificando campo duration obligatorio");
    await home.goToCreateLeave();
    const message = await leave.mandatoryDurationField();
    expect(message).toContain("The field Duration is mandatory.");
    Logger.info("campo duration verificado correctamente");
  } catch (error) {
    Logger.error(`error al verificar campo Duration: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_campo_duration") });
    throw error;
  }
});

test("@exploratory @negative verificar que el campo 'Start Date' sea obligatorio", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);

  try {
    Logger.info("verificando campo Start Date obligatorio");
    await home.goToCreateLeave();
    const message = await leave.mandatoryStartDateField("5", leaveRequests.invalidDate.endDate);
    expect(message).toContain("The field Start Date is mandatory.");
    Logger.info("campo start date verificado correctamente");
  } catch (error) {
    Logger.error(`error al verificar campo Start Date: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_campo_start_date") });
    throw error;
  }
});

test("@exploratory @negative verificar que el campo 'End Date' sea obligatorio", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);

  try {
    Logger.info("verificando campo End Date obligatorio");
    await home.goToCreateLeave();
    const message = await leave.mandatoryEndDateField("5", leaveRequests.invalidDate.startDate);
    expect(message).toContain("The field End Date is mandatory.");
    Logger.info("campo end date verificado correctamente");
  } catch (error) {
    Logger.error(`error al verificar campo End Date: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_campo_end_date") });
    throw error;
  }
});

test("@exploratory @positive verificar que al ingresar una fecha pasada en 'End Date' y hacer escape se actualiza al 'Start Date' y se guarda correctamente", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);
  const leaveRequest = new LeavesPage(loggedInPage);

  try {
    Logger.info("verificando escape con fecha fin pasada");
    await home.goToCreateLeave();
    const data = leaveRequests.invalidDate;
    await leave.selectLeaveType(data.type);
    await leave.selectStartDate();
    await leave.setEndDate(data.endDate);
    await loggedInPage.keyboard.press('Escape');
    await leave.fieldEndDateEscape();
    const hasMessage = await leaveRequest.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();
    Logger.info("escape con fecha fin verificado correctamente");
  } catch (error) {
    Logger.error(`error al verificar escape con fecha fin: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_escape_fecha_fin") });
    throw error;
  }
});

test("@exploratory @negative verificar que una vez seleccionadas las fechas, al borrar duración no se permita guardar", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);

  try {
    Logger.info("verificando que no se guarde al borrar duración");
    await home.goToCreateLeave();
    const data = leaveRequests.invalidDate;
    await leave.selectLeaveType(data.type);
    await leave.selectStartDate();
    await leave.selectEndDate();
    await leave.deleteDurationField();
    const message = await leave.mandatoryDurationField();
    expect(message).toContain("The field Duration is mandatory.");
    Logger.info("borrado de duración verificado correctamente");
  } catch (error) {
    Logger.error(`error al borrar duración: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_borrar_duracion") });
    throw error;
  }
});

test.fail("@exploratory @negative verificar que una vez ingresadas las fechas modificar duración no permita guardar", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);
  const leaveRequest = new LeavesPage(loggedInPage);

  try {
    Logger.info("intentando modificar duracion después de ingresar fechas");
    await home.goToCreateLeave();
    const data = leaveRequests.invalidDate;
    await leave.selectLeaveType(data.type);
    await leave.selectStartDate();
    await leave.selectEndDate();
    await leave.modifyDurationField("10");
    const hasMessage = await leaveRequest.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();
    Logger.info("modificación de duración verificada correctamente (falla esperada)");
  } catch (error) {
    Logger.error(`error al modificar duración: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_modificar_duracion") });
    throw error;
  }
});

test("@exploratory @positive verificar que calculo automático de duracion sea correcto", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);

  try {
    Logger.info("verificando cálculo automático de duración");
    await home.goToCreateLeave();
    const data = leaveRequests.invalidDate;
    await leave.selectLeaveType(data.type);
    await leave.selectStartDate();
    await leave.selectEndDate();
    await loggedInPage.waitForTimeout(1000);
    const durationValue = await leave.getDuration();
    console.log("duración calculada automáticamente:", durationValue);
    expect(Number(durationValue)).toBeGreaterThan(0);
    expect(Number(durationValue)).toBe(6);
    Logger.info("cálculo automático de duración verificado correctamente");
  } catch (error) {
    Logger.error(`error en cálculo automático de duración: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_calculo_duracion") });
    throw error;
  }
});
