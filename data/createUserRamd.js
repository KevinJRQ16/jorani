export const createUserRamd = {
  invalidEmailUser: {
    firstname: `Skynet${Date.now()}`,
    lastname: `Ramos${Date.now()}`,
    login: `sky${Math.floor(Math.random() * 10000)}`,
    email: "correo",
    password: "holamundo"
  },
  validUser: {
    firstname: `Skynet${Date.now()}`,
    lastname: `Ramos${Date.now()}`,
    login: `sky${Math.floor(Math.random() * 10000)}`,
    email: "correo@gmail.com",
    password: "holamundo"
  },
  validUserWithFiledsOptional: {
    firstname: `Skynet${Date.now()}`,
    lastname: `Ramos${Date.now()}`,
    login: `sky${Math.floor(Math.random() * 10000)}`,
    email: "correo@gmail.com",
    password: "holamundo",
    selfManager: false,
    identifier: "sky001",
    language: "es",
    timezone: "Europe/Paris"
  },
  invalidUserEmptySpacesFields: {
    firstname: ` `,
    lastname: ` `,
    login: ` `,
    email: "correo@gmail.com",
    password: "holamundo"
  }
};
