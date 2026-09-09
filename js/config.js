export const CONFIG = {

  /*
   * =======================================================
   * CATÁLOGOS DE LECTURA — QUODAM v4
   * =======================================================
   */
  readingCatalogs: {

    es:
      "./data/readings-es.json",

    en:
      "./data/readings-en.json"

  },


  /*
   * =======================================================
   * LECTURAS DE APOYO
   * =======================================================
   */
  supportCatalogs: {

    es:
      "./data/support-es.json",

    en:
      "./data/support-en.json"

  },


  /*
   * =======================================================
   * MODOS DISPONIBLES
   * =======================================================
   */
  modes: {

    spanish:
      "es",

    english:
      "en",

    mixed:
      "mixed"

  },


  /*
   * =======================================================
   * IMÁGENES
   * =======================================================
   */
  imagesPath:
    "./assets/images/readings",


  /*
   * Un poco más corto para que el usuario
   * llegue antes a la ruleta.
   */
  ritualDuration:
    1150,


  selection: {

    totalRounds:
      8,

    initialDelay:
      310,

    minimumDelay:
      280,

    maximumDelay:
      560,

    slowdownStart:
      4

  },


  avoidImmediateRepeat:
    true

};