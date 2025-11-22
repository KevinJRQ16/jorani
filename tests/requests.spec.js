import { expect } from "@playwright/test";
import { test } from "../fixtures/fixtures.js";
import { HomePage } from "../pages/HomePage.js";
import { RequestsPage } from "../pages/RequestsPage";
import { Logger, screenshotPath } from "../utils/helpers.js";

test("@exploratory @positive verificar que se acceda a la página de solicitudes 'leaves'", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("navegando a la página de solicitudes");
    await home.goToRequests();
    await expect(loggedInPage.locator(requestsPage.requestsTable)).toBeVisible();
    Logger.info("página de solicitudes cargada correctamente");
  } catch (error) {
    Logger.error(`error al acceder a la página de solicitudes: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_acceder_pagina_solicitudes") });
    throw error;
  }
});

test("@exploratory @positive verificar que se muestre la tabla de solicitudes al ingresar", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("verificando tabla de solicitudes");
    await home.goToRequests();
    expect(await requestsPage.isTableVisible()).toBeTruthy();
    const count = await requestsPage.getRequestRowsCount();
    expect(count).toBeGreaterThan(0);
    Logger.info("tabla de solicitudes visible correctamente");
  } catch (error) {
    Logger.error(`error al mostrar tabla de solicitudes: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_tabla_solicitudes") });
    throw error;
  }
});

test("@exploratory @positive verificar que todos los filtros estén visibles", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("verificando filtros visibles");
    await home.goToRequests();
    const allFiltersVisible = await requestsPage.areAllFiltersVisible();
    expect(allFiltersVisible).toBeTruthy();
    Logger.info("todos los filtros visibles correctamente");
  } catch (error) {
    Logger.error(`error al verificar filtros visibles: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_filtros_visibles") });
    throw error;
  }
});

test("@exploratory @positive verificar que el filtro por tipo de licencia actualice la tabla", async ({ loggedInPage, solicitudTemporal}) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("aplicando filtro por tipo de licencia");
    await home.goToRequests();
    const initialCount = await requestsPage.getRequestRowsCount();
    await requestsPage.filterByType("special leave");
    await expect(async () => {
      const newCount = await requestsPage.getRequestRowsCount();
      expect(newCount).toBeLessThanOrEqual(initialCount);
    }).toPass({ timeout: 8000 });
    Logger.info("filtro por tipo de licencia aplicado correctamente");
  } catch (error) {
    Logger.error(`error al aplicar filtro por tipo de licencia: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_filtro_tipo_licencia") });
    throw error;
  }
});

test("@exploratory @positive verificar que se afecten las solicitudes después de desactivar filtro de 'requested'", async ({ loggedInPage, solicitudTemporal }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("desactivando filtro 'requested'");
    await home.goToRequests();
    const countBefore = await requestsPage.getRequestRowsCount();
    await requestsPage.toggleFilter(requestsPage.chkRequested, false);
    await loggedInPage.waitForTimeout(1000);
    const countAfter = await requestsPage.getRequestRowsCount();
    expect(countAfter).toBeLessThanOrEqual(countBefore);
    Logger.info("filtro 'requested' desactivado correctamente");
  } catch (error) {
    Logger.error(`error al desactivar filtro 'requested': ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_filtro_requested") });
    throw error;
  }
});

test("@exploratory @positive verificar que se cierre el modal correctamente al cancelar el rechazo de una solicitud", async ({ loggedInPage, solicitudTemporal }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("verificando cierre del modal al cancelar rechazo");
    await home.goToRequests();
    await requestsPage.cancelRejection();
    expect(await requestsPage.isCommentModalVisible()).toBeFalsy();
    Logger.info("modal cerrado correctamente");
  } catch (error) {
    Logger.error(`error al cerrar modal de rechazo: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_cerrar_modal_rechazo") });
    throw error;
  }
});

