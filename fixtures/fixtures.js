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
import { OvertimeRequestPage } from "../pages/OvertimeRequestPage.js";
import { ExtrasPage } from "../pages/ExtrasPage.js";
import { OvertimePage } from "../pages/OvertimePage.js";
import { execSync } from "child_process";
import { faker } from "@faker-js/faker";
import { LeavesPage } from "../pages/LeavesPage.js";

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

    // await context.close();
  },

  solicitudesTemporales: async ({ loggedInPage }, use) => {
    const home = new HomePage(loggedInPage);
    const leaveRequestPage = new LeaveRequestPage(loggedInPage);
    const requestsPage = new RequestsPage(loggedInPage);

    for (let i = 0; i < 10; i++) {
      await home.goToCreateLeave();
      await leaveRequestPage.selectLeaveType("special leave");
      await leaveRequestPage.selectStartDate();
      await leaveRequestPage.selectEndDate();
      await leaveRequestPage.setCause("Solicitud de prueba para buscador");
      await leaveRequestPage.submitRequested();
    }

    await use();    
  },

  solicitudesTemporalesEstadoPlanned: async ({ loggedInPage }, use) => {
    const home = new HomePage(loggedInPage);
    const leaveRequestPage = new LeaveRequestPage(loggedInPage);
    const leavesPage = new LeavesPage(loggedInPage);

    const causas = []; 

    for (let i = 0; i < 11; i++) {
      await home.goToCreateLeave();
      await leaveRequestPage.selectLeaveType("special leave");
      await leaveRequestPage.selectStartDate();
      await leaveRequestPage.selectEndDate();
      const causa = await leaveRequestPage.setCause("Solicitud " + Date.now().toString());
      causas.push(causa);
      await leaveRequestPage.submitPlanned();
    }

    await use(causas);    

    for (const causa of causas) {
      await home.goToListOfLeaveRequests();
      await leavesPage.searchLeave(causa);
      await leavesPage.deleteFirstLeave();
    }
  },

  solicitudTemporalEstadoPlanned: async ({ loggedInPage }, use) => {
    const home = new HomePage(loggedInPage);
    const leaveRequestPage = new LeaveRequestPage(loggedInPage);
    const leavesPage = new LeavesPage(loggedInPage);

    await home.goToCreateLeave();
    await leaveRequestPage.selectLeaveType("special leave");
    await leaveRequestPage.selectStartDate();
    await leaveRequestPage.selectEndDate();
    const causa = await leaveRequestPage.setCause("Solicitud " + Date.now().toString());
    await leaveRequestPage.submitPlanned();

    await use(causa);    

    await home.goToListOfLeaveRequests();
    await leavesPage.searchLeave(causa);
    await leavesPage.deleteFirstLeave();
  },

  solicitudTemporal: async ({ loggedInPage }, use) => {
    const home = new HomePage(loggedInPage);
    const leaveRequestPage = new LeaveRequestPage(loggedInPage);
    const requestsPage = new RequestsPage(loggedInPage);

    // await loggedInPage.goto("http://localhost/leaves/create");
    await home.goToCreateLeave();

    await leaveRequestPage.selectLeaveType("special leave");
    await leaveRequestPage.selectStartDate();
    await leaveRequestPage.selectEndDate();
    await leaveRequestPage.setCause("Solicitud de prueba para buscador");
    await leaveRequestPage.submitRequested();

    await use();
    await home.goToRequests();
    await requestsPage.acceptFirstRequest();
  },

  solicitudesTemporalesAceptadaYRechazada: async ({ loggedInPage }, use) => {
    const home = new HomePage(loggedInPage);
    const leaveRequestPage = new LeaveRequestPage(loggedInPage);
    const requestsPage = new RequestsPage(loggedInPage);

    // await loggedInPage.goto("http://localhost/leaves/create");
    await home.goToCreateLeave();

    await leaveRequestPage.selectLeaveType("special leave");
    await leaveRequestPage.selectStartDate();
    await leaveRequestPage.selectEndDate();
    await leaveRequestPage.setCause("Solicitud de prueba para buscador");
    await leaveRequestPage.submitRequested();
    await home.goToRequests();
    await requestsPage.acceptFirstRequest();

    await home.goToCreateLeave();
    await leaveRequestPage.selectLeaveType("special leave");
    await leaveRequestPage.selectStartDate();
    await leaveRequestPage.selectEndDate();
    await leaveRequestPage.setCause("Solicitud de prueba para buscador");
    await leaveRequestPage.submitRequested();
    await home.goToRequests();
    await requestsPage.rejectFirstRequest();

    await use();

  },

  createdRequest: async ({ loggedInPage }, use) => {
    const home = new HomePage(loggedInPage);
    const leaveRequestPage = new LeaveRequestPage(loggedInPage);
    const requestsPage = new RequestsPage(loggedInPage);

    await home.goToCreateLeave();
    await leaveRequestPage.selectLeaveType("paid leave");
    await leaveRequestPage.selectStartDate();
    await leaveRequestPage.selectEndDate();
    await leaveRequestPage.setCause("Solicitud de prueba");
    await leaveRequestPage.submitRequested();

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

    // await loggedInPage.waitForSelector(`text=${user.login}`);

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

    // await loggedInPage.waitForSelector(`text=${user.login}`);

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

    console.log(`eliminando usuario temporal: ${user.login}`);
    try {
      await users.deleteUserByLogin(user.login);
    } catch (err) {
      console.warn(`no se pudo eliminar ${user.login}:`, err.message);
    }
  },

  cleanupUltimoUsuario: async ({ loggedInPage }, use) => {
    const home = new HomePage(loggedInPage);
    const usersPage = new UsersPage(loggedInPage);

    await use();

    console.log("iniciando limpieza de último usuario creado");
    try {
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

  solicitudHorasExtraEstadoRequested: async ({ loggedInPage }, use) => {
    const home = new HomePage(loggedInPage);
    const overtime = new OvertimeRequestPage(loggedInPage);
    const extras = new ExtrasPage(loggedInPage);
  
    await home.goToCreateOvertime();
    await overtime.selectDate();
    await overtime.setDuration("0.5");
    await overtime.setReason("Trabajo adicional en proyecto1");
    await overtime.selectStatus("Requested");
    await overtime.submitRequest();

    await use();
  },

  usuariosParaPaginacion: async ({ loggedInPage }, use) => {
    const home = new HomePage(loggedInPage);
    const createUser = new CreateUserPage(loggedInPage);
    const usersPage = new UsersPage(loggedInPage);

    const createdLogins = [];

    for (let i = 0; i < 10; i++) {
      const user = {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        login: faker.internet.username().toLowerCase() + "_" + Date.now() + "_" + i,
        email: faker.internet.email().toLowerCase(),
        password: faker.internet.password({ length: 8 }),
      };

      await home.goToCrearUsuario();
      await createUser.fillForm(user);

      createdLogins.push(user.login);
    }

    await use();

    // try {
    //   await home.goToListUsers();
    //   for (const login of createdLogins) {
    //     const eliminado = await usersPage.deleteUserByLogin(login);

    //     if (eliminado) {
    //       await loggedInPage.reload();
    //       await this.page.keyboard.press('F5');
    //       await home.goToListUsers();

    //       // await loggedInPage.waitForTimeout(500);

    //       // await loggedInPage.keyboard.down('Control');
    //       // await loggedInPage.keyboard.press('F5');
    //       // await loggedInPage.keyboard.press('F5');
    //       // await loggedInPage.keyboard.up('Control');

    //       await loggedInPage.waitForLoadState("domcontentloaded");
    //       await loggedInPage.waitForTimeout(800);
    //     } 
    //   }
    // } catch (err) {
    //   console.warn("Error eliminando usuario de paginación:", err.message);
    // }
  },

  horasExtrasParaPaginacion: async ({ loggedInPage }, use) => {
    const home = new HomePage(loggedInPage);
    const overtimeForm = new OvertimeRequestPage(loggedInPage);
    const extras = new ExtrasPage(loggedInPage);
    const overtimePage = new OvertimePage(loggedInPage);
    
    

    const solicitudesCreadas = [];

    for (let i = 0; i < 11; i++) {
      await home.goToCreateOvertime();

      const duration = faker.helpers.arrayElement(["0.125", "0.25", "0.5", "1"]);
      const reason = `solicitud de horas extra temporal ${faker.word.noun()}_${i}_${Date.now()}`;

      await overtimeForm.selectDate();
      await overtimeForm.setDuration(duration);
      await overtimeForm.setReason(reason);
      await overtimeForm.selectStatus("Requested");

      await overtimeForm.submitRequest();

      solicitudesCreadas.push({ duration, reason });
      await loggedInPage.waitForSelector("#flashbox");
    }

    await use();

    // await home.goToOvertime();

    for (let i = 0; i < solicitudesCreadas.length; i++) {
      await overtimePage.acceptFirstOvertime();
      await loggedInPage.waitForTimeout(500);
    }

  },

  solicitudHorasExtrasTemporal: async ({ loggedInPage }, use) => {
    const home = new HomePage(loggedInPage);
    const overtimeForm = new OvertimeRequestPage(loggedInPage);
    const extras = new ExtrasPage(loggedInPage);
    const overtimePage = new OvertimePage(loggedInPage);

    await home.goToCreateOvertime();

    const duration = faker.helpers.arrayElement(["0.125", "0.25", "0.5", "1"]);
    const reason = `solicitud de horas extra temporal`;

    await overtimeForm.selectDate();
    await overtimeForm.setDuration(duration);
    await overtimeForm.setReason(reason);
    await overtimeForm.selectStatus("Requested");

    await overtimeForm.submitRequest();

    await loggedInPage.waitForSelector("#flashbox");

    await use();

    await home.goToOvertime();

    await overtimePage.acceptFirstOvertime();
    await loggedInPage.waitForTimeout(500);
    

  }
});
