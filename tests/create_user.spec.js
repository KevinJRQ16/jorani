import { expect } from "@playwright/test";
import { test } from "../fixtures/fixtures.js";
import { HomePage } from "../pages/HomePage.js";
import { CreateUserPage } from "../pages/CreateUserPage.js";
import { UsersPage } from "../pages/UsersPage.js";
// import { screenshotPath } from "../utils/helpers.js";
import createUsers from "../data/createUsers.json" assert { type: "json" };
import { createUserRamd } from "../data/createUserRamd.js";
import { Logger, screenshotPath } from "../utils/helpers.js";

test("@exploratory @positive Verificar que se pueda crear un usuario exitosamente", async ({ loggedInPage, cleanupUltimoUsuario }) => {
  const home = new HomePage(loggedInPage);
  const users = new UsersPage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);
  
  try {
    Logger.info("iniciando prueba: crear usuario exitosamente");
    await home.goToCrearUsuario();
    const user = createUserRamd.validUser;

    await createUser.fillForm({
      firstname: user.firstname,
      lastname: user.lastname,
      login: user.login,
      email: user.email,
      password: user.password,
    });

    const success = await users.hasSuccessMessage();
    expect(success).toBeTruthy();
    Logger.info("usuario creado exitosamente");
  } catch (error) {
    Logger.error(`Error al crear usuario exitosamente ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_crear_usuario_exitoso") });
    throw error;
  }
});
  
test.fail("@exploratory @negative Verificar que el sistema no acepte correos sin @", async ({ loggedInPage, cleanupUltimoUsuario }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);

  try {
    Logger.info("iniciando prueba email sin arroba");
    await home.goToCrearUsuario();
    const user = createUserRamd.invalidEmailUser;

    await createUser.fillForm({
      firstname: user.firstname,
      lastname: user.lastname,
      login: user.login,
      email: user.email,
      password: user.password
    });

    expect(await usersPage.hasSuccessMessage()).toBeTruthy();
  } catch (error) {
    Logger.error(`error en validación de correo sin @ ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_email_invalido") });
    throw error;
  }
});

test("@exploratory @negative Verificar que el campo contrasenia sea un campo obligatorio", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);

  try {
    Logger.info("campo contraseña obligatorio");
    await home.goToCrearUsuario();
    const message = await createUser.mandatoryPasswordField();
    expect(message).toContain("The field password is mandatory.");
  } catch (error) {
    Logger.error(`error campo contraseña ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_campo_password") });
    throw error;
  }
});

test("@exploratory @negative Verificar que el campo email sea un campo obligatorio", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);

  try {
    Logger.info("campo email obligatorio");
    await home.goToCrearUsuario();
    const message = await createUser.mandatoryEmailField(createUsers.passwordCreateUser.password);
    expect(message).toContain("The field email is mandatory.");
  } catch (error) {
    Logger.error(`error campo email obligatorio ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_campo_email") });
    throw error;
  }
});

test("@exploratory @negative Verificar que el campo login sea un campo obligatorio", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);

  try {
    Logger.info("campo login obligatorio");
    await home.goToCrearUsuario();
    const message = await createUser.mandatoryLoginField(createUsers.passwordCreateUser.password, createUsers.emailCreateUser.email );
    expect(message).toContain("The field login is mandatory.");
  } catch (error) {
    Logger.error(`error campo login obligatorio ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_campo_login") });
    throw error;
  }
});

test("@exploratory @positive Verificar que se pueda crear un usuario seleccionado el primer manager", async ({ loggedInPage, cleanupUltimoUsuario }) => {
  const home = new HomePage(loggedInPage);
  const users = new UsersPage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);

  try {
    Logger.info("creando usuario seleccionando primer manager");
    await home.goToCrearUsuario();
    const user = createUserRamd.validUser;

    await createUser.fillForm({
      firstname: user.firstname,
      lastname: user.lastname,
      login: user.login,
      email: user.email,
      password: user.password,
      selfManager: user.selfManager
    });

    const success = await users.hasSuccessMessage();
    expect(success).toBeTruthy();
  } catch (error) {
    Logger.error(`error creando usuario con manager ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_crear_usuario_manager") });
    throw error;
  }
});

test("@exploratory @negative Verificar que el campo apellido sea un campo obligatorio", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);

  try {
    Logger.info("campo apellido obligatorio");
    await home.goToCrearUsuario();
    const message = await createUser.mandatoryLastnameField(
      createUsers.passwordCreateUser.password,
      createUsers.emailCreateUser.email,
      createUsers.loginCreateUser.login
    );
    expect(message).toContain("The field lastname is mandatory.");
  } catch (error) {
    Logger.error(`error campo apellido obligatorio ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_campo_apellido") });
    throw error;
  }
});

test("@exploratory @negative Verificar que el campo nombre sea un campo obligatorio", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);

  try {
    Logger.info("campo nombre obligatorio");
    await home.goToCrearUsuario();
    const message = await createUser.mandatoryFirstnameField(
      createUsers.passwordCreateUser.password, 
      createUsers.emailCreateUser.email, 
      createUsers.loginCreateUser.login, 
      createUsers.lastnameCreateUser.lastname
    );
    expect(message).toContain("The field firstname is mandatory.");
  } catch (error) {
    Logger.error(`error campo nombre obligatorio: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_campo_nombre") });
    throw error;
  }
});

