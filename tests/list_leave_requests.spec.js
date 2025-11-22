import { expect } from "@playwright/test";
import { test } from "../fixtures/fixtures.js";
import { LeavesPage } from "../pages/LeavesPage.js";
import { HomePage } from "../pages/HomePage.js";
import { LeaveRequestPage } from "../pages/LeaveRequestPage.js";
import { Logger, screenshotPath } from "../utils/helpers.js";

test("@exploratory @positive Verificar que se acceda exitosamente a la pagina de lista de solicitudes", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leavesPage = new LeavesPage(loggedInPage);

  try {
    Logger.info("navegando a la página de lista de solicitudes");
    await home.goToListOfLeaveRequests();
    await expect(loggedInPage.locator("#leaves")).toBeVisible();
    Logger.info("página de lista de solicitudes cargada correctamente");
  } catch (error) {
    Logger.error(`error al acceder a la lista de solicitudes: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_lista_solicitudes") });
    throw error;
  }
});

test("@exploratory @positive Verificar que se navegue por las paginas sin errores", async ({ loggedInPage, solicitudesTemporalesEstadoPlanned }) => {
  const home = new HomePage(loggedInPage);
  const leavesPage = new LeavesPage(loggedInPage);

  try {
    Logger.info("verificando navegación entre páginas de solicitudes");
    await home.goToListOfLeaveRequests();
    // await leavesPage.toggleStatus("accepted", true);
    // await leavesPage.changeEntriesTo("50");
    const total = await leavesPage.countAllLeaves();
    expect(total).toBeGreaterThan(0);
    Logger.info("navegación completada sin errores");
  } catch (error) {
    Logger.error(`error al navegar entre páginas: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_navegacion_paginas") });
    throw error;
  }
});

test("@exploratory @positive Verificar que se muestre los botones Export y New Request", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leavesPage = new LeavesPage(loggedInPage);

  try {
    Logger.info("verificando visibilidad de los botones export y new request");
    await home.goToListOfLeaveRequests();
    await leavesPage.verifyMainButtonsVisible();
    Logger.info("botones export y new request visibles correctamente");
  } catch (error) {
    Logger.error(`error al verificar botones principales: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_botones_principales") });
    throw error;
  }
});

test("@exploratory @positive Verificar que el selector 'Show entries' filtre por 25 solicitudes", async ({ loggedInPage, solicitudTemporalEstadoPlanned }) => {
  const home = new HomePage(loggedInPage);
  const leavesPage = new LeavesPage(loggedInPage);

  try {
    Logger.info("verificando filtro por 25 solicitudes");
    await home.goToListOfLeaveRequests();
    await leavesPage.changeEntriesTo("25");
    const count = await leavesPage.getRequestRowsCount();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(25);
    Logger.info("filtro por 25 solicitudes aplicado correctamente");
  } catch (error) {
    Logger.error(`error al aplicar filtro de 25 solicitudes: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_filtro_25") });
    throw error;
  }
});

