import { expect } from "@playwright/test";
import { test } from "../fixtures/fixtures.js";
import { HomePage } from "../pages/HomePage.js";
import { OvertimePage } from "../pages/OvertimePage.js";
import { Logger, screenshotPath } from "../utils/helpers.js";

test("@exploratory @positive verificar que se acceda a la página de horas extra", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtimePage = new OvertimePage(loggedInPage);

  try {
    Logger.info("navegando a la página de horas extra");
    await home.goToOvertime();
    await expect(loggedInPage.locator(overtimePage.overtimeTable)).toBeVisible();
    Logger.info("página de horas extra cargada correctamente");
  } catch (error) {
    Logger.error(`error al acceder a la página de horas extra: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_acceder_pagina_overtime") });
    throw error;
  }
});

test("@exploratory @positive verificar que se muestre la tabla de horas extra al ingresar", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtimePage = new OvertimePage(loggedInPage);

  try {
    Logger.info("verificando visibilidad de la tabla de horas extra");
    await home.goToOvertime();
    const count = await overtimePage.getRowCount();
    expect(count).toBeGreaterThan(0);
    Logger.info("tabla de horas extra visible correctamente");
  } catch (error) {
    Logger.error(`error al mostrar tabla de horas extra: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_tabla_overtime") });
    throw error;
  }
});

