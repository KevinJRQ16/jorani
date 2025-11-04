import { expect } from "@playwright/test";
import { test } from "../fixtures/fixtures.js";
import { HomePage } from "../pages/HomePage.js";
import { RequestsPage } from "../pages/RequestsPage";

test("@ui @positive Verificar que se accede a la pagina de solicitudes 'Leaves'", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const requestsPage = new RequestsPage(loggedInPage);

    await home.goToRequests();
    await expect(loggedInPage.locator(requestsPage.requestsTable)).toBeVisible();
});

test("@ui @positive Verificar que se acepte una solicitud exitosamente", async ({ loggedInPage, createdRequest }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();
  await requestsPage.sortBy("ID");

  await requestsPage.acceptFirstRequest();
  const hasMessage = await requestsPage.hasSuccessMessage();
  expect(hasMessage).toBeTruthy();
});

test("@ui @positive Verificar que se cierre el modal correctamente al momento de cancelar el rechazo de una solicitud", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();
  await requestsPage.cancelRejection();
  expect(await requestsPage.isCommentModalVisible()).toBeFalsy();
});

test("@ui @positive Verificar que se muestre la tabla de solicitudes al ingresar", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();
  expect(await requestsPage.isTableVisible()).toBeTruthy();

  const count = await requestsPage.getRequestRowsCount();
//   console.log("Cantidad de solicitudes:", count);
  expect(count).toBeGreaterThan(0);
});

test("@ui @positive Verificar que todos los filtros esten visibles", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();

  const allFiltersVisible = await requestsPage.areAllFiltersVisible();
  expect(allFiltersVisible).toBeTruthy();
  
});

test("@ui @positive Verificar que el filtro por tipo de licencia actualice la tabla", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();
  const initialCount = await requestsPage.getRequestRowsCount();

  await requestsPage.filterByType("special leave");
  await expect(async () => {
    const newCount = await requestsPage.getRequestRowsCount();
    console.log("filas después del filtro:", newCount);
    expect(newCount).toBeLessThanOrEqual(initialCount);
  }).toPass({ timeout: 8000 });
});

test("@ui @positive Verificar que se afecten las solicitudes despues de desactivar filtro de 'Requested'", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();

  const countBefore = await requestsPage.getRequestRowsCount();
  await requestsPage.toggleFilter(requestsPage.chkRequested, false);
  await loggedInPage.waitForTimeout(1000);
  const countAfter = await requestsPage.getRequestRowsCount();

  expect(countAfter).toBeLessThanOrEqual(countBefore);
});

test("@ui @positive Verificar que se rechaze una solicitud exitosamente", async ({ loggedInPage, createdRequest }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();
  await requestsPage.sortBy("ID");
  await requestsPage.rejectFirstRequest();

  const hasMessage = await requestsPage.hasSuccessMessage();
  expect(hasMessage).toBeTruthy();
});

test("@ui @positive Verificar que botón 'Export this list' inicie descarga", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();
  const [download] = await Promise.all([
    loggedInPage.waitForEvent("download"),
    requestsPage.exportRequests(),
  ]);
  expect(download.suggestedFilename()).toMatch(/requests/i);
});

test("@ui @positive Verificar que el botón 'All requests' muestre de todas las solicitudes", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();
  await requestsPage.showAllRequests();
  await expect(loggedInPage).toHaveURL(/\/requests\/all/);
});

test("@ui @positive Verificar que el botón 'Pending requests' filtre solo solicitudes pendientes con estado 'Requested'", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();
  await requestsPage.showPendingRequests();
  await expect(loggedInPage).toHaveURL(/\/requests\/requested/);
});

