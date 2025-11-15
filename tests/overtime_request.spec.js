import { expect } from "@playwright/test";
import { test } from "../fixtures/fixtures.js";
import { HomePage } from "../pages/HomePage.js";
import { OvertimeRequestPage } from "../pages/OvertimeRequestPage.js";
import { ExtrasPage } from "../pages/ExtrasPage.js";
import overtimeRequests from "../data/overtimeRequests.json" assert { type: "json" };
import { Logger, screenshotPath } from "../utils/helpers.js";

test("@exploratory @positive verificar creación de solicitud de horas extra con estado 'Requested' ", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtime = new OvertimeRequestPage(loggedInPage);
  const extras = new ExtrasPage(loggedInPage);

  try {
    Logger.info("creando nueva solicitud de horas extra");
    await home.goToCreateOvertime();
    await overtime.selectDate();
    await overtime.setDuration("0.5");
    await overtime.setReason("Trabajo adicional en proyecto urgente");
    await overtime.selectStatus("Requested");
    await overtime.submitRequest();

    const hasMessage = await extras.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();
    Logger.info("solicitud de horas extra creada exitosamente");
  } catch (error) {
    Logger.error(`error al crear solicitud de horas extra: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_crear_overtime") });
    throw error;
  }
});

test("@exploratory @positive verificar creación de solicitud de horas extra con estado 'Planned'", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtime = new OvertimeRequestPage(loggedInPage);
  const extras = new ExtrasPage(loggedInPage);

  try {
    Logger.info("creando nueva solicitud de horas extra");
    await home.goToCreateOvertime();
    await overtime.selectDate();
    await overtime.setDuration("0.5");
    await overtime.setReason("Trabajo adicional en proyecto urgente");
    await overtime.selectStatus("Planned");
    await overtime.submitRequest();

    const hasMessage = await extras.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();
    Logger.info("solicitud de horas extra creada exitosamente");
  } catch (error) {
    Logger.error(`error al crear solicitud de horas extra: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_crear_overtime") });
    throw error;
  }
});

test("@exploratory @negative verificar que el campo 'Date' sea obligatorio", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtime = new OvertimeRequestPage(loggedInPage);

  try {
    Logger.info("verificando campo Date obligatorio");
    await home.goToCreateOvertime();
    await overtime.setDuration("0.5");
    await overtime.setReason("Trabajo adicional sin fecha");
    await overtime.selectStatus("Requested");
    await overtime.submitRequest();

    const message = await overtime.getMandatoryFieldAlert();
    expect(message).toContain("The field Date is mandatory.");
    Logger.info("campo Date verificado correctamente");
  } catch (error) {
    Logger.error(`error al verificar campo Date obligatorio: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_campo_date") });
    throw error;
  }
});

test("@exploratory @negative verificar que el campo 'Duration' sea obligatorio", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtime = new OvertimeRequestPage(loggedInPage);

  try {
    Logger.info("verificando campo Duration obligatorio");
    await home.goToCreateOvertime();
    await overtime.selectDate();
    await overtime.setReason("Sin duración asignada");
    await overtime.selectStatus("Planned");
    await overtime.submitRequest();

    const message = await overtime.getMandatoryFieldAlert();
    expect(message).toContain("The field Duration is mandatory.");
    Logger.info("campo Duration verificado correctamente");
  } catch (error) {
    Logger.error(`error al verificar campo Duration obligatorio: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_campo_duration") });
    throw error;
  }
});

test("@exploratory @negative verificar que el campo 'Reason' sea obligatorio", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtime = new OvertimeRequestPage(loggedInPage);

  try {
    Logger.info("verificando campo Reason obligatorio");
    await home.goToCreateOvertime();
    await overtime.selectDate();
    await overtime.setDuration("1");
    await overtime.selectStatus("Requested");
    await overtime.submitRequest();

    const message = await overtime.getMandatoryFieldAlert();
    expect(message).toContain("The field Reason is mandatory.");
    Logger.info("campo Reason verificado correctamente");
  } catch (error) {
    Logger.error(`error al verificar campo Reason obligatorio: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_campo_reason") });
    throw error;
  }
});

test("@exploratory @positive verificar que se pueda cancelar la creación de solicitud", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtime = new OvertimeRequestPage(loggedInPage);

  try {
    Logger.info("verificando cancelación de solicitud de horas extra");
    await home.goToCreateOvertime();
    await overtime.cancel();
    await expect(overtime.page).toHaveURL(/\/extra$/);
    Logger.info("cancelación de solicitud verificada correctamente");
  } catch (error) {
    Logger.error(`error al cancelar solicitud: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_cancelar_overtime") });
    throw error;
  }
});

test("@exploratory @negative verificar que no se permita guardar solicitud de horas extra con campos vacíos", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtime = new OvertimeRequestPage(loggedInPage);

  try {
    Logger.info("verificando validación general de campos obligatorios vacíos");
    await home.goToCreateOvertime();
    const message = await overtime.mandatoryAllFields();
    expect(message).toContain("The field Reason is mandatory.");
    Logger.info("validación general de campos obligatorios verificada correctamente");
  } catch (error) {
    Logger.error(`error al validar campos vacíos: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_campos_vacios_overtime") });
    throw error;
  }
});

test.fail("@w1 @exploratory @positive verificar creación de solicitud de horas extra con año pasado ", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtime = new OvertimeRequestPage(loggedInPage);
  const extras = new ExtrasPage(loggedInPage);

  try {
    Logger.info("creando nueva solicitud de horas extra");
    await home.goToCreateOvertime();
    const data = overtimeRequests.dateInvalid;
    await overtime.setDate(data.date);
    await loggedInPage.keyboard.press('Escape');
    await overtime.setDuration(data.duration);
    await overtime.setReason(data.reason);
    await overtime.selectStatus(data.status);
    await overtime.submitRequest();
    await overtime.sortBy("ID");

    const hasMessage = await extras.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();

    Logger.info("solicitud de horas extra creada exitosamente");
  } catch (error) {
    Logger.error(`error al crear solicitud de horas extra: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_crear_overtime") });
    throw error;
  }
});

test("@exploratory @positive verificar creación de solicitud de horas extra con campo 'Reason' con espacios vacíos", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtime = new OvertimeRequestPage(loggedInPage);
  const extras = new ExtrasPage(loggedInPage);

  try {
    Logger.info("creando nueva solicitud de horas extra");
    await home.goToCreateOvertime();
    const data = overtimeRequests.fieldReasonInvalid;
    await overtime.selectDate();
    await overtime.setDuration(data.duration);
    await overtime.setReason(data.reason);
    await overtime.selectStatus(data.status);
    await overtime.submitRequest();
    await overtime.submitRequest();
    await overtime.submitRequest();

    const message = await overtime.getMandatoryFieldAlert();
    expect(message).toContain("The field Date is mandatory.");
    Logger.info("campo Date verificado correctamente");
  } catch (error) {
    Logger.error(`error al crear solicitud de horas extra: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_crear_overtime") });
    throw error;
  }
});