test("@exploratory @positive verificar que se pueda rechazar una solicitud de horas extra correctamente", async ({ loggedInPage, solicitudHorasExtraEstadoRequested }) => {
  const home = new HomePage(loggedInPage);
  const overtimePage = new OvertimePage(loggedInPage);

  try {
    Logger.info("intentando rechazar una solicitud de horas extra");
    await home.goToOvertime();
    await overtimePage.rejectFirstOvertime();

    const hasMessage = await overtimePage.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();
    Logger.info("solicitud rechazada correctamente");
  } catch (error) {
    Logger.error(`error al rechazar solicitud de horas extra: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_rechazar_overtime") });
    throw error;
  }
});

test("@exploratory @positive verificar que se pueda aceptar una solicitud de horas extra correctamente", async ({ loggedInPage, solicitudHorasExtraEstadoRequested }) => {
  const home = new HomePage(loggedInPage);
  const overtimePage = new OvertimePage(loggedInPage);
  const acceptButton = ".btn-accept";

  try {
    Logger.info("intentando aceptar una solicitud de horas extra");
    await home.goToOvertime();
    await overtimePage.acceptFirstOvertime();

    const hasMessage = await overtimePage.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();
    Logger.info("solicitud de horas extra aceptada correctamente");
  } catch (error) {
    Logger.error(`error al aceptar solicitud de horas extra: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_aceptar_overtime") });
    throw error;
  }
});

test("@exploratory @positive verificar que el filtro 'show entries' funcione correctamente con 25", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtimePage = new OvertimePage(loggedInPage);

  try {
    Logger.info("cambiando 'show entries' a 25");
    await home.goToOvertime();
    await overtimePage.changeEntriesTo(25);
    const count = await overtimePage.getRowCount();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(25);
    Logger.info("filtro de 25 entradas verificado correctamente");
  } catch (error) {
    Logger.error(`error al aplicar filtro de 25 entries: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_entries_25_overtime") });
    throw error;
  }
});

test("@exploratory @positive verificar que el filtro 'show entries' funcione correctamente con 50", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtimePage = new OvertimePage(loggedInPage);

  try {
    Logger.info("cambiando 'show entries' a 50");
    await home.goToOvertime();
    await overtimePage.changeEntriesTo(50);
    const count = await overtimePage.getRowCount();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(50);
    Logger.info("filtro de 50 entradas verificado correctamente");
  } catch (error) {
    Logger.error(`error al aplicar filtro de 50 entries: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_entries_50_overtime") });
    throw error;
  }
});

test("@exploratory @positive verificar que el filtro 'show entries' funcione correctamente con 100", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtimePage = new OvertimePage(loggedInPage);

  try {
    Logger.info("cambiando 'show entries' a 100");
    await home.goToOvertime();
    await overtimePage.changeEntriesTo(100);
    const count = await overtimePage.getRowCount();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(100);
    Logger.info("filtro de 100 entradas verificado correctamente");
  } catch (error) {
    Logger.error(`error al aplicar filtro de 100 entries: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_entries_100_overtime") });
    throw error;
  }
});

test("@exploratory @positive verificar que los datos de la tabla se carguen correctamente", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtimePage = new OvertimePage(loggedInPage);

  try {
    Logger.info("verificando carga de datos en la tabla de horas extra");
    await home.goToOvertime();
    const data = await overtimePage.getTableData();
    expect(data.length).toBeGreaterThan(0);
    Logger.info("los datos de la tabla se cargaron correctamente");
  } catch (error) {
    Logger.error(`error al cargar datos de la tabla de horas extra: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_datos_tabla_overtime") });
    throw error;
  }
});

test("@exploratory @positive verificar que el botón de paginación 'Next' funcione correctamente", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtimePage = new OvertimePage(loggedInPage);

  try {
    Logger.info("verificando funcionalidad del botón 'Next'");
    await home.goToOvertime();

    const initialInfo = await loggedInPage.locator(overtimePage.infoText).innerText();
    await loggedInPage.locator(overtimePage.nextButton).click();

    await loggedInPage.waitForTimeout(1000);
    const newInfo = await loggedInPage.locator(overtimePage.infoText).innerText();

    expect(initialInfo).not.toEqual(newInfo);
    Logger.info("botón 'Next' funcionó correctamente en la tabla de horas extra");
  } catch (error) {
    Logger.error(`error al usar botón 'Next' en horas extra: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_next_overtime") });
    throw error;
  }
});

test("@exploratory @positive verificar que se muestre mensaje cuando no existen registros", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtimePage = new OvertimePage(loggedInPage);

  try {
    Logger.info("verificando mensaje de tabla vacía");
    await home.goToOvertime();

    await overtimePage.searchOvertime("textoInexistenteXYZ");
    const emptyText = await loggedInPage.locator(overtimePage.emptyRow).innerText();

    expect(emptyText.toLowerCase()).toContain("no matching records");
    Logger.info("mensaje de tabla vacía mostrado correctamente");
  } catch (error) {
    Logger.error(`error al verificar tabla vacía: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_tabla_vacia_overtime") });
    throw error;
  }
});

test("@exploratory @positive verificar que el boton 'Export this list' funcione correctamente", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtimePage = new OvertimePage(loggedInPage);
  
  try {
    Logger.info("exportando lista");
    await home.goToOvertime();
    const [download] = await Promise.all([
      loggedInPage.waitForEvent("download"),
      overtimePage.exportOvertimes(),
    ]);
    expect(download.suggestedFilename()).toMatch(/overtime/i);
    Logger.info("descarga iniciada correctamente");
  } catch (error) {
    Logger.error(`error al verificar exportaciones: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_exportar_overtime") });
    throw error;
  }
});

test("@exploratory @positive verificar que el botón 'all requests' muestre todas las horas extra", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtimePage = new OvertimePage(loggedInPage);

  try {
    Logger.info("mostrando todas las solicitudes");
    await home.goToOvertime();
    await overtimePage.showAllOvertimes();
    await expect(loggedInPage).toHaveURL(/\/overtime\/all/);
    Logger.info("todas las solicitudes mostradas correctamente");
  } catch (error) {
    Logger.error(`error al mostrar todas las solicitudes: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_todas_solicitudes_overtime") });
    throw error;
  }
});

test("@exploratory @positive verificar que el botón 'Pending requests' filtre solicitudes pendientes con estado 'Requested'", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtimePage = new OvertimePage(loggedInPage);

  try {
    Logger.info("filtrando solicitudes pendientes");
    await home.goToOvertime();
    await overtimePage.showPendingOvertimes();
    await expect(loggedInPage).toHaveURL(/\/overtime\/requested/);
    Logger.info("solicitudes pendientes filtradas correctamente");
  } catch (error) {
    Logger.error(`error al filtrar solicitudes pendientes: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_pending_requests") });
    throw error;
  }
});

test("@exploratory @positive verificar que el total de solicitudes de horas extra coincida con el número mostrado en la tabla", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtimePage = new OvertimePage(loggedInPage);

  try {
    Logger.info("verificando total de solicitudes");
    await home.goToOvertime();
    await overtimePage.changeEntriesTo("50");
    const { totalCount, displayedTotal } = await overtimePage.countAllOvertimes();
    expect(totalCount).toBe(displayedTotal);
    Logger.info("total de solicitudes verificado correctamente");
  } catch (error) {
    Logger.error(`error al verificar total de solicitudes: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_total_solicitudes") });
    throw error;
  }
});

test("@exploratory @positive verificar que se muestre la información completa de cada solicitud de horas extra visible en la tabla", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtimePage = new OvertimePage(loggedInPage);

  try {
    Logger.info("verificando información completa de solicitudes visibles");
    await home.goToOvertime();
    await loggedInPage.waitForSelector(overtimePage.overtimeTable);
    const requests = await overtimePage.getAllVisibleOvertimes();
    expect(requests.length).toBeGreaterThan(0);
    Logger.info("información de solicitudes verificada correctamente");
  } catch (error) {
    Logger.error(`error al verificar información completa de solicitudes: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_info_solicitudes") });
    throw error;
  }
});

test("@exploratory @positive verificar que se navegue correctamente al abrir la primera solicitud de horas extra", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtimePage = new OvertimePage(loggedInPage);

  try {
    Logger.info("abriendo detalles de la primera solicitud");
    await home.goToOvertime();
    await overtimePage.openFirstOvertimeDetails();

    await expect(loggedInPage).toHaveURL(new RegExp(`/extra/overtime/\\d+`));
    Logger.info("navegación a detalles de la solicitud correcta");
  } catch (error) {
    Logger.error(`error al abrir detalles de la solicitud: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_abrir_detalles_solicitud") });
    throw error;
  }
});

test("@exploratory @positive verificar que se muestre todas las solicitudes de horas extra de todas las paginas", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtimePage = new OvertimePage(loggedInPage);

  try {
    Logger.info("mostrando todas las solicitudes (todas las páginas)");
    await home.goToOvertime();
    await overtimePage.logAllOvertimesDetails();
    Logger.info("listado de todas las solicitudes loggeado correctamente");
  } catch (error) {
    Logger.error(`error al mostrar todas las solicitudes: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_mostrar_todas_solicitudes") });
    throw error;
  }
});

test("@exploratory @positive verificar que el buscador permite buscar correctamente una solicitud existente", async ({ loggedInPage, solicitudHorasExtraEstadoRequested}) => {
  const home = new HomePage(loggedInPage);
  const overtimePage = new OvertimePage(loggedInPage);

  try {
    Logger.info("buscando duracion de horas extras '0.5' que equivale 4 horas en solicitudes");
    await home.goToOvertime();
    await overtimePage.searchOvertime("0.5");
    const rows = await overtimePage.getTableData();
    expect(rows.some(r => r.toString().includes("0.5"))).toBeTruthy();
    Logger.info("búsqueda '0.5' exitosa");
    await overtimePage.acceptFirstOvertime();
  } catch (error) {
    Logger.error(`error en búsqueda '0.5': ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_busqueda_0.5") });
    throw error;
  }
});

test("@exploratory @negative verificar que al buscar solicitud inexistente se muestre un mensaje en fila", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const overtimePage = new OvertimePage(loggedInPage);

  try {
    Logger.info("buscando usuario inexistente en solicitudes");
    await home.goToOvertime();
    await overtimePage.searchOvertime("SolicitudInexistente123");
    const count = await overtimePage.getRowCount();
    expect(count).toBe(1);

    const infoText = await overtimePage.getInfoTextSearchOvertime();
    expect(infoText).toContain("No matching records found");
    Logger.info("mensaje de 'no matching records' verificado");
  } catch (error) {
    Logger.error(`error en búsqueda inexistente: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_busqueda_inexistente_requests") });
    throw error;
  }
});
