// tests/leave_request.spec.js
// import { test, expect } from "../fixtures/fixtures.js";
import { expect } from "@playwright/test";
import { test } from "../fixtures/fixtures.js";
import { LeaveRequestPage } from "../pages/LeaveRequestPage.js";
import { HomePage } from "../pages/HomePage.js";
import leaveRequests from "../data/leaveRequests.json" assert { type: "json" };
import { LeavesPage } from "../pages/LeavesPage.js";

test("@ui @positive Verificar creacion exitosa de solicitud", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);
  const leaveRequest = new LeavesPage(loggedInPage);

  await home.goToCreateLeave();
  const data = leaveRequests.validLeave;
  await leave.selectLeaveType(data.type);
  await leave.selectStartDate(); 
  await leave.selectEndDate();    
  await leave.setCause(data.cause);
  await leave.submitRequested();

  const hasMessage = await leaveRequest.hasSuccessMessage();
  expect(hasMessage).toBeTruthy(); 
});

test("@ui @positive Verificar creacion exitosa de solicitud planificada", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);
  const leaveRequest = new LeavesPage(loggedInPage);

  await home.goToCreateLeave();
  const data = leaveRequests.validLeave;
  await leave.selectLeaveType(data.type);
  await leave.selectStartDate(); 
  await leave.selectEndDate();    
  await leave.setCause(data.cause);
  await leave.submitPlanned();

  const hasMessage = await leaveRequest.hasSuccessMessage();
  expect(hasMessage).toBeTruthy(); 
});

test("@ui @negative Verificar que en campo 'End Date' no se permita seleccionar una fecha anterior a 'Start Date'", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);
  await home.goToCreateLeave();
  //The field Duration is mandatory.
  const data = leaveRequests.invalidDate;
  await leave.selectLeaveType(data.type);
  await leave.selectStartDate();
  await leave.selectEndDatePassed();
  // await leave.submitRequested();
  const message = await leave.mandatoryDurationField();
  expect(message).toContain("The field Duration is mandatory.");
});


test("@ui @positive Verificar que los campos obligatorios estén visibles", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);

  await home.goToCreateLeave();

  await expect(leave.page.locator(leave.startDateInput)).toBeVisible();
  await expect(leave.page.locator(leave.endDateInput)).toBeVisible();
  await expect(leave.page.locator(leave.durationInput)).toBeVisible();
});
  

test("@ui @positive Verificar que al ingresar una fecha pasada en 'End date' se actualiza al 'Start date' y se guarda", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);
  const leaveRequest = new LeavesPage(loggedInPage);

  await home.goToCreateLeave();
  const data = leaveRequests.invalidDate;
  await leave.selectLeaveType(data.type);
  await leave.selectStartDate();
  await leave.setEndDate(data.endDate);
  await loggedInPage.keyboard.press('Enter');
  // await leave.submitRequested();
  await leave.fieldEndDate();
  const hasMessage = await leaveRequest.hasSuccessMessage();
  expect(hasMessage).toBeTruthy(); 

});

test("@ui @negative Verificar que el campo 'Duration' sea un campo obligatorio", async({loggedInPage}) =>{
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);
  await home.goToCreateLeave();
  const message = await leave.mandatoryDurationField();
  expect(message).toContain("The field Duration is mandatory.");
});

test("@ui @negative Verificar que el campo 'Start Date' sea un campo obligatorio", async({loggedInPage}) =>{
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);
  await home.goToCreateLeave();
  const message = await leave.mandatoryStartDateField("5", leaveRequests.invalidDate.endDate);
  expect(message).toContain("The field Start Date is mandatory.");
});
  
test("@ui @negative Verificar que el campo End Date sea un campo obligatorio", async({loggedInPage}) =>{
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);
  await home.goToCreateLeave();

  const message = await leave.mandatoryEndDateField("5", leaveRequests.invalidDate.startDate);
  expect(message).toContain("The field End Date is mandatory.");
});

test("@ui @positive Verificar que al ingresar una fecha pasada en 'End date' y hacer escape esta se actualiza al 'Start date' y se guarda correctamente", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);
  const leaveRequest = new LeavesPage(loggedInPage);

  await home.goToCreateLeave();
  const data = leaveRequests.invalidDate;
  await leave.selectLeaveType(data.type);
  await leave.selectStartDate();
  await leave.setEndDate(data.endDate);
  await loggedInPage.keyboard.press('Escape');
  // await leave.submitRequested();
  await leave.fieldEndDateEscape();
  const hasMessage = await leaveRequest.hasSuccessMessage();
  expect(hasMessage).toBeTruthy(); 
});

test("@ui @negative Verificar que una vez fechas seleccionadas se borre el campo duracion no se permita guardar", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);

  await home.goToCreateLeave();
  const userData = leaveRequests.invalidDate;
  await leave.selectLeaveType(userData.type);
  await leave.selectStartDate(); 
  await leave.selectEndDate();    
  // await leave.setCause(userData.cause);
  await leave.deleteDurationField();

  const message = await leave.mandatoryDurationField();
  expect(message).toContain("The field Duration is mandatory.");
});

test.fail("@ui @negative Verificar que una vez fechas ingresadas modificar el campo duracion no se permita guardar", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);
  const leaveRequest = new LeavesPage(loggedInPage);
//   const usersPage = new UsersPage(loggedInPage);

  await home.goToCreateLeave();
  const data = leaveRequests.invalidDate;
  await leave.selectLeaveType(data.type);
  await leave.selectStartDate(); 
  await leave.selectEndDate();    
  await leave.modifyDurationField("10");
  const hasMessage = await leaveRequest.hasSuccessMessage();
  expect(hasMessage).toBeTruthy(); 
});

test("@ui @positive Verificar que calculo automático de duración sea correcto", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leave = new LeaveRequestPage(loggedInPage);

  await home.goToCreateLeave();
  const data = leaveRequests.invalidDate;
  await leave.selectLeaveType(data.type);
  await leave.selectStartDate(); 
  await leave.selectEndDate();

  await loggedInPage.waitForTimeout(1000);

  const durationValue = await leave.getDuration();
//   expect(Number(durationValue)).toBe(6);
  console.log("Duración calculada automáticamente:", durationValue);
  expect(Number(durationValue)).toBeGreaterThan(0);
  expect(Number(durationValue)).toBe(6);
});
