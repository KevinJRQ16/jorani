import { expect } from "@playwright/test";
import { test } from "../fixtures/fixtures.js";
import { HomePage } from "../pages/HomePage.js";
import { LeaveTypesPage } from "../pages/LeaveTypesPage.js";

test("@ui Verificar que se pueda crear un tipo", async ({ loggedInPage, cleanupLeaveType }) => {
  const home = new HomePage(loggedInPage);
  const leaveTypes = new LeaveTypesPage(loggedInPage);

  await home.goToLeaveTypes();

  await leaveTypes.createLeaveType("Permisasso", "PE");

  const hasMessage = await leaveTypes.hasSuccessMessage();
  expect(hasMessage).toBeTruthy();
});

test("@ui Verificar que se pueda eliminar un tipo", async ({ loggedInPage, setupLeaveType }) => {
  const home = new HomePage(loggedInPage);
  const leaveTypes = new LeaveTypesPage(loggedInPage);

  const createdName = setupLeaveType; 
  await home.goToLeaveTypes();
  await leaveTypes.waitForTable();

  await leaveTypes.deleteByName(createdName);
  const hasMessage = await leaveTypes.hasSuccessMessage();
  expect(hasMessage).toBeTruthy();
});

test("@ui Verificar que se pueda editar un tipo", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leaveTypes = new LeaveTypesPage(loggedInPage);

  await home.goToLeaveTypes();

  await leaveTypes.editByIndex(7, "PermisoEdit", "PE");

  const hasMessage = await leaveTypes.hasSuccessMessage();
  expect(hasMessage).toBeTruthy();
});

test("@ui Verificar que no se pueda crear un tipo duplicado", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leaveTypes = new LeaveTypesPage(loggedInPage);

  await home.goToLeaveTypes();

  await leaveTypes.createLeaveType("congreso", "DT");

  // Verificar que aparezca el modal de duplicado
  const hasDuplicate = await leaveTypes.hasDuplicateModal();
  expect(hasDuplicate).toBeTruthy();
});

test("@ui Verificar que se pueda exportar la lista de tipos", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leaveTypes = new LeaveTypesPage(loggedInPage);

  await home.goToLeaveTypes();

  const filePath = await leaveTypes.exportList();
  expect(filePath).toBeTruthy();
  console.log("archivo exportado correctamente:", filePath);
});

test("@ui Verificar que al eliminar un tipo no aparezca nuevamente en la lista", async ({ loggedInPage, setupLeaveType }) => {
  const home = new HomePage(loggedInPage);
  const leaveTypes = new LeaveTypesPage(loggedInPage);
  const createdName = setupLeaveType;

  await home.goToLeaveTypes();
  await leaveTypes.deleteByName(createdName);

  // Esperar la tabla actualizada
  await leaveTypes.waitForTable();
  const rowsText = await leaveTypes.getRowTexts();
  const stillExists = rowsText.some(text => text.includes(createdName));

  expect(stillExists).toBeFalsy();
});

test("@ui Verificar que se pueda crear tipo de permiso sin marcar 'Deduct non working days'", async ({ loggedInPage, cleanupLeaveType }) => {
  const home = new HomePage(loggedInPage);
  const leaveTypes = new LeaveTypesPage(loggedInPage);

  await home.goToLeaveTypes();
  await leaveTypes.createLeaveType("SinDeduccion", "SD", false);

  const hasMessage = await leaveTypes.hasSuccessMessage();
  expect(hasMessage).toBeTruthy();
});

test("@ui Verificar que se pueda cerrar el modal de crear tipo con el botón Cancel", async ({ loggedInPage }) => { 
  const home = new HomePage(loggedInPage);
  const leaveTypes = new LeaveTypesPage(loggedInPage);

  await home.goToLeaveTypes();

  await leaveTypes.cancelCreateModal();

  const isModalVisible = await loggedInPage.isVisible(leaveTypes.addModal);
  expect(isModalVisible).toBeFalsy();
});


test.fail("@ui Verificar que no se pueda crear tipo de permiso sin campos vacios", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leaveTypes = new LeaveTypesPage(loggedInPage);

  await home.goToLeaveTypes();
  await leaveTypes.createLeaveType("", "", false);

  const currentUrl = loggedInPage.url();
  expect(currentUrl).toContain("/leavetypes/create");

});

test("@ui Verificar que se pueda crear tipo de permiso marcando 'Deduct non working days'", async ({ loggedInPage, cleanupLeaveType }) => {
  const home = new HomePage(loggedInPage);
  const leaveTypes = new LeaveTypesPage(loggedInPage);

  await home.goToLeaveTypes();
  await leaveTypes.createLeaveType("SinDeduccion1", "SD", true);

  const hasMessage = await leaveTypes.hasSuccessMessage();
  expect(hasMessage).toBeTruthy();
});



