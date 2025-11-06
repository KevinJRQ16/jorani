import { test as base } from "@playwright/test";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { LoginPage } from "../pages/LoginPage.js";
import { HomePage } from "../pages/HomePage.js";
import { LeaveRequestPage } from "../pages/LeaveRequestPage.js";
import { RequestsPage } from "../pages/RequestsPage.js";
import { CreateUserPage } from "../pages/CreateUserPage.js";
import { UsersPage } from "../pages/UsersPage.js";
import { createUserRamd } from "../data/createUserRamd.js";
import { LeaveTypesPage } from "../pages/LeaveTypesPage.js";
import { execSync } from "child_process";

export const test = base.extend({
  sqliteConn: async ({}, use) => {
    console.log("regenerando testdata.db con faker");
    execSync("node scripts/seed.db.js");
    const db = await open({
      filename: "data/testdata.db",
      driver: sqlite3.Database,
    });

    await use(db);
    await db.close();
  },

  loggedInPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const loginPage = new LoginPage(page);
    await loginPage.goto("http://localhost/session/login");
    await loginPage.login("bbalet", "bbalet");

    await page.waitForURL("**/home");

    await use(page);

    // cerrar contexto al terminar el test
    // await context.close();
  },

  // createdRequest: async ({ loggedInPage }, use) => {
  //   const home = new HomePage(loggedInPage);
  //   const leaveRequestPage = new LeaveRequestPage(loggedInPage);
  //   const requestsPage = new RequestsPage(loggedInPage);

  //   // Ir a crear una solicitud
  //   await loggedInPage.goto("http://localhost/leaves/create");
  //   await loggedInPage.waitForSelector(leaveRequestPage.leaveTypeSelect);

  //   // Crear solicitud básica (tipo: Annual Leave)
  //   await leaveRequestPage.selectLeaveType("paid leave");
  //   await leaveRequestPage.selectStartDate();
  //   await leaveRequestPage.selectEndDate();
  //   await leaveRequestPage.setCause("Motivo automático de prueba1");
  //   await leaveRequestPage.submitRequested();

  //   await loggedInPage.waitForSelector("#flashbox");
  //   await loggedInPage.waitForTimeout(1000);

  //   await home.goToRequests();
  //   await loggedInPage.waitForURL("**/requests");

  //   await use(requestsPage);
  // },

  createdRequest: async ({ loggedInPage }, use) => {
    const home = new HomePage(loggedInPage);
    const leaveRequestPage = new LeaveRequestPage(loggedInPage);
    const requestsPage = new RequestsPage(loggedInPage);

    await loggedInPage.goto("http://localhost/leaves/create");

    await leaveRequestPage.selectLeaveType("paid leave");
    await leaveRequestPage.selectStartDate();
    await leaveRequestPage.selectEndDate();
    await leaveRequestPage.setCause("Motivo automático de prueba5");
    await leaveRequestPage.submitRequested();

    await loggedInPage.waitForSelector("#flashbox");

    // Ir a la lista y obtener la última solicitud
    // await home.goToRequests();
    // await loggedInPage.waitForSelector(requestsPage.requestsTable);

    // const lastRequest = await requestsPage.getLatestRequest(); 
    // console.log(lastRequest);
    // await use({ requestsPage, lastRequest });
    await use();
  },

  usuarioDePrueba: async ({ loggedInPage }, use) => {
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
      password: user.password
    });

    // espera que se muestre en la tabla (última página)
    // await loggedInPage.waitForSelector(`text=${user.login}`);

    // pasamos el login al test
    await use(user.login);
  },

  nuevoUsuarioDePrueba: async ({ loggedInPage }, use) => {
    const home = new HomePage(loggedInPage);
    const users = new UsersPage(loggedInPage);
    const createUser = new CreateUserPage(loggedInPage);
    await home.goToCrearUsuario();
    const user = createUserRamd.newValidUser;

    await createUser.fillForm({
      firstname: user.firstname,
      lastname: user.lastname,
      login: user.login,
      email: user.email, 
      password: user.password
    });

    // espera que se muestre en la tabla (última página)
    // await loggedInPage.waitForSelector(`text=${user.login}`);

    // pasamos el login al test
    await use(user.login);
  },

  cleanupLeaveType: async ({ loggedInPage }, use) => {
    const home = new HomePage(loggedInPage);
    const leaveTypes = new LeaveTypesPage(loggedInPage);

    await use(); // primero se ejecuta el test que crea el tipo

    console.log("iniciando limpieza del último tipo de permiso creado...");

    try {
      await loggedInPage.reload();
      await home.goToLeaveTypes();
      await leaveTypes.waitForTable();

      const rows = await leaveTypes.page.locator(leaveTypes.rows);
      const count = await rows.count();

      if (count === 0) {
        console.log("no hay tipos de permiso para eliminar.");
        return;
      }

      const lastRow = rows.nth(count - 1);
      const name = await lastRow.locator("td:nth-child(1)").innerText();
      console.log(`eliminando tipo de permiso: ${name}`);

      await lastRow.locator("a.confirm-delete").click();
      await leaveTypes.page.waitForSelector(leaveTypes.deleteModal, { state: "visible", timeout: 10000 });
      await leaveTypes.page.click(leaveTypes.deleteConfirm);
      await leaveTypes.page.waitForSelector(leaveTypes.deleteModal, { state: "hidden", timeout: 10000 });

      console.log("tipo de permiso eliminado correctamente.");
    } catch (error) {
      console.error("error durante la limpieza de tipo de permiso:", error.message);
    }
  },

  setupLeaveType: async ({ loggedInPage }, use) => {
    const home = new HomePage(loggedInPage);
    const leaveTypes = new LeaveTypesPage(loggedInPage);

    console.log("creando tipo de permiso de prueba...");

    const name = `Temporal_Test_${Date.now()}`; // nombre único por timestamp
    const acronym = "TT";

    await home.goToLeaveTypes();
    await leaveTypes.createLeaveType(name, acronym);

    console.log(`tipo de permiso creado: ${name}`);

    // pasamos el nombre al test
    await use(name);

    console.log("fixture setupLeaveType completado.");
  },

  usuarioTemporal: async ({ loggedInPage }, use) => {
    const home = new HomePage(loggedInPage);
    const createUser = new CreateUserPage(loggedInPage);
    const users = new UsersPage(loggedInPage);

    await home.goToCrearUsuario();
    const user = createUserRamd.validUser;

    await createUser.fillForm({
      firstname: user.firstname,
      lastname: user.lastname,
      login: user.login,
      email: user.email,
      password: user.password
    });

    await loggedInPage.waitForURL("**/users");

    const success = await users.hasSuccessMessage();
    if (!success) throw new Error("El usuario no se creó correctamente.");

    await use(user.login);

    console.log(`🧹 Eliminando usuario temporal: ${user.login}`);
    try {
      await users.deleteUserByLogin(user.login);
    } catch (err) {
      console.warn(`⚠️ No se pudo eliminar ${user.login}:`, err.message);
    }

    // try {
    //   console.log(`eliminando usuario temporal: ${login}`);
    //   await usersPage.deleteUserByLogin(login);
    // } catch (err) {
    //   console.warn(`no se pudo eliminar ${login}: ${err.message}`);
    // }

  },

  cleanupUltimoUsuario: async ({ loggedInPage }, use) => {
    const home = new HomePage(loggedInPage);
    const usersPage = new UsersPage(loggedInPage);

    await use();

    console.log("iniciando limpieza de último usuario creado");
    try {
      // // ir a la lista de usuarios
      // await home.goToListUsers();
      // await usersPage.changeEntriesTo(25);

      for (let i = 0; i < 40; i++) { 
        const nextButton = usersPage.page.locator("a.next");
        const disabled = await nextButton.getAttribute("class");
        if (disabled && disabled.includes("disabled")) break; 
        if (!(await nextButton.isVisible())) break; 
        await nextButton.click();
        await usersPage.page.waitForTimeout(800);
      }

      const rows = await usersPage.page.locator("table tbody tr");
      const count = await rows.count();

      if (count === 0) {
        console.log("no hay usuarios para eliminar");
        return;
      }

      const lastRow = rows.nth(count - 1);
      const login = await lastRow.locator("td:nth-child(3)").innerText(); 

      console.log(`eliminando último usuario con login: ${login}`);

      // await usersPage.page.reload();

      const deleteButton = lastRow.locator("a.confirm-delete");
      await deleteButton.click();

      await usersPage.page.waitForSelector(usersPage.deleteModal, { state: "visible" });
      await usersPage.page.click(`${usersPage.deleteModal} #action-delete`);
      await usersPage.page.waitForSelector(usersPage.deleteModal, { state: "hidden" });

      console.log("ultimo usuario eliminado correctamente.");
    } catch (error) {
      console.error("error durante la limpieza de usuario:", error.message);
    }
  },

});