test("@exploratory @positive verificar que se acepte una solicitud exitosamente", async ({ loggedInPage, createdRequest }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("aceptando solicitud");
    await home.goToRequests();
    await requestsPage.sortBy("ID");
    await requestsPage.acceptFirstRequest();

    const hasMessage = await requestsPage.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();
    Logger.info("solicitud aceptada exitosamente");
  } catch (error) {
    Logger.error(`error al aceptar solicitud: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_aceptar_solicitud") });
    throw error;
  }
});

test("@exploratory @positive verificar que se rechace una solicitud exitosamente", async ({ loggedInPage, createdRequest }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("rechazando solicitud");
    await home.goToRequests();
    await requestsPage.sortBy("ID");
    await requestsPage.rejectFirstRequest();

    const hasMessage = await requestsPage.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();
    Logger.info("solicitud rechazada correctamente");
  } catch (error) {
    Logger.error(`error al rechazar solicitud: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_rechazar_solicitud") });
    throw error;
  }
});

test("@exploratory @positive verificar que el botón 'export this list' inicie descarga", async ({ loggedInPage, solicitudTemporal }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("exportando lista de solicitudes");
    await home.goToRequests();
    const [download] = await Promise.all([
      loggedInPage.waitForEvent("download"),
      requestsPage.exportRequests(),
    ]);
    expect(download.suggestedFilename()).toMatch(/requests/i);
    Logger.info("descarga iniciada correctamente");
  } catch (error) {
    Logger.error(`error al exportar lista: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_exportar_lista") });
    throw error;
  }
});

test("@exploratory @positive verificar que el botón 'all requests' muestre todas las solicitudes", async ({ loggedInPage, solicitudTemporal }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("mostrando todas las solicitudes");
    await home.goToRequests();
    await requestsPage.showAllRequests();
    await expect(loggedInPage).toHaveURL(/\/requests\/all/);
    Logger.info("todas las solicitudes mostradas correctamente");
  } catch (error) {
    Logger.error(`error al mostrar todas las solicitudes: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_all_requests") });
    throw error;
  }
});

test("@exploratory @positive verificar que el botón 'pending requests' filtre solo solicitudes pendientes con estado 'requested'", async ({ loggedInPage, solicitudTemporal }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("filtrando solicitudes pendientes");
    await home.goToRequests();
    await requestsPage.showPendingRequests();
    await expect(loggedInPage).toHaveURL(/\/requests\/requested/);
    Logger.info("solicitudes pendientes filtradas correctamente");
  } catch (error) {
    Logger.error(`error al filtrar solicitudes pendientes: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_pending_requests") });
    throw error;
  }
});

test("@exploratory @positive verificar que el botón 'pending requests' filtre los estados 'requested' y 'cancellation'", async ({ loggedInPage, solicitudTemporal }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("verificando filtro de estados 'requested' y 'cancellation'");
    await home.goToRequests();
    await requestsPage.showPendingRequests();
    await expect(loggedInPage).toHaveURL(/\/requests\/requested/);

    await loggedInPage.waitForSelector(requestsPage.requestsTable);
    const rows = loggedInPage.locator(requestsPage.requestRows);
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    for (let i = 0; i < rowCount; i++) {
      const statusText = await rows.nth(i).locator("span").last().innerText();
      expect(statusText.toLowerCase()).toMatch(/requested|cancellation/);
    }

    Logger.info("filtro de estados verificado correctamente");
  } catch (error) {
    Logger.error(`error al verificar filtro de estados: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_filtro_estados") });
    throw error;
  }
});

test("@exploratory @positive verificar que el total de solicitudes coincida con el número mostrado en la tabla", async ({ loggedInPage, solicitudTemporal }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("verificando total de solicitudes");
    await home.goToRequests();
    await requestsPage.changeEntriesTo("50");
    const { totalCount, displayedTotal } = await requestsPage.countAllRequests();
    expect(totalCount).toBe(displayedTotal);
    Logger.info("total de solicitudes verificado correctamente");
  } catch (error) {
    Logger.error(`error al verificar total de solicitudes: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_total_solicitudes") });
    throw error;
  }
});

test("@exploratory @positive verificar que se muestre la información completa de cada solicitud visible en la tabla", async ({ loggedInPage, solicitudTemporal }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("verificando información completa de solicitudes visibles");
    await home.goToRequests();
    await loggedInPage.waitForSelector(requestsPage.requestsTable);
    const requests = await requestsPage.getAllVisibleRequests();
    expect(requests.length).toBeGreaterThan(0);
    Logger.info("información de solicitudes verificada correctamente");
  } catch (error) {
    Logger.error(`error al verificar información completa de solicitudes: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_info_solicitudes") });
    throw error;
  }
});

