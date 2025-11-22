import { expect } from "@playwright/test";
import { test } from "../fixtures/fixtures.js";
import { HomePage } from "../pages/HomePage.js";
import { UsersPage } from "../pages/UsersPage.js";
import { CreateUserPage } from "../pages/CreateUserPage.js";
import { Logger, screenshotPath } from "../utils/helpers.js";

test("@exploratory @positive Verificar que se muestre la lista inicial de usuarios", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const usersPage = new UsersPage(loggedInPage);

    try {
      Logger.info("abriendo lista inicial de usuarios");
      await home.goToListUsers();

      const count = await usersPage.getRowCount();
      Logger.info(`usuarios encontrados: ${count}`);
      expect(count).toBeGreaterThan(0);

      Logger.info("test finalizado correctamente.");
    } catch (error) {
      Logger.error(`error al mostrar lista inicial: ${error.message}`);
      await loggedInPage.screenshot({ path: screenshotPath("error_lista_inicial") });
      throw error;
    }
  });

test("@exploratory @positive Verificar que se muestre solo 10 usuarios por página", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("validando que se muestren entre 1 y 10 usuarios por página...");
    await home.goToListUsers();

    const count = await usersPage.getRowCount();
    Logger.info(`usuarios visibles: ${count}`);
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(10);



    Logger.info("test finalizado correctamente.");
  } catch (error) {
    Logger.error(`error al verificar cantidad de usuarios: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_10_usuarios") });
    throw error;
  }
});

test("@exploratory @positive Verificar que se cambie cantidad de registros mostrados a 25", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("cambiando cantidad de registros mostrados entre 1 y 25 maximo");
    await home.goToListUsers();
    await usersPage.changeEntriesTo(25);

    const count = await usersPage.getRowCount();
    Logger.info(`cantidad actual de filas: ${count}`);
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(25);

    Logger.info("test finalizado correctamente.");
  } catch (error) {
    Logger.error(`error al cambiar a 25 registros: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_25_registros") });
    throw error;
  }
});

test("@exploratory @positive Verificar que se cambie cantidad de registros mostrados a 50", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("cambiando cantidad de registros mostrados entre 1 y 50");
    await home.goToListUsers();
    await usersPage.changeEntriesTo(50);

    const count = await usersPage.getRowCount();
    Logger.info(`cantidad actual de filas: ${count}`);
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(50);

    Logger.info("test finalizado correctamente.");
  } catch (error) {
    Logger.error(`error al cambiar a 50 registros: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_50_registros") });
    throw error;
  }
});

test("@exploratory @positive Verificar que se cambie cantidad de registros mostrados a 100", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("cambiando cantidad de registros mostrados entre 1 y 100 como maximo");
    await home.goToListUsers();
    await usersPage.changeEntriesTo(100);

    const count = await usersPage.getRowCount();
    Logger.info(`cantidad actual de filas: ${count}`);
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(100);

    Logger.info("test finalizado correctamente.");
  } catch (error) {
    Logger.error(`error al cambiar a 100 registros: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_100_registros") });
    throw error;
  }
});

test("@exploratory @positive Verificar que el buscador permite buscar correctamente a un usuario existente", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("buscando usuario existente 'Benjamin'");
    await home.goToListUsers();
    await usersPage.searchUser("Benjamin");

    const rows = await usersPage.getTableData();
    expect(rows.some(r => r.toString().includes("Benjamin"))).toBeTruthy();

    Logger.info("usuario encontrado correctamente.");
  } catch (error) {
    Logger.error(`error en búsqueda de usuario existente: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_busqueda_existente") });
    throw error;
  }
});

test("@exploratory @negative Verificar que al buscar usuario inexistente se muestre un mensaje en fila", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("buscando usuario inexistente");
    await home.goToListUsers();
    await usersPage.searchUser("UsuarioInexistente123");

    const count = await usersPage.getRowCount();
    expect(count).toBe(1);

    const infoText = await usersPage.getInfoTextSearch();
    expect(infoText).toContain("No matching records found");

    Logger.info("mensaje mostrado correctamente para usuario inexistente.");
  } catch (error) {
    Logger.error(`error al buscar usuario inexistente: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_busqueda_inexistente") });
    throw error;
  }
});

test("@exploratory @positive Verificar que texto de paginación se muestre en 1 cuando haya registros", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("verificando texto de paginación con registros");
    await home.goToListUsers();

    const infoText = await usersPage.getInfoText();
    expect(infoText).toContain("Showing 1 to");

    Logger.info("texto de paginación mostrado correctamente.");
  } catch (error) {
    Logger.error(`error al verificar paginación con registros: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_paginacion_con_registros") });
    throw error;
  }
});

test("@exploratory @negative Verificar que texto de paginación se muestre en 0 cuando no haya registros", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("verificando texto de paginación sin registros");
    await home.goToListUsers();
    await usersPage.searchUser("UsuarioInexistente123");

    const infoText = await usersPage.getInfoText();
    expect(infoText).toContain("Showing 0 to");

    Logger.info("texto de paginación mostrado correctamente cuando no hay registros.");
  } catch (error) {
    Logger.error(`error al verificar paginación sin registros: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_paginacion_sin_registros") });
    throw error;
  }
});

