/* Ký hiệu sơ đồ cho tab Linh kiện: window.PartSym(key) trả về chuỗi <svg> (khung 120 × 60, nét theo màu chữ).
   Chỉ vẽ từ dữ liệu cố định trong file này. */
(function () {
  "use strict";
  function t(x, y, s, a) { return '<text x="' + x + '" y="' + y + '" text-anchor="' + (a || "middle") + '">' + s + "</text>"; }
  var LEADS = "M0 30H34M86 30H120";
  var RES = '<rect x="34" y="21" width="52" height="18" rx="1"/>';
  var DIODE = "M0 30H46M74 30H120M46 16V44L74 30ZM74 16V44";
  var COIL = '<rect x="40" y="16" width="40" height="28"/><path d="M40 44L80 16M0 30H40M80 30H120"/>';
  var S = {
    res: '<path d="' + LEADS + '"/>' + RES,
    cap: '<path d="M0 30H55M65 30H120M55 12V48M65 12V48"/>',
    ecap: '<path d="M0 30H55M55 12V48M68 12Q60 30 68 48M64 30H120"/>' + t(46, 18, "+"),
    ind: '<path d="M0 30H24a9 9 0 0 1 18 0a9 9 0 0 1 18 0a9 9 0 0 1 18 0a9 9 0 0 1 18 0H120"/>',
    xfmr: '<path d="M0 10H40a5 5 0 0 1 0 10a5 5 0 0 1 0 10a5 5 0 0 1 0 10a5 5 0 0 1 0 10H0M54 6V54M60 6V54M120 10H74a5 5 0 0 0 0 10a5 5 0 0 0 0 10a5 5 0 0 0 0 10a5 5 0 0 0 0 10H120"/>',
    fuse: '<path d="' + LEADS + 'M34 30H86"/><rect x="34" y="23" width="52" height="14" rx="1"/>',
    varistor: '<path d="' + LEADS + 'M28 50H40L80 10"/>' + RES,
    therm: '<path d="' + LEADS + 'M28 50H40L80 10"/>' + RES + t(100, 16, "t°"),
    diode: '<path d="' + DIODE + '"/>',
    zener: '<path d="' + DIODE + 'M74 16L68 12M74 44L80 48"/>',
    led: '<path d="' + DIODE + 'M62 12L74 2M70 2H74V6M74 16L86 6M82 6H86V10"/>',
    bridge: '<path d="M60 6L94 30L60 54L26 30ZM52 38H68L60 24ZM52 24H68M0 30H26M94 30H120"/>' + t(13, 24, "~") + t(107, 24, "~") + t(72, 12, "+", "start") + t(72, 56, "−", "start"),
    npn: '<circle cx="66" cy="30" r="22"/><path d="M0 30H54M54 16V44M54 24L80 10H120M54 36L80 50H120M71 41L80 50L68 49"/>' + t(8, 24, "B", "start") + t(112, 8, "C") + t(112, 58, "E"),
    nmos: '<path d="M0 42H40M40 18V42M46 14V46M46 20H76V8H120M46 40H76V52H120M46 30H76V40M54 26L46 30L54 34"/>' + t(8, 36, "G", "start") + t(100, 20, "D") + t(100, 48, "S"),
    igbt: '<circle cx="68" cy="30" r="22"/><path d="M0 30H44M44 16V44M50 16V44M50 24L80 10H120M50 36L80 50H120M71 41L80 50L68 49"/>' + t(8, 24, "G", "start") + t(112, 8, "C") + t(112, 58, "E"),
    triac: '<path d="M0 30H40M80 30H120M40 8V52M80 8V52M40 12V28L80 20ZM80 32V48L40 40ZM80 46L100 58"/>' + t(106, 52, "G", "start"),
    opto: '<rect x="6" y="4" width="108" height="52" rx="6"/><path d="M24 22H44L34 36ZM24 36H44M34 4V22M34 36V56M50 24H62M58 20L62 24L58 28M50 34H62M58 30L62 34L58 38M74 18V42M74 24L94 12V4M74 36L94 48V56M86 47L94 48L90 41"/>',
    tl431: '<path d="M0 30H46M46 16V44L74 30ZM74 16V44M74 44L80 48M74 30H120M60 37V58"/>' + t(4, 24, "A", "start") + t(116, 24, "K", "end") + t(66, 57, "R", "start"),
    reg: '<rect x="30" y="10" width="60" height="34" rx="3"/><path d="M0 22H30M90 22H120M60 44V60"/>' + t(60, 32, "78xx") + t(2, 18, "IN", "start") + t(118, 18, "OUT", "end") + t(68, 58, "GND", "start"),
    ic: '<rect x="34" y="6" width="52" height="48" rx="3"/><path d="M20 16H34M20 30H34M20 44H34M86 16H100M86 30H100M86 44H100"/>' + t(60, 35, "IC"),
    relay: '<rect x="6" y="18" width="30" height="24"/><path d="M6 42L36 18M21 0V18M21 42V60M72 60V48M72 48L102 30M106 40H120M106 36V44"/><path d="M36 30H86" stroke-dasharray="4 4"/>' + t(64, 58, "COM", "end") + t(118, 30, "NO", "end"),
    motor: '<circle cx="60" cy="30" r="22"/><path d="M0 30H38M82 30H120"/>' + t(60, 36, "M") + t(60, 50, "~"),
    motor3: '<circle cx="60" cy="30" r="22"/><path d="M0 30H38M82 30H120M60 52V60"/>' + t(60, 36, "M") + t(60, 48, "3~"),
    comp: '<circle cx="60" cy="30" r="22"/><path d="M0 30H38M82 30H120M60 52V60"/>' + t(60, 36, "M") + t(8, 24, "C", "start") + t(112, 24, "R", "end") + t(70, 58, "S", "start"),
    bimetal: '<path d="M0 40H40M80 40H120M40 40L80 34M60 8V22"/><circle cx="40" cy="40" r="2.5"/><circle cx="80" cy="40" r="2.5"/>' + t(76, 18, "t°", "start"),
    heater: '<path d="' + LEADS + 'M44 14q4 -5 0 -10M60 14q4 -5 0 -10M76 14q4 -5 0 -10"/>' + RES,
    coil: COIL,
    "switch": '<path d="M0 40H40M80 40H120M40 40L76 22"/><circle cx="40" cy="40" r="2.5"/><circle cx="80" cy="40" r="2.5"/>',
    pswitch: '<path d="M0 44H40M80 44H120M40 44L76 28"/><circle cx="40" cy="44" r="2.5"/><circle cx="80" cy="44" r="2.5"/><rect x="48" y="2" width="24" height="16" rx="2"/><path d="M60 18V34" stroke-dasharray="3 3"/>' + t(60, 15, "P"),
    pump: '<circle cx="60" cy="30" r="22"/><path d="M0 30H38M82 30H120M48 42L60 12L72 42"/>'
  };
  window.PartSym = function (key, cls) {
    return '<svg class="' + (cls || "psym") + '" viewBox="0 0 120 60" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" font-size="12" font-family="inherit">' +
      (S[key] || S.ic).replace(/<text /g, '<text fill="currentColor" stroke="none" ') + "</svg>";
  };
})();
