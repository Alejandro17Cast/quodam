export const CONFIG = {
  readingsIndexPath:
    "./data/readings-index.json",

  imagesPath:
    "./assets/images/readings",

  /*
   * Un poco más corto para que el usuario
   * llegue antes a la ruleta.
   */
  ritualDuration:
    1150,

  selection: {
    /*
     * 8 vueltas se sienten dinámicas.
     * 14 empieza a percibirse pesado.
     */
    totalRounds:
      8,

    /*
     * main.js v3 calcula la duración real,
     * pero conservamos estos valores para
     * compatibilidad con otros módulos.
     */
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
