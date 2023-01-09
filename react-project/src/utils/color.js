/** @format */

const redWeight = 0.299;
const greenWeight = 0.587;
const blueWeight = 0.114;
const textColorSwitchingThreshold = 150;

export function pickTextColorBasedOnBgColor(bgColor, lightColor, darkColor) {
  var colors = bgColor.substring(4, bgColor.length - 1);
  let rgb = colors.split(",");
  rgb = rgb.map((color) => parseInt(color));
  return rgb[0] * redWeight + rgb[1] * greenWeight + rgb[2] * blueWeight >
    textColorSwitchingThreshold
    ? darkColor
    : lightColor;
}