test("@exploratory @positive Verificar que el selector 'Show entries' filtre por 50 solicitudes", async ({ loggedInPage, solicitudTemporalEstadoPlanned }) => {
  const home = new HomePage(loggedInPage);
  const leavesPage = new LeavesPage(loggedInPage);

  try {
    Logger.info("verificando filtro por 50 solicitudes");
    await home.goToListOfLeaveRequests();
    await leavesPage.changeEntriesTo("50");
    const count = await leavesPage.getRequestRowsCount();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(50);
    Logger.info("filtro por 50 solicitudes aplicado correctamente");
  } catch (error) {
    Logger.error(`error al aplicar filtro de 50 solicitudes: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_filtro_50") });
    throw error;
  }
});

test("@exploratory @positive Verificar que el selector 'Show entries' filtre por 100 solicitudes", async ({ loggedInPage, solicitudTemporalEstadoPlanned }) => {
  const home = new HomePage(loggedInPage);
  const leavesPage = new LeavesPage(loggedInPage);

  try {
    Logger.info("verificando filtro por 100 solicitudes");
    await home.goToListOfLeaveRequests();
    await leavesPage.changeEntriesTo("100");
    const count = await leavesPage.getRequestRowsCount();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(100);
    Logger.info("filtro por 100 solicitudes aplicado correctamente");
  } catch (error) {
    Logger.error(`error al aplicar filtro de 100 solicitudes: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_filtro_100") });
    throw error;
  }
});

test("@exploratory @positive Verificar que cada solicitud debe tener un estado válido", async ({ loggedInPage, solicitudTemporalEstadoPlanned }) => {
  const home = new HomePage(loggedInPage);
  const leavesPage = new LeavesPage(loggedInPage);

  try {
    Logger.info("verificando que cada solicitud tenga un estado válido");
    await home.goToListOfLeaveRequests();
    await leavesPage.verifyValidStatuses();
    Logger.info("todas las solicitudes tienen un estado válido");
  } catch (error) {
    Logger.error(`error al verificar estados válidos: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_estados_validos") });
    throw error;
  }
});

test("@exploratory @positive Verificar que se filtre por tipo de permiso y muestre cuantos registros hay", async ({ loggedInPage, solicitudesTemporalesAceptadaYRechazada }) => {
  const home = new HomePage(loggedInPage);
  const leavesPage = new LeavesPage(loggedInPage);

  try {
    Logger.info("filtrando por tipo de permiso 'special leave'");
    await home.goToListOfLeaveRequests();
    await leavesPage.filterByType("special leave");
    const rows = loggedInPage.locator("#leaves tbody tr");
    const rowCount = await rows.count();
    Logger.info(`filas filtradas: ${rowCount}`);
    expect(rowCount).toBeGreaterThanOrEqual(0);
    Logger.info("filtro por tipo de permiso aplicado correctamente");
  } catch (error) {
    Logger.error(`error al filtrar por tipo de permiso: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_filtro_tipo_permiso") });
    throw error;
  }
});

test("@exploratory @positive Verificar que muestre solo las solicitudes aceptadas", async ({ loggedInPage, solicitudesTemporalesAceptadaYRechazada }) => {
  const home = new HomePage(loggedInPage);
  const leavesPage = new LeavesPage(loggedInPage);

  try {
    Logger.info("filtrando solicitudes aceptadas");
    await home.goToListOfLeaveRequests();
    await leavesPage.toggleStatus("Accepted", true);
    const rows = loggedInPage.locator("#leaves tbody tr");
    const count = await rows.count();
    Logger.info(`filas después del filtro: ${count}`);

    for (let i = 0; i < count; i++) {
      const status = await rows.nth(i).locator("span").innerText();
      expect(status.toLowerCase()).toContain("accepted");
    }
    Logger.info("todas las solicitudes filtradas son aceptadas");
  } catch (error) {
    Logger.error(`error al verificar solicitudes aceptadas: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_solicitudes_aceptadas") });
    throw error;
  }
});

test("@exploratory @positive Verificar que el texto de informacion tenga un formato valido", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);

  try {
    Logger.info("verificando formato de texto de información");
    await home.goToListOfLeaveRequests();
    const infoText = await loggedInPage.locator("#leaves_info").innerText();
    Logger.info(`info: ${infoText}`);
    expect(infoText).toMatch(/Showing\s+\d+\s+to\s+\d+\s+of\s+\d+\s+entries/i);
    Logger.info("texto de información con formato válido");
  } catch (error) {
    Logger.error(`error al verificar texto de información: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_texto_informacion") });
    throw error;
  }
});

test("@exploratory @positive Verificar que la tabla tenga los encabezados correctos", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);

  try {
    Logger.info("verificando encabezados de la tabla");
    await home.goToListOfLeaveRequests();
    const expectedHeaders = ["ID", "Start Date", "End Date", "Type", "Status"];
    const headers = await loggedInPage.locator("#leaves thead th").allInnerTexts();
    Logger.info(`encabezados encontrados: ${headers}`);
    expectedHeaders.forEach(header => {
      expect(headers.join(" ")).toContain(header);
    });
    Logger.info("encabezados verificados correctamente");
  } catch (error) {
    Logger.error(`error al verificar encabezados: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_encabezados_tabla") });
    throw error;
  }
});

test("@exploratory @positive Veriificar que el boton 'New Request' abra el formulario de nueva solicitud", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const leavesPage = new LeavesPage(loggedInPage);

  try {
    Logger.info("verificando botón new request");
    await home.goToListOfLeaveRequests();
    await leavesPage.newRequestButton.click();
    await loggedInPage.waitForURL("**/leaves/create");
    expect(loggedInPage.url()).toContain("/leaves/create");
    Logger.info("botón new request abrió correctamente el formulario");
  } catch (error) {
    Logger.error(`error al abrir formulario con botón new request: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_boton_new_request") });
    throw error;
  }
});

test("@exploratory @positive Verificar que al hacer clic en botn 'Export this list' debería descargar un archivo", async ({ loggedInPage, solicitudTemporalEstadoPlanned }) => {
  const home = new HomePage(loggedInPage);
  const leavesPage = new LeavesPage(loggedInPage);

  try {
    Logger.info("verificando descarga con botón export this list");
    await home.goToListOfLeaveRequests();

    const [download] = await Promise.all([
      loggedInPage.waitForEvent("download"),
      loggedInPage.click(leavesPage.exportButton),
    ]);

    const path = await download.path();
    Logger.info(`archivo exportado: ${path}`);
    expect(download.suggestedFilename()).toMatch(/leaves/i);
    Logger.info("descarga realizada correctamente");
  } catch (error) {
    Logger.error(`error al descargar archivo: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_exportar_lista") });
    throw error;
  }
});

test("@exploratory @positive Verificar que se muestre el mensaje 'No matching records found' si no hay resultados al filtrar por tipo de permiso", async ({ loggedInPage, solicitudTemporalEstadoPlanned }) => {
  const home = new HomePage(loggedInPage);
  const leavesPage = new LeavesPage(loggedInPage);

  try {
    Logger.info("verificando mensaje sin resultados");
    await home.goToListOfLeaveRequests();
    await leavesPage.filterByType("compensate");
    const message = await loggedInPage.locator("#leaves td.dataTables_empty").innerText();
    expect(message).toMatch(/No matching records found/i);
    Logger.info("mensaje sin resultados mostrado correctamente");
  } catch (error) {
    Logger.error(`error al verificar mensaje sin resultados: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_mensaje_no_resultados") });
    throw error;
  }
});

test("@exploratory @positive Verificar que el buscador permite buscar correctamente una solicitud existente", async ({ loggedInPage, solicitudTemporalEstadoPlanned }) => {
  const home = new HomePage(loggedInPage);
  const leavesPage = new LeavesPage(loggedInPage);

  try {
    Logger.info("verificando búsqueda de solicitud existente");
    await home.goToListOfLeaveRequests();
    const causa = solicitudTemporalEstadoPlanned;
    await leavesPage.searchLeave(causa);
    const rows = await leavesPage.getTableData();
    expect(rows.some(r => r.toString().includes(causa))).toBeTruthy();
    Logger.info("búsqueda de solicitud existente realizada correctamente");
  } catch (error) {
    Logger.error(`error al buscar solicitud existente: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_busqueda_existente") });
    throw error;
  }
});

test("@exploratory @negative Verificar que al buscar una solicitud inexistente se muestre un mensaje en fila", async ({ loggedInPage, solicitudTemporalEstadoPlanned }) => {
  const home = new HomePage(loggedInPage);
  const leavesPage = new LeavesPage(loggedInPage);

  try {
    Logger.info("verificando búsqueda de solicitud inexistente");
    await home.goToListOfLeaveRequests();
    await leavesPage.searchLeave("Inexistente123");
    const count = await leavesPage.getRequestRowsCount();
    expect(count).toBe(1);
    const infoText = await leavesPage.getInfoTextSearch();
    expect(infoText).toContain("No matching records found");
    Logger.info("búsqueda inexistente mostró mensaje correctamente");
  } catch (error) {
    Logger.error(`error al verificar búsqueda inexistente: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_busqueda_inexistente") });
    throw error;
  }
});

test("@exploratory @positive Verificar cuantas solicitudes hay en la lista y que coincida con el total mostrado", async ({ loggedInPage, solicitudTemporalEstadoPlanned }) => {
  test.info().annotations.push({ type: "smoke", description: "flujo crítico" });

  const home = new HomePage(loggedInPage);
  const leavesPage = new LeavesPage(loggedInPage);

  try {
    Logger.info("verificando total de solicitudes en la lista");
    await home.goToListOfLeaveRequests();
    // await leavesPage.changeEntriesTo("100");
    const displayedTotal = await leavesPage.getDisplayedTotal();
    const countedTotal = await leavesPage.countAllLeaves();
    Logger.info(`total mostrado: ${displayedTotal} | total contado: ${countedTotal}`);
    expect(countedTotal).toBe(displayedTotal);
    Logger.info("totales coinciden correctamente");
  } catch (error) {
    Logger.error(`error al verificar totales de solicitudes: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_totales_solicitudes") });
    throw error;
  }
});
