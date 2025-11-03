import { expect } from "@playwright/test";
import { test } from "../fixtures/fixtures.js";
import { HomePage } from "../pages/HomePage.js";
import { CreateUserPage } from "../pages/CreateUserPage.js";
import { UsersPage } from "../pages/UsersPage.js";
import { screenshotPath } from "../utils/helpers.js";
import createUsers from "../data/createUsers.json" assert { type: "json" };
import { createUserRamd } from "../data/createUserRamd.js";

test("@ui @positive Verificar que se pueda crear un usuario exitosamente", async ({ loggedInPage, cleanupUltimoUsuario }) => {
  const home = new HomePage(loggedInPage);
  const users = new UsersPage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);
  
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
});
  
test.fail("@ui @negative Verificar que el sistema no acepte correos sin @", async ({ loggedInPage, cleanupUltimoUsuario }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);
  const usersPage = new UsersPage(loggedInPage);
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
});

test("@ui @negative Verificar que el campo contrasenia sea un campo obligatorio", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);
  await home.goToCrearUsuario();
  // await createUser.mandatoryPasswordField();
  const message = await createUser.mandatoryPasswordField();
  // Validar el texto exacto del mensaje
  await expect(message).toContain("The field password is mandatory.");
});

test("@ui @negative Verificar que el campo email sea un campo obligatorio", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);
  await home.goToCrearUsuario();
  const message = await createUser.mandatoryEmailField(createUsers.passwordCreateUser.password);
  await expect(message).toContain("The field email is mandatory.");
});

test("@ui @negative Verificar que el campo login sea un campo obligatorio", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);
  await home.goToCrearUsuario();
  const message = await createUser.mandatoryLoginField(createUsers.passwordCreateUser.password, createUsers.emailCreateUser.email );
  await expect(message).toContain("The field login is mandatory.");

});
test("@ui @positive Verificar que se pueda crear un usuario seleccionado el primer manager", async ({ loggedInPage, cleanupUltimoUsuario }) => {

  const home = new HomePage(loggedInPage);
  const users = new UsersPage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);
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

  // await loggedInPage.waitForURL("**/users");
  const success = await users.hasSuccessMessage();
  expect(success).toBeTruthy();
});

test("@ui @negative Verificar que el campo apellido sea un campo obligatorio", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);
  await home.goToCrearUsuario();
  const message = await createUser.mandatoryLastnameField(createUsers.passwordCreateUser.password,
     createUsers.emailCreateUser.email, createUsers.loginCreateUser.login);
  await expect(message).toContain("The field lastname is mandatory.");
});

test("@ui @negative Verificar que el campo nombre sea un campo obligatorio", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);
  await home.goToCrearUsuario();
  const message = await createUser.mandatoryFirstnameField(createUsers.passwordCreateUser.password, 
    createUsers.emailCreateUser.email, createUsers.loginCreateUser.login, createUsers.lastnameCreateUser.lastname );
  await expect(message).toContain("The field firstname is mandatory.");
});

test("@ui @positive Verificar que se pueda crear un usuario con campos opciones", async ({ loggedInPage, cleanupUltimoUsuario}) => {
  const home = new HomePage(loggedInPage);
  const users = new UsersPage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);
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
});

test("@ui @positive Verificar que se pueda crear un usuario con todos los campos completados correctamente", async ({ loggedInPage, cleanupUltimoUsuario }) => {
  const home = new HomePage(loggedInPage);
  const users = new UsersPage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);

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
});

test("@ui @positive Verificar que el modal de seleccionar manager se cierre al hacer clic en la X", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);
  await home.goToCrearUsuario();

  await createUser.closeManagerModalWithX();

  const isVisible = await loggedInPage.isVisible(createUser.managerModal);
  expect(isVisible).toBeFalsy();
});

test("@ui @positive Verificar que el modal de seleccionar manager se cierre al hacer clic en Cancel", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);
  await home.goToCrearUsuario();

  await createUser.closeManagerModalWithCancel();

  const isVisible = await loggedInPage.isVisible(createUser.managerModal);
  expect(isVisible).toBeFalsy();
});

test("@ui @positive Verificar que el buscador dentro del modal de manager filtre los resultados correctamente", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);
  await home.goToCrearUsuario();

  const results = await createUser.searchManager("balet");
  expect(results.length).toBeGreaterThan(0);
  expect(results.some(r => r.toLowerCase().includes("balet"))).toBeTruthy();
});

test("@ui @positive Verificar que se pueda seleccionar una entidad desde el modal y se complete el campo", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);

  await home.goToCrearUsuario();

  await createUser.selectEntityByIndex(0);
  const selectedEntity = await loggedInPage.inputValue(createUser.entityText);
  expect(selectedEntity).not.toBe("");
});

test("@ui @negative Verificar que al cancelar el modal de entidad no se complete el campo", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const createUser = new CreateUserPage(loggedInPage);

  await home.goToCrearUsuario();

  // await loggedInPage.waitForSelector(createUser.entityModal, { state: "visible" });
  await createUser.selectEntity();
  await createUser.closeEntityModalWithCancel();

  const selectedEntity = await loggedInPage.inputValue(createUser.entityText);
  expect(selectedEntity).toBe("");
});