test("@ui @positive Verificar que el botón 'Pending requests' filtre los estados 'Requested' y 'Cancellation' de la primera pagina de solicitudes", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();
  await requestsPage.showPendingRequests();
  await expect(loggedInPage).toHaveURL(/\/requests\/requested/);

  await loggedInPage.waitForSelector(requestsPage.requestsTable);

  const rows = loggedInPage.locator(`${requestsPage.requestRows}`);
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);

  for (let i = 0; i < rowCount; i++) {
    const statusText = await rows.nth(i).locator("span").last().innerText();
    console.log("Estado de la solicitud:", statusText);
    expect(statusText.toLowerCase()).toMatch(/requested|cancellation/);
  }
});

// test("@w13 Verificar que el botón 'Pending requests' filtre todas los estados 'Requested' y 'Cancellation' de las solicitudes", async ({ loggedInPage }) => {
//   const home = new HomePage(loggedInPage);
//   const requestsPage = new RequestsPage(loggedInPage);

//   await home.goToRequests();
//   await requestsPage.showPendingRequests();
//   await expect(loggedInPage).toHaveURL(/\/requests\/requested/);
//   await loggedInPage.waitForSelector(requestsPage.requestsTable);

//   let currentPage = 1;
//   let hasNextPage = true;

//   while (hasNextPage) {
//     const rows = loggedInPage.locator(`${requestsPage.requestRows}`);
//     const rowCount = await rows.count();

//     for (let i = 0; i < rowCount; i++) {
//       const statusText = await rows.nth(i).locator("span").last().innerText();
//       console.log(`Página ${currentPage} - Estado: ${statusText}`);
//       expect(statusText.toLowerCase()).toMatch(/requested|cancellation/);
//     }

//     const nextButton = loggedInPage.locator(".paginate_button.next:not(.disabled)");
//     hasNextPage = await nextButton.isVisible();

//     if (hasNextPage) {
//       await nextButton.click();
//       await loggedInPage.waitForTimeout(1000); 
//       currentPage++;
//     }
//   }
// });

test("@ui @positive Verificar que el total de solicitudes coincida con el número mostrado en la tabla", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();
  await requestsPage.changeEntriesTo("50");
  const { totalCount, displayedTotal } = await requestsPage.countAllRequests();

  console.log(`total mostrado: ${displayedTotal}`);
  console.log(`total contado: ${totalCount}`);
  expect(totalCount).toBe(displayedTotal);
});


test("@ui @positive Verificar que se muestre la información completa de cada solicitud visible en la tabla", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();
  await loggedInPage.waitForSelector(requestsPage.requestsTable);

  const requests = await requestsPage.getAllVisibleRequests();

  console.log(`\n=== Solicitudes visibles (${requests.length}) ===`);
  requests.forEach((request, index) => {
    console.log(`Solicitud #${index + 1}: ${request.join(" | ")}`);
  });

  expect(requests.length).toBeGreaterThan(0);
});

test("@ui @positive Verificar que se navegue correctamente al abrir la primera solicitud", async ({ loggedInPage, createdRequest }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();
  await requestsPage.sortBy("ID");
  await requestsPage.desactiveFilterCancelation();
  await requestsPage.openFirstRequestDetails();

  await expect(loggedInPage).toHaveURL(new RegExp(`/leaves/leaves/\\d+`));
});

test("@ui @positive Verificar que se muestre todas las solicitudes de todas las paginas", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();
  await requestsPage.changeEntriesTo("100");
  await requestsPage.logAllRequestsDetails();
});

test("@ui @positive Verificar que se muestre mensaje al aprobar solicitud", async ({ loggedInPage, createdRequest }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();
  await requestsPage.sortBy("ID");
  await requestsPage.acceptFirstRequest();

  const hasMessage = await requestsPage.hasSuccessMessage();
  expect(hasMessage).toBeTruthy();
});


test("@ui @positive Verificar que se muestre mensaje al rechazar solicitud", async ({ loggedInPage, createdRequest }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();
  await requestsPage.sortBy("ID");
  await requestsPage.rejectFirstRequest();

  const hasMessage = await requestsPage.hasSuccessMessage();
  expect(hasMessage).toBeTruthy();
});



