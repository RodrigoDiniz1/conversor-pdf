const PptxGenJS = require('pptxgenjs');
const pres = new PptxGenJS();
const slide = pres.addSlide();
slide.addText('Test Slide', { x: 1, y: 1, fontSize: 24 });
pres.writeFile({ fileName: 'test_minimal.pptx' }).then(() => console.log('PPTX created'));