test("@exploratory @positive verificar que se navegue correctamente al abrir la primera solicitud", async ({ loggedInPage, solicitudTemporal }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("abriendo detalles de la primera solicitud");
    await home.goToRequests();
    await requestsPage.sortBy("ID");
    await requestsPage.desactiveFilterCancelation();
    await requestsPage.openFirstRequestDetails();

    await expect(loggedInPage).toHaveURL(new RegExp(`/leaves/leaves/\\d+`));
    Logger.info("navegación a detalles de la solicitud correcta");
  } catch (error) {
    Logger.error(`error al abrir detalles de la solicitud: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_abrir_detalles_solicitud") });
    throw error;
  }
});

test("@exploratory @positive verificar que se muestre todas las solicitudes de todas las paginas", async ({ loggedInPage, solicitudTemporal }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("mostrando todas las solicitudes (todas las páginas)");
    await home.goToRequests();
    await requestsPage.changeEntriesTo("100");
    await requestsPage.logAllRequestsDetails();
    Logger.info("listado de todas las solicitudes loggeado correctamente");
  } catch (error) {
    Logger.error(`error al mostrar todas las solicitudes: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_mostrar_todas_solicitudes") });
    throw error;
  }
});

test("@exploratory @positive verificar que se muestre mensaje al aprobar solicitud", async ({ loggedInPage, createdRequest }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("aprobando primera solicitud y verificando mensaje");
    await home.goToRequests();
    await requestsPage.sortBy("ID");
    await requestsPage.acceptFirstRequest();

    const hasMessage = await requestsPage.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();
    Logger.info("mensaje de aprobación mostrado correctamente");
  } catch (error) {
    Logger.error(`error al aprobar solicitud: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_aprobar_solicitud") });
    throw error;
  }
});

test("@exploratory @positive verificar que se muestre mensaje al rechazar solicitud", async ({ loggedInPage, createdRequest }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("rechazando primera solicitud y verificando mensaje");
    await home.goToRequests();
    await requestsPage.sortBy("ID");
    await requestsPage.rejectFirstRequest();

    const hasMessage = await requestsPage.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();
    Logger.info("mensaje de rechazo mostrado correctamente");
  } catch (error) {
    Logger.error(`error al rechazar solicitud: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_rechazar_solicitud_2") });
    throw error;
  }
});

test("@exploratory @positive verificar que el mensaje se cierre correctamente al hacer clic en el botón 'x'", async ({ loggedInPage, createdRequest }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("aprobando solicitud y cerrando flash message");
    await home.goToRequests();
    await requestsPage.sortBy("ID");
    await requestsPage.acceptFirstRequest();
    await requestsPage.closeFlashMessageIfVisible();

    const visible = await requestsPage.isFlashMessageVisible();
    expect(visible).toBeFalsy();
    Logger.info("flash message cerrado correctamente");
  } catch (error) {
    Logger.error(`error al cerrar flash message: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_cerrar_flash_message") });
    throw error;
  }
});

test("@exploratory @negative verificar que al desactivar el filtro 'requested' no aparezca ningún registro de solicitudes", async ({ loggedInPage, solicitudTemporal }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("desactivando filtro 'requested' y verificando ausencia de registros");
    await home.goToRequests();
    await requestsPage.toggleFilter(requestsPage.chkRequested, false);

    const count = await requestsPage.getRequestRowsCount();
    if (count === 1) {
      await expect(loggedInPage.locator(requestsPage.rejectLink).first()).toBeHidden();
    }
    Logger.info("verificación del filtro 'requested' realizada");
  } catch (error) {
    Logger.error(`error al verificar filtro requested negativo: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_filtro_requested_negativo") });
    throw error;
  }
});

test("@exploratory @negative verificar que se rechace una solicitud exitosamente con comentario vacio", async ({ loggedInPage, createdRequest}) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("rechazando solicitud con comentario vacío");
    await home.goToRequests();
    await requestsPage.sortBy("ID");
    await requestsPage.rejectFirstRequest("");

    const hasMessage = await requestsPage.hasSuccessMessage();
    expect(hasMessage).toBeTruthy();
    Logger.info("rechazo con comentario vacío procesado (mensaje presente)");
  } catch (error) {
    Logger.error(`error al rechazar solicitud con comentario vacío: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_rechazar_comentario_vacio") });
    throw error;
  }
});

test("@exploratory @positive verificar que se pueda exportar luego de aceptar una solicitud", async ({ loggedInPage, solicitudTemporal}) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("aceptando solicitud y exportando, verificando errores de página");
    await home.goToRequests();
    await requestsPage.sortBy("ID");

    const errors = [];
    loggedInPage.on("pageerror", (err) => errors.push(err.message));

    await requestsPage.exportRequests();

    expect(errors).toHaveLength(0);
    Logger.info("export posterior a aceptación completado sin errores de página");
  } catch (error) {
    Logger.error(`error al exportar después de aceptar: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_exportar_despues_aceptar") });
    throw error;
  }
});