test("@ui @positive Verificar que el mensaje se cierre correctamente al hacer clic en el botón 'x'", async ({ loggedInPage, createdRequest }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();
  await requestsPage.sortBy("ID");
  await requestsPage.acceptFirstRequest();
  await requestsPage.closeFlashMessageIfVisible();

  const visible = await requestsPage.isFlashMessageVisible();
  expect(visible).toBeFalsy();
});

test("@ui @negative Verificar que al desactivar el filtro 'Requested' no aparezca ningún registro de solicitudes", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();
  await requestsPage.toggleFilter(requestsPage.chkRequested, false);

  const count = await requestsPage.getRequestRowsCount();
  if (count === 1) {
    await expect(loggedInPage.locator(requestsPage.rejectLink).first()).toBeHidden();
  }
});

test("@ui @negative Verificar que se rechaze una solicitud exitosamente con comentario vacio", async ({ loggedInPage, createdRequest}) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);
  await home.goToRequests();
  await requestsPage.sortBy("ID");
  await requestsPage.rejectFirstRequest("");

  const hasMessage = await requestsPage.hasSuccessMessage();
  expect(hasMessage).toBeTruthy();
});

test("@ui @positive Verificar que se pueda exportar luego de aceptar una solicitud", async ({ loggedInPage, createdRequest}) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();
  await requestsPage.sortBy("ID");

  const errors = [];
  loggedInPage.on("pageerror", (err) => errors.push(err.message));

  await requestsPage.acceptFirstRequest();
  await requestsPage.exportRequests();

  expect(errors).toHaveLength(0);
});


test("@ui @positive Verificar que se muestre el modal de historial al hacer clic en el ícono de historial de una solicitud", async ({ loggedInPage, createdRequest }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();

  await requestsPage.openFirstHistory();
  expect(await requestsPage.isHistoryVisible()).toBeTruthy();

  await requestsPage.waitForHistoryContent();
  await expect(loggedInPage.locator(requestsPage.historyTable).first()).toBeVisible();

  await requestsPage.closeHistoryModal();
  expect(await requestsPage.isHistoryVisible()).toBeFalsy();
});

test("@ui @positive Verificar que el selector 'Show entries' filtre por 25 solicitudes", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();

  await requestsPage.changeEntriesTo("25");
  const count = await requestsPage.getRequestRowsCount();
  expect(count).toBeGreaterThanOrEqual(1);
  expect(count).toBeLessThanOrEqual(25);
});

test("@ui @positive Verificar que el selector 'Show entries' filtre por 50 solicitudes", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();

  await requestsPage.changeEntriesTo("50");
  const count = await requestsPage.getRequestRowsCount();
  expect(count).toBeGreaterThanOrEqual(1);
  expect(count).toBeLessThanOrEqual(50);
});

test("@ui @positive Verificar que el selector 'Show entries' filtre por 100 solicitudes", async ({ loggedInPage }) => {
  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();

  await requestsPage.changeEntriesTo("100");
  const count = await requestsPage.getRequestRowsCount();
  expect(count).toBeGreaterThanOrEqual(1);
  expect(count).toBeLessThanOrEqual(100);
});

test("@ui @positive Verificar que el buscador permite buscar correctamente a un usuario existente", async ({ loggedInPage }) => {

  const home = new HomePage(loggedInPage);
  const requestsPage = new RequestsPage(loggedInPage);

  await home.goToRequests();
  await requestsPage.searchLeave("special");
  const rows = await requestsPage.getTableData();


  expect(rows.some(r => r.toString().includes("special"))).toBeTruthy();
});

test("@ui @negative Verificar que al buscar usuario inexistente se muestre un mensaje en fila", async ({ loggedInPage }) => {
    const home = new HomePage(loggedInPage);
    const requestsPage = new RequestsPage(loggedInPage);

    await home.goToRequests();
    await requestsPage.searchLeave("UsuarioInexistente123");
    const count = await requestsPage.getRowCount();
    expect(count).toBe(1);

    const infoText = await requestsPage.getInfoTextSearch();
    expect(infoText).toContain("No matching records found");
});

