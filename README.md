# Jorani

# Playwright - Javascript
#### Para que se ejecute correctamente es necesario tener instalado:
#### - Node.js
#### - NPM
#### - Git
#### - Visual Studio Code
#### - Docker

### Tener docker instalado y mantenerlo corriendo


## Levantar Jorani en Docker

### Ubicarse en un directorio de trabajo

### Clonar repositorio de github - nombre de carpeta
git clone https://github.com/bbalet/jorani.git jorani

### Acceder a la carpeta
cd jorani

### Levantar docker
docker compose up -d


## Clonar framework de github

### Ubicarse en un directorio de trabajo

### Clonar repositorio de github - nombre de carpeta
git clone https://github.com/KevinJRQ16/jorani.git

### Acceder a la carpeta
cd jorani

### Ingresar a Visual Studio Code
code .

### Instalr dependencias declaradas en package.json
npm install

Se instalara las dependencias como ser: (dotenv, faker, sqlite, allure, pino y winston)


## Ejecucion

### Ejecucion secuencial completa de tests
npx playwright test --headed --workers=1

### Ejecucion por archivos especificos
npx playwright test tests/nombre_archivo.spec.js --headed --workers=1

### Ejecucion por marks
npx playwright test --grep "@positive" --headed --workers=1


## Reportes

#### mostrar reporte HTML
npx playwright show-report

#### mostrar reporte allure
allure serve allure-results 

























