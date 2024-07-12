import Color from 'color';

const sizeXs = 576;
const sizeSm = 768;
const sizeMd = 992;
const sizeLg = 1200;
const sizeXl = 1600;
const sizeXxl = 1600;

const primaryColor = '#004AE9';
const primaryColor2 = Color(primaryColor).darken(0.85).toString();
const primaryColor3 = Color(primaryColor).lighten(0.65).toString();
const txtColor = '#FFFFFF';
const borderColorBase = '#434343';
const componentBackground = '#141414';
const bodyBackground = '#050505';
const bodySecundary = '#303030';
const itemActiveBg = Color(primaryColor).darken(0.65).toString();
const success = '#389e0d';
const error = '#cf1322';

const variables = {
  primaryColor,
  primaryColor2,
  primaryColor3,
  txtColor,
  borderColorBase,
  componentBackground,
  bodyBackground,
  bodySecundary,
  itemActiveBg,
  success,
  error,
  sizeXs,
  sizeSm,
  sizeMd,
  sizeLg,
  sizeXl,
  sizeXxl,
};

export default variables;