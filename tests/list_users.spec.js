import { expect } from "@playwright/test";
import { test } from "../fixtures/fixtures.js";
import { HomePage } from "../pages/HomePage.js";
import { UsersPage } from "../pages/UsersPage.js";
import { CreateUserPage } from "../pages/CreateUserPage.js";


test("@ui Verificar que se muestre la lista inicial de usuarios", async ({ loggedInPage }) => {    
    const home = new HomePage(loggedInPage);
    const usersPage = new UsersPage(loggedInPage);

    await home.goToListUsers(); 
    const count = await usersPage.getRowCount();

    expect(count).toBeGreaterThan(0);
});

test("@ui Verificar que se muestre solo 10 usuarios por página", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const usersPage = new UsersPage(loggedInPage);

    await home.goToListUsers();
    const count = await usersPage.getRowCount();

    expect(count).toBe(10);
});

test("@ui Verificar que se cambie cantidad de registros mostrados a 25", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const usersPage = new UsersPage(loggedInPage);

    await home.goToListUsers();
    await usersPage.changeEntriesTo(25);
    const count = await usersPage.getRowCount();

    expect(count).toBeGreaterThanOrEqual(10);
  });

test("@ui Verificar que se cambie cantidad de registros mostrados a 50", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const usersPage = new UsersPage(loggedInPage);

    await home.goToListUsers();
    await usersPage.changeEntriesTo(50);
    const count = await usersPage.getRowCount();

    expect(count).toBeGreaterThanOrEqual(10);
  });

test("@ui Verificar que se cambie cantidad de registros mostrados a 100", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const usersPage = new UsersPage(loggedInPage);

    await home.goToListUsers();
    await usersPage.changeEntriesTo(100);
    const count = await usersPage.getRowCount();

    expect(count).toBeGreaterThanOrEqual(10);
  });

test("@ui Verificar que el buscador permite buscar correctamente a un usuario existente", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const usersPage = new UsersPage(loggedInPage);

    await home.goToListUsers();
    await usersPage.searchUser("Benjamin");
    const rows = await usersPage.getTableData();

    expect(rows.some(r => r.toString().includes("Benjamin"))).toBeTruthy();
  });


test("@ui Verificar que al buscar usuario inexistente se muestre un mensaje en fila", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const usersPage = new UsersPage(loggedInPage);

    await home.goToListUsers();
    await usersPage.searchUser("UsuarioInexistente123");
    const count = await usersPage.getRowCount();
    expect(count).toBe(1);

    const infoText = await usersPage.getInfoTextSearch();
    expect(infoText).toContain("No matching records found");
});

test("@ui Verificar que texto de paginación se muestre en 1 cuando haya registros", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const usersPage = new UsersPage(loggedInPage);

    await home.goToListUsers();
    const infoText = await usersPage.getInfoText();

    expect(infoText).toContain("Showing 1 to");
});

test("@ui Verificar que texto de paginación se muestre en 0 cuando no haya registros", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const usersPage = new UsersPage(loggedInPage);

    await home.goToListUsers();
    await usersPage.searchUser("UsuarioInexistente123");
    const count = await usersPage.getRowCount();
    expect(count).toBe(1);

    const infoText = await usersPage.getInfoText();

    expect(infoText).toContain("Showing 0 to");
});

test("@ui Verificar que se pueda navegar a la siguiente y volver a la anterior página de usuarios", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  await home.goToListUsers();
  const infoBefore = await usersPage.getInfoText();
  
  await usersPage.goToNextPage();
  const infoAfterNext = await usersPage.getInfoText();

  await usersPage.goToPreviousPage();
  const infoAfterPrev = await usersPage.getInfoText();

  expect(infoBefore).toContain("Showing 1");
  expect(infoAfterNext).not.toBe(infoBefore);
  expect(infoAfterPrev).toBe(infoBefore);
});