test("@exploratory @positive Verificar que se pueda crear un usuario con campos opcionales", async ({ loggedInPage, cleanupUltimoUsuario}) => {
  const home = new HomePage(loggedInPage);
  const users = new UsersPage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);

  try {
    Logger.info("creando usuario con campos opcionales");
    await home.goToCrearUsuario();
    const user = createUserRamd.validUserWithFiledsOptional;

    await createUser.fillForm({
      firstname: user.firstname,
      lastname: user.lastname,
      login: user.login,
      email: user.email,
      password: user.password,
      identifier: user.identifier,
      language: user.language,
      timezone: user.timezone
    });

    await loggedInPage.waitForURL("**/users");
    const success = await users.hasSuccessMessage();
    expect(success).toBeTruthy();
    Logger.info("usuario con campos opcionales creado exitosamente");
  } catch (error) {
    Logger.error(`error al crear usuario con campos opcionales: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_crear_usuario_campos_opcionales") });
    throw error;
  }
});

test("@exploratory @positive Verificar que se pueda crear un usuario con todos los campos completados correctamente", async ({ loggedInPage, cleanupUltimoUsuario }) => {
  const home = new HomePage(loggedInPage);
  const users = new UsersPage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);

  try {
    Logger.info("creando usuario con todos los campos completos");
    await home.goToCrearUsuario();
    const user = createUserRamd.validUserWithFiledsOptional;

    await createUser.selectEntityByIndex(0);
    await createUser.fillForm({
      firstname: user.firstname,
      lastname: user.lastname,
      login: user.login,
      email: user.email,
      password: user.password,
      identifier: user.identifier,
      language: user.language,
      timezone: user.timezone,
    });

    await loggedInPage.waitForURL("**/users");
    const success = await users.hasSuccessMessage();
    expect(success).toBeTruthy();
    Logger.info("usuario con todos los campos creado exitosamente");
  } catch (error) {
    Logger.error(`error al crear usuario con todos los campos: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_crear_usuario_todos_campos") });
    throw error;
  }
});

test("@exploratory @positive Verificar que el modal de seleccionar manager se cierre al hacer clic en la X", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);

  try {
    Logger.info("verificando cierre del modal de manager con la X");
    await home.goToCrearUsuario();
    await createUser.closeManagerModalWithX();

    const isVisible = await loggedInPage.isVisible(createUser.managerModal);
    expect(isVisible).toBeFalsy();
    Logger.info("modal cerrado correctamente con la X");
  } catch (error) {
    Logger.error(`error al cerrar modal de manager con X: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_modal_manager_x") });
    throw error;
  }
});

test("@exploratory @positive Verificar que el modal de seleccionar manager se cierre al hacer clic en Cancel", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);

  try {
    Logger.info("verificando cierre del modal de manager con Cancel");
    await home.goToCrearUsuario();
    await createUser.closeManagerModalWithCancel();

    const isVisible = await loggedInPage.isVisible(createUser.managerModal);
    expect(isVisible).toBeFalsy();
    Logger.info("modal cerrado correctamente con Cancel");
  } catch (error) {
    Logger.error(`error al cerrar modal de manager con Cancel: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_modal_manager_cancel") });
    throw error;
  }
});

test("@exploratory @positive Verificar que el buscador dentro del modal de manager filtre los resultados correctamente", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);

  try {
    Logger.info("verificando filtrado del buscador del modal de manager");
    await home.goToCrearUsuario();
    const results = await createUser.searchManager("balet");

    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.toLowerCase().includes("balet"))).toBeTruthy();
    Logger.info("busqueda dentro del modal de manager funcionando correctamente");
  } catch (error) {
    Logger.error(`error en filtrado del modal de manager: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_busqueda_modal_manager") });
    throw error;
  }
});

test("@exploratory @positive Verificar que se pueda seleccionar una entidad desde el modal y se complete el campo", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);

  try {
    Logger.info("verificando selección de entidad desde el modal");
    await home.goToCrearUsuario();

    await createUser.selectEntityByIndex(0);
    const selectedEntity = await loggedInPage.inputValue(createUser.entityText);
    expect(selectedEntity).not.toBe("");
    Logger.info("entidad seleccionada y campo completado correctamente");
  } catch (error) {
    Logger.error(`error al seleccionar entidad desde modal: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_seleccionar_entidad") });
    throw error;
  }
});

test("@exploratory @negative Verificar que al cancelar el modal de entidad no se complete el campo", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);

  try {
    Logger.info("verificando cancelación del modal de entidad");
    await home.goToCrearUsuario();

    await createUser.selectEntity();
    await createUser.closeEntityModalWithCancel();

    const selectedEntity = await loggedInPage.inputValue(createUser.entityText);
    expect(selectedEntity).toBe("");
    Logger.info("modal cancelado correctamente sin completar el campo");
  } catch (error) {
    Logger.error(`error al cancelar modal de entidad: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_cancelar_modal_entidad") });
    throw error;
  }
});
