import { expect } from "@playwright/test";
import { test } from "../fixtures/fixtures.js";
import { HomePage } from "../pages/HomePage.js";
import { LeaveTypesPage } from "../pages/LeaveTypesPage.js";
import { Logger, screenshotPath } from "../utils/helpers.js";

test("@exploratory @positive verificar que se pueda crear un tipo", async ({ loggedInPage, cleanupLeaveType }) => {
  const home = new HomePage(loggedInPage);
  const leaveTypes = new LeaveTypesPage(loggedInPage);

  try {
    Logger.info("creando tipo de permiso");
    await home.goToLeaveTypes();
    await leaveTypes.createLeaveType("Permisasso", "PE");

    const hasMessage = await leaveTypes.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();
    Logger.info("tipo de permiso creado exitosamente");
  } catch (error) {
    Logger.error(`error al crear tipo de permiso: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_crear_tipo_permiso") });
    throw error;
  }
});

test("@exploratory @positive verificar que se pueda eliminar un tipo", async ({ loggedInPage, setupLeaveType }) => {
  const home = new HomePage(loggedInPage);
  const leaveTypes = new LeaveTypesPage(loggedInPage);

  try {
    Logger.info("eliminando tipo de permiso");
    const createdName = setupLeaveType;
    await home.goToLeaveTypes();
    await leaveTypes.waitForTable();

    await leaveTypes.deleteByName(createdName);
    const hasMessage = await leaveTypes.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();
    Logger.info("tipo de permiso eliminado correctamente");
  } catch (error) {
    Logger.error(`error al eliminar tipo de permiso: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_eliminar_tipo_permiso") });
    throw error;
  }
});

test("@exploratory @positive verificar que se pueda editar un tipo", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leaveTypes = new LeaveTypesPage(loggedInPage);

  try {
    Logger.info("editando tipo de permiso");
    await home.goToLeaveTypes();
    await leaveTypes.editByIndex(2, "maternity leave", "ml");

    const hasMessage = await leaveTypes.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();
    Logger.info("tipo de permiso editado correctamente");
  } catch (error) {
    Logger.error(`error al editar tipo de permiso: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_editar_tipo_permiso") });
    throw error;
  }
});

test("@exploratory @negative verificar que no se pueda crear un tipo duplicado", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leaveTypes = new LeaveTypesPage(loggedInPage);

  try {
    Logger.info("intentando crear tipo de permiso duplicado");
    await home.goToLeaveTypes();
    await leaveTypes.createLeaveType("paternity leave", "DT");

    const hasDuplicate = await leaveTypes.hasDuplicateModal();
    expect(hasDuplicate).toBeTruthy();
    Logger.info("modal de duplicado mostrado correctamente");
  } catch (error) {
    Logger.error(`error al verificar duplicado de tipo de permiso: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_tipo_duplicado") });
    throw error;
  }
});

test("@exploratory @positive verificar que se pueda exportar la lista de tipos", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leaveTypes = new LeaveTypesPage(loggedInPage);

  try {
    Logger.info("exportando lista de tipos de permiso");
    await home.goToLeaveTypes();

    const filePath = await leaveTypes.exportList();
    expect(filePath).toBeTruthy();
    Logger.info("lista exportada correctamente");
  } catch (error) {
    Logger.error(`error al exportar lista de tipos de permiso: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_exportar_tipos") });
    throw error;
  }
});

test("@exploratory @positive verificar que al eliminar un tipo no aparezca nuevamente en la lista", async ({ loggedInPage, setupLeaveType }) => {
  const home = new HomePage(loggedInPage);
  const leaveTypes = new LeaveTypesPage(loggedInPage);

  try {
    Logger.info("verificando eliminación de tipo en la lista");
    const createdName = setupLeaveType;
    await home.goToLeaveTypes();
    await leaveTypes.deleteByName(createdName);
    await leaveTypes.waitForTable();

    const rowsText = await leaveTypes.getRowTexts();
    const stillExists = rowsText.some(text => text.includes(createdName));
    expect(stillExists).toBeFalsy();
    Logger.info("tipo de permiso eliminado correctamente de la lista");
  } catch (error) {
    Logger.error(`error al verificar eliminación en lista: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_verificar_eliminacion_lista") });
    throw error;
  }
});

test("@exploratory @positive verificar que se pueda crear tipo de permiso sin marcar 'deduct non working days'", async ({ loggedInPage, cleanupLeaveType }) => {
  const home = new HomePage(loggedInPage);
  const leaveTypes = new LeaveTypesPage(loggedInPage);

  try {
    Logger.info("creando tipo de permiso sin marcar 'deduct non working days'");
    await home.goToLeaveTypes();
    await leaveTypes.createLeaveType("SinDeduccion", "SD", false);

    const hasMessage = await leaveTypes.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();
    Logger.info("tipo de permiso creado correctamente sin deducción");
  } catch (error) {
    Logger.error(`error al crear tipo de permiso sin deducción: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_crear_tipo_sin_deduccion") });
    throw error;
  }
});

test("@exploratory @positive verificar que se pueda cerrar el modal de crear tipo con el botón cancel", async ({ loggedInPage }) => { 
  const home = new HomePage(loggedInPage);
  const leaveTypes = new LeaveTypesPage(loggedInPage);

  try {
    Logger.info("cerrando modal de crear tipo con botón cancel");
    await home.goToLeaveTypes();
    await leaveTypes.cancelCreateModal();

    const isModalVisible = await loggedInPage.isVisible(leaveTypes.addModal);
    expect(isModalVisible).toBeFalsy();
    Logger.info("modal cerrado correctamente con cancel");
  } catch (error) {
    Logger.error(`error al cerrar modal de crear tipo: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_cerrar_modal_crear_tipo") });
    throw error;
  }
});

test.fail("@exploratory @negative verificar que no se pueda crear tipo de permiso con campos vacíos", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leaveTypes = new LeaveTypesPage(loggedInPage);

  try {
    Logger.info("intentando crear tipo de permiso con campos vacíos");
    await home.goToLeaveTypes();
    await leaveTypes.createLeaveType("", "", false);

    const currentUrl = loggedInPage.url();
    expect(currentUrl).toContain("/leavetypes/create");
    Logger.info("validación de campos vacíos funcionando correctamente");
  } catch (error) {
    Logger.error(`error al validar tipo con campos vacíos: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_campos_vacios_tipo") });
    throw error;
  }
});

test("@exploratory @positive verificar que se pueda crear tipo de permiso marcando 'deduct non working days'", async ({ loggedInPage, cleanupLeaveType }) => {
  const home = new HomePage(loggedInPage);
  const leaveTypes = new LeaveTypesPage(loggedInPage);

  try {
    Logger.info("creando tipo de permiso marcando 'deduct non working days'");
    await home.goToLeaveTypes();
    await leaveTypes.createLeaveType("SinDeduccion1", "SD", true);

    const hasMessage = await leaveTypes.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();
    Logger.info("tipo de permiso creado correctamente con deducción");
  } catch (error) {
    Logger.error(`error al crear tipo con deducción: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_crear_tipo_con_deduccion") });
    throw error;
  }
});



