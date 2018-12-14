//math
define(['num'], function (num) {
    return {
      getRadom: function () {
        return parseInt(Math.random() * num);
      }
    };
  });