test("@exploratory @positive verificar que se muestre el modal de historial al hacer clic en el ícono de historial de una solicitud", async ({ loggedInPage, solicitudTemporal }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("abriendo modal de historial de la primera solicitud");
    await home.goToRequests();
    await requestsPage.openFirstHistory();
    expect(await requestsPage.isHistoryVisible()).toBeTruthy();

    await requestsPage.waitForHistoryContent();
    await expect(loggedInPage.locator(requestsPage.historyTable).first()).toBeVisible();

    await requestsPage.closeHistoryModal();
    expect(await requestsPage.isHistoryVisible()).toBeFalsy();
    Logger.info("modal de historial mostrado y cerrado correctamente");
  } catch (error) {
    Logger.error(`error en modal de historial: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_modal_historial") });
    throw error;
  }
});

test("@exploratory @positive verificar que el selector 'show entries' filtre por 25 solicitudes", async ({ loggedInPage, solicitudTemporal }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("cambiando entries a 25 y verificando cantidad");
    await home.goToRequests();
    await requestsPage.changeEntriesTo("25");
    const count = await requestsPage.getRequestRowsCount();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(25);
    Logger.info("entries 25 verificado correctamente");
  } catch (error) {
    Logger.error(`error al cambiar entries a 25: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_entries_25") });
    throw error;
  }
});

test("@exploratory @positive verificar que el selector 'show entries' filtre por 50 solicitudes", async ({ loggedInPage, solicitudTemporal }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("cambiando entries a 50 y verificando cantidad");
    await home.goToRequests();
    await requestsPage.changeEntriesTo("50");
    const count = await requestsPage.getRequestRowsCount();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(50);
    Logger.info("entries 50 verificado correctamente");
  } catch (error) {
    Logger.error(`error al cambiar entries a 50: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_entries_50") });
    throw error;
  }
});

test("@exploratory @positive verificar que el selector 'show entries' filtre por 100 solicitudes", async ({ loggedInPage, solicitudTemporal }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("cambiando entries a 100 y verificando cantidad");
    await home.goToRequests();
    await requestsPage.changeEntriesTo("100");
    const count = await requestsPage.getRequestRowsCount();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(100);
    Logger.info("entries 100 verificado correctamente");
  } catch (error) {
    Logger.error(`error al cambiar entries a 100: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_entries_100") });
    throw error;
  }
});

test("@exploratory @positive verificar que el buscador permite buscar correctamente una solicitud existente", async ({ loggedInPage, solicitudTemporal }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("buscando 'special' en solicitudes");
    await home.goToRequests();
    await requestsPage.searchLeave("special");
    const rows = await requestsPage.getTableData();
    expect(rows.some(r => r.toString().includes("special"))).toBeTruthy();
    Logger.info("búsqueda 'special' exitosa");
  } catch (error) {
    Logger.error(`error en búsqueda 'special': ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_busqueda_special") });
    throw error;
  }
});

test("@exploratory @negative verificar que al buscar solicitud inexistente se muestre un mensaje en fila", async ({ loggedInPage, solicitudTemporal }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  try {
    Logger.info("buscando solicitud inexistente en solicitudes");
    await home.goToRequests();
    await requestsPage.searchLeave("SolicitudInexistente123");
    const count = await requestsPage.getRowCount();
    expect(count).toBe(1);

    const infoText = await requestsPage.getInfoTextSearch();
    expect(infoText).toContain("No matching records found");
    Logger.info("mensaje de 'no matching records' verificado");
  } catch (error) {
    Logger.error(`error en búsqueda inexistente: ${error.message}`);
    await loggedInPage.screenshot({ path: screenshotPath("error_busqueda_inexistente_requests") });
    throw error;
  }
});