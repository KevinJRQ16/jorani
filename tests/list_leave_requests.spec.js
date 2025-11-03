import { expect } from "@playwright/test";
import { test } from "../fixtures/fixtures.js";
import { LeavesPage } from "../pages/LeavesPage.js";
import { HomePage } from "../pages/HomePage.js";
import { LeaveRequestPage } from "../pages/LeaveRequestPage.js";

test("@ui @positive Verificar que se acceda exitosamente a la pagina de lista de solicitudes", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const leavesPage = new LeavesPage(loggedInPage);

    await home.goToListOfLeaveRequests();
    await expect(loggedInPage.locator("#leaves")).toBeVisible();
});

test("@ui @positive Verificar que se navegue por las paginas sin errores", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const leavesPage = new LeavesPage(loggedInPage);
    await home.goToListOfLeaveRequests();
    await leavesPage.toggleStatus("accepted", true);
    await leavesPage.changeEntriesTo("50");
    const total = await leavesPage.countAllLeaves();
    expect(total).toBeGreaterThan(0);
});

test("@ui @positive Verificar que se muestre los botones Export y New Request", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const leavesPage = new LeavesPage(loggedInPage);

    await home.goToListOfLeaveRequests();
    await leavesPage.verifyMainButtonsVisible();
});

//filtro x show
test("@ui @positive Verificar que el selector 'Show entries' filtre por 25 solicitudes", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leavesPage = new LeavesPage(loggedInPage);

  await home.goToListOfLeaveRequests();

  await leavesPage.changeEntriesTo("25");
  const count = await leavesPage.getRequestRowsCount();
  expect(count).toBeGreaterThanOrEqual(1);
  expect(count).toBeLessThanOrEqual(25);
});

test("@ui @positive Verificar que el selector 'Show entries' filtre por 50 solicitudes", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leavesPage = new LeavesPage(loggedInPage);

  await home.goToListOfLeaveRequests();

  await leavesPage.changeEntriesTo("50");
  const count = await leavesPage.getRequestRowsCount();
  expect(count).toBeGreaterThanOrEqual(1);
  expect(count).toBeLessThanOrEqual(50);
});

test("@ui @positive Verificar que el selector 'Show entries' filtre por 100 solicitudes", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leavesPage = new LeavesPage(loggedInPage);

  await home.goToListOfLeaveRequests();

  await leavesPage.changeEntriesTo("100");
  const count = await leavesPage.getRequestRowsCount();
  expect(count).toBeGreaterThanOrEqual(1);
  expect(count).toBeLessThanOrEqual(100);
});

test("@ui @positive Verificar que cada solicitud debe tener un estado válido", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const leavesPage = new LeavesPage(loggedInPage);

    await home.goToListOfLeaveRequests();
    await leavesPage.verifyValidStatuses();
});

test("@ui @positive Verificar que se filtre por tipo de permiso y muestre cuantos registros hay", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const leavesPage = new LeavesPage(loggedInPage);

    await home.goToListOfLeaveRequests();
    await leavesPage.filterByType("paid leave");

    const rows = loggedInPage.locator("#leaves tbody tr");
    const rowCount = await rows.count();
    console.log(`filas filtradas por tipo de permiso 'paid leave' ${rowCount}`);
    expect(rowCount).toBeGreaterThanOrEqual(0);
});

test("@ui @positive Verificar que muestre solo las solicitudes aceptadas", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const leavesPage = new LeavesPage(loggedInPage);

    await home.goToListOfLeaveRequests();
    await leavesPage.toggleStatus("Accepted", true);

    const rows = loggedInPage.locator("#leaves tbody tr");
    const count = await rows.count();
    console.log(`filas después del filtro: ${count}`);

    for (let i = 0; i < count; i++) {
        const status = await rows.nth(i).locator("span").innerText();
        expect(status.toLowerCase()).toContain("accepted");
    }
});