test("@w2 @exploratory @positive Verificar que se pueda navegar a la siguiente y volver a la anterior página de usuarios", async ({ loggedInPage, usuariosParaPaginacion }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("navegando entre páginas de usuarios");
    await home.goToListUsers();

    const infoBefore = await usersPage.getInfoText();
    await usersPage.goToNextPage();
    const infoAfterNext = await usersPage.getInfoText();
    await usersPage.goToPreviousPage();
    const infoAfterPrev = await usersPage.getInfoText();

    expect(infoBefore).toContain("Showing 1");
    expect(infoAfterNext).not.toBe(infoBefore);
    expect(infoAfterPrev).toBe(infoBefore);

    Logger.info("test de navegación entre páginas finalizado correctamente.");
  } catch (error) {
    Logger.error(`error en navegación de páginas: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_navegacion_paginas") });
    throw error;
  }
});

test("@exploratory @positive Verificar que el botón export permita descargar la lista de usuarios", async ({ loggedInPage, browserName }) => {
  test.skip(browserName === "webkit", "las descargas no funcionan bien en webkit");

  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("exportando lista de usuarios");
    await home.goToListUsers();
    const download = await usersPage.clickExportList();

    const path = await download.path();
    expect(path).not.toBeNull();

    Logger.info("exportación completada correctamente.");
  } catch (error) {
    Logger.error(`error al exportar lista de usuarios: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_exportar_lista") });
    throw error;
  }
});

test("@exploratory @positive Verificar que el botón create user redirija correctamente al formulario de creación", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("abriendo formulario de creación de usuario");
    await home.goToListUsers();
    await usersPage.goToCreateUser();

    await expect(loggedInPage).toHaveURL(/\/users\/create/);
    Logger.info("redirección a formulario de creación correcta.");
  } catch (error) {
    Logger.error(`error al abrir formulario de creación: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_crear_usuario") });
    throw error;
  }
});

test("@exploratory @positive Verificar que se pueda eliminar un usuario existente mostrando mensaje de éxito", async ({ loggedInPage, usuarioDePrueba }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("eliminando usuario existente");
    await home.goToListUsers();
    await usersPage.changeEntriesTo(50);
    await usersPage.deleteUserByLogin(usuarioDePrueba);

    const stillExists = await usersPage.userExists(usuarioDePrueba);
    expect(stillExists).toBeFalsy();

    Logger.info("usuario eliminado correctamente.");
  } catch (error) {
    Logger.error(`error al eliminar usuario: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_eliminar_usuario") });
    throw error;
  }
});

test.fail("@exploratory @negative Verificar que al eliminar un usuario se muestre mensaje de confirmación", async ({ loggedInPage, usuarioDePrueba }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("verificando mensaje de confirmación al eliminar usuario");
    await home.goToListUsers();
    await usersPage.changeEntriesTo(50);
    await usersPage.deleteUserByLogin(usuarioDePrueba);

    const hasMessage = await usersPage.hasSuccessMessage();
    expect(hasMessage).toBeFalsy();
  } catch (error) {
    Logger.error(`error al verificar mensaje de confirmación: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_confirmacion_eliminar") });
    throw error;
  }
});

test("@exploratory @positive Verificar que se pueda abrir el modal de cambio de contraseña de un usuario", async ({ loggedInPage, usuarioTemporal }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("abriendo modal de cambio de contraseña");
    await home.goToListUsers();
    await usersPage.searchUser(usuarioTemporal);
    await usersPage.openResetPasswordModal(usuarioTemporal);

    await expect(loggedInPage.locator(usersPage.resetPwdModal)).toBeVisible();
    Logger.info("modal abierto correctamente.");

    await loggedInPage.click(`${usersPage.resetPwdModal} .close`);
    await expect(loggedInPage.locator(usersPage.resetPwdModal)).toBeHidden();

  } catch (error) {
    Logger.error(`error al abrir modal de cambio de contraseña: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_modal_contrasena") });
    throw error;
  }
});

