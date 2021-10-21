const fs = require('fs');
const CsvReadableStream = require('csv-reader');
const { set, merge, get } = require('lodash');

const defaultJson = require('./default.json');

if (!process.argv[2] || !process.argv[3]) {
  return console.log(
    'Please, provide arguments path and output like `yarn translate file.csv en_EN`'
  );
}

let skipped = 0;
const translations = {};
const TYPES = {
  NON_ESISTE: 'Non Esiste',
  NON_ESISTE_TUTTO_L_OGGETTO: "Non Esiste tutto l'oggetto",
  OGGETTO_COMPLETO: '--- OGGETTO COMPLETO ---',
};

let inputStream = fs.createReadStream(process.argv[2], 'utf8');

inputStream
  .pipe(
    new CsvReadableStream({
      parseNumbers: true,
      trim: true,
      delimiter: ';',
      skipHeader: true,
    })
  )
  .on('data', function ([v4Label, v5Label, v5Translation, v4Translation]) {
    if (
      !v5Label ||
      v5Label === TYPES.NON_ESISTE ||
      v5Label === TYPES.NON_ESISTE_TUTTO_L_OGGETTO
    ) {
      skipped++;
    } else {
      if (v5Translation === TYPES.OGGETTO_COMPLETO) {
        set(translations, v5Label, get(defaultJson, v5Label));
      } else {
        set(translations, v5Label, v5Translation);
      }
    }
  })
  .on('end', function () {
    fs.writeFileSync(
      `./out/${process.argv[3]}.json`,
      JSON.stringify(merge(defaultJson, translations), null, 4),
      'utf-8'
    );

    console.log(`${skipped} skippati`);
  });
