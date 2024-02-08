/*
 * Returns a list of recommended checkout options for all possible scores
 * in a double-out match variant. If a score is impossible to checkout,
 * the corresponding entry is `undefined`.
 *
 * Source: https://www.dartcoach.de/dart-checkout
 */
export const DOUBLE_OUT_CHECKOUT_TABLE = {
  2: ["D1"],
  3: ["S1", "D1"],
  4: ["D2"],
  5: ["S1", "D2"],
  6: ["D3"],
  7: ["S3", "D2"],
  8: ["D4"],
  9: ["S1", "D4"],
  10: ["D5"],
  11: ["S3", "D4"],
  12: ["D6"],
  13: ["S5", "D4"],
  14: ["D7"],
  15: ["S7", "D4"],
  16: ["D8"],
  17: ["S1", "D8"],
  18: ["D9"],
  19: ["S3", "D8"],
  20: ["D10"],
  21: ["S5", "D8"],
  22: ["D11"],
  23: ["S7", "D8"],
  24: ["D12"],
  25: ["S9", "D8"],
  26: ["D13"],
  27: ["S11", "D8"],
  28: ["D14"],
  29: ["S13", "D8"],
  30: ["D15"],
  31: ["S15", "D8"],
  32: ["D16"],
  33: ["S1", "D16"],
  34: ["D17"],
  35: ["S3", "D16"],
  36: ["D18"],
  37: ["S5", "D16"],
  38: ["D19"],
  39: ["S7", "D16"],
  40: ["D20"],
  41: ["S9", "D16"],
  42: ["S10", "D16"],
  43: ["S11", "D16"],
  44: ["S12", "D16"],
  45: ["S13", "D16"],
  46: ["S14", "D16"],
  47: ["S15", "D16"],
  48: ["S16", "D16"],
  49: ["S17", "D16"],
  50: ["S18", "D16"],
  51: ["S19", "D16"],
  52: ["S20", "D16"],
  53: ["S13", "D20"],
  54: ["S14", "D20"],
  55: ["S15", "D20"],
  56: ["S16", "D20"],
  57: ["S17", "D20"],
  58: ["S18", "D20"],
  59: ["S19", "D20"],
  60: ["S20", "D20"],
  61: ["T15", "D8"],
  62: ["T10", "D16"],
  63: ["T13", "D12"],
  64: ["T16", "D8"],
  65: ["T11", "D16"],
  66: ["T10", "D18"],
  67: ["T17", "D8"],
  68: ["T20", "D4"],
  69: ["T15", "D12"],
  70: ["T18", "D8"],
  71: ["T13", "D16"],
  72: ["T16", "D12"],
  73: ["T17", "D11"],
  74: ["T14", "D16"],
  75: ["T17", "D12"],
  76: ["T20", "D8"],
  77: ["T19", "D10"],
  78: ["T18", "D12"],
  79: ["T19", "D11"],
  80: ["T20", "D10"],
  81: ["T19", "D12"],
  82: ["Bull", "D16"],
  83: ["T17", "D16"],
  84: ["T20", "D12"],
  85: ["T15", "D20"],
  86: ["T18", "D16"],
  87: ["T17", "D18"],
  88: ["T20", "D14"],
  89: ["T19", "D16"],
  90: ["T20", "D15"],
  91: ["T17", "D20"],
  92: ["T20", "D16"],
  93: ["T19", "D18"],
  94: ["T18", "D20"],
  95: ["T19", "D19"],
  96: ["T20", "D18"],
  97: ["T19", "D20"],
  98: ["T20", "D19"],
  99: ["T19", "S10", "D16"],
  100: ["T20", "D20"],
  101: ["T20", "S9", "D16"],
  102: ["T20", "S10", "D16"],
  103: ["T19", "S14", "D16"],
  104: ["T18", "S18", "D16"],
  105: ["T20", "S13", "D16"],
  106: ["T20", "S14", "D16"],
  107: ["T19", "S18", "D16"],
  108: ["T20", "S16", "D16"],
  109: ["T20", "S9", "D20"],
  110: ["T20", "S10", "D20"],
  111: ["T20", "S11", "D20"],
  112: ["T20", "S12", "D20"],
  113: ["T19", "S16", "D20"],
  114: ["T20", "S14", "D20"],
  115: ["T20", "S15", "D20"],
  116: ["T20", "S16", "D20"],
  117: ["T20", "S17", "D20"],
  118: ["T20", "S18", "D20"],
  119: ["T19", "T12", "D13"],
  120: ["T20", "S20", "D20"],
  121: ["T20", "T11", "D14"],
  122: ["T18", "T18", "D7"],
  123: ["T19", "T16", "D9"],
  124: ["T20", "T16", "D8"],
  125: ["Bull", "T17", "D12"],
  126: ["T19", "T19", "D6"],
  127: ["T20", "T17", "D8"],
  128: ["T18", "T14", "D16"],
  129: ["T19", "T16", "D12"],
  130: ["T20", "T20", "D5"],
  131: ["T20", "T13", "D16"],
  132: ["Bull", "T14", "D20"],
  133: ["T20", "T11", "D20"],
  134: ["T20", "T14", "D16"],
  135: ["Outer Bull", "T20", "Bull"],
  136: ["T20", "T20", "D8"],
  137: ["T20", "T15", "D16"],
  138: ["T20", "T18", "D12"],
  139: ["T19", "T14", "D20"],
  140: ["T20", "T20", "D10"],
  141: ["T20", "T19", "D12"],
  142: ["T18", "T20", "D12"],
  143: ["T20", "T17", "D16"],
  144: ["T20", "T20", "D12"],
  145: ["T19", "T20", "D14"],
  146: ["T19", "T19", "D16"],
  147: ["T20", "T17", "D18"],
  148: ["T20", "T16", "D20"],
  149: ["T20", "T19", "D16"],
  150: ["T20", "T18", "D18"],
  151: ["T20", "T17", "D20"],
  152: ["T20", "T20", "D16"],
  153: ["T20", "T19", "D18"],
  154: ["T20", "T18", "D20"],
  155: ["T20", "T19", "D19"],
  156: ["T20", "T20", "D18"],
  157: ["T20", "T19", "D20"],
  158: ["T20", "T20", "D19"],
  160: ["T20", "T20", "D20"],
  161: ["T20", "T17", "Bull"],
  164: ["T20", "T18", "Bull"],
  167: ["T20", "T19", "Bull"],
  170: ["T20", "T20", "Bull"],
} as const;

export default DOUBLE_OUT_CHECKOUT_TABLE;