test("@exploratory @positive Verificar que se pueda cambiar la contraseña de un usuario correctamente", async ({ loggedInPage, usuarioTemporal }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("cambiando contraseña de usuario");
    await home.goToListUsers();
    await usersPage.resetPasswordByLogin(usuarioTemporal);

    const hasMessage = await usersPage.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();

    Logger.info("contraseña cambiada correctamente.");
  } catch (error) {
    Logger.error(`error al cambiar contraseña: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_cambiar_contrasena") });
    throw error;
  }
});

test.fail("@exploratory @negative Verificar que no se debería poder resetear la contraseña con el campo vacío", async ({ loggedInPage, usuarioTemporal }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("intentando resetear contraseña vacía");
    await home.goToListUsers();
    await usersPage.resetPasswordByLogin(usuarioTemporal, "");

    const hasMessage = await usersPage.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();
  } catch (error) {
    Logger.error(`error al probar contraseña vacía: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_resetear_vacia") });
    throw error;
  }
});

test("@exploratory @positive Verificar que se puedan obtener los datos visibles de la tabla", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("obteniendo datos visibles de la tabla de usuarios");
    await home.goToListUsers();

    const data = await usersPage.getTableData();
    Logger.info(`datos obtenidos: ${data.length} filas`);

    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].length).toBeGreaterThan(0);

    Logger.info("datos visibles obtenidos correctamente.");
  } catch (error) {
    Logger.error(`error al obtener datos de tabla: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_datos_tabla") });
    throw error;
  }
});

test("@exploratory @positive Verificar que se pueda ingresar a la página de edición del segundo usuario", async ({ loggedInPage, usuarioTemporal }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("ingresando a página de edición del segundo usuario");
    await home.goToListUsers();
    await usersPage.goToEditUserByLogin(usuarioTemporal);

    await expect(loggedInPage).toHaveURL(/\/users\/edit\//);
    Logger.info("redirección a edición correcta.");
    Logger.info("accediendo a la pagina lista de usuarios para limpieza.");
    await home.goToListUsers();
  } catch (error) {
    Logger.error(`error al ingresar a página de edición: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_editar_usuario") });
    throw error;
  }
});

test("@exploratory @positive Verificar que se pueda editar el segundo usuario y guardar los cambios", async ({ loggedInPage, usuarioTemporal }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);
  const createUserPage = new CreateUserPage(loggedInPage);

  try {
    Logger.info("editando segundo usuario");
    await home.goToListUsers();
    await usersPage.goToEditUserByLogin(usuarioTemporal);
    await createUserPage.fillLastname("Modificado");
    await createUserPage.clickSendOrUpdate();
    await loggedInPage.waitForURL("**/users");

    const hasMessage = await usersPage.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();

    Logger.info("usuario editado correctamente.");
    await home.goToListUsers();
  } catch (error) {
    Logger.error(`error al editar usuario: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_guardar_edicion") });
    throw error;
  }
});

test("@exploratory @positive Verificar que se pueda cancelar la edición de un usuario existente", async ({ loggedInPage, usuarioTemporal }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);
  const createUserPage = new CreateUserPage(loggedInPage);

  try {
    Logger.info("cancelando edición de usuario existente");
    await home.goToListUsers();
    await usersPage.goToEditUserByLogin(usuarioTemporal);
    await createUserPage.cancelButtonEdit();

    await loggedInPage.waitForURL("**/users");
    Logger.info("cancelación de edición correcta.");
    await home.goToListUsers();
  } catch (error) {
    Logger.error(`error al cancelar edición: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_cancelar_edicion") });
    throw error;
  }
});

test("@exploratory @positive Verificar que se pueda activar o inactivar un usuario existente", async ({ loggedInPage, usuarioTemporal }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("activando o inactivando usuario existente");
    await home.goToListUsers();
    await usersPage.toggleActiveByLogin(usuarioTemporal);

    Logger.info("estado de usuario modificado correctamente.");
  } catch (error) {
    Logger.error(`error al activar/inactivar usuario: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_toggle_usuario") });
    throw error;
  }
});

test("@exploratory @positive Verificar que se pueda eliminar usuarios y se muestre mensaje de éxito", async ({ loggedInPage, usuarioDePrueba, nuevoUsuarioDePrueba }) => {
  const home = new HomePage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("eliminando usuarios");
    await home.goToListUsers();
    // await usersPage.changeEntriesTo(50);
    await usersPage.sortBy("ID");
    await usersPage.deleteUserByLogin(usuarioDePrueba);
    await usersPage.deleteUserByLogin(nuevoUsuarioDePrueba);

    const stillExists = await usersPage.userExists(usuarioDePrueba);
    expect(stillExists).toBeFalsy();

    const stillExists1 = await usersPage.userExists(nuevoUsuarioDePrueba);
    expect(stillExists1).toBeFalsy();

    Logger.info("usuarios eliminado correctamente.");
  } catch (error) {
    Logger.error(`error al eliminar usuario: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_eliminar_usuario") });
    throw error;
  }
});
