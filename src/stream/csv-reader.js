import fs from 'node:fs'
import {parse} from 'csv'

const csvPath = new URL('./tasks.csv', import.meta.url);

const stream = fs.createReadStream(csvPath);

async function run() {

    const csvParse = parse({
        delimiter: ',',
        skipEmptyLines: true,
        fromLine: 2 // skip the header line
      });

    const parser = stream.pipe(csvParse);

    for await(const record of parser){

        const [title, description] = record

        await fetch('http://127.0.0.1:3000/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
              },
            body: JSON.stringify({title, description})
        })
    }

}

run();