test("@ui @positive Verificar que el texto de informacion tenga un formato valido", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    await home.goToListOfLeaveRequests();

    const infoText = await loggedInPage.locator("#leaves_info").innerText();
    console.log(`info: ${infoText}`);
    expect(infoText).toMatch(/Showing\s+\d+\s+to\s+\d+\s+of\s+\d+\s+entries/i);
});

test("@ui @positive Verificar que la tabla tenga los encabezados correctos", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    await home.goToListOfLeaveRequests();

    const expectedHeaders = ["ID", "Start Date", "End Date", "Type", "Status"];
    const headers = await loggedInPage.locator("#leaves thead th").allInnerTexts();

    console.log("encabezados:", headers);
    expectedHeaders.forEach(header => {
        expect(headers.join(" ")).toContain(header);
    });
});

test("@ui @positive Veriificar que el boton 'New Request' abra el formulario de nueva solicitud", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const leavesPage = new LeavesPage(loggedInPage);


    await home.goToListOfLeaveRequests();

    await leavesPage.newRequestButton.click();
    await loggedInPage.waitForURL("**/leaves/create");
    expect(loggedInPage.url()).toContain("/leaves/create");
});

test("@ui @positive Verificar que al hacer clic en botn 'Export this list' debería descargar un archivo", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const leavesPage = new LeavesPage(loggedInPage);

    await home.goToListOfLeaveRequests();

    const [download] = await Promise.all([
        loggedInPage.waitForEvent("download"),
        loggedInPage.click(leavesPage.exportButton),
    
    ]);

    const path = await download.path();
    console.log(`archivo exportado: ${path}`);
    expect(download.suggestedFilename()).toMatch(/leaves/i);
});

test("@ui @positive Verificar que se muestre el mensaje 'No matching records found' si no hay resultados al filtrar por tipo de permiso", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const leavesPage = new LeavesPage(loggedInPage);

    await home.goToListOfLeaveRequests();
    await leavesPage.filterByType("compensate");

    const message = await loggedInPage.locator("#leaves td.dataTables_empty").innerText();
    expect(message).toMatch(/No matching records found/i);
});

test("@ui @positive Verificar que el buscador permite buscar correctamente una solicitud existente", async ({ loggedInPage }) => {

  const home = new HomePage(loggedInPage);
  const leavesPage = new LeavesPage(loggedInPage);

  await home.goToListOfLeaveRequests();
  await leavesPage.searchLeave("accepted");
  
  const rows = await leavesPage.getTableData();
  expect(rows.some(r => r.toString().includes("Accepted"))).toBeTruthy();
});

test("@ui @negative Verificar que al buscar una solicitud inexistente se muestre un mensaje en fila", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const leavesPage = new LeavesPage(loggedInPage);

    await home.goToListOfLeaveRequests(loggedInPage);

    await leavesPage.searchLeave("Inexistente123");
    const count = await leavesPage.getRequestRowsCount();
    expect(count).toBe(1);

    const infoText = await leavesPage.getInfoTextSearch();
    expect(infoText).toContain("No matching records found");
});

test("@ui @positive Verificar cuantas solicitudes hay en la lista y que coincida con el total mostrado", async ({ loggedInPage }) => {
    test.info().annotations.push({ type: "smoke", description: "flujo crítico" });

    const home = new HomePage(loggedInPage);
    const leavesPage = new LeavesPage(loggedInPage);

    await home.goToListOfLeaveRequests();
    await leavesPage.changeEntriesTo("100");

    const displayedTotal = await leavesPage.getDisplayedTotal();
    const countedTotal = await leavesPage.countAllLeaves();

    console.log(`total mostrado: ${displayedTotal}`);
    console.log(`total contado: ${countedTotal}`);
    expect(countedTotal).toBe(displayedTotal);
});

// test("@r18 Verificar que se muestre los detalles de todas las solicitudes", async ({ loggedInPage }) => {
//     const home = new HomePage(loggedInPage);
//     const leavesPage = new LeavesPage(loggedInPage);

//     await home.goToListOfLeaveRequests();
//     await leavesPage.logAllLeavesDetails();
// });