test("@ui Verificar que el botón Export permita descargar la lista de usuarios", async ({ loggedInPage, browserName }) => {
  test.skip(browserName === "webkit", "Las descargas no funcionan bien en WebKit");
  
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  await home.goToListUsers();
  const download = await usersPage.clickExportList();

  const path = await download.path();
  expect(path).not.toBeNull();
});

test("@ui Verificar que el botón 'Create user' redirija correctamente al formulario de creación", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  await home.goToListUsers();
  await usersPage.goToCreateUser();

  await expect(loggedInPage).toHaveURL(/\/users\/create/);
});

test("@ui Verificar que se pueda eliminar un usuario existente mostrando mensaje de éxito", async ({ loggedInPage, usuarioDePrueba }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  await home.goToListUsers();
  await usersPage.changeEntriesTo(50);

  await usersPage.deleteUserByLogin(usuarioDePrueba);

  const stillExists = await usersPage.userExists(usuarioDePrueba);
  expect(stillExists).toBeFalsy();
});

test.fail("@ui Verificar que al eliminar un usuario se muestra mensaje de confirmación", async ({ loggedInPage, usuarioDePrueba }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  await home.goToListUsers();
  await usersPage.changeEntriesTo(50);

  await usersPage.deleteUserByLogin(usuarioDePrueba);

  const hasMessage = await usersPage.hasSuccessMessage();
  expect(hasMessage).toBeFalsy(); 
});

test("@ui Verificar que se pueda abrir el modal de cambio de contraseña de un usuario en la lista", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  await home.goToListUsers();

  await usersPage.resetPasswordByIndex(1);

  await expect(loggedInPage.locator(usersPage.resetPwdModal)).toBeVisible();
});

test("@ui Verificar que se pueda cambiar la contraseña de un usuario correctamente", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  await home.goToListUsers();

  const nuevaPassword = "Cambio123!";
  await usersPage.changePasswordByIndex(1, nuevaPassword);

  const hasMessage = await usersPage.hasSuccessMessage();
  expect(hasMessage).toBeTruthy(); 
});

test.fail("@ui Verificar que no se debería poder resetear la contraseña con el campo vacío", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  await home.goToListUsers();

  await usersPage.changePasswordByIndex(1, "");
  const hasMessage = await usersPage.hasSuccessMessage();
  expect(hasMessage).toBeTruthy(); 
});


test("@ui Verificar que se puedan obtener los datos visibles de la tabla", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  await home.goToListUsers();
  const data = await usersPage.getTableData();
  console.log(data);


  expect(Array.isArray(data)).toBeTruthy();
  expect(data.length).toBeGreaterThan(0);
  expect(data[0].length).toBeGreaterThan(0);
});

test("@ui Verificar que se pueda ingresar a la página de edición del segundo usuario", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  await home.goToListUsers();

  await usersPage.goToEditUserByIndex(1);

  await expect(loggedInPage).toHaveURL(/\/users\/edit\//);
});

test("@ui Verificar que se pueda editar el segundo usuario y guardar los cambios", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);
  const createUserPage = new CreateUserPage(loggedInPage);

  await home.goToListUsers();

  await usersPage.goToEditUserByIndex(1);

  await createUserPage.fillLastname("Modificado");
  await createUserPage.clickSendOrUpdate();
  await loggedInPage.waitForURL("**/users");

  const hasMessage = await usersPage.hasSuccessMessage();
  expect(hasMessage).toBeTruthy();
});

test("@ui Verificar que se pueda cancelar la edición de un usuario existente", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);
  const createUserPage = new CreateUserPage(loggedInPage);

  await home.goToListUsers();

  await usersPage.goToEditUserByIndex(1);

  await createUserPage.cancelButtonEdit();
  await loggedInPage.waitForURL("**/users");
});

test("@ui Verificar que se pueda activar o inactivar un usuario existente", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);
  const createUserPage = new CreateUserPage(loggedInPage);

  await home.goToListUsers();
  await usersPage.toggleActiveByIndex(1);